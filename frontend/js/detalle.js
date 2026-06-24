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

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderCompanyLogo(data, className = 'company-logo', options = {}) {
  if (data.logoUrl) {
    return `
      <div class="${className} company-logo--image">
        <img src="${escapeHtml(data.logoUrl)}" alt="Logo de ${escapeHtml(data.company)}" loading="lazy">
      </div>`;
  }

  const solidStyle = options.solid
    ? `background:${escapeHtml(data.logoColor || '#5C6BC0')};color:#fff`
    : `color:${escapeHtml(data.logoColor || '#5C6BC0')}`;
  return `<div class="${className}" style="${solidStyle}">${escapeHtml(data.logo || '?')}</div>`;
}

function renderCompanyLogoInto(element, data) {
  if (!element) return;
  element.classList.toggle('company-logo--image', Boolean(data.logoUrl));
  element.innerHTML = data.logoUrl
    ? `<img src="${escapeHtml(data.logoUrl)}" alt="Logo de ${escapeHtml(data.company)}" loading="lazy">`
    : escapeHtml(data.logo || '?');
  element.style.color = data.logoUrl ? '' : (data.logoColor || '');
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
  renderCompanyLogoInto(logoEl, oferta);

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
  const isEmpresa = String(session?.rol || '').toLowerCase() === 'empresa';
  const canAnalyzeMatch = Boolean(session?.token);

  if (!isEmpresa) {
    const matchWrapper = document.getElementById('matchRingWrapper');
    const matchPct = document.getElementById('matchPct');
    const matchNote = document.getElementById('matchNote');
    const analyzeBtn = document.getElementById('btnAnalyzeMatch');

    if (!canAnalyzeMatch) {
      if (matchWrapper) matchWrapper.style.display = 'none';
      if (matchPct) matchPct.textContent = '—%';
      if (analyzeBtn) {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Iniciar sesión';
      }
      if (matchNote) {
        matchNote.textContent = '';
        matchNote.style.display = 'none';
      }
    } else if (oferta.analizado) {
      renderMatchRing(oferta.match);
      setText('matchPct', `${oferta.match}%`);
      // Habilitamos el botón incluso si ya fue analizado para permitir re-análisis
      if (analyzeBtn) {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Volver a analizar match';
      }
      if (matchNote) {
        matchNote.style.display = '';
        matchNote.textContent = 'Podés volver a analizar si actualizaste tu perfil.';
      }
    } else {
      if (matchWrapper) matchWrapper.style.display = 'none';
      if (matchPct) matchPct.textContent = '—%';
      if (analyzeBtn) analyzeBtn.disabled = false;
      if (matchNote) {
        matchNote.style.display = '';
        matchNote.textContent = `Tenés análisis disponibles para esta oferta.`;
      }
    }
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
        ${renderCompanyLogo(oferta, 'cp-logo', { solid: true })}
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
        ${renderCompanyLogo(oferta, 'company-mini-logo', { solid: true })}
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
      ${renderCompanyLogo(oferta, 'mjp-logo', { solid: true })}
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

function getPdfFileNameFromUrl(url) {
  if (!url) return 'curriculum.pdf';

  try {
    const pathname = new URL(url).pathname;
    const lastSegment = decodeURIComponent(pathname.split('/').pop() || '');
    return lastSegment.replace(/^\d+-/, '') || 'curriculum.pdf';
  } catch {
    const cleanUrl = url.split('#')[0].split('?')[0];
    const lastSegment = decodeURIComponent(cleanUrl.split('/').pop() || '');
    return lastSegment.replace(/^\d+-/, '') || 'curriculum.pdf';
  }
}

function initMatchAnalysis(oferta) {
  const analyzeBtn = document.getElementById('btnAnalyzeMatch');
  if (!analyzeBtn) return;

  analyzeBtn.addEventListener('click', async () => {
    const session = getSession();
    if (!session?.token) {
      window.location.href = UI_PAGES.login;
      return;
    }

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analizando…';

    try {
      const result = await API.postJobMatchAnalysis(oferta.id);
      oferta.match = result.match;
      oferta.analizado = result.analizado;
      oferta.analisisRestantes = result.analisisRestantes;

      const matchWrapper = document.getElementById('matchRingWrapper');
      if (matchWrapper) matchWrapper.style.display = '';
      renderMatchRing(oferta.match);
      setText('matchPct', `${oferta.match}%`);
      const matchNote = document.getElementById('matchNote');
      if (matchNote) matchNote.textContent = 'Análisis actualizado con IA.';
      showToast('Match analizado con IA. Resultado actualizado.', 'success');
    } catch (err) {
      console.error('Error analizando match:', err);
      showToast(err.message || 'No se pudo analizar el match', 'error');
    } finally {
      if (analyzeBtn) {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Volver a analizar match';
      }
    }
  });
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
      <a class="job-card" href="${UI_PAGES.oferta_detalle}?id=${o.id}">
        ${badge}
        <div class="job-card-head">
          ${renderCompanyLogo(o)}
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
  let favoriteLinks = [];
  const offerLink = new URL(`${UI_PAGES.oferta_detalle}?id=${getParam('id')}`, document.baseURI).href;
  const session = getSession();
  const isCandidato = String(session?.rol || '').toLowerCase() === 'candidato' && Boolean(session?.candidatoId);

  if (!isCandidato) {
    ['btnSave', 'btnSaveAlt'].forEach((id) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.hidden = true;
      btn.style.display = 'none';
    });
    return;
  }

  ['btnSave', 'btnSaveAlt'].forEach((id) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.hidden = false;
    if (id === 'btnSave') btn.style.display = '';
  });

  function updateSaveButtons() {
    ['btnSave', 'btnSaveAlt'].forEach((id) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.classList.toggle('saved', saved);
      if (id === 'btnSaveAlt') {
        const svg = btn.querySelector('svg path');
        if (svg) svg.setAttribute('fill', saved ? 'currentColor' : 'none');
      }
      btn.title = saved ? 'Quitar de favoritos' : 'Agregar a favoritos';
      btn.setAttribute('aria-label', saved ? 'Quitar de favoritos' : 'Agregar a favoritos');
    });
  }

  async function refreshSavedState() {
    if (!session?.token || !session?.candidatoId) return;

    try {
      const profile = await API.getPerfilCandidato(session.candidatoId);
      favoriteLinks = Array.isArray(profile.favoritos) ? profile.favoritos.map(String) : [];
      saved = favoriteLinks.includes(offerLink);
      updateSaveButtons();
    } catch (err) {
      console.warn('[Detalle] No se pudo cargar favoritos:', err.message);
    }
  }

  async function toggleSave(event) {
    event?.preventDefault();
    event?.stopPropagation();

    if (!session?.token || !session?.candidatoId) {
      window.location.href = UI_PAGES.login;
      return;
    }

    const nextLinks = saved
      ? favoriteLinks.filter((link) => link !== offerLink)
      : [...favoriteLinks, offerLink];

    const buttons = ['btnSave', 'btnSaveAlt'].map((id) => document.getElementById(id)).filter(Boolean);
    buttons.forEach((btn) => btn.disabled = true);

    try {
      await API.patchPerfilCandidato(session.candidatoId, { favoritos: nextLinks });
      favoriteLinks = nextLinks;
      saved = !saved;
      updateSaveButtons();
      showToast(saved ? 'Oferta agregada a favoritos' : 'Oferta eliminada de favoritos', saved ? 'success' : 'info');
    } catch (err) {
      console.error('[Detalle] Error actualizando favoritos:', err.message);
      showToast('No se pudo actualizar favoritos', 'error');
    } finally {
      buttons.forEach((btn) => btn.disabled = false);
    }
  }

  document.getElementById('btnSave')?.addEventListener('click', toggleSave);
  document.getElementById('btnSaveAlt')?.addEventListener('click', toggleSave);

  refreshSavedState();
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

  async function loadApplicationCvPreview() {
    const session = getSession();
    const thumb = document.getElementById('applicationCvThumb');
    const frame = document.getElementById('applicationCvFrame');
    const name = document.getElementById('applicationCvName');
    const meta = document.getElementById('applicationCvMeta');
    const viewBtn = document.getElementById('applicationCvView');

    if (thumb) thumb.classList.remove('has-cv');
    if (frame) frame.removeAttribute('src');
    if (name) name.textContent = 'Cargando CV...';
    if (meta) meta.textContent = 'Buscando el CV de tu perfil.';
    if (viewBtn) {
      viewBtn.disabled = true;
      viewBtn.onclick = null;
    }

    if (!session?.token || !session?.candidatoId) {
      if (name) name.textContent = 'Sin CV cargado';
      if (meta) meta.textContent = 'Subí tu currículum vitae desde tu dashboard.';
      return;
    }

    try {
      const profile = await API.getPerfilCandidato(session.candidatoId);
      if (profile?.cvUrl) {
        if (thumb) thumb.classList.add('has-cv');
        if (frame) frame.src = `${profile.cvUrl}#toolbar=0&navpanes=0&scrollbar=0`;
        if (name) name.textContent = getPdfFileNameFromUrl(profile.cvUrl);
        if (meta) meta.textContent = 'PDF cargado en tu perfil.';
        if (viewBtn) {
          viewBtn.disabled = false;
          viewBtn.onclick = () => window.open(profile.cvUrl, '_blank');
        }
      } else {
        if (name) name.textContent = 'Sin CV cargado';
        if (meta) meta.textContent = 'Subí tu currículum vitae desde tu dashboard.';
      }
    } catch (err) {
      console.error('Error cargando CV para postulación:', err);
      if (name) name.textContent = 'Sin CV cargado';
      if (meta) meta.textContent = 'No pudimos obtener el CV de tu perfil.';
    }
  }

  function openModal()  {
    overlay?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    loadApplicationCvPreview();
  }
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
      const session = JSON.parse(sessionStorage.getItem('labuai_session') || '{}');

      if (!session.token) {
        showToast('Necesitás iniciar sesión para postularte', 'error');
        setTimeout(() => window.location.href = UI_PAGES.login, 1500);
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

  API.getOfertas({ rubro: oferta.rubro })
    .then((data) => {
      if (!Array.isArray(data)) return;
      const list = data.filter((j) => j.id !== oferta.id).slice(0, 3).map((j) => ({
        id: j.id,
        title: j.titulo,
        company: j.empresa?.nombre || 'Empresa',
        location: j.ubicacion,
        logo: j.empresa?.nombre?.charAt(0).toUpperCase() || '?',
        logoUrl: j.empresa?.logoUrl || j.logoUrl || j.empresaLogoUrl || '',
        logoColor: '#5C6BC0',
        tags: [j.modalidad, j.jornada],
        tagTypes: [j.modalidad === 'Remoto' ? 'remote' : '', ''],
        salary: j.salarioMin ? `$${j.salarioMin.toLocaleString('es-AR')}` : 'A convenir',
        time: 'Reciente',
        match: j.matchIA || 0,
        rubro: j.rubro,
      }));
      renderSimilarList(grid, list);
    })
    .catch((err) => console.error('Error cargando similares:', err));
}

function renderSimilarList(grid, list) {
  const session = getSession();
  const isEmpresa = String(session?.rol || '').toLowerCase() === 'empresa';

  grid.innerHTML = list.map((o) => {
    const tags = o.tags.map((t, i) => `<span class="job-tag ${o.tagTypes[i] || ''}">${t}</span>`).join('');
    const matchVal = o.match || 0;
    const badge = isEmpresa ? '' : `<div class="match-badge">✦ ${matchVal}% match</div>`;
    return `
      <a class="job-card" href="${UI_PAGES.oferta_detalle}?id=${o.id}">
        ${badge}
        <div class="job-card-head">
          ${renderCompanyLogo(o)}
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
function getSharePopover() {
  let pop = document.getElementById('detailSharePopover');
  if (!pop) {
    pop = document.createElement('div');
    pop.id = 'detailSharePopover';
    pop.className = 'share-popover hidden';
    pop.innerHTML = `
      <div class="share-popover-header">Compartir oferta</div>
      <div class="share-popover-row">
        <input readonly class="share-input" id="detailShareInput" aria-label="Enlace de la oferta" />
        <button type="button" class="share-copy-btn">Copiar</button>
      </div>
    `;
    document.body.appendChild(pop);
  }
  return pop;
}

function closeSharePopover() {
  const pop = document.getElementById('detailSharePopover');
  if (pop) pop.classList.add('hidden');
}

function openSharePopover(button, url) {
  const pop = getSharePopover();
  const input = pop.querySelector('.share-input');
  if (!input) return;

  const absoluteUrl = new URL(url, document.baseURI).href;
  input.value = absoluteUrl;

  const rect = button.getBoundingClientRect();
  const left = Math.min(Math.max(rect.left + rect.width / 2 - 170, 16), window.innerWidth - 336);
  const top = rect.bottom + window.scrollY + 10;

  pop.style.left = `${left}px`;
  pop.style.top = `${top}px`;
  pop.classList.remove('hidden');
  pop.style.position = 'absolute';
}

function initShare() {
  const btnShare = document.getElementById('btnShare');
  const pop = getSharePopover();
  if (!btnShare || !pop) return;

  btnShare.addEventListener('click', (event) => {
    event.stopPropagation();
    openSharePopover(btnShare, window.location.href);
  });

  pop.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  document.addEventListener('click', closeSharePopover);

  const copyBtn = pop.querySelector('.share-copy-btn');
  copyBtn?.addEventListener('click', async () => {
    const input = pop.querySelector('.share-input');
    if (!input) return;
    try {
      await navigator.clipboard.writeText(input.value);
      showToast('Link copiado al portapapeles', 'success');
    } catch (err) {
      console.error('Error copiando enlace:', err);
      showToast('No se pudo copiar el link', 'error');
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
  // Iniciar UI compartida sincrónicamente
  initNavbar();
  initNavSession();

  const id = getParam('id');
  if (!id) { window.location.href = UI_PAGES.ofertas; return; }

  try {
    const job = await API.getOferta(id);

    if (!job || !job.id) { window.location.href = UI_PAGES.ofertas; return; }

    // Mapear datos de la API al formato que espera renderPage()
    const oferta = {
      id:           job.id,
      title:        job.titulo,
      company:      job.empresa?.nombre || 'Empresa',
      location:     job.ubicacion,
      logo:         job.empresa?.nombre?.charAt(0).toUpperCase() || '?',
      logoUrl:      job.empresa?.logoUrl || job.logoUrl || job.empresaLogoUrl || '',
      logoColor:    '#5C6BC0',
      tags:         [job.modalidad, job.jornada],
      tagTypes:     [job.modalidad === 'Remoto' ? 'remote' : '', ''],
      salary:       job.salarioMin && job.salarioMax
                      ? `$${job.salarioMin.toLocaleString('es-AR')} – $${job.salarioMax.toLocaleString('es-AR')}`
                      : 'Salario a convenir',
      time:         new Date(job.creadoEn).toLocaleDateString('es-AR'),
      match:        job.matchIA || 0,
      analizado:    job.analizado || false,
      analisisRestantes: job.analisisRestantes ?? 3,
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

    renderPage(oferta);
    initMatchAnalysis(oferta);
    initTabs();
    initSave();
    initModal();
    initReport();
    initShare();

  } catch (err) {
    console.error('Error cargando oferta:', err);
    window.location.href = UI_PAGES.ofertas;
  }
});
