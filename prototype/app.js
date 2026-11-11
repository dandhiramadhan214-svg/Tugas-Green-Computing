(function () {
  'use strict';

  /* ================== SVG ICON LIBRARY ================== */
  const SVG_ICONS = {
    package: '<svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>',
    recycle: '<svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 7.196 9.5 3.1 10.598"/><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843"/><path d="m13.378 9.633 4.096 1.098 1.097-4.096"/></svg>',
    leaf: '<svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
    coins: '<svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>',
    shield: '<svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
    alertTriangle: '<svg class="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    lock: '<svg class="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    check: '<svg class="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    ban: '<svg class="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>',
    chevronLeft: '<svg class="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
    chevronRight: '<svg class="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>'
  };

  function getApiBase() {
    if (typeof window !== 'undefined' && window.location && window.location.protocol && window.location.protocol.startsWith('http')) {
      return '';
    }
    return 'http://127.0.0.1:8000';
  }

  const state = {
    assets: buildInitialAssets(),
    manifests: INITIAL_MANIFESTS.map(m => ({ ...m })),
    activeView: 'overview',
    activeRole: 'manager',
    activePathwayTab: 'reuse',
    overviewPage: 1,
    overviewPageSize: 8,
    overviewSearch: '',
    overviewPathwayFilter: 'all',
    overviewHitlFilter: 'all',
    activeScenarioId: AI_TEST_SCENARIOS[0].id,
    customPhotoUrl: null,
    customPhotoName: null,
    customPrediction: null,
    isPredicting: false,
    predictionError: null,
    showGradCam: false,
    cvBackend: { checking: true, online: false, meta: null },
    manualHazardFlag: false,
    simReusePct: 30,
    simRepairPct: 24,
    simDonatePct: 18
  };

  const VIEW_TITLES = {
    overview: {
      title: 'Ringkasan Eksekutif Ekonomi Sirkular',
      subtitle: 'Gambaran menyeluruh aset & limbah elektronik institusi (Reuse, Repair, Donate, Recycle, & K3)'
    },
    pathways: {
      title: 'Pemantauan 4 Jalur Sirkular & Karantina K3',
      subtitle: 'Pelacakan status operasional, sanitasi data, dan paspor produk per perangkat'
    },
    'ai-triage': {
      title: 'Pra-Skrining Visual AI & Antrean HITL',
      subtitle: 'Identifikasi visual awal berbasis Computer Vision dengan Confidence Gate (< 85%) & Pengaman Baterai'
    },
    custody: {
      title: 'Rantai Pengawasan (Chain of Custody) & Mitra',
      subtitle: 'Validasi mitra donasi, sertifikasi izin pengolah daur ulang B3, dan manifest pengangkutan'
    },
    sustainability: {
      title: 'Analisis Dampak Keberlanjutan & Ekonomi',
      subtitle: 'Indikator pengurangan limbah, emisi karbon dihindari (CO2e), dan efisiensi CapEx institusi'
    }
  };

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatIdr(amount) {
    return 'Rp ' + Number(amount || 0).toLocaleString('id-ID');
  }

  function formatNumber(num) {
    return Number(num || 0).toLocaleString('id-ID');
  }

  function showToast(msg) {
    const el = document.getElementById('toast-box');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      el.classList.remove('show');
    }, 3400);
  }

  function computeMetrics() {
    const byPathway = {
      reuse: { count: 0, weight: 0, co2: 0, econ: 0 },
      repair: { count: 0, weight: 0, co2: 0, econ: 0 },
      donate: { count: 0, weight: 0, co2: 0, econ: 0 },
      recycle: { count: 0, weight: 0, co2: 0, econ: 0 },
      hazmat: { count: 0, weight: 0, co2: 0, econ: 0 }
    };

    let totalWeight = 0;
    let totalCo2 = 0;
    let totalEcon = 0;
    let pendingHitl = 0;

    state.assets.forEach(a => {
      const bucket = byPathway[a.pathway];
      if (bucket) {
        bucket.count += 1;
        bucket.weight += a.weightKg;
        bucket.co2 += a.co2eSavedKg;
        bucket.econ += a.economicValueIdr;
      }
      totalWeight += a.weightKg;
      totalCo2 += a.co2eSavedKg;
      totalEcon += a.economicValueIdr;
      if (a.hitlStatus === 'pending') pendingHitl += 1;
    });

    const circularWeight = totalWeight - byPathway.hazmat.weight;
    const circularityRate = totalWeight > 0 ? ((circularWeight / totalWeight) * 100).toFixed(1) : '0.0';
    const lifeExtensionUnits = byPathway.reuse.count + byPathway.repair.count + byPathway.donate.count;

    return {
      totalUnits: state.assets.length,
      totalWeight,
      totalCo2,
      totalEcon,
      pendingHitl,
      hazmatCount: byPathway.hazmat.count,
      circularityRate,
      lifeExtensionUnits,
      byPathway
    };
  }

  function switchView(viewId) {
    state.activeView = viewId;
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewId);
    });
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.toggle('active', sec.id === 'view-' + viewId);
    });

    const meta = VIEW_TITLES[viewId] || VIEW_TITLES.overview;
    document.getElementById('topbar-title').textContent = meta.title;
    document.getElementById('topbar-subtitle').textContent = meta.subtitle;

    // Close mobile sidebar if open
    document.getElementById('sidebar').classList.remove('mobile-open');
    renderActiveView();
  }

  function renderGlobalBadges() {
    const m = computeMetrics();
    const roleCfg = ROLES_CONFIG[state.activeRole];
    document.getElementById('nav-total-pill').textContent = m.totalUnits;
    document.getElementById('nav-hitl-pill').textContent = m.pendingHitl;
    document.getElementById('chip-hitl-count').textContent = m.pendingHitl;
    document.getElementById('chip-hazmat-count').textContent = m.hazmatCount;
    document.getElementById('topbar-role-badge').textContent = 'Peran: ' + roleCfg.name.split(' (')[0];
    document.getElementById('role-hint-text').textContent = roleCfg.hint;
  }

  function getPathwayBadge(pathway) {
    const meta = PATHWAY_META[pathway];
    return `<span class="badge badge-${escapeHtml(pathway)}">${escapeHtml(meta.shortLabel)}</span>`;
  }

  /* ================== VIEW 1: OVERVIEW ================== */
  function renderOverview() {
    const m = computeMetrics();
    const kpiGrid = document.getElementById('overview-kpi-grid');
    kpiGrid.innerHTML = `
      <div class="kpi-card">
        <div class="kpi-label">Total Aset Terpantau <span class="kpi-icon">${SVG_ICONS.package}</span></div>
        <div class="kpi-value">${formatNumber(m.totalUnits)} <span style="font-size:0.9rem;font-weight:500;color:var(--text-muted)">unit</span></div>
        <div class="kpi-foot">${formatNumber(m.totalWeight)} kg massa perangkat terdata</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Tingkat Sirkularitas <span class="kpi-icon" style="color:var(--reuse)">${SVG_ICONS.recycle}</span></div>
        <div class="kpi-value" style="color:var(--reuse)">${m.circularityRate}%</div>
        <div class="kpi-foot">${m.lifeExtensionUnits} unit diperpanjang masa pakainya (Reuse/Repair/Donate)</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Emisi Dihindari (CO2e) <span class="kpi-icon" style="color:var(--reuse)">${SVG_ICONS.leaf}</span></div>
        <div class="kpi-value">${formatNumber(m.totalCo2)} <span style="font-size:0.9rem;font-weight:500;color:var(--text-muted)">kg</span></div>
        <div class="kpi-foot">Setara ${(m.totalCo2 / 1000).toFixed(2)} ton CO2e embodied carbon</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Nilai Ekonomi &amp; CapEx <span class="kpi-icon" style="color:var(--repair)">${SVG_ICONS.coins}</span></div>
        <div class="kpi-value" style="font-size:1.38rem">${formatIdr(m.totalEcon)}</div>
        <div class="kpi-foot">Penghematan pengadaan &amp; pemulihan material</div>
      </div>
      <div class="kpi-card alert-card">
        <div class="kpi-label">Kontrol Keselamatan &amp; HITL <span class="kpi-icon" style="color:var(--hazmat)">${SVG_ICONS.shield}</span></div>
        <div class="kpi-value" style="color:var(--hazmat)">${m.hazmatCount} <span style="font-size:0.92rem;color:var(--text-primary)">K3</span> · <span style="color:var(--hitl)">${m.pendingHitl}</span> <span style="font-size:0.92rem;color:var(--text-primary)">HITL</span></div>
        <div class="kpi-foot">Karantina baterai terkunci &amp; antrean verifikasi operator</div>
      </div>
    `;

    document.getElementById('overview-circularity-badge').textContent = `${m.circularityRate}% Bobot Sirkular`;
    renderDonutChart(m);
    renderTrendChart();
    renderOverviewTable();
  }

  function renderDonutChart(m) {
    const container = document.getElementById('overview-donut-container');
    const orderedKeys = ['reuse', 'repair', 'donate', 'recycle', 'hazmat'];
    const radius = 64;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    const segments = orderedKeys.map(key => {
      const count = m.byPathway[key].count;
      const pct = m.totalUnits > 0 ? count / m.totalUnits : 0;
      const dash = pct * circumference;
      const seg = `<circle cx="90" cy="90" r="${radius}" fill="transparent" stroke="${PATHWAY_META[key].color}" stroke-width="24" stroke-dasharray="${dash.toFixed(2)} ${circumference.toFixed(2)}" stroke-dashoffset="-${offset.toFixed(2)}" />`;
      offset += dash;
      return seg;
    }).join('');

    const legendRows = orderedKeys.map(key => {
      const item = m.byPathway[key];
      const pctStr = m.totalUnits > 0 ? ((item.count / m.totalUnits) * 100).toFixed(0) : 0;
      return `
        <div>
          <div class="legend-row">
            <span class="legend-dot" style="background:${PATHWAY_META[key].color}"></span>
            <span><strong>${PATHWAY_META[key].shortLabel}</strong> (${item.weight} kg)</span>
            <span class="mono">${item.count} unit (${pctStr}%)</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width:${pctStr}%; background:${PATHWAY_META[key].color}"></div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <svg width="180" height="180" viewBox="0 0 180 180" role="img" aria-label="Diagram Donat Distribusi Jalur Sirkular">
        <g transform="rotate(-90 90 90)">${segments}</g>
        <text x="90" y="85" text-anchor="middle" font-size="22" font-weight="700" fill="#111c17">${m.totalUnits}</text>
        <text x="90" y="105" text-anchor="middle" font-size="11" fill="#6c7d74">Total Unit</text>
      </svg>
      <div class="pathway-legend">${legendRows}</div>
    `;
  }

  function renderTrendChart() {
    const container = document.getElementById('overview-trend-chart');
    const maxTotal = Math.max(...MONTHLY_TREND_DATA.map(d => d.reuse + d.repair + d.donate + d.recycle + d.hazmat));
    const keys = ['reuse', 'repair', 'donate', 'recycle', 'hazmat'];

    const chartW = 460;
    const chartH = 195;
    const barW = 36;
    const gap = 32;
    const baseLineY = 162;
    const usableH = 132;

    const barsSvg = MONTHLY_TREND_DATA.map((d, idx) => {
      const x = 34 + idx * (barW + gap);
      let currentY = baseLineY;
      const rects = keys.map(k => {
        const val = d[k];
        const h = (val / maxTotal) * usableH;
        currentY -= h;
        return `<rect x="${x}" y="${currentY.toFixed(1)}" width="${barW}" height="${h.toFixed(1)}" fill="${PATHWAY_META[k].color}" rx="2"><title>${d.month} - ${PATHWAY_META[k].shortLabel}: ${val} unit</title></rect>`;
      }).join('');
      const total = keys.reduce((acc, k) => acc + d[k], 0);
      return `
        ${rects}
        <text x="${x + barW / 2}" y="${(currentY - 5).toFixed(1)}" text-anchor="middle" font-size="10.5" font-weight="600" fill="#334155">${total}</text>
        <text x="${x + barW / 2}" y="${baseLineY + 16}" text-anchor="middle" font-size="11" fill="#64748b">${d.month}</text>
      `;
    }).join('');

    container.innerHTML = `
      <svg viewBox="0 0 ${chartW} ${chartH}" style="width:100%; height:auto; display:block;" role="img" aria-label="Grafik Batang Bertumpuk Tren 6 Bulan">
        <line x1="20" y1="${baseLineY}" x2="${chartW - 15}" y2="${baseLineY}" stroke="#cbd5e1" stroke-width="1"/>
        ${barsSvg}
      </svg>
      <div style="display:flex; flex-wrap:wrap; gap:12px; font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">
        ${keys.map(k => `<span style="display:inline-flex;align-items:center;gap:5px;"><span class="legend-dot" style="background:${PATHWAY_META[k].color}"></span>${PATHWAY_META[k].shortLabel}</span>`).join('')}
      </div>
    `;
  }

  function getFilteredOverviewAssets() {
    const q = state.overviewSearch.trim().toLowerCase();
    return state.assets.filter(a => {
      if (state.overviewPathwayFilter !== 'all' && a.pathway !== state.overviewPathwayFilter) return false;
      if (state.overviewHitlFilter !== 'all' && a.hitlStatus !== state.overviewHitlFilter) return false;
      if (!q) return true;
      return (
        a.id.toLowerCase().includes(q) ||
        a.modelName.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.unitOwner.toLowerCase().includes(q) ||
        a.workflowStatus.toLowerCase().includes(q)
      );
    });
  }

  function renderOverviewTable() {
    const filtered = getFilteredOverviewAssets();
    const totalPages = Math.max(1, Math.ceil(filtered.length / state.overviewPageSize));
    if (state.overviewPage > totalPages) state.overviewPage = totalPages;

    const start = (state.overviewPage - 1) * state.overviewPageSize;
    const rows = filtered.slice(start, start + state.overviewPageSize);

    const tbody = document.getElementById('overview-table-body');
    if (rows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:24px; color:var(--text-muted);">Tidak ada aset yang cocok dengan filter pencarian.</td></tr>`;
    } else {
      tbody.innerHTML = rows.map(a => {
        const confPct = Math.round(a.aiConfidence * 100);
        const hitlBadge = a.hitlStatus === 'pending'
          ? `<span class="badge badge-hitl">${SVG_ICONS.alertTriangle} Butuh Tinjauan HITL</span>`
          : (a.hazardLocked ? `<span class="badge badge-hazmat">${SVG_ICONS.lock} Terkunci K3</span>` : `<span style="font-size:0.79rem;color:var(--text-secondary)">${escapeHtml(a.workflowStatus)}</span>`);
        return `
          <tr>
            <td class="mono" style="font-weight:600;">${escapeHtml(a.id)}</td>
            <td>
              <div style="font-weight:600;">${escapeHtml(a.modelName)}</div>
              <div style="font-size:0.74rem;color:var(--text-muted);">${escapeHtml(a.category)} • Thn ${a.yearAcquired}</div>
            </td>
            <td>${escapeHtml(a.unitOwner)}</td>
            <td class="mono">${a.weightKg} kg</td>
            <td>${getPathwayBadge(a.pathway)}</td>
            <td class="mono">${confPct}%</td>
            <td>${hitlBadge}</td>
            <td><button class="btn btn-sm" data-open-asset="${escapeHtml(a.id)}">Paspor Digital</button></td>
          </tr>
        `;
      }).join('');
    }

    document.getElementById('overview-pagination').innerHTML = `
      <span>Menampilkan ${rows.length ? start + 1 : 0}–${start + rows.length} dari ${filtered.length} aset</span>
      <div style="display:flex; gap:6px;">
        <button class="btn btn-sm" id="pg-prev" ${state.overviewPage <= 1 ? 'disabled' : ''}>${SVG_ICONS.chevronLeft} Sebelumnya</button>
        <span style="padding:4px 8px;">Hal ${state.overviewPage} / ${totalPages}</span>
        <button class="btn btn-sm" id="pg-next" ${state.overviewPage >= totalPages ? 'disabled' : ''}>Berikutnya ${SVG_ICONS.chevronRight}</button>
      </div>
    `;

    document.getElementById('pg-prev').onclick = () => {
      if (state.overviewPage > 1) {
        state.overviewPage -= 1;
        renderOverviewTable();
      }
    };
    document.getElementById('pg-next').onclick = () => {
      if (state.overviewPage < totalPages) {
        state.overviewPage += 1;
        renderOverviewTable();
      }
    };
  }

  /* ================== VIEW 2: PATHWAYS BOARD ================== */
  function renderPathwaysView() {
    const m = computeMetrics();
    const tabsEl = document.getElementById('pathway-tabs');
    const keys = ['reuse', 'repair', 'donate', 'recycle', 'hazmat'];

    tabsEl.innerHTML = keys.map(k => {
      const meta = PATHWAY_META[k];
      const activeClass = state.activePathwayTab === k ? 'active' : '';
      return `
        <button class="pathway-tab-btn ${activeClass}" data-pathway-tab="${k}">
          <span class="legend-dot" style="background:${meta.color}"></span>
          ${meta.shortLabel}
          <span class="mono" style="opacity:0.8">(${m.byPathway[k].count})</span>
        </button>
      `;
    }).join('');

    const activeMeta = PATHWAY_META[state.activePathwayTab];
    const banner = document.getElementById('pathway-description-banner');
    if (state.activePathwayTab === 'hazmat') {
      banner.className = 'safety-lock-box';
      banner.innerHTML = `<h4 class="icon-heading">${SVG_ICONS.lock} Protokol Keselamatan K3 &amp; Baterai Aktif</h4>${escapeHtml(activeMeta.description)} Pengoperasian, pembukaan casing, dan perbaikan mandiri <strong>diblokir untuk seluruh peran non-K3</strong>.`;
    } else {
      banner.className = 'disclaimer-box';
      banner.innerHTML = `<strong>${escapeHtml(activeMeta.label)}:</strong> ${escapeHtml(activeMeta.description)}`;
    }

    const items = state.assets.filter(a => a.pathway === state.activePathwayTab);
    const grid = document.getElementById('pathway-cards-grid');

    grid.innerHTML = items.map(a => {
      const cardClass = a.hazardLocked ? 'asset-card hazmat-card' : 'asset-card';
      return `
        <article class="${cardClass}">
          <div class="asset-card-head">
            <div>
              <span class="mono" style="font-size:0.74rem; color:var(--text-muted);">${escapeHtml(a.id)} • ${escapeHtml(a.category)}</span>
              <h4 class="asset-card-title">${escapeHtml(a.modelName)}</h4>
            </div>
            ${getPathwayBadge(a.pathway)}
          </div>
          <div class="asset-card-meta">Unit Asal: <strong>${escapeHtml(a.unitOwner)}</strong></div>
          <div class="asset-card-meta">Status: ${escapeHtml(a.workflowStatus)}</div>
          <div class="asset-card-meta">Sanitasi Data: <strong>${escapeHtml(a.dataWipeStatus)}</strong></div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px; padding-top:8px; border-top:1px solid #eef2ef; font-size:0.78rem;">
            <span class="mono">${a.weightKg} kg • ${a.co2eSavedKg} kg CO2e</span>
            <button class="btn btn-sm" data-open-asset="${escapeHtml(a.id)}">Kelola / Detail</button>
          </div>
        </article>
      `;
    }).join('');
  }

  /* ================== VIEW 3: AI TRIAGE & HITL ================== */
  async function checkCvBackend() {
    // Prioritas 1: Edge ONNX langsung di browser (jalan di Vercel & GitHub Pages tanpa server)
    if (typeof window !== 'undefined' && window.SirkulAsetEdgeCV) {
      const edgeStatus = await window.SirkulAsetEdgeCV.init();
      if (edgeStatus.ready) {
        state.cvBackend = {
          checking: false,
          online: true,
          mode: 'onnx-browser',
          meta: edgeStatus.meta
        };
        updateCvBackendBadge();
        return;
      }
    }

    // Prioritas 2: Fallback ke server FastAPI lokal (mode offline/lokal)
    if (typeof fetch !== 'function') {
      state.cvBackend = { checking: false, online: false, mode: 'offline', meta: null };
      updateCvBackendBadge();
      return;
    }
    try {
      const res = await fetch(`${getApiBase()}/api/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      state.cvBackend = {
        checking: false,
        online: Boolean(data.modelLoaded),
        mode: 'fastapi',
        meta: data
      };
    } catch (_) {
      state.cvBackend = { checking: false, online: false, mode: 'offline', meta: null };
    }
    updateCvBackendBadge();
  }

  function updateCvBackendBadge() {
    const badge = document.getElementById('cv-backend-badge');
    if (!badge) return;
    if (state.cvBackend.checking) {
      badge.className = 'badge badge-neutral';
      badge.textContent = 'Memuat Model CV...';
    } else if (state.cvBackend.online && state.cvBackend.meta) {
      const acc = state.cvBackend.meta.testAccuracy != null
        ? ` • Akurasi Uji ${Math.round(state.cvBackend.meta.testAccuracy * 100)}%`
        : '';
      const modeLabel = state.cvBackend.mode === 'onnx-browser'
        ? `Edge AI Browser Aktif (ONNX${acc})`
        : `Server CV Lokal Aktif (MobileNetV3${acc})`;
      badge.className = 'badge badge-reuse';
      badge.innerHTML = `${SVG_ICONS.check} ${escapeHtml(modeLabel)}`;
    } else {
      badge.className = 'badge badge-neutral';
      badge.innerHTML = `${SVG_ICONS.alertTriangle} Mode Simulasi (CV Belum Aktif)`;
    }
  }

  async function analyzeUploadedPhoto(file) {
    state.isPredicting = true;
    state.predictionError = null;
    state.customPrediction = null;
    state.showGradCam = false;
    renderAiTriageView();

    // Jalur 1: Inferensi langsung di browser melalui Edge ONNX Runtime Web
    if (typeof window !== 'undefined' && window.SirkulAsetEdgeCV) {
      try {
        const edgeReady = await window.SirkulAsetEdgeCV.init();
        if (edgeReady.ready) {
          const pred = await window.SirkulAsetEdgeCV.predictFile(file);
          state.customPrediction = pred;
          state.cvBackend = { checking: false, online: true, mode: 'onnx-browser', meta: edgeReady.meta };
          state.isPredicting = false;
          renderAiTriageView();
          showToast(`Deteksi Edge CV selesai: ${pred.detectedClass} (${Math.round(pred.confidence * 100)}%)`);
          return;
        }
      } catch (edgeErr) {
        // Lanjut coba fallback ke API backend lokal jika ada
      }
    }

    // Jalur 2: Fallback ke server FastAPI lokal bila tersedia
    if (typeof fetch !== 'function' || typeof FormData === 'undefined') {
      state.isPredicting = false;
      state.predictionError = 'Lingkungan tidak mendukung inferensi API/ONNX.';
      renderAiTriageView();
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${getApiBase()}/api/predict`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error (${res.status})`);
      }
      const pred = await res.json();
      state.customPrediction = pred;
      state.cvBackend.online = true;
      state.cvBackend.mode = 'fastapi';
      state.isPredicting = false;
      renderAiTriageView();
      showToast(`Deteksi Server CV selesai: ${pred.detectedClass} (${Math.round(pred.confidence * 100)}%)`);
    } catch (err) {
      state.isPredicting = false;
      state.predictionError = 'Model Edge ONNX / server lokal belum aktif (buka via Vercel/GitHub Pages atau jalankan backend/server.py). Menampilkan simulasi fallback.';
      renderAiTriageView();
      showToast('Mode simulasi fallback — buka lewat server/hosting untuk deteksi CV nyata.');
    }
  }

  function getActiveScenario() {
    const base = AI_TEST_SCENARIOS.find(s => s.id === state.activeScenarioId) || AI_TEST_SCENARIOS[0];
    let copy;
    if (state.customPhotoUrl && state.customPrediction) {
      const p = state.customPrediction;
      copy = {
        id: 'custom-cv',
        assetTag: 'AST-CV-' + String(state.assets.length + 1).padStart(3, '0'),
        deviceType: `${p.deviceType} (${state.customPhotoName || 'Foto Unggahan'})`,
        category: p.category,
        ageYears: 3,
        repairCount: 0,
        visualSummary: p.visualSummary,
        predictedCondition: p.predictedCondition,
        recommendedPathway: p.recommendedPathway,
        confidence: p.confidence,
        rawConfidence: p.rawConfidence,
        batteryHazardScore: p.batteryHazardScore,
        estimatedWeightKg: p.estimatedWeightKg,
        topPredictions: p.topPredictions,
        quality: p.quality,
        gradcamUrl: p.gradcamUrl,
        inferenceMs: p.inferenceMs,
        visualDefectBoxes: [],
        xaiFactors: [...(p.xaiFactors || [])],
        isRealCv: true
      };
    } else {
      copy = { ...base, xaiFactors: [...base.xaiFactors], isRealCv: false };
      if (state.customPhotoUrl) {
        copy.deviceType = `Foto Unggahan Operator (${state.customPhotoName || 'Sampel Lokal'})`;
        copy.assetTag = 'AST-UPLOAD-' + String(state.assets.length + 1).padStart(3, '0');
      }
    }
    if (state.manualHazardFlag && copy.recommendedPathway !== 'hazmat') {
      copy.batteryHazardScore = Math.max(copy.batteryHazardScore, 0.85);
      copy.recommendedPathway = 'hazmat';
      copy.predictedCondition = 'ESKALASI MANUAL OPERATOR: Indikasi Panas / Bocor / Menggembung';
      copy.xaiFactors.unshift('Laporan langsung operator: terdeteksi indikasi panas/bocor/menggembung pada cek awal');
    }
    return copy;
  }

  function renderScenarioSvg(scen) {
    const isBatteryHazard = scen.recommendedPathway === 'hazmat';
    const isMonitor = scen.category === 'Monitor';
    const boxMarkup = scen.visualDefectBoxes.map(b => `
      <g>
        <rect x="${b.x * 3.6}" y="${b.y * 2.1}" width="${b.w * 3.6}" height="${b.h * 2.1}" fill="none" stroke="${b.color}" stroke-width="2.5" stroke-dasharray="6 3" rx="4"/>
        <rect x="${b.x * 3.6}" y="${Math.max(4, b.y * 2.1 - 20)}" width="${Math.min(340, b.label.length * 6.8 + 14)}" height="18" fill="${b.color}" rx="4"/>
        <text x="${b.x * 3.6 + 6}" y="${Math.max(16, b.y * 2.1 - 7)}" fill="#ffffff" font-size="10.5" font-weight="700">${escapeHtml(b.label)}</text>
      </g>
    `).join('');

    const deviceIllustration = isMonitor
      ? `
        <rect x="75" y="34" width="210" height="122" rx="6" fill="#1e293b" stroke="#64748b" stroke-width="3"/>
        <rect x="85" y="44" width="190" height="102" fill="#334155"/>
        <path d="M90 50 L150 50 L110 130 L85 130 Z" fill="rgba(255,255,255,0.12)"/>
        <rect x="165" y="156" width="30" height="22" fill="#475569"/>
        <rect x="135" y="178" width="90" height="8" rx="4" fill="#64748b"/>
      `
      : `
        <rect x="82" y="34" width="196" height="92" rx="6" fill="#1e293b" stroke="#64748b" stroke-width="2.5"/>
        <rect x="92" y="42" width="176" height="76" fill="#0f172a"/>
        <polygon points="82,126 278,126 300,174 60,174" fill="#334155" stroke="#64748b" stroke-width="2"/>
        ${isBatteryHazard
          ? `<ellipse cx="180" cy="154" rx="58" ry="12" fill="rgba(220,38,38,0.45)" stroke="#ef4444" stroke-width="2"/>
             <path d="M120 156 Q180 134 240 156" fill="none" stroke="#fca5a5" stroke-width="2.5"/>`
          : `<rect x="106" y="135" width="148" height="22" rx="2" fill="#1e293b"/>
             <rect x="155" y="160" width="50" height="10" rx="2" fill="#475569"/>`
        }
      `;

    return `
      <svg viewBox="0 0 360 210" style="width:100%; max-width:390px; height:auto;">
        ${deviceIllustration}
        ${boxMarkup}
      </svg>
    `;
  }

  function renderAiTriageView() {
    updateCvBackendBadge();

    const scenBtns = document.getElementById('ai-scenario-buttons');
    scenBtns.innerHTML = AI_TEST_SCENARIOS.map(s => `
      <button class="scenario-btn ${state.activeScenarioId === s.id && !state.customPhotoUrl ? 'active' : ''}" data-scenario-id="${s.id}">
        <div style="font-size:0.74rem; color:var(--text-muted); font-weight:600;">${escapeHtml(s.assetTag)} • ${escapeHtml(s.category)}</div>
        <div style="font-size:0.84rem; font-weight:700; margin-top:2px;">${escapeHtml(s.title)}</div>
      </button>
    `).join('');

    const scen = getActiveScenario();
    const previewBox = document.getElementById('vision-preview-box');
    const captionEl = document.getElementById('vision-caption');

    if (state.customPhotoUrl) {
      const displaySrc = (scen.isRealCv && state.showGradCam && scen.gradcamUrl)
        ? scen.gradcamUrl
        : state.customPhotoUrl;
      const statusNote = state.isPredicting
        ? '<div style="margin-top:8px; font-size:0.78rem; color:#fde68a; font-weight:600;">Menjalankan inferensi MobileNetV3-Large &amp; Grad-CAM...</div>'
        : scen.isRealCv
          ? `<div class="vision-controls">
               <div class="vision-toggle-group">
                 <button type="button" class="vision-toggle-btn ${!state.showGradCam ? 'active' : ''}" id="btn-view-orig">Foto Asli</button>
                 <button type="button" class="vision-toggle-btn ${state.showGradCam ? 'active' : ''}" id="btn-view-cam">Heatmap Grad-CAM</button>
               </div>
               <span class="mono" style="font-size:0.73rem; color:#93c5fd;">Inferensi CPU: ${scen.inferenceMs} ms</span>
             </div>`
          : `<div style="margin-top:8px; font-size:0.76rem; color:#fca5a5;">${escapeHtml(state.predictionError || 'Mode simulasi offline aktif pada foto unggahan.')}</div>`;

      previewBox.innerHTML = `
        <img src="${displaySrc}" alt="Pratinjau foto unggahan" class="vision-upload-preview" />
        ${statusNote}
      `;

      captionEl.textContent = scen.isRealCv
        ? `Deteksi Nyata (MobileNetV3-Large, T=${state.customPrediction.temperature.toFixed(2)}): Kelas '${state.customPrediction.detectedClass}' dari berkas ${state.customPhotoName}.`
        : 'Catatan: Jalankan backend/server.py untuk mengaktifkan klasifikasi MobileNetV3 & Grad-CAM nyata pada foto unggahan.';

      const origBtn = document.getElementById('btn-view-orig');
      const camBtn = document.getElementById('btn-view-cam');
      if (origBtn) origBtn.onclick = () => { state.showGradCam = false; renderAiTriageView(); };
      if (camBtn) camBtn.onclick = () => { state.showGradCam = true; renderAiTriageView(); };
    } else {
      previewBox.innerHTML = renderScenarioSvg(scen);
      captionEl.textContent = `Visualisasi Simulasi Bounding Box (YOLOv8n + MobileNetV3): ${scen.visualSummary}`;
    }

    const confPct = Math.round(scen.confidence * 100);
    const hazardPct = Math.round(scen.batteryHazardScore * 100);
    const isLowConf = scen.confidence < 0.85;
    const isHazard = scen.batteryHazardScore >= 0.35 || scen.recommendedPathway === 'hazmat';

    let gateBox = '';
    if (isHazard) {
      gateBox = `
        <div class="safety-lock-box">
          <h4 class="icon-heading">${SVG_ICONS.ban} PROTOKOL KESELAMATAN BATERAI / K3 TERPICU</h4>
          <p style="margin:0 0 8px;">Skor risiko baterai (<strong>${hazardPct}%</strong>) melewati batas aman (35%). Baterai yang rusak, menggembung, bocor, atau panas <strong>tidak boleh ditangani dengan membongkar secara mandiri</strong>.</p>
          <ul style="margin:0; padding-left:18px;">
            <li>Tombol pengiriman ke jalur <em>Repair/Reuse/Donate</em> dikunci otomatis.</li>
            <li>Isolasi perangkat pada wadah tahan api berventilasi sesuai SOP K3.</li>
            <li>Serahkan kepada petugas K3 &amp; pengolah B3 kompeten berizin.</li>
          </ul>
        </div>
      `;
    } else if (isLowConf) {
      gateBox = `
        <div class="disclaimer-box" style="background:var(--hitl-bg); border-color:var(--hitl-border); border-left-color:var(--hitl); color:#7c2d12;">
          <strong class="icon-heading">${SVG_ICONS.alertTriangle} CONFIDENCE GATE AKTIF (Keyakinan ${confPct}% &lt; 85%):</strong><br />
          Prediksi AI memiliki tingkat keyakinan rendah. Keputusan penting tidak diizinkan otomatis penuh dan <strong>wajib ditinjau operator</strong> pada antrean HITL.
        </div>
      `;
    } else {
      gateBox = `
        <div class="disclaimer-box" style="background:var(--reuse-bg); border-color:var(--reuse-border); border-left-color:var(--reuse); color:#064e3b;">
          <strong class="icon-heading">${SVG_ICONS.check} Lolos Confidence Gate (${confPct}% ≥ 85%) &amp; Aman Secara Visual:</strong><br />
          Rekomendasi jalur siap dikonfirmasi operator. Teknisi tetap wajib melakukan <strong>uji fungsi internal &amp; kelistrikan</strong> sebelum perangkat dipakai ulang atau didonasikan.
        </div>
      `;
    }

    const topKMarkup = (scen.isRealCv && Array.isArray(scen.topPredictions))
      ? `
        <div class="topk-box">
          <div style="font-size:0.76rem; font-weight:700; color:var(--text-secondary);">Top-3 Prediksi Kelas (Probabilitas Terkalibrasi):</div>
          ${scen.topPredictions.map(tp => `
            <div class="topk-row">
              <div><strong>${escapeHtml(tp.className)}</strong> <span style="color:var(--text-muted); font-size:0.73rem;">(${escapeHtml(tp.categoryId)})</span></div>
              <span class="mono" style="font-weight:700;">${tp.confidencePct}%</span>
            </div>
            <div class="progress-track" style="margin-top:2px;">
              <div class="progress-fill" style="width:${tp.confidencePct}%; background:var(--brand-primary)"></div>
            </div>
          `).join('')}
        </div>
      `
      : '';

    const qualityMarkup = (scen.isRealCv && scen.quality)
      ? `
        <div class="quality-pills">
          <span class="badge ${scen.quality.isBlurry ? 'badge-hitl' : 'badge-reuse'}">Ketajaman: ${scen.quality.sharpScore} (${scen.quality.isBlurry ? 'Agak Buram' : 'Baik'})</span>
          <span class="badge ${scen.quality.isBadLighting ? 'badge-hitl' : 'badge-neutral'}">Kecerahan: ${scen.quality.brightness}/255</span>
        </div>
      `
      : '';

    const roleCanTriage = ROLES_CONFIG[state.activeRole].canRunTriage;

    document.getElementById('ai-analysis-panel').innerHTML = `
      <div style="border:1px solid var(--border-color); border-radius:12px; padding:16px; background:var(--bg-subtle);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:10px;">
          <div>
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">${escapeHtml(scen.assetTag)} • Usia ${scen.ageYears} Thn • ${scen.repairCount}x Servis</div>
            <h4 style="margin:2px 0 0; font-size:0.98rem;">${escapeHtml(scen.deviceType)}</h4>
          </div>
          ${getPathwayBadge(scen.recommendedPathway)}
        </div>

        <div style="font-size:0.83rem; margin-bottom:8px;">
          <strong>Hasil Awal CV:</strong> ${escapeHtml(scen.predictedCondition)}
        </div>

        ${qualityMarkup}

        <div class="meter-row">
          <div class="meter-head">
            <span>Tingkat Keyakinan Prediksi AI (Ambang ≥ 85%)</span>
            <span class="mono" style="color:${isLowConf ? 'var(--hitl)' : 'var(--reuse)'}">${confPct}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width:${confPct}%; background:${isLowConf ? 'var(--hitl)' : 'var(--reuse)'}"></div>
          </div>
        </div>

        <div class="meter-row">
          <div class="meter-head">
            <span>Indikator Risiko Baterai / Termal (Batas Aman &lt; 35%)</span>
            <span class="mono" style="color:${isHazard ? 'var(--hazmat)' : 'var(--reuse)'}">${hazardPct}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width:${hazardPct}%; background:${isHazard ? 'var(--hazmat)' : 'var(--reuse)'}"></div>
          </div>
        </div>

        ${topKMarkup}

        <div style="margin:12px 0; padding:10px 12px; background:#ffffff; border:1px solid var(--border-color); border-radius:8px;">
          <div style="font-size:0.76rem; font-weight:700; color:var(--text-secondary); margin-bottom:5px;">Penjelasan AI (Explainable AI Factors):</div>
          <ul style="margin:0; padding-left:18px; font-size:0.8rem; color:var(--text-secondary);">
            ${scen.xaiFactors.map(f => `<li>${escapeHtml(f)}</li>`).join('')}
          </ul>
        </div>

        <label style="display:flex; align-items:center; gap:8px; font-size:0.82rem; font-weight:600; color:#991b1b; margin:10px 0; cursor:pointer;">
          <input type="checkbox" id="manual-hazard-checkbox" ${state.manualHazardFlag ? 'checked' : ''} />
          Cek Fisik Operator: Terasa panas / bau bahan kimia / baterai menggembung atau bocor
        </label>

        ${gateBox}

        <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:12px;">
          ${isHazard
            ? `<button class="btn btn-danger" id="btn-commit-triage" ${(!roleCanTriage || state.isPredicting) ? 'disabled' : ''}>${SVG_ICONS.lock} Masukkan ke Karantina K3 &amp; Kunci Pembongkaran</button>`
            : isLowConf
              ? `<button class="btn btn-warning" id="btn-commit-triage" ${(!roleCanTriage || state.isPredicting) ? 'disabled' : ''}>${SVG_ICONS.alertTriangle} Masukkan ke Antrean Tinjauan Operator (HITL)</button>`
              : `<button class="btn btn-primary" id="btn-commit-triage" ${(!roleCanTriage || state.isPredicting) ? 'disabled' : ''}>${SVG_ICONS.check} Konfirmasi &amp; Catat ke Registri (${PATHWAY_META[scen.recommendedPathway].shortLabel})</button>`
          }
          ${!roleCanTriage ? `<span style="font-size:0.76rem; color:var(--hazmat); align-self:center;">Peran Teknisi tidak memiliki izin pra-skrining aset baru. Ganti peran ke Operator/K3/Manajer.</span>` : ''}
        </div>
      </div>
    `;

    const chk = document.getElementById('manual-hazard-checkbox');
    if (chk) {
      chk.onchange = e => {
        state.manualHazardFlag = e.target.checked;
        renderAiTriageView();
      };
    }

    const commitBtn = document.getElementById('btn-commit-triage');
    if (commitBtn) {
      commitBtn.onclick = () => commitTriageScenario(scen, isHazard, isLowConf);
    }

    renderHitlQueue();
  }

  function commitTriageScenario(scen, isHazard, isLowConf) {
    const newId = `AST-2026-${String(state.assets.length + 1).padStart(3, '0')}`;
    const pathway = isHazard ? 'hazmat' : scen.recommendedPathway;
    const weightKg = scen.estimatedWeightKg || (scen.category === 'Monitor' ? 4 : 2);
    const co2Map = { reuse: 175, repair: 145, donate: 160, recycle: 45, hazmat: 35 };
    const econMap = { reuse: 6200000, repair: 3900000, donate: 3500000, recycle: 650000, hazmat: 0 };

    const newAsset = {
      id: newId,
      qrTag: 'QR-' + newId,
      serialNumber: `SN-TRIAGE-${11000 + state.assets.length}`,
      category: scen.category,
      modelName: scen.deviceType,
      unitOwner: 'Gudang Triage Pusat',
      yearAcquired: 2026 - scen.ageYears,
      weightKg,
      pathway,
      workflowStatus: isHazard
        ? 'Karantina Drum Isolasi K3'
        : (isLowConf ? 'Menunggu Verifikasi Operator (HITL)' : 'Dikonfirmasi Operator — Uji Internal'),
      aiConfidence: scen.confidence,
      batteryHazardScore: scen.batteryHazardScore,
      hazardLocked: isHazard,
      hitlStatus: (!isHazard && isLowConf) ? 'pending' : 'verified',
      verifiedBy: (!isHazard && isLowConf) ? null : ROLES_CONFIG[state.activeRole].name,
      dataWipeStatus: isHazard ? 'Dilarang Dioperasikan (Hazmat)' : 'Menunggu Uji Teknisi',
      dataWipeCertNo: null,
      co2eSavedKg: co2Map[pathway],
      economicValueIdr: econMap[pathway],
      repairCostIdr: pathway === 'repair' ? 750000 : 0,
      lastUpdated: '2026-11-11',
      notes: scen.visualSummary
    };

    state.assets.unshift(newAsset);
    state.manualHazardFlag = false;
    state.customPhotoUrl = null;
    state.customPhotoName = null;
    state.customPrediction = null;
    state.predictionError = null;
    state.showGradCam = false;
    renderGlobalBadges();
    renderAiTriageView();
    showToast(`Aset ${newId} tercatat (${PATHWAY_META[pathway].shortLabel}${newAsset.hitlStatus === 'pending' ? ' — Masuk Antrean HITL' : ''}).`);
  }

  function renderHitlQueue() {
    const pendingItems = state.assets.filter(a => a.hitlStatus === 'pending');
    document.getElementById('hitl-queue-badge').textContent = `${pendingItems.length} Item Menunggu`;
    const container = document.getElementById('hitl-queue-container');

    if (pendingItems.length === 0) {
      container.innerHTML = `<div class="icon-heading" style="padding:18px; justify-content:center; text-align:center; color:var(--reuse); font-weight:600; background:var(--reuse-bg); border-radius:10px;">${SVG_ICONS.check} Seluruh item berkeyakinan rendah telah diverifikasi operator.</div>`;
      return;
    }

    const canApprove = ROLES_CONFIG[state.activeRole].canApproveHitl;

    container.innerHTML = pendingItems.map(a => `
      <div style="border:1px solid var(--hitl-border); background:#fffaf5; border-radius:10px; padding:14px; margin-bottom:12px;">
        <div style="display:flex; flex-wrap:wrap; justify-content:space-between; gap:10px; align-items:center;">
          <div>
            <span class="mono" style="font-weight:700;">${escapeHtml(a.id)}</span> • <strong>${escapeHtml(a.modelName)}</strong>
            <span class="badge badge-hitl" style="margin-left:6px;">Keyakinan AI: ${Math.round(a.aiConfidence * 100)}%</span>
          </div>
          <div style="font-size:0.79rem; color:var(--text-secondary);">Unit: ${escapeHtml(a.unitOwner)} | Bobot: ${a.weightKg} kg</div>
        </div>
        <p style="margin:6px 0 10px; font-size:0.81rem; color:var(--text-secondary);">${escapeHtml(a.notes)} Prediksi awal AI: <strong>${PATHWAY_META[a.pathway].shortLabel}</strong>.</p>
        <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
          <select class="select" id="hitl-path-${a.id}" ${!canApprove ? 'disabled' : ''}>
            <option value="reuse" ${a.pathway === 'reuse' ? 'selected' : ''}>Tetapkan: Reuse (Pakai Ulang)</option>
            <option value="repair" ${a.pathway === 'repair' ? 'selected' : ''}>Tetapkan: Repair (Perbaikan Aman)</option>
            <option value="donate" ${a.pathway === 'donate' ? 'selected' : ''}>Tetapkan: Donate (Donasi Mitra)</option>
            <option value="recycle" ${a.pathway === 'recycle' ? 'selected' : ''}>Tetapkan: Recycle (Daur Ulang Berizin)</option>
            <option value="hazmat">Eskalasi: Karantina Baterai K3</option>
          </select>
          <input type="text" class="input" id="hitl-reason-${a.id}" placeholder="Catatan hasil cek fisik operator..." style="flex:1; min-width:200px;" ${!canApprove ? 'disabled' : ''} />
          <button class="btn btn-primary btn-sm" data-verify-hitl="${escapeHtml(a.id)}" ${!canApprove ? 'disabled' : ''}>Verifikasi &amp; Simpan</button>
        </div>
      </div>
    `).join('');
  }

  /* ================== VIEW 4: CUSTODY & PARTNERS ================== */
  function renderCustodyView() {
    document.getElementById('donation-partners-list').innerHTML = DONATION_RECIPIENTS.map(d => `
      <div style="border:1px solid var(--border-color); border-radius:10px; padding:12px; margin-bottom:10px; background:var(--bg-subtle);">
        <div style="display:flex; justify-content:space-between; gap:8px; align-items:flex-start;">
          <div>
            <div style="font-weight:700; font-size:0.88rem;">${escapeHtml(d.name)}</div>
            <div style="font-size:0.76rem; color:var(--text-muted);">${escapeHtml(d.type)} • ${escapeHtml(d.city)}</div>
          </div>
          <span class="badge badge-donate">${d.unitsAllocated} Unit</span>
        </div>
        <div style="margin-top:8px; display:flex; flex-wrap:wrap; gap:10px; font-size:0.76rem; color:var(--text-secondary);">
          <span class="icon-inline">${SVG_ICONS.check} ${escapeHtml(d.verifiedStatus)}</span>
          <span class="mono">BAST: ${escapeHtml(d.bastCode)}</span>
          <span class="icon-inline" style="color:var(--reuse); font-weight:600;">${SVG_ICONS.check} Data Wipe NIST 800-88</span>
        </div>
      </div>
    `).join('');

    document.getElementById('recyclers-list').innerHTML = LICENSED_RECYCLERS.map(r => `
      <div style="border:1px solid ${r.licenseValid ? 'var(--border-color)' : 'var(--hazmat-border)'}; border-radius:10px; padding:12px; margin-bottom:10px; background:${r.licenseValid ? 'var(--bg-subtle)' : '#fff9f9'};">
        <div style="display:flex; justify-content:space-between; gap:8px; align-items:flex-start;">
          <div>
            <div style="font-weight:700; font-size:0.88rem;">${escapeHtml(r.name)}</div>
            <div class="mono" style="font-size:0.75rem; color:var(--text-muted);">Izin: ${escapeHtml(r.licenseNo)} • Berlaku s.d. ${escapeHtml(r.validUntil)}</div>
          </div>
          ${r.licenseValid
            ? '<span class="badge badge-reuse">Izin Aktif</span>'
            : '<span class="badge badge-hazmat">Izin Kedaluwarsa (Diblokir)</span>'}
        </div>
        <div style="margin-top:6px; font-size:0.77rem; color:var(--text-secondary);">${escapeHtml(r.capabilities)}</div>
      </div>
    `).join('');

    document.getElementById('manifests-table-body').innerHTML = state.manifests.map(man => `
      <tr>
        <td class="mono" style="font-weight:700;">${escapeHtml(man.id)}</td>
        <td>${escapeHtml(man.recyclerName)}</td>
        <td>${escapeHtml(man.officerK3)}</td>
        <td class="mono">${escapeHtml(man.date)}</td>
        <td class="mono">${man.assetCount} unit / ${man.totalWeightKg} kg</td>
        <td>${man.containsHazmat ? '<span class="badge badge-hazmat">Baterai / Limbah B3</span>' : '<span class="badge badge-recycle">E-Waste Non-Hazmat</span>'}</td>
        <td>
          <div style="font-weight:600; font-size:0.8rem;">${escapeHtml(man.status)}</div>
          <div class="mono" style="font-size:0.73rem; color:var(--text-muted);">${escapeHtml(man.certNo)}</div>
        </td>
      </tr>
    `).join('');

    const canManifest = ROLES_CONFIG[state.activeRole].canCreateManifest;
    const btn = document.getElementById('open-manifest-modal-btn');
    btn.disabled = !canManifest;
    btn.title = canManifest ? '' : 'Teknisi IT tidak berwenang menerbitkan manifest pengangkutan.';
  }

  /* ================== VIEW 5: SUSTAINABILITY & SIMULATOR ================== */
  function renderSustainabilityView() {
    const m = computeMetrics();
    const landfillDivertedPct = '100.0';
    const treesEquivalent = Math.round(m.totalCo2 / 21.77);

    document.getElementById('sust-kpi-grid').innerHTML = `
      <div class="kpi-card">
        <div class="kpi-label">E-Waste Teralihkan dari TPA</div>
        <div class="kpi-value" style="color:var(--reuse)">${landfillDivertedPct}%</div>
        <div class="kpi-foot">${formatNumber(m.totalWeight)} kg masuk jalur sirkular / pengolah B3 berizin</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Emisi Dihindari Total</div>
        <div class="kpi-value">${formatNumber(m.totalCo2)} kg CO2e</div>
        <div class="kpi-foot">Setara serapan ~${formatNumber(treesEquivalent)} pohon dewasa/tahun</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Nilai Ekonomi Sirkular</div>
        <div class="kpi-value" style="font-size:1.35rem">${formatIdr(m.totalEcon)}</div>
        <div class="kpi-foot">Dominan berasal dari CapEx Avoidance Reuse &amp; Repair</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Kontrol Limbah Berbahaya B3</div>
        <div class="kpi-value" style="color:var(--hazmat)">${m.byPathway.hazmat.count} unit</div>
        <div class="kpi-foot">${m.byPathway.hazmat.weight} kg baterai/UPS berisiko diisolasi aman (0 insiden)</div>
      </div>
    `;

    const keys = ['reuse', 'repair', 'donate', 'recycle', 'hazmat'];
    document.getElementById('sust-breakdown-table').innerHTML = `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Jalur</th>
              <th>Unit</th>
              <th>Bobot</th>
              <th>Emisi Dihindari</th>
              <th>Nilai Ekonomi</th>
            </tr>
          </thead>
          <tbody>
            ${keys.map(k => {
              const row = m.byPathway[k];
              return `
                <tr>
                  <td>${getPathwayBadge(k)}</td>
                  <td class="mono">${row.count}</td>
                  <td class="mono">${row.weight} kg</td>
                  <td class="mono">${formatNumber(row.co2)} kg</td>
                  <td class="mono">${row.econ > 0 ? formatIdr(row.econ) : 'Kepatuhan K3'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    renderSustainabilitySimulator();
  }

  function renderSustainabilitySimulator() {
    const hazmatFixed = 6;
    const maxNonHazmat = 100 - hazmatFixed; // 94 unit
    let rUse = state.simReusePct;
    let rRep = state.simRepairPct;
    let rDon = state.simDonatePct;
    if (rUse + rRep + rDon > maxNonHazmat) {
      const scale = maxNonHazmat / (rUse + rRep + rDon);
      rUse = Math.floor(rUse * scale);
      rRep = Math.floor(rRep * scale);
      rDon = Math.floor(rDon * scale);
    }
    const rRec = maxNonHazmat - (rUse + rRep + rDon);

    // Per-unit impact coefficients calibrated with Section 10.2
    const simCo2 = rUse * 175 + rRep * 151 + rDon * 165 + rRec * 53 + hazmatFixed * 35;
    const simEcon = rUse * 6200000 + rRep * 3937500 + rDon * 3500000 + rRec * 645000;
    const linearRecycleOnlyCo2 = 94 * 53 + hazmatFixed * 35; // 5192 kg
    const extraCo2Saved = simCo2 - linearRecycleOnlyCo2;

    document.getElementById('sust-simulator-box').innerHTML = `
      <div class="slider-group">
        <label><span>Porsi Reuse (Pakai Ulang Internal)</span><span class="mono">${rUse}% (${rUse} unit)</span></label>
        <input type="range" id="sim-reuse" min="5" max="60" value="${rUse}" />
      </div>
      <div class="slider-group">
        <label><span>Porsi Repair (Perbaikan Aman)</span><span class="mono">${rRep}% (${rRep} unit)</span></label>
        <input type="range" id="sim-repair" min="5" max="50" value="${rRep}" />
      </div>
      <div class="slider-group">
        <label><span>Porsi Donate (Hibah Terverifikasi)</span><span class="mono">${rDon}% (${rDon} unit)</span></label>
        <input type="range" id="sim-donate" min="0" max="40" value="${rDon}" />
      </div>
      <div style="display:flex; justify-content:space-between; font-size:0.81rem; color:var(--text-secondary); padding:8px 10px; background:var(--bg-subtle); border-radius:8px; margin-bottom:12px;">
        <span>Sisa Porsi Recycle Berizin: <strong class="mono">${rRec}%</strong></span>
        <span>Karantina K3 Tetap: <strong class="mono">${hazmatFixed}%</strong></span>
      </div>
      <div style="background:var(--reuse-bg); border:1px solid var(--reuse-border); border-radius:10px; padding:14px;">
        <div style="font-size:0.78rem; color:#065f46; font-weight:700; text-transform:uppercase;">Proyeksi Dampak Skenario (100 Unit/Semester)</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:8px;">
          <div>
            <div style="font-size:0.75rem; color:#047857;">Emisi Dihindari</div>
            <div class="mono" style="font-size:1.15rem; font-weight:700; color:#064e3b;">${formatNumber(simCo2)} kg CO2e</div>
          </div>
          <div>
            <div style="font-size:0.75rem; color:#047857;">Nilai Ekonomi</div>
            <div class="mono" style="font-size:1.05rem; font-weight:700; color:#064e3b;">${formatIdr(simEcon)}</div>
          </div>
        </div>
        <div style="margin-top:8px; font-size:0.78rem; color:#065f46;">
          <strong>+${formatNumber(extraCo2Saved)} kg CO2e</strong> lebih rendah emisi dibanding hanya mendaur ulang langsung tanpa Reuse/Repair/Donate!
        </div>
      </div>
    `;

    document.getElementById('sim-reuse').oninput = e => { state.simReusePct = Number(e.target.value); renderSustainabilitySimulator(); };
    document.getElementById('sim-repair').oninput = e => { state.simRepairPct = Number(e.target.value); renderSustainabilitySimulator(); };
    document.getElementById('sim-donate').oninput = e => { state.simDonatePct = Number(e.target.value); renderSustainabilitySimulator(); };
  }

  /* ================== MODALS: PASPOR DIGITAL & MANIFEST ================== */
  function openAssetModal(assetId) {
    const asset = state.assets.find(a => a.id === assetId);
    if (!asset) return;

    const role = ROLES_CONFIG[state.activeRole];
    document.getElementById('modal-asset-title').textContent = `Paspor Digital Aset: ${asset.id}`;
    document.getElementById('modal-asset-sub').textContent = `${asset.modelName} (${asset.category}) • QR Tag: ${asset.qrTag}`;

    const isHazmat = asset.hazardLocked;
    const lockWarning = isHazmat
      ? `
        <div class="safety-lock-box">
          <h4 class="icon-heading">${SVG_ICONS.ban} PROTOKOL KESELAMATAN K3: PEMBONGKARAN MANDIRI DILARANG</h4>
          <p style="margin:0;">Aset ini terindikasi memiliki kerusakan/pembengkakan/panas pada baterai (Skor Risiko: <strong>${Math.round(asset.batteryHazardScore * 100)}%</strong>). Perbaikan atau pembongkaran mandiri dikunci secara permanen oleh sistem. Hanya <strong>Petugas K3</strong> yang dapat menjadwalkan penyerahan ke pengolah B3 berizin.</p>
        </div>
      `
      : '';

    const canChangeNonHazmat = !isHazmat && role.canApprovePathway;
    const canReleaseHazmatToManifest = isHazmat && role.canManageHazmat;

    document.getElementById('modal-asset-body').innerHTML = `
      ${lockWarning}
      <div class="detail-kv-grid">
        <div><div class="detail-kv-label">Jalur Saat Ini</div><div class="detail-kv-val">${getPathwayBadge(asset.pathway)}</div></div>
        <div><div class="detail-kv-label">Status Operasional</div><div class="detail-kv-val">${escapeHtml(asset.workflowStatus)}</div></div>
        <div><div class="detail-kv-label">Unit Pemilik Asal</div><div class="detail-kv-val">${escapeHtml(asset.unitOwner)}</div></div>
        <div><div class="detail-kv-label">Nomor Seri &amp; Tahun</div><div class="detail-kv-val mono">${escapeHtml(asset.serialNumber)} (${asset.yearAcquired})</div></div>
        <div><div class="detail-kv-label">Skor Keyakinan CV (Visual Awal)</div><div class="detail-kv-val mono">${Math.round(asset.aiConfidence * 100)}% (HITL: ${asset.hitlStatus})</div></div>
        <div><div class="detail-kv-label">Status Sanitasi Data</div><div class="detail-kv-val">${escapeHtml(asset.dataWipeStatus)} ${asset.dataWipeCertNo ? `<span class="mono">(${escapeHtml(asset.dataWipeCertNo)})</span>` : ''}</div></div>
        <div><div class="detail-kv-label">Dampak Emisi Dihindari</div><div class="detail-kv-val mono">${asset.co2eSavedKg} kg CO2e</div></div>
        <div><div class="detail-kv-label">Nilai Ekonomi Sirkular</div><div class="detail-kv-val mono">${asset.economicValueIdr > 0 ? formatIdr(asset.economicValueIdr) : 'Kepatuhan K3'}</div></div>
      </div>

      <div style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:16px;">
        <strong>Catatan Audit &amp; Inspeksi:</strong> ${escapeHtml(asset.notes)}<br/>
        <span style="font-size:0.76rem; color:var(--text-muted);">Terverifikasi oleh: ${escapeHtml(asset.verifiedBy || 'Menunggu Verifikasi Operator')} • Pembaruan: ${escapeHtml(asset.lastUpdated)}</span>
      </div>

      <div style="border-top:1px solid var(--border-color); padding-top:14px;">
        <div style="font-size:0.82rem; font-weight:700; margin-bottom:8px;">Kontrol Perpindahan Jalur (Berdasarkan RBAC &amp; Aturan Keselamatan):</div>
        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          <button class="btn btn-sm" data-move-asset="${escapeHtml(asset.id)}" data-target-path="reuse" ${!canChangeNonHazmat ? 'disabled' : ''}>Pindah ke Reuse</button>
          <button class="btn btn-sm" data-move-asset="${escapeHtml(asset.id)}" data-target-path="repair" ${!canChangeNonHazmat ? 'disabled' : ''}>Pindah ke Repair</button>
          <button class="btn btn-sm" data-move-asset="${escapeHtml(asset.id)}" data-target-path="donate" ${!canChangeNonHazmat ? 'disabled' : ''}>Pindah ke Donate</button>
          <button class="btn btn-sm" data-move-asset="${escapeHtml(asset.id)}" data-target-path="recycle" ${!canChangeNonHazmat ? 'disabled' : ''}>Pindah ke Recycle</button>
          ${!isHazmat
            ? `<button class="btn btn-danger btn-sm" data-move-asset="${escapeHtml(asset.id)}" data-target-path="hazmat">${SVG_ICONS.lock} Eskalasi Karantina K3</button>`
            : `<button class="btn btn-danger btn-sm" id="btn-k3-manifest-single" ${!canReleaseHazmatToManifest ? 'disabled' : ''}>Terbitkan Jadwal Penyerahan B3 Berizin</button>`
          }
        </div>
        ${isHazmat && !canReleaseHazmatToManifest ? `<div style="font-size:0.76rem; color:var(--hazmat); margin-top:6px;">Hanya peran <strong>Petugas K3 &amp; Kepatuhan B3</strong> yang berwenang memproses pelepasan aset karantina baterai.</div>` : ''}
        ${!isHazmat && !role.canApprovePathway ? `<div style="font-size:0.76rem; color:var(--text-muted); margin-top:6px;">Peran Teknisi hanya melakukan uji internal/servis dan tidak dapat mengubah keputusan rute aset.</div>` : ''}
      </div>
    `;

    const k3Btn = document.getElementById('btn-k3-manifest-single');
    if (k3Btn) {
      k3Btn.onclick = () => {
        closeAssetModal();
        openManifestModal(true);
      };
    }

    document.getElementById('asset-modal').classList.add('open');
  }

  function closeAssetModal() {
    document.getElementById('asset-modal').classList.remove('open');
  }

  function openManifestModal(defaultHazmat = false) {
    const activeRecyclers = LICENSED_RECYCLERS.filter(r => r.licenseValid);
    const eligibleAssets = state.assets.filter(a => a.pathway === (defaultHazmat ? 'hazmat' : 'recycle'));
    const defaultWeight = eligibleAssets.slice(0, 5).reduce((sum, a) => sum + a.weightKg, 0) || 24;
    const defaultCount = Math.min(5, eligibleAssets.length) || 3;

    document.getElementById('manifest-modal-body').innerHTML = `
      <form id="create-manifest-form" style="display:flex; flex-direction:column; gap:12px;">
        <div>
          <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:4px;">Jenis Muatan Batch</label>
          <select id="man-hazmat" class="select" style="width:100%;">
            <option value="false" ${!defaultHazmat ? 'selected' : ''}>E-Waste Non-Hazmat (Jalur Recycle)</option>
            <option value="true" ${defaultHazmat ? 'selected' : ''}>Limbah B3 / Baterai Menggembung (Karantina K3)</option>
          </select>
        </div>
        <div>
          <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:4px;">Pengolah Daur Ulang Berizin Aktif (Pengolah kedaluwarsa otomatis disembunyikan)</label>
          <select id="man-recycler" class="select" style="width:100%;">
            ${activeRecyclers.map(r => `<option value="${escapeHtml(r.id)}">${escapeHtml(r.name)} (${escapeHtml(r.licenseNo)})</option>`).join('')}
          </select>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div>
            <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:4px;">Jumlah Unit Batch</label>
            <input type="number" id="man-count" class="input" min="1" max="50" value="${defaultCount}" style="width:100%;" required />
          </div>
          <div>
            <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:4px;">Total Bobot Terukur (kg)</label>
            <input type="number" id="man-weight" class="input" min="1" max="1000" value="${defaultWeight}" style="width:100%;" required />
          </div>
        </div>
        <div>
          <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:4px;">Tanggal Penjemputan Terjadwal</label>
          <input type="date" id="man-date" class="input" value="2026-11-15" style="width:100%;" required />
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:6px;">
          <button type="button" class="btn" id="cancel-manifest-btn">Batal</button>
          <button type="submit" class="btn btn-primary">Terbitkan Manifest Resmi</button>
        </div>
      </form>
    `;

    document.getElementById('cancel-manifest-btn').onclick = closeManifestModal;
    document.getElementById('create-manifest-form').onsubmit = e => {
      e.preventDefault();
      const recyclerId = document.getElementById('man-recycler').value;
      const recycler = LICENSED_RECYCLERS.find(r => r.id === recyclerId);
      const isHaz = document.getElementById('man-hazmat').value === 'true';
      const newMan = {
        id: (isHaz ? 'MAN-HAZ-2026-' : 'MAN-2026-') + String(105 + state.manifests.length),
        recyclerId: recycler.id,
        recyclerName: recycler.name,
        officerK3: 'Ir. Ratna Sari, M.K3',
        date: document.getElementById('man-date').value,
        assetCount: Number(document.getElementById('man-count').value),
        totalWeightKg: Number(document.getElementById('man-weight').value),
        containsHazmat: isHaz,
        status: isHaz ? 'Terjadwal Jemput Drum Isolasi K3' : 'Menunggu Penjemputan Pengolah Berizin',
        certNo: 'Manifest Terbit (Menunggu COR)'
      };
      state.manifests.unshift(newMan);
      closeManifestModal();
      switchView('custody');
      showToast(`Manifest ${newMan.id} berhasil diterbitkan ke ${recycler.name}.`);
    };

    document.getElementById('manifest-modal').classList.add('open');
  }

  function closeManifestModal() {
    document.getElementById('manifest-modal').classList.remove('open');
  }

  function renderActiveView() {
    renderGlobalBadges();
    if (state.activeView === 'overview') renderOverview();
    else if (state.activeView === 'pathways') renderPathwaysView();
    else if (state.activeView === 'ai-triage') renderAiTriageView();
    else if (state.activeView === 'custody') renderCustodyView();
    else if (state.activeView === 'sustainability') renderSustainabilityView();
  }

  /* ================== EVENT WIRING ================== */
  function initEvents() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    document.getElementById('mobile-menu-btn').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('mobile-open');
    });

    document.getElementById('role-select').addEventListener('change', e => {
      state.activeRole = e.target.value;
      renderActiveView();
      showToast(`Mode peran diubah ke: ${ROLES_CONFIG[state.activeRole].name}`);
    });

    document.getElementById('chip-hitl-jump').addEventListener('click', () => {
      switchView('ai-triage');
    });

    document.getElementById('chip-hazmat-jump').addEventListener('click', () => {
      state.activePathwayTab = 'hazmat';
      switchView('pathways');
    });

    document.getElementById('overview-search').addEventListener('input', e => {
      state.overviewSearch = e.target.value;
      state.overviewPage = 1;
      renderOverviewTable();
    });

    document.getElementById('overview-pathway-filter').addEventListener('change', e => {
      state.overviewPathwayFilter = e.target.value;
      state.overviewPage = 1;
      renderOverviewTable();
    });

    document.getElementById('overview-hitl-filter').addEventListener('change', e => {
      state.overviewHitlFilter = e.target.value;
      state.overviewPage = 1;
      renderOverviewTable();
    });

    document.getElementById('custom-photo-upload').addEventListener('change', e => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        state.customPhotoUrl = ev.target.result;
        state.customPhotoName = file.name;
        analyzeUploadedPhoto(file);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    });

    document.getElementById('close-asset-modal').addEventListener('click', closeAssetModal);
    document.getElementById('asset-modal').addEventListener('click', e => {
      if (e.target.id === 'asset-modal') closeAssetModal();
    });

    document.getElementById('open-manifest-modal-btn').addEventListener('click', () => openManifestModal(false));
    document.getElementById('close-manifest-modal').addEventListener('click', closeManifestModal);
    document.getElementById('manifest-modal').addEventListener('click', e => {
      if (e.target.id === 'manifest-modal') closeManifestModal();
    });

    // Global delegated clicks for dynamic elements
    document.body.addEventListener('click', e => {
      const openBtn = e.target.closest('[data-open-asset]');
      if (openBtn) {
        openAssetModal(openBtn.dataset.openAsset);
        return;
      }

      const pathTab = e.target.closest('[data-pathway-tab]');
      if (pathTab) {
        state.activePathwayTab = pathTab.dataset.pathwayTab;
        renderPathwaysView();
        return;
      }

      const scenBtn = e.target.closest('[data-scenario-id]');
      if (scenBtn) {
        state.activeScenarioId = scenBtn.dataset.scenarioId;
        state.customPhotoUrl = null;
        state.customPhotoName = null;
        state.customPrediction = null;
        state.predictionError = null;
        state.isPredicting = false;
        state.showGradCam = false;
        state.manualHazardFlag = false;
        renderAiTriageView();
        return;
      }

      const hitlBtn = e.target.closest('[data-verify-hitl]');
      if (hitlBtn) {
        const assetId = hitlBtn.dataset.verifyHitl;
        const asset = state.assets.find(a => a.id === assetId);
        if (!asset) return;
        const newPath = document.getElementById(`hitl-path-${assetId}`).value;
        const reason = document.getElementById(`hitl-reason-${assetId}`).value.trim() || 'Diverifikasi langsung oleh operator gudang.';
        asset.pathway = newPath;
        asset.hitlStatus = 'verified';
        asset.verifiedBy = ROLES_CONFIG[state.activeRole].name;
        asset.hazardLocked = newPath === 'hazmat';
        asset.workflowStatus = newPath === 'hazmat'
          ? 'Karantina Drum Isolasi K3'
          : `Terverifikasi Operator (${PATHWAY_META[newPath].shortLabel})`;
        asset.notes = `HITL Operator: ${reason}`;
        asset.lastUpdated = '2026-11-11';
        if (newPath === 'hazmat') {
          asset.economicValueIdr = 0;
          asset.dataWipeStatus = 'Dilarang Dioperasikan (Hazmat)';
        }
        renderActiveView();
        showToast(`Aset ${assetId} berhasil diverifikasi HITL ke jalur ${PATHWAY_META[newPath].shortLabel}.`);
        return;
      }

      const moveBtn = e.target.closest('[data-move-asset]');
      if (moveBtn) {
        const assetId = moveBtn.dataset.moveAsset;
        const target = moveBtn.dataset.targetPath;
        const asset = state.assets.find(a => a.id === assetId);
        if (!asset || asset.hazardLocked) return;
        asset.pathway = target;
        asset.hitlStatus = 'verified';
        asset.verifiedBy = ROLES_CONFIG[state.activeRole].name;
        if (target === 'hazmat') {
          asset.hazardLocked = true;
          asset.batteryHazardScore = Math.max(asset.batteryHazardScore, 0.85);
          asset.workflowStatus = 'Karantina Drum Isolasi K3';
          asset.dataWipeStatus = 'Dilarang Dioperasikan (Hazmat)';
          asset.economicValueIdr = 0;
        } else {
          asset.workflowStatus = `Dipindahkan ke Jalur ${PATHWAY_META[target].shortLabel}`;
        }
        asset.lastUpdated = '2026-11-11';
        closeAssetModal();
        renderActiveView();
        showToast(`Status aset ${assetId} diperbarui ke ${PATHWAY_META[target].shortLabel}.`);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initEvents();
    renderActiveView();
    checkCvBackend();
  });
})();

