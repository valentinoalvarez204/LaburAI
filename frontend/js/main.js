/* ══════════════════════════════════════════
   LaburAI — main.js
   Módulos: navbar · hamburger · reveal
            counters · chips · search · jobs · tabs
══════════════════════════════════════════ */

/* ─────────────────────────────────
   DATOS: Ofertas de trabajo (ahora desde API)
───────────────────────────────── */
let JOBS = [];

async function fetchHomeJobs() {
  try {
    const session = typeof getSession === 'function' ? getSession() : null;
    const isCandidato = session && session.rol === 'candidato';

    const data = await API.getOfertas();
    if (!Array.isArray(data)) return;

    JOBS = data.map(job => ({
      id: job.id,
      title: job.titulo,
      company: job.empresa?.nombre || 'Empresa',
      location: job.ubicacion,
      logo: job.empresa?.nombre?.charAt(0).toUpperCase() || '?',
      logoColor: '#5C6BC0',
      tags: [job.modalidad, job.jornada],
      tagTypes: [job.modalidad === 'Remoto' ? 'remote' : '', ''],
      salary: job.salarioMin && job.salarioMax
        ? `$${job.salarioMin.toLocaleString('es-AR')} – $${job.salarioMax.toLocaleString('es-AR')}`
        : 'Salario a convenir',
      time: new Date(job.creadoEn).toLocaleDateString('es-AR'),
      timestamp: new Date(job.creadoEn).getTime(),
      match: isCandidato ? (job.matchIA || Math.floor(Math.random() * 15) + 85) : null,
      rubro: job.rubro,
      filter: ['todos', job.modalidad === 'Remoto' ? 'remoto' : '', job.jornada.toLowerCase().replace(' ', '')].filter(Boolean)
    }));

    if (isCandidato) {
      // Ordenar de mayor a menor por compatibilidad (highest match first) para candidatos
      JOBS.sort((a, b) => b.match - a.match);
    } else {
      // Ordenar por fecha (más recientes primero) para usuarios anónimos o empresas
      JOBS.sort((a, b) => b.timestamp - a.timestamp);
    }

    renderJobs('todos');
    renderCategories();
  } catch (err) {
    console.error('Error cargando ofertas en home:', err);
  }
}

/* ─────────────────────────────────
   RENDER CATEGORIAS (áreas)
───────────────────────────────── */
function renderCategories() {
  const grid = document.getElementById('catGrid');
  if (!grid) return;

  const RUBROS_MAP = {
    administracion: { label: 'Administración y RRHH', icon: '💼' },
    ventas: { label: 'Ventas y Comercial', icon: '🛒' },
    tecnologia: { label: 'Tecnología e IT', icon: '💻' },
    salud: { label: 'Salud y Medicina', icon: '🏥' },
    educacion: { label: 'Educación y Docencia', icon: '🎓' },
    construccion: { label: 'Construcción e Ingeniería', icon: '🏗️' },
    gastronomia: { label: 'Gastronomía y Turismo', icon: '🍽️' },
    logistica: { label: 'Logística y Transporte', icon: '🚚' },
    finanzas: { label: 'Finanzas y Contabilidad', icon: '📊' },
    diseno: { label: 'Diseño y Creatividad', icon: '🎨' },
    legal: { label: 'Legal y Jurídico', icon: '⚖️' },
    agro: { label: 'Agro y Medioambiente', icon: '🌱' },
  };

  // Contar ofertas por rubro
  const counts = {};
  JOBS.forEach(j => {
    if (j.rubro) counts[j.rubro] = (counts[j.rubro] || 0) + 1;
  });

  // Mostrar todos los rubros definidos, incluso con 0 ofertas
  grid.innerHTML = Object.keys(RUBROS_MAP).map(r => {
    const meta = RUBROS_MAP[r];
    const count = counts[r] || 0;
    return `
      <a class="cat-card" href="ofertas.html?rubro=${r}">
        <div class="cat-icon">${meta.icon}</div>
        <div class="cat-name">${meta.label}</div>
        <div class="cat-count">${count} oferta${count !== 1 ? 's' : ''}</div>
      </a>`;
  }).join('');
}

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

async function fetchStats() {
  try {
    const data = await API.getGlobalStats();

    // Mapear etiquetas de index.html a claves de la API
    const mapping = {
      'Candidatos activos': data.candidatos,
      'Ofertas publicadas': data.ofertas,
      'Empresas registradas': data.empresas,
      'Match IA exitoso': data.matchPromedio
    };

    document.querySelectorAll('.stat').forEach(statEl => {
      const label = statEl.querySelector('.stat-label')?.textContent.trim();
      const numEl = statEl.querySelector('.stat-num');
      if (numEl && mapping[label] !== undefined) {
        numEl.dataset.target = mapping[label];
      }
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
  }
}

function initCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const el = e.target;
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, 1800, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-num[data-target]').forEach((el) => observer.observe(el));
}

/* Lógica de sesión movida a utils.js */

/* ─────────────────────────────────
   CTA — adaptar según sesión
───────────────────────────────── */
function initCtaSession() {
  const session = getSession();
  const inner = document.getElementById('ctaInner');
  if (!inner || !session) return;

  const dashboard = session.rol === 'empresa'
    ? 'dashboard-empresa.html'
    : 'dashboard-candidato.html';
  const firstName = session.nombre.split(' ')[0];

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
   TÍTULOS DE OFERTAS (Si es Empresa)
───────────────────────────────── */
function initOfertasUI() {
  const session = typeof getSession === 'function' ? getSession() : null;
  const isCandidato = session && session.rol === 'candidato';
  
  if (!isCandidato) {
    const eyebrow = document.getElementById('ofertasEyebrow');
    const title = document.getElementById('ofertasTitle');
    const tabParaVos = document.getElementById('tabParaVos');
    
    if (eyebrow) eyebrow.textContent = 'Explorar el mercado';
    if (title) title.textContent = 'Últimas ofertas publicadas';
    if (tabParaVos) tabParaVos.textContent = 'Destacadas';
  }
}

/* ─────────────────────────────────
   BUSCADOR — redirige a ofertas.html
   Si vacío → va igual a ofertas.html
───────────────────────────────── */
function initSearch() {
  const btn = document.getElementById('searchBtn');
  const queryIn = document.getElementById('searchQuery');
  const locIn = document.getElementById('searchLocation');
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

  // Filtrar ofertas y limitar a 6 (2 filas de 3)
  const list = JOBS.filter((j) => j.filter.includes(filter)).slice(0, 6);

  if (!list.length) {
    grid.innerHTML = '<p style="color:var(--text3);font-size:14px;padding:16px 0">No hay ofertas en esta categoría por el momento.</p>';
    return;
  }

  grid.innerHTML = list.map((job) => {
    const tags = job.tags
      .map((tag, i) => `<span class="job-tag ${job.tagTypes[i] || ''}">${tag}</span>`)
      .join('');

    const matchVal = job.match || 0;
    const badge = matchVal > 0 ? `<div class="match-badge">✦ ${matchVal}% match</div>` : '';

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
document.addEventListener('DOMContentLoaded', async () => {
  initNavbar();
  initReveal();
  initNavSession();
  initCtaSession();
  initOfertasUI(); // Nueva funcion para adaptar UI empresa
  initChips();
  initSearch();

  // Cargar datos reales
  fetchHomeJobs();
  await fetchStats();
  initCounters(); // Se inicia después de actualizar data-target

  initTabs();
});
