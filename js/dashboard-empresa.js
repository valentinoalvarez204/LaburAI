/* ══════════════════════════════════════════
   LaburAI — dashboard-empresa.js
══════════════════════════════════════════ */

/* ─────────────────────────────────
   DATOS — Reactive state (populated from API)
───────────────────────────────── */
let EMPRESA = { nombre: '', iniciales: '' };
let OFERTAS_DATA = [];
let CANDIDATOS_DATA = [];

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
  renderSidebarNav('empresa', 'overview');

  // Sidebar nav (Event Delegation)
  document.addEventListener('click', (e) => {
    const item = e.target.closest('.snav-item');
    if (!item) return;
    
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

  updateOfertasTabsCounts();
}

/** Actualiza los números en los botones de las tabs de ofertas */
function updateOfertasTabsCounts() {
  const todas = OFERTAS_DATA.length;
  const activas = OFERTAS_DATA.filter(o => o.status === 'activa').length;
  const cerradas = OFERTAS_DATA.filter(o => o.status === 'cerrada').length;

  const btnTodas = document.querySelector('.otab[data-of="todas"]');
  const btnActivas = document.querySelector('.otab[data-of="activa"]');
  const btnCerradas = document.querySelector('.otab[data-of="cerrada"]');

  if (btnTodas) btnTodas.textContent = `Todas (${todas})`;
  if (btnActivas) btnActivas.textContent = `Activas (${activas})`;
  if (btnCerradas) btnCerradas.textContent = `Cerradas (${cerradas})`;
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
    const statusColors = { PENDIENTE: '#9e9e9e', REVISADA: 'var(--indigo)', ENTREVISTA: 'var(--violet)', RECHAZADA: '#E53935' };
    const borderColor = statusColors[c.estado] || '#e4e8f0';

    return `
      <div class="cand-card" data-id="${c.id}" style="border-left-color: ${borderColor}">
        ${missing}
        <div class="cand-rank ${rankCls}">#${i + 1}</div>
        <div class="cand-av" style="background:${c.color}">${c.iniciales}</div>
        <div class="cand-info">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <div class="cand-name" style="margin-bottom:0">${c.nombre}</div>
            <span class="cand-status-pill cand-status-pill--${c.estado.toLowerCase()}">${c.estado}</span>
          </div>
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
          <div class="status-dropdown" id="sd-${c.id}" data-id="${c.id}" data-estado="${c.estado}">
            <button class="status-dropdown-btn sd-${c.estado.toLowerCase()}" onclick="toggleStatusDropdown('${c.id}', event)">
              <span class="sd-dot" style="background:${getStatusColor(c.estado)}"></span>
              <span class="sd-label">${getStatusLabel(c.estado)}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div class="status-dropdown-menu" id="sdm-${c.id}">
              ${['PENDIENTE','REVISADA','ENTREVISTA','RECHAZADA'].map(s => `
                <button class="sd-option ${s === c.estado ? 'sd-option--active' : ''}" onclick="cambiarEstadoPostulacion('${c.id}', '${s}')">
                  <span class="sd-dot" style="background:${getStatusColor(s)}"></span>
                  ${getStatusLabel(s)}
                </button>`).join('')}
            </div>
          </div>
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

/* Lógica de colores y dropdown de estado movida a utils.js */

/* ─────────────────────────────────
   ACCIONES
───────────────────────────────── */
window.cambiarEstadoPostulacion = async function (id, nuevoEstado) {
  const c = CANDIDATOS_DATA.find((x) => String(x.id) === String(id));
  if (!c || c.estado === nuevoEstado) return;

  document.getElementById(`sdm-${id}`)?.classList.remove('open');

  if (nuevoEstado === 'ENTREVISTA' || nuevoEstado === 'RECHAZADA') {
    const msg = nuevoEstado === 'ENTREVISTA'
      ? `¿Agendar entrevista con ${c.nombre}?`
      : `¿Rechazar la postulación de ${c.nombre}?`;
    if (!confirm(msg)) return;
  }

  const btn = document.querySelector(`#sd-${id} .status-dropdown-btn`);
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = '0.6';
    btn.style.cursor = 'not-allowed';
    btn.querySelector('.sd-label').textContent = 'Guardando...';
  }

  try {
    await API.patchPostulacion(id, { estado: nuevoEstado });
    c.estado = nuevoEstado;
    showToast(`✓ ${c.nombre} → ${getStatusLabel(nuevoEstado)}`, 'success');
    updateStatusDropdownUI(id, nuevoEstado);
    const filtro = document.getElementById('filterStatus')?.value || 'todos';
    if (filtro !== 'todos') {
      renderCandidatos(document.getElementById('selectOferta')?.value || 'todas');
    }
  } catch (err) {
    console.error('[Dashboard] Error cambiando estado:', err.message);
    showToast(err.message || 'Error al actualizar el estado', 'error');
    updateStatusDropdownUI(id, c.estado);
  }
};


/* Actualiza la UI del dropdown SIN re-renderizar la lista completa */
function updateStatusDropdownUI(id, estado) {
  const wrapper = document.getElementById(`sd-${id}`);
  if (!wrapper) return;
  const btn = wrapper.querySelector('.status-dropdown-btn');
  if (btn) {
    btn.disabled = false;
    btn.style.opacity = '';
    btn.style.cursor = '';
    // Reemplazar clases de color
    btn.className = `status-dropdown-btn sd-${estado.toLowerCase()}`;
    btn.querySelector('.sd-dot').style.background = getStatusColor(estado);
    btn.querySelector('.sd-label').textContent = getStatusLabel(estado);
  }
  // Marcar opción activa
  wrapper.querySelectorAll('.sd-option').forEach(opt => {
    opt.classList.toggle('sd-option--active', opt.textContent.trim() === getStatusLabel(estado));
  });
  wrapper.dataset.estado = estado;
}

window.cerrarOferta = async function (ofertaId, btn) {
  if (!confirm('¿Segúros que querés cerrar esta oferta?')) return;
  try {
    await API.cerrarOferta(ofertaId);
    showToast('Oferta cerrada correctamente', 'success');
    const oferta = OFERTAS_DATA.find((o) => o.id === ofertaId);
    if (oferta) oferta.status = 'cerrada';
    renderOfertas(document.querySelector('.otab.active')?.dataset.of || 'todas');
  } catch (err) {
    console.error('[Dashboard] Error cerrando oferta:', err.message);
    showToast('Error al cerrar la oferta', 'error');
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
    const prevText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Guardando…';

    try {
      const session = requireSession();
      if (!session || !session.empresaId) throw new Error('No hay sesión activa');

      const data = {
        nombre: document.getElementById('empNombre')?.value || undefined,
        industria: document.getElementById('empIndustria')?.value === 'Otro'
          ? (document.getElementById('empOtraIndustria')?.value || undefined)
          : (document.getElementById('empIndustria')?.value || undefined),
        tamanoEmpresa: document.getElementById('empTamano')?.value || undefined,
        ubicacion: document.getElementById('empUbicacion')?.value || undefined,
        descripcion: document.getElementById('empDescripcion')?.value || undefined,
        sitioWeb: document.getElementById('empSitioWeb')?.value || undefined,
        anoFundacion: document.getElementById('empAnoFundacion')?.value 
          ? Number(document.getElementById('empAnoFundacion').value) 
          : null,
      };

      await API.patchPerfilEmpresa(data);

      showToast('Perfil de empresa actualizado', 'success');

      // Update local storage name if it strictly changed
      if (data.nombre && session.nombre !== data.nombre) {
        session.nombre = data.nombre;
        localStorage.setItem('labuai_session', JSON.stringify(session));
        document.querySelectorAll('.sp-name, .avatar-name, .elu-name').forEach((el) => {
          if (el) el.textContent = data.nombre;
        });
      }

    } catch (error) {
      console.error('[Dashboard] Error guardando perfil:', error.message);
      showToast('Error al actualizar el perfil', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = prevText;
    }
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
  set('prev-empresa', EMPRESA.nombre || 'Empresa');
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

  try {
    const payload = {
      titulo: pubState.titulo,
      rubro: pubState.rubro,
      modalidad: pubState.modalidad,
      ubicacion: pubState.ubicacion,
      jornada: pubState.jornada,
      descripcion: pubState.desc,
      habilidades: pubState.skills,
      responsabilidades: pubState.resp,
      beneficios: pubState.benef,
    };

    if (pubState.salMin) payload.salarioMin = Number(pubState.salMin);
    if (pubState.salMax) payload.salarioMax = Number(pubState.salMax);
    
    // (Opcionales si la UI los envia en un futuro, ej vacantes o fechaLimite)
    if (pubState.vacantes) payload.vacantes = Number(pubState.vacantes);
    if (pubState.fechaLimite) payload.fechaLimite = pubState.fechaLimite;

    await API.crearOferta(payload);

    if (btn) btn.disabled = false;
    if (txt) txt.style.display = '';
    if (spin) spin.classList.add('hidden');

    document.querySelector('.publicar-layout')?.classList.add('hidden');
    const success = document.getElementById('pubSuccess');
    if (success) {
      success.classList.remove('hidden');
      animateCounterId('pubCandCount', 0, 0, 800);
      animateCounterId('pubMatchCount', 0, 0, 800);
    }
    showToast('¡Oferta publicada exitosamente!', 'success');

    // Refrescar lista de ofertas si ya estaban cargadas
    const session = requireSession();
    if (session && session.empresaId) {
      const misOfertas = await API.getOfertas({ empresaId: session.empresaId });
      OFERTAS_DATA.length = 0;
      misOfertas.forEach((j) => OFERTAS_DATA.push({
        id: j.id, title: j.titulo, area: j.rubro, modalidad: j.modalidad, ubicacion: j.ubicacion,
        status: j.activa ? 'activa' : 'cerrada', postulaciones: j.postulaciones?.length || 0,
        vistas: 0, dias: Math.floor((Date.now() - new Date(j.creadoEn)) / 86400000),
      }));
      renderOfertas(document.querySelector('.otab.active')?.dataset.of || 'todas');
    }

  } catch (err) {
    if (btn) btn.disabled = false;
    if (txt) txt.style.display = '';
    if (spin) spin.classList.add('hidden');
    console.error('[Dashboard] Error al publicar:', err.message);
    showToast(err.message || 'Ocurrió un error al publicar la oferta', 'error');
  }
}

function animateCounterId(id, from, to, dur) {
  const el = document.getElementById(id); if (!el) return;
  const s = performance.now();
  function t(n) { 
    const p = Math.min((n - s) / dur, 1); 
    const val = p === 1 ? to : Math.round(from + (1 - Math.pow(2, -10 * p)) * (to - from));
    el.textContent = val.toLocaleString('es-AR'); 
    if (p < 1) requestAnimationFrame(t); 
  }
  requestAnimationFrame(t);
}

function animateCounterEl(el, from, to, dur) {
  if (!el) return;
  const s = performance.now();
  function t(n) { 
    const p = Math.min((n - s) / dur, 1); 
    const val = p === 1 ? to : Math.round(from + (1 - Math.pow(2, -10 * p)) * (to - from));
    el.textContent = val.toLocaleString('es-AR'); 
    if (p < 1) requestAnimationFrame(t); 
  }
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

function initEmpresaForms() {
  document.getElementById('empIndustria')?.addEventListener('change', (e) => {
    const wrap = document.getElementById('empOtraIndustriaWrap');
    if (wrap) wrap.hidden = e.target.value !== 'Otro';
  });
}

/* ─────────────────────────────────
   INIT
───────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  // 0. Manejar sección inicial desde URL/hash
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash.substring(1);
  const initialSection = params.get('section') || hash || 'overview';
  if (SECTIONS.includes(initialSection)) switchSection(initialSection);

  // 1. Validar sesión
  const session = requireSession();
  if (!session) return;

  // 2. Actualizar UI con datos de sesión
  if (session.nombre) {
    EMPRESA.nombre = session.nombre;
    EMPRESA.iniciales = session.nombre.charAt(0).toUpperCase();
    document.querySelectorAll('.sp-name, .avatar-name').forEach((el) => el.textContent = session.nombre);
    document.querySelectorAll('.sp-avatar, .avatar-circle').forEach((el) => el.textContent = EMPRESA.iniciales);
    const greetEl = document.querySelector('.greeting-title');
    if (greetEl) greetEl.textContent = `Bienvenido, ${session.nombre} 🏢`;
  }

  // 3. Cargar datos desde la API
  if (session.empresaId) {
    try {
      // Cargar Perfil Empresa
      const perf = await API.getPerfilEmpresa();
      if (perf) {
        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
        setVal('empNombre', perf.nombre);
        setVal('empTamano', perf.tamanoEmpresa);
        setVal('empSitioWeb', perf.sitioWeb);
        setVal('empDescripcion', perf.descripcion);
        setVal('empUbicacion', perf.ubicacion);
        setVal('empAnoFundacion', perf.anoFundacion);

        const selInd = document.getElementById('empIndustria');
        const wrapInd = document.getElementById('empOtraIndustriaWrap');
        const inputInd = document.getElementById('empOtraIndustria');
        
        if (selInd && perf.industria) {
          const options = Array.from(selInd.options).map(o => o.value);
          if (!options.includes(perf.industria)) {
            selInd.value = 'Otro';
            if (wrapInd) wrapInd.hidden = false;
            if (inputInd) inputInd.value = perf.industria;
          } else {
            selInd.value = perf.industria;
          }
        }

        const topName = document.getElementById('empTopName');
        const topAvatar = document.getElementById('empAvatar');
        if (topName) topName.textContent = perf.nombre || 'Empresa';
        if (topAvatar) topAvatar.textContent = (perf.nombre || 'E').charAt(0).toUpperCase();
      }

      const misOfertas = await API.getOfertas({ empresaId: session.empresaId });

      OFERTAS_DATA.length = 0;
      misOfertas.forEach((j) => OFERTAS_DATA.push({
        id: j.id,
        title: j.titulo,
        area: j.rubro,
        modalidad: j.modalidad,
        ubicacion: j.ubicacion,
        status: j.activa ? 'activa' : 'cerrada',
        postulaciones: j.postulaciones?.length || 0,
        vistas: 0,
        dias: Math.floor((Date.now() - new Date(j.creadoEn)) / 86400000),
      }));

      const badgeOfertas = document.querySelector('.snav-item[data-section="ofertas"] .snav-badge');
      if (badgeOfertas) badgeOfertas.textContent = OFERTAS_DATA.filter((o) => o.status === 'activa').length;

      // Cargar candidatos de todas las ofertas en paralelo
      CANDIDATOS_DATA.length = 0;
      const resultados = await Promise.all(
        misOfertas.map((o) =>
          API.getPostulaciones({ ofertaId: o.id })
            .then((p) => ({ oferta: o, postulaciones: p }))
            .catch((err) => {
              console.error(`[Dashboard] Error cargando candidatos oferta ${o.id}:`, err.message);
              return { oferta: o, postulaciones: [] };
            })
        )
      );

      resultados.forEach(({ oferta, postulaciones }) => {
        postulaciones.forEach((p) => CANDIDATOS_DATA.push({
          id: p.id,
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
        }));
      });

      const badgeCand = document.querySelector('.snav-item[data-section="candidatos"] .snav-badge');
      if (badgeCand) badgeCand.textContent = CANDIDATOS_DATA.length;

      const selectOferta = document.getElementById('selectOferta');
      if (selectOferta) {
        selectOferta.innerHTML =
          `<option value="todas">Todas las ofertas (${CANDIDATOS_DATA.length})</option>` +
          misOfertas.map((o) => {
            const cant = CANDIDATOS_DATA.filter((c) => c.ofertaId === o.id).length;
            return `<option value="${o.id}">${o.titulo} (${cant})</option>`;
          }).join('');
      }
    } catch (err) {
      console.error('[Dashboard] Error cargando datos de empresa:', err.message);
    }

    // Stats en paralelo — no bloquean el render principal
    apiFetch('/dashboard/empresa')
      .then((stats) => {
        const greetSub = document.querySelector('.greeting-sub');
        if (greetSub) {
          greetSub.innerHTML = `Tenés <strong>${stats.postulaciones} postulaciones nuevas</strong> y <strong>${stats.ofertasActivas} ofertas activas</strong> publicadas.`;
        }

        const elOfertas = document.getElementById('statOfertasActivas');
        const elPostulaciones = document.getElementById('statPostulaciones');
        const elEntrevistas = document.getElementById('statEntrevistas');

        if (elOfertas) animateCounterEl(elOfertas, 0, stats.ofertasActivas, 900);
        if (elPostulaciones) animateCounterEl(elPostulaciones, 0, stats.postulaciones, 900);
        if (elEntrevistas) animateCounterEl(elEntrevistas, 0, stats.entrevistas, 900);
      })
      .catch((err) => {
        console.error('[Dashboard] Error cargando stats empresa:', err.message);
        const greetSub = document.querySelector('.greeting-sub');
        if (greetSub) greetSub.textContent = 'Error al cargar estadísticas.';
      });
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
  initEmpresaForms();
  initGuardarEmpresa();
});