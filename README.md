# LaburAI

Plataforma web inteligente para **selección de personal asistida por
inteligencia artificial**.

El objetivo del sistema es facilitar la conexión entre **candidatos** y
**empresas**, permitiendo publicar ofertas laborales, subir currículums
y utilizar IA para analizar perfiles y sugerir candidatos adecuados.

------------------------------------------------------------------------

# Características principales

-   Registro e inicio de sesión de usuarios
-   Diferenciación de roles (Candidato / Empresa)
-   Publicación de ofertas laborales
-   Postulación a empleos
-   Subida de currículums en PDF
-   Análisis de CV mediante inteligencia artificial
-   Sistema de matching candidato ↔ oferta

------------------------------------------------------------------------

# Arquitectura del sistema

El sistema utiliza una arquitectura **cliente-servidor**.

Frontend (HTML / CSS / JavaScript) ↓ REST API (NestJS) ↓ Prisma ORM ↓
PostgreSQL (Supabase)

------------------------------------------------------------------------

# Tecnologías utilizadas

## Frontend

-   HTML5
-   CSS3
-   JavaScript
-   Fetch API

## Backend

-   NestJS
-   TypeScript
-   Prisma ORM
-   JWT Authentication
-   Multer (upload de archivos)

## Base de datos

-   PostgreSQL
-   Supabase (hosting de base de datos)

## Inteligencia Artificial

El sistema utiliza IA para:

-   extraer habilidades de currículums
-   identificar experiencia laboral
-   generar resumen del perfil
-   calcular compatibilidad candidato-puesto

------------------------------------------------------------------------

# Estructura del proyecto

    LaburAI
    ├── backend
    │   ├── src
    │   │   ├── auth
    │   │   ├── jobs
    │   │   ├── applications
    │   │   ├── profile
    │   │   ├── app.module.ts
    │   │   ├── prisma.service.ts
    │   │   └── main.ts
    │   └── prisma
    │       └── schema.prisma
    │
    └── frontend
        ├── css
        ├── js
        │   └── utils.js
        ├── index.html
        ├── login.html
        ├── ofertas.html
        ├── oferta-detalle.html
        ├── dashboard-candidato.html
        └── dashboard-empresa.html

------------------------------------------------------------------------

# Endpoints principales

## Autenticación

POST /auth/register\
POST /auth/login

## Ofertas laborales

GET /jobs\
POST /jobs\
GET /jobs/:id

## Postulaciones

POST /applications\
GET /applications

## Currículums

POST /cv/upload

------------------------------------------------------------------------

# Modelo de datos simplificado

Usuario - id - email - password - role

Candidato - habilidades - experiencia - resumenIA - scoreCV

Empresa - nombreEmpresa

OfertaLaboral - titulo - descripcion - habilidades - empresaId

Postulacion - candidatoId - ofertaId - matchIA

------------------------------------------------------------------------

# Flujo del sistema

1.  El candidato se registra en la plataforma
2.  Completa su perfil y sube su CV
3.  La IA analiza el currículum
4.  Las empresas publican ofertas laborales
5.  Los candidatos se postulan
6.  El sistema calcula compatibilidad entre candidatos y ofertas

------------------------------------------------------------------------

# Variables de entorno

Archivo:

backend/.env

Ejemplo:

PORT=3000 DATABASE_URL=postgresql://... JWT_SECRET=your_secret

------------------------------------------------------------------------

# Ejecución del proyecto

## Backend

    cd backend
    npm install
    npm run start:dev

El servidor se ejecuta en:

http://localhost:3000

------------------------------------------------------------------------

## Frontend

Abrir en el navegador:

index.html

------------------------------------------------------------------------

# Despliegue

Opciones recomendadas:

Frontend - Netlify - Vercel - GitHub Pages

Backend - Render - Railway - Fly.io

Base de datos - Supabase - Railway - MongoDB Atlas

------------------------------------------------------------------------

# Funcionalidades futuras

-   Ranking automático de candidatos
-   Recomendación de empleos mediante IA
-   Análisis de habilidades faltantes
-   Dashboard avanzado para empresas
-   Sistema de notificaciones

------------------------------------------------------------------------

# Autor

Proyecto desarrollado como trabajo práctico para la materia **Ingeniería
Web II**.