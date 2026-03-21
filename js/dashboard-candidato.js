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
const CANDIDATO = {
  nombre: 'Valentina González',
  score: 82,

  // Criterios reales que componen el score
  scoreData: {
    total: 82,
    // nivel: bueno (75-100) / regular (50-74) / bajo (0-49)
    nivel: 'bueno',
    tip: 'Para llegar a <strong>90+</strong> agregá tu perfil de LinkedIn y un objetivo profesional al inicio del CV. Con esos dos cambios tu score subiría aproximadamente 10 puntos.',
    criterios: [
      {
        icono: '💼',
        label: 'Experiencia laboral',
        estado: 'ok',
        puntos: '25/25',
        detalle: '<strong>3 posiciones detectadas</strong> · 5 años de experiencia total · Último cargo: Ejecutiva de Ventas Sr. en Arcor',
      },
      {
        icono: '🎓',
        label: 'Formación académica',
        estado: 'ok',
        puntos: '20/20',
        detalle: '<strong>Universitario completo</strong> · Lic. en Comercialización · Universidad Siglo 21',
      },
      {
        icono: '🛠️',
        label: 'Habilidades y tecnologías',
        estado: 'ok',
        puntos: '18/20',
        detalle: '<strong>12 habilidades detectadas</strong> · 6 tecnologías · Falta especificar nivel de idiomas',
      },
      {
        icono: '📋',
        label: 'Completitud del perfil',
        estado: 'warn',
        puntos: '12/20',
        detalle: 'Faltan: <strong>LinkedIn, foto, objetivo profesional</strong> · Teléfono y ubicación sí están presentes',
      },
      {
        icono: '✍️',
        label: 'Claridad y estructura',
        estado: 'ok',
        puntos: '7/15',
        detalle: 'Estructura <strong>clara y ordenada</strong> · Longitud adecuada (2 páginas) · Ortografía correcta',
      },
    ],
  },

  resumen: 'Profesional con más de 5 años de experiencia en ventas B2B y gestión de cuentas en el sector de consumo masivo. Sólido historial en cumplimiento de objetivos comerciales, negociación y desarrollo de carteras de clientes en canales modernos y tradicionales. Orientada a resultados, con alta capacidad de adaptación y excelentes habilidades comunicacionales.',
  habilidades: [
    { name: 'Ventas B2B',         type: 'main' },
    { name: 'Negociación',        type: 'main' },
    { name: 'Gestión de cuentas', type: 'main' },
    { name: 'CRM Salesforce',     type: 'tech' },
    { name: 'Excel avanzado',     type: 'tech' },
    { name: 'Power BI',           type: 'tech' },
    { name: 'Liderazgo',          type: 'soft' },
    { name: 'Comunicación',       type: 'soft' },
    { name: 'Trabajo en equipo',  type: 'soft' },
    { name: 'Adaptabilidad',      type: 'soft' },
    { name: 'Canal moderno',      type: 'main' },
    { name: 'Canal tradicional',  type: 'main' },
  ],
  techSkills:  ['CRM Salesforce', 'Excel avanzado', 'Power BI', 'SAP (básico)', 'Google Workspace'],
  softSkills:  ['Liderazgo', 'Negociación', 'Comunicación efectiva', 'Orientación a resultados', 'Trabajo en equipo'],
  techs:       ['Salesforce', 'Excel', 'Power BI', 'SAP', 'Google Sheets', 'Slack'],
  missing:     ['Inglés avanzado', 'HubSpot', 'SQL básico', 'Marketing digital'],
  experiencia: [
    { role: 'Ejecutiva de Ventas Sr.', company: 'Grupo Arcor', period: 'Mar 2021 – Presente · 5 años', desc: 'Gestión de cartera de 80+ clientes en canal moderno. Cumplimiento de objetivos anuales en 118%. Coordinación de equipo de 3 vendedores jr.' },
    { role: 'Asesora Comercial',       company: 'Danone Argentina', period: 'Jun 2019 – Feb 2021 · 1 año 8 meses', desc: 'Atención y desarrollo de cuentas en canal supermercadista regional. Incorporación de 15 nuevas cuentas en el primer año.' },
    { role: 'Promotora de Ventas',     company: 'Unilever',     period: 'Ene 2018 – May 2019 · 1 año 4 meses', desc: 'Activaciones en punto de venta y seguimiento de métricas de sell-out en Córdoba Capital.' },
  ],
};

const POSTULACIONES = [
  { id:1, title:'Vendedor/a Senior',       company:'Grupo Arcor',    logo:'A', logoColor:'#5C6BC0', fecha:'hace 2 días',  status:'entrevista', match:97 },
  { id:2, title:'Ejecutiva de Cuentas',    company:'Nestlé',         logo:'N', logoColor:'#11998E', fecha:'hace 4 días',  status:'revisada',   match:91 },
  { id:3, title:'Key Account Manager',     company:'P&G Argentina',  logo:'P', logoColor:'#7C4DFF', fecha:'hace 6 días',  status:'pendiente',  match:88 },
  { id:4, title:'Gerente Comercial Jr.',   company:'Molinos Río',    logo:'M', logoColor:'#F7971E', fecha:'hace 1 semana',status:'pendiente',  match:84 },
  { id:5, title:'Asesor/a de Ventas',      company:'Coca-Cola',      logo:'C', logoColor:'#E65100', fecha:'hace 2 semanas',status:'rechazada', match:79 },
  { id:6, title:'Representante Comercial', company:'3M Argentina',   logo:'3', logoColor:'#5C6BC0', fecha:'hace 2 semanas',status:'pendiente',  match:76 },
  { id:7, title:'Coordinadora de Ventas',  company:'Bimbo',          logo:'B', logoColor:'#11998E', fecha:'hace 3 semanas',status:'revisada',  match:74 },
  { id:8, title:'Trade Marketing Analyst', company:'Pepsico',        logo:'P', logoColor:'#7C4DFF', fecha:'hace 1 mes',   status:'rechazada',  match:71 },
];

const RECOMENDADAS = [
  { id:1,  title:'Vendedor/a Senior',     company:'Arcor',       location:'Córdoba',   logo:'A', logoColor:'#5C6BC0', tags:['Presencial','FMCG'],    tagTypes:['',''],       salary:'$450.000 – $650.000', time:'hace 1h',  match:97 },
  { id:2,  title:'Key Account Manager',   company:'Unilever',    location:'Buenos Aires',logo:'U',logoColor:'#11998E',tags:['Híbrido','B2B'],        tagTypes:['',''],       salary:'$600.000 – $850.000', time:'hace 3h',  match:94 },
  { id:3,  title:'Ejecutiva de Cuentas',  company:'Nestlé',      location:'Remoto',    logo:'N', logoColor:'#7C4DFF', tags:['Remoto','FMCG'],        tagTypes:['remote',''], salary:'$500.000 – $700.000', time:'hace 5h',  match:91 },
  { id:4,  title:'Sales Manager',         company:'Danone',      location:'Córdoba',   logo:'D', logoColor:'#F7971E', tags:['Presencial','Canal mod'],tagTypes:['',''],       salary:'$700.000 – $950.000', time:'hace 8h',  match:89 },
  { id:5,  title:'Trade Marketing Sr.',   company:'Pepsico',     location:'Buenos Aires',logo:'P',logoColor:'#E65100',tags:['Híbrido','Urgente'],    tagTypes:['','hot'],    salary:'$550.000 – $780.000', time:'hace 1d',  match:86 },
  { id:6,  title:'Representante Comercial',company:'3M',         location:'Rosario',   logo:'3', logoColor:'#5C6BC0', tags:['Presencial'],           tagTypes:[''],          salary:'$380.000 – $520.000', time:'hace 2d',  match:83 },
];

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
      bueno:   { cls: 'score-level--bueno',   icon: '✓', label: 'CV Competitivo' },
      regular: { cls: 'score-level--regular', icon: '⚠', label: 'Necesita mejoras' },
      bajo:    { cls: 'score-level--bajo',     icon: '✗', label: 'CV incompleto' },
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
  const techEl    = document.getElementById('iaTechSkills');
  const softEl    = document.getElementById('iaSoftSkills');
  const techsEl   = document.getElementById('iaTechs');
  const missEl    = document.getElementById('iaMissing');
  const expEl     = document.getElementById('expTimeline');

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
  pendiente:  'Pendiente',
  revisada:   'CV revisado',
  entrevista: 'Entrevista',
  rechazada:  'No seleccionado',
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
    return `
      <a class="job-card" href="oferta-detalle.html?id=${o.id}">
        <div class="match-badge">✦ ${o.match}% match</div>
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
  document.querySelectorAll('.snav-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      switchSection(item.dataset.section);
    });
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
   GUARDAR PERFIL (simulado)
───────────────────────────────── */
function initSaveProfile() {
  document.getElementById('btnSaveProfile')?.addEventListener('click', async () => {
    const btn = document.getElementById('btnSaveProfile');
    btn.disabled = true;
    btn.textContent = 'Guardando…';
    await delay(1200);
    btn.disabled = false;
    btn.textContent = 'Guardar cambios';
    showToast('Perfil actualizado correctamente', 'success');
  });
}

/* ─────────────────────────────────
   TOAST
───────────────────────────────── */

/* ─────────────────────────────────
   INIT
───────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Render data
  renderScore();
  renderSkills();
  renderIAAnalysis();
  renderPostulaciones();
  renderRecomendadas();

  // Interacciones
  initSidebarNav();
  initDashSidebar();
  initAvatarDropdown();
  initPostulacionesFiltros();
  initReanalyze();
  initCopySummary();
  initSaveProfile();
});
