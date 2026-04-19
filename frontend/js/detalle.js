/* ══════════════════════════════════════════
   LaburAI — detalle.js
   Módulos:
   - Datos de ofertas (mismo array que ofertas.js)
   - Cargar oferta por ID desde URL (?id=N)
   - Renderizar todos los bloques de la página
   - Ring de compatibilidad animado
   - Tabs de contenido
   - Guardar oferta (toggle)
   - Modal de postulación + éxito
   - Barra mobile sticky
   - Navbar + hamburger
   - Ofertas similares
══════════════════════════════════════════ */

/* ─────────────────────────────────
   DATOS
   (en producción vendría de una API)
───────────────────────────────── */
const OFERTAS = []; // El array se llenará con datos dinámicos si es necesario o se usará como fallback vacío.

/* ─────────────────────────────────
   HELPERS
───────────────────────────────── */
function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

function getOferta(id) {
  return OFERTAS.find((o) => o.id === parseInt(id, 10)) || OFERTAS[0];
}

/* ─────────────────────────────────
   RENDER COMPLETO
───────────────────────────────── */
function renderPage(oferta) {

  // Breadcrumb + title
  document.title = `LaburAI — ${oferta.title}`;
  const bcTitle = document.getElementById('bcTitle');
  if (bcTitle) bcTitle.textContent = oferta.title;

  // Logo
  const logoEl = document.getElementById('jobLogo');
  if (logoEl) {
    logoEl.textContent = oferta.logo;
    logoEl.style.color = oferta.logoColor;
  }

  // Tags en header
  const tagsEl = document.getElementById('jobTagsHeader');
  if (tagsEl) {
    tagsEl.innerHTML = oferta.tags
      .map((t, i) => `<span class="job-tag ${oferta.tagTypes[i] || ''}">${t}</span>`)
      .join('');
  }

  setText('jobTitle',    oferta.title);
  setText('jobCompany',  oferta.company);
  setText('jobLocation', oferta.location);
  setText('jobTime',     oferta.time);

  // Match ring
  const session = getSession();
  const isEmpresa = session?.rol === 'empresa';

  if (!isEmpresa) {
    renderMatchRing(oferta.match);
    setText('matchPct', `${oferta.match}%`);
  } else {
    // Si es empresa, ocultamos todo el bloque de match
    const matchRingBox = document.querySelector('.match-ring-box')?.parentElement;
    if (matchRingBox) matchRingBox.style.display = 'none';
  }

  // Match skills
  const skillsEl = document.getElementById('matchSkills');
  if (isEmpresa && skillsEl) {
    // Ocultar bloque de skills si es empresa
    const headerTitle = skillsEl.previousElementSibling;
    if (headerTitle) headerTitle.style.display = 'none';
    skillsEl.style.display = 'none';
  } else if (skillsEl && oferta.matchSkills.length) {
    skillsEl.innerHTML = oferta.matchSkills.map((s) => `
      <span class="skill-match ${s.has ? 'has' : 'miss'}">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          ${s.has
            ? '<polyline points="20 6 9 17 4 12"/>'
            : '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'}
        </svg>
        ${s.name}
      </span>`).join('');
  }

  // Descripción
  const descEl = document.getElementById('jobDesc');
  if (descEl) {
    descEl.innerHTML = oferta.desc
      .split('\n\n')
      .map((p) => `<p>${p}</p>`)
      .join('');
  }

  // Responsabilidades
  renderList('jobResponsabilities', oferta.responsibilities);

  // Beneficios
  renderList('jobBenefits', oferta.benefits);

  // Requisitos
  renderList('jobRequirements', oferta.requirements);

  // Skills requeridas
  const skillsGrid = document.getElementById('jobSkills');
  if (skillsGrid) {
    skillsGrid.innerHTML = oferta.skills
      .map((s) => `<span class="skill-tag required">${s}</span>`)
      .join('');
  }

  // Skills valoradas
  const niceGrid = document.getElementById('jobNiceSkills');
  if (niceGrid) {
    niceGrid.innerHTML = oferta.niceSkills
      .map((s) => `<span class="skill-tag">${s}</span>`)
      .join('');
  }

  // Tab empresa
  const companyTab = document.getElementById('companyTab');
  if (companyTab) {
    companyTab.innerHTML = `
      <div class="company-profile-header">
        <div class="cp-logo" style="background:${oferta.logoColor}">${oferta.logo}</div>
        <div>
          <div class="cp-name">${oferta.company}</div>
          <div class="cp-sector">${oferta.company_industry}</div>
        </div>
      </div>
      <p class="cp-desc">${oferta.company_desc}</p>
      <div class="cp-stats">
        <div class="cp-stat"><div class="cp-stat-num">${oferta.company_employees}</div><div class="cp-stat-label">Empleados</div></div>
        <div class="cp-stat"><div class="cp-stat-num">Desde ${oferta.company_since}</div><div class="cp-stat-label">Fundada</div></div>
        <div class="cp-stat"><div class="cp-stat-num">${oferta.company_openings}</div><div class="cp-stat-label">Búsquedas activas</div></div>
      </div>`;
  }

  // Sidebar — salary
  setText('applySalary', oferta.salary);
  setText('mabSalary', oferta.salary);
  setText('mabTitle', oferta.title);

  // Sidebar — apply meta y CTA flotante
  const metaEl = document.getElementById('applyMeta');
  if (metaEl) {
    metaEl.innerHTML = `
      <div class="apply-meta-row">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        ${oferta.postulaciones} personas ya se postularon
      </div>
      <div class="apply-meta-row">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Publicado ${oferta.time}
      </div>
      <div class="apply-meta-row">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Responde en menos de 3 días
      </div>`;
  }

  // CTAs (Botones de postulación)
  const btnApply = document.getElementById('btnApply');
  const btnSaveAlt = document.getElementById('btnSaveAlt');
  const mobileApplyBar = document.getElementById('mobileApplyBar');
  const btnApplyMobile = document.getElementById('btnApplyMobile');

  const btnLoginToApply = document.getElementById('btnLoginToApply');
  const btnLoginToApplyMobile = document.getElementById('btnLoginToApplyMobile');
  
  const isAuthenticated = session && session.token ? true : false;
  
  if (isEmpresa) {
    if (btnApply) btnApply.style.display = 'none';
    if (btnSaveAlt) btnSaveAlt.style.display = 'none';
    if (mobileApplyBar) mobileApplyBar.style.display = 'none';
    if (btnLoginToApply) btnLoginToApply.style.display = 'none';
    if (btnLoginToApplyMobile) btnLoginToApplyMobile.style.display = 'none';
  } else if (!isAuthenticated) {
    // Para usuarios NO logueados
    if (btnApply) btnApply.style.display = 'none';
    if (btnSaveAlt) btnSaveAlt.style.display = 'none';
    if (btnApplyMobile) btnApplyMobile.style.display = 'none';
    if (btnLoginToApply) btnLoginToApply.style.display = 'flex';
    if (btnLoginToApplyMobile) btnLoginToApplyMobile.style.display = 'flex';
  } else {
    // Para candidatos LOGUEADOS
    if (btnLoginToApply) btnLoginToApply.style.display = 'none';
    if (btnLoginToApplyMobile) btnLoginToApplyMobile.style.display = 'none';

    if (btnApply) {
      const btnText = oferta.modalidad === 'Remoto' ? 'Postularme' : 'Postulación Rápida';
      btnApply.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg> ${btnText}`;
      btnApply.style.display = 'flex';
    }
    if (btnSaveAlt) btnSaveAlt.style.display = 'flex';
    
    if (btnApplyMobile) {
      const btnTextBtn = oferta.modalidad === 'Remoto' ? 'Postularme' : 'Postul. Rápida';
      btnApplyMobile.innerText = btnTextBtn;
      btnApplyMobile.style.display = 'flex';
    }
  }

  // Sidebar — info rows
  const infoRows = document.getElementById('infoRows');
  if (infoRows) {
    const rows = [
      { icon: '📍', label: 'Ubicación',  value: oferta.location },
      { icon: '🏢', label: 'Modalidad',  value: oferta.modalidad },
      { icon: '⏰', label: 'Jornada',    value: oferta.jornada },
      { icon: '📊', label: 'Experiencia',value: oferta.exp },
      { icon: '👥', label: 'Vacantes',   value: oferta.vacantes === 1 ? '1 vacante' : `${oferta.vacantes} vacantes` },
      { icon: '🏭', label: 'Industria',  value: oferta.company_industry },
    ];
    infoRows.innerHTML = rows.map((r) => `
      <div class="info-row">
        <div class="info-row-icon">${r.icon}</div>
        <div>
          <div class="info-row-label">${r.label}</div>
          <div class="info-row-value">${r.value}</div>
        </div>
      </div>`).join('');
  }

  // Sidebar — mini empresa
  const miniEl = document.getElementById('companyMini');
  if (miniEl) {
    miniEl.innerHTML = `
      <div class="company-mini-head">
        <div class="company-mini-logo" style="background:${oferta.logoColor}">${oferta.logo}</div>
        <div>
          <div class="company-mini-name">${oferta.company}</div>
          <div class="company-mini-sector">${oferta.company_industry}</div>
        </div>
      </div>
      <p class="company-mini-desc">${oferta.company_desc.slice(0, 120)}…</p>
      <a href="#tab-empresa" class="company-mini-link" onclick="switchTab('empresa')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        Ver perfil completo
      </a>`;
  }

  // Modal preview
  const modalPreview = document.getElementById('modalJobPreview');
  if (modalPreview) {
    modalPreview.innerHTML = `
      <div class="mjp-logo" style="background:${oferta.logoColor};color:#fff">${oferta.logo}</div>
      <div>
        <div class="mjp-title">${oferta.title}</div>
        <div class="mjp-company">${oferta.company} · ${oferta.location}</div>
      </div>`;
  }

  // Ofertas similares (mismo rubro, distinto id, máx 3)
  renderSimilar(oferta);
}

/* ─────────────────────────────────
   RING DE COMPATIBILIDAD
───────────────────────────────── */
function renderMatchRing(pct) {
  const ringFill = document.getElementById('ringFill');
  const ringPct  = document.getElementById('ringPct');
  if (!ringFill) return;

  // SVG gradient inline
  const svg = ringFill.closest('svg');
  if (svg && !svg.querySelector('#ringGrad')) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#5C6BC0"/>
        <stop offset="100%" stop-color="#7C4DFF"/>
      </linearGradient>`;
    svg.prepend(defs);
    ringFill.setAttribute('stroke', 'url(#ringGrad)');
  }

  const circumference = 2 * Math.PI * 24; // r=24 → 150.8
  const offset = circumference * (1 - pct / 100);

  // Animar con delay para que sea visible
  setTimeout(() => {
    ringFill.style.strokeDashoffset = offset;
  }, 300);

  if (ringPct) ringPct.textContent = `${pct}%`;
}

/* ─────────────────────────────────
   OFERTAS SIMILARES
───────────────────────────────── */
function renderSimilar(oferta) {
  const grid = document.getElementById('similarGrid');
  if (!grid) return;

  const similar = OFERTAS
    .filter((o) => o.id !== oferta.id && o.rubro === oferta.rubro)
    .slice(0, 3);

  // Si no hay del mismo rubro, tomar los primeros 3
  const list = similar.length >= 2
    ? similar
    : OFERTAS.filter((o) => o.id !== oferta.id).slice(0, 3);

  grid.innerHTML = list.map((o) => {
    const tags = o.tags.map((t, i) => `<span class="job-tag ${o.tagTypes[i] || ''}">${t}</span>`).join('');
    const matchVal = o.match || 0;
    const badge = `<div class="match-badge">✦ ${matchVal}% match</div>`;
    return `
      <a class="job-card" href="oferta-detalle.html?id=${o.id}">
        ${badge}
        <div class="job-card-head">
          <div class="company-logo" style="color:${o.logoColor}">${o.logo}</div>
          <div class="job-meta">
            <div class="job-title">${o.title}</div>
            <div class="company-name">${o.company} · ${o.location}</div>
          </div>
        </div>
        <div class="job-tags">${tags}</div>
        <div class="job-footer">
          <div class="salary">${o.salary}</div>
          <div class="time-ago">${o.time}</div>
        </div>
      </a>`;
  }).join('');
}

/* ─────────────────────────────────
   TABS
───────────────────────────────── */
function initTabs() {
  document.querySelectorAll('.dtab').forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
}

window.switchTab = function(tabId) {
  document.querySelectorAll('.dtab').forEach((t) => {
    t.classList.toggle('active', t.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-content').forEach((c) => {
    c.classList.toggle('active', c.id === `tab-${tabId}`);
  });
  // Scroll al tab
  document.querySelector('.detail-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

/* ─────────────────────────────────
   GUARDAR OFERTA (toggle)
───────────────────────────────── */
function initSave() {
  let saved = false;

  function toggleSave() {
    saved = !saved;
    ['btnSave', 'btnSaveAlt'].forEach((id) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.classList.toggle('saved', saved);
      if (id === 'btnSaveAlt') {
        const svg = btn.querySelector('svg path');
        if (svg) svg.setAttribute('fill', saved ? 'currentColor' : 'none');
        btn.innerHTML = btn.innerHTML; // trigger repaint
      }
    });
    showToast(saved ? 'Oferta guardada ✓' : 'Oferta eliminada de guardados', saved ? 'success' : 'info');
  }

  document.getElementById('btnSave')?.addEventListener('click', toggleSave);
  document.getElementById('btnSaveAlt')?.addEventListener('click', toggleSave);
}

/* ─────────────────────────────────
   MODAL DE POSTULACIÓN
───────────────────────────────── */
function initModal() {
  const overlay   = document.getElementById('modalOverlay');
  const sucOverlay = document.getElementById('successOverlay');
  const btnApply  = document.getElementById('btnApply');
  const btnMobile = document.getElementById('btnApplyMobile');
  const btnClose  = document.getElementById('modalClose');
  const btnCancel = document.getElementById('btnCancelModal');
  const btnConfirm= document.getElementById('btnConfirmApply');

  function openModal()  { overlay?.classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
  function closeModal() { overlay?.classList.add('hidden'); document.body.style.overflow = ''; }
  function showSuccess() {
    overlay?.classList.add('hidden');
    sucOverlay?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  btnApply?.addEventListener('click', openModal);
  btnMobile?.addEventListener('click', openModal);
  btnClose?.addEventListener('click', closeModal);
  btnCancel?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  sucOverlay?.addEventListener('click', (e) => { if (e.target === sucOverlay) { sucOverlay.classList.add('hidden'); document.body.style.overflow = ''; } });

  btnConfirm?.addEventListener('click', async () => {
    btnConfirm.disabled = true;
    btnConfirm.innerHTML = '<div style="width:16px;height:16px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite"></div> Enviando…';

    try {
      // Obtener sesión del usuario (corregido typo labuai_session)
      const session = JSON.parse(localStorage.getItem('labuai_session') || '{}');

      if (!session.token) {
        showToast('Necesitás iniciar sesión para postularte', 'error');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
      }

      // Obtener ID de oferta de la URL
      const ofertaId = getParam('id');
      const carta    = document.getElementById('coverLetter')?.value || '';

      // Usar la función centralizada de la API
      await API.crearPostulacion({
        ofertaId:        ofertaId,
        cartaMotivacion: carta,
      });

      // Mostrar éxito
      overlay?.classList.add('hidden');
      sucOverlay?.classList.remove('hidden');
      document.body.style.overflow = 'hidden';

    } catch (err) {
      showToast('No se pudo conectar con el servidor', 'error');
      btnConfirm.disabled = false;
      btnConfirm.innerHTML = 'Confirmar postulación';
    }
  });
}

/* ─────────────────────────────────
   OFERTAS SIMILARES
───────────────────────────────── */
function renderSimilar(oferta) {
  const grid = document.getElementById('similarGrid');
  if (!grid) return;

  // Intentar cargar ofertas reales para similar del mismo rubro
  fetch(`http://localhost:3000/api/jobs?rubro=${oferta.rubro}`)
    .then(r => r.json())
    .then(data => {
      if (!Array.isArray(data)) return;
      const list = data.filter(j => j.id !== oferta.id).slice(0, 3).map(j => ({
        id: j.id,
        title: j.titulo,
        company: j.empresa?.nombre || 'Empresa',
        location: j.ubicacion,
        logo: j.empresa?.nombre?.charAt(0).toUpperCase() || '?',
        logoColor: '#5C6BC0',
        tags: [j.modalidad, j.jornada],
        tagTypes: [j.modalidad === 'Remoto' ? 'remote' : '', ''],
        salary: j.salarioMin ? `$${j.salarioMin.toLocaleString('es-AR')}` : 'A convenir',
        time: 'Reciente',
        match: j.matchIA || 0,
        rubro: j.rubro
      }));
      renderSimilarList(grid, list);
    })
    .catch(err => console.error('Error fetching similar jobs:', err));
}

function renderSimilarList(grid, list) {
  const session = getSession();
  const isEmpresa = session?.rol === 'empresa';

  grid.innerHTML = list.map((o) => {
    const tags = o.tags.map((t, i) => `<span class="job-tag ${o.tagTypes[i] || ''}">${t}</span>`).join('');
    const matchVal = o.match || 0;
    const badge = isEmpresa ? '' : `<div class="match-badge">✦ ${matchVal}% match</div>`;
    return `
      <a class="job-card" href="oferta-detalle.html?id=${o.id}">
        ${badge}
        <div class="job-card-head">
          <div class="company-logo" style="color:${o.logoColor}">${o.logo}</div>
          <div class="job-meta">
            <div class="job-title">${o.title}</div>
            <div class="company-name">${o.company} · ${o.location}</div>
          </div>
        </div>
        <div class="job-tags">${tags}</div>
        <div class="job-footer">
          <div class="salary">${o.salary}</div>
          <div class="time-ago">${o.time}</div>
        </div>
      </a>`;
  }).join('');
}

/* ─────────────────────────────────
   REPORTAR
───────────────────────────────── */
function initReport() {
  document.getElementById('reportBtn')?.addEventListener('click', () => {
    showToast('Gracias por reportarlo. Revisaremos la oferta.', 'info');
  });
}

/* ─────────────────────────────────
   COMPARTIR
───────────────────────────────── */
function initShare() {
  document.getElementById('btnShare')?.addEventListener('click', () => {
    if (navigator.share) {
      navigator.share({ title: document.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copiado al portapapeles', 'success');
    }
  });
}

/* ─────────────────────────────────
   TOAST
───────────────────────────────── */

/* ─────────────────────────────────
   UTILS
───────────────────────────────── */
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function renderList(id, items) {
  const el = document.getElementById(id);
  if (!el || !items.length) return;
  el.innerHTML = items.map((item) => `<li>${item}</li>`).join('');
}

/* ─────────────────────────────────
   INIT
───────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  const id = getParam('id');
  if (!id) { window.location.href = 'ofertas.html'; return; }

  try {
    const session = JSON.parse(localStorage.getItem('labuai_session') || '{}');
    const candidatoId = (session && session.rol === 'CANDIDATO') ? session.candidatoId : '';
    const url = candidatoId 
      ? `http://localhost:3000/api/jobs/${id}?candidatoId=${candidatoId}`
      : `http://localhost:3000/api/jobs/${id}`;

    const res  = await fetch(url);
    const job  = await res.json();

    if (!res.ok) { window.location.href = 'ofertas.html'; return; }

    // Mapear datos de la API al formato que espera renderPage()
    const oferta = {
      id:           job.id,
      title:        job.titulo,
      company:      job.empresa?.nombre || 'Empresa',
      location:     job.ubicacion,
      logo:         job.empresa?.nombre?.charAt(0).toUpperCase() || '?',
      logoColor:    '#5C6BC0',
      tags:         [job.modalidad, job.jornada],
      tagTypes:     [job.modalidad === 'Remoto' ? 'remote' : '', ''],
      salary:       job.salarioMin && job.salarioMax
                      ? `$${job.salarioMin.toLocaleString('es-AR')} – $${job.salarioMax.toLocaleString('es-AR')}`
                      : 'Salario a convenir',
      time:         new Date(job.creadoEn).toLocaleDateString('es-AR'),
      match:        job.matchIA || 0,
      modalidad:    job.modalidad,
      jornada:      job.jornada,
      exp:          job.experiencia || 'No especificada',
      vacantes:     1,
      postulaciones: job.postulaciones?.length || 0,
      desc:         job.descripcion,
      responsibilities: [],
      benefits:     [],
      requirements: [job.experiencia, job.estudios].filter(Boolean),
      skills:       job.habilidades || [],
      niceSkills:   [],
      matchSkills:  [],
      company_desc: job.empresa?.descripcion || `${job.empresa?.nombre} es una empresa líder en ${job.empresa?.industria || 'su sector'}.`,
      company_employees: 'No especificado',
      company_since:     'No especificado',
      company_industry:  job.empresa?.industria || 'No especificado',
      company_openings:  1,
    };

    initNavbar();
    initNavSession();
    renderPage(oferta);
    initTabs();
    initSave();
    initModal();
    initReport();
    initShare();

  } catch (err) {
    console.error('Error cargando oferta:', err);
    window.location.href = 'ofertas.html';
  }
});