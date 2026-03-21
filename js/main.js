/* ══════════════════════════════════════════
   LaburAI — main.js
   Módulos: navbar · hamburger · reveal
            counters · chips · search · jobs · tabs
══════════════════════════════════════════ */

/* ─────────────────────────────────
   DATOS: Ofertas de trabajo
───────────────────────────────── */
const JOBS = [
  {
    id: 1,
    title: 'Vendedor/a Senior',
    company: 'Grupo Arcor',
    location: 'Córdoba',
    logo: 'A', logoColor: '#5C6BC0',
    tags: ['Presencial', 'FMCG', 'B2B'],
    tagTypes: ['', '', ''],
    salary: '$450.000 – $650.000',
    time: 'hace 1h',
    match: 97,
    filter: ['todos', 'fulltime'],
  },
  {
    id: 2,
    title: 'Enfermero/a General',
    company: 'Clínica Sucre',
    location: 'Buenos Aires',
    logo: 'C', logoColor: '#11998E',
    tags: ['Presencial', 'Guardia', 'Urgente'],
    tagTypes: ['', '', 'hot'],
    salary: '$380.000 – $520.000',
    time: 'hace 3h',
    match: 93,
    filter: ['todos', 'fulltime'],
  },
  {
    id: 3,
    title: 'Administrativo/a Contable',
    company: 'Techint',
    location: 'Remoto',
    logo: 'T', logoColor: '#7C4DFF',
    tags: ['Remoto', 'SAP', 'Excel'],
    tagTypes: ['remote', '', ''],
    salary: '$420.000 – $580.000',
    time: 'hace 5h',
    match: 91,
    filter: ['todos', 'remoto', 'fulltime'],
  },
  {
    id: 4,
    title: 'Maestro/a de Primaria',
    company: 'Colegio San Martín',
    location: 'Rosario',
    logo: 'S', logoColor: '#F7971E',
    tags: ['Presencial', 'Turno tarde', 'Part time'],
    tagTypes: ['', '', ''],
    salary: '$290.000 – $370.000',
    time: 'hace 8h',
    match: 88,
    filter: ['todos', 'recientes'],
  },
  {
    id: 5,
    title: 'Encargado/a de Depósito',
    company: 'DHL Argentina',
    location: 'Buenos Aires',
    logo: 'D', logoColor: '#E65100',
    tags: ['Presencial', 'Logística', 'Urgente'],
    tagTypes: ['', '', 'hot'],
    salary: '$360.000 – $480.000',
    time: 'hace 1d',
    match: 86,
    filter: ['todos', 'recientes', 'fulltime'],
  },
  {
    id: 6,
    title: 'Desarrollador/a Backend',
    company: 'Naranja X',
    location: 'Córdoba / Remoto',
    logo: 'N', logoColor: '#5C6BC0',
    tags: ['Remoto', 'NestJS', 'Full time'],
    tagTypes: ['remote', '', ''],
    salary: '$2.800 – $4.200 USD',
    time: 'hace 1d',
    match: 85,
    filter: ['todos', 'remoto', 'fulltime'],
  },
  {
    id: 7,
    title: 'Chef de Partida',
    company: 'Restaurante El Federal',
    location: 'CABA',
    logo: 'E', logoColor: '#11998E',
    tags: ['Presencial', 'Cocina fría', 'Part time'],
    tagTypes: ['', '', ''],
    salary: '$320.000 – $430.000',
    time: 'hace 2d',
    match: 82,
    filter: ['todos', 'recientes'],
  },
  {
    id: 8,
    title: 'Analista de RRHH',
    company: 'Banco Galicia',
    location: 'Remoto',
    logo: 'B', logoColor: '#7C4DFF',
    tags: ['Remoto', 'Selección', 'Full time'],
    tagTypes: ['remote', '', ''],
    salary: '$480.000 – $620.000',
    time: 'hace 2d',
    match: 80,
    filter: ['todos', 'remoto', 'fulltime'],
  },
  {
    id: 9,
    title: 'Electricista Industrial',
    company: 'YPF',
    location: 'Neuquén',
    logo: 'Y', logoColor: '#F7971E',
    tags: ['Presencial', 'MT/BT', 'Urgente'],
    tagTypes: ['', '', 'hot'],
    salary: '$520.000 – $700.000',
    time: 'hace 3d',
    match: 78,
    filter: ['todos', 'recientes'],
  },
];

/* ─────────────────────────────────
   HAMBURGER
───────────────────────────────── */

/* ─────────────────────────────────
   SCROLL REVEAL
───────────────────────────────── */
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal, .reveal-card').forEach((el, i) => {
    // Stagger para los cards del hero
    if (el.classList.contains('reveal-card')) {
      el.style.transitionDelay = (i * 0.08) + 's';
    }
    observer.observe(el);
  });
}

function initCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const el     = e.target;
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, 1800, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-num[data-target]').forEach((el) => observer.observe(el));
}

/* ─────────────────────────────────
   SESIÓN — leer localStorage
   login.js guarda: { nombre, rol }
   en labuai_session al registrarse/ingresar
───────────────────────────────── */
function getSession() {
  try {
    const raw = localStorage.getItem('labuai_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/* ─────────────────────────────────
   NAVBAR — adaptar según sesión
───────────────────────────────── */
function initNavSession() {
  const session = getSession();
  const actions = document.getElementById('navActions');
  const mobile  = document.getElementById('mobileNavActions');
  if (!actions) return;

  if (session) {
    const dashboard = session.rol === 'empresa'
      ? 'dashboard-empresa.html'
      : 'dashboard-candidato.html';

    // Primer nombre solo
    const firstName = session.nombre.split(' ')[0];

    actions.innerHTML = `
      <a href="${dashboard}" class="nav-user-btn">
        <div class="nav-avatar">${firstName.charAt(0).toUpperCase()}</div>
        <span class="nav-user-name">${firstName}</span>
      </a>
      <a href="${dashboard}" class="btn-primary">Mi dashboard</a>`;

    if (mobile) {
      mobile.innerHTML = `
        <a href="${dashboard}" class="btn-primary" style="text-align:center;display:block">
          Mi dashboard — ${firstName}
        </a>
        <button onclick="cerrarSesion()" class="btn-ghost"
          style="text-align:center;display:block;width:100%;margin-top:8px">
          Cerrar sesión
        </button>`;
    }
  }
}

function cerrarSesion() {
  localStorage.removeItem('labuai_session');
  window.location.reload();
}

/* ─────────────────────────────────
   CTA — adaptar según sesión
───────────────────────────────── */
function initCtaSession() {
  const session = getSession();
  const inner   = document.getElementById('ctaInner');
  if (!inner || !session) return;

  const dashboard  = session.rol === 'empresa'
    ? 'dashboard-empresa.html'
    : 'dashboard-candidato.html';
  const firstName  = session.nombre.split(' ')[0];

  inner.innerHTML = `
    <div class="cta-star">✦</div>
    <h2 class="cta-title">¡Bienvenido/a de vuelta, ${firstName}!</h2>
    <p class="cta-sub">Tu perfil está activo. La IA sigue buscando las mejores oportunidades para vos.</p>
    <div class="cta-btns">
      <a href="${dashboard}" class="btn-primary btn-lg">Ir a mi dashboard</a>
      <a href="ofertas.html" class="btn-outline btn-lg">Explorar empleos</a>
    </div>
    <p class="cta-note">Tu cuenta está activa · Todo tu historial te espera</p>`;
}

/* ─────────────────────────────────
   BUSCADOR — redirige a ofertas.html
   Si vacío → va igual a ofertas.html
───────────────────────────────── */
function initSearch() {
  const btn     = document.getElementById('searchBtn');
  const queryIn = document.getElementById('searchQuery');
  const locIn   = document.getElementById('searchLocation');
  if (!btn) return;

  function doSearch() {
    const q = queryIn?.value.trim() ?? '';
    const l = locIn?.value.trim() ?? '';

    // Vacío → mostrar todas las ofertas
    if (!q && !l) {
      window.location.href = 'ofertas.html';
      return;
    }

    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (l) params.set('loc', l);
    window.location.href = `ofertas.html?${params.toString()}`;
  }

  btn.addEventListener('click', doSearch);
  [queryIn, locIn].forEach((inp) => {
    inp?.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
  });
}

/* ─────────────────────────────────
   CHIPS — ahora son <a> en el HTML,
   esta función ya no hace nada pero
   la dejamos por si se necesita.
───────────────────────────────── */
function initChips() { /* chips son links directos en el HTML */ }


/* ─────────────────────────────────
   RENDER JOB CARDS
───────────────────────────────── */
function renderJobs(filter = 'todos') {
  const grid = document.getElementById('jobsGrid');
  if (!grid) return;

  const list = JOBS.filter((j) => j.filter.includes(filter));

  if (!list.length) {
    grid.innerHTML = '<p style="color:var(--text3);font-size:14px;padding:16px 0">No hay ofertas en esta categoría por el momento.</p>';
    return;
  }

  grid.innerHTML = list.map((job) => {
    const tags = job.tags
      .map((tag, i) => `<span class="job-tag ${job.tagTypes[i] || ''}">${tag}</span>`)
      .join('');

    const badge = job.match
      ? `<div class="match-badge">✦ ${job.match}% match</div>`
      : '';

    return `
      <a class="job-card" href="oferta-detalle.html?id=${job.id}">
        ${badge}
        <div class="job-card-head">
          <div class="company-logo" style="color:${job.logoColor}">${job.logo}</div>
          <div class="job-meta">
            <div class="job-title">${job.title}</div>
            <div class="company-name">${job.company} · ${job.location}</div>
          </div>
        </div>
        <div class="job-tags">${tags}</div>
        <div class="job-footer">
          <div class="salary">${job.salary}</div>
          <div class="time-ago">${job.time}</div>
        </div>
      </a>`;
  }).join('');
}

/* ─────────────────────────────────
   TABS
───────────────────────────────── */
function initTabs() {
  document.querySelectorAll('.tab[data-filter]').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      renderJobs(tab.dataset.filter);
    });
  });
}

/* ─────────────────────────────────
   INIT
───────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHamburger();
  initReveal();
  initCounters();
  initNavSession();
  initCtaSession();
  initChips();
  initSearch();
  renderJobs('todos');
  initTabs();
});
