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
    setTimeout(() => window.location.href = UI_PAGES.dashboard_empresa, 1500);
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

  const oferta = app.oferta || {};
  const briefEl = document.getElementById('ofertaBrief');
  if (briefEl) {
    if (oferta.titulo) {
      const fechaPost = app.creadoEn ? new Date(app.creadoEn).toLocaleDateString('es-AR', {
        day: 'numeric', month: 'short', year: 'numeric'
      }) : '';
      const fechaTexto = fechaPost ? ` · Aplicó el ${fechaPost}` : '';
      const empresaNombre = oferta.empresa?.nombre ? `${oferta.empresa.nombre} - ` : '';
      briefEl.innerHTML = `Postulado a: <strong style="color:var(--text1)">${empresaNombre}${oferta.titulo}</strong> <span style="opacity:0.8">· ${oferta.modalidad || ''} · ${oferta.ubicacion || ''}${fechaTexto}</span>`;
    } else {
      briefEl.textContent = 'Datos de la oferta no disponibles.';
    }
  }

  // --- Currículum Vitae (Modal & PDF Iframe) ---
  const cvBody = document.getElementById('modalCvBody');
  const btnTab = document.getElementById('btnOpenCvTab');
  let finalCvUrl = cand.cvUrl;
  
  if (finalCvUrl) {
    // Resolver posible path relativo
    if (finalCvUrl.startsWith('/')) {
      const baseUrl = typeof API_BASE !== 'undefined' ? API_BASE.replace('/api', '') : 'http://localhost:3000';
      finalCvUrl = baseUrl + finalCvUrl;
    }
    
    if (cvBody) {
      cvBody.innerHTML = `<iframe src="${finalCvUrl}" width="100%" height="100%" style="border:none; border-radius:12px; min-height:75vh; background:white;"></iframe>`;
    }
    if (btnTab) {
      btnTab.onclick = () => window.open(finalCvUrl, '_blank');
      btnTab.style.display = 'inline-block';
    }
    const cvFilename = document.getElementById('cvFilename');
    if (cvFilename) {
      cvFilename.textContent = finalCvUrl.split('/').pop().split('?')[0] || 'Documento CV';
    }
    const cvScorePill = document.getElementById('cvScorePill');
    if (cvScorePill && cand.scoreCV !== undefined && cand.scoreCV !== null) {
      cvScorePill.textContent = `Score: ${cand.scoreCV}`;
      cvScorePill.style.display = 'inline-block';
    } else if (cvScorePill) {
      cvScorePill.style.display = 'none';
    }
  } else {
    if (cvBody) {
      cvBody.innerHTML = `
        <div class="cv-fullscreen-placeholder">
           <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8">
             <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
           </svg>
           <p style="margin-top:20px; font-size:16px;">Este candidato no ha subido un Currículum Vitae</p>
        </div>
      `;
    }
    if (btnTab) btnTab.style.display = 'none';
    const cvScorePill = document.getElementById('cvScorePill');
    if (cvScorePill) cvScorePill.style.display = 'none';
  }

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
  if (cand.resumenIA) {
    document.getElementById('candSummary').innerHTML = cand.resumenIA.replace(/\n/g, '<br>');
  } else {
    document.getElementById('candSummary').textContent = 'El análisis de IA sobre este perfil aún no se ha generado o el candidato no proporcionó suficiente información.';
  }
  
  const skillsList = document.getElementById('candSkillsList');
  if (cand.habilidades?.length) {
    skillsList.innerHTML = cand.habilidades.map(s => `<span class="cand-skill match">${s}</span>`).join('');
  } else {
    skillsList.innerHTML = '<span class="text-secondary" style="font-size:13px">Habilidades no detectadas</span>';
  }

  // --- Contacto ---
  document.getElementById('candEmail').textContent = cand.usuario?.email || 'N/A';
  document.getElementById('candPhone').textContent = cand.telefono || 'No proporcionado';
  document.getElementById('candModalidadBuscada').textContent = cand.modalidadBuscada || 'No especificada';
  document.getElementById('candAreaRubro').textContent = cand.areaRubro || 'No especificada';
  document.getElementById('candPretensionSalarial').textContent = cand.pretensionSalarial || 'No especificada';

  // --- Motivación ---
  const motiv = document.getElementById('motivLetter');
  if (app.cartaMotivacion) {
    motiv.innerHTML = app.cartaMotivacion.replace(/\n/g, '<br>');
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
  const desc = document.getElementById('iaAnalysisText');
  const strengths = document.getElementById('iaStrengths');
  const gaps = document.getElementById('iaGaps');
  const circumference = 2 * Math.PI * 35; // r=35

  if (!app.matchAnalizadoEmpresa) {
    num.textContent = '—%';
    if (ring) ring.style.strokeDashoffset = circumference;
    if (desc) desc.textContent = 'La empresa todavía no analizó el matching con IA para esta postulación.';
    if (strengths) strengths.innerHTML = '<li>Analizá el matching desde la lista de candidatos.</li>';
    if (gaps) gaps.innerHTML = '<li>El diagnóstico se genera cuando la IA compara el perfil con la oferta.</li>';
    return;
  }
  
  // Animar score
  num.textContent = score + '%';
  const offset = circumference * (1 - score / 100);
  
  setTimeout(() => {
    ring.style.strokeDashoffset = offset;
  }, 100);

  // Análisis de compatibilidad
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
window.addEventListener('click', function(event) {
  const modal = document.getElementById('cvModal');
  if (event.target === modal) closeModal();
});

/**
 * INIT
 */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initNavSession();
  initPage();
});
function setCandidatoPostulacionAvatar(url, fallbackName = '') {
  const avatar = document.getElementById('spAvatar') || document.querySelector('#dashSidebar .sp-avatar');
  const nameEl = document.getElementById('spName') || document.querySelector('#dashSidebar .sp-name');
  const displayName = fallbackName || 'Usuario';

  if (nameEl) nameEl.textContent = displayName;
  if (!avatar) return;

  if (url) {
    avatar.textContent = '';
    avatar.style.backgroundImage = `url("${url}")`;
    avatar.style.backgroundSize = 'cover';
    avatar.style.backgroundPosition = 'center';
    avatar.style.backgroundRepeat = 'no-repeat';
    return;
  }

  avatar.style.backgroundImage = '';
  avatar.style.backgroundSize = '';
  avatar.style.backgroundPosition = '';
  avatar.style.backgroundRepeat = '';
  avatar.textContent = displayName.charAt(0).toUpperCase();
}

async function hydrateCandidatoPostulacionAvatar() {
  const session = typeof getSession === 'function'
    ? getSession()
    : JSON.parse(sessionStorage.getItem('labuai_session') || '{}');
  if (!session?.candidatoId) return;

  setCandidatoPostulacionAvatar(session.fotoUrl || '', session.nombre || '');

  try {
    const profile = await API.getPerfilCandidato(session.candidatoId);
    const fullName = `${profile.nombre || ''} ${profile.apellido || ''}`.trim() || session.nombre || '';
    setCandidatoPostulacionAvatar(profile.fotoUrl || '', fullName);

    session.fotoUrl = profile.fotoUrl || '';
    session.nombre = fullName || session.nombre;
    sessionStorage.setItem('labuai_session', JSON.stringify(session));
  } catch (error) {
    console.warn('[CandidatoPostulacion] No se pudo cargar la foto del candidato:', error.message);
  }
}

document.addEventListener('DOMContentLoaded', hydrateCandidatoPostulacionAvatar);

function setSidebarEmpresaLogo(url, fallbackName = '') {
  const avatar = document.querySelector('#dashSidebar .sp-avatar');
  const displayName = fallbackName || 'Empresa';
  if (!avatar) return;

  if (url) {
    avatar.textContent = '';
    avatar.style.backgroundImage = `url("${url}")`;
    avatar.style.backgroundSize = 'cover';
    avatar.style.backgroundPosition = 'center';
    avatar.style.backgroundRepeat = 'no-repeat';
    return;
  }

  avatar.style.backgroundImage = '';
  avatar.style.backgroundSize = '';
  avatar.style.backgroundPosition = '';
  avatar.style.backgroundRepeat = '';
  avatar.textContent = displayName.charAt(0).toUpperCase();
}

function setPostulacionCandidatePhoto(url, fallbackName = '') {
  const displayName = fallbackName || 'Candidato';
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'C';

  const explicitCandidates = Array.from(document.querySelectorAll('.cand-avatar, .candidate-avatar, .cp-avatar, .profile-avatar, .avatar-lg'));
  const initialCandidates = Array.from(document.querySelectorAll('main *')).filter((el) => {
    const text = (el.textContent || '').trim().toUpperCase();
    const hasOnlyInitials = text === initials || /^[A-ZÁÉÍÓÚÑ]{1,3}$/.test(text);
    return hasOnlyInitials && el.children.length === 0;
  });

  const candidates = [...explicitCandidates, ...initialCandidates];
  const avatar = candidates.find((el) => {
    const text = (el.textContent || '').trim().toUpperCase();
    return text === initials || text.length <= 3;
  }) || candidates[0];

  if (!avatar) return;

  if (url) {
    avatar.textContent = '';
    avatar.style.backgroundImage = `url("${url}")`;
    avatar.style.backgroundSize = 'cover';
    avatar.style.backgroundPosition = 'center';
    avatar.style.backgroundRepeat = 'no-repeat';
    avatar.style.overflow = 'hidden';
    return;
  }

  avatar.style.backgroundImage = '';
  avatar.style.backgroundSize = '';
  avatar.style.backgroundPosition = '';
  avatar.style.backgroundRepeat = '';
  avatar.textContent = initials;
}

async function hydratePostulacionLogosAndPhotos() {
  const session = typeof getSession === 'function'
    ? getSession()
    : JSON.parse(sessionStorage.getItem('labuai_session') || '{}');

  setSidebarEmpresaLogo(session?.logoUrl || '', session?.nombre || '');

  if (session?.rol === 'EMPRESA' || session?.empresaId) {
    try {
      const empresa = await API.getPerfilEmpresa();
      setSidebarEmpresaLogo(empresa.logoUrl || '', empresa.nombre || session.nombre || '');
      session.logoUrl = empresa.logoUrl || '';
      session.nombre = empresa.nombre || session.nombre;
      sessionStorage.setItem('labuai_session', JSON.stringify(session));
    } catch (error) {
      console.warn('[CandidatoPostulacion] No se pudo cargar el logo de empresa:', error.message);
    }
  }

  const postulacionId = new URLSearchParams(window.location.search).get('id');
  if (!postulacionId) return;

  try {
    const postulacion = await API.getPostulacion(postulacionId);
    let candidato = postulacion?.candidato || {};
    if (!candidato.fotoUrl && candidato.id) {
      try {
        candidato = await API.getPerfilCandidato(candidato.id);
      } catch (error) {
        console.warn('[CandidatoPostulacion] No se pudo cargar el perfil del candidato:', error.message);
      }
    }
    const candidateName = `${candidato.nombre || ''} ${candidato.apellido || ''}`.trim();
    setPostulacionCandidatePhoto(candidato.fotoUrl || '', candidateName);
  } catch (error) {
    console.warn('[CandidatoPostulacion] No se pudo cargar la foto de la postulación:', error.message);
  }
}

document.addEventListener('DOMContentLoaded', hydratePostulacionLogosAndPhotos);
