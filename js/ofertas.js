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
const OFERTAS = [
  { id:1,  title:'Vendedor/a Senior',           company:'Grupo Arcor',       location:'Córdoba',           logo:'A', logoColor:'#5C6BC0', tags:['Presencial','FMCG','B2B'],         tagTypes:['','',''],          salary:'$450.000 – $650.000', salaryNum:450000, time:'hace 1h',  match:97, rubro:'ventas',         modalidad:'presencial', jornada:'fulltime',  exp:'3-5',    desc:'Buscamos vendedor/a senior con experiencia en canal moderno y tradicional. Gestión de cartera de clientes, cumplimiento de objetivos y reporte a gerencia comercial.' },
  { id:2,  title:'Enfermero/a General',          company:'Clínica Sucre',     location:'Buenos Aires',      logo:'C', logoColor:'#11998E', tags:['Presencial','Guardia','Urgente'],  tagTypes:['','','hot'],        salary:'$380.000 – $520.000', salaryNum:380000, time:'hace 3h',  match:93, rubro:'salud',          modalidad:'presencial', jornada:'fulltime',  exp:'1-2',    desc:'Necesitamos enfermero/a para turno guardia en área de internación general. Imprescindible matrícula habilitante y experiencia mínima de 1 año en clínica u hospital.' },
  { id:3,  title:'Administrativo/a Contable',    company:'Techint',           location:'Remoto',            logo:'T', logoColor:'#7C4DFF', tags:['Remoto','SAP','Full time'],       tagTypes:['remote','',''],     salary:'$420.000 – $580.000', salaryNum:420000, time:'hace 5h',  match:91, rubro:'administracion', modalidad:'remoto',    jornada:'fulltime',  exp:'3-5',    desc:'Posición de trabajo remoto para el área de administración contable. Se requiere manejo de SAP, conocimientos de facturación, conciliaciones bancarias y liquidación de impuestos.' },
  { id:4,  title:'Maestro/a de Primaria',        company:'Colegio San Martín',location:'Rosario',           logo:'S', logoColor:'#F7971E', tags:['Presencial','Turno tarde'],       tagTypes:['',''],             salary:'$290.000 – $370.000', salaryNum:290000, time:'hace 8h',  match:88, rubro:'educacion',      modalidad:'presencial', jornada:'parttime',  exp:'1-2',    desc:'Buscamos maestro/a de nivel primario para turno tarde. Título docente habilitante excluyente. Valoramos experiencia en modalidad activa y manejo de herramientas digitales.' },
  { id:5,  title:'Encargado/a de Depósito',      company:'DHL Argentina',     location:'Buenos Aires',      logo:'D', logoColor:'#E65100', tags:['Presencial','Logística','Urgente'],tagTypes:['','','hot'],        salary:'$360.000 – $480.000', salaryNum:360000, time:'hace 1d',  match:86, rubro:'logistica',      modalidad:'presencial', jornada:'fulltime',  exp:'3-5',    desc:'Responsable de la gestión operativa del depósito: recepción, almacenamiento, despacho y control de inventario. Manejo de sistemas WMS y personal a cargo.' },
  { id:6,  title:'Desarrollador/a Backend',      company:'Naranja X',         location:'Córdoba / Remoto',  logo:'N', logoColor:'#5C6BC0', tags:['Remoto','NestJS','Full time'],     tagTypes:['remote','',''],     salary:'$2.800 – $4.200 USD', salaryNum:800000, time:'hace 1d',  match:85, rubro:'tecnologia',     modalidad:'hibrido',   jornada:'fulltime',  exp:'3-5',    desc:'Buscamos developer backend con experiencia en NestJS, PostgreSQL y arquitectura de microservicios. Trabajo en equipo ágil con entregas continuas.' },
  { id:7,  title:'Chef de Partida',              company:'El Federal',         location:'CABA',              logo:'E', logoColor:'#11998E', tags:['Presencial','Cocina fría'],       tagTypes:['',''],             salary:'$320.000 – $430.000', salaryNum:320000, time:'hace 2d',  match:82, rubro:'gastronomia',    modalidad:'presencial', jornada:'parttime',  exp:'1-2',    desc:'Restaurante gastronómico busca chef de partida para cocina fría. Horarios rotativos. Se valora creatividad en preparación de entradas y ensaladas de autor.' },
  { id:8,  title:'Analista de RRHH',             company:'Banco Galicia',      location:'Remoto',            logo:'B', logoColor:'#7C4DFF', tags:['Remoto','Selección','Full time'],  tagTypes:['remote','',''],     salary:'$480.000 – $620.000', salaryNum:480000, time:'hace 2d',  match:80, rubro:'administracion', modalidad:'remoto',    jornada:'fulltime',  exp:'3-5',    desc:'Posición de analista de RRHH enfocada en selección de personal y employer branding. Manejo de ATS, entrevistas por competencias y coordinación con headhunters.' },
  { id:9,  title:'Electricista Industrial',      company:'YPF',                location:'Neuquén',           logo:'Y', logoColor:'#F7971E', tags:['Presencial','MT/BT','Urgente'],   tagTypes:['','','hot'],        salary:'$520.000 – $700.000', salaryNum:520000, time:'hace 3d',  match:78, rubro:'construccion',   modalidad:'presencial', jornada:'fulltime',  exp:'3-5',    desc:'Electricista industrial para planta en Vaca Muerta. Habilitación para trabajos en MT/BT excluyente. Posición de planta con todos los beneficios de convenio.' },
  { id:10, title:'Diseñador/a UX/UI',            company:'MercadoLibre',       location:'Remoto',            logo:'M', logoColor:'#5C6BC0', tags:['Remoto','Figma','Full time'],      tagTypes:['remote','',''],     salary:'$3.000 – $4.500 USD', salaryNum:900000, time:'hace 3d',  match:76, rubro:'diseno',         modalidad:'remoto',    jornada:'fulltime',  exp:'3-5',    desc:'Diseñador/a UX/UI para equipo de producto. Experiencia con Figma, design systems y metodologías de research. Se trabaja en features de alto impacto para millones de usuarios.' },
  { id:11, title:'Contador/a Público/a',         company:'PwC Argentina',      location:'Buenos Aires',      logo:'P', logoColor:'#E65100', tags:['Híbrido','AFIP','Big 4'],         tagTypes:['','',''],          salary:'$550.000 – $750.000', salaryNum:550000, time:'hace 4d',  match:74, rubro:'finanzas',       modalidad:'hibrido',   jornada:'fulltime',  exp:'3-5',    desc:'Contador/a para división de auditoría externa. Manejo de IFRS, conocimiento de normas contables locales y experiencia en clientes de mediana y gran envergadura.' },
  { id:12, title:'Vendedor/a Inmobiliario/a',    company:'RE/MAX Argentina',   location:'Córdoba',           logo:'R', logoColor:'#11998E', tags:['Presencial','Comisiones'],        tagTypes:['',''],             salary:'Comisiones',           salaryNum:0,      time:'hace 4d',  match:72, rubro:'ventas',         modalidad:'presencial', jornada:'freelance', exp:'sin-exp', desc:'Buscamos asesores inmobiliarios para sumarse a la red RE/MAX. No se requiere experiencia previa. Capacitación inicial incluida y esquema 100% comisionable.' },
  { id:13, title:'Operario/a de Producción',     company:'Arcor S.A.',         location:'Villa del Rosario', logo:'A', logoColor:'#7C4DFF', tags:['Presencial','Sin experiencia'],   tagTypes:['','new'],           salary:'$320.000 – $380.000', salaryNum:320000, time:'hace 5d',  match:70, rubro:'construccion',   modalidad:'presencial', jornada:'fulltime',  exp:'sin-exp', desc:'Ingresá a una de las empresas líderes de la industria alimentaria. No se requiere experiencia. Capacitación en planta. Se valora secundario completo y disponibilidad horaria.' },
  { id:14, title:'Community Manager',            company:'Agencia Bumerán',    location:'Remoto',            logo:'B', logoColor:'#F7971E', tags:['Remoto','Redes sociales'],        tagTypes:['remote',''],        salary:'$280.000 – $390.000', salaryNum:280000, time:'hace 6d',  match:68, rubro:'diseno',         modalidad:'remoto',    jornada:'parttime',  exp:'1-2',    desc:'CM para gestión de redes sociales de múltiples clientes. Conocimiento de Meta Ads, Canva y manejo de herramientas de programación de contenidos como Hootsuite o Later.' },
  { id:15, title:'Médico/a Clínico/a',           company:'OSDE',               location:'Buenos Aires',      logo:'O', logoColor:'#11998E', tags:['Presencial','Consultorio'],       tagTypes:['',''],             salary:'$650.000 – $900.000', salaryNum:650000, time:'hace 1w',  match:66, rubro:'salud',          modalidad:'presencial', jornada:'fulltime',  exp:'5+',     desc:'Médico/a clínico/a para atención en consultorio externo. Matrícula habilitante y especialidad excluyentes. Posición en relación de dependencia con beneficios.' },
];

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
  // Checkboxes
  document.querySelectorAll('.filter-group-body input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener('change', () => {
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
    });
  });

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
   INIT
───────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  showSkeleton();

  setTimeout(() => {
    initNavbar();
    initHamburger();
    initSidebarToggle();
    initAccordion();
    initFilters();
    initSearch();
    initSort();
    initReveal();

    // Leer parámetros de URL
    const params = new URLSearchParams(window.location.search);
    const q      = params.get('q')     || '';
    const loc    = params.get('loc')   || '';
    const rubro  = params.get('rubro') || '';

    if (q) {
      const qIn = document.getElementById('searchQuery');
      if (qIn) qIn.value = q;
      state.query = q.toLowerCase();
    }
    if (loc) {
      const lIn = document.getElementById('searchLocation');
      if (lIn) lIn.value = loc;
      state.location = loc.toLowerCase();
    }
    if (rubro) {
      // Marcar el checkbox correspondiente en el sidebar
      const cb = document.querySelector(`input[name="rubro"][value="${rubro}"]`);
      if (cb) {
        cb.checked = true;
        state.filters.rubro = [rubro];
      }
    }

    applyAndRender();
  }, 600);
});
