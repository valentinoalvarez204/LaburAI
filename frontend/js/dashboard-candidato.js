/* ═══════════════════════════════════════════
   LaburAI — dashboard-candidato.js
   Módulos:
   - Datos del candidato (desde API)
   - Navegación entre secciones
   - Score ring animado
   - Habilidades detectadas
   - Postulaciones con filtro
   - Avatar dropdown
   - Sidebar mobile
════════════════════════════════════════════ */

/* ─────────────────────────────────
   DATOS DEL CANDIDATO (desde API)
─────────────────────────────────── */
let CANDIDATO = {
  nombre: '',
  fotoUrl: '',
  cvUrl: '',
  score: null,
  scoreData: {
    total: null,
    nivel: 'none',
    tip: 'Subí tu CV para que la IA lo analice y genere tu reporte de compatibilidad.',
    criterios: []
  },
  resumen: 'Analizando perfil...',
  habilidades: [],
  techSkills: [],
  softSkills: [],
  techs: [],
  missing: [],
  experiencia: [],
  favoritos: [],
};

let POSTULACIONES = [];
const CANDIDATO_FOTO_MAX_BYTES = 10 * 1024 * 1024;

function setAvatarBackground(el, url, fallbackName = CANDIDATO.nombre) {
  if (!el) return;

  if (url) {
    el.textContent = '';
    el.style.backgroundImage = `url("${url}")`;
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    el.style.backgroundRepeat = 'no-repeat';
    return;
  }

  el.style.backgroundImage = '';
  el.style.backgroundSize = '';
  el.style.backgroundPosition = '';
  el.style.backgroundRepeat = '';
  el.textContent = (fallbackName || 'U').charAt(0).toUpperCase();
}

function setCandidatoFoto(url, fallbackName = CANDIDATO.nombre) {
  const profileAvatar = document.getElementById('candProfileAvatar');

  if (profileAvatar && url) {
    const img = document.createElement('img');
    img.src = url;
    img.alt = `Foto de ${fallbackName || 'candidato'}`;
    profileAvatar.replaceChildren(img);
    profileAvatar.classList.add('cfu-avatar--image');
  } else if (profileAvatar) {
    profileAvatar.classList.remove('cfu-avatar--image');
    profileAvatar.replaceChildren(document.createTextNode((fallbackName || 'U').charAt(0).toUpperCase()));
  }

  document.querySelectorAll('#spAvatar, .avatar-circle').forEach((el) => {
    setAvatarBackground(el, url, fallbackName);
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getOfertaLogoUrl(job) {
  return job?.empresa?.logoUrl || job?.logoUrl || job?.empresaLogoUrl || '';
}

function formatOfertaSalary(job) {
  if (job?.salarioMin && job?.salarioMax) {
    return `$${job.salarioMin.toLocaleString('es-AR')} – $${job.salarioMax.toLocaleString('es-AR')}`;
  }
  if (job?.salarioMin) return `$${job.salarioMin.toLocaleString('es-AR')}`;
  return 'Salario a convenir';
}

function mapOfertaToFavoriteCard(job, fallbackLink) {
  const company = job?.empresa?.nombre || 'Empresa';
  return {
    id: job.id,
    title: job.titulo,
    company,
    location: job.ubicacion || '',
    logo: company.charAt(0).toUpperCase() || '?',
    logoUrl: getOfertaLogoUrl(job),
    logoColor: '#5C6BC0',
    tags: [job.modalidad, job.jornada, ...(job.habilidades?.slice(0, 1) || [])].filter(Boolean),
    tagTypes: [job.modalidad === 'Remoto' ? 'remote' : '', '', ''],
    salary: formatOfertaSalary(job),
    time: job.creadoEn ? new Date(job.creadoEn).toLocaleDateString('es-AR') : '',
    desc: job.descripcion || 'Oferta guardada en favoritos',
    link: fallbackLink || getPerfilLink(job.id),
  };
}

async function loadFavoriteOffers(ids) {
  const list = await API.getOfertas();
  const jobsById = new Map(Array.isArray(list) ? list.map((job) => [String(job.id), job]) : []);

  const detailEntries = await Promise.all(
    ids.map(async (id) => {
      const listJob = jobsById.get(String(id));
      if (listJob && getOfertaLogoUrl(listJob)) return [String(id), listJob];

      try {
        const detailJob = await API.getOferta(id);
        return [String(id), detailJob || listJob];
      } catch (err) {
        console.warn(`[Dashboard] No se pudo cargar detalle de favorito ${id}:`, err.message);
        return [String(id), listJob || null];
      }
    })
  );

  return new Map(detailEntries.filter(([, job]) => Boolean(job)));
}

async function hydratePostulacionLogos(postulaciones) {
  const missing = postulaciones.filter((p) => p.id && !p.logoUrl);
  if (!missing.length) return postulaciones;

  const logoEntries = await Promise.all(
    missing.map(async (p) => {
      try {
        const job = await API.getOferta(p.id);
        return [String(p.id), getOfertaLogoUrl(job)];
      } catch (err) {
        console.warn(`[Dashboard] No se pudo cargar logo de postulación ${p.id}:`, err.message);
        return [String(p.id), ''];
      }
    })
  );

  const logosById = new Map(logoEntries.filter(([, logoUrl]) => Boolean(logoUrl)));
  return postulaciones.map((p) => ({
    ...p,
    logoUrl: p.logoUrl || logosById.get(String(p.id)) || '',
  }));
}

/* ─────────────────────────────────
   RENDER SCORE DEL CV
───────────────────────────────── */
function renderScore() {
  const { total, nivel, tip, criterios } = CANDIDATO.scoreData;

  // Animar ring
  const ring = document.getElementById('scoreRingFill');
  if (ring) {
    const circumference = 2 * Math.PI * 50;
    ring.style.strokeDasharray = `${circumference}`;

    setTimeout(() => {
      if (total === null || total === undefined) {
        ring.style.strokeDashoffset = circumference;
        ring.style.opacity = '0';
      } else {
        const value = Math.max(0, Math.min(total, 100));
        ring.style.strokeDashoffset = circumference * (1 - value / 100);
        ring.style.opacity = '1';
      }
    }, 200);
  }

  // Nivel del score
  const nivelEl = document.getElementById('scoreLevel');

  if (nivelEl) {
    if (!nivel || nivel === 'none') {
      nivelEl.className = 'score-level';
      nivelEl.textContent = '';
    } else {
      const nivelMap = {
        bueno: { cls: 'score-level--bueno', icon: '✓', label: 'CV Competitivo' },
        regular: { cls: 'score-level--regular', icon: '⚠', label: 'Necesita mejoras' },
        bajo: { cls: 'score-level--bajo', icon: '✗', label: 'CV incompleto' },
      };
      const n = nivelMap[nivel] || nivelMap.regular;
      nivelEl.className = `score-level ${n.cls}`;
      nivelEl.innerHTML = `${n.icon} ${n.label}`;
    }
  }

  // Criterios
  const criteriosEl = document.getElementById('scoreCriteria');
  if (criteriosEl) {
    criteriosEl.innerHTML = criterios.map((c) => `
      <div class="sc-item">
        <div class="sc-icon sc-icon--${c.estado}">${c.icono}</div>
        <div class="sc-body">
          <div class="sc-top">
            <span class="sc-label">${c.label}</span>
            <span class="sc-pts sc-pts--${c.estado}">${c.puntos}</span>
          </div>
          <div class="sc-detail">${c.detalle}</div>
        </div>
      </div>`).join('');
  }

  // Tip de la IA
  const tipEl = document.getElementById('scoreTip');
  if (tipEl) {
    tipEl.innerHTML = `
      <div class="score-tip-icon">✦</div>
      <div><strong>Consejo de LaburAI:</strong> ${tip}</div>`;
  }
}

function updateProfileCompleteness(profile) {
  const fields = [profile.nombre, profile.apellido, profile.email, profile.ubicacion, profile.telefono];
  const filled = fields.filter((v) => v != null && String(v).trim() !== '').length;
  const percent = Math.round((filled / 5) * 100);

  const fillEl = document.querySelector('.cvs-fill');
  const pctEl = document.querySelector('.cvs-pct');

  if (fillEl) {
    fillEl.style.width = `${percent}%`;
    fillEl.style.background = percent === 100 ? 'var(--success)' : 'var(--grad)';
  }

  if (pctEl) {
    if (percent === 100) {
      pctEl.classList.add('cvs-pct--complete');
      pctEl.innerHTML = `100% <span class="cvs-check">✓</span>`;
    } else {
      pctEl.classList.remove('cvs-pct--complete');
      pctEl.textContent = `${percent}%`;
    }
  }

  const ctaLink = document.querySelector('.cvs-cta');
  if (ctaLink) {
    if (percent === 100) {
      ctaLink.textContent = 'Ir a perfil →';
      ctaLink.classList.add('cvs-cta--done');
    } else {
      ctaLink.textContent = 'Completar perfil →';
      ctaLink.classList.remove('cvs-cta--done');
    }
  }
}

/* ─────────────────────────────────
   RENDER HABILIDADES DETECTADAS
───────────────────────────────── */
function renderSkills() {
  const el = document.getElementById('skillsDetected');
  if (!el) return;
  el.innerHTML = CANDIDATO.habilidades
    .map((s) => `<span class="skill-detected ${s.type}">${s.name}</span>`)
    .join('');

  // Tags resumen IA
  const tagsEl = document.getElementById('aiSummaryTags');
  if (tagsEl) {
    const main = CANDIDATO.habilidades.filter((s) => s.type === 'main').slice(0, 5);
    tagsEl.innerHTML = main
      .map((s) => `<span class="skill-detected main">${s.name}</span>`)
      .join('');
  }
}

/* ─────────────────────────────────
   RENDER ANÁLISIS IA DETALLADO
───────────────────────────────── */
function renderIAAnalysis() {
  const techEl = document.getElementById('iaTechSkills');
  const softEl = document.getElementById('iaSoftSkills');
  const techsEl = document.getElementById('iaTechs');
  const missEl = document.getElementById('iaMissing');
  const expEl = document.getElementById('expTimeline');

  if (techEl) techEl.innerHTML = CANDIDATO.techSkills.map((s) => `<span class="ia-tag">${s}</span>`).join('');
  if (softEl) softEl.innerHTML = CANDIDATO.softSkills.map((s) => `<span class="ia-tag">${s}</span>`).join('');
  if (techsEl) techsEl.innerHTML = CANDIDATO.techs.map((s) => `<span class="ia-tag">${s}</span>`).join('');
  if (missEl) missEl.innerHTML = CANDIDATO.missing.map((s) => `<span class="ia-tag missing">${s}</span>`).join('');

  if (expEl) {
    expEl.innerHTML = CANDIDATO.experiencia.map((e) => `
      <div class="exp-item">
        <div class="exp-dot-wrap">
          <div class="exp-dot"></div>
          <div class="exp-line"></div>
        </div>
        <div class="exp-content">
          <div class="exp-role">${e.role}</div>
          <div class="exp-company">${e.company}</div>
          <div class="exp-period">${e.period}</div>
          <div class="exp-desc">${e.desc}</div>
        </div>
      </div>`).join('');
  }
}

/* ─────────────────────────────────
   RENDER POSTULACIONES
───────────────────────────────── */
const STATUS_LABELS = {
  pendiente: 'Pendiente',
  revisada: 'CV revisado',
  entrevista: 'Entrevista',
  rechazada: 'No seleccionado',
};

function renderPostulaciones(filter = 'todas') {
  const list = filter === 'todas'
    ? POSTULACIONES
    : POSTULACIONES.filter((p) => p.status === filter);

  const el = document.getElementById('postulacionesList');
  if (!el) return;

  if (!list.length) {
    el.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text3);font-size:14px">No hay postulaciones en esta categoría.</div>`;
    return;
  }

  el.innerHTML = list.map((p) => `
    <a class="postul-item" href="${UI_PAGES.oferta_detalle}?id=${p.id}">
      ${p.logoUrl
        ? `<div class="pi-logo company-logo--image"><img src="${p.logoUrl}" alt="Logo de ${p.company || p.empresa || 'empresa'}" loading="lazy"></div>`
        : `<div class="pi-logo" style="color:${p.logoColor}">${p.logo}</div>`}
      <div class="pi-info">
        <div class="pi-title">${p.title}</div>
        <div class="pi-company">${p.company}</div>
        <div class="pi-date">${p.fecha}</div>
      </div>
      <div class="pi-status pi-status--${p.status}">${STATUS_LABELS[p.status]}</div>
    </a>`).join('');
}

function initPostulacionesFiltros() {
  document.querySelectorAll('.pf-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pf-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderPostulaciones(btn.dataset.pf);
    });
  });
}

function parseOfertaIdFromLink(link) {
  try {
    const url = new URL(link, window.location.origin);
    return url.searchParams.get('id');
  } catch {
    return null;
  }
}

async function renderFavoritos() {
  const grid = document.getElementById('favGrid');
  if (!grid) return;

  const favoritos = Array.isArray(CANDIDATO.favoritos) ? CANDIDATO.favoritos.filter((link) => !!link) : [];
  if (!favoritos.length) {
    grid.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text3);">
        <div style="font-size: 16px; font-weight: 500;">No hay favoritos</div>
      </div>`;
    return;
  }

  const ids = favoritos.map(parseOfertaIdFromLink).filter(Boolean);
  let favoriteJobs = new Map();

  try {
    favoriteJobs = await loadFavoriteOffers(ids);
  } catch (err) {
    console.warn('[Dashboard] No se pudieron cargar ofertas favoritas:', err.message);
  }

  const cards = favoritos.map((link) => {
    const fallbackId = parseOfertaIdFromLink(link);
    const job = fallbackId ? favoriteJobs.get(String(fallbackId)) : null;
    if (job) return mapOfertaToFavoriteCard(job, fallbackId ? getPerfilLink(fallbackId) : link);

    return {
      id: fallbackId || '',
      title: 'Oferta favorita',
      company: 'Ver oferta guardada',
      location: '',
      logo: '★',
      logoColor: '#5C6BC0',
      tags: [],
      tagTypes: [],
      salary: '',
      time: '',
      desc: '',
      link: fallbackId ? getPerfilLink(fallbackId) : link,
    };
  });

  grid.innerHTML = cards.map((o) => {
    const tags = o.tags.map((t, i) => `<span class="job-tag ${escapeHtml(o.tagTypes[i] || '')}">${escapeHtml(t)}</span>`).join('');
    const link = o.link || getPerfilLink(o.id);
    // El favorito siempre está active en la sección de favoritos
    return `
      <div class="job-card">
        <button type="button" class="card-fav-btn active" data-id="${escapeHtml(o.id)}" title="Quitar de favoritos" aria-label="Quitar de favoritos">
          <svg class="icon icon-sm"><use href="../assets/icons.svg#icon-star"></use></svg>
        </button>
        <button type="button" class="card-share-btn" data-link="${escapeHtml(link)}" title="Compartir oferta" aria-label="Compartir oferta">
          <svg class="icon icon-sm"><use href="../assets/icons.svg#icon-share"></use></svg>
        </button>
        <a class="job-card-link" href="${escapeHtml(link)}">
          <div class="job-card-head">
            ${o.logoUrl
              ? `<div class="company-logo company-logo--image"><img src="${escapeHtml(o.logoUrl)}" alt="Logo de ${escapeHtml(o.company || o.empresa || 'empresa')}" loading="lazy"></div>`
              : `<div class="company-logo" style="color:${escapeHtml(o.logoColor)}">${escapeHtml(o.logo)}</div>`}
            <div class="job-meta">
              <div class="job-title">${escapeHtml(o.title)}</div>
              <div class="company-name">${escapeHtml(o.company)}${o.location ? ' · ' + escapeHtml(o.location) : ''}</div>
            </div>
          </div>
          <div class="job-tags">${tags}</div>
          <p class="job-desc">${escapeHtml(o.desc)}</p>
          <div class="job-footer">
            <div class="salary">${escapeHtml(o.salary)}</div>
            <div class="time-ago">${escapeHtml(o.time)}</div>
          </div>
        </a>
      </div>`;
  }).join('');

  // Inicializar listeners para botones
  initFavoritesOnFavoritosGrid();
  initSharePopoverOnFavoritosGrid();
}

function getPerfilLink(id) {
  return new URL(`${UI_PAGES.oferta_detalle}?id=${id}`, document.baseURI).href;
}

function getOfferFavoriteLink(id) {
  return new URL(`${UI_PAGES.oferta_detalle}?id=${id}`, document.baseURI).href;
}

function initFavoritesOnFavoritosGrid() {
  const grid = document.getElementById('favGrid');
  if (!grid) return;
  if (grid.dataset.favoriteActionsBound === 'true') return;
  grid.dataset.favoriteActionsBound = 'true';

  grid.addEventListener('click', async (event) => {
    const btn = event.target.closest('.card-fav-btn');
    if (!btn) return;
    event.preventDefault();
    event.stopPropagation();

    const session = getSession();
    if (!session?.token) {
      window.location.href = UI_PAGES.login;
      return;
    }

    const jobId = btn.dataset.id;
    if (!jobId) return;

    const card = btn.closest('.job-card');
    if (!card) return;

    // Remove favorites by matching the oferta ID parsed from the saved links
    const nextLinks = (CANDIDATO.favoritos || []).filter((link) => parseOfertaIdFromLink(link) !== String(jobId));

    btn.disabled = true;
    try {
      // Animar la desaparición de la tarjeta
      card.style.transition = 'all 0.3s ease';
      card.style.opacity = '0';
      card.style.transform = 'translateX(-20px)';

      // Esperar a que termine la animación
      await new Promise(resolve => setTimeout(resolve, 300));

      // Actualizar en servidor
      await API.patchPerfilCandidato(session.candidatoId, { favoritos: nextLinks });
      CANDIDATO.favoritos = nextLinks;
      showToast('Oferta eliminada de favoritos', 'info');

      // Remover la tarjeta del DOM
      card.remove();

      // Si no hay más favoritos, mostrar el estado vacío
      const grid = document.getElementById('favGrid');
      if (!grid || grid.children.length === 0) {
        await renderFavoritos();
      }
    } catch (err) {
      console.error('[Dashboard] Error actualizando favoritos:', err.message);
      showToast('No se pudo actualizar favoritos', 'error');
      // Revertir la animación en caso de error
      card.style.opacity = '1';
      card.style.transform = 'translateX(0)';
    } finally {
      btn.disabled = false;
    }
  });
}

function getSharePopoverDashboard() {
  let pop = document.getElementById('sharePopoverDashboard');
  if (!pop) {
    pop = document.createElement('div');
    pop.id = 'sharePopoverDashboard';
    pop.className = 'share-popover hidden';
    pop.innerHTML = `
      <div class="share-popover-header">Compartir oferta</div>
      <div class="share-popover-row">
        <input readonly class="share-input" id="sharePopoverInputDashboard" aria-label="Enlace de la oferta" />
        <button type="button" class="share-copy-btn">Copiar</button>
      </div>
    `;
    document.body.appendChild(pop);
  }
  return pop;
}

function closeSharePopoverDashboard() {
  const pop = document.getElementById('sharePopoverDashboard');
  if (pop) pop.classList.add('hidden');
}

function openSharePopoverDashboard(button, url) {
  const pop = getSharePopoverDashboard();
  const input = pop.querySelector('.share-input');
  if (!input) return;

  const absoluteUrl = new URL(url, document.baseURI).href;
  input.value = absoluteUrl;

  const rect = button.getBoundingClientRect();
  const left = Math.min(Math.max(rect.left + rect.width / 2 - 170, 16), window.innerWidth - 336);
  const top = rect.bottom + window.scrollY + 10;

  pop.style.left = `${left}px`;
  pop.style.top = `${top}px`;
  pop.classList.remove('hidden');
  pop.style.position = 'absolute';
}

function initSharePopoverOnFavoritosGrid() {
  const grid = document.getElementById('favGrid');
  const pop = getSharePopoverDashboard();
  if (!grid || !pop) return;
  if (grid.dataset.shareActionsBound === 'true') return;
  grid.dataset.shareActionsBound = 'true';

  grid.addEventListener('click', (event) => {
    const btn = event.target.closest('.card-share-btn');
    if (!btn) return;
    event.preventDefault();
    event.stopPropagation();
    openSharePopoverDashboard(btn, btn.dataset.link || window.location.href);
  });

  pop.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  document.addEventListener('click', closeSharePopoverDashboard);

  const copyBtn = pop.querySelector('.share-copy-btn');
  copyBtn?.addEventListener('click', async () => {
    const input = pop.querySelector('.share-input');
    if (!input) return;
    try {
      await navigator.clipboard.writeText(input.value);
      showToast('Link copiado al portapapeles', 'success');
    } catch (err) {
      console.error('Error copiando enlace:', err);
      showToast('No se pudo copiar el link', 'error');
    }
  });
}


/* ─────────────────────────────────
   NAVEGACIÓN ENTRE SECCIONES
───────────────────────────────── */
const SECTIONS = ['overview', 'cv', 'postulaciones', 'favoritos', 'perfil'];

function switchSection(id) {
  // Activar item del sidebar
  document.querySelectorAll('.snav-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.section === id);
  });

  // Mostrar sección correspondiente
  SECTIONS.forEach((s) => {
    const el = document.getElementById(s);
    if (!el) return;
    if (s === id) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });

  // Cerrar sidebar en mobile
  closeSidebar();

  // Scroll al top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initSidebarNav() {
  document.addEventListener('click', (e) => {
    const item = e.target.closest('.snav-item');
    if (!item) return;

    // Solo prevenir el default si tiene data-section
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
      // Si el link apunta a este mismo dashboard o es relativo (#seccion)
      if ((parts[0].includes('dashboard-candidato.html') || parts[0] === '') && section) {
        const sections = ['reporte', 'postulaciones', 'perfil'];
        if (sections.includes(section)) {
          e.preventDefault();
          switchSection(section);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  });
}

/* ─────────────────────────────────
   SIDEBAR MOBILE
───────────────────────────────── */
function openSidebar() {
  document.getElementById('dashSidebar')?.classList.add('open');
  document.getElementById('dashOverlay')?.classList.add('visible');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  document.getElementById('dashSidebar')?.classList.remove('open');
  document.getElementById('dashOverlay')?.classList.remove('visible');
  document.body.style.overflow = '';
}

function initDashSidebar() {
  document.getElementById('hamburger')?.addEventListener('click', () => {
    const sidebar = document.getElementById('dashSidebar');
    if (sidebar?.classList.contains('open')) { closeSidebar(); }
    else { openSidebar(); }
    document.getElementById('hamburger')?.classList.toggle('open');
  });
  document.getElementById('dashOverlay')?.addEventListener('click', () => {
    closeSidebar();
    document.getElementById('hamburger')?.classList.remove('open');
  });
}

/* ─────────────────────────────────
   BOTÓN RE-ANALIZAR (simulado)
───────────────────────────────── */
function initReanalyze() {
  const btn = document.getElementById('btnReanalyze');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const session = requireSession();
    if (!session || !session.candidatoId) return;

    btn.disabled = true;
    btn.textContent = 'Analizando…';
    
    try {
      await API.postReAnalyzeCV(session.candidatoId);
      // Recargar la vista con los datos nuevos
      await fetchProfile(session.candidatoId);
      showToast('✦ Análisis completado — CV Structurado', 'success');
    } catch (err) {
      showToast('Error re-analizando el CV', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Re-analizar';
    }
  });
}

/* ─────────────────────────────────
   COPIAR RESUMEN
───────────────────────────────── */
function initCopySummary() {
  document.getElementById('btnCopySummary')?.addEventListener('click', () => {
    const text = document.getElementById('aiSummaryText')?.textContent || '';
    navigator.clipboard.writeText(text).then(() => {
      showToast('Resumen copiado al portapapeles', 'success');
    });
  });
}

function initUploadCv() {
  const btnUpload = document.getElementById('btnUploadNew');
  const fileInput = document.getElementById('cvFileInput');
  if (!btnUpload || !fileInput) return;

  // Función para actualizar el estado del botón según si hay CV
  function updateUploadButton(hasCv) {
    if (hasCv) {
      btnUpload.style.opacity = '0.5';
      btnUpload.style.cursor = 'not-allowed';
      btnUpload.title = 'Ya tienes un CV subido. No puedes subir más de uno.';
    } else {
      btnUpload.style.opacity = '1';
      btnUpload.style.cursor = 'pointer';
      btnUpload.title = '';
    }
  }

  // Inicializar estado del botón (asumir que no hay CV hasta que se cargue el perfil)
  updateUploadButton(false);

  btnUpload.addEventListener('click', (e) => {
    const session = requireSession();
    if (!session?.candidatoId) return;

    // Verificar si ya tiene un CV subido
    if (CANDIDATO.cvUrl) {
      // Mostrar mensaje de error usando showToast
      showToast('No es posible subir más de 1 CV', 'error');
      e.preventDefault();
      return;
    }

    fileInput.click();
  });

  fileInput.addEventListener('change', async () => {
    const session = requireSession();
    if (!session?.candidatoId) return;

    const file = fileInput.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Solo se permiten archivos PDF', 'error');
      fileInput.value = '';
      return;
    }

    btnUpload.disabled = true;
    btnUpload.textContent = 'Subiendo…';

    try {
      await API.uploadCv(session.candidatoId, file);
      showToast('CV subido correctamente', 'success');
      await fetchProfile(session.candidatoId);
    } catch (err) {
      console.error('[Dashboard] Error subiendo CV:', err);
      showToast(err.message || 'Error al subir el CV', 'error');
    } finally {
      btnUpload.disabled = false;
      btnUpload.textContent = 'Subir mi CV';
      fileInput.value = '';
    }
  });

  // Exponer la función para actualizar el botón desde otras partes del código
  window.updateUploadButton = updateUploadButton;
}

function initCandidatoFotoUpload() {
  const input = document.getElementById('candFotoInput');
  const button = document.getElementById('btnCambiarFoto');
  if (!input || !button) return;

  button.addEventListener('click', () => input.click());

  input.addEventListener('change', async () => {
    const session = requireSession();
    if (!session?.candidatoId) return;

    const file = input.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Solo se aceptan imágenes JPG, PNG o WebP', 'error');
      input.value = '';
      return;
    }

    if (file.size > CANDIDATO_FOTO_MAX_BYTES) {
      showToast('La imagen no puede superar los 10 MB', 'error');
      input.value = '';
      return;
    }

    ImageCropper.open({
      file,
      title: 'Ajustar foto',
      saveLabel: 'Guardar foto',
      outputName: 'foto-candidato.png',
      outputSize: 512,
      onSave: async (croppedFile) => {
        const result = await API.uploadCandidatoFoto(session.candidatoId, croppedFile);
        CANDIDATO.fotoUrl = result.fotoUrl || '';
        session.fotoUrl = CANDIDATO.fotoUrl;
        sessionStorage.setItem('labuai_session', JSON.stringify(session));
        setCandidatoFoto(CANDIDATO.fotoUrl, CANDIDATO.nombre);
        showToast('Foto actualizada correctamente', 'success');
      },
      onError: (error) => {
        console.error('[Dashboard] Error subiendo foto:', error.message);
        showToast('No se pudo subir la foto', 'error');
      },
    });
    input.value = '';
  });
}

function initFavoritosButton() {
  const button = document.getElementById('btnFavoritos');
  if (!button) return;
}

/* ─────────────────────────────────
   GUARDAR PERFIL
───────────────────────────────── */
function initSaveProfile() {
  document.getElementById('btnSaveProfile')?.addEventListener('click', async () => {
    const btn = document.getElementById('btnSaveProfile');
    const session = JSON.parse(sessionStorage.getItem('labuai_session') || '{}');

    if (!session.candidatoId) {
      showToast('No se encontró tu perfil', 'error');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Guardando…';

    try {
      const telefonoVal = document.getElementById('profileTelefono')?.value?.trim();
      const linkedinVal = document.getElementById('profileLinkedin')?.value?.trim();
      const payload = {
        nombre: document.getElementById('profileNombre')?.value?.trim() || undefined,
        apellido: document.getElementById('profileApellido')?.value?.trim() || undefined,
        ubicacion: document.getElementById('profileUbicacion')?.value?.trim() || undefined,
        telefono: telefonoVal ? telefonoVal : null,
        linkedin: linkedinVal ? linkedinVal : null,
        areaRubro: document.getElementById('profileAreaRubro')?.value || undefined,
        modalidadBuscada: document.getElementById('profileModalidadBuscada')?.value || undefined,
        pretensionSalarial: document.getElementById('profilePretensionSalarial')?.value?.trim() || undefined,
      };

      await API.patchPerfilCandidato(session.candidatoId, payload);

      btn.disabled = false;
      btn.textContent = 'Guardar cambios';
      showToast('Perfil actualizado correctamente', 'success');

      // Actualizar el estado local y campos de la UI
      const profileNombre = document.getElementById('profileNombre');
      const profileApellido = document.getElementById('profileApellido');
      const profileUbicacion = document.getElementById('profileUbicacion');
      const profileTelefono = document.getElementById('profileTelefono');
      const profileLinkedin = document.getElementById('profileLinkedin');
      const profileEmail = document.getElementById('profileEmail');
      if (profileNombre) profileNombre.value = payload.nombre || '';
      if (profileApellido) profileApellido.value = payload.apellido || '';
      if (profileUbicacion) profileUbicacion.value = payload.ubicacion || '';
      if (profileTelefono) profileTelefono.value = payload.telefono || '';
      if (profileLinkedin) profileLinkedin.value = payload.linkedin || '';

      CANDIDATO.nombre = `${payload.nombre || ''} ${payload.apellido || ''}`.trim();
      const firstName = CANDIDATO.nombre.split(' ')[0] || 'Usuario';
      const candProfileName = document.getElementById('candProfileName');
      const spName = document.getElementById('spName');
      if (candProfileName) candProfileName.textContent = CANDIDATO.nombre || firstName;
      if (spName) spName.textContent = CANDIDATO.nombre || firstName;
      document.querySelectorAll('.avatar-name').forEach(el => el.textContent = CANDIDATO.nombre);
      setCandidatoFoto(CANDIDATO.fotoUrl, CANDIDATO.nombre || firstName);

      updateProfileCompleteness({
        nombre: payload.nombre,
        apellido: payload.apellido,
        email: profileEmail?.value,
        ubicacion: payload.ubicacion,
        telefono: payload.telefono,
      });
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Guardar cambios';
      console.error('[Dashboard] Error guardando perfil', err);
      showToast('Error al guardar', 'error');
    }
  });
}

/* ─────────────────────────────────
   MODAL PDF
───────────────────────────────── */
function initPdfModal() {
  const modal = document.getElementById('pdfModal');
  const frame = document.getElementById('pdfModalFrame');
  const close = document.getElementById('pdfModalClose');
  const btn   = document.getElementById('cvThumbnailBtn');

  if (!modal || !frame || !btn) return;

  const openModal = () => {
    // Solo permitimos abrir si hay un src definido
    if (frame.src) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  btn.addEventListener('click', openModal);
  close.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
}

/* ─────────────────────────────────
   TOAST
───────────────────────────────── */

/* ─────────────────────────────────
   INIT
───────────────────────────────── */
/* ─────────────────────────────────
   FETCH DATOS REALES
───────────────────────────────── */
async function fetchProfile(candidatoId) {
  try {
    const data = await API.getPerfilCandidato(candidatoId);

    CANDIDATO.nombre = `${data.nombre || ''} ${data.apellido || ''}`.trim();
    CANDIDATO.fotoUrl = data.fotoUrl || '';
    CANDIDATO.cvUrl  = data.cvUrl || '';
    CANDIDATO.score  = CANDIDATO.cvUrl && data.scoreCV !== null && data.scoreCV !== undefined ? data.scoreCV : null;
    CANDIDATO.resumen = data.resumenIA || 'Subí tu CV para que la IA genere un resumen de tu perfil profesional.';

    const firstName = CANDIDATO.nombre.split(' ')[0] || 'Usuario';

    // Sidebar
    const spName   = document.getElementById('spName');
    if (spName)   spName.textContent   = CANDIDATO.nombre || firstName;
    const candProfileName = document.getElementById('candProfileName');
    if (candProfileName) candProfileName.textContent = CANDIDATO.nombre || firstName;
    setCandidatoFoto(CANDIDATO.fotoUrl, CANDIDATO.nombre || firstName);

    // Todos los avatares y nombres dinámicos del dash
    document.querySelectorAll('.avatar-name').forEach(el   => el.textContent = CANDIDATO.nombre);

    // Saludo
    const greetTitle = document.getElementById('greetingTitle');
    const greetSub   = document.getElementById('greetingSub');
    if (greetTitle) greetTitle.textContent = `¡Hola, ${firstName}! 👋`;
    if (greetSub)   greetSub.innerHTML    = `Tu perfil está activo y visible para las empresas.`;

    // Score num
    const scoreNumEl = document.getElementById('scoreNum');
    if (scoreNumEl) scoreNumEl.textContent = data.scoreCV !== null && data.scoreCV !== undefined ? data.scoreCV : '—';

    // Resumen IA
    const aiSummary = document.getElementById('aiSummaryText');
    if (aiSummary) aiSummary.textContent = CANDIDATO.resumen;

    // CV info y Miniatura
    const cvFileName   = document.getElementById('cvFileName');
    const cvFileMeta   = document.getElementById('cvFileMeta');
    const thumbBtn     = document.getElementById('cvThumbnailBtn');
    const thumbFrame   = document.getElementById('cvThumbnail');
    const emptyIcon    = document.getElementById('cvEmptyIcon');
    const modalFrame   = document.getElementById('pdfModalFrame');
    const badgeText    = document.getElementById('cvBadgeText');
    const statusDot    = document.querySelector('.cvp-status-dot');
    const btnDownload  = document.getElementById('btnDownloadCV');

    if (data.cvUrl) {
      if (cvFileName) cvFileName.textContent = 'Tu Currículum Vitae';
      if (cvFileMeta) cvFileMeta.innerHTML = 'Documento principal visible para búsquedas y procesado por el motor de IA.';
      if (badgeText)  badgeText.textContent = 'Analizado y activo';
      if (statusDot)  statusDot.classList.add('active');
      if (btnDownload) {
        btnDownload.disabled = false;
        btnDownload.onclick = () => window.open(data.cvUrl, '_blank');
      }
      
      // Mostrar miniatura
      if (thumbBtn)   thumbBtn.classList.remove('hidden');
      if (emptyIcon)  emptyIcon.classList.add('hidden');
      
      // Cargar PDF en frames (agregando #toolbar=0 para una vista más limpia en la miniatura)
      if (thumbFrame) thumbFrame.src = data.cvUrl + '#toolbar=0&navpanes=0&scrollbar=0';
      if (modalFrame) modalFrame.src = data.cvUrl;

      // Actualizar botón de subida (deshabilitar si ya hay CV)
      if (window.updateUploadButton) window.updateUploadButton(true);
    } else {
      if (cvFileName) cvFileName.textContent = 'Sin CV subido';
      if (cvFileMeta) cvFileMeta.textContent = 'Subí tu currículum vitae en formato PDF para que nuestro motor de IA pueda estructurar tu perfil profesional.';
      if (badgeText)  badgeText.textContent = 'Pendiente';
      if (statusDot)  statusDot.classList.remove('active');
      if (btnDownload) btnDownload.disabled = true;
      
      if (thumbBtn)   thumbBtn.classList.add('hidden');
      if (emptyIcon)  emptyIcon.classList.remove('hidden');

      // Actualizar botón de subida (habilitar si no hay CV)
      if (window.updateUploadButton) window.updateUploadButton(false);
    }

    // Formulario de Mi perfil
    const profileNombre         = document.getElementById('profileNombre');
    const profileApellido       = document.getElementById('profileApellido');
    const profileEmail          = document.getElementById('profileEmail');
    const profileUbicacion      = document.getElementById('profileUbicacion');
    const profileTelefono       = document.getElementById('profileTelefono');
    const profileAreaRubro      = document.getElementById('profileAreaRubro');
    const profileModalidadBuscada = document.getElementById('profileModalidadBuscada');
    const profilePretensionSalarial = document.getElementById('profilePretensionSalarial');
    const profileLinkedin       = document.getElementById('profileLinkedin');
    if (profileNombre)           profileNombre.value           = data.nombre    || '';
    if (profileApellido)         profileApellido.value         = data.apellido  || '';
    if (profileEmail)            profileEmail.value            = data.usuario?.email || '';
    if (profileUbicacion)        profileUbicacion.value        = data.ubicacion || '';
    if (profileTelefono)         profileTelefono.value         = data.telefono  || '';
    if (profileAreaRubro)        profileAreaRubro.value        = data.areaRubro || '';
    if (profileModalidadBuscada) profileModalidadBuscada.value = data.modalidadBuscada || '';
    if (profilePretensionSalarial) profilePretensionSalarial.value = data.pretensionSalarial || '';
    if (profileLinkedin)         profileLinkedin.value         = data.linkedin  || '';

    updateProfileCompleteness({
      nombre:    data.nombre,
      apellido:  data.apellido,
      email:     data.usuario?.email,
      ubicacion: data.ubicacion,
      telefono:  data.telefono,
    });

    const hasExp = Array.isArray(data.experiencias) && data.experiencias.length > 0;
    const expDetail = hasExp 
      ? data.experiencias.map(e => `• ${e.rol} en ${e.empresa}`).join('<br>')
      : 'Subí tu CV para extraer tu experiencia';

    const hasFormacion = Array.isArray(data.formacion) && data.formacion.length > 0;
    const formacionDetail = hasFormacion
      ? data.formacion.map(f => `• ${f}`).join('<br>')
      : 'Subí tu CV para extraer tu formación académica';

    const hasScore = CANDIDATO.cvUrl && data.scoreCV !== null && data.scoreCV !== undefined;
    CANDIDATO.scoreData = {
      total:  hasScore ? data.scoreCV : null,
      nivel:  hasScore ? ((data.scoreCV >= 75) ? 'bueno' : (data.scoreCV >= 50 ? 'regular' : 'bajo')) : 'none',
      tip:    hasScore
                ? '¡Buen trabajo! Seguí mejorando tu perfil para aumentar tu visibilidad.'
                : 'Subí tu CV para obtener un análisis detallado.',
      criterios: [
        { icono: '💼', label: 'Experiencia laboral', estado: hasExp ? 'ok' : 'warn', puntos: hasExp ? data.experiencias.length : '-', detalle: expDetail },
        { icono: '🎓', label: 'Formación académica', estado: hasFormacion ? 'ok' : 'warn', puntos: hasFormacion ? data.formacion.length : '-', detalle: formacionDetail },
      ]
    };

    if (Array.isArray(data.habilidades) && data.habilidades.length) {
      CANDIDATO.habilidades = data.habilidades.map(s => ({ name: s.trim(), type: 'main' }));
    }

    CANDIDATO.missing = data.habilidadesFaltantes || [];

    if (Array.isArray(data.habilidadesTech)) {
      CANDIDATO.techSkills = data.habilidadesTech.filter(h => h.tipo === 'TECNICA').map(h => h.nombre);
      CANDIDATO.softSkills = data.habilidadesTech.filter(h => h.tipo === 'BLANDA').map(h => h.nombre);
      CANDIDATO.techs = data.habilidadesTech.filter(h => h.tipo === 'TECNOLOGIA').map(h => h.nombre);
    }

    CANDIDATO.favoritos = Array.isArray(data.favoritos) ? data.favoritos : [];

    if (Array.isArray(data.experiencias)) {
      CANDIDATO.experiencia = data.experiencias.map(e => ({
        role: e.rol,
        company: e.empresa,
        period: `${e.desde} – ${e.hasta}`,
        desc: e.descripcion || ''
      }));
    }

    renderScore();
    renderSkills();
    renderIAAnalysis();
    await renderFavoritos();

  } catch (err) {
    console.error('[Dashboard] Error cargando perfil:', err.message);
  }
}

/* ─────────────────────────────────
   INIT
───────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  // 0. Render sidebar first
  renderSidebarNav('candidato', 'overview');

  // 1. Sección inicial desde URL/hash
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash.substring(1);
  const initialSection = params.get('section') || hash || 'overview';
  initCopySummary();
  initPdfModal();
  
  if (SECTIONS.includes(initialSection)) switchSection(initialSection);

  // 2. Validar sesión
  const session = requireSession();
  if (!session) return;

  // 3. Cargar perfil primero, luego inicializar controles
  if (session.candidatoId) {
    // Cargar perfil primero (esperar a que termine)
    await fetchProfile(session.candidatoId);

    // Inicializar controles de subida después de cargar el perfil
    initUploadCv();
    initCandidatoFotoUpload();

    // Postulaciones
    try {
      const data = await API.getPostulaciones({ candidatoId: session.candidatoId });
      if (Array.isArray(data)) {
        POSTULACIONES = data.map(p => ({
          id: p.ofertaId,
          title: p.oferta?.titulo || 'Oferta',
          company: p.oferta?.empresa?.nombre || 'Empresa',
          logo: p.oferta?.empresa?.nombre?.charAt(0).toUpperCase() || '?',
          logoUrl: p.oferta?.empresa?.logoUrl || p.oferta?.logoUrl || p.oferta?.empresaLogoUrl || '',
          logoColor: '#5C6BC0',
          fecha: new Date(p.creadoEn).toLocaleDateString('es-AR'),
          status: p.estado.toLowerCase(),
          match: p.matchIA || null,
        }));
        POSTULACIONES = await hydratePostulacionLogos(POSTULACIONES);

        // Actualizar el contador del botón "Todas"
        const pfBtnTodas = document.getElementById('pfBtnTodas');
        if (pfBtnTodas) pfBtnTodas.textContent = `Todas (${POSTULACIONES.length})`;

        const badge = document.querySelector('.snav-item[data-section="postulaciones"] .snav-badge');
        if (badge) badge.textContent = POSTULACIONES.length;

        renderPostulaciones();
      }
    } catch (err) {
      console.error('[Dashboard] Error cargando postulaciones:', err.message);
    }

    // Stats candidato (en paralelo, no bloquean)
    API.getStatsCandidato(session.candidatoId)
      .then((stats) => {
        const statEls = document.querySelectorAll('.dstat-num');
        const vals = [stats.totalPostulaciones, stats.entrevistas ?? 0, stats.pendientes ?? 0, stats.rechazadas ?? 0];
        statEls.forEach((el, i) => { if (vals[i] !== undefined) el.textContent = vals[i]; });
      })
      .catch((err) => console.error('[Dashboard] Error cargando stats candidato:', err.message));
  }

  // 4. Interacciones
  initNavbar();
  initNavSession();
  initSidebarNav();
  initPostulacionesFiltros();
  initReanalyze();
  initCopySummary();
  initSaveProfile();
  initFavoritosButton();
});
function getOfferIdFromUrl(url) {
  if (!url) return '';
  try {
    return new URL(url, window.location.href).searchParams.get('id') || '';
  } catch {
    return '';
  }
}

function getTextSignature(value) {
  return String(value || '').trim().toLowerCase();
}

async function hydrateFavoriteLogos() {
  const session = getSession();
  if (!session?.token || !session?.candidatoId) return;

  const favoriteSection =
    document.getElementById('favGrid') ||
    document.getElementById('favoritesList') ||
    document.querySelector('[data-section="favoritos"]') ||
    Array.from(document.querySelectorAll('section, .dash-section, .tab-panel, main'))
      .find((el) => getTextSignature(el.textContent).includes('favoritos')) ||
    document.body;

  const pendingLogos = Array.from(favoriteSection.querySelectorAll('.pi-logo, .company-logo'))
    .filter((el) => !el.classList.contains('company-logo--image'));

  if (!pendingLogos.length) return;

  function applyLogo(logoEl, logo) {
    if (!logo?.logoUrl) return;
    logoEl.classList.add('company-logo--image');
    logoEl.style.color = '';
    logoEl.style.background = 'transparent';
    logoEl.style.border = 'none';
    logoEl.innerHTML = `<img src="${logo.logoUrl}" alt="${logo.alt || 'Logo de empresa'}" loading="lazy">`;
  }

  let favoritos = [];
  try {
    const profile = await API.getPerfilCandidato(session.candidatoId);
    favoritos = Array.isArray(profile.favoritos) ? profile.favoritos.map(String) : [];
  } catch (_) {
    favoritos = [];
  }

  const favoriteLogos = await Promise.all(
    favoritos.map(async (link) => {
      const id = getOfferIdFromUrl(link);
      if (!id) return null;
      try {
        const job = await API.getOferta(id);
        const company = job.empresa?.nombre || '';
        const logoUrl = job.empresa?.logoUrl || job.logoUrl || job.empresaLogoUrl || '';
        if (!logoUrl) return null;
        return {
          id,
          title: getTextSignature(job.titulo),
          company: getTextSignature(company),
          logoUrl,
          alt: `Logo de ${company || 'empresa'}`,
        };
      } catch (_) {
        return null;
      }
    })
  );

  const logos = favoriteLogos.filter(Boolean);

  pendingLogos.forEach((logoEl, index) => {
    const card = logoEl.closest('a, .job-card, .postulation-item, .profile-item, .content-card') || logoEl.parentElement;
    const cardText = getTextSignature(card?.textContent || '');
    const byText = logos.find((job) => cardText.includes(job.title) && cardText.includes(job.company));
    const match = byText || logos[index];
    if (!match) return;

    applyLogo(logoEl, match);
  });

  const stillPending = Array.from(favoriteSection.querySelectorAll('.pi-logo, .company-logo'))
    .filter((el) => !el.classList.contains('company-logo--image'));
  if (!stillPending.length) return;

  try {
    const allJobs = await API.getOfertas();
    const logoIndex = allJobs
      .map((job) => ({
        title: getTextSignature(job.titulo),
        company: getTextSignature(job.empresa?.nombre),
        logoUrl: job.empresa?.logoUrl || job.logoUrl || job.empresaLogoUrl || '',
        alt: `Logo de ${job.empresa?.nombre || 'empresa'}`,
      }))
      .filter((job) => job.logoUrl);

    stillPending.forEach((logoEl) => {
      const card = logoEl.closest('a, .job-card, .postulation-item, .profile-item, .content-card') || logoEl.parentElement;
      const cardText = getTextSignature(card?.textContent || '');
      const match = logoIndex.find((job) => cardText.includes(job.title) && cardText.includes(job.company));
      applyLogo(logoEl, match);
    });
  } catch (_) {
    // Si el listado no trae logos, se conserva la inicial como fallback visual.
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(hydrateFavoriteLogos, 800);
  const root = document.getElementById('favGrid') || document.getElementById('favoritesList');
  if (!root) return;
  const observer = new MutationObserver(() => hydrateFavoriteLogos());
  observer.observe(root, { childList: true, subtree: true });
});
