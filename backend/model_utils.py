"""
Utilitas model Computer Vision SirkulAset (MobileNetV3-Large + Grad-CAM + Cek Kualitas).
Digunakan bersama oleh skrip pelatihan (train_cv.py) dan server API (server.py).
"""

from __future__ import annotations

import base64
import io
from typing import Any

import cv2
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
from torchvision import models, transforms

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]
CONFIDENCE_THRESHOLD = 0.85
HAZARD_THRESHOLD = 0.35

# Pemetaan 10 kelas dataset Kaggle (modified-dataset) ke domain SirkulAset
SIRKULASET_CLASS_META: dict[str, dict[str, Any]] = {
    "Battery": {
        "category_id": "Baterai / Sel Daya",
        "pathway": "hazmat",
        "is_battery": True,
        "base_hazard_score": 0.78,
        "weight_est_kg": 2,
        "summary_id": "Terdeteksi sel/modul baterai. Wajib melewati pemeriksaan fisik K3 (suhu, kebocoran, atau penggelembungan) dan dilarang dibongkar mandiri.",
    },
    "Keyboard": {
        "category_id": "Periferal (Keyboard)",
        "pathway": "reuse",
        "is_battery": False,
        "base_hazard_score": 0.04,
        "weight_est_kg": 1,
        "summary_id": "Periferal keyboard teridentifikasi secara visual; berpotensi masuk jalur Reuse setelah uji tombol dan pembersihan.",
    },
    "Microwave": {
        "category_id": "Elektronik Penunjang (Microwave)",
        "pathway": "recycle",
        "is_battery": False,
        "base_hazard_score": 0.14,
        "weight_est_kg": 12,
        "summary_id": "Perangkat microwave terdeteksi; diarahkan ke evaluasi recycle berizin untuk pemulihan rangka logam dan komponen kelistrikan.",
    },
    "Mobile": {
        "category_id": "Perangkat Mobile (Smartphone)",
        "pathway": "reuse",
        "is_battery": False,
        "base_hazard_score": 0.16,
        "weight_est_kg": 1,
        "summary_id": "Perangkat mobile terdeteksi; evaluasi Reuse/Donate setelah cek kesehatan baterai internal dan data wiping NIST SP 800-88.",
    },
    "Mouse": {
        "category_id": "Periferal (Mouse)",
        "pathway": "reuse",
        "is_battery": False,
        "base_hazard_score": 0.04,
        "weight_est_kg": 1,
        "summary_id": "Periferal mouse teridentifikasi secara visual; siap uji fungsi sensor/klik untuk penggunaan ulang internal.",
    },
    "PCB": {
        "category_id": "Papan Sirkuit / Komponen (PCB)",
        "pathway": "recycle",
        "is_battery": False,
        "base_hazard_score": 0.12,
        "weight_est_kg": 1,
        "summary_id": "Komponen PCB/motherboard lepas terdeteksi; diarahkan ke pengolah daur ulang berizin untuk pemulihan logam mulia & tembaga.",
    },
    "Player": {
        "category_id": "Perangkat Media (Player)",
        "pathway": "recycle",
        "is_battery": False,
        "base_hazard_score": 0.06,
        "weight_est_kg": 2,
        "summary_id": "Perangkat pemutar media terdeteksi; evaluasi ke pengolah daur ulang berizin atau pemanfaatan komponen.",
    },
    "Printer": {
        "category_id": "Perangkat Cetak (Printer)",
        "pathway": "repair",
        "is_battery": False,
        "base_hazard_score": 0.08,
        "weight_est_kg": 7,
        "summary_id": "Unit printer terdeteksi; kandidat jalur Repair / pemeliharaan mekanik & katrid sebelum alokasi ulang atau recycle.",
    },
    "Television": {
        "category_id": "Layar / Display (TV & Monitor)",
        "pathway": "donate",
        "is_battery": False,
        "base_hazard_score": 0.10,
        "weight_est_kg": 6,
        "summary_id": "Unit layar/televisi terdeteksi; kandidat evaluasi Donate/Reuse setelah uji panel LCD dan catu daya oleh teknisi.",
    },
    "Washing Machine": {
        "category_id": "Elektronik Besar (Mesin Cuci)",
        "pathway": "recycle",
        "is_battery": False,
        "base_hazard_score": 0.09,
        "weight_est_kg": 28,
        "summary_id": "Perangkat elektronik besar terdeteksi; diproses melalui penjemputan logistik ke pengolah daur ulang berizin.",
    },
}


def get_eval_transform() -> transforms.Compose:
    """Transformasi standar untuk validasi, evaluasi, dan inferensi."""
    return transforms.Compose([
        transforms.Resize(224),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    ])


def get_train_transform() -> transforms.Compose:
    """Augmentasi ringan ramah Green AI untuk meningkatkan ketahanan sudut & pencahayaan."""
    return transforms.Compose([
        transforms.RandomResizedCrop(224, scale=(0.75, 1.0)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.15),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    ])


def build_mobilenet_v3_classifier(
    num_classes: int,
    pretrained: bool = False,
) -> nn.Module:
    """
    Membangun arsitektur ringan MobileNetV3-Large untuk klasifikasi e-waste.
    Menggunakan kepala klasifikasi linear tunggal (960 -> num_classes) agar
    mendukung ekspor ONNX ringan sekaligus Class Activation Mapping (CAM) di browser.
    """
    weights = models.MobileNet_V3_Large_Weights.DEFAULT if pretrained else None
    model = models.mobilenet_v3_large(weights=weights)
    last_channels = model.features[-1].out_channels
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.2),
        nn.Linear(last_channels, num_classes),
    )
    return model


class OnnxCamWrapper(nn.Module):
    """Membungkus model agar ekspor ONNX menghasilkan logits dan feature map akhir sekaligus."""

    def __init__(self, base_model: nn.Module) -> None:
        super().__init__()
        self.features = base_model.features
        self.avgpool = base_model.avgpool
        self.classifier = base_model.classifier

    def forward(self, x: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        feats = self.features(x)
        pooled = self.avgpool(feats)
        flat = torch.flatten(pooled, 1)
        logits = self.classifier(flat)
        return logits, feats


def disable_inplace_activations(model: nn.Module) -> None:
    """Menonaktifkan inplace activation agar perhitungan gradien Grad-CAM aman."""
    for module in model.modules():
        if hasattr(module, "inplace"):
            module.inplace = False


def analyze_image_quality(pil_img: Image.Image) -> dict[str, Any]:
    """
    Validasi kualitas citra sebelum/saat pra-skrining (Bab 9.3.1):
    mengukur ketajaman (Laplacian variance) dan rata-rata pencahayaan.
    """
    rgb = np.array(pil_img.convert("RGB"))
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)

    # Standarisasi ukuran 224x224 agar selaras dengan resolusi input MobileNetV3
    resized_gray = cv2.resize(gray, (224, 224))
    sharp_score = float(cv2.Laplacian(resized_gray, cv2.CV_64F).var())
    brightness = float(gray.mean())

    is_blurry = sharp_score < 22.0
    is_too_dark = brightness < 40.0
    is_overexposed = brightness > 230.0

    warnings: list[str] = []
    if is_blurry:
        warnings.append(f"Foto agak buram (ketajaman {sharp_score:.0f} < 22); disarankan foto ulang.")
    if is_too_dark:
        warnings.append(f"Pencahayaan terlalu gelap (luminansi {brightness:.0f}/255).")
    elif is_overexposed:
        warnings.append(f"Pantulan cahaya berlebih / silau (luminansi {brightness:.0f}/255).")

    return {
        "sharpScore": round(sharp_score, 1),
        "brightness": round(brightness, 1),
        "isBlurry": is_blurry,
        "isBadLighting": is_too_dark or is_overexposed,
        "qualityOk": len(warnings) == 0,
        "warnings": warnings,
    }


def generate_gradcam_overlay(
    model: nn.Module,
    input_tensor: torch.Tensor,
    pil_img: Image.Image,
    target_class_idx: int,
) -> str:
    """
    Menghasilkan overlay peta atensi Grad-CAM dalam format PNG Base64 Data URL
    untuk menjelaskan bagian gambar yang paling memengaruhi prediksi model.
    """
    model.eval()
    x = input_tensor.clone().detach().requires_grad_(True)

    feature_maps = model.features(x)
    feature_maps.retain_grad()

    pooled = model.avgpool(feature_maps)
    flat = torch.flatten(pooled, 1)
    logits = model.classifier(flat)

    model.zero_grad(set_to_none=True)
    score = logits[0, target_class_idx]
    score.backward()

    grads = feature_maps.grad[0]  # (C, H, W)
    acts = feature_maps.detach()[0]  # (C, H, W)
    weights = grads.mean(dim=(1, 2), keepdim=True)
    cam = (weights * acts).sum(dim=0)
    cam = F.relu(cam).cpu().numpy()

    cam_max = float(cam.max())
    if cam_max > 1e-8:
        cam = cam / cam_max
    else:
        cam = np.zeros_like(cam)

    # Buat crop center-224x224 agar koordinat overlay tepat sejajar dengan input model
    rgb_preview = transforms.Compose([
        transforms.Resize(224),
        transforms.CenterCrop(224),
    ])(pil_img.convert("RGB"))
    base_np = np.array(rgb_preview)

    cam_resized = cv2.resize(cam, (base_np.shape[1], base_np.shape[0]))
    heatmap_bgr = cv2.applyColorMap(np.uint8(255 * cam_resized), cv2.COLORMAP_JET)
    heatmap_rgb = cv2.cvtColor(heatmap_bgr, cv2.COLOR_BGR2RGB)

    blended = np.uint8(np.clip(0.58 * base_np + 0.42 * heatmap_rgb, 0, 255))
    out_pil = Image.fromarray(blended)
    buf = io.BytesIO()
    out_pil.save(buf, format="PNG")
    encoded = base64.b64encode(buf.getvalue()).decode("ascii")
    return f"data:image/png;base64,{encoded}"
