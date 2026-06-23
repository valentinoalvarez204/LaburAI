/* ══════════════════════════════════════════
   LaburAI — utils.js
   Funciones compartidas entre TODAS las páginas.
   Debe cargarse ANTES que cualquier otro .js:
     <script src="js/utils.js"></script>
     <script src="js/main.js"></script>
══════════════════════════════════════════ */

// ── CONFIGURACIÓN DE RUTAS (Organización de carpetas) ──
const IS_PAGES_DIR = window.location.pathname.includes('/pages/');
const PATH_TO_ROOT = IS_PAGES_DIR ? '../' : './';
const PATH_TO_PAGES = IS_PAGES_DIR ? '' : 'pages/';

const UI_PAGES = {
  index: PATH_TO_ROOT + 'index.html',
  ofertas: PATH_TO_PAGES + 'ofertas.html',
  empresas: PATH_TO_PAGES + 'empresas.html',
  login: PATH_TO_PAGES + 'login.html',
  dashboard_candidato: PATH_TO_PAGES + 'dashboard-candidato.html',
  dashboard_empresa: PATH_TO_PAGES + 'dashboard-empresa.html',
  oferta_detalle: PATH_TO_PAGES + 'oferta-detalle.html',
  postulacion: PATH_TO_PAGES + 'candidato-postulacion.html'
};

/**
 *getIcon — Estrategia modular para iconos Reutilizables
 * @param {string} name - ID del icono en icons.svg (ej: 'search')
 * @param {string} className - Clases CSS adicionales (ej: 'icon-sm')
 */
function getIcon(name, className = '') {
  const spritePath = `${PATH_TO_ROOT}assets/icons.svg#icon-${name}`;
  return `<svg class="icon ${className}"><use href="${spritePath}"></use></svg>`;
}

/* ─────────────────────────────────
   NAVBAR — Componente reutilizable
───────────────────────────────── */
function renderNavbar() {
  const navContainer = document.getElementById('navbar');
  if (!navContainer) return;

  const session = getSession();
  
  // 1. Definir Links Principales
  let linksHtml = '';
  if (session) {
    const isEmpresa = session.rol === 'empresa';
    linksHtml = isEmpresa
      ? `<a href="${UI_PAGES.ofertas}">Ver ofertas</a>
         <a href="${UI_PAGES.dashboard_empresa}#ofertas">Mis ofertas</a>
         <a href="${UI_PAGES.dashboard_empresa}">Panel empresa</a>`
      : `<a href="${UI_PAGES.ofertas}">Buscar empleo</a>
         <a href="${UI_PAGES.dashboard_candidato}#postulaciones">Postulaciones</a>`;
  } else {
    linksHtml = `
      <a href="${UI_PAGES.ofertas}">Buscar empleo</a>
      <a href="${UI_PAGES.empresas || '#'}">Para empresas</a>
    `;
  }

  // 2. Definir Acciones (Desktop)
  let actionsHtml = '';
  if (session) {
    const isEmpresa = session.rol === 'empresa';
    const dashboard = isEmpresa ? UI_PAGES.dashboard_empresa : UI_PAGES.dashboard_candidato;
    const firstName = session.nombre.split(' ')[0];
    const profileSection = isEmpresa ? 'empresa' : 'perfil';
    
    actionsHtml = `
      <div class="topbar-notif-wrapper" style="position:relative">
        <button class="topbar-notif" id="btnNotif" aria-label="Notificaciones" style="margin-right:4px">
          ${getIcon('bell', 'icon-xs')}
          <span class="notif-dot" id="notifDot" style="display:none"></span>
        </button>
        <div class="notif-dropdown" id="notifDropdown">
          <div class="notif-header">
            <h4>Notificaciones</h4>
            <button class="notif-mark-all" id="btnNotifClearAll">Limpiar todo</button>
          </div>
          <div class="notif-list" id="notifList">
            <div class="notif-empty">Cargando...</div>
          </div>
          <div class="notif-footer">
            <a href="${dashboard}?section=postulaciones">Ver todas mis postulaciones</a>
          </div>
        </div>
      </div>
      <div class="nav-user-btn" id="avatarMenu" style="cursor:pointer">
        <div class="nav-avatar">${firstName.charAt(0).toUpperCase()}</div>
        <span class="nav-user-name">${firstName}</span>
        ${getIcon('chevron-down', 'icon-xs')}
        <div class="avatar-dropdown" id="avatarDropdown">
          <a href="${dashboard}?section=${profileSection}">Mi perfil</a>
          <a href="#" class="dropdown-logout" onclick="cerrarSesion(); return false;">Cerrar sesión</a>
        </div>
      </div>
      <a href="${dashboard}" class="btn-primary">Dashboard</a>
    `;
  } else {
    actionsHtml = `
      <a href="${UI_PAGES.login}" class="btn-ghost">Ingresar</a>
      <a href="${UI_PAGES.login}" class="btn-primary">Publicar oferta</a>
    `;
  }

  // 3. Estructura Completa
  navContainer.innerHTML = `
    <div class="nav-inner">
      <a href="${UI_PAGES.index}" class="logo"><span class="logo-star">✦</span>LaburAI</a>
      
      <nav class="nav-links" id="navLinks">
        ${linksHtml}
      </nav>

      <div class="nav-actions" id="navActions">
        ${actionsHtml}
      </div>

      <button class="hamburger" id="hamburger" aria-label="Menú">
        <span></span><span></span><span></span>
      </button>
    </div>

    <div class="mobile-menu" id="mobileMenu">
      <div class="mobile-links">${linksHtml}</div>
      <hr/>
      <div id="mobileNavActions">
        ${session ? `
          <button onclick="cerrarSesion()" class="btn-ghost" style="width:100%">Cerrar sesión</button>
        ` : `
          <a href="${UI_PAGES.login}" class="btn-ghost" style="display:block;text-align:center">Ingresar</a>
          <a href="${UI_PAGES.login}" class="btn-primary" style="display:block;text-align:center;margin-top:8px">Publicar oferta</a>
        `}
      </div>
    </div>
  `;

  // 4. Activar links actuales
  const currentPath = window.location.pathname;
  navContainer.querySelectorAll('nav a, .mobile-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && currentPath.includes(href) && href !== '../index.html' && href !== './index.html') {
      a.classList.add('active');
    }
  });

  // 5. Setup final
  setupNavbarEvents();
  if (session) {
    initAvatarDropdown();
    initNotifications();
  }
}

function initNavbar() {
  renderNavbar();
  
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }
}

function setupNavbarEvents() {
  const btn = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const dashSidebar = document.getElementById('dashSidebar');
  const dashOverlay = document.getElementById('dashOverlay');

  if (btn) {
    btn.addEventListener('click', () => {
      if (dashSidebar) {
        const open = dashSidebar.classList.toggle('open');
        btn.classList.toggle('open', open);
        dashOverlay?.classList.toggle('visible', open);
        document.body.style.overflow = open ? 'hidden' : '';
      } else if (mobileMenu) {
        const open = mobileMenu.classList.toggle('open');
        btn.classList.toggle('open', open);
      }
    });

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
    const raw = sessionStorage.getItem('labuai_session');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/* ─────────────────────────────────
   NAVBAR — adaptar según sesión
───────────────────────────────── */
function initNavSession() {
  // Ahora integrado en renderNavbar() para mayor consistencia
  // Solo mantenemos la lógica de actualización de CTAs externos
  const session = getSession();
  if (session && session.rol === 'empresa') {
    document.querySelectorAll('.pub-oferta-cta').forEach(btn => {
      btn.href = `${UI_PAGES.dashboard_empresa}?section=publicar`;
    });
  }
}

/* ─────────────────────────────────
   CERRAR SESIÓN
───────────────────────────────── */
function cerrarSesion() {
  sessionStorage.removeItem('labuai_session');
  window.location.href = UI_PAGES.index;
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
    const raw = sessionStorage.getItem('labuai_session');
    const session = raw ? JSON.parse(raw) : null;
    if (!session?.token) {
      window.location.href = UI_PAGES.login;
      return null;
    }
    return session;
  } catch {
    window.location.href = UI_PAGES.login;
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
  const menu = document.getElementById(`sdm-${id}`);
  const container = document.getElementById(`sd-${id}`);

  // Cerrar todos los otros abiertos
  document.querySelectorAll('.status-dropdown-menu.open').forEach(m => {
    if (m.id !== `sdm-${id}`) m.classList.remove('open');
  });
  document.querySelectorAll('.status-dropdown.open').forEach(c => {
    if (c.id !== `sd-${id}`) c.classList.remove('open');
  });

  menu?.classList.toggle('open');
  container?.classList.toggle('open');
};

// Cerrar al clickear fuera
document.addEventListener('click', () => {
  document.querySelectorAll('.status-dropdown-menu.open').forEach(m => m.classList.remove('open'));
  document.querySelectorAll('.status-dropdown.open').forEach(c => c.classList.remove('open'));
});

/* ─────────────────────────────────
   SIDEBAR NAV CENTRALIZADO
   Evita duplicar HTML del aside nav en distintas páginas.
───────────────────────────────── */
const SIDEBAR_CONFIG = {
  empresa: [
    { id: 'overview', label: 'Resumen', icon: getIcon('layout', 'icon-sm') },
    { id: 'ofertas', label: 'Mis ofertas', icon: getIcon('briefcase', 'icon-sm') },
    { id: 'candidatos', label: 'Candidatos', icon: getIcon('users', 'icon-sm') },
    { id: 'publicar', label: 'Publicar oferta', icon: getIcon('plus-circle', 'icon-sm') },
    { id: 'empresa', label: 'Perfil de empresa', icon: getIcon('building', 'icon-sm') }
  ],
  candidato: [
    { id: 'overview', label: 'Resumen', icon: getIcon('layout', 'icon-sm') },
    { id: 'cv', label: 'Mi CV e IA', icon: getIcon('file-text', 'icon-sm') },
    { id: 'postulaciones', label: 'Postulaciones', icon: getIcon('send', 'icon-sm') },
    { id: 'recomendadas', label: 'Recomendadas', icon: getIcon('star', 'icon-sm') },
    { id: 'perfil', label: 'Mi perfil', icon: getIcon('user', 'icon-sm') }
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
      : `href="${UI_PAGES[`dashboard_${type}`]}#${item.id}"`;

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
        <a href="${UI_PAGES.index}" class="logo" style="margin-bottom:14px;display:inline-flex"><span class="logo-star">✦</span>LaburAI</a>
        <p>La plataforma de empleo impulsada por IA. Conectamos talento con las mejores oportunidades de Argentina en todos los rubros.</p>
      </div>
      <div class="footer-col">
        <h4>Candidatos</h4>
        <a href="${UI_PAGES.ofertas}">Buscar empleo</a>
        <a href="${UI_PAGES.login}">Subir CV</a>
        <a href="${UI_PAGES.login}">Análisis de perfil</a>
        <a href="${UI_PAGES.login}">Historial de postulaciones</a>
        <a href="${UI_PAGES.login}">Perfil público</a>
      </div>
      <div class="footer-col">
        <h4>Empresas</h4>
        <a href="${UI_PAGES.login}" class="pub-oferta-cta">Publicar oferta</a>
        <a href="${UI_PAGES.login}">Buscar candidatos</a>
        <a href="${UI_PAGES.login}">Dashboard</a>
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

/* ─────────────────────────────────
   NOTIFICACIONES (NAVBAR)
───────────────────────────────── */
function initNotifications() {
  const btn = document.getElementById('btnNotif');
  const dropdown = document.getElementById('notifDropdown');
  const btnClearAll = document.getElementById('btnNotifClearAll');

  if (!btn || !dropdown) return;

  // Toggle dropdown
  btn.addEventListener('click', async (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle('active');
    if (isOpen) {
      await loadNotificationsList();
    }
  });

  // Cerrar al click afuera
  const handleOutsideClick = (e) => {
    if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  };
  document.addEventListener('click', handleOutsideClick);

  // Limpiar todo
  if (btnClearAll) {
    btnClearAll.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        // En lugar de solo marcar como leídas, las borramos por completo como pidió el usuario
        await API.deleteNotificationsAll();
        await loadNotificationsList();
        updateNotificationsBadge();
      } catch (err) {
        console.error('Error al borrar todas las notificaciones:', err);
      }
    });
  }

  // Carga inicial de count
  updateNotificationsBadge();
  
  // Polling para "Real-time"
  initNotificationPolling();
}

let lastUnreadCount = -1;

function initNotificationPolling() {
  // Solo candidatos por ahora para evitar carga innecesaria
  const session = getSession();
  if (!session || session.rol !== 'candidato') return;

  setInterval(async () => {
    try {
      const { count } = await API.getNotificationsUnreadCount();
      
      // Si el contador aumentó, cargamos la lista y mostramos el toast más reciente
      if (lastUnreadCount !== -1 && count > lastUnreadCount) {
        await handleNewNotificationReceived();
      }
      
      lastUnreadCount = count;
      updateNotificationsBadge();
    } catch (err) {
      // Silencioso para no ensuciar consola en polling
    }
  }, 10000); // Cada 10 segundos
}

async function handleNewNotificationReceived() {
  try {
    const list = await API.getNotifications();
    if (!list || list.length === 0) return;
    
    // La más reciente es la primera por el orderBy (desc)
    const latest = list[0];
    if (!latest.leida) {
      showRealTimeNotification(latest);
    }
  } catch (err) {
    console.error('Error al manejar nueva notificación:', err);
  }
}

function showRealTimeNotification(notif) {
  let portal = document.getElementById('notifPortal');
  if (!portal) {
    portal = document.createElement('div');
    portal.id = 'notifPortal';
    document.body.appendChild(portal);
  }

  const toast = document.createElement('div');
  toast.className = `rt-notif rt-notif--${notif.tipo || 'info'}`;
  
  // Icono según tipo
  const iconName = notif.tipo === 'alert' ? 'alert-triangle' : 
                   notif.tipo === 'success' ? 'check-circle' : 'bell';

  toast.innerHTML = `
    <div class="icon-box">${getIcon(iconName, 'icon-sm')}</div>
    <div class="content">
      <div class="title">${notif.titulo}</div>
      <div class="msg">${notif.mensaje}</div>
    </div>
  `;

  toast.onclick = () => {
    handleNotifClick(notif.id, notif.link);
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 400);
  };

  portal.appendChild(toast);

  // Auto-remove después de 5 segundos
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 400);
    }
  }, 5000);
}

async function updateNotificationsBadge() {
  const dot = document.getElementById('notifDot');
  if (!dot) return;

  try {
    const { count } = await API.getNotificationsUnreadCount();
    if (count > 0) {
      dot.style.display = 'flex';
      dot.textContent = count > 9 ? '9+' : count;
    } else {
      dot.style.display = 'none';
    }
  } catch (err) {
    console.error('Error actualizando badge:', err);
  }
}

async function loadNotificationsList() {
  const list = document.getElementById('notifList');
  if (!list) return;

  try {
    const res = await API.getNotifications();
    
    if (!res || res.length === 0) {
      list.innerHTML = '<div class="notif-empty">No tenés notificaciones nuevas</div>';
      return;
    }

    list.innerHTML = res.map(n => `
      <div class="notif-item ${n.leida ? 'read' : 'unread'}" onclick="handleNotifClick('${n.id}', '${n.link || ''}')">
        <div class="notif-i-status"></div>
        <div class="notif-i-content">
          <div class="notif-i-title">${n.titulo}</div>
          <div class="notif-i-msg">${n.mensaje}</div>
          <div class="notif-i-date">${formatRelativeTime(n.creadoEn)}</div>
        </div>
      </div>
    `).join('');

  } catch (err) {
    list.innerHTML = '<div class="notif-empty">Error al cargar las notificaciones</div>';
  }
}

async function handleNotifClick(id, link) {
  try {
    await API.patchNotificationRead(id);
    if (link) {
      window.location.href = link;
    } else {
      await loadNotificationsList();
      updateNotificationsBadge();
    }
  } catch (err) {
    console.error('Error al clickear notificación:', err);
  }
}

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'Ahora';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
  return date.toLocaleDateString();
}
