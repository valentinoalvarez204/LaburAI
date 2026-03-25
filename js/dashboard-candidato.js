/* ══════════════════════════════════════════
   LaburAI — dashboard-candidato.js
   Módulos:
   - Datos del candidato (simulados)
   - Navegación entre secciones
   - Score ring animado
   - Habilidades detectadas
   - Postulaciones con filtro
   - Ofertas recomendadas
   - Avatar dropdown
   - Sidebar mobile
══════════════════════════════════════════ */

/* ─────────────────────────────────
   DATOS DEL CANDIDATO
───────────────────────────────── */
/* ─────────────────────────────────
   DATOS DEL CANDIDATO (ahora desde API)
───────────────────────────────── */
let CANDIDATO = {
  nombre: '',
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
    btn.disabled = true;
    btn.textContent = 'Analizando…';
    await delay(2000);
    btn.disabled = false;
    btn.textContent = 'Re-analizar';
    showToast('✦ Análisis completado — Score actualizado', 'success');
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

/* ─────────────────────────────────
   GUARDAR PERFIL
───────────────────────────────── */
function initSaveProfile() {
  document.getElementById('btnSaveProfile')?.addEventListener('click', async () => {
    const btn = document.getElementById('btnSaveProfile');
    const session = JSON.parse(localStorage.getItem('labuai_session') || '{}');

    if (!session.candidatoId) {
      showToast('No se encontró tu perfil', 'error');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Guardando…';

    try {
      const res = await fetch(`http://localhost:3000/api/profile/candidato/${session.candidatoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: document.querySelector('input[value="Valentina González"]')?.value || undefined,
          ubicacion: document.querySelector('input[placeholder="Ej: Córdoba, Argentina"]')?.value || undefined,
          telefono: document.querySelector('input[type="text"]:nth-of-type(4)')?.value || undefined,
        }),
      });

      btn.disabled = false;
      btn.textContent = 'Guardar cambios';

      if (res.ok) {
        showToast('Perfil actualizado correctamente', 'success');
      } else {
        showToast('Error al guardar', 'error');
      }

    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Guardar cambios';
      showToast('No se pudo conectar con el servidor', 'error');
    }
  });
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
    CANDIDATO.score = data.scoreCV || 0;
    CANDIDATO.resumen = data.resumenIA || 'Subí tu CV para que la IA genere un resumen de tu perfil profesional.';
    CANDIDATO.scoreData = {
      total: data.scoreCV || 0,
      nivel: (data.scoreCV >= 75) ? 'bueno' : (data.scoreCV >= 50 ? 'regular' : 'bajo'),
      tip: data.scoreCV > 0 ? '¡Buen trabajo! Seguí mejorando tu perfil para aumentar tu visibilidad.' : 'Subí tu CV para obtener un análisis detallado.',
      criterios: [
        { icono: '💼', label: 'Experiencia laboral', estado: data.scoreCV > 10 ? 'ok' : 'warn', puntos: '-', detalle: 'Datos extraídos de tu CV' },
        { icono: '🎓', label: 'Formación académica', estado: data.scoreCV > 10 ? 'ok' : 'warn', puntos: '-', detalle: 'Datos extraídos de tu CV' },
      ]
    };

    if (Array.isArray(data.habilidades) && data.habilidades.length) {
      CANDIDATO.habilidades = data.habilidades.map(s => ({ name: s.trim(), type: 'main' }));
    }

    renderScore();
    renderSkills();
    renderIAAnalysis();

    const firstName = CANDIDATO.nombre.split(' ')[0];
    const greetEl = document.querySelector('.greeting-title');
    if (greetEl) greetEl.textContent = `¡Hola, ${firstName}! 👋`;
    document.querySelectorAll('.sp-avatar, .avatar-circle').forEach(el => el.textContent = firstName.charAt(0).toUpperCase());
    document.querySelectorAll('.sp-name, .avatar-name').forEach(el => el.textContent = CANDIDATO.nombre);

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
  if (SECTIONS.includes(initialSection)) switchSection(initialSection);

  // 2. Validar sesión
  const session = requireSession();
  if (!session) return;

  // 3. Cargar perfil y postulaciones en paralelo
  if (session.candidatoId) {
    // Perfil (no bloqueante)
    fetchProfile(session.candidatoId);

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