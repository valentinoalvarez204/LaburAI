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
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

/* ─────────────────────────────────
   HAMBURGER — menú mobile
───────────────────────────────── */
function initHamburger() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('open');
      btn.classList.remove('open');
    }
  });
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
   SIDEBAR DASHBOARD MOBILE
   Abre/cierra el sidebar en mobile
   (compartido entre dashboard candidato y empresa)
───────────────────────────────── */
function initDashSidebar() {
  const hamburger = document.getElementById('hamburger');
  const sidebar   = document.getElementById('dashSidebar');
  const overlay   = document.getElementById('dashOverlay');
  if (!hamburger || !sidebar) return;

  function openSidebar() {
    sidebar.classList.add('open');
    overlay?.classList.add('visible');
    hamburger.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay?.classList.remove('visible');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });
  overlay?.addEventListener('click', closeSidebar);
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
