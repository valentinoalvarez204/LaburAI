/* ══════════════════════════════════════════
   LaburAI — candidato-postulacion.js
══════════════════════════════════════════ */

let CURRENT_APP = null;

/**
 * 1. Inicialización de la página
 */
async function initPage() {
  // A. Obtener ID de la URL usando utils.js
  const appId = getParam('id');
  if (!appId) {
    showToast('Error: No se proporcionó un ID de postulación', 'error');
    setTimeout(() => window.location.href = 'dashboard-empresa.html', 1500);
    return;
  }

  // B. Verificar Sesión usando utils.js
  const session = requireSession();
  if (!session) return;

  // C. Inyectar datos de empresa y nav en UI
  updateSidebarInfo(session);
  renderSidebarNav('empresa', 'candidatos');

  // D. Cargar datos desde la API
  try {
    const data = await API.getPostulacion(appId);
    CURRENT_APP = data;

    // E. Renderizar
    renderDetailPage(data);
    
    // F. Ocultar loading
    document.getElementById('loadingOverlay').classList.add('hidden');
    document.getElementById('detailContent').classList.remove('hidden');

  } catch (err) {
    showToast(err.message, 'error');
    document.getElementById('loadingOverlay').innerHTML = `<p style="color:var(--error)">${err.message}</p>`;
  }
}

/**
 * 2. Carga datos de la empresa en la UI del Dashboard
 */
function updateSidebarInfo(session) {
  const sidebarName = document.getElementById('sidebarName');
  const sidebarAvatar = document.getElementById('sidebarAvatar');
  if (session.nombre) {
    if (sidebarName) sidebarName.textContent = session.nombre;
    if (sidebarAvatar) sidebarAvatar.textContent = session.nombre.charAt(0).toUpperCase();
  }
}

/**
 * 3. Renderizado principal de la página
 */
function renderDetailPage(app) {
  const cand = app.candidato || {};
  const nombreCandidato = `${cand.nombre || ''} ${cand.apellido || ''}`.trim() || 'Candidato sin nombre';

  // --- Header & Breadcrumb ---
  document.title = `LaburAI — ${nombreCandidato}`;
  document.getElementById('candFullName').textContent = nombreCandidato;
  document.getElementById('candInitials').textContent = (cand.nombre?.charAt(0) || 'C') + (cand.apellido?.charAt(0) || '');
  document.getElementById('modalName').textContent = nombreCandidato;

  // --- Estado ---
  const wrapper = document.getElementById('sd-detail');
  if (wrapper) {
    updateLocalStatusDropdownUI(app.estado);
  }

  // --- Notas Internas ---
  const notesText = document.getElementById('internalNotes');
  if (notesText) {
    notesText.value = app.notes || '';
  }

  // --- Meta Info ---
  document.getElementById('candLocation').textContent = `📍 ${cand.ubicacion || 'Ubicación no especificada'}`;
  
  const keySkills = document.getElementById('candKeySkills');
  if (cand.habilidades?.length) {
    const top = cand.habilidades.slice(0, 3);
    keySkills.innerHTML = top.map(s => `<span class="or-badge">${s}</span>`).join('');
  }

  // --- LinkedIn ---
  const lnBtn = document.getElementById('linkedinBtn');
  if (cand.linkedin) {
    lnBtn.href = cand.linkedin;
    lnBtn.style.display = 'flex';
  } else {
    lnBtn.style.display = 'none';
  }

  // --- Resumen & Habilidades ---
  document.getElementById('candSummary').textContent = cand.resumenIA || 'El análisis de IA sobre este perfil aún no se ha generado o el candidato no proporcionó suficiente información.';
  
  const skillsList = document.getElementById('candSkillsList');
  if (cand.habilidades?.length) {
    skillsList.innerHTML = cand.habilidades.map(s => `<span class="cand-skill match">${s}</span>`).join('');
  } else {
    skillsList.innerHTML = '<span class="text-secondary" style="font-size:13px">Habilidades no detectadas</span>';
  }

  // --- Contacto ---
  document.getElementById('candEmail').textContent = cand.usuario?.email || 'N/A';
  document.getElementById('candPhone').textContent = cand.telefono || 'No proporcionado';

  // --- Motivación ---
  const motiv = document.getElementById('motivLetter');
  if (app.cartaMotivacion) {
    motiv.textContent = app.cartaMotivacion;
    motiv.classList.remove('text-secondary');
  } else {
    motiv.textContent = 'Este candidato no ha incluido una carta de presentación para esta oferta.';
    motiv.style.fontStyle = 'italic';
    motiv.style.opacity = '0.6';
  }

  // --- IA Score & Analysis ---
  renderIA(app);
}

/**
 * 4. Renderizado del Análisis de IA
 */
function renderIA(app) {
  const score = app.matchIA || 0;
  const num = document.getElementById('iaScoreValue');
  const ring = document.getElementById('iaScoreRing');
  
  // Animar score
  num.textContent = score + '%';
  const circumference = 2 * Math.PI * 35; // r=35
  const offset = circumference * (1 - score / 100);
  
  setTimeout(() => {
    ring.style.strokeDashoffset = offset;
  }, 100);

  // Análisis de compatibilidad
  const desc = document.getElementById('iaAnalysisText');
  const strengths = document.getElementById('iaStrengths');
  const gaps = document.getElementById('iaGaps');

  // Lógica de fortalezas/gaps basada en las habilidades de la oferta vs candidato
  const ofertaSkills = app.oferta?.habilidades || [];
  const candSkills = app.candidato?.habilidades || [];

  const matched = candSkills.filter(s => ofertaSkills.includes(s));
  const missing = ofertaSkills.filter(s => !candSkills.includes(s));

  if (score >= 80) {
    desc.textContent = 'Perfil altamente compatible. El candidato cumple con la mayoría de los requisitos críticos y posee la experiencia técnica necesaria.';
  } else if (score >= 50) {
    desc.textContent = 'Perfil con compatibilidad media. Posee bases sólidas pero existen algunas brechas en habilidades específicas requeridas.';
  } else {
    desc.textContent = 'Baja compatibilidad detectada. El perfil no parece alinearse con los requisitos técnicos principales de esta oferta.';
  }

  strengths.innerHTML = matched.length 
    ? matched.slice(0, 4).map(s => `<li>Domina ${s}</li>`).join('')
    : '<li>Posee habilidades transferibles al rubro.</li>';

  gaps.innerHTML = missing.length
    ? missing.slice(0, 4).map(s => `<li>Falta experiencia en ${s}</li>`).join('')
    : '<li>No se detectaron brechas críticas significativas.</li>';
}

/**
 * 5. Gestión del Cambio de Estado
 */
window.handleStatusChange = async function(nuevoEstado) {
  if (CURRENT_APP.estado === nuevoEstado) return;

  // Cerrar el dropdown
  document.getElementById('sdm-detail')?.classList.remove('open');
  
  // A. Confirmación para cambios importantes
  if (nuevoEstado === 'RECHAZADA' || nuevoEstado === 'ENTREVISTA') {
    const msg = nuevoEstado === 'RECHAZADA' 
      ? '¿Estás seguro de descartar a este candidato? No podrá ser contactado para este proceso.'
      : 'Vas a pasar al candidato a etapa de entrevista. ¿Deseas continuar?';
    
    if (!confirm(msg)) return;
  }

  // B. Enviar a API
  const session = getSession();
  const btn = document.getElementById('sdBtn-detail');
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = '0.6';
    btn.style.cursor = 'not-allowed';
    document.getElementById('sdLabel-detail').textContent = 'Guardando...';
  }

  try {
    await API.patchPostulacion(CURRENT_APP.id, { estado: nuevoEstado });
    showToast('Estado de postulación actualizado', 'success');
    CURRENT_APP.estado = nuevoEstado;
    updateLocalStatusDropdownUI(nuevoEstado);
  } catch (err) {
    showToast(err.message, 'error');
    updateLocalStatusDropdownUI(CURRENT_APP.estado);
  }
}

function updateLocalStatusDropdownUI(estado) {
  const wrapper = document.getElementById('sd-detail');
  if (!wrapper) return;
  const btn = document.getElementById('sdBtn-detail');
  if (btn) {
    btn.disabled = false;
    btn.style.opacity = '';
    btn.style.cursor = '';
    btn.className = `status-dropdown-btn sd-${estado.toLowerCase()}`;
    document.getElementById('sdDot-detail').style.background = getStatusColor(estado);
    document.getElementById('sdLabel-detail').textContent = getStatusLabel(estado);
  }
  wrapper.querySelectorAll('.sd-option').forEach(opt => {
    opt.classList.toggle('sd-option--active', opt.textContent.trim() === getStatusLabel(estado));
  });
  wrapper.dataset.estado = estado;
}

/**
 * 6. Guardar Notas Internas
 */
window.saveInternalNotes = async function() {
  const notesText = document.getElementById('internalNotes');
  const btn = document.getElementById('saveNotesBtn');
  const status = document.getElementById('notesStatus');
  const nuevoTexto = notesText.value;

  const session = getSession();
  btn.disabled = true;
  status.textContent = 'Guardando...';

  try {
    await API.patchPostulacion(CURRENT_APP.id, { notes: nuevoTexto });
    status.textContent = '✓ Guardado correctamente';
    setTimeout(() => status.textContent = '', 2000);
    CURRENT_APP.notes = nuevoTexto;
  } catch (err) {
    showToast(err.message, 'error');
    status.textContent = 'Error al guardar';
  } finally {
    btn.disabled = false;
  }
}

/**
 * 6. Modal CV
 */
window.openModal = function() {
  const modal = document.getElementById('cvModal');
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden'; // Evitar scroll de fondo
}

window.closeModal = function() {
  const modal = document.getElementById('cvModal');
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

// Cerrar modal al hacer click fuera del contenido
window.onclick = function(event) {
  const modal = document.getElementById('cvModal');
  if (event.target === modal) closeModal();
}

/**
 * INIT
 */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initNavSession();
  initPage();
});
