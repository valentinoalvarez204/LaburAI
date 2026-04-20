/* ══════════════════════════════════════════
   LaburAI — login.js
   Módulos:
   - Tabs login / registro
   - Selector de rol (candidato / empresa)
   - Toggle mostrar/ocultar contraseña
   - Indicador de fortaleza de contraseña
   - Validaciones de formulario
   - Simulación de envío (spinner + éxito)
   - Links de cambio de tab desde el form
══════════════════════════════════════════ */

/* ─────────────────────────────────
   TABS — alternar login / registro
───────────────────────────────── */
function initTabs() {
  const tabs = document.querySelectorAll('.auth-tab');
  const formLogin = document.getElementById('formLogin');
  const formReg = document.getElementById('formRegister');
  const successSt = document.getElementById('successState');

  function switchTab(target) {
    // Activar tab
    tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === target));

    // Mostrar form correspondiente
    if (target === 'login') {
      formLogin.classList.remove('hidden');
      formReg.classList.add('hidden');
      successSt.classList.add('hidden');
    } else {
      formLogin.classList.add('hidden');
      formReg.classList.remove('hidden');
      successSt.classList.add('hidden');
    }

    // Limpiar errores al cambiar
    clearErrors();
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Links "switch-tab" dentro de los formularios
  document.querySelectorAll('.switch-tab').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(link.dataset.tab);
    });
  });
}

/* ─────────────────────────────────
   SELECTOR DE ROL
───────────────────────────────── */
function initRoleSelector() {
  const btns = document.querySelectorAll('.role-btn');
  const hiddenInput = document.getElementById('selectedRole');
  const empresaFields = document.getElementById('empresaFields');
  const candFields = document.getElementById('candFields');

  function setRole(role) {
    if (hiddenInput) hiddenInput.value = role;
    if (empresaFields) empresaFields.hidden = (role !== 'empresa');
    if (candFields) candFields.hidden = (role === 'empresa');
  }

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      btns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      setRole(btn.dataset.role);
    });
  });

  // Listener para mostrar/ocultar campo "Otro"
  const selectIndustria = document.getElementById('regIndustria');
  const otraWrap = document.getElementById('otraIndustriaWrap');
  if (selectIndustria && otraWrap) {
    selectIndustria.addEventListener('change', () => {
      otraWrap.hidden = selectIndustria.value !== 'Otro';
      if (otraWrap.hidden) {
        const otraInput = document.getElementById('regOtraIndustria');
        if (otraInput) otraInput.value = '';
      }
    });
  }
}

/* ─────────────────────────────────
   TOGGLE CONTRASEÑA
───────────────────────────────── */
function initPasswordToggles() {
  document.querySelectorAll('.toggle-pass').forEach((btn) => {
    btn.addEventListener('click', () => {
      const inputId = btn.dataset.target;
      const input = document.getElementById(inputId);
      if (!input) return;

      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';

      // Cambiar ícono
      const icon = btn.querySelector('.eye-icon');
      if (icon) {
        icon.innerHTML = isText
          ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
          : '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
      }
    });
  });
}

/* ─────────────────────────────────
   FORTALEZA DE CONTRASEÑA
───────────────────────────────── */
const STRENGTH_LEVELS = [
  { label: 'Muy débil', color: '#E53935', width: '20%' },
  { label: 'Débil', color: '#FF7043', width: '40%' },
  { label: 'Regular', color: '#F4A700', width: '60%' },
  { label: 'Buena', color: '#66BB6A', width: '80%' },
  { label: 'Excelente', color: '#11998E', width: '100%' },
];

function getStrengthScore(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4); // 0–4
}

function initPasswordStrength() {
  const input = document.getElementById('regPassword');
  const wrap = document.getElementById('strengthWrap');
  const fill = document.getElementById('strengthFill');
  const label = document.getElementById('strengthLabel');
  if (!input || !wrap || !fill || !label) return;

  input.addEventListener('input', () => {
    const val = input.value;

    if (!val) {
      wrap.hidden = true;
      return;
    }

    wrap.hidden = false;
    const score = getStrengthScore(val);
    const level = STRENGTH_LEVELS[score];
    fill.style.width = level.width;
    fill.style.background = level.color;
    label.textContent = level.label;
    label.style.color = level.color;
  });
}

/* ─────────────────────────────────
   VALIDACIONES
───────────────────────────────── */
function setError(inputId, errId, message) {
  const input = document.getElementById(inputId);
  const err = document.getElementById(errId);
  if (input) input.closest('.floating-group')?.classList.add('error');
  if (err) err.textContent = message;
  return false;
}

function clearError(inputId, errId) {
  const input = document.getElementById(inputId);
  const err = document.getElementById(errId);
  if (input) {
    input.closest('.floating-group')?.classList.remove('error');
    input.closest('.floating-group')?.classList.remove('success');
  }
  if (err) err.textContent = '';
}

function setSuccess(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.closest('.floating-group')?.classList.remove('error');
    input.closest('.floating-group')?.classList.add('success');
  }
}

function clearErrors() {
  document.querySelectorAll('.floating-group').forEach((w) => {
    w.classList.remove('error', 'success');
  });
  document.querySelectorAll('.field-error').forEach((e) => {
    e.textContent = '';
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* Validar login */
function validateLogin() {
  let valid = true;
  clearErrors();

  const email = document.getElementById('loginEmail')?.value.trim();
  const pass = document.getElementById('loginPassword')?.value;

  if (!email) {
    setError('loginEmail', 'loginEmailErr', 'El email es obligatorio.');
    valid = false;
  } else if (!isValidEmail(email)) {
    setError('loginEmail', 'loginEmailErr', 'Ingresá un email válido.');
    valid = false;
  } else {
    setSuccess('loginEmail');
  }

  if (!pass) {
    setError('loginPassword', 'loginPassErr', 'La contraseña es obligatoria.');
    valid = false;
  } else if (pass.length < 6) {
    setError('loginPassword', 'loginPassErr', 'Mínimo 6 caracteres.');
    valid = false;
  } else {
    setSuccess('loginPassword');
  }

  return valid;
}

/* Validar registro */
function validateRegister() {
  let valid = true;
  clearErrors();

  const nombre = document.getElementById('regNombre')?.value.trim();
  const apellido = document.getElementById('regApellido')?.value.trim();
  const email = document.getElementById('regEmail')?.value.trim();
  const pass = document.getElementById('regPassword')?.value;
  const confirm = document.getElementById('regConfirm')?.value;
  const terms = document.getElementById('acceptTerms')?.checked;
  const rol = document.getElementById('selectedRole')?.value || 'candidato';

  if (rol === 'candidato') {
    if (!nombre) {
      setError('regNombre', 'regNombreErr', 'Ingresá tu nombre.');
      valid = false;
    } else { setSuccess('regNombre'); }

    if (!apellido) {
      setError('regApellido', 'regApellidoErr', 'Ingresá tu apellido.');
      valid = false;
    } else { setSuccess('regApellido'); }
  } else {
    // Si es empresa limpiamos errores de candidato que pudieran haber quedado
    clearError('regNombre', 'regNombreErr');
    clearError('regApellido', 'regApellidoErr');
  }

  if (!email) {
    setError('regEmail', 'regEmailErr', 'El email es obligatorio.');
    valid = false;
  } else if (!isValidEmail(email)) {
    setError('regEmail', 'regEmailErr', 'Ingresá un email válido.');
    valid = false;
  } else { setSuccess('regEmail'); }

  if (!pass) {
    setError('regPassword', 'regPassErr', 'La contraseña es obligatoria.');
    valid = false;
  } else if (pass.length < 8) {
    setError('regPassword', 'regPassErr', 'Mínimo 8 caracteres.');
    valid = false;
  } else { setSuccess('regPassword'); }

  if (!confirm) {
    setError('regConfirm', 'regConfirmErr', 'Confirmá tu contraseña.');
    valid = false;
  } else if (pass !== confirm) {
    setError('regConfirm', 'regConfirmErr', 'Las contraseñas no coinciden.');
    valid = false;
  } else { setSuccess('regConfirm'); }

  if (!terms) {
    const err = document.getElementById('termsErr');
    if (err) err.textContent = 'Debés aceptar los términos para continuar.';
    valid = false;
  }

  return valid;
}

/* Validar campos de empresa (solo cuando rol = empresa) */
function validateEmpresaFields() {
  const nombreEmpresa = document.getElementById('regNombreEmpresa')?.value.trim();
  if (!nombreEmpresa) {
    setError('regNombreEmpresa', 'regNombreEmpresaErr', 'Ingresá el nombre de la empresa.');
    return false;
  }
  setSuccess('regNombreEmpresa');
  return true;
}

/* ─────────────────────────────────
   SIMULACIÓN DE ENVÍO
───────────────────────────────── */
function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const txtEl = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.btn-spinner');

  btn.disabled = loading;
  if (txtEl) txtEl.style.display = loading ? 'none' : '';
  if (spinner) spinner.hidden = !loading;
}

function initForms() {
  // ── LOGIN ──
  const formLogin = document.getElementById('formLogin');
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateLogin()) return;

      setLoading('btnLogin', true);

      try {
        const email = document.getElementById('loginEmail')?.value || '';
        const password = document.getElementById('loginPassword')?.value || '';

        const data = await API.login(email, password);
        setLoading('btnLogin', false);

        localStorage.setItem('labuai_session', JSON.stringify({
          nombre: data.usuario.nombre,
          rol: data.usuario.rol.toLowerCase(),
          email: data.usuario.email,
          token: data.token,
          id: data.usuario.id,
          candidatoId: data.usuario.candidatoId,
          empresaId: data.usuario.empresaId,
        }));

        showToast('¡Bienvenido/a! Redirigiendo…', 'success');
        await delay(1000);

        const destino = data.usuario.rol === 'EMPRESA'
          ? 'dashboard-empresa.html'
          : 'dashboard-candidato.html';
        window.location.href = destino;

      } catch (err) {
        setLoading('btnLogin', false);
        showToast(err.message || 'No se pudo conectar con el servidor', 'error');
      }
    });
  }

  // ── REGISTRO ──
  const formReg = document.getElementById('formRegister');
  if (formReg) {
    formReg.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateRegister()) return;

      setLoading('btnRegister', true);

      try {
        const rol = document.getElementById('selectedRole')?.value || 'candidato';

        // Validación extra para empresa
        if (rol === 'empresa' && !validateEmpresaFields()) {
          setLoading('btnRegister', false);
          return;
        }

        const nombre = document.getElementById('regNombre')?.value || '';
        const apellido = document.getElementById('regApellido')?.value || '';
        const email = document.getElementById('regEmail')?.value || '';
        const password = document.getElementById('regPassword')?.value || '';

        // Calcular industria final (predefinida o custom)
        const selectIndustria = document.getElementById('regIndustria');
        const otraIndustria = document.getElementById('regOtraIndustria')?.value.trim() || '';
        let industria = '';
        if (rol === 'empresa' && selectIndustria) {
          industria = selectIndustria.value === 'Otro'
            ? otraIndustria
            : selectIndustria.value;
        }

        // Nombre de empresa: usar campo dedicado si existe, si no caer en regNombre
        const data = await API.register({
          email,
          password,
          rol: rol.toUpperCase(),
          nombre: rol === 'empresa' ? nombreEmpresa : nombre,
          apellido: rol === 'empresa' ? '' : apellido,
          ...(industria ? { industria } : {}),
        });

        setLoading('btnRegister', false);

        localStorage.setItem('labuai_session', JSON.stringify({
          nombre: data.usuario.nombre,
          rol: rol,
          email: email,
          token: data.token,
          id: data.usuario.id,
          candidatoId: data.usuario.candidatoId,
          empresaId: data.usuario.empresaId,
        }));

        const destino = rol === 'empresa' ? 'dashboard-empresa.html' : 'dashboard-candidato.html';
        const label = rol === 'empresa' ? 'al panel de empresa' : 'a tu dashboard';

        formReg.classList.add('hidden');
        const success = document.getElementById('successState');
        if (!success) return;
        success.classList.remove('hidden');

        const msg = document.getElementById('successMsg');
        if (msg) msg.textContent = `Redirigiendo ${label}…`;

        const fill = document.getElementById('scdFill');
        const scdText = document.getElementById('scdText');
        let secs = 3;

        function tick() {
          if (scdText) scdText.textContent = `Entrando en ${secs}…`;
          if (fill) fill.style.width = ((secs / 3) * 100) + '%';
          if (secs <= 0) { window.location.href = destino; return; }
          secs--;
          setTimeout(tick, 1000);
        }
        tick();

      } catch (err) {
        setLoading('btnRegister', false);
        showToast(err.message || 'No se pudo conectar con el servidor', 'error');
      }
    });
  }

  // ── GOOGLE (simulado) ──
  ['btnGoogleLogin', 'btnGoogleRegister'].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        showToast('Conectando con Google…', 'info');
      });
    }
  });
}



/* ─────────────────────────────────
   VALIDACIÓN EN TIEMPO REAL (blur)
───────────────────────────────── */
function initLiveValidation() {
  const rules = [
    { id: 'loginEmail', errId: 'loginEmailErr', check: (v) => !v ? 'El email es obligatorio.' : !isValidEmail(v) ? 'Email inválido.' : '' },
    { id: 'loginPassword', errId: 'loginPassErr', check: (v) => !v ? 'La contraseña es obligatoria.' : v.length < 6 ? 'Mínimo 6 caracteres.' : '' },
    { id: 'regNombre', errId: 'regNombreErr', check: (v) => {
        const rol = document.getElementById('selectedRole')?.value;
        if (rol === 'empresa') return '';
        return !v ? 'Ingresá tu nombre.' : '';
      }
    },
    { id: 'regApellido', errId: 'regApellidoErr', check: (v) => {
        const rol = document.getElementById('selectedRole')?.value;
        if (rol === 'empresa') return '';
        return !v ? 'Ingresá tu apellido.' : '';
      }
    },
    { id: 'regNombreEmpresa', errId: 'regNombreEmpresaErr', check: (v) => {
        const rol = document.getElementById('selectedRole')?.value;
        if (rol !== 'empresa') return '';
        return !v ? 'Ingresá el nombre de la empresa.' : '';
      }
    },
    { id: 'regEmail', errId: 'regEmailErr', check: (v) => !v ? 'El email es obligatorio.' : !isValidEmail(v) ? 'Email inválido.' : '' },
    { id: 'regPassword', errId: 'regPassErr', check: (v) => !v ? 'La contraseña es obligatoria.' : v.length < 8 ? 'Mínimo 8 caracteres.' : '' },
    {
      id: 'regConfirm', errId: 'regConfirmErr', check: (v) => {
        const pass = document.getElementById('regPassword')?.value;
        return !v ? 'Confirmá tu contraseña.' : v !== pass ? 'Las contraseñas no coinciden.' : '';
      }
    },
  ];

  rules.forEach(({ id, errId, check }) => {
    const input = document.getElementById(id);
    if (!input) return;

    input.addEventListener('blur', () => {
      const msg = check(input.value.trim());
      clearError(id, errId);
      if (msg) {
        setError(id, errId, msg);
      } else if (input.value.trim()) {
        setSuccess(id);
      }
    });

    // Limpiar error al escribir
    input.addEventListener('input', () => {
      clearError(id, errId);
    });
  });
}

/* ─────────────────────────────────
   TOAST NOTIFICATION
───────────────────────────────── */

/* ─────────────────────────────────
   INIT
───────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initRoleSelector();
  initPasswordToggles();
  initPasswordStrength();
  initLiveValidation();
  initForms();
});
