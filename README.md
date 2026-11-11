# SirkulAset — Integrated Circular Economy Dashboard

**Studi Kasus #25** | Mata Kuliah: *Green Computing & Sustainable AI (Pertemuan 10)*

Proyek ini berisi rancangan sistem lengkap dan prototipe UI/UX interaktif untuk membantu pengelola institusi memantau siklus hidup aset dan limbah elektronik (*e-waste*) secara menyeluruh pada jalur **Reuse (digunakan kembali)**, **Repair (diperbaiki)**, **Donate (didonasikan)**, dan **Recycle (diserahkan ke pengolah daur ulang berizin)**, disertai tata kelola **Keselamatan Baterai K3** dan **Responsible AI (*Human-in-the-Loop*)**.

---

## Struktur Berkas

- `docs/Laporan_Rancangan_Sistem_SirkulAset.md`  
  Dokumen rancangan solusi sistem lengkap (Komponen 1 s.d. 10) beserta diagram Mermaid (Flowchart, Use Case, Arsitektur Aplikasi & AI, dan ERD) serta analisis keberlanjutan kuantitatif.
- `docs/Diagram_dan_Presentasi.html`  
  Halaman presentasi & penampil diagram visual berformat SVG mandiri (bisa langsung dibuka di browser dan dicetak/disimpan sebagai PDF untuk lampiran tugas atau slide presentasi).
- `docs/dataset_sampel_sirkulaset.csv`  
  Dataset tabular sampel (100 baris aset terkalibrasi, 19 kolom) yang sinkron dengan Bab 9, Bab 10, dan `prototype/data.js`.
- `prototype/index.html` *(bersama `styles.css`, `data.js`, dan `app.js`)*  
  **UI/UX Prototype Interaktif** dengan 5 modul utama tanpa ketergantungan server/internet eksternal:
  1. **Ringkasan Eksekutif:** KPI Circularity Rate, penghematan $\text{CO}_2\text{e}$, nilai ekonomi, grafik distribusi & tren 6 bulan, serta tabel 100 unit aset terkalibrasi.
  2. **Pemantauan 4 Jalur & Karantina K3:** Kartu per jalur (*Reuse, Repair, Donate, Recycle, Karantina Baterai/B3*) dan modal **Paspor Produk Digital**.
  3. **Pra-Skrining AI & Antrean HITL:** Simulator skenario *High Confidence*, *Low Confidence (HITL)*, dan *Battery Swelling Hazard Lock* (plus unggah foto sampel & verifikasi operator).
  4. **Rantai Pengawasan & Mitra:** Direktori mitra donasi (*data wipe* NIST SP 800-88 & BAST), validasi izin pengolah daur ulang B3, dan formulir pembuatan *Manifest Batch* baru.
  5. **Analisis Dampak & Simulator Kebijakan:** Kalkulator kontribusi per jalur dan slider simulasi skenario peningkatan porsi *Reuse/Repair*.
- `backend/` (`model_utils.py`, `train_cv.py`, `server.py`)  
  *(Opsional — Referensi Arsitektur AI)* Skrip pelatihan `MobileNetV3-Large` + ekspor ONNX & server FastAPI lokal bila ingin menjalankan klasifikasi citra nyata secara terpisah.
- `vercel.json` & `index.html`  
  Konfigurasi deployment statis siap pakai untuk **GitHub Pages** maupun **Vercel**.

---

## Cara Membuka, Menjalankan & Deploy

1. **Membuka Langsung di Browser (Tanpa Instalasi):**
   - Klik dua kali `prototype/index.html` untuk mencoba UI/UX prototype interaktif.
   - Klik dua kali `docs/Diagram_dan_Presentasi.html` untuk melihat seluruh diagram sistem dan mencetaknya ke PDF (`Ctrl+P` / tombol *Cetak*).
2. **Atau Melalui Server Lokal (Opsional):**
   ```powershell
   python -m http.server 8080
   ```
   Lalu buka `http://localhost:8080/prototype/index.html` atau `http://localhost:8080/docs/Diagram_dan_Presentasi.html`.
3. **Deploy ke GitHub Pages / Vercel:**
   - Push seluruh isi repositori ini ke GitHub.
   - Hubungkan repositori GitHub di dashboard Vercel (Framework Preset: **Other / Static**; tanpa *build command*), maka `vercel.json` dan `index.html` otomatis melayani dashboard beserta halaman diagram secara online.

---

## Pemetaan ke 10 Komponen Tugas

1. **Identifikasi Masalah** → `Laporan_Rancangan_Sistem_SirkulAset.md` Bab 1
2. **Analisis Kebutuhan (FR & NFR)** → Bab 2
3. **Identifikasi Pengguna (Aktor & Peran)** → Bab 3
4. **Perancangan Proses Bisnis (Flowchart)** → Bab 4 & `Diagram_dan_Presentasi.html` (Diagram 1)
5. **Pemodelan Sistem (Use Case Diagram)** → Bab 5 & `Diagram_dan_Presentasi.html` (Diagram 2)
6. **Arsitektur Solusi (Aplikasi & AI)** → Bab 6 & `Diagram_dan_Presentasi.html` (Diagram 3)
7. **Perancangan Data (ERD)** → Bab 7 & `Diagram_dan_Presentasi.html` (Diagram 4)
8. **Desain Antarmuka (UI/UX Prototype)** → Bab 8 & `prototype/index.html`
9. **Integrasi AI (Metode, Data, & Alur)** → Bab 9
10. **Analisis Keberlanjutan (Lingkungan & Ekonomi)** → Bab 10

