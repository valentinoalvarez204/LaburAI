/* ══════════════════════════════════════════
   LaburAI — dashboard-empresa.js
══════════════════════════════════════════ */

/* ─────────────────────────────────
   DATOS
───────────────────────────────── */
const EMPRESA = {
  nombre: 'Grupo Arcor',
  iniciales: 'GA',
};

const OFERTAS_DATA = [
  { id: 1, title: 'Vendedor/a Senior', area: 'Ventas y Comercial', modalidad: 'Presencial', ubicacion: 'Córdoba', status: 'activa', postulaciones: 34, vistas: 620, dias: 5 },
  { id: 2, title: 'Administrativo/a Contable', area: 'Administración y RRHH', modalidad: 'Remoto', ubicacion: 'Remoto', status: 'activa', postulaciones: 8, vistas: 310, dias: 3 },
  { id: 3, title: 'Analista de Marketing', area: 'Diseño y Creatividad', modalidad: 'Híbrido', ubicacion: 'Buenos Aires', status: 'activa', postulaciones: 5, vistas: 190, dias: 1 },
  { id: 4, title: 'Supervisor/a de Producción', area: 'Construcción e Ing.', modalidad: 'Presencial', ubicacion: 'Villa del Rosario', status: 'cerrada', postulaciones: 22, vistas: 480, dias: 30 },
  { id: 5, title: 'Promotor/a de Ventas', area: 'Ventas y Comercial', modalidad: 'Presencial', ubicacion: 'Córdoba', status: 'cerrada', postulaciones: 41, vistas: 850, dias: 45 },
];

const CANDIDATOS_DATA = [
  { id: 1, rank: 1, nombre: 'Valentina González', iniciales: 'VG', color: 'linear-gradient(135deg,#5C6BC0,#7C4DFF)', ofertaId: 1, oferta: 'Vendedor/a Senior', exp: '5 años · Ventas B2B', match: 97, skills: ['Ventas B2B', 'CRM', 'Negociación'], missing: 0 },
  { id: 2, rank: 2, nombre: 'Martín Fernández', iniciales: 'MF', color: 'linear-gradient(135deg,#11998E,#38EF7D)', ofertaId: 1, oferta: 'Vendedor/a Senior', exp: '4 años · FMCG', match: 91, skills: ['Canal moderno', 'Retail', 'SAP'], missing: 1 },
  { id: 3, rank: 3, nombre: 'Carolina Ramos', iniciales: 'CR', color: 'linear-gradient(135deg,#F7971E,#FFD200)', ofertaId: 1, oferta: 'Vendedor/a Senior', exp: '3 años · Consumo masivo', match: 88, skills: ['Negociación', 'Excel', 'B2B'], missing: 2 },
  { id: 4, rank: 4, nombre: 'Diego Salinas', iniciales: 'DS', color: 'linear-gradient(135deg,#667EEA,#764BA2)', ofertaId: 1, oferta: 'Vendedor/a Senior', exp: '3 años · Retail', match: 84, skills: ['CRM', 'Ventas', 'Canal trad.'], missing: 1 },
  { id: 5, rank: 5, nombre: 'Lucia Herrera', iniciales: 'LH', color: 'linear-gradient(135deg,#F953C6,#B91D73)', ofertaId: 1, oferta: 'Vendedor/a Senior', exp: '2 años · Ventas', match: 79, skills: ['Ventas', 'Comunicación'], missing: 3 },
  { id: 6, rank: 1, nombre: 'Tomás Burgos', iniciales: 'TB', color: 'linear-gradient(135deg,#5C6BC0,#7C4DFF)', ofertaId: 2, oferta: 'Administrativo/a Contable', exp: '5 años · SAP FI', match: 94, skills: ['SAP', 'Excel', 'Contabilidad'], missing: 0 },
  { id: 7, rank: 2, nombre: 'Florencia Ríos', iniciales: 'FR', color: 'linear-gradient(135deg,#11998E,#38EF7D)', ofertaId: 2, oferta: 'Administrativo/a Contable', exp: '3 años · Contable', match: 87, skills: ['Excel', 'AFIP', 'Conciliaciones'], missing: 1 },
  { id: 8, rank: 1, nombre: 'Ignacio Vega', iniciales: 'IV', color: 'linear-gradient(135deg,#F7971E,#FFD200)', ofertaId: 3, oferta: 'Analista de Marketing', exp: '4 años · Mktg digital', match: 92, skills: ['Meta Ads', 'Canva', 'Analytics'], missing: 0 },
];

const ACTIVIDAD = [
  { icon: '👤', type: 'postul', text: '<strong>Valentina González</strong> se postuló a Vendedor/a Senior', time: 'hace 12 min' },
  { icon: '👤', type: 'postul', text: '<strong>Diego Salinas</strong> se postuló a Vendedor/a Senior', time: 'hace 1h' },
  { icon: '✓', type: 'ok', text: 'La IA analizó <strong>5 nuevos CVs</strong> de la oferta Vendedor/a Senior', time: 'hace 2h' },
  { icon: '👤', type: 'postul', text: '<strong>Tomás Burgos</strong> se postuló a Administrativo/a Contable', time: 'hace 3h' },
  { icon: '⭐', type: 'revisar', text: '<strong>Martín Fernández</strong> actualizó su CV — match subió de 85% a 91%', time: 'hace 5h' },
  { icon: '✓', type: 'ok', text: 'LaburAI sugirió <strong>3 candidatos destacados</strong> para Analista de Marketing', time: 'ayer' },
];

/* ─────────────────────────────────
   NAVEGACIÓN
───────────────────────────────── */
const SECTIONS = ['overview', 'ofertas', 'candidatos', 'publicar', 'empresa'];

function switchSection(id) {
  // Sidebar nav
  document.querySelectorAll('.snav-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.section === id);
  });
  // Topbar nav
  document.querySelectorAll('.dash-nav a').forEach((a) => {
    a.classList.toggle('active', a.dataset.section === id);
  });
  // Contenido
  SECTIONS.forEach((s) => {
    const el = document.getElementById(s);
    if (!el) return;
    el.classList.toggle('hidden', s !== id);
  });
  closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initNav() {
  // Sidebar nav
  document.querySelectorAll('.snav-item[data-section]').forEach((item) => {
    item.addEventListener('click', (e) => { e.preventDefault(); switchSection(item.dataset.section); });
  });

  // Interceptar clics en links del navbar para navegación interna (SPA)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (href.includes('#')) {
      const parts = href.split('#');
      const section = parts[1];
      // Si el link apunta a este dashboard o es relativo (#seccion)
      if ((parts[0].includes('dashboard-empresa.html') || parts[0] === '') && section) {
        if (SECTIONS.includes(section)) {
          e.preventDefault();
          switchSection(section);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  });

  // Botones "Nueva oferta" → van a la sección publicar del dashboard
  ['btnNuevaOferta', 'btnNuevaOfertaHero'].forEach((id) => {
    document.getElementById(id)?.addEventListener('click', () => switchSection('publicar'));
  });
  // Links internos (dash-card headers "Ver todas →")
  document.querySelectorAll('[data-section]').forEach((el) => {
    if (el.tagName === 'A' && !el.classList.contains('snav-item')) {
      el.addEventListener('click', (e) => { e.preventDefault(); switchSection(el.dataset.section); });
    }
    if (el.tagName === 'BUTTON' && el !== document.getElementById('btnNuevaOferta') && el !== document.getElementById('btnNuevaOfertaHero')) {
      el.addEventListener('click', () => switchSection(el.dataset.section));
    }
  });
}

/* ─────────────────────────────────
   SIDEBAR MOBILE
───────────────────────────────── */
function openSidebar() { document.getElementById('dashSidebar')?.classList.add('open'); document.getElementById('dashOverlay')?.classList.add('visible'); document.body.style.overflow = 'hidden'; }
function closeSidebar() { document.getElementById('dashSidebar')?.classList.remove('open'); document.getElementById('dashOverlay')?.classList.remove('visible'); document.body.style.overflow = ''; }

function initDashSidebar() {
  document.getElementById('hamburger')?.addEventListener('click', () => {
    const open = document.getElementById('dashSidebar')?.classList.contains('open');
    open ? closeSidebar() : openSidebar();
    document.getElementById('hamburger')?.classList.toggle('open');
  });
  document.getElementById('dashOverlay')?.addEventListener('click', () => {
    closeSidebar();
    document.getElementById('hamburger')?.classList.remove('open');
  });
}

/* ─────────────────────────────────
   RENDER OFERTAS MINI (resumen)
───────────────────────────────── */
function renderOfertasMini() {
  const el = document.getElementById('ofertasMini');
  if (!el) return;
  const activas = OFERTAS_DATA.filter((o) => o.status === 'activa');
  el.innerHTML = activas.map((o) => `
    <div class="om-item" onclick="switchSection('ofertas')">
      <div class="om-dot om-dot--${o.status}"></div>
      <div class="om-info">
        <div class="om-title">${o.title}</div>
        <div class="om-meta">${o.modalidad} · ${o.ubicacion} · hace ${o.dias} días</div>
      </div>
      <div class="om-count">${o.postulaciones} postulantes</div>
    </div>`).join('');
}

/* ─────────────────────────────────
   RENDER TOP CANDIDATOS (resumen)
───────────────────────────────── */
function renderTopCandidatos() {
  const el = document.getElementById('topCandidatos');
  if (!el) return;
  const top = [...CANDIDATOS_DATA].sort((a, b) => b.match - a.match).slice(0, 4);
  const rankClass = ['gold', 'silver', 'bronze', ''];
  el.innerHTML = top.map((c, i) => `
    <div class="tc-item" onclick="switchSection('candidatos')">
      <div class="tc-rank tc-rank--${rankClass[i]}">#${i + 1}</div>
      <div class="tc-av" style="background:${c.color}">${c.iniciales}</div>
      <div class="tc-info">
        <div class="tc-name">${c.nombre}</div>
        <div class="tc-oferta">${c.oferta}</div>
      </div>
      <div class="tc-match">${c.match}%</div>
    </div>`).join('');
}

/* ─────────────────────────────────
   RENDER ACTIVIDAD
───────────────────────────────── */
function renderActividad() {
  const el = document.getElementById('actividadList');
  if (!el) return;

  // Generar actividad real desde candidatos
  const actividad = CANDIDATOS_DATA.map((c) => ({
    icon: '👤',
    type: 'postul',
    text: `<strong>${c.nombre}</strong> se postuló a ${c.oferta}`,
    time: 'reciente',
  }));

  if (!actividad.length) {
    el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text3);font-size:14px">No hay actividad reciente.</div>';
    return;
  }

  el.innerHTML = actividad.map((a) => `
    <div class="act-item">
      <div class="act-icon act-icon--${a.type}">${a.icon}</div>
      <div class="act-text">${a.text}</div>
      <div class="act-time">${a.time}</div>
    </div>`).join('');
}

/* ─────────────────────────────────
   RENDER LISTA DE OFERTAS
───────────────────────────────── */
function renderOfertas(filter = 'todas') {
  const el = document.getElementById('ofertasList');
  if (!el) return;
  const list = filter === 'todas' ? OFERTAS_DATA : OFERTAS_DATA.filter((o) => o.status === filter);
  if (!list.length) {
    el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text3);font-size:14px">No hay ofertas en esta categoría.</div>';
    return;
  }
  el.innerHTML = list.map((o) => `
    <div class="oferta-row">
      <div class="or-status or-status--${o.status}"></div>
      <div class="or-info">
        <div class="or-title">${o.title}</div>
        <div class="or-meta">
          <span class="or-badge">${o.area}</span>
          <span class="or-badge">${o.modalidad}</span>
          <span class="or-badge">${o.ubicacion}</span>
          <span class="or-badge" style="${o.status === 'activa' ? 'background:#E8F5E9;color:#2E7D32;border-color:#A5D6A7' : ''}">
            ${o.status === 'activa' ? '● Activa' : '○ Cerrada'}
          </span>
        </div>
      </div>
      <div class="or-stats">
        <div class="or-stat">
          <div class="or-stat-num">${o.postulaciones}</div>
          <div class="or-stat-label">Postulantes</div>
        </div>
        <div class="or-stat">
          <div class="or-stat-num">${o.vistas}</div>
          <div class="or-stat-label">Vistas</div>
        </div>
        <div class="or-stat">
          <div class="or-stat-num">${o.dias}d</div>
          <div class="or-stat-label">Publicada</div>
        </div>
      </div>
      <div class="or-actions">
        <button class="or-btn or-btn--primary" onclick="switchSection('candidatos')">Ver candidatos</button>
        <button class="or-btn">Editar</button>
        ${o.status === 'activa' ? `<button class="or-btn" onclick="cerrarOferta('${o.id}', this)">Cerrar</button>` : ''}
      </div>
    </div>`).join('');
}

function initOfertasTabs() {
  document.querySelectorAll('.otab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.otab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      renderOfertas(tab.dataset.of);
    });
  });
}

/* ─────────────────────────────────
   RENDER CANDIDATOS (ranking IA)
───────────────────────────────── */

// SVG gradient inyectado una sola vez
function injectGradient() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  svg.innerHTML = `<defs><linearGradient id="candGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#5C6BC0"/><stop offset="100%" stop-color="#7C4DFF"/></linearGradient></defs>`;
  document.body.prepend(svg);
}

function renderCandidatos(ofertaId = 'todas') {
  const el = document.getElementById('candidatosList');
  if (!el) return;

  const statusFilter = document.getElementById('filterStatus')?.value || 'todos';

  let list = ofertaId === 'todas'
    ? CANDIDATOS_DATA
    : CANDIDATOS_DATA.filter((c) => String(c.ofertaId) === String(ofertaId));

  if (statusFilter !== 'todos') {
    list = list.filter((c) => c.estado === statusFilter);
  }

  if (!list.length) {
    el.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text3);font-size:14px">No hay candidatos ${statusFilter !== 'todos' ? 'con estado ' + statusFilter.toLowerCase() : ''} para esta oferta.</div>`;
    return;
  }

  // Ordenar por match
  const sorted = [...list].sort((a, b) => b.match - a.match);

  el.innerHTML = sorted.map((c, i) => {
    const rankCls = i === 0 ? 'cand-rank--1' : i === 1 ? 'cand-rank--2' : i === 2 ? 'cand-rank--3' : '';
    const skills = c.skills.map((s) => `<span class="cand-skill match">${s}</span>`).join('');
    const missing = c.missing > 0 ? `<div class="cand-missing">Faltan ${c.missing} habilidad${c.missing > 1 ? 'es' : ''}</div>` : '';
    const circ = 2 * Math.PI * 24;
    const offset = circ * (1 - c.match / 100);

    return `
      <div class="cand-card" data-id="${c.id}">
        ${missing}
        <div class="cand-rank ${rankCls}">#${i + 1}</div>
        <div class="cand-av" style="background:${c.color}">${c.iniciales}</div>
        <div class="cand-info">
          <div class="cand-name">${c.nombre}</div>
          <div class="cand-meta">${c.exp} · ${c.oferta}</div>
          <div class="cand-skills">${skills}</div>
        </div>
        <div class="cand-score-wrap">
          <div class="cand-score-ring">
            <svg class="csr-svg" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="24" class="csr-bg"/>
              <circle cx="30" cy="30" r="24" class="csr-fill"
                stroke="url(#candGrad)"
                style="stroke-dashoffset:${offset}"/>
            </svg>
            <div class="csr-num">${c.match}%</div>
          </div>
          <div class="cand-score-label">compatibilidad</div>
        </div>
        <div class="cand-actions" style="flex-direction: row; gap: 8px; align-items: center;">
          <div class="status-indicator" style="width: 8px; height: 8px; border-radius: 50%; background: ${getStatusColor(c.estado)}"></div>
          <select class="form-select" style="font-size: 11px; padding: 4px 8px; width: auto; height: auto; min-width: 110px; border-color: ${getStatusColor(c.estado)}22; background-color: ${getStatusColor(c.estado)}08;" onchange="cambiarEstadoPostulacion('${c.id}', this)">
            <option value="PENDIENTE" ${c.estado === 'PENDIENTE' ? 'selected' : ''}>Pendiente</option>
            <option value="REVISADA" ${c.estado === 'REVISADA' ? 'selected' : ''}>Revisada</option>
            <option value="ENTREVISTA" ${c.estado === 'ENTREVISTA' ? 'selected' : ''}>Entrevista</option>
            <option value="RECHAZADA" ${c.estado === 'RECHAZADA' ? 'selected' : ''}>Rechazada</option>
          </select>
          <a href="candidato-postulacion.html?id=${c.id}" class="cand-btn" style="padding: 7px 12px; font-size: 11px;">Ver detalle</a>
        </div>
      </div>`;
  }).join('');

  // Animar rings después del render
  setTimeout(() => {
    el.querySelectorAll('.csr-fill').forEach((ring, i) => {
      const circ = 2 * Math.PI * 24;
      const pct = sorted[i]?.match ?? 0;
      ring.style.transition = `stroke-dashoffset 1s ease ${i * 0.1}s`;
      ring.style.strokeDasharray = circ;
      ring.style.strokeDashoffset = circ; // reset
      requestAnimationFrame(() => {
        setTimeout(() => {
          ring.style.strokeDashoffset = circ * (1 - pct / 100);
        }, 50);
      });
    });
  }, 50);
}

function initSelectOferta() {
  document.getElementById('selectOferta')?.addEventListener('change', (e) => {
    renderCandidatos(e.target.value);
  });
}

function initFilterStatus() {
  document.getElementById('filterStatus')?.addEventListener('change', () => {
    renderCandidatos(document.getElementById('selectOferta')?.value || 'todas');
  });
}

function getStatusColor(estado) {
  switch (estado) {
    case 'PENDIENTE': return '#9e9e9e'; // Gris
    case 'REVISADA': return '#2196f3';  // Azul
    case 'ENTREVISTA': return '#7c4dff'; // Violeta
    case 'RECHAZADA': return '#f44336'; // Rojo
    default: return '#9e9e9e';
  }
}

/* ─────────────────────────────────
   ACCIONES
───────────────────────────────── */
window.cambiarEstadoPostulacion = async function (id, el) {
  const nuevoEstado = el.value;
  const c = CANDIDATOS_DATA.find((x) => String(x.id) === String(id));
  if (!c) return;

  // Confirmación para estados críticos
  if (nuevoEstado === 'ENTREVISTA' || nuevoEstado === 'RECHAZADA') {
    const confirmMsg = nuevoEstado === 'ENTREVISTA'
      ? `¿Estás seguro de que deseas agendar una entrevista con ${c.nombre}?`
      : `¿Estás seguro de que deseas rechazar la postulación de ${c.nombre}?`;

    if (!confirm(confirmMsg)) {
      el.value = c.estado;
      return;
    }
  }

  const session = JSON.parse(localStorage.getItem('labuai_session') || '{}');
  el.disabled = true;

  try {
    const res = await fetch(`http://localhost:3000/api/applications/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.token}`,
      },
      body: JSON.stringify({ estado: nuevoEstado }),
    });

    if (res.ok) {
      showToast(`Postulación de ${c.nombre} marcada como ${nuevoEstado}`, 'success');
      c.estado = nuevoEstado;
      renderCandidatos(document.getElementById('selectOferta')?.value || 'todas');
    } else {
      showToast('Error al actualizar el estado', 'error');
      el.value = c.estado;
    }
  } catch (err) {
    console.error('Error:', err);
    showToast('No se pudo conectar con el servidor', 'error');
    el.value = c.estado;
  } finally {
    el.disabled = false;
  }
};

window.cerrarOferta = async function (ofertaId, btn) {
  const session = JSON.parse(localStorage.getItem('labuai_session') || '{}');
  if (!confirm('¿Seguro que querés cerrar esta oferta?')) return;
  try {
    const res = await fetch(`http://localhost:3000/api/jobs/${ofertaId}/cerrar`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${session.token}` },
    });
    if (res.ok) {
      showToast('Oferta cerrada correctamente', 'success');
      // Actualizar en el array local
      const oferta = OFERTAS_DATA.find((o) => o.id === ofertaId);
      if (oferta) oferta.status = 'cerrada';
      renderOfertas(document.querySelector('.otab.active')?.dataset.of || 'todas');
    } else {
      showToast('Error al cerrar la oferta', 'error');
    }
  } catch (err) {
    showToast('No se pudo conectar con el servidor', 'error');
  }
};

function initPublicar() {
  document.getElementById('btnPublicar')?.addEventListener('click', async () => {
    const btn = document.getElementById('btnPublicar');
    btn.disabled = true;
    btn.innerHTML = '<div style="width:14px;height:14px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite"></div> Publicando…';
    await delay(1600);
    btn.disabled = false;
    btn.innerHTML = 'Publicar oferta';
    showToast('¡Oferta publicada! LaburAI ya está analizando candidatos.', 'success');
    switchSection('ofertas');
  });
}

function initGuardarEmpresa() {
  document.getElementById('btnSaveEmpresa')?.addEventListener('click', async () => {
    const btn = document.getElementById('btnSaveEmpresa');
    btn.disabled = true; btn.textContent = 'Guardando…';
    await delay(1200);
    btn.disabled = false; btn.textContent = 'Guardar cambios';
    showToast('Perfil de empresa actualizado', 'success');
  });
}

/* ─────────────────────────────────
   TOAST
───────────────────────────────── */

/* ─────────────────────────────────
   PUBLICAR OFERTA — estado y lógica
───────────────────────────────── */
const pubState = {
  titulo: '', rubro: '', modalidad: 'Presencial',
  ubicacion: '', jornada: 'Full time',
  desc: '', skills: [], resp: [], benef: [],
  salMin: '', salMax: '', salNeg: false, salConf: false,
};
const PUB_CHECKLIST = [
  { label: 'Título del puesto', check: () => pubState.titulo.length > 3 },
  { label: 'Área / Rubro', check: () => pubState.rubro !== '' },
  { label: 'Ubicación', check: () => pubState.ubicacion.length > 2 },
  { label: 'Descripción del puesto', check: () => pubState.desc.length >= 50 },
  { label: 'Habilidades requeridas', check: () => pubState.skills.length > 0 },
];

function initPublicarForm() {
  document.querySelectorAll('.pub-radio').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pub-radio').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      pubState.modalidad = btn.dataset.val;
      pubUpdatePreview(); pubUpdateChecklist();
    });
  });
  [['pub-titulo', 'titulo'], ['pub-ubicacion', 'ubicacion'], ['pub-sal-min', 'salMin'], ['pub-sal-max', 'salMax']].forEach(([id, key]) => {
    document.getElementById(id)?.addEventListener('input', (e) => { pubState[key] = e.target.value; pubUpdatePreview(); pubUpdateChecklist(); });
  });
  document.getElementById('pub-rubro')?.addEventListener('change', (e) => { pubState.rubro = e.target.value; pubUpdateChecklist(); });
  document.getElementById('pub-jornada')?.addEventListener('change', (e) => { pubState.jornada = e.target.value; pubUpdatePreview(); });
  const descEl = document.getElementById('pub-desc');
  const charEl = document.getElementById('pub-chars');
  descEl?.addEventListener('input', (e) => { pubState.desc = e.target.value; if (charEl) charEl.textContent = e.target.value.length; pubUpdateChecklist(); });
  document.getElementById('pub-sal-neg')?.addEventListener('change', (e) => { pubState.salNeg = e.target.checked; pubUpdatePreview(); pubUpdateChecklist(); });
  document.getElementById('pub-sal-conf')?.addEventListener('change', (e) => { pubState.salConf = e.target.checked; pubUpdatePreview(); });
  pubInitTags('pub-skills-input', 'pub-skills-list', 'skills', 'pub-tag--skill');
  pubInitTags('pub-resp-input', 'pub-resp-list', 'resp', 'pub-tag--resp');
  pubInitTags('pub-benef-input', 'pub-benef-list', 'benef', 'pub-tag--benef');
  const fechaEl = document.getElementById('pub-fecha');
  if (fechaEl) fechaEl.min = new Date().toISOString().split('T')[0];
  document.getElementById('btnPublicar')?.addEventListener('click', pubHandleSubmit);
  document.getElementById('btnBorrador')?.addEventListener('click', () => showToast('Borrador guardado', 'success'));
  document.getElementById('btnPublicarOtra')?.addEventListener('click', () => {
    document.getElementById('pubSuccess')?.classList.add('hidden');
    document.querySelector('.publicar-layout')?.classList.remove('hidden');
    pubResetForm();
  });
  pubUpdatePreview(); pubUpdateChecklist();
}

function pubInitTags(inputId, listId, stateKey, tagClass) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  if (!input || !list) return;
  function render() {
    list.innerHTML = pubState[stateKey].map((t, i) => `<span class="pub-tag ${tagClass}">${t}<button class="pub-tag-x" data-i="${i}">×</button></span>`).join('');
    list.querySelectorAll('.pub-tag-x').forEach((btn) => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); pubState[stateKey].splice(+btn.dataset.i, 1); render(); pubUpdateChecklist(); });
    });
  }
  function add(val) {
    const clean = val.trim().replace(/,$/, '');
    if (!clean || pubState[stateKey].includes(clean)) return;
    pubState[stateKey].push(clean); input.value = ''; render(); pubUpdateChecklist();
  }
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input.value); }
    if (e.key === 'Backspace' && !input.value && pubState[stateKey].length) { pubState[stateKey].pop(); render(); pubUpdateChecklist(); }
  });
  input.addEventListener('blur', () => { if (input.value.trim()) add(input.value); });
}

function pubUpdatePreview() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('prev-titulo', pubState.titulo || 'Tu oferta aparecerá así');
  set('prev-ubicacion', pubState.ubicacion || 'Ubicación');
  const mEl = document.getElementById('prev-modalidad');
  if (mEl) { mEl.textContent = pubState.modalidad; mEl.className = `job-tag ${pubState.modalidad === 'Remoto' ? 'remote' : ''}`; }
  set('prev-jornada', pubState.jornada);
  const sEl = document.getElementById('prev-salario');
  if (sEl) {
    if (pubState.salNeg) sEl.textContent = 'Salario a convenir';
    else if (pubState.salConf) sEl.textContent = 'Salario confidencial';
    else if (pubState.salMin && pubState.salMax) sEl.textContent = `$${pubState.salMin} – $${pubState.salMax}`;
    else sEl.textContent = 'Salario a confirmar';
  }
}

function pubUpdateChecklist() {
  const el = document.getElementById('pub-checklist-items');
  const fill = document.getElementById('pub-cl-fill');
  const pct = document.getElementById('pub-cl-pct');
  if (!el) return;
  const done = PUB_CHECKLIST.filter((c) => c.check()).length;
  const p = Math.round((done / PUB_CHECKLIST.length) * 100);
  el.innerHTML = PUB_CHECKLIST.map((c) => {
    const ok = c.check();
    return `<div class="pub-cl-item ${ok ? 'done' : ''}"><div class="pub-cl-dot ${ok ? 'done' : ''}">✓</div>${c.label}</div>`;
  }).join('');
  if (fill) fill.style.width = p + '%';
  if (pct) pct.textContent = p + '%';
}

async function pubHandleSubmit() {
  let ok = true;
  [['pub-titulo', 'pub-err-titulo', () => pubState.titulo.trim().length > 0, 'El título es obligatorio.'],
  ['pub-rubro', 'pub-err-rubro', () => pubState.rubro !== '', 'Seleccioná un rubro.'],
  ['pub-ubicacion', 'pub-err-ubicacion', () => pubState.ubicacion.trim().length > 0, 'La ubicación es obligatoria.'],
  ['pub-desc', 'pub-err-desc', () => pubState.desc.length >= 50, 'La descripción debe tener al menos 50 caracteres.'],
  ].forEach(([, errId, check, msg]) => {
    const errEl = document.getElementById(errId);
    if (errEl) errEl.textContent = check() ? '' : msg;
    if (!check()) ok = false;
  });
  if (!ok) { document.querySelector('.pub-error:not(:empty)')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }

  const btn = document.getElementById('btnPublicar');
  const txt = btn?.querySelector('.pub-btn-text');
  const spin = btn?.querySelector('.pub-spinner');
  if (btn) btn.disabled = true;
  if (txt) txt.style.display = 'none';
  if (spin) spin.classList.remove('hidden');
  await delay(2000);
  if (btn) btn.disabled = false;
  if (txt) txt.style.display = '';
  if (spin) spin.classList.add('hidden');

  document.querySelector('.publicar-layout')?.classList.add('hidden');
  const success = document.getElementById('pubSuccess');
  if (success) {
    success.classList.remove('hidden');
    animateCounterId('pubCandCount', 0, 1247, 1600);
    animateCounterId('pubMatchCount', 0, 34, 1600);
  }
  showToast('¡Oferta publicada!', 'success');
}

function animateCounterId(id, from, to, dur) {
  const el = document.getElementById(id); if (!el) return;
  const s = performance.now();
  function t(n) { const p = Math.min((n - s) / dur, 1); el.textContent = Math.floor(from + (1 - Math.pow(2, -10 * p)) * (to - from)).toLocaleString('es-AR'); if (p < 1) requestAnimationFrame(t); }
  requestAnimationFrame(t);
}

function pubResetForm() {
  Object.assign(pubState, { titulo: '', rubro: '', modalidad: 'Presencial', ubicacion: '', jornada: 'Full time', desc: '', skills: [], resp: [], benef: [], salMin: '', salMax: '', salNeg: false, salConf: false });
  ['pub-titulo', 'pub-ubicacion', 'pub-desc', 'pub-sal-min', 'pub-sal-max'].forEach((id) => { const el = document.getElementById(id); if (el) el.value = ''; });
  ['pub-sal-neg', 'pub-sal-conf'].forEach((id) => { const el = document.getElementById(id); if (el) el.checked = false; });
  ['pub-skills-list', 'pub-resp-list', 'pub-benef-list'].forEach((id) => { const el = document.getElementById(id); if (el) el.innerHTML = ''; });
  document.querySelectorAll('.pub-radio').forEach((b) => b.classList.toggle('active', b.dataset.val === 'Presencial'));
  pubUpdatePreview(); pubUpdateChecklist();
}

/* ─────────────────────────────────
   INIT
───────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  // 0. Manejar sección desde la URL (ej: ?section=perfil o #perfil) inmediatamente para evitar saltos
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash.substring(1);
  const initialSection = params.get('section') || hash || 'overview';
  if (SECTIONS.includes(initialSection)) {
    switchSection(initialSection);
  }

  // 1. Validar sesión
  const session = requireSession();
  if (!session) return;

  // Actualizar nombre en sidebar y topbar
  if (session.nombre) {
    const empresaNombre = session.nombre;
    document.querySelectorAll('.sp-name, .avatar-name').forEach((el) => {
      el.textContent = empresaNombre;
    });
    document.querySelectorAll('.sp-avatar, .avatar-circle').forEach((el) => {
      el.textContent = empresaNombre.charAt(0).toUpperCase();
    });
    const greetEl = document.querySelector('.greeting-title');
    if (greetEl) greetEl.textContent = `Bienvenido, ${empresaNombre} 🏢`;
  }

  // Cargar ofertas reales de la empresa
  if (session.empresaId) {
    try {
      const res = await fetch(`http://localhost:3000/api/jobs?empresaId=${session.empresaId}`);
      const misOfertas = await res.json();

      if (misOfertas.length) {
        OFERTAS_DATA.length = 0;
        misOfertas.forEach((j) => {
          OFERTAS_DATA.push({
            id: j.id,
            title: j.titulo,
            area: j.rubro,
            modalidad: j.modalidad,
            ubicacion: j.ubicacion,
            status: j.activa ? 'activa' : 'cerrada',
            postulaciones: j.postulaciones?.length || 0,
            vistas: 0,
            dias: Math.floor((Date.now() - new Date(j.creadoEn)) / 86400000),
          });
        });

        // Badge ofertas en sidebar
        const badge = document.querySelector('.snav-item[data-section="ofertas"] .snav-badge');
        if (badge) badge.textContent = OFERTAS_DATA.filter((o) => o.status === 'activa').length;

        // Actualizar stats del resumen con datos reales
        const totalPostulaciones = OFERTAS_DATA.reduce((acc, o) => acc + o.postulaciones, 0);
        const totalActivas = OFERTAS_DATA.filter((o) => o.status === 'activa').length;
        const greetSub = document.querySelector('.greeting-sub');
        if (greetSub) greetSub.innerHTML = `Tenés <strong>${totalPostulaciones} postulaciones nuevas</strong> y <strong>${totalActivas} ofertas activas</strong> publicadas.`;

        // Cargar candidatos de TODAS las ofertas
        CANDIDATOS_DATA.length = 0;
        for (const oferta of misOfertas) {
          try {
            const candRes = await fetch(`http://localhost:3000/api/applications?ofertaId=${oferta.id}`);
            const candData = await candRes.json();
            if (candRes.ok && Array.isArray(candData)) {
              candData.forEach((p) => {
                CANDIDATOS_DATA.push({
                  id: p.id,
                  rank: CANDIDATOS_DATA.length + 1,
                  nombre: `${p.candidato?.nombre || 'Candidato'} ${p.candidato?.apellido || ''}`.trim(),
                  iniciales: (p.candidato?.nombre?.charAt(0) || 'C') + (p.candidato?.apellido?.charAt(0) || ''),
                  color: 'linear-gradient(135deg,#5C6BC0,#7C4DFF)',
                  ofertaId: p.ofertaId,
                  oferta: oferta.titulo,
                  exp: p.candidato?.habilidades?.join(', ') || 'Sin datos',
                  match: p.matchIA || 0,
                  skills: p.candidato?.habilidades?.slice(0, 3) || [],
                  missing: 0,
                  estado: p.estado,
                });
              });
            }
          } catch (err) {
            console.error('Error cargando candidatos:', err);
          }
        }

        // Badge candidatos en sidebar
        const candBadge = document.querySelector('.snav-item[data-section="candidatos"] .snav-badge');
        if (candBadge) candBadge.textContent = CANDIDATOS_DATA.length;

        // Actualizar selector de ofertas con datos reales
        const selectOferta = document.getElementById('selectOferta');
        if (selectOferta) {
          selectOferta.innerHTML =
            `<option value="todas">Todas las ofertas (${CANDIDATOS_DATA.length})</option>` +
            misOfertas.map((o) => {
              const cant = CANDIDATOS_DATA.filter((c) => c.ofertaId === o.id).length;
              return `<option value="${o.id}">${o.titulo} (${cant})</option>`;
            }).join('');
        }
      }

    } catch (err) {
      console.error('Error cargando datos de empresa:', err);
    }
  }

  injectGradient();
  renderOfertasMini();
  renderTopCandidatos();
  renderActividad();
  renderOfertas();
  renderCandidatos();
  initNavbar();
  initNavSession();
  initNav();
  initOfertasTabs();
  initSelectOferta();
  initFilterStatus();
  initPublicarForm();
});