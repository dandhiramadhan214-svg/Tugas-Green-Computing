-- Skema Basis Data Relasional SirkulAset (PostgreSQL DDL)
-- Mengacu pada Bab 7 ERD pada docs/Laporan_Rancangan_Sistem_SirkulAset.md
-- Mencakup 12 entitas utama beserta constraint keselamatan baterai K3 & Responsible AI (HITL)

CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    nama_lengkap VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(40) NOT NULL CHECK (role IN (
        'manager', 'operator', 'technician', 'k3', 'donation_partner', 'licensed_recycler'
    )),
    unit_kerja VARCHAR(120) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE assets (
    asset_id UUID PRIMARY KEY,
    qr_tag VARCHAR(64) UNIQUE NOT NULL,
    serial_number VARCHAR(100) NOT NULL,
    kategori VARCHAR(60) NOT NULL,
    merek_model VARCHAR(150) NOT NULL,
    tahun_perolehan INT NOT NULL CHECK (tahun_perolehan >= 2000),
    harga_perolehan_idr NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (harga_perolehan_idr >= 0),
    berat_kg NUMERIC(8, 2) NOT NULL CHECK (berat_kg > 0),
    unit_pemilik VARCHAR(120) NOT NULL,
    status_siklus VARCHAR(32) NOT NULL CHECK (status_siklus IN (
        'active', 'reuse', 'repair', 'donate', 'recycle', 'hazmat'
    ))
);

CREATE TABLE ai_inspections (
    inspection_id UUID PRIMARY KEY,
    asset_id UUID NOT NULL REFERENCES assets(asset_id),
    operator_id UUID NOT NULL REFERENCES users(user_id),
    image_url TEXT NOT NULL,
    predicted_condition VARCHAR(160) NOT NULL,
    confidence_score NUMERIC(4, 3) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    battery_hazard_score NUMERIC(4, 3) NOT NULL CHECK (battery_hazard_score >= 0 AND battery_hazard_score <= 1),
    hazard_lock_triggered BOOLEAN NOT NULL DEFAULT FALSE,
    hitl_required BOOLEAN NOT NULL DEFAULT TRUE,
    hitl_status VARCHAR(24) NOT NULL CHECK (hitl_status IN ('pending', 'verified', 'escalated_k3')),
    verified_by UUID REFERENCES users(user_id),
    final_visual_label VARCHAR(160),
    correction_reason TEXT,
    -- Mewajibkan persetujuan bahwa CV hanya identifikasi visual awal (bukan sertifikasi internal)
    disclaimer_acknowledged BOOLEAN NOT NULL CHECK (disclaimer_acknowledged = TRUE),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Aturan keras: keyakinan < 0.85 atau bahaya >= 0.35 wajib memicu HITL atau kunci K3
    CONSTRAINT chk_responsible_ai_gate CHECK (
        (confidence_score >= 0.85 AND battery_hazard_score < 0.35)
        OR hitl_required = TRUE
        OR hazard_lock_triggered = TRUE
    )
);

CREATE TABLE circular_routing_events (
    event_id UUID PRIMARY KEY,
    asset_id UUID NOT NULL REFERENCES assets(asset_id),
    inspection_id UUID REFERENCES ai_inspections(inspection_id),
    recommended_pathway VARCHAR(24) NOT NULL CHECK (recommended_pathway IN ('reuse', 'repair', 'donate', 'recycle', 'hazmat')),
    final_pathway VARCHAR(24) NOT NULL CHECK (final_pathway IN ('reuse', 'repair', 'donate', 'recycle', 'hazmat')),
    approved_by UUID NOT NULL REFERENCES users(user_id),
    workflow_status VARCHAR(120) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE repair_tickets (
    ticket_id UUID PRIMARY KEY,
    asset_id UUID NOT NULL REFERENCES assets(asset_id),
    technician_id UUID NOT NULL REFERENCES users(user_id),
    temuan_internal TEXT NOT NULL,
    tindakan_perbaikan TEXT,
    biaya_perbaikan_idr NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (biaya_perbaikan_idr >= 0),
    data_wipe_cert_no VARCHAR(100),
    lolos_uji_fungsi BOOLEAN NOT NULL DEFAULT FALSE,
    status_ticket VARCHAR(40) NOT NULL CHECK (status_ticket IN (
        'open', 'in_progress', 'passed', 'failed_to_recycle', 'blocked_hazmat'
    ))
);

CREATE TABLE donation_recipients (
    recipient_id UUID PRIMARY KEY,
    nama_lembaga VARCHAR(180) NOT NULL,
    jenis_lembaga VARCHAR(80) NOT NULL,
    alamat TEXT NOT NULL,
    status_verifikasi VARCHAR(40) NOT NULL CHECK (status_verifikasi IN ('verified', 'pending', 'suspended'))
);

CREATE TABLE donation_records (
    donation_id UUID PRIMARY KEY,
    asset_id UUID NOT NULL UNIQUE REFERENCES assets(asset_id),
    recipient_id UUID NOT NULL REFERENCES donation_recipients(recipient_id),
    -- Data wiping NIST SP 800-88 wajib ada sebelum hibah
    data_wipe_cert_no VARCHAR(100) NOT NULL,
    bast_doc_url TEXT NOT NULL,
    tanggal_serah DATE NOT NULL
);

CREATE TABLE licensed_recyclers (
    recycler_id UUID PRIMARY KEY,
    nama_perusahaan VARCHAR(180) NOT NULL,
    nomor_izin_b3 VARCHAR(100) UNIQUE NOT NULL,
    masa_berlaku_izin DATE NOT NULL,
    wilayah_layanan VARCHAR(120) NOT NULL
);

CREATE TABLE ewaste_manifests (
    manifest_id UUID PRIMARY KEY,
    recycler_id UUID NOT NULL REFERENCES licensed_recyclers(recycler_id),
    officer_k3_id UUID NOT NULL REFERENCES users(user_id),
    total_berat_kg NUMERIC(10, 2) NOT NULL CHECK (total_berat_kg > 0),
    contains_hazmat_battery BOOLEAN NOT NULL DEFAULT FALSE,
    tanggal_angkut DATE NOT NULL,
    manifest_doc_url TEXT NOT NULL,
    recycling_cert_url TEXT,
    status_manifest VARCHAR(40) NOT NULL CHECK (status_manifest IN (
        'scheduled', 'in_transit', 'processing', 'certified_completed'
    ))
);

CREATE TABLE manifest_items (
    manifest_item_id UUID PRIMARY KEY,
    manifest_id UUID NOT NULL REFERENCES ewaste_manifests(manifest_id),
    asset_id UUID NOT NULL UNIQUE REFERENCES assets(asset_id),
    kategori_limbah VARCHAR(80) NOT NULL,
    berat_kg NUMERIC(8, 2) NOT NULL CHECK (berat_kg > 0)
);

CREATE TABLE sustainability_metrics (
    metric_id UUID PRIMARY KEY,
    asset_id UUID NOT NULL REFERENCES assets(asset_id),
    pathway VARCHAR(24) NOT NULL CHECK (pathway IN ('reuse', 'repair', 'donate', 'recycle', 'hazmat')),
    waste_diverted_kg NUMERIC(8, 2) NOT NULL CHECK (waste_diverted_kg >= 0),
    co2e_avoided_kg NUMERIC(10, 2) NOT NULL CHECK (co2e_avoided_kg >= 0),
    cost_avoidance_idr NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (cost_avoidance_idr >= 0),
    material_recovery_idr NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (material_recovery_idr >= 0),
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY,
    actor_id UUID NOT NULL REFERENCES users(user_id),
    entity_name VARCHAR(80) NOT NULL,
    entity_id UUID NOT NULL,
    action_type VARCHAR(60) NOT NULL,
    summary TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assets_status_siklus ON assets(status_siklus);
CREATE INDEX idx_ai_inspections_hitl ON ai_inspections(hitl_status, hazard_lock_triggered);
CREATE INDEX idx_manifests_status ON ewaste_manifests(status_manifest);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_name, entity_id);

