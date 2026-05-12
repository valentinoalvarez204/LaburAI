/* ═══════════════════════════════════════════
   LaburAI — dashboard-candidato.js
   Módulos:
   - Datos del candidato (desde API)
   - Navegación entre secciones
   - Score ring animado
   - Habilidades detectadas
   - Postulaciones con filtro
   - Ofertas recomendadas
   - Avatar dropdown
   - Sidebar mobile
════════════════════════════════════════════ */

/* ─────────────────────────────────
   DATOS DEL CANDIDATO (desde API)
─────────────────────────────────── */
let CANDIDATO = {
  nombre: '',
  cvUrl: '',
  score: 0,
  scoreData: {
    total: 0,
    nivel: 'bajo',
    tip: 'Subí tu CV para que la IA lo analice y genere tu reporte de compatibilidad.',
    criterios: []
  },
  resumen: 'Analizando perfil...',
  habilidades: [],
  techSkills: [],
  softSkills: [],
  techs: [],
  missing: [],
  experiencia: [],
};

let POSTULACIONES = [];
let RECOMENDADAS = [];

/* ─────────────────────────────────
   RENDER SCORE DEL CV
───────────────────────────────── */
function renderScore() {
  const { total, nivel, tip, criterios } = CANDIDATO.scoreData;

  // Animar ring
  const ring = document.getElementById('scoreRingFill');
  if (ring) {
    const circumference = 2 * Math.PI * 50;
    setTimeout(() => {
      ring.style.strokeDashoffset = circumference * (1 - total / 100);
    }, 200);
  }

  // Nivel del score
  const nivelEl = document.getElementById('scoreLevel');

  if (nivelEl) {
    const nivelMap = {
      bueno: { cls: 'score-level--bueno', icon: '✓', label: 'CV Competitivo' },
      regular: { cls: 'score-level--regular', icon: '⚠', label: 'Necesita mejoras' },
      bajo: { cls: 'score-level--bajo', icon: '✗', label: 'CV incompleto' },
    };
    const n = nivelMap[nivel] || nivelMap.regular;
    nivelEl.className = `score-level ${n.cls}`;
    nivelEl.innerHTML = `${n.icon} ${n.label}`;
  }

  // Criterios
  const criteriosEl = document.getElementById('scoreCriteria');
  if (criteriosEl) {
    criteriosEl.innerHTML = criterios.map((c) => `
      <div class="sc-item">
        <div class="sc-icon sc-icon--${c.estado}">${c.icono}</div>
        <div class="sc-body">
          <div class="sc-top">
            <span class="sc-label">${c.label}</span>
            <span class="sc-pts sc-pts--${c.estado}">${c.puntos}</span>
          </div>
          <div class="sc-detail">${c.detalle}</div>
        </div>
      </div>`).join('');
  }

  // Tip de la IA
  const tipEl = document.getElementById('scoreTip');
  if (tipEl) {
    tipEl.innerHTML = `
      <div class="score-tip-icon">✦</div>
      <div><strong>Consejo de LaburAI:</strong> ${tip}</div>`;
  }
}

function updateProfileCompleteness(profile) {
  const fields = [profile.nombre, profile.apellido, profile.email, profile.ubicacion, profile.telefono];
  const filled = fields.filter((v) => v != null && String(v).trim() !== '').length;
  const percent = Math.round((filled / 5) * 100);

  const fillEl = document.querySelector('.cvs-fill');
  const pctEl = document.querySelector('.cvs-pct');

  if (fillEl) {
    fillEl.style.width = `${percent}%`;
    fillEl.style.background = percent === 100 ? 'var(--success)' : 'var(--grad)';
  }

  if (pctEl) {
    if (percent === 100) {
      pctEl.classList.add('cvs-pct--complete');
      pctEl.innerHTML = `100% <span class="cvs-check">✓</span>`;
    } else {
      pctEl.classList.remove('cvs-pct--complete');
      pctEl.textContent = `${percent}%`;
    }
  }

  const ctaLink = document.querySelector('.cvs-cta');
  if (ctaLink) {
    if (percent === 100) {
      ctaLink.textContent = 'Ir a perfil →';
      ctaLink.classList.add('cvs-cta--done');
    } else {
      ctaLink.textContent = 'Completar perfil →';
      ctaLink.classList.remove('cvs-cta--done');
    }
  }
}

/* ─────────────────────────────────
   RENDER HABILIDADES DETECTADAS
───────────────────────────────── */
function renderSkills() {
  const el = document.getElementById('skillsDetected');
  if (!el) return;
  el.innerHTML = CANDIDATO.habilidades
    .map((s) => `<span class="skill-detected ${s.type}">${s.name}</span>`)
    .join('');

  // Tags resumen IA
  const tagsEl = document.getElementById('aiSummaryTags');
  if (tagsEl) {
    const main = CANDIDATO.habilidades.filter((s) => s.type === 'main').slice(0, 5);
    tagsEl.innerHTML = main
      .map((s) => `<span class="skill-detected main">${s.name}</span>`)
      .join('');
  }
}

/* ─────────────────────────────────
   RENDER ANÁLISIS IA DETALLADO
───────────────────────────────── */
function renderIAAnalysis() {
  const techEl = document.getElementById('iaTechSkills');
  const softEl = document.getElementById('iaSoftSkills');
  const techsEl = document.getElementById('iaTechs');
  const missEl = document.getElementById('iaMissing');
  const expEl = document.getElementById('expTimeline');

  if (techEl) techEl.innerHTML = CANDIDATO.techSkills.map((s) => `<span class="ia-tag">${s}</span>`).join('');
  if (softEl) softEl.innerHTML = CANDIDATO.softSkills.map((s) => `<span class="ia-tag">${s}</span>`).join('');
  if (techsEl) techsEl.innerHTML = CANDIDATO.techs.map((s) => `<span class="ia-tag">${s}</span>`).join('');
  if (missEl) missEl.innerHTML = CANDIDATO.missing.map((s) => `<span class="ia-tag missing">${s}</span>`).join('');

  if (expEl) {
    expEl.innerHTML = CANDIDATO.experiencia.map((e) => `
      <div class="exp-item">
        <div class="exp-dot-wrap">
          <div class="exp-dot"></div>
          <div class="exp-line"></div>
        </div>
        <div class="exp-content">
          <div class="exp-role">${e.role}</div>
          <div class="exp-company">${e.company}</div>
          <div class="exp-period">${e.period}</div>
          <div class="exp-desc">${e.desc}</div>
        </div>
      </div>`).join('');
  }
}

/* ─────────────────────────────────
   RENDER POSTULACIONES
───────────────────────────────── */
const STATUS_LABELS = {
  pendiente: 'Pendiente',
  revisada: 'CV revisado',
  entrevista: 'Entrevista',
  rechazada: 'No seleccionado',
};

function renderPostulaciones(filter = 'todas') {
  const list = filter === 'todas'
    ? POSTULACIONES
    : POSTULACIONES.filter((p) => p.status === filter);

  const el = document.getElementById('postulacionesList');
  if (!el) return;

  if (!list.length) {
    el.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text3);font-size:14px">No hay postulaciones en esta categoría.</div>`;
    return;
  }

  el.innerHTML = list.map((p) => `
    <a class="postul-item" href="oferta-detalle.html?id=${p.id}">
      <div class="pi-logo" style="color:${p.logoColor}">${p.logo}</div>
      <div class="pi-info">
        <div class="pi-title">${p.title}</div>
        <div class="pi-company">${p.company}</div>
        <div class="pi-date">${p.fecha}</div>
      </div>
      <div class="pi-match">✦ ${p.match}%</div>
      <div class="pi-status pi-status--${p.status}">${STATUS_LABELS[p.status]}</div>
    </a>`).join('');
}

function initPostulacionesFiltros() {
  document.querySelectorAll('.pf-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pf-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderPostulaciones(btn.dataset.pf);
    });
  });
}

/* ─────────────────────────────────
   RENDER RECOMENDADAS
───────────────────────────────── */
function renderRecomendadas() {
  const grid = document.getElementById('recGrid');
  if (!grid) return;
  grid.innerHTML = RECOMENDADAS.map((o) => {
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
   NAVEGACIÓN ENTRE SECCIONES
───────────────────────────────── */
const SECTIONS = ['overview', 'cv', 'postulaciones', 'recomendadas', 'perfil'];

function switchSection(id) {
  // Activar item del sidebar
  document.querySelectorAll('.snav-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.section === id);
  });

  // Mostrar sección correspondiente
  SECTIONS.forEach((s) => {
    const el = document.getElementById(s);
    if (!el) return;
    if (s === id) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });

  // Cerrar sidebar en mobile
  closeSidebar();

  // Scroll al top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initSidebarNav() {
  document.addEventListener('click', (e) => {
    const item = e.target.closest('.snav-item');
    if (!item) return;

    // Solo prevenir el default si tiene data-section
    if (item.dataset.section) {
      e.preventDefault();
      switchSection(item.dataset.section);
    }
  });

  // Interceptar clics en links del navbar para navegación interna (SPA)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (href.includes('#')) {
      const parts = href.split('#');
      const section = parts[1];
      // Si el link apunta a este mismo dashboard o es relativo (#seccion)
      if ((parts[0].includes('dashboard-candidato.html') || parts[0] === '') && section) {
        const sections = ['reporte', 'postulaciones', 'perfil'];
        if (sections.includes(section)) {
          e.preventDefault();
          switchSection(section);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  });
}

/* ─────────────────────────────────
   SIDEBAR MOBILE
───────────────────────────────── */
function openSidebar() {
  document.getElementById('dashSidebar')?.classList.add('open');
  document.getElementById('dashOverlay')?.classList.add('visible');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  document.getElementById('dashSidebar')?.classList.remove('open');
  document.getElementById('dashOverlay')?.classList.remove('visible');
  document.body.style.overflow = '';
}

function initDashSidebar() {
  document.getElementById('hamburger')?.addEventListener('click', () => {
    const sidebar = document.getElementById('dashSidebar');
    if (sidebar?.classList.contains('open')) { closeSidebar(); }
    else { openSidebar(); }
    document.getElementById('hamburger')?.classList.toggle('open');
  });
  document.getElementById('dashOverlay')?.addEventListener('click', () => {
    closeSidebar();
    document.getElementById('hamburger')?.classList.remove('open');
  });
}

/* ─────────────────────────────────
   BOTÓN RE-ANALIZAR (simulado)
───────────────────────────────── */
function initReanalyze() {
  const btn = document.getElementById('btnReanalyze');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const session = requireSession();
    if (!session || !session.candidatoId) return;

    btn.disabled = true;
    btn.textContent = 'Analizando…';
    
    try {
      await API.postReAnalyzeCV(session.candidatoId);
      // Recargar la vista con los datos nuevos
      await fetchProfile(session.candidatoId);
      showToast('✦ Análisis completado — CV Structurado', 'success');
    } catch (err) {
      showToast('Error re-analizando el CV', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Re-analizar';
    }
  });
}

/* ─────────────────────────────────
   COPIAR RESUMEN
───────────────────────────────── */
function initCopySummary() {
  document.getElementById('btnCopySummary')?.addEventListener('click', () => {
    const text = document.getElementById('aiSummaryText')?.textContent || '';
    navigator.clipboard.writeText(text).then(() => {
      showToast('Resumen copiado al portapapeles', 'success');
    });
  });
}

function initUploadCv() {
  const btnUpload = document.getElementById('btnUploadNew');
  const fileInput = document.getElementById('cvFileInput');
  if (!btnUpload || !fileInput) return;

  // Función para actualizar el estado del botón según si hay CV
  function updateUploadButton(hasCv) {
    if (hasCv) {
      btnUpload.style.opacity = '0.5';
      btnUpload.style.cursor = 'not-allowed';
      btnUpload.title = 'Ya tienes un CV subido. No puedes subir más de uno.';
    } else {
      btnUpload.style.opacity = '1';
      btnUpload.style.cursor = 'pointer';
      btnUpload.title = '';
    }
  }

  // Inicializar estado del botón (asumir que no hay CV hasta que se cargue el perfil)
  updateUploadButton(false);

  btnUpload.addEventListener('click', (e) => {
    const session = requireSession();
    if (!session?.candidatoId) return;

    // Verificar si ya tiene un CV subido
    if (CANDIDATO.cvUrl) {
      // Mostrar mensaje de error usando showToast
      showToast('No es posible subir más de 1 CV', 'error');
      e.preventDefault();
      return;
    }

    fileInput.click();
  });

  fileInput.addEventListener('change', async () => {
    const session = requireSession();
    if (!session?.candidatoId) return;

    const file = fileInput.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Solo se permiten archivos PDF', 'error');
      fileInput.value = '';
      return;
    }

    btnUpload.disabled = true;
    btnUpload.textContent = 'Subiendo…';

    try {
      await API.uploadCv(session.candidatoId, file);
      showToast('CV subido correctamente', 'success');
      await fetchProfile(session.candidatoId);
    } catch (err) {
      console.error('[Dashboard] Error subiendo CV:', err);
      showToast(err.message || 'Error al subir el CV', 'error');
    } finally {
      btnUpload.disabled = false;
      btnUpload.textContent = 'Subir mi CV';
      fileInput.value = '';
    }
  });

  // Exponer la función para actualizar el botón desde otras partes del código
  window.updateUploadButton = updateUploadButton;
}

/* ─────────────────────────────────
   GUARDAR PERFIL
───────────────────────────────── */
function initSaveProfile() {
  document.getElementById('btnSaveProfile')?.addEventListener('click', async () => {
    const btn = document.getElementById('btnSaveProfile');
    const session = JSON.parse(sessionStorage.getItem('labuai_session') || '{}');

    if (!session.candidatoId) {
      showToast('No se encontró tu perfil', 'error');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Guardando…';

    try {
      const telefonoVal = document.getElementById('profileTelefono')?.value?.trim();
      const payload = {
        nombre: document.getElementById('profileNombre')?.value?.trim() || undefined,
        apellido: document.getElementById('profileApellido')?.value?.trim() || undefined,
        ubicacion: document.getElementById('profileUbicacion')?.value?.trim() || undefined,
        telefono: telefonoVal ? telefonoVal : null,
      };

      await API.patchPerfilCandidato(session.candidatoId, payload);

      btn.disabled = false;
      btn.textContent = 'Guardar cambios';
      showToast('Perfil actualizado correctamente', 'success');

      // Actualizar el estado local y campos de la UI
      const profileNombre = document.getElementById('profileNombre');
      const profileApellido = document.getElementById('profileApellido');
      const profileUbicacion = document.getElementById('profileUbicacion');
      const profileTelefono = document.getElementById('profileTelefono');
      const profileEmail = document.getElementById('profileEmail');
      if (profileNombre) profileNombre.value = payload.nombre || '';
      if (profileApellido) profileApellido.value = payload.apellido || '';
      if (profileUbicacion) profileUbicacion.value = payload.ubicacion || '';
      if (profileTelefono) profileTelefono.value = payload.telefono || '';

      updateProfileCompleteness({
        nombre: payload.nombre,
        apellido: payload.apellido,
        email: profileEmail?.value,
        ubicacion: payload.ubicacion,
        telefono: payload.telefono,
      });
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Guardar cambios';
      console.error('[Dashboard] Error guardando perfil', err);
      showToast('Error al guardar', 'error');
    }
  });
}

/* ─────────────────────────────────
   MODAL PDF
───────────────────────────────── */
function initPdfModal() {
  const modal = document.getElementById('pdfModal');
  const frame = document.getElementById('pdfModalFrame');
  const close = document.getElementById('pdfModalClose');
  const btn   = document.getElementById('cvThumbnailBtn');

  if (!modal || !frame || !btn) return;

  const openModal = () => {
    // Solo permitimos abrir si hay un src definido
    if (frame.src) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  btn.addEventListener('click', openModal);
  close.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
}

/* ─────────────────────────────────
   TOAST
───────────────────────────────── */

/* ─────────────────────────────────
   INIT
───────────────────────────────── */
/* ─────────────────────────────────
   FETCH DATOS REALES
───────────────────────────────── */
async function fetchProfile(candidatoId) {
  try {
    const data = await API.getPerfilCandidato(candidatoId);

    CANDIDATO.nombre = `${data.nombre || ''} ${data.apellido || ''}`.trim();
    CANDIDATO.score  = data.scoreCV || 0;
    CANDIDATO.cvUrl  = data.cvUrl || '';
    CANDIDATO.resumen = data.resumenIA || 'Subí tu CV para que la IA genere un resumen de tu perfil profesional.';

    const firstName = CANDIDATO.nombre.split(' ')[0] || 'Usuario';
    const inicial   = firstName.charAt(0).toUpperCase();

    // Sidebar
    const spAvatar = document.getElementById('spAvatar');
    const spName   = document.getElementById('spName');
    if (spAvatar) spAvatar.textContent = inicial;
    if (spName)   spName.textContent   = CANDIDATO.nombre || firstName;

    // Todos los avatares y nombres dinámicos del dash
    document.querySelectorAll('.avatar-circle').forEach(el => el.textContent = inicial);
    document.querySelectorAll('.avatar-name').forEach(el   => el.textContent = CANDIDATO.nombre);

    // Saludo
    const greetTitle = document.getElementById('greetingTitle');
    const greetSub   = document.getElementById('greetingSub');
    if (greetTitle) greetTitle.textContent = `¡Hola, ${firstName}! 👋`;
    if (greetSub)   greetSub.innerHTML    = `Tu perfil está activo y visible para las empresas.`;

    // Score num
    const scoreNumEl = document.getElementById('scoreNum');
    if (scoreNumEl) scoreNumEl.textContent = data.scoreCV > 0 ? data.scoreCV : '—';

    // Resumen IA
    const aiSummary = document.getElementById('aiSummaryText');
    if (aiSummary) aiSummary.textContent = CANDIDATO.resumen;

    // CV info y Miniatura
    const cvFileName   = document.getElementById('cvFileName');
    const cvFileMeta   = document.getElementById('cvFileMeta');
    const thumbBtn     = document.getElementById('cvThumbnailBtn');
    const thumbFrame   = document.getElementById('cvThumbnail');
    const emptyIcon    = document.getElementById('cvEmptyIcon');
    const modalFrame   = document.getElementById('pdfModalFrame');
    const badgeText    = document.getElementById('cvBadgeText');
    const statusDot    = document.querySelector('.cvp-status-dot');
    const btnDownload  = document.getElementById('btnDownloadCV');

    if (data.cvUrl) {
      if (cvFileName) cvFileName.textContent = 'Tu Currículum Vitae';
      if (cvFileMeta) cvFileMeta.innerHTML = 'Documento principal visible para búsquedas y procesado por el motor de IA.';
      if (badgeText)  badgeText.textContent = 'Analizado y activo';
      if (statusDot)  statusDot.classList.add('active');
      if (btnDownload) {
        btnDownload.disabled = false;
        btnDownload.onclick = () => window.open(data.cvUrl, '_blank');
      }
      
      // Mostrar miniatura
      if (thumbBtn)   thumbBtn.classList.remove('hidden');
      if (emptyIcon)  emptyIcon.classList.add('hidden');
      
      // Cargar PDF en frames (agregando #toolbar=0 para una vista más limpia en la miniatura)
      if (thumbFrame) thumbFrame.src = data.cvUrl + '#toolbar=0&navpanes=0&scrollbar=0';
      if (modalFrame) modalFrame.src = data.cvUrl;

      // Actualizar botón de subida (deshabilitar si ya hay CV)
      if (window.updateUploadButton) window.updateUploadButton(true);
    } else {
      if (cvFileName) cvFileName.textContent = 'Sin CV subido';
      if (cvFileMeta) cvFileMeta.textContent = 'Subí tu currículum vitae en formato PDF para que nuestro motor de IA pueda estructurar tu perfil profesional.';
      if (badgeText)  badgeText.textContent = 'Pendiente';
      if (statusDot)  statusDot.classList.remove('active');
      if (btnDownload) btnDownload.disabled = true;
      
      if (thumbBtn)   thumbBtn.classList.add('hidden');
      if (emptyIcon)  emptyIcon.classList.remove('hidden');

      // Actualizar botón de subida (habilitar si no hay CV)
      if (window.updateUploadButton) window.updateUploadButton(false);
    }

    // Formulario de Mi perfil
    const profileNombre    = document.getElementById('profileNombre');
    const profileApellido  = document.getElementById('profileApellido');
    const profileEmail     = document.getElementById('profileEmail');
    const profileUbicacion = document.getElementById('profileUbicacion');
    const profileTelefono  = document.getElementById('profileTelefono');
    if (profileNombre)    profileNombre.value    = data.nombre    || '';
    if (profileApellido)  profileApellido.value  = data.apellido  || '';
    if (profileEmail)     profileEmail.value     = data.usuario?.email || '';
    if (profileUbicacion) profileUbicacion.value = data.ubicacion || '';
    if (profileTelefono)  profileTelefono.value  = data.telefono  || '';

    updateProfileCompleteness({
      nombre:    data.nombre,
      apellido:  data.apellido,
      email:     data.usuario?.email,
      ubicacion: data.ubicacion,
      telefono:  data.telefono,
    });

    const hasExp = Array.isArray(data.experiencias) && data.experiencias.length > 0;
    const expDetail = hasExp 
      ? data.experiencias.map(e => `• ${e.rol} en ${e.empresa}`).join('<br>')
      : 'Subí tu CV para extraer tu experiencia';

    const hasFormacion = Array.isArray(data.formacion) && data.formacion.length > 0;
    const formacionDetail = hasFormacion
      ? data.formacion.map(f => `• ${f}`).join('<br>')
      : 'Subí tu CV para extraer tu formación académica';

    CANDIDATO.scoreData = {
      total:  data.scoreCV || 0,
      nivel:  (data.scoreCV >= 75) ? 'bueno' : (data.scoreCV >= 50 ? 'regular' : 'bajo'),
      tip:    data.scoreCV > 0
                ? '¡Buen trabajo! Seguí mejorando tu perfil para aumentar tu visibilidad.'
                : 'Subí tu CV para obtener un análisis detallado.',
      criterios: [
        { icono: '💼', label: 'Experiencia laboral', estado: hasExp ? 'ok' : 'warn', puntos: hasExp ? data.experiencias.length : '-', detalle: expDetail },
        { icono: '🎓', label: 'Formación académica', estado: hasFormacion ? 'ok' : 'warn', puntos: hasFormacion ? data.formacion.length : '-', detalle: formacionDetail },
      ]
    };

    if (Array.isArray(data.habilidades) && data.habilidades.length) {
      CANDIDATO.habilidades = data.habilidades.map(s => ({ name: s.trim(), type: 'main' }));
    }

    CANDIDATO.missing = data.habilidadesFaltantes || [];

    if (Array.isArray(data.habilidadesTech)) {
      CANDIDATO.techSkills = data.habilidadesTech.filter(h => h.tipo === 'TECNICA').map(h => h.nombre);
      CANDIDATO.softSkills = data.habilidadesTech.filter(h => h.tipo === 'BLANDA').map(h => h.nombre);
      CANDIDATO.techs = data.habilidadesTech.filter(h => h.tipo === 'TECNOLOGIA').map(h => h.nombre);
    }

    if (Array.isArray(data.experiencias)) {
      CANDIDATO.experiencia = data.experiencias.map(e => ({
        role: e.rol,
        company: e.empresa,
        period: `${e.desde} – ${e.hasta}`,
        desc: e.descripcion || ''
      }));
    }

    renderScore();
    renderSkills();
    renderIAAnalysis();

  } catch (err) {
    console.error('[Dashboard] Error cargando perfil:', err.message);
  }
}

async function fetchRecommendations() {
  try {
    const data = await API.getOfertas();
    if (!Array.isArray(data)) return;

    RECOMENDADAS = data.slice(0, 6).map(job => ({
      id: job.id,
      title: job.titulo,
      company: job.empresa?.nombre || 'Empresa',
      location: job.ubicacion,
      logo: job.empresa?.nombre?.charAt(0).toUpperCase() || '?',
      logoColor: '#5C6BC0',
      tags: [job.modalidad, job.jornada],
      tagTypes: [job.modalidad === 'Remoto' ? 'remote' : '', ''],
      salary: job.salarioMin ? `$${job.salarioMin.toLocaleString('es-AR')}` : 'A convenir',
      time: 'Reciente',
      match: null, // Sin mock: se mostrara solo si el backend lo provee
    }));

    renderRecomendadas();
  } catch (err) {
    console.error('[Dashboard] Error cargando recomendaciones:', err.message);
  }
}


/* ─────────────────────────────────
   INIT
───────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  // 0. Render sidebar first
  renderSidebarNav('candidato', 'overview');

  // 1. Sección inicial desde URL/hash
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash.substring(1);
  const initialSection = params.get('section') || hash || 'overview';
  initCopySummary();
  initPdfModal();
  
  if (SECTIONS.includes(initialSection)) switchSection(initialSection);

  // 2. Validar sesión
  const session = requireSession();
  if (!session) return;

  // 3. Cargar perfil primero, luego inicializar controles
  if (session.candidatoId) {
    // Cargar perfil primero (esperar a que termine)
    await fetchProfile(session.candidatoId);

    // Inicializar controles de subida después de cargar el perfil
    initUploadCv();

    // Postulaciones
    try {
      const data = await API.getPostulaciones({ candidatoId: session.candidatoId });
      if (Array.isArray(data)) {
        POSTULACIONES = data.map(p => ({
          id: p.ofertaId,
          title: p.oferta?.titulo || 'Oferta',
          company: p.oferta?.empresa?.nombre || 'Empresa',
          logo: p.oferta?.empresa?.nombre?.charAt(0).toUpperCase() || '?',
          logoColor: '#5C6BC0',
          fecha: new Date(p.creadoEn).toLocaleDateString('es-AR'),
          status: p.estado.toLowerCase(),
          match: p.matchIA || null,
        }));

        // Actualizar el contador del botón "Todas"
        const pfBtnTodas = document.getElementById('pfBtnTodas');
        if (pfBtnTodas) pfBtnTodas.textContent = `Todas (${POSTULACIONES.length})`;

        const badge = document.querySelector('.snav-item[data-section="postulaciones"] .snav-badge');
        if (badge) badge.textContent = POSTULACIONES.length;

        renderPostulaciones();
      }
    } catch (err) {
      console.error('[Dashboard] Error cargando postulaciones:', err.message);
    }

    // Stats candidato (en paralelo, no bloquean)
    API.getStatsCandidato(session.candidatoId)
      .then((stats) => {
        const statEls = document.querySelectorAll('.dstat-num');
        const vals = [stats.totalPostulaciones, stats.entrevistas ?? 0, stats.pendientes ?? 0, stats.rechazadas ?? 0];
        statEls.forEach((el, i) => { if (vals[i] !== undefined) el.textContent = vals[i]; });
      })
      .catch((err) => console.error('[Dashboard] Error cargando stats candidato:', err.message));
  }

  // 4. Recomendaciones
  fetchRecommendations();

  // 5. Interacciones
  initNavbar();
  initNavSession();
  initSidebarNav();
  initPostulacionesFiltros();
  initReanalyze();
  initCopySummary();
  initSaveProfile();
});