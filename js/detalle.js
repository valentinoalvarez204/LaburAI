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
const OFERTAS = [
  {
    id: 1,
    title: 'Vendedor/a Senior',
    company: 'Grupo Arcor',
    location: 'Córdoba, Argentina',
    logo: 'A', logoColor: '#5C6BC0',
    tags: ['Presencial', 'FMCG', 'B2B'],
    tagTypes: ['', '', ''],
    salary: '$450.000 – $650.000',
    time: 'hace 1 hora',
    match: 97,
    rubro: 'ventas',
    modalidad: 'Presencial',
    jornada: 'Full time',
    exp: '3 – 5 años',
    vacantes: 2,
    postulaciones: 34,
    desc: `Grupo Arcor, líder mundial en la producción de golosinas y uno de los principales fabricantes de galletas, chocolates y alimentos a nivel global, busca incorporar a su equipo comercial un Vendedor/a Senior para el canal moderno y tradicional en la región de Córdoba.\n\nLa posición reporta directamente al Gerente de Zona y tiene como objetivo principal la gestión y crecimiento de la cartera de clientes asignada, el cumplimiento de los objetivos de venta y la correcta ejecución del plan comercial.`,
    responsibilities: [
      'Gestionar y desarrollar la cartera de clientes existente en el canal asignado',
      'Ejecutar el plan comercial y cumplir los objetivos de volumen, cobertura y mix de producto',
      'Realizar visitas presenciales a clientes con frecuencia semanal',
      'Negociar condiciones comerciales dentro de los parámetros autorizados',
      'Elaborar informes de gestión y reportar resultados a la gerencia',
      'Identificar y prospectar nuevos clientes potenciales en la zona',
      'Coordinar con logística la correcta entrega de pedidos',
    ],
    benefits: [
      'Sueldo fijo + variable por cumplimiento de objetivos',
      'Auto de empresa y combustible cubierto',
      'Medicina prepaga de primer nivel para grupo familiar',
      'Bono anual por desempeño',
      'Plan de carrera y capacitación continua',
      'Descuentos en productos de la empresa',
      'Obra social OSDE 310',
    ],
    requirements: [
      'Estudios secundarios completos (excluyente). Universitario en carreras afines valorado',
      'Experiencia mínima de 3 años en ventas de consumo masivo',
      'Conocimiento del canal supermercados / autoservices / tradicional',
      'Manejo de CRM y herramientas de gestión comercial',
      'Disponibilidad para viajar dentro de la región',
      'Licencia de conducir vigente (excluyente)',
    ],
    skills: ['Ventas B2B', 'Negociación', 'CRM', 'FMCG', 'Canal moderno'],
    niceSkills: ['SAP', 'Power BI', 'Gestión de inventarios'],
    matchSkills: [
      { name: 'Ventas B2B', has: true },
      { name: 'Negociación', has: true },
      { name: 'CRM', has: true },
      { name: 'FMCG', has: false },
      { name: 'SAP', has: false },
    ],
    company_desc: 'Arcor es la empresa argentina líder en el mercado mundial de caramelos y uno de los principales fabricantes de galletas, chocolates, alfajores y alimentos. Presente en más de 120 países, con operaciones en toda América y Europa.',
    company_employees: '+20.000',
    company_since: '1951',
    company_industry: 'Alimentación y bebidas',
    company_openings: 8,
  },
  {
    id: 2,
    title: 'Enfermero/a General',
    company: 'Clínica Sucre',
    location: 'Buenos Aires, Argentina',
    logo: 'C', logoColor: '#11998E',
    tags: ['Presencial', 'Guardia', 'Urgente'],
    tagTypes: ['', '', 'hot'],
    salary: '$380.000 – $520.000',
    time: 'hace 3 horas',
    match: 93,
    rubro: 'salud',
    modalidad: 'Presencial',
    jornada: 'Full time',
    exp: '1 – 2 años',
    vacantes: 4,
    postulaciones: 61,
    desc: `Clínica Sucre, institución de salud de alta complejidad con más de 50 años de trayectoria, se encuentra en búsqueda de Enfermeros/as para cubrir guardias en el área de internación general.\n\nSe requiere personal con vocación de servicio, responsabilidad y capacidad de trabajo en equipo para brindar atención de calidad a los pacientes internados.`,
    responsibilities: [
      'Brindar cuidados de enfermería a pacientes internados en sala general',
      'Administrar medicación según prescripción médica y protocolos institucionales',
      'Registrar evolución del paciente en la historia clínica digital',
      'Coordinar con el equipo médico el plan de cuidados',
      'Realizar procedimientos de enfermería: vías, curaciones, sondas, etc.',
      'Participar en pases de guardia garantizando la continuidad del cuidado',
    ],
    benefits: [
      'Relación de dependencia con todos los beneficios de ley',
      'Guardias de 12 horas con descanso entre guardias',
      'Obra social OSECAC',
      'Guardería en convenio',
      'Comedor en planta',
      'Capacitaciones internas y acceso a cursos del GCBA',
    ],
    requirements: [
      'Título de Licenciado/a en Enfermería o Enfermero/a Profesional (excluyente)',
      'Matrícula habilitante vigente (excluyente)',
      'Experiencia mínima de 1 año en institución hospitalaria',
      'Disponibilidad para trabajar en guardia rotativa',
      'Conocimiento de RCP básico',
    ],
    skills: ['Enfermería clínica', 'Administración de medicación', 'Historia clínica digital', 'RCP'],
    niceSkills: ['ACLS', 'PALS', 'Inglés básico'],
    matchSkills: [
      { name: 'Enfermería clínica', has: true },
      { name: 'RCP', has: true },
      { name: 'Historia clínica', has: true },
      { name: 'ACLS', has: false },
    ],
    company_desc: 'Clínica Sucre es una institución de salud privada de alta complejidad ubicada en el barrio de Palermo. Cuenta con más de 200 camas, quirófanos, unidad de cuidados intensivos y servicios de emergencias las 24 horas.',
    company_employees: '600 – 1.000',
    company_since: '1972',
    company_industry: 'Salud y medicina',
    company_openings: 12,
  },
  {
    id: 3,
    title: 'Administrativo/a Contable',
    company: 'Techint',
    location: 'Remoto (Argentina)',
    logo: 'T', logoColor: '#7C4DFF',
    tags: ['Remoto', 'SAP', 'Full time'],
    tagTypes: ['remote', '', ''],
    salary: '$420.000 – $580.000',
    time: 'hace 5 horas',
    match: 91,
    rubro: 'administracion',
    modalidad: 'Remoto',
    jornada: 'Full time',
    exp: '3 – 5 años',
    vacantes: 1,
    postulaciones: 89,
    desc: `Techint Group, grupo empresarial multinacional líder en ingeniería y construcción de plantas industriales, busca un/a Administrativo/a Contable para incorporarse al equipo de Finanzas en modalidad 100% remota.\n\nLa posición implica un rol clave en el control y registro de operaciones contables, participando activamente en los cierres mensuales y la preparación de información para reporting.`,
    responsibilities: [
      'Registro de facturas de compras y ventas en SAP',
      'Conciliaciones bancarias y de cuentas de mayor',
      'Colaboración en el cierre contable mensual',
      'Liquidación y control de impuestos (IVA, IIBB, Ganancias)',
      'Preparación de información para auditorías internas y externas',
      'Archivo y gestión documental contable',
    ],
    benefits: [
      'Trabajo 100% remoto desde cualquier punto del país',
      'Sueldo en blanco con todos los beneficios de la convención colectiva',
      'Obra social OSDE 310',
      'Equipamiento de trabajo provisto por la empresa',
      'Capacitaciones en herramientas y normativas',
      'Bono anual por desempeño',
    ],
    requirements: [
      'Estudiante avanzado/a o graduado/a en Contabilidad, Administración o Economía',
      'Experiencia mínima de 3 años en posiciones similares',
      'Manejo avanzado de SAP FI (excluyente)',
      'Conocimiento de normativa impositiva argentina vigente',
      'Excel avanzado (tablas dinámicas, fórmulas complejas)',
      'Acceso a internet de buena calidad para trabajo remoto',
    ],
    skills: ['SAP FI', 'Excel avanzado', 'Contabilidad general', 'AFIP / ARCA', 'Conciliaciones'],
    niceSkills: ['Power BI', 'IFRS', 'Inglés intermedio'],
    matchSkills: [
      { name: 'SAP FI', has: true },
      { name: 'Excel avanzado', has: true },
      { name: 'Contabilidad', has: true },
      { name: 'IFRS', has: false },
    ],
    company_desc: 'Techint es un grupo empresarial multinacional de origen argentino con operaciones en más de 20 países. Líder en ingeniería y construcción industrial, tubos sin costura, salud y tecnología. Uno de los empleadores privados más importantes de Argentina.',
    company_employees: '+50.000',
    company_since: '1945',
    company_industry: 'Ingeniería y construcción',
    company_openings: 23,
  },
  // Los demás objetos simplificados para las ofertas similares
  { id: 4,  title: 'Maestro/a de Primaria',   company: 'Colegio San Martín', location: 'Rosario',  logo: 'S', logoColor: '#F7971E', tags: ['Presencial', 'Turno tarde'],      tagTypes: ['', ''],      salary: '$290.000 – $370.000', time: 'hace 8h', match: 88, rubro: 'educacion',      modalidad: 'Presencial', jornada: 'Part time',  exp: '1 – 2 años', vacantes: 1, postulaciones: 22, desc:'Colegio privado busca maestro/a de primaria para turno tarde.', responsibilities:[], benefits:[], requirements:[], skills:[], niceSkills:[], matchSkills:[], company_desc:'', company_employees:'50–200', company_since:'1985', company_industry:'Educación', company_openings:3 },
  { id: 5,  title: 'Encargado/a de Depósito', company: 'DHL Argentina',      location: 'Bs. As.',  logo: 'D', logoColor: '#E65100', tags: ['Presencial', 'Logística'],        tagTypes: ['', ''],      salary: '$360.000 – $480.000', time: 'hace 1d', match: 86, rubro: 'logistica',      modalidad: 'Presencial', jornada: 'Full time',  exp: '3 – 5 años', vacantes: 2, postulaciones: 45, desc:'DHL busca encargado/a de depósito para planta en GBA.', responsibilities:[], benefits:[], requirements:[], skills:[], niceSkills:[], matchSkills:[], company_desc:'', company_employees:'+5.000', company_since:'1969', company_industry:'Logística', company_openings:7 },
  { id: 6,  title: 'Desarrollador/a Backend',  company: 'Naranja X',         location: 'Remoto',   logo: 'N', logoColor: '#5C6BC0', tags: ['Remoto', 'NestJS'],              tagTypes: ['remote', ''], salary: '$2.800 – $4.200 USD', time: 'hace 1d', match: 85, rubro: 'tecnologia',     modalidad: 'Remoto',     jornada: 'Full time',  exp: '3 – 5 años', vacantes: 1, postulaciones: 112, desc:'Naranja X busca developer backend con experiencia en NestJS.', responsibilities:[], benefits:[], requirements:[], skills:[], niceSkills:[], matchSkills:[], company_desc:'', company_employees:'1.000–5.000', company_since:'2018', company_industry:'Fintech', company_openings:15 },
  { id: 9,  title: 'Electricista Industrial',  company: 'YPF',               location: 'Neuquén',  logo: 'Y', logoColor: '#F7971E', tags: ['Presencial', 'MT/BT', 'Urgente'], tagTypes: ['', '', 'hot'], salary: '$520.000 – $700.000', time: 'hace 3d', match: 78, rubro: 'construccion',   modalidad: 'Presencial', jornada: 'Full time',  exp: '3 – 5 años', vacantes: 3, postulaciones: 57, desc:'YPF busca electricista industrial para planta en Vaca Muerta.', responsibilities:[], benefits:[], requirements:[], skills:[], niceSkills:[], matchSkills:[], company_desc:'', company_employees:'+10.000', company_since:'1922', company_industry:'Energía', company_openings:34 },
];

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
  renderMatchRing(oferta.match);
  setText('matchPct', `${oferta.match}%`);

  // Match skills
  const skillsEl = document.getElementById('matchSkills');
  if (skillsEl && oferta.matchSkills.length) {
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

  // Sidebar — apply meta
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
    const badge = o.match ? `<div class="match-badge">✦ ${o.match}% match</div>` : '';
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
    // Simular envío
    btnConfirm.disabled = true;
    btnConfirm.innerHTML = '<div style="width:16px;height:16px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite"></div> Enviando…';
    await delay(1600);
    btnConfirm.disabled = false;
    btnConfirm.innerHTML = 'Confirmar postulación';
    showSuccess();
  });
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
document.addEventListener('DOMContentLoaded', () => {
  const id     = getParam('id') || '1';
  const oferta = getOferta(id);

  initNavbar();
  initHamburger();
  renderPage(oferta);
  initTabs();
  initSave();
  initModal();
  initReport();
  initShare();
});
