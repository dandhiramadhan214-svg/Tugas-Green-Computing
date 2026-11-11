"""
Skrip Pelatihan & Ekspor ONNX Model Computer Vision SirkulAset (MobileNetV3-Large).
Melatih model klasifikasi e-waste dari folder dataset (train/val/test),
mengkalibrasi skor keyakinan dengan Temperature Scaling, mengekspor ke ONNX
(untuk inferensi langsung di browser / Vercel / GitHub Pages), memvalidasi
akurasi ONNX Runtime pada test set, serta mencatat metrik Green AI.
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

import numpy as np
import onnx
import onnxruntime as ort
from onnxruntime.quantization import QuantType, quantize_dynamic
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets

CURRENT_DIR = Path(__file__).resolve().parent
ROOT_DIR = CURRENT_DIR.parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from model_utils import (
    OnnxCamWrapper,
    SIRKULASET_CLASS_META,
    build_mobilenet_v3_classifier,
    get_eval_transform,
    get_train_transform,
)


def log(msg: str) -> None:
    print(msg, flush=True)


def evaluate_loader(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
) -> tuple[float, float, torch.Tensor, torch.Tensor]:
    """Mengevaluasi model PyTorch pada val/test loader."""
    model.eval()
    total_loss = 0.0
    total_correct = 0
    total_samples = 0
    all_logits: list[torch.Tensor] = []
    all_targets: list[torch.Tensor] = []

    with torch.no_grad():
        for images, targets in loader:
            images = images.to(device)
            targets = targets.to(device)
            logits = model(images)
            loss = criterion(logits, targets)
            total_loss += float(loss.item()) * images.size(0)
            preds = logits.argmax(dim=1)
            total_correct += int((preds == targets).sum().item())
            total_samples += images.size(0)
            all_logits.append(logits.cpu())
            all_targets.append(targets.cpu())

    avg_loss = total_loss / max(1, total_samples)
    acc = total_correct / max(1, total_samples)
    return avg_loss, acc, torch.cat(all_logits, dim=0), torch.cat(all_targets, dim=0)


def evaluate_onnx(onnx_path: Path, loader: DataLoader) -> tuple[float, np.ndarray, np.ndarray]:
    """Mengevaluasi akurasi berkas ONNX pada test loader menggunakan ONNX Runtime."""
    sess = ort.InferenceSession(str(onnx_path), providers=["CPUExecutionProvider"])
    input_name = sess.get_inputs()[0].name
    all_preds: list[np.ndarray] = []
    all_targets: list[np.ndarray] = []

    for images, targets in loader:
        logits = sess.run(["logits"], {input_name: images.numpy()})[0]
        all_preds.append(logits.argmax(axis=1))
        all_targets.append(targets.numpy())

    preds = np.concatenate(all_preds)
    y = np.concatenate(all_targets)
    acc = float((preds == y).mean())
    return acc, preds, y


def fit_temperature_scaling(val_logits: torch.Tensor, val_targets: torch.Tensor) -> tuple[float, float, float]:
    """Kalibrasi Temperature Scaling pada validation logits agar skor tidak overconfident."""
    nll_criterion = nn.CrossEntropyLoss()
    nll_before = float(nll_criterion(val_logits, val_targets).item())

    log_temp = nn.Parameter(torch.zeros(1))
    optimizer = torch.optim.LBFGS([log_temp], lr=0.05, max_iter=50)

    def closure() -> torch.Tensor:
        optimizer.zero_grad()
        temp = torch.clamp(torch.exp(log_temp), min=0.6, max=4.0)
        loss = nll_criterion(val_logits / temp, val_targets)
        loss.backward()
        return loss

    optimizer.step(closure)
    best_temp = float(torch.clamp(torch.exp(log_temp), min=0.6, max=4.0).item())
    nll_after = float(nll_criterion(val_logits / best_temp, val_targets).item())
    return best_temp, nll_before, nll_after


def compute_macro_f1(preds: np.ndarray, targets: np.ndarray, num_classes: int) -> tuple[float, dict[int, float]]:
    """Menghitung macro-F1 dan akurasi per kelas tanpa dependensi tambahan."""
    f1_scores: list[float] = []
    per_class_acc: dict[int, float] = {}
    for cls_idx in range(num_classes):
        tp = int(((preds == cls_idx) & (targets == cls_idx)).sum())
        fp = int(((preds == cls_idx) & (targets != cls_idx)).sum())
        fn = int(((preds != cls_idx) & (targets == cls_idx)).sum())
        support = int((targets == cls_idx).sum())
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0
        f1_scores.append(f1)
        per_class_acc[cls_idx] = round(tp / support, 4) if support > 0 else 0.0
    return float(np.mean(f1_scores)), per_class_acc


def export_onnx_models(
    model: nn.Module,
    web_model_dir: Path,
    test_loader: DataLoader,
    fp32_test_acc: float,
) -> tuple[Path, str, float, float]:
    """
    Mengekspor model ke ONNX berkas tunggal (FP32) lalu mencoba kuantisasi INT8.
    Memilih INT8 bila penurunan akurasi <= 1.5%, agar ringan di GitHub & Vercel.
    """
    web_model_dir.mkdir(parents=True, exist_ok=True)
    fp32_path = web_model_dir / "sirkulaset_mobilenetv3.onnx"
    int8_path = web_model_dir / "sirkulaset_mobilenetv3_int8.onnx"

    wrapper = OnnxCamWrapper(model.cpu()).eval()
    dummy = torch.randn(1, 3, 224, 224)

    torch.onnx.export(
        wrapper,
        dummy,
        str(fp32_path),
        input_names=["input"],
        output_names=["logits", "features"],
        dynamic_axes={"input": {0: "batch"}, "logits": {0: "batch"}, "features": {0: "batch"}},
        opset_version=17,
        dynamo=False,
    )

    # Pastikan seluruh tensor berada dalam 1 berkas .onnx tunggal (tanpa .onnx.data terpisah)
    onnx_model = onnx.load(str(fp32_path), load_external_data=True)
    onnx.save_model(onnx_model, str(fp32_path), save_as_external_data=False)
    for leftover in web_model_dir.glob("*.onnx.data"):
        leftover.unlink(missing_ok=True)

    fp32_size_mb = round(fp32_path.stat().st_size / (1024 * 1024), 2)
    ort_fp32_acc, _, _ = evaluate_onnx(fp32_path, test_loader)
    log(f"[SirkulAset ONNX] FP32 : {fp32_path.name} ({fp32_size_mb} MB) | Test Acc: {ort_fp32_acc*100:.2f}%")

    # Kuantisasi dinamis MatMul/Gemm INT8 untuk menyusutkan ukuran berkas statis
    try:
        quantize_dynamic(
            model_input=str(fp32_path),
            model_output=str(int8_path),
            weight_type=QuantType.QUInt8,
        )
        int8_size_mb = round(int8_path.stat().st_size / (1024 * 1024), 2)
        ort_int8_acc, _, _ = evaluate_onnx(int8_path, test_loader)
        log(f"[SirkulAset ONNX] INT8 : {int8_path.name} ({int8_size_mb} MB) | Test Acc: {ort_int8_acc*100:.2f}%")

        if (ort_fp32_acc - ort_int8_acc) <= 0.015 and int8_size_mb < fp32_size_mb:
            fp32_path.unlink(missing_ok=True)
            return int8_path, "INT8", ort_int8_acc, int8_size_mb
        int8_path.unlink(missing_ok=True)
    except Exception as exc:
        log(f"[SirkulAset ONNX] Kuantisasi INT8 dilewati ({exc}); menggunakan FP32.")
        int8_path.unlink(missing_ok=True)

    return fp32_path, "FP32", ort_fp32_acc, fp32_size_mb


def train_and_evaluate(
    data_dir: Path,
    backend_model_dir: Path,
    web_model_dir: Path,
    epochs: int = 5,
    batch_size: int = 32,
    lr: float = 5e-4,
) -> dict:
    start_time = time.perf_counter()
    torch.manual_seed(42)
    np.random.seed(42)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    log(f"[SirkulAset CV] Perangkat komputasi: {device} | Dataset: {data_dir}")

    train_ds = datasets.ImageFolder(data_dir / "train", transform=get_train_transform())
    val_ds = datasets.ImageFolder(data_dir / "val", transform=get_eval_transform())
    test_ds = datasets.ImageFolder(data_dir / "test", transform=get_eval_transform())

    classes = train_ds.classes
    num_classes = len(classes)
    log(f"[SirkulAset CV] Kelas ({num_classes}): {classes}")
    log(f"[SirkulAset CV] Jumlah citra -> Train: {len(train_ds)}, Val: {len(val_ds)}, Test: {len(test_ds)}")

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=0)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False, num_workers=0)

    model = build_mobilenet_v3_classifier(num_classes=num_classes, pretrained=True).to(device)

    # Bekukan 12 blok awal agar pelatihan CPU cepat dan tetap adaptif pada blok semantik atas
    for idx, child in enumerate(model.features.children()):
        if idx < 12:
            for param in child.parameters():
                param.requires_grad = False

    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total_params = sum(p.numel() for p in model.parameters())
    log(f"[SirkulAset CV] Parameter dilatih: {trainable_params:,} / {total_params:,} ({100*trainable_params/total_params:.1f}%)")

    criterion = nn.CrossEntropyLoss(label_smoothing=0.05)
    optimizer = torch.optim.AdamW(
        [p for p in model.parameters() if p.requires_grad],
        lr=lr,
        weight_decay=1e-4,
    )
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    best_val_acc = -1.0
    best_state_dict: dict | None = None
    history: list[dict] = []

    for epoch in range(1, epochs + 1):
        ep_start = time.perf_counter()
        model.train()
        running_loss = 0.0
        running_correct = 0
        running_total = 0

        for images, targets in train_loader:
            images = images.to(device)
            targets = targets.to(device)

            optimizer.zero_grad()
            logits = model(images)
            loss = criterion(logits, targets)
            loss.backward()
            optimizer.step()

            running_loss += float(loss.item()) * images.size(0)
            running_correct += int((logits.argmax(dim=1) == targets).sum().item())
            running_total += images.size(0)

        scheduler.step()
        train_loss = running_loss / max(1, running_total)
        train_acc = running_correct / max(1, running_total)
        val_loss, val_acc, _, _ = evaluate_loader(model, val_loader, nn.CrossEntropyLoss(), device)
        ep_sec = time.perf_counter() - ep_start

        history.append({
            "epoch": epoch,
            "trainLoss": round(train_loss, 4),
            "trainAcc": round(train_acc, 4),
            "valLoss": round(val_loss, 4),
            "valAcc": round(val_acc, 4),
            "seconds": round(ep_sec, 1),
        })
        log(
            f"Epoch {epoch}/{epochs} ({ep_sec:.1f}s) | "
            f"Train Loss: {train_loss:.4f} Acc: {train_acc*100:.1f}% | "
            f"Val Loss: {val_loss:.4f} Acc: {val_acc*100:.1f}%"
        )

        if val_acc >= best_val_acc:
            best_val_acc = val_acc
            best_state_dict = {k: v.cpu().clone() for k, v in model.state_dict().items()}

    assert best_state_dict is not None
    model.load_state_dict(best_state_dict)
    model.to(device)

    _, final_val_acc, val_logits, val_targets = evaluate_loader(model, val_loader, nn.CrossEntropyLoss(), device)
    temperature, nll_before, nll_after = fit_temperature_scaling(val_logits, val_targets)
    log(f"[SirkulAset CV] Temperature Scaling: T={temperature:.3f} (NLL val: {nll_before:.4f} -> {nll_after:.4f})")

    _, test_acc, test_logits, test_targets = evaluate_loader(model, test_loader, nn.CrossEntropyLoss(), device)
    test_preds = test_logits.argmax(dim=1).numpy()
    test_y = test_targets.numpy()
    macro_f1, per_class_raw = compute_macro_f1(test_preds, test_y, num_classes)
    per_class_acc = {classes[i]: per_class_raw[i] for i in range(num_classes)}

    # Simpan checkpoint PyTorch lokal untuk server.py
    backend_model_dir.mkdir(parents=True, exist_ok=True)
    ckpt_path = backend_model_dir / "sirkulaset_mobilenetv3.pt"
    torch.save({
        "state_dict": best_state_dict,
        "classes": classes,
        "temperature": temperature,
        "arch": "mobilenet_v3_large_cam",
    }, ckpt_path)

    # Ekspor ONNX ke prototype/model/ untuk inferensi browser di GitHub Pages & Vercel
    onnx_path, onnx_precision, onnx_test_acc, onnx_size_mb = export_onnx_models(
        model,
        web_model_dir,
        test_loader,
        test_acc,
    )

    linear_layer = model.classifier[-1]
    cam_weights = np.round(linear_layer.weight.detach().cpu().numpy(), 5).tolist()

    total_sec = time.perf_counter() - start_time
    est_energy_wh = round((total_sec / 3600.0) * 28.0, 2)
    est_co2_g = round((est_energy_wh / 1000.0) * 760.0, 2)

    meta = {
        "architecture": f"MobileNetV3-Large (ONNX {onnx_precision})",
        "classes": classes,
        "classMeta": {c: SIRKULASET_CLASS_META.get(c, {}) for c in classes},
        "temperature": round(temperature, 4),
        "onnxFile": onnx_path.name,
        "onnxPrecision": onnx_precision,
        "onnxSizeMb": onnx_size_mb,
        "valAccuracy": round(final_val_acc, 4),
        "testAccuracy": round(onnx_test_acc, 4),
        "pytorchTestAccuracy": round(test_acc, 4),
        "testMacroF1": round(macro_f1, 4),
        "perClassTestAccuracy": per_class_acc,
        "camWeights": cam_weights,
        "dataset": {
            "source": "modified-dataset (Kaggle E-Waste Image Dataset, 10 kelas)",
            "trainImages": len(train_ds),
            "valImages": len(val_ds),
            "testImages": len(test_ds),
        },
        "greenAiMetrics": {
            "device": str(device),
            "epochs": epochs,
            "trainingSeconds": round(total_sec, 1),
            "onnxSizeMb": onnx_size_mb,
            "estimatedEnergyWh": est_energy_wh,
            "estimatedCo2Grams": est_co2_g,
        },
        "history": history,
    }

    (backend_model_dir / "model_meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    (web_model_dir / "model_meta.json").write_text(json.dumps(meta), encoding="utf-8")

    log("\n=== HASIL EVALUASI & EKSPOR AKHIR ===")
    log(f"PyTorch Test Acc : {test_acc*100:.2f}% | Macro F1: {macro_f1*100:.2f}%")
    log(f"ONNX ({onnx_precision}) Acc : {onnx_test_acc*100:.2f}% | Ukuran: {onnx_size_mb} MB -> {onnx_path}")
    log(f"Green AI Log     : {total_sec:.1f}s | ~{est_energy_wh} Wh | ~{est_co2_g} gCO2e")
    return meta


def main() -> None:
    parser = argparse.ArgumentParser(description="Latih dan ekspor ONNX model CV SirkulAset.")
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=Path(r"C:\Users\ASUS\Downloads\modified-dataset"),
        help="Folder root dataset berisi subfolder train, val, dan test.",
    )
    parser.add_argument("--epochs", type=int, default=5, help="Jumlah epoch pelatihan.")
    parser.add_argument("--batch-size", type=int, default=32, help="Ukuran batch pelatihan.")
    parser.add_argument("--lr", type=float, default=5e-4, help="Learning rate awal AdamW.")
    args = parser.parse_args()

    train_and_evaluate(
        data_dir=args.data_dir,
        backend_model_dir=CURRENT_DIR / "models",
        web_model_dir=ROOT_DIR / "prototype" / "model",
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
    )


if __name__ == "__main__":
    main()
