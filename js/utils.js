/* ══════════════════════════════════════════
   LaburAI — utils.js
   Funciones compartidas entre TODAS las páginas.
   Debe cargarse ANTES que cualquier otro .js:
     <script src="js/utils.js"></script>
     <script src="js/main.js"></script>
══════════════════════════════════════════ */

/* ─────────────────────────────────
   NAVBAR — efecto scroll
   Agrega clase .scrolled al hacer scroll
───────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // 1. Efecto Scroll
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // 2. Hamburger (Menú Mobile / Sidebar Dashboard)
  const btn = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const dashSidebar = document.getElementById('dashSidebar');
  const dashOverlay = document.getElementById('dashOverlay');

  if (btn) {
    btn.addEventListener('click', () => {
      if (dashSidebar) {
        // En Dashboard: Abre/Cierra Sidebar
        const open = dashSidebar.classList.toggle('open');
        btn.classList.toggle('open', open);
        dashOverlay?.classList.toggle('visible', open);
        document.body.style.overflow = open ? 'hidden' : '';
      } else if (mobileMenu) {
        // En Páginas Públicas: Abre/Cierra Menú Mobile
        const open = mobileMenu.classList.toggle('open');
        btn.classList.toggle('open', open);
      }
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!btn.contains(e.target)) {
        if (mobileMenu && !mobileMenu.contains(e.target)) {
          mobileMenu.classList.remove('open');
          btn.classList.remove('open');
        }
        if (dashSidebar && !dashSidebar.contains(e.target)) {
          dashSidebar.classList.remove('open');
          dashOverlay?.classList.remove('visible');
          btn.classList.remove('open');
          document.body.style.overflow = '';
        }
      }
    });
  }
}

/* ─────────────────────────────────
   SCROLL REVEAL
   Anima elementos con clase .reveal
   y .reveal-card al entrar en viewport
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
    if (el.classList.contains('reveal-card')) {
      el.style.transitionDelay = (i * 0.08) + 's';
    }
    observer.observe(el);
  });
}

/* ─────────────────────────────────
   AVATAR DROPDOWN
   Para el topbar de los dashboards
───────────────────────────────── */
function initAvatarDropdown() {
  const menu = document.getElementById('avatarMenu');
  const dd   = document.getElementById('avatarDropdown');
  if (!menu || !dd) return;

  menu.addEventListener('click', (e) => {
    e.stopPropagation();
    dd.classList.toggle('open');
  });
  document.addEventListener('click', () => dd.classList.remove('open'));
}

/* ─────────────────────────────────
   TOAST DE NOTIFICACIÓN
   Uso: showToast('Mensaje', 'success' | 'error' | 'info')
───────────────────────────────── */
function showToast(msg, type = 'info') {
  const existing = document.getElementById('labuai-toast');
  if (existing) existing.remove();

  const colors = {
    success: { bg: '#E8F5E9', border: '#A5D6A7', color: '#2E7D32' },
    error:   { bg: '#FFEBEE', border: '#EF9A9A', color: '#C62828' },
    info:    { bg: '#EEF0FB', border: '#C5CCF0', color: '#3949AB' },
  };
  const c = colors[type] || colors.info;

  const toast = document.createElement('div');
  toast.id = 'labuai-toast';
  toast.textContent = msg;
  Object.assign(toast.style, {
    position:    'fixed',
    bottom:      '28px',
    left:        '50%',
    transform:   'translateX(-50%) translateY(10px)',
    background:  c.bg,
    border:      `1.5px solid ${c.border}`,
    color:       c.color,
    padding:     '12px 24px',
    borderRadius:'12px',
    fontSize:    '14px',
    fontWeight:  '600',
    fontFamily:  "'DM Sans', sans-serif",
    boxShadow:   '0 8px 24px rgba(0,0,0,0.1)',
    zIndex:      '9999',
    opacity:     '0',
    transition:  'all .3s ease',
    whiteSpace:  'nowrap',
  });

  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity   = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ─────────────────────────────────
   ANIMACIÓN DE CONTADOR
   Anima un número desde `from` hasta `to`
   Uso: animateCounter(elemento, 0, 1200, 1800)
        animateCounterId('miId', 0, 94, 1800, '%')
───────────────────────────────── */
function animateCounter(el, target, duration = 1800, suffix = '') {
  if (!el) return;
  const startTime = performance.now();

  function tick(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease     = 1 - Math.pow(2, -10 * progress); // easeOutExpo
    el.textContent = Math.floor(ease * target).toLocaleString('es-AR') + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function animateCounterId(id, from, to, duration = 1800, suffix = '') {
  const el = document.getElementById(id);
  if (!el) return;
  const startTime = performance.now();

  function tick(now) {
    const p    = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(2, -10 * p);
    el.textContent = Math.floor(from + ease * (to - from)).toLocaleString('es-AR') + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ─────────────────────────────────
   DELAY
   Promesa que espera N milisegundos
   Uso: await delay(1500)
───────────────────────────────── */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ─────────────────────────────────
   PARAMS DE URL
   Leer parámetros de la URL fácilmente
   Uso: getParam('id') → '3'
───────────────────────────────── */
function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}


/* ─────────────────────────────────
   SESIÓN — lectura global
───────────────────────────────── */
function getSession() {
  try {
    const raw = localStorage.getItem('labuai_session');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/* ─────────────────────────────────
   NAVBAR — adaptar según sesión
───────────────────────────────── */
function initNavSession() {
  const session = getSession();
  const actions = document.getElementById('navActions');
  const navLinks = document.querySelector('.nav-links');
  const mobileMenu = document.getElementById('mobileMenu');

  if (!actions) return;

  if (session) {
    const isEmpresa = session.rol === 'empresa';
    const dashboard = isEmpresa ? 'dashboard-empresa.html' : 'dashboard-candidato.html';
    const firstName = session.nombre.split(' ')[0];
    const profileSection = isEmpresa ? 'empresa' : 'perfil';

    // Campana de notificaciones
    const notifHtml = `
      <button class="topbar-notif" id="btnNotif" aria-label="Notificaciones" style="margin-right:4px">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <span class="notif-dot"></span>
      </button>`;

    // 1. Links del Navbar (Desktop)
    if (navLinks) {
      if (isEmpresa) {
        navLinks.innerHTML = `
          <a href="dashboard-empresa.html#publicar">Publicar oferta</a>
          <a href="dashboard-empresa.html#ofertas">Mis ofertas</a>
          <a href="dashboard-empresa.html">Herramientas para empresas</a>`;
      } else {
        navLinks.innerHTML = `
          <a href="ofertas.html">Buscar empleo</a>
          <a href="dashboard-candidato.html#postulaciones">Mis postulaciones</a>`;
      }
    }

    // 2. Menú Lateral (Mobile)
    if (mobileMenu) {
      const linksHtml = isEmpresa 
        ? `<a href="dashboard-empresa.html#publicar">Publicar oferta</a>
           <a href="dashboard-empresa.html#ofertas">Mis ofertas</a>
           <a href="dashboard-empresa.html">Herramientas para empresas</a>`
        : `<a href="ofertas.html">Buscar empleo</a>
           <a href="dashboard-candidato.html#postulaciones">Mis postulaciones</a>`;

      
      mobileMenu.innerHTML = `
        ${linksHtml}
        <hr/>
        <div id="mobileNavActions">
          <div style="display:flex; justify-content:center; margin-bottom:12px">${notifHtml}</div>
          <a href="${dashboard}" class="btn-primary" style="text-align:center;display:block">
            Mi dashboard — ${firstName}
          </a>
          <button onclick="cerrarSesion()" class="btn-ghost" 
            style="text-align:center;display:block;width:100%;margin-top:8px">
            Cerrar sesión
          </button>
        </div>`;
    }

    // 3. Acciones (Botones derecha Desktop)
    actions.innerHTML = `
      ${notifHtml}
      <div class="nav-user-btn" id="avatarMenu" style="cursor:pointer">
        <div class="nav-avatar">${firstName.charAt(0).toUpperCase()}</div>
        <span class="nav-user-name">${firstName}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
        <div class="avatar-dropdown" id="avatarDropdown">
          <a href="${dashboard}?section=${profileSection}">Mi perfil</a>
          <a href="#" class="dropdown-logout" onclick="cerrarSesion(); return false;">Cerrar sesión</a>
        </div>
      </div>
      <a href="${dashboard}" class="btn-primary">Mi dashboard</a>`;

    initAvatarDropdown();
  }
}

/* ─────────────────────────────────
   CERRAR SESIÓN
───────────────────────────────── */
function cerrarSesion() {
  localStorage.removeItem('labuai_session');
  window.location.href = 'index.html';
}

/* ─────────────────────────────────
   REQUIRE SESSION
   Llamar al inicio de páginas privadas.
   Si no hay sesión → redirige a login.
   Uso: const session = requireSession();
        if (!session) return;
───────────────────────────────── */
function requireSession() {
  try {
    const raw = localStorage.getItem('labuai_session');
    const session = raw ? JSON.parse(raw) : null;
    if (!session?.token) {
      window.location.href = 'login.html';
      return null;
    }
    return session;
  } catch {
    window.location.href = 'login.html';
    return null;
  }
}
