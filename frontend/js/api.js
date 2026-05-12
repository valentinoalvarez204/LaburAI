/* ══════════════════════════════════════════
   LaburAI — api.js
   Módulo centralizado para todas las llamadas
   al backend REST.  Ninguna otra página debe
   hacer fetch() directo; importar desde aquí.
══════════════════════════════════════════ */

const API_BASE = 'http://localhost:3000/api';

/**
 * Wrapper base para llamadas a la API.
 * Lanza un Error si la respuesta no es 2xx.
 */
async function apiFetch(path, options = {}) {
  const session = (() => {
    try { return JSON.parse(sessionStorage.getItem('labuai_session') || '{}'); }
    catch { return {}; }
  })();

  const headers = { ...options.headers };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (session.token) headers['Authorization'] = `Bearer ${session.token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    if (res.status === 401) {
      sessionStorage.removeItem('labuai_session');
      window.location.href = '/login.html';
      return;
    }
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || `HTTP ${res.status}: ${path}`);
  }
  return res.json();
}

/** Comprueba que los campos esperados estén presentes en un objeto. */
function assertFields(obj, fields, context) {
  fields.forEach(f => {
    if (obj[f] === undefined || obj[f] === null) {
      console.warn(`[API] Campo '${f}' falta en la respuesta de ${context}`);
    }
  });
}

/* ─────────────────────────────────
   AUTENTICACIÓN
───────────────────────────────── */
async function login(email, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

async function register(data) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/* ─────────────────────────────────
   ESTADÍSTICAS GLOBALES
───────────────────────────────── */
async function getGlobalStats() {
  try {
    const data = await apiFetch('/stats');
    assertFields(data, ['candidatos', 'ofertas', 'empresas'], '/stats');
    return data;
  } catch (err) {
    console.error('[API] Error obteniendo stats globales:', err.message);
    throw err;
  }
}

/* ─────────────────────────────────
   ESTADÍSTICAS EMPRESA
───────────────────────────────── */
async function getStatsEmpresa() {
  try {
    const data = await apiFetch(`/stats/empresa`);
    assertFields(data, ['ofertasActivas', 'totalPostulaciones', 'entrevistas', 'rechazadas'], `/stats/empresa`);
    return data;
  } catch (err) {
    console.error('[API] Error obteniendo stats de empresa:', err.message);
    throw err;
  }
}

/* ─────────────────────────────────
   ESTADÍSTICAS CANDIDATO
───────────────────────────────── */
async function getStatsCandidato() {
  try {
    const data = await apiFetch(`/stats/candidato`);
    assertFields(data, ['totalPostulaciones', 'pendientes', 'entrevistas', 'rechazadas'], `/stats/candidato`);
    return data;
  } catch (err) {
    console.error('[API] Error obteniendo stats de candidato:', err.message);
    throw err;
  }
}

/* ─────────────────────────────────
   OFERTAS
───────────────────────────────── */
async function getOfertas(params = {}) {
  const qs = new URLSearchParams(params).toString();
  try {
    return await apiFetch(`/jobs${qs ? '?' + qs : ''}`);
  } catch (err) {
    console.error('[API] Error obteniendo ofertas:', err.message);
    throw err;
  }
}

async function getOferta(id) {
  try {
    return await apiFetch(`/jobs/${id}`);
  } catch (err) {
    console.error(`[API] Error obteniendo oferta ${id}:`, err.message);
    throw err;
  }
}

async function crearOferta(data) {
  try {
    return await apiFetch('/jobs', { method: 'POST', body: JSON.stringify(data) });
  } catch (err) {
    console.error('[API] Error creando oferta:', err.message);
    throw err;
  }
}

async function patchOferta(id, data) {
  try {
    return await apiFetch(`/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  } catch (err) {
    console.error(`[API] Error actualizando oferta ${id}:`, err.message);
    throw err;
  }
}

async function cerrarOferta(id) {
  try {
    return await apiFetch(`/jobs/${id}/cerrar`, { method: 'PATCH' });
  } catch (err) {
    console.error(`[API] Error cerrando oferta ${id}:`, err.message);
    throw err;
  }
}

/* ─────────────────────────────────
   POSTULACIONES
───────────────────────────────── */
async function getPostulaciones(params = {}) {
  const qs = new URLSearchParams(params).toString();
  try {
    return await apiFetch(`/applications${qs ? '?' + qs : ''}`);
  } catch (err) {
    console.error('[API] Error obteniendo postulaciones:', err.message);
    throw err;
  }
}

async function getPostulacion(id) {
  try {
    return await apiFetch(`/applications/${id}`);
  } catch (err) {
    console.error(`[API] Error obteniendo postulacion ${id}:`, err.message);
    throw err;
  }
}

async function patchPostulacion(id, data) {
  try {
    return await apiFetch(`/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.error(`[API] Error actualizando postulacion ${id}:`, err.message);
    throw err;
  }
}

async function crearPostulacion(data) {
  try {
    return await apiFetch('/applications', { method: 'POST', body: JSON.stringify(data) });
  } catch (err) {
    console.error('[API] Error creando postulación:', err.message);
    throw err;
  }
}

/* ─────────────────────────────────
   PERFIL CANDIDATO
───────────────────────────────── */
async function getPerfilCandidato(id) {
  try {
    const data = await apiFetch(`/profile/candidato/${id}`);
    assertFields(data, ['nombre', 'scoreCV'], `/profile/candidato/${id}`);
    return data;
  } catch (err) {
    console.error(`[API] Error obteniendo perfil candidato ${id}:`, err.message);
    throw err;
  }
}

async function patchPerfilCandidato(id, data) {
  try {
    return await apiFetch(`/profile/candidato/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.error(`[API] Error actualizando perfil candidato ${id}:`, err.message);
    throw err;
  }
}

async function postReAnalyzeCV(id) {
  try {
    return await apiFetch(`/profile/candidato/${id}/re-analyze`, { method: 'POST' });
  } catch (err) {
    console.error(`[API] Error re-analizando CV del candidato ${id}:`, err.message);
    throw err;
  }
}

async function uploadCv(id, file) {
  try {
    const formData = new FormData();
    formData.append('cv', file);
    return await apiFetch(`/profile/candidato/${id}/cv`, {
      method: 'POST',
      body: formData,
    });
  } catch (err) {
    console.error(`[API] Error subiendo CV del candidato ${id}:`, err.message);
    throw err;
  }
}

/* ─────────────────────────────────
   PERFIL EMPRESA
───────────────────────────────── */
async function getPerfilEmpresa() {
  try {
    const data = await apiFetch(`/profile/empresa`);
    return data;
  } catch (err) {
    console.error(`[API] Error obteniendo perfil empresa:`, err.message);
    throw err;
  }
}

async function patchPerfilEmpresa(data) {
  try {
    return await apiFetch(`/profile/empresa`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.error(`[API] Error actualizando perfil empresa:`, err.message);
    throw err;
  }
}

async function getIndustrias() {
  try {
    return await apiFetch(`/profile/industrias`);
  } catch (err) {
    console.error(`[API] Error obteniendo industrias:`, err.message);
    throw err;
  }
}
/* ─────────────────────────────────
   EXPORT GLOBAL
───────────────────────────────── */
window.API = {
  // Auth
  login,
  register,
  // Stats
  getGlobalStats,
  getStatsEmpresa,
  getStatsCandidato,
  // Ofertas
  getOfertas,
  getOferta,
  crearOferta,
  patchOferta,
  cerrarOferta,
  // Postulaciones
  getPostulaciones,
  getPostulacion,
  patchPostulacion,
  crearPostulacion,
  // Perfil
  getPerfilCandidato,
  patchPerfilCandidato,
  postReAnalyzeCV,
  uploadCv,
  getPerfilEmpresa,
  patchPerfilEmpresa,
  getIndustrias,
};
