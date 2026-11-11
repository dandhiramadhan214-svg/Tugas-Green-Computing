/**
 * Dataset Baseline & Konfigurasi Model untuk Prototipe SirkulAset
 * Konsisten dengan Bab 7 (ERD), Bab 9 (Integrasi AI), dan Bab 10 (Analisis Keberlanjutan)
 * Total Baseline Cohort: 100 unit | 545 kg | 13.220 kg CO2e avoided | Rp 357.700.000
 */

const PATHWAY_META = {
  reuse: {
    key: 'reuse',
    label: 'Reuse (Pakai Ulang)',
    shortLabel: 'Reuse',
    color: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    description: 'Dialokasikan ulang ke unit kerja internal setelah uji fungsi & sanitasi data.'
  },
  repair: {
    key: 'repair',
    label: 'Repair (Diperbaiki)',
    shortLabel: 'Repair',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    description: 'Perbaikan komponen aman oleh teknisi dengan biaya < 45% harga pengganti.'
  },
  donate: {
    key: 'donate',
    label: 'Donate (Didonasikan)',
    shortLabel: 'Donate',
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    description: 'Dihibahkan ke sekolah/komunitas mitra setelah data wiping NIST SP 800-88 & BAST.'
  },
  recycle: {
    key: 'recycle',
    label: 'Recycle (Daur Ulang Berizin)',
    shortLabel: 'Recycle',
    color: '#4F46E5',
    bg: '#EEF2FF',
    border: '#C7D2FE',
    description: 'Diserahkan ke pengolah daur ulang berizin B3 untuk pemulihan material.'
  },
  hazmat: {
    key: 'hazmat',
    label: 'Karantina K3 / Baterai B3',
    shortLabel: 'Karantina K3',
    color: '#DC2626',
    bg: '#FEF2F2',
    border: '#FECACA',
    description: 'Terkunci akibat indikasi baterai rusak/menggembung/bocor/panas. Dilarang dibongkar mandiri.'
  }
};

const ROLES_CONFIG = {
  manager: {
    id: 'manager',
    name: 'Pengelola Institusi (Manajer)',
    badge: 'Eksekutif & Approval',
    canApprovePathway: true,
    canRunTriage: true,
    canApproveHitl: true,
    canRepairDisassemble: false,
    canManageHazmat: false,
    canCreateManifest: true,
    hint: 'Akses penuh dasbor analitik, persetujuan donasi/penghapusan, dan laporan ESG.'
  },
  operator: {
    id: 'operator',
    name: 'Operator Gudang / Triage',
    badge: 'Pra-Skrining & HITL',
    canApprovePathway: true,
    canRunTriage: true,
    canApproveHitl: true,
    canRepairDisassemble: false,
    canManageHazmat: false,
    canCreateManifest: true,
    hint: 'Bertanggung jawab melakukan foto visual AI, meninjau antrean HITL, dan menandai karantina awal.'
  },
  technician: {
    id: 'technician',
    name: 'Teknisi IT & Sanitasi Data',
    badge: 'Uji Internal & Servis',
    canApprovePathway: false,
    canRunTriage: false,
    canApproveHitl: false,
    canRepairDisassemble: true,
    canManageHazmat: false,
    canCreateManifest: false,
    hint: 'Melakukan uji kelistrikan internal, servis aman, dan data wiping. Terblokir pada aset Karantina K3.'
  },
  k3: {
    id: 'k3',
    name: 'Petugas K3 & Kepatuhan B3',
    badge: 'Otoritas Keselamatan & B3',
    canApprovePathway: true,
    canRunTriage: true,
    canApproveHitl: true,
    canRepairDisassemble: false,
    canManageHazmat: true,
    canCreateManifest: true,
    hint: 'Otoritas penuh penanganan baterai berisiko, verifikasi izin pengolah, dan manifest B3.'
  }
};

const DONATION_RECIPIENTS = [
  {
    id: 'DON-01',
    name: 'SMKN 2 Nusantara — Lab Rekayasa Perangkat Lunak',
    type: 'Sekolah Menengah Kejuruan',
    city: 'Bandung',
    verifiedStatus: 'Terverifikasi (BAST Aktif)',
    unitsAllocated: 6,
    dataWipeVerified: true,
    bastCode: 'BAST-HIB/2026/09/014'
  },
  {
    id: 'DON-02',
    name: 'SMP Harapan Bangsa — Ruang Multimedia',
    type: 'Sekolah Menengah Pertama',
    city: 'Cimahi',
    verifiedStatus: 'Terverifikasi (BAST Aktif)',
    unitsAllocated: 5,
    dataWipeVerified: true,
    bastCode: 'BAST-HIB/2026/10/022'
  },
  {
    id: 'DON-03',
    name: 'PKBM Cahaya Ilmu — Pusat Belajar Masyarakat',
    type: 'Pendidikan Non-Formal',
    city: 'Kab. Bandung Barat',
    verifiedStatus: 'Terverifikasi (Menunggu Pengiriman)',
    unitsAllocated: 4,
    dataWipeVerified: true,
    bastCode: 'BAST-HIB/2026/11/003'
  },
  {
    id: 'DON-04',
    name: 'Yayasan Literasi Digital Desa',
    type: 'LSM Pendidikan',
    city: 'Sumedang',
    verifiedStatus: 'Terverifikasi (Siap Serah Terima)',
    unitsAllocated: 3,
    dataWipeVerified: true,
    bastCode: 'BAST-HIB/2026/11/008'
  }
];

const LICENSED_RECYCLERS = [
  {
    id: 'REC-01',
    name: 'PT E-Waste Hijau Nusantara',
    licenseNo: 'KLHK-B3-0412/2024',
    validUntil: '2027-12-31',
    licenseValid: true,
    capabilities: 'PCB, Komputer, Monitor, Pemulihan Logam Mulia & Plastik ABS',
    serviceArea: 'Jawa Barat & Jabodetabek'
  },
  {
    id: 'REC-02',
    name: 'PT Baterai Aman Lestari (Khusus B3 Lithium/Aki)',
    licenseNo: 'KLHK-HAZ-0889/2025',
    validUntil: '2028-06-30',
    licenseValid: true,
    capabilities: 'Baterai Lithium-Ion Menggembung/Rusak, Aki UPS B3, Stabilisasi Termal',
    serviceArea: 'Nasional (Armada Hazmat Bersertifikat)'
  },
  {
    id: 'REC-03',
    name: 'CV Sirkular Logam Mandiri',
    licenseNo: 'KLHK-B3-0194/2022',
    validUntil: '2026-08-15',
    licenseValid: false,
    capabilities: 'Rangka Logam, Printer, Kabel Tembaga (Izin Sedang Diperpanjang)',
    serviceArea: 'Regional Jawa Barat'
  }
];

const INITIAL_MANIFESTS = [
  {
    id: 'MAN-2026-091',
    recyclerId: 'REC-01',
    recyclerName: 'PT E-Waste Hijau Nusantara',
    officerK3: 'Ir. Ratna Sari, M.K3',
    date: '2026-10-18',
    assetCount: 14,
    totalWeightKg: 94,
    containsHazmat: false,
    status: 'Sertifikat Daur Ulang Terbit',
    certNo: 'COR-EW-2026-7712'
  },
  {
    id: 'MAN-2026-104',
    recyclerId: 'REC-01',
    recyclerName: 'PT E-Waste Hijau Nusantara',
    officerK3: 'Ir. Ratna Sari, M.K3',
    date: '2026-11-04',
    assetCount: 8,
    totalWeightKg: 51,
    containsHazmat: false,
    status: 'Dalam Proses Pemilahan Pengolah',
    certNo: 'Menunggu Sertifikat'
  },
  {
    id: 'MAN-HAZ-2026-019',
    recyclerId: 'REC-02',
    recyclerName: 'PT Baterai Aman Lestari (Khusus B3 Lithium/Aki)',
    officerK3: 'Ir. Ratna Sari, M.K3',
    date: '2026-11-10',
    assetCount: 4,
    totalWeightKg: 31,
    containsHazmat: true,
    status: 'Terjadwal Jemput Drum Isolasi K3',
    certNo: 'Manifest B3 Aktif'
  }
];

const AI_TEST_SCENARIOS = [
  {
    id: 'scen-high-reuse',
    title: 'Skenario A: Laptop Bisnis Kondisi Baik (High Confidence)',
    assetTag: 'AST-NEW-901',
    deviceType: 'Laptop Lenovo ThinkPad T14',
    category: 'Laptop',
    ageYears: 3,
    repairCount: 0,
    visualSummary: 'Casing aluminium utuh, engsel rapat, tidak ada retak layar, profil baterai rata/normal.',
    predictedCondition: 'Grade A — Layak Evaluasi Reuse / Donate',
    recommendedPathway: 'reuse',
    confidence: 0.93,
    batteryHazardScore: 0.06,
    physicalTempOk: true,
    visualDefectBoxes: [
      { label: 'Bodi Utuh (95%)', x: 18, y: 18, w: 64, h: 42, color: '#059669' },
      { label: 'Area Baterai Normal', x: 24, y: 63, w: 52, h: 16, color: '#059669' }
    ],
    xaiFactors: [
      'Kondisi visual sasis & layar baik (Skor CV 0.93)',
      'Usia pakai 3 tahun — masih masuk batas standar kerja',
      '0 riwayat tiket kerusakan hardware',
      'Kebutuhan unit Lab Administrasi masih terbuka'
    ]
  },
  {
    id: 'scen-low-hitl',
    title: 'Skenario B: Monitor Pencahayaan Ambigu (Low Confidence -> Wajib HITL)',
    assetTag: 'AST-NEW-902',
    deviceType: 'Monitor Dell P2419H 24"',
    category: 'Monitor',
    ageYears: 4,
    repairCount: 1,
    visualSummary: 'Terdapat pantulan cahaya gudang & noda pada sudut kiri layar; model CV ragu antara goresan permukaan atau retak panel LCD.',
    predictedCondition: 'Ambigu — Kemungkinan Retak Ringan / Noda Permukaan',
    recommendedPathway: 'repair',
    confidence: 0.61,
    batteryHazardScore: 0.04,
    physicalTempOk: true,
    visualDefectBoxes: [
      { label: 'Area Ambigu: Panel LCD (61%)', x: 22, y: 20, w: 40, h: 36, color: '#EA580C' }
    ],
    xaiFactors: [
      'Confidence 0.61 berada di bawah ambang minimum 0.85',
      'Pantulan cahaya menyamarkan batas kerusakan panel',
      'Wajib inspeksi langsung operator sebelum masuk Repair atau Recycle'
    ]
  },
  {
    id: 'scen-battery-hazard',
    title: 'Skenario C: Indikasi Baterai Menggembung (Critical K3 Safety Lock)',
    assetTag: 'AST-NEW-903',
    deviceType: 'Laptop Dell Latitude 5420 / Baterai Li-Ion',
    category: 'Laptop',
    ageYears: 5,
    repairCount: 2,
    visualSummary: 'Terdeteksi deformasi cembung pada area palmrest & celah penutup bawah terangkat (indikasi kuat baterai lithium-ion menggembung).',
    predictedCondition: 'BAHAYA BATERAI — Deformasi Casing & Indikasi Swollen Battery',
    recommendedPathway: 'hazmat',
    confidence: 0.89,
    batteryHazardScore: 0.91,
    physicalTempOk: false,
    visualDefectBoxes: [
      { label: 'KRITIS: Indikasi Baterai Menggembung (91%)', x: 20, y: 54, w: 60, h: 24, color: '#DC2626' }
    ],
    xaiFactors: [
      'Hazard Score 0.91 melampaui batas aman 0.35',
      'Profil bawah perangkat terangkat tidak simetris',
      'Aturan Deterministik K3 aktif: Pembongkaran mandiri DILARANG KERAS'
    ]
  }
];

/**
 * Membangun tepat 100 catatan aset institusional yang konsisten secara matematis
 * dengan tabel analisis Bab 10.2:
 * - Reuse: 30 unit | 142 kg | 5.250 kg CO2e | Rp 186.000.000
 * - Repair: 24 unit | 128 kg | 3.620 kg CO2e | Rp 94.500.000
 * - Donate: 18 unit | 86 kg | 2.980 kg CO2e | Rp 63.000.000
 * - Recycle: 22 unit | 145 kg | 1.160 kg CO2e | Rp 14.200.000
 * - Hazmat: 6 unit | 44 kg | 210 kg CO2e | Rp 0
 */
function buildInitialAssets() {
  const units = [
    'Fakultas Teknik',
    'Lab Komputer Pusat',
    'Biro Keuangan & SDM',
    'Perpustakaan Pusat',
    'Gedung Rektorat',
    'Poliklinik & Lab Riset'
  ];

  const modelsByCategory = {
    Laptop: ['Lenovo ThinkPad T14', 'Dell Latitude 5420', 'HP ProBook 440 G8', 'ASUS ExpertBook B1'],
    Desktop: ['Dell OptiPlex 7090', 'HP EliteDesk 800 G6', 'Lenovo ThinkCentre M70q'],
    Monitor: ['Dell P2419H 24"', 'LG UltraFine 24"', 'HP E24 G4'],
    Proyektor: ['Epson EB-X500', 'BenQ MH550'],
    Printer: ['HP LaserJet Pro M404dn', 'Canon imageCLASS MF244dw'],
    UPS: ['APC Smart-UPS 1500VA', 'Prolink PRO1201SFC']
  };

  function allocateIntegerSum(count, total, minVal, weights) {
    const raw = weights.map(w => w / weights.reduce((a, b) => a + b, 0) * total);
    const arr = raw.map(v => Math.max(minVal, Math.floor(v)));
    let diff = total - arr.reduce((a, b) => a + b, 0);
    let idx = 0;
    while (diff !== 0) {
      if (diff > 0) {
        arr[idx % count] += 1;
        diff -= 1;
      } else if (arr[idx % count] > minVal) {
        arr[idx % count] -= 1;
        diff += 1;
      }
      idx += 1;
    }
    return arr;
  }

  const specs = [
    {
      pathway: 'reuse',
      count: 30,
      totalWeight: 142,
      totalCo2: 5250,
      totalEcon: 186000000,
      categories: ['Laptop', 'Laptop', 'Monitor', 'Desktop', 'Laptop', 'Monitor'],
      statuses: ['Aktif Dialokasi Ulang', 'Siap Penyerahan Unit Internal', 'Uji Fungsi Lulus & Data Wiped'],
      hitlIndices: [4] // 1 item masih butuh verifikasi HITL operator
    },
    {
      pathway: 'repair',
      count: 24,
      totalWeight: 128,
      totalCo2: 3620,
      totalEcon: 94500000,
      categories: ['Laptop', 'Desktop', 'Proyektor', 'Monitor', 'Printer', 'Laptop'],
      statuses: ['Dalam Perbaikan Teknisi', 'Menunggu Suku Cadang Aman', 'Uji Fungsi Pasca Servis'],
      hitlIndices: [2, 11] // 2 item butuh verifikasi HITL (biaya vs ganti)
    },
    {
      pathway: 'donate',
      count: 18,
      totalWeight: 86,
      totalCo2: 2980,
      totalEcon: 63000000,
      categories: ['Laptop', 'Monitor', 'Desktop', 'Laptop'],
      statuses: ['BAST Hibah Selesai', 'Data Wiped — Siap Kirim Mitra', 'Alokasi SMKN 2 / SMP Harapan'],
      hitlIndices: []
    },
    {
      pathway: 'recycle',
      count: 22,
      totalWeight: 145,
      totalCo2: 1160,
      totalEcon: 14200000,
      categories: ['Printer', 'Desktop', 'Monitor', 'Proyektor', 'Laptop'],
      statuses: ['Tercatat di Manifest Pengolah', 'Menunggu Penjemputan Berizin', 'Selesai Daur Ulang Material'],
      hitlIndices: [5] // 1 item masih butuh tinjauan HITL (apakah masih bisa repair atau recycle)
    },
    {
      pathway: 'hazmat',
      count: 6,
      totalWeight: 44,
      totalCo2: 210,
      totalEcon: 0,
      categories: ['UPS', 'Laptop', 'UPS', 'Laptop', 'UPS', 'Laptop'],
      statuses: ['Karantina Drum Isolasi K3', 'Terjadwal Jemput PT Baterai Aman'],
      hitlIndices: []
    }
  ];

  const assets = [];
  let seq = 1;

  specs.forEach(group => {
    const weightsPattern = Array.from({ length: group.count }, (_, i) => ((i % 4) + 2));
    const kgList = allocateIntegerSum(group.count, group.totalWeight, 2, weightsPattern);
    const co2List = allocateIntegerSum(group.count, group.totalCo2, 15, weightsPattern);
    const econStep = group.totalEcon > 0 ? 100000 : 0;
    const econUnits = group.totalEcon > 0
      ? allocateIntegerSum(group.count, Math.round(group.totalEcon / econStep), 1, weightsPattern)
      : Array(group.count).fill(0);

    for (let i = 0; i < group.count; i++) {
      const cat = group.categories[i % group.categories.length];
      const models = modelsByCategory[cat];
      const model = models[i % models.length];
      const isHitlPending = group.hitlIndices.includes(i);
      const isHazmat = group.pathway === 'hazmat';

      const confidence = isHitlPending
        ? Number((0.61 + (i % 3) * 0.06).toFixed(2))
        : Number((0.87 + ((i * 3) % 11) * 0.01).toFixed(2));

      const batteryHazardScore = isHazmat
        ? Number((0.78 + (i % 3) * 0.06).toFixed(2))
        : Number((0.04 + (i % 5) * 0.03).toFixed(2));

      const tag = `AST-2026-${String(seq).padStart(3, '0')}`;
      const yearAcquired = 2019 + (seq % 5);
      const needsDataWipe = ['Laptop', 'Desktop'].includes(cat);
      const dataWipeDone = !needsDataWipe || ['reuse', 'donate', 'recycle'].includes(group.pathway);

      assets.push({
        id: tag,
        qrTag: `QR-${tag}`,
        serialNumber: `SN-${cat.slice(0, 3).toUpperCase()}-${10420 + seq * 17}`,
        category: cat,
        modelName: model,
        unitOwner: units[seq % units.length],
        yearAcquired,
        weightKg: kgList[i],
        pathway: group.pathway,
        workflowStatus: isHitlPending
          ? 'Menunggu Verifikasi Operator (HITL)'
          : group.statuses[i % group.statuses.length],
        aiConfidence: confidence,
        batteryHazardScore,
        hazardLocked: isHazmat,
        hitlStatus: isHitlPending ? 'pending' : 'verified',
        verifiedBy: isHitlPending ? null : (isHazmat ? 'Ir. Ratna Sari, M.K3' : 'Budi Santoso (Operator)'),
        dataWipeStatus: isHazmat
          ? 'Dilarang Dioperasikan (Hazmat)'
          : (dataWipeDone ? 'Terverifikasi NIST SP 800-88' : 'Menunggu Uji Teknisi'),
        dataWipeCertNo: (!isHazmat && dataWipeDone && needsDataWipe)
          ? `WIPE-2026-${String(seq).padStart(4, '0')}`
          : null,
        co2eSavedKg: co2List[i],
        economicValueIdr: econUnits[i] * econStep,
        repairCostIdr: group.pathway === 'repair' ? (650000 + (i % 4) * 200000) : 0,
        lastUpdated: `2026-11-${String(1 + (seq % 11)).padStart(2, '0')}`,
        notes: isHazmat
          ? 'Indikasi fisik baterai menggembung/panas. Terkunci dari pembongkaran mandiri; isolasi sesuai prosedur K3.'
          : isHitlPending
            ? 'Skor keyakinan CV di bawah 0,85 akibat pencahayaan/kondisi ambigu. Menunggu tinjauan langsung operator.'
            : 'Telah melewati pra-skrining visual awal dan konfirmasi petugas berwenang.'
      });

      seq += 1;
    }
  });

  return assets;
}

const MONTHLY_TREND_DATA = [
  { month: 'Jun', reuse: 4, repair: 3, donate: 2, recycle: 3, hazmat: 1 },
  { month: 'Jul', reuse: 5, repair: 4, donate: 3, recycle: 4, hazmat: 1 },
  { month: 'Agu', reuse: 4, repair: 4, donate: 2, recycle: 3, hazmat: 1 },
  { month: 'Sep', reuse: 6, repair: 4, donate: 4, recycle: 4, hazmat: 1 },
  { month: 'Okt', reuse: 6, repair: 5, donate: 4, recycle: 5, hazmat: 1 },
  { month: 'Nov', reuse: 5, repair: 4, donate: 3, recycle: 3, hazmat: 1 }
];

