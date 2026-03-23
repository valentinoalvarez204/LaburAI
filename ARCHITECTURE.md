# LaburAI — Arquitectura del Proyecto

## Visión General

LaburAI es una plataforma de empleo con integración de IA. Sigue una arquitectura **cliente-servidor** clásica con frontend estático y backend REST.

```
Browser (HTML + CSS + Vanilla JS)
        │
        │  HTTP/fetch() — JSON — JWT en headers
        ▼
NestJS REST API  ──  localhost:3000/api
        │
        │  Prisma ORM
        ▼
PostgreSQL (Supabase Cloud — AWS sa-east-1)
```

---

## Estructura del Repositorio

```
LaburAI/
├── backend/                   ← API REST
│   ├── src/
│   │   ├── auth/              ← Registro, login, JWT
│   │   ├── jobs/              ← CRUD ofertas laborales
│   │   ├── applications/      ← CRUD postulaciones
│   │   ├── profile/           ← Edición de perfiles
│   │   ├── app.module.ts      ← Raíz del módulo NestJS
│   │   ├── prisma.service.ts  ← Cliente Prisma singleton
│   │   └── main.ts            ← Bootstrap, CORS, prefijo /api
│   ├── prisma/
│   │   └── schema.prisma      ← Modelos de BD
│   └── .env                   ← DATABASE_URL (Supabase)
│
├── css/                       ← Un archivo CSS por página
├── js/                        ← Un archivo JS por página
│   └── utils.js               ← Funciones compartidas (cargar primero)
├── index.html
├── login.html
├── ofertas.html
├── oferta-detalle.html
├── dashboard-candidato.html
└── dashboard-empresa.html
```

---

## Backend — Reglas y Convenciones

### Tecnologías
| Librería | Uso |
|---|---|
| NestJS v11 | Framework principal |
| Prisma v7 | ORM + migraciones |
| PostgreSQL (Supabase) | Base de datos |
| JWT + Passport | Autenticación |
| bcrypt | Hash de contraseñas |
| Multer | Subida de archivos |
| class-validator | Validación de DTOs |

### Convención de módulos

Cada dominio tiene su propio módulo NestJS con la siguiente estructura:

```
src/<dominio>/
├── <dominio>.module.ts       ← Declara el módulo e importa dependencias
├── <dominio>.controller.ts   ← Define los endpoints HTTP
├── <dominio>.service.ts      ← Contiene la lógica de negocio
├── <dominio>.controller.spec.ts
└── <dominio>.service.spec.ts
```

### Cómo agregar un nuevo módulo

1. Crear la carpeta `src/<nuevo-dominio>/`
2. Generar los archivos con NestJS CLI:
   ```bash
   cd backend
   npx nest g module <nuevo-dominio>
   npx nest g controller <nuevo-dominio>
   npx nest g service <nuevo-dominio>
   ```
3. Importar `PrismaService` en el módulo nuevo si necesita acceso a BD
4. Registrar el módulo en `app.module.ts`
5. Proteger endpoints privados con `@UseGuards(JwtAuthGuard)`

### Autenticación

- Todos los endpoints privados usan `JwtAuthGuard` (`src/auth/jwt.guard.ts`)
- El token JWT se genera al registrar o hacer login. Payload: `{ sub: usuarioId, rol }`
- El frontend lo envía en el header: `Authorization: Bearer <token>`

### Rutas base

Todas las rutas tienen el prefijo global `/api` (configurado en `main.ts`).

| Módulo | Prefijo |
|---|---|
| auth | `/api/auth` |
| jobs | `/api/jobs` |
| applications | `/api/applications` |
| profile | `/api/profile` |

### Modelos de base de datos

Los cambios al schema deben seguir este flujo:

```bash
# 1. Editar backend/prisma/schema.prisma
# 2. Crear y aplicar la migración
cd backend
npx prisma migrate dev --name descripcion-del-cambio
# 3. El cliente Prisma se regenera automáticamente
```

**Modelos principales:**

| Modelo | Descripción |
|---|---|
| `Usuario` | Credenciales + rol (`CANDIDATO` \| `EMPRESA`) |
| `Candidato` | Perfil personal, CV, habilidades, `scoreCV`, `resumenIA` |
| `Empresa` | Perfil de empresa |
| `OfertaLaboral` | Oferta publicada por una empresa, con `habilidades` requeridas |
| `Postulacion` | Relación Candidato ↔ OfertaLaboral, con `matchIA` |

> Los campos `scoreCV`, `resumenIA` y `matchIA` están reservados para la integración con IA.

---

## Frontend — Reglas y Convenciones

### Tecnologías
- HTML5 semántico
- Vanilla CSS (un archivo por página en `/css/`)
- Vanilla JavaScript ES6+ (un archivo por página en `/js/`)

### Cómo agregar una nueva página

1. Crear `<nueva-pagina>.html` en la raíz
2. Crear `css/<nueva-pagina>.css`
3. Crear `js/<nueva-pagina>.js`
4. Incluir los scripts en este orden en el HTML:
   ```html
   <link rel="stylesheet" href="css/base.css">
   <link rel="stylesheet" href="css/<nueva-pagina>.css">
   ...
   <script src="js/utils.js"></script>
   <script src="js/<nueva-pagina>.js"></script>
   ```

### `utils.js` — Funciones compartidas

Siempre cargar `utils.js` **antes** que cualquier otro JS. Provee:

| Función | Descripción |
|---|---|
| `initNavbar()` | Efecto scroll en navbar |
| `initHamburger()` | Menú mobile |
| `initReveal()` | Animación scroll reveal (`.reveal`, `.reveal-card`) |
| `initAvatarDropdown()` | Dropdown del avatar en dashboards |
| `initDashSidebar()` | Sidebar mobile en dashboards |
| `showToast(msg, type)` | Toast de notificación (`'success'`, `'error'`, `'info'`) |
| `animateCounter(el, target, duration, suffix)` | Animación de números |
| `getParam(key)` | Lee parámetros de la URL |
| `delay(ms)` | Promesa de espera |
| `cerrarSesion()` | Limpia `localStorage` y redirige al inicio |

### Sesión de usuario

La sesión se almacena en `localStorage` bajo la clave `labuai_session`.  
Estructura esperada:

```json
{
  "token": "<JWT>",
  "usuario": {
    "id": "...",
    "email": "...",
    "rol": "CANDIDATO | EMPRESA",
    "nombre": "...",
    "candidatoId": "...",
    "empresaId": "..."
  }
}
```

Para llamar a la API desde el frontend:

```js
const session = JSON.parse(localStorage.getItem('labuai_session'));
const res = await fetch('http://localhost:3000/api/<ruta>', {
  headers: { Authorization: `Bearer ${session.token}` }
});
```

---

## Checklist para nuevas funcionalidades

### Backend
- [ ] Nuevo módulo en `src/<dominio>/` con controller, service y module
- [ ] DTO con validaciones (`class-validator`) para cada endpoint
- [ ] Endpoints privados protegidos con `@UseGuards(JwtAuthGuard)`
- [ ] Cambios en schema → migración con `prisma migrate dev`
- [ ] Módulo registrado en `app.module.ts`
- [ ] Tests unitarios en `.spec.ts`

### Frontend
- [ ] Nuevo HTML + CSS + JS con los nombres consistentes
- [ ] `utils.js` cargado primero en el HTML
- [ ] Manejo de sesión: verificar `labuai_session` al cargar la página
- [ ] Errores de API manejados con `showToast()`
- [ ] Diseño consistente con `base.css`
