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
│   │   ├── stats/             ← Estadísticas globales y por empresa/candidato
│   │   ├── entrevistas/       ← Gestión de entrevistas para postulaciones
│   │   ├── dashboard/         ← Módulos agregadores de dashboard
│   │   ├── app.module.ts      ← Raíz del módulo NestJS
│   │   ├── prisma.service.ts  ← Cliente Prisma singleton
│   │   └── main.ts            ← Bootstrap, CORS, prefijo /api
│   ├── prisma/
│   │   └── schema.prisma      ← Modelos de BD
│   └── .env                   ← DATABASE_URL (Supabase)
│
├── frontend/                  ← Cliente UI estático
│   ├── css/                   ← Un archivo CSS por página
│   ├── js/                    ← Un archivo JS por página
│   │   └── utils.js           ← Funciones compartidas (cargar primero)
│   ├── index.html
│   ├── login.html
│   ├── ofertas.html
│   ├── oferta-detalle.html
│   ├── candidato-postulacion.html
│   ├── dashboard-candidato.html
│   └── dashboard-empresa.html
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
| stats | `/api/stats` |
| entrevistas | `/api/entrevistas` |

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
| `Empresa` | Perfil de empresa (incl. info extendida, industria, tamaño) |
| `OfertaLaboral` | Oferta publicada por una empresa, con `habilidades` requeridas |
| `Postulacion` | Relación Candidato ↔ OfertaLaboral, con `matchIA` |
| `Entrevista` | Citas agendadas para postulaciones (`fecha`, `linkReunion`) |

> Los campos `scoreCV`, `resumenIA` y `matchIA` están reservados para la integración con IA.

---

## Frontend — Reglas y Convenciones

### Tecnologías
- HTML5 semántico
- Vanilla CSS (un archivo por página en `/css/`)
- Vanilla JavaScript ES6+ (un archivo por página en `/js/`)

### Cómo agregar una nueva página

1. Crear `<nueva-pagina>.html` en la carpeta `frontend/`
2. Crear `css/<nueva-pagina>.css` dentro de `frontend/`
3. Crear `js/<nueva-pagina>.js` dentro de `frontend/`
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

### Consumo de API (`api.js`)

**Todo** el consumo de la API REST está centralizado en el archivo `js/api.js`. Ningún componente debe realizar el llamado nativo `fetch` de manera asilada.

**Características de api.js:**
- **Inyección de JWT:** Si hay un token en `labuai_session`, se inyecta automáticamente en los headers de cada petición.
- **Intercepción Global de 401 (Unauthorized):** Si el servidor rechaza el token por estar caducado, se limpia el `localStorage` de inmediato y se devuelve al usuario a `/login.html`. Esto previene fallos UI visuales.
- **Manejo Estandarizado de Errores:** Convierte cualquier error en una Excepción JavaScript clara (`throw new Error()`) lista para ser atrapada por el componente utilizando el `catch() { showToast(...) }`.

**Métodos HTTP Implementados (Arquitectura RESTful):**
- **GET (Lectura):** Para consultas a la base de datos sin alterar estados (ej: `getOfertas`, `getPerfilEmpresa`). Parámetros enviados vía Query Parameters.
- **POST (Creación):** Para inyectar nuevas entidades al servidor por primera vez (ej: `register()`, `crearPostulacion()`). Lleva la carga de datos estructurada en el cuerpo (Body) de la petición usando JSON.
- **PATCH (Modificación Parcial):** Reemplazando activamente al `PUT`, agiliza las actualizaciones ya que sólo manda a guardar en la DB **aquellos campos modificados** como el estado de una postulación o un cambio de perfil (`patchOferta()`). 
- **DELETE:** (Opcional) Borrado físico permanente de la Base de Datos. (En muchas entidades de este proyecto se usa el patrón "Soft-Delete", inactivando recursos con PATCH).

**Ejemplo de Patrón Correcto:**
```javascript
// ❌ Antiguo Patrón (NO USAR)
// fetch('...', { headers... })

// ✅ Nuevo Patrón Centralizado
try {
  const empresasGlobales = await window.API.getGlobalStats();
  // ... renderizado UI ...
} catch (error) {
  showToast(error.message, 'error');
}
```

### Control de Accesos y Roles en Frontend (RBAC)
Las vistas del sistema reaccionan al rol de la key `labuai_session.usuario.rol`:
- **EMPRESA:** Entra al Dashboard Empresa, permitiéndole crear Ofertas, editarlas y ver Candidatos interesados. 
- **CANDIDATO:** Entra a su propia pantalla de Candidato teniendo historial de CVs.
- **Invitado Anónimo:** Al detectar falta de sesión, los eventos que requieran permisos (como "Postularme" en el job info), automáticamente llevarán a la vista de credenciales (Login) conservando la integridad del proceso.

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
