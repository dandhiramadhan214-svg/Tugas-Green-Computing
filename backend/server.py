"""
Server API & Web Lokal SirkulAset (FastAPI + MobileNetV3-Large).
Menyajikan antarmuka prototipe (/prototype/index.html) sekaligus endpoint
deteksi gambar nyata (/api/predict) lengkap dengan Grad-CAM & Responsible AI Guardrails.
"""

from __future__ import annotations

import io
import json
import sys
import time
from pathlib import Path
from typing import Any

import torch
import torch.nn.functional as F
import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image, ImageOps, UnidentifiedImageError

CURRENT_DIR = Path(__file__).resolve().parent
ROOT_DIR = CURRENT_DIR.parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from model_utils import (
    CONFIDENCE_THRESHOLD,
    HAZARD_THRESHOLD,
    SIRKULASET_CLASS_META,
    analyze_image_quality,
    build_mobilenet_v3_classifier,
    disable_inplace_activations,
    generate_gradcam_overlay,
    get_eval_transform,
)

MODEL_PATH = CURRENT_DIR / "models" / "sirkulaset_mobilenetv3.pt"
META_PATH = CURRENT_DIR / "models" / "model_meta.json"

app = FastAPI(
    title="SirkulAset CV API",
    description="Pra-skrining visual e-waste ringan berbasis MobileNetV3-Large + Responsible AI Guardrails",
    version="1.0.0",
)

# Izinkan permintaan dari file:// maupun port lokal lain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ModelRegistry:
    """Menyimpan state model yang sudah dimuat agar inferensi cepat."""

    def __init__(self) -> None:
        self.loaded = False
        self.model: torch.nn.Module | None = None
        self.classes: list[str] = []
        self.temperature: float = 1.0
        self.meta: dict[str, Any] = {}
        self.transform = get_eval_transform()

    def load(self) -> None:
        if not MODEL_PATH.exists():
            self.loaded = False
            return

        ckpt = torch.load(MODEL_PATH, map_location="cpu", weights_only=False)
        classes = list(ckpt["classes"])
        model = build_mobilenet_v3_classifier(num_classes=len(classes), pretrained=False)
        model.load_state_dict(ckpt["state_dict"])
        disable_inplace_activations(model)
        model.eval()

        self.model = model
        self.classes = classes
        self.temperature = float(ckpt.get("temperature", 1.0))
        if META_PATH.exists():
            self.meta = json.loads(META_PATH.read_text(encoding="utf-8"))
        self.loaded = True


registry = ModelRegistry()


@app.on_event("startup")
def on_startup() -> None:
    registry.load()


@app.get("/")
def root_redirect() -> RedirectResponse:
    return RedirectResponse(url="/prototype/index.html")


@app.get("/api/health")
def health() -> dict[str, Any]:
    if not registry.loaded:
        registry.load()
    return {
        "status": "ready" if registry.loaded else "model_missing",
        "modelLoaded": registry.loaded,
        "architecture": registry.meta.get("architecture", "MobileNetV3-Large"),
        "classes": registry.classes,
        "temperature": registry.temperature,
        "valAccuracy": registry.meta.get("valAccuracy"),
        "testAccuracy": registry.meta.get("testAccuracy"),
        "testMacroF1": registry.meta.get("testMacroF1"),
        "greenAiMetrics": registry.meta.get("greenAiMetrics", {}),
    }


@app.post("/api/predict")
async def predict_image(file: UploadFile = File(...)) -> dict[str, Any]:
    if not registry.loaded:
        registry.load()
    if not registry.loaded or registry.model is None:
        raise HTTPException(
            status_code=503,
            detail="Model CV belum tersedia. Jalankan backend/train_cv.py terlebih dahulu.",
        )

    raw_bytes = await file.read()
    if not raw_bytes:
        raise HTTPException(status_code=400, detail="Berkas gambar kosong.")

    try:
        pil_img = Image.open(io.BytesIO(raw_bytes))
        pil_img = ImageOps.exif_transpose(pil_img).convert("RGB")
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(status_code=400, detail=f"Format gambar tidak dikenali: {exc}") from exc

    t0 = time.perf_counter()
    quality = analyze_image_quality(pil_img)

    input_tensor = registry.transform(pil_img).unsqueeze(0)
    with torch.no_grad():
        logits = registry.model(input_tensor)
        scaled_logits = logits / max(0.5, registry.temperature)
        probs = F.softmax(scaled_logits, dim=1)[0]

    top_k = min(3, len(registry.classes))
    top_probs, top_idxs = torch.topk(probs, k=top_k)

    top_predictions = []
    for prob_val, idx_val in zip(top_probs.tolist(), top_idxs.tolist()):
        cls_name = registry.classes[idx_val]
        cls_meta = SIRKULASET_CLASS_META.get(cls_name, {})
        top_predictions.append({
            "className": cls_name,
            "categoryId": cls_meta.get("category_id", cls_name),
            "probability": round(prob_val, 4),
            "confidencePct": round(prob_val * 100, 1),
        })

    best_idx = int(top_idxs[0].item())
    best_class = registry.classes[best_idx]
    best_conf = float(top_probs[0].item())
    second_conf = float(top_probs[1].item()) if len(top_probs) > 1 else 0.0
    margin = best_conf - second_conf

    cls_meta = SIRKULASET_CLASS_META.get(best_class, {
        "category_id": best_class,
        "pathway": "recycle",
        "is_battery": False,
        "base_hazard_score": 0.10,
        "weight_est_kg": 3,
        "summary_id": "Perangkat teridentifikasi untuk pra-skrining awal operator.",
    })

    gradcam_data_url = generate_gradcam_overlay(
        registry.model,
        input_tensor,
        pil_img,
        best_idx,
    )

    is_battery = bool(cls_meta.get("is_battery", False))
    battery_hazard_score = (
        round(min(0.95, 0.58 + 0.30 * best_conf), 2)
        if is_battery
        else float(cls_meta.get("base_hazard_score", 0.08))
    )
    recommended_pathway = "hazmat" if battery_hazard_score >= HAZARD_THRESHOLD else cls_meta["pathway"]

    # Turunkan sedikit skor keyakinan efektif apabila foto terlalu buram agar tidak lolos otomatis
    effective_conf = best_conf
    if quality["isBlurry"] and not is_battery:
        effective_conf = min(best_conf, 0.79)

    is_low_conf = effective_conf < CONFIDENCE_THRESHOLD
    inference_ms = round((time.perf_counter() - t0) * 1000.0, 1)

    xai_factors = [
        f"Klasifikasi MobileNetV3: '{best_class}' ({round(best_conf * 100, 1)}%), selisih margin {round(margin * 100, 1)}% dari kelas kedua ({top_predictions[1]['className'] if len(top_predictions) > 1 else '-'}).",
        f"Kualitas Citra OpenCV: Ketajaman {quality['sharpScore']} & luminansi {quality['brightness']}/255 ({'Baik' if quality['qualityOk'] else 'Perlu perhatian'}).",
        cls_meta["summary_id"],
    ]
    xai_factors.extend(quality["warnings"])
    if is_battery:
        xai_factors.insert(0, "Aturan K3 Aktif: Objek terdeteksi sebagai Baterai -> wajib isolasi & inspeksi K3 (dilarang bongkar mandiri).")
    elif is_low_conf:
        xai_factors.append(f"Confidence Gate aktif ({round(effective_conf * 100, 1)}% < 85%): wajib tinjauan langsung operator (HITL).")

    predicted_condition = (
        f"INDIKASI BATERAI / K3 — {cls_meta['category_id']} (Wajib Cek Fisik K3)"
        if is_battery
        else f"Terdeteksi Visual: {cls_meta['category_id']} (Pra-Skrining Awal)"
    )

    return {
        "detectedClass": best_class,
        "category": cls_meta["category_id"],
        "deviceType": f"{best_class} — {cls_meta['category_id']}",
        "confidence": round(effective_conf, 4),
        "rawConfidence": round(best_conf, 4),
        "batteryHazardScore": battery_hazard_score,
        "recommendedPathway": recommended_pathway,
        "predictedCondition": predicted_condition,
        "visualSummary": cls_meta["summary_id"],
        "estimatedWeightKg": cls_meta.get("weight_est_kg", 3),
        "requiresHitl": is_low_conf and not is_battery,
        "hazardLocked": battery_hazard_score >= HAZARD_THRESHOLD,
        "topPredictions": top_predictions,
        "quality": quality,
        "gradcamUrl": gradcam_data_url,
        "xaiFactors": xai_factors,
        "inferenceMs": inference_ms,
        "temperature": registry.temperature,
    }


if (ROOT_DIR / "prototype").exists():
    app.mount("/prototype", StaticFiles(directory=str(ROOT_DIR / "prototype"), html=True), name="prototype")
if (ROOT_DIR / "docs").exists():
    app.mount("/docs", StaticFiles(directory=str(ROOT_DIR / "docs"), html=True), name="docs")


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")

