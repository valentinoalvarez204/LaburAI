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
  const dd = document.getElementById('avatarDropdown');
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
    error: { bg: '#FFEBEE', border: '#EF9A9A', color: '#C62828' },
    info: { bg: '#EEF0FB', border: '#C5CCF0', color: '#3949AB' },
  };
  const c = colors[type] || colors.info;

  const toast = document.createElement('div');
  toast.id = 'labuai-toast';
  toast.textContent = msg;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '28px',
    left: '50%',
    transform: 'translateX(-50%) translateY(10px)',
    background: c.bg,
    border: `1.5px solid ${c.border}`,
    color: c.color,
    padding: '12px 24px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    zIndex: '9999',
    opacity: '0',
    transition: 'all .3s ease',
    whiteSpace: 'nowrap',
  });

  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
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
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    if (progress === 1) {
      el.textContent = target.toLocaleString('es-AR') + suffix;
    } else {
      const ease = 1 - Math.pow(2, -10 * progress); // easeOutExpo
      el.textContent = Math.floor(ease * target).toLocaleString('es-AR') + suffix;
      requestAnimationFrame(tick);
    }
  }
  requestAnimationFrame(tick);
}

function animateCounterId(id, from, to, duration = 1800, suffix = '') {
  const el = document.getElementById(id);
  if (!el) return;
  const startTime = performance.now();

  function tick(now) {
    const p = Math.min((now - startTime) / duration, 1);
    if (p === 1) {
      el.textContent = to.toLocaleString('es-AR') + suffix;
    } else {
      const ease = 1 - Math.pow(2, -10 * p);
      el.textContent = Math.floor(from + ease * (to - from)).toLocaleString('es-AR') + suffix;
      requestAnimationFrame(tick);
    }
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
          <a href="ofertas.html">Ver ofertas</a>
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
        ? `<a href="ofertas.html">Ver ofertas</a>
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

    // 4. Actualizar CTAs de "Publicar oferta" en la página principal
    if (isEmpresa) {
      document.querySelectorAll('.pub-oferta-cta').forEach(btn => {
        btn.href = 'dashboard-empresa.html?section=publicar';
      });
    }
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

/* ─────────────────────────────────
   ESTADO DE POSTULACIÓN (Dropdown UI)
───────────────────────────────── */
function getStatusColor(estado) {
  switch (estado) {
    case 'PENDIENTE': return '#9e9e9e';
    case 'REVISADA': return '#2196f3';
    case 'ENTREVISTA': return '#7c4dff';
    case 'RECHAZADA': return '#f44336';
    default: return '#9e9e9e';
  }
}

function getStatusLabel(estado) {
  const labels = { PENDIENTE: 'Pendiente', REVISADA: 'Revisada', ENTREVISTA: 'Entrevista', RECHAZADA: 'Rechazada' };
  return labels[estado] || estado;
}

/* Abrir / cerrar dropdown de estado */
window.toggleStatusDropdown = function (id, e) {
  e.stopPropagation();
  // Cerrar todos los otros abiertos
  document.querySelectorAll('.status-dropdown-menu.open').forEach(m => {
    if (m.id !== `sdm-${id}`) m.classList.remove('open');
  });
  document.getElementById(`sdm-${id}`)?.classList.toggle('open');
};

// Cerrar al clickear fuera
document.addEventListener('click', () => {
  document.querySelectorAll('.status-dropdown-menu.open').forEach(m => m.classList.remove('open'));
});

/* ─────────────────────────────────
   SIDEBAR NAV CENTRALIZADO
   Evita duplicar HTML del aside nav en distintas páginas.
───────────────────────────────── */
const SIDEBAR_CONFIG = {
  empresa: [
    { id: 'overview', label: 'Resumen', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' },
    { id: 'ofertas', label: 'Mis ofertas', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>' },
    { id: 'candidatos', label: 'Candidatos', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
    { id: 'publicar', label: 'Publicar oferta', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>' },
    { id: 'empresa', label: 'Perfil de empresa', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' }
  ],
  candidato: [
    { id: 'overview', label: 'Resumen', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' },
    { id: 'cv', label: 'Mi CV e IA', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' },
    { id: 'postulaciones', label: 'Postulaciones', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>' },
    { id: 'recomendadas', label: 'Recomendadas', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
    { id: 'perfil', label: 'Mi perfil', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' }
  ]
};

window.renderSidebarNav = function (type, activeSection = 'overview') {
  const container = document.querySelector('.sidebar-nav');
  if (!container) return;

  const items = SIDEBAR_CONFIG[type];
  if (!items) return;

  // Si estamos en un "Dashboard SPA" usamos data-section, 
  // si estamos en otra pagina (ej candidato-postulacion) usamos href para navegar al dashboard
  const isDashboardSPA = window.location.pathname.includes(`dashboard-${type}.html`);

  const html = items.map(item => {
    const isActive = item.id === activeSection ? 'active' : '';

    // Configuración condicional de href vs data-section
    const linkAttr = isDashboardSPA
      ? `data-section="${item.id}" href="#" onclick="event.preventDefault()"`
      : `href="dashboard-${type}.html#${item.id}"`;

    return `
      <a class="snav-item ${isActive}" ${linkAttr}>
        ${item.icon}
        ${item.label}
      </a>
    `;
  }).join('');

  container.innerHTML = html;
};

/* ─────────────────────────────────
   GLOBAL FOOTER
───────────────────────────────── */
function renderFooter() {
  const path = window.location.pathname;
  
  // Excluir dashboards y páginas de login completamente (buenas prácticas)
  const isExcluded = path.includes('login') || path.includes('auth') || path.includes('dashboard') || path.includes('postulacion');
  if (isExcluded) return;

  // Footer global normal para páginas principales
  const footerHTML = `
  <footer>
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="index.html" class="logo" style="margin-bottom:14px;display:inline-flex"><span class="logo-star">✦</span>LaburAI</a>
        <p>La plataforma de empleo impulsada por IA. Conectamos talento con las mejores oportunidades de Argentina en todos los rubros.</p>
      </div>
      <div class="footer-col">
        <h4>Candidatos</h4>
        <a href="ofertas.html">Buscar empleo</a>
        <a href="login.html">Subir CV</a>
        <a href="login.html">Análisis de perfil</a>
        <a href="login.html">Historial de postulaciones</a>
        <a href="login.html">Perfil público</a>
      </div>
      <div class="footer-col">
        <h4>Empresas</h4>
        <a href="login.html" class="pub-oferta-cta">Publicar oferta</a>
        <a href="login.html">Buscar candidatos</a>
        <a href="login.html">Dashboard</a>
      </div>
      <div class="footer-col">
        <h4>LaburAI</h4>
        <a href="#">Acerca de</a>
        <a href="#">Blog</a>
        <a href="#">Privacidad</a>
        <a href="#">Términos de uso</a>
        <a href="#">Contacto</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 LaburAI. Todos los derechos reservados.</p>
      <p style="color:#667EEA;font-weight:600;font-size:13px">Análisis de CV potenciado por IA ✦</p>
    </div>
  </footer>
  `;

  document.body.insertAdjacentHTML('beforeend', footerHTML);
}

// Inyectar automáticamente el footer global si corresponde
document.addEventListener('DOMContentLoaded', () => {
  renderFooter();
});
