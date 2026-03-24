/* ══════════════════════════════════════════
   LaburAI — ofertas.js
   Módulos:
   - Datos de ofertas
   - Navbar scroll + hamburger
   - Sidebar de filtros (desktop sticky / mobile overlay)
   - Acordeón de grupos de filtros
   - Checkboxes + slider de salario
   - Chips de filtros activos
   - Búsqueda por texto
   - Render de tarjetas con skeleton loading
   - Paginación
   - Ordenamiento
══════════════════════════════════════════ */

/* ─────────────────────────────────
   DATOS
───────────────────────────────── */
const OFERTAS = [];

/* ─────────────────────────────────
   ESTADO DE LA APP
───────────────────────────────── */
const state = {
  query:        '',
  location:     '',
  filters:      { rubro: [], modalidad: [], jornada: [], experiencia: [], salarioMin: 0 },
  sort:         'relevancia',
  page:         1,
  perPage:      8,
  results:      [...OFERTAS],
};

/* ─────────────────────────────────
   HAMBURGER
───────────────────────────────── */

/* ─────────────────────────────────
   SIDEBAR MOBILE
───────────────────────────────── */
function initSidebarToggle() {
  const toggleBtn = document.getElementById('filtersToggleBtn');
  const sidebar   = document.getElementById('filtersSidebar');
  const overlay   = document.getElementById('sidebarOverlay');
  const applyBtn  = document.getElementById('applyFiltersBtn');
  if (!toggleBtn || !sidebar) return;

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', openSidebar);
  overlay.addEventListener('click', closeSidebar);
  applyBtn?.addEventListener('click', closeSidebar);
}

/* ─────────────────────────────────
   ACORDEÓN DE FILTROS
───────────────────────────────── */
function initAccordion() {
  document.querySelectorAll('.filter-group-header').forEach((header) => {
    header.addEventListener('click', () => {
      const bodyId = header.dataset.toggle;
      const body   = document.getElementById(bodyId);
      if (!body) return;
      const collapsed = body.classList.toggle('collapsed');
      header.classList.toggle('collapsed', collapsed);
    });
  });
}

/* ─────────────────────────────────
   FILTROS — checkboxes + slider
───────────────────────────────── */
function initFilters() {
  // Event delegation en el sidebar para los checkboxes (ya que los rubros son dinámicos)
  const sidebar = document.getElementById('filtersSidebar');
  if (sidebar) {
    sidebar.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        const cb = e.target;
        const name  = cb.name;
        const value = cb.value;
        if (!state.filters[name]) state.filters[name] = [];

        if (cb.checked) {
          if (!state.filters[name].includes(value)) state.filters[name].push(value);
        } else {
          state.filters[name] = state.filters[name].filter((v) => v !== value);
        }
        state.page = 1;
        applyAndRender();
      }
    });
  }

  // Slider de salario
  const slider  = document.getElementById('salaryRange');
  const display = document.getElementById('salaryDisplay');
  if (slider) {
    slider.addEventListener('input', () => {
      const val = parseInt(slider.value, 10);
      state.filters.salarioMin = val;
      display.textContent = val === 0 ? '$0' : '$' + val.toLocaleString('es-AR');
      state.page = 1;
      applyAndRender();
    });
  }

  // Reset
  document.getElementById('resetFilters')?.addEventListener('click', resetFilters);
  document.getElementById('clearAllFilters')?.addEventListener('click', resetFilters);
}

function resetFilters() {
  state.filters = { rubro: [], modalidad: [], jornada: [], experiencia: [], salarioMin: 0 };
  state.page = 1;

  // Uncheck todos
  document.querySelectorAll('.filter-group-body input[type="checkbox"]').forEach((cb) => {
    cb.checked = false;
  });
  // Reset slider
  const slider  = document.getElementById('salaryRange');
  const display = document.getElementById('salaryDisplay');
  if (slider) { slider.value = 0; }
  if (display) { display.textContent = '$0'; }

  applyAndRender();
}

/* ─────────────────────────────────
   BÚSQUEDA
───────────────────────────────── */
function initSearch() {
  const btn  = document.getElementById('searchBtn');
  const qIn  = document.getElementById('searchQuery');
  const lIn  = document.getElementById('searchLocation');

  function doSearch() {
    state.query    = qIn?.value.trim().toLowerCase() ?? '';
    state.location = lIn?.value.trim().toLowerCase() ?? '';
    state.page = 1;
    applyAndRender();
  }

  btn?.addEventListener('click', doSearch);
  [qIn, lIn].forEach((inp) => {
    inp?.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
  });
}

/* ─────────────────────────────────
   ORDENAMIENTO
───────────────────────────────── */
function initSort() {
  document.getElementById('sortSelect')?.addEventListener('change', (e) => {
    state.sort = e.target.value;
    state.page = 1;
    applyAndRender();
  });
}

/* ─────────────────────────────────
   LÓGICA DE FILTRADO Y ORDEN
───────────────────────────────── */
function applyFilters() {
  let list = [...OFERTAS];

  // Búsqueda por texto
  if (state.query) {
    const kw = state.query;
    list = list.filter((o) =>
      o.title.toLowerCase().includes(kw) ||
      o.company.toLowerCase().includes(kw) ||
      o.rubro.includes(kw) ||
      o.tags.some((t) => t.toLowerCase().includes(kw)) ||
      o.desc.toLowerCase().includes(kw)
    );
  }
  if (state.location) {
    const kw = state.location;
    list = list.filter((o) => o.location.toLowerCase().includes(kw));
  }

  // Filtros
  const f = state.filters;
  if (f.rubro.length)      list = list.filter((o) => f.rubro.includes(o.rubro));
  if (f.modalidad.length)  list = list.filter((o) => f.modalidad.includes(o.modalidad));
  if (f.jornada.length)    list = list.filter((o) => f.jornada.includes(o.jornada));
  if (f.experiencia.length)list = list.filter((o) => f.experiencia.includes(o.exp));
  if (f.salarioMin > 0)    list = list.filter((o) => o.salaryNum >= f.salarioMin);

  // Ordenamiento
  switch (state.sort) {
    case 'recientes':    list.sort((a,b) => a.id - b.id);               break;
    case 'salario-asc':  list.sort((a,b) => a.salaryNum - b.salaryNum); break;
    case 'salario-desc': list.sort((a,b) => b.salaryNum - a.salaryNum); break;
    default:             list.sort((a,b) => b.match - a.match);         break;
  }

  state.results = list;
}

/* ─────────────────────────────────
   CHIPS DE FILTROS ACTIVOS
───────────────────────────────── */
const FILTER_LABELS = {
  rubro:      { administracion:'Administración y RRHH', ventas:'Ventas', tecnologia:'Tecnología', salud:'Salud', educacion:'Educación', construccion:'Construcción', gastronomia:'Gastronomía', logistica:'Logística', finanzas:'Finanzas', diseno:'Diseño' },
  modalidad:  { remoto:'Remoto', presencial:'Presencial', hibrido:'Híbrido' },
  jornada:    { fulltime:'Full time', parttime:'Part time', freelance:'Freelance' },
  experiencia:{ 'sin-exp':'Sin experiencia', '1-2':'1–2 años', '3-5':'3–5 años', '5+':'Más de 5 años' },
};

function renderActiveFilters() {
  const bar     = document.getElementById('activeFiltersBar');
  const chips   = document.getElementById('activeChips');
  if (!bar || !chips) return;

  const f = state.filters;
  const all = [
    ...f.rubro.map((v)       => ({ name:'rubro',       value:v, label: FILTER_LABELS.rubro[v] })),
    ...f.modalidad.map((v)   => ({ name:'modalidad',   value:v, label: FILTER_LABELS.modalidad[v] })),
    ...f.jornada.map((v)     => ({ name:'jornada',     value:v, label: FILTER_LABELS.jornada[v] })),
    ...f.experiencia.map((v) => ({ name:'experiencia', value:v, label: FILTER_LABELS.experiencia[v] })),
    ...(f.salarioMin > 0 ? [{ name:'salarioMin', value:'salary', label:'Salario mín. $' + f.salarioMin.toLocaleString('es-AR') }] : []),
  ];

  bar.style.display = all.length ? '' : 'none';

  chips.innerHTML = all.map((chip) => `
    <button class="af-chip" data-name="${chip.name}" data-value="${chip.value}">
      ${chip.label} <span class="af-chip-x">×</span>
    </button>
  `).join('');

  chips.querySelectorAll('.af-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      const { name, value } = btn.dataset;
      if (name === 'salarioMin') {
        state.filters.salarioMin = 0;
        const slider = document.getElementById('salaryRange');
        const disp   = document.getElementById('salaryDisplay');
        if (slider) slider.value = 0;
        if (disp)   disp.textContent = '$0';
      } else {
        state.filters[name] = state.filters[name].filter((v) => v !== value);
        const cb = document.querySelector(`input[name="${name}"][value="${value}"]`);
        if (cb) cb.checked = false;
      }
      state.page = 1;
      applyAndRender();
    });
  });
}

/* ─────────────────────────────────
   RENDER DE TARJETAS
───────────────────────────────── */
function buildTagHTML(label, type) {
  const cls = type ? ` ${type}` : '';
  return `<span class="job-tag${cls}">${label}</span>`;
}

function renderCards() {
  const grid = document.getElementById('offersGrid');
  if (!grid) return;

  const total  = state.results.length;
  const start  = (state.page - 1) * state.perPage;
  const pageItems = state.results.slice(start, start + state.perPage);

  // Actualizar contador
  const countEl = document.getElementById('resultsCount');
  if (countEl) countEl.textContent = total.toLocaleString('es-AR');

  if (!pageItems.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">No encontramos ofertas</div>
        <div class="empty-state-sub">Probá modificando los filtros o el texto de búsqueda.</div>
      </div>`;
    return;
  }

  grid.innerHTML = pageItems.map((job) => {
    const tags  = job.tags.map((t, i) => buildTagHTML(t, job.tagTypes[i])).join('');
    const badge = job.match ? `<div class="match-badge">✦ ${job.match}% match</div>` : '';
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
        <p class="job-desc">${job.desc}</p>
        <div class="job-footer">
          <div class="salary">${job.salary}</div>
          <div class="time-ago">${job.time}</div>
        </div>
      </a>`;
  }).join('');
}

/* ─────────────────────────────────
   PAGINACIÓN
───────────────────────────────── */
function renderPagination() {
  const container = document.getElementById('pagination');
  if (!container) return;

  const total = state.results.length;
  const pages = Math.ceil(total / state.perPage);
  const cur   = state.page;

  if (pages <= 1) { container.innerHTML = ''; return; }

  let html = '';

  // Prev
  html += `<button class="page-btn arrow" onclick="goToPage(${cur-1})" ${cur===1?'disabled':''}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
  </button>`;

  // Páginas
  const range = getPaginationRange(cur, pages);
  range.forEach((item) => {
    if (item === '...') {
      html += `<span class="page-dots">…</span>`;
    } else {
      html += `<button class="page-btn ${item===cur?'active':''}" onclick="goToPage(${item})">${item}</button>`;
    }
  });

  // Next
  html += `<button class="page-btn arrow" onclick="goToPage(${cur+1})" ${cur===pages?'disabled':''}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
  </button>`;

  container.innerHTML = html;
}

function getPaginationRange(cur, total) {
  if (total <= 7) return Array.from({length:total},(_,i)=>i+1);
  if (cur <= 4)   return [1,2,3,4,5,'...',total];
  if (cur >= total-3) return [1,'...',total-4,total-3,total-2,total-1,total];
  return [1,'...',cur-1,cur,cur+1,'...',total];
}

window.goToPage = function(page) {
  const pages = Math.ceil(state.results.length / state.perPage);
  if (page < 1 || page > pages) return;
  state.page = page;
  renderCards();
  renderPagination();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/* ─────────────────────────────────
   SKELETON LOADING (primer render)
───────────────────────────────── */
function showSkeleton() {
  const grid = document.getElementById('offersGrid');
  if (!grid) return;
  grid.innerHTML = Array(5).fill(`
    <div class="skeleton-card">
      <div class="sk-head">
        <div class="skeleton sk-logo"></div>
        <div class="sk-meta">
          <div class="skeleton sk-title"></div>
          <div class="skeleton sk-company"></div>
        </div>
      </div>
      <div class="sk-tags">
        <div class="skeleton sk-tag"></div>
        <div class="skeleton sk-tag"></div>
        <div class="skeleton sk-tag"></div>
      </div>
      <div class="skeleton sk-footer"></div>
    </div>`).join('');
}

/* ─────────────────────────────────
   APPLY & RENDER (punto central)
───────────────────────────────── */
function applyAndRender() {
  applyFilters();
  renderActiveFilters();
  renderCards();
  renderPagination();
}

/* ─────────────────────────────────
   REVEAL ON SCROLL
───────────────────────────────── */
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

/* ─────────────────────────────────
   RENDER FILTROS DINÁMICOS
───────────────────────────────── */
function renderAllFilters() {
  renderRubroFilters();
  renderGenericFilters('modalidad', [
    { id: 'remoto', label: 'Remoto' },
    { id: 'presencial', label: 'Presencial' },
    { id: 'hibrido', label: 'Híbrido' }
  ]);
  renderGenericFilters('jornada', [
    { id: 'fulltime', label: 'Full time' },
    { id: 'parttime', label: 'Part time' },
    { id: 'freelance', label: 'Freelance / Proyecto' }
  ]);
  renderGenericFilters('experiencia', [
    { id: 'sin-exp', label: 'Sin experiencia' },
    { id: '1-2', label: '1 – 2 años' },
    { id: '3-5', label: '3 – 5 años' },
    { id: '5+', label: 'Más de 5 años' }
  ], 'exp'); // 'exp' es la clave en el objeto OFERTAS
}

function renderRubroFilters() {
  const container = document.getElementById('rubro');
  if (!container) return;

  const RUBROS_CONFIG = [
    { id: 'administracion', label: 'Administración y RRHH' },
    { id: 'ventas', label: 'Ventas y Comercial' },
    { id: 'tecnologia', label: 'Tecnología e IT' },
    { id: 'salud', label: 'Salud y Medicina' },
    { id: 'educacion', label: 'Educación y Docencia' },
    { id: 'construccion', label: 'Construcción e Ing.' },
    { id: 'gastronomia', label: 'Gastronomía y Turismo' },
    { id: 'logistica', label: 'Logística y Transporte' },
    { id: 'finanzas', label: 'Finanzas y Contabilidad' },
    { id: 'diseno', label: 'Diseño y Creatividad' }
  ];

  const counts = {};
  OFERTAS.forEach(o => counts[o.rubro] = (counts[o.rubro] || 0) + 1);

  container.innerHTML = RUBROS_CONFIG.map(r => {
    const count = counts[r.id] || 0;
    const checked = state.filters.rubro.includes(r.id) ? 'checked' : '';
    return `
      <label class="filter-check">
        <input type="checkbox" name="rubro" value="${r.id}" ${checked}/>
        <span class="fc-box"></span>
        ${r.label} <span class="fc-count">${count.toLocaleString('es-AR')}</span>
      </label>`;
  }).join('');
}

function renderGenericFilters(containerId, config, dataKey) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const key = dataKey || containerId;
  const counts = {};
  OFERTAS.forEach(o => counts[o[key]] = (counts[o[key]] || 0) + 1);

  container.innerHTML = config.map(item => {
    const count = counts[item.id] || 0;
    const checked = state.filters[containerId]?.includes(item.id) ? 'checked' : '';
    return `
      <label class="filter-check">
        <input type="checkbox" name="${containerId}" value="${item.id}" ${checked}/>
        <span class="fc-box"></span>
        ${item.label} <span class="fc-count">${count.toLocaleString('es-AR')}</span>
      </label>`;
  }).join('');
}

/* ─────────────────────────────────
   INIT
────────────────────────────────— */
document.addEventListener('DOMContentLoaded', async () => {
  showSkeleton();

  // Cargar ofertas reales desde la API
  try {
    const res  = await fetch('http://localhost:3000/api/jobs');
    const data = await res.json();

    // Llenar con datos reales
    OFERTAS.length = 0;
    data.forEach((job) => {
      OFERTAS.push({
        id:           job.id,
        title:        job.titulo,
        company:      job.empresa?.nombre || 'Empresa',
        location:     job.ubicacion,
        logo:         job.empresa?.nombre?.charAt(0).toUpperCase() || '?',
        logoColor:    '#5C6BC0',
        tags:         [job.modalidad, job.jornada, ...(job.habilidades?.slice(0,1) || [])],
        tagTypes:     [job.modalidad === 'Remoto' ? 'remote' : '', '', ''],
        salary:       job.salarioMin && job.salarioMax
                        ? `$${job.salarioMin.toLocaleString('es-AR')} – $${job.salarioMax.toLocaleString('es-AR')}`
                        : 'Salario a convenir',
        salaryNum:    job.salarioMin || 0,
        time:         new Date(job.creadoEn).toLocaleDateString('es-AR'),
        match:        Math.floor(Math.random() * 30) + 70, // Simular match para el buscador
        rubro:        job.rubro,
        modalidad:    job.modalidad?.toLowerCase(),
        jornada:      job.jornada?.toLowerCase().replace(' ', ''),
        exp:          job.experiencia || '',
        desc:         job.descripcion,
      });
    });

  } catch (err) {
    console.error('Error cargando ofertas:', err);
  }

  // Leer parámetros de URL (antes de renderizar filtros)
  const params = new URLSearchParams(window.location.search);
  const q      = params.get('q')     || '';
  const loc    = params.get('loc')   || '';
  const rubro  = params.get('rubro') || '';

  if (q)   state.query = q.toLowerCase();
  if (loc) state.location = loc.toLowerCase();
  if (rubro) state.filters.rubro = [rubro];

  // Sincronizar inputs con el estado
  const qIn = document.getElementById('searchQuery');
  if (qIn) qIn.value = state.query;
  const lIn = document.getElementById('searchLocation');
  if (lIn) lIn.value = state.location;

  initNavbar();
  initHamburger();
  initSidebarToggle();
  initAccordion();
  initFilters();
  initSearch();
  initSort();
  initReveal();

  // Renderizar todos los filtros dinámicos
  renderAllFilters();
  applyAndRender();
});