# Plataforma Inteligente de Selección de Personal
**INGENIERÍA WEB II - 2026**

## 1. Introducción
El proceso de selección de personal es una actividad clave para las organizaciones, pero suele implicar grandes volúmenes de información y análisis manual de currículums. Las empresas reciben cientos de postulaciones para una misma posición, lo que hace que el proceso de filtrado y análisis sea lento y costoso.

El objetivo de este proyecto es desarrollar una plataforma web de selección de personal, donde los candidatos puedan cargar sus currículums y las empresas puedan buscar perfiles adecuados para sus vacantes.

Como característica innovadora, el sistema deberá integrar inteligencia artificial para analizar currículums, permitiendo:
* Extraer información relevante de los CV
* Identificar habilidades y experiencia
* Sugerir candidatos adecuados para cada puesto

Este proyecto permitirá aplicar conceptos fundamentales de desarrollo web como:
* Arquitectura cliente-servidor
* Desarrollo de interfaces web dinámicas
* APIs backend
* Procesamiento de documentos
* Integración con inteligencia artificial
* Despliegue de aplicaciones web

## 2. Objetivos del Proyecto
El objetivo general del proyecto es desarrollar una plataforma web que facilite la conexión entre candidatos y empresas mediante análisis inteligente de currículums.

**Objetivos específicos:**
* Permitir a los candidatos crear perfiles profesionales y subir sus CV.
* Permitir a las empresas publicar ofertas laborales.
* Implementar un sistema de búsqueda de candidatos.
* Integrar inteligencia artificial para analizar currículums.
* Generar sugerencias automáticas de perfiles adecuados para una vacante.
* Publicar el sistema en un hosting gratuito accesible públicamente.

## 3. Descripción del Sistema
La plataforma deberá permitir la interacción entre dos tipos de usuarios principales.

### 1. Candidato
Es el usuario que busca oportunidades laborales. Podrá:
* Registrarse en la plataforma
* Iniciar sesión
* Completar su perfil profesional
* Subir su currículum
* Postularse a ofertas laborales
* Visualizar el estado de sus postulaciones

### 2. Empresa
Es el usuario que busca candidatos para cubrir vacantes laborales. Podrá:
* Registrarse en la plataforma
* Publicar ofertas de trabajo
* Buscar candidatos
* Visualizar perfiles profesionales
* Analizar CVs mediante inteligencia artificial
* Seleccionar candidatos para entrevistas

## 4. Funcionalidades Principales
El sistema deberá incluir las siguientes funcionalidades mínimas.

### 4.1 Gestión de usuarios
El sistema deberá permitir:
* Registro de usuarios
* Inicio de sesión
* Edición de perfil
* Diferenciación de roles:
  * Candidato
  * Empresa

### 4.2 Gestión de currículums
Los candidatos podrán:
* Subir su CV en formato PDF
* Completar un perfil profesional con información como:
  * Nombre
  * Formación académica
  * Experiencia laboral
  * Habilidades técnicas
  * Idiomas
  * Ubicación

### 4.3 Publicación de ofertas laborales
Las empresas podrán publicar ofertas de trabajo con información como:
* Nombre del puesto
* Descripción del trabajo
* Habilidades requeridas
* Experiencia mínima
* Ubicación
* Modalidad (remoto / presencial)

### 4.4 Postulación a empleos
Los candidatos podrán:
* Visualizar ofertas laborales
* Postularse a las ofertas disponibles

Las empresas podrán ver:
* Listado de postulantes
* Perfil del candidato
* Currículum adjunto

### 4.5 Análisis de currículums mediante IA
El sistema deberá integrar un servicio de inteligencia artificial que analice los currículums cargados por los candidatos. La IA deberá intentar:
* Extraer habilidades relevantes
* Identificar experiencia laboral
* Detectar tecnologías mencionadas
* Generar un resumen del perfil profesional

### 4.6 Sugerencia de candidatos para empresas
La inteligencia artificial podrá sugerir candidatos para una vacante en función de:
* Habilidades
* Experiencia
* Coincidencia con los requisitos del puesto

### 4.7 Búsqueda de perfiles
Las empresas deberán poder buscar candidatos mediante filtros como:
* Habilidades
* Experiencia
* Ubicación
* Área profesional

## 5. Arquitectura del Sistema
El sistema deberá implementar una arquitectura cliente-servidor, donde el frontend se comunica con el backend mediante solicitudes HTTP.

Frontend (HTML, CSS, JS)
         |
         | HTTP/REST API
         v
  Backend (NestJS)
         |
         v
   Base de datos

## 6. Tecnologías obligatorias

### Frontend
Debe utilizar:
* HTML
* CSS
* JavaScript

Se espera el uso de:
* Manipulación del DOM
* Formularios dinámicos
* Validaciones del lado del cliente
* Consumo de APIs mediante fetch o axios

### Backend
Debe desarrollarse con:
* NestJS

El backend deberá implementar:
* API REST
* Gestión de usuarios
* Manejo de archivos (CVs)
* Sistema de postulaciones
* Integración con IA

**Ejemplo de endpoints:**
* `POST /auth/register`
* `POST /auth/login`
* `GET /jobs`
* `POST /jobs`
* `GET /jobs/:id`
* `POST /applications`
* `GET /applications`
* `POST /cv/upload`

## 7. Requisitos técnicos mínimos
El sistema deberá incluir:

### Backend
* API REST
* CRUD de ofertas laborales
* Gestión de usuarios
* Carga de currículums
* Integración con IA
* Persistencia de datos

### Frontend
* Interfaz responsive
* Formularios dinámicos
* Visualización de ofertas laborales
* Consumo de APIs

## 8. Despliegue del proyecto
El sistema deberá estar publicado en internet utilizando servicios gratuitos. Opciones sugeridas:
* **Frontend:** Netlify, Vercel, GitHub Pages
* **Backend:** Render, Railway, Fly.io
* **Base de datos:** Supabase, Railway, MongoDB Atlas

## 9. Entregables
Cada grupo deberá entregar:

### Código fuente
Repositorio en GitHub con:
* Frontend
* Backend
* Documentación

### Aplicación funcionando
Se deberá entregar:
* URL del frontend
* URL del backend

### Documentación
Debe incluir:
* Descripción del sistema
* Arquitectura
* Modelo de datos
* Endpoints
* Explicación del uso de la IA

### Presentación final
Cada grupo deberá realizar una demo del sistema, mostrando:
* Registro de usuario
* Carga de currículum
* Publicación de oferta laboral
* Análisis de CV con IA
* Funcionalidades principales

## 10. Criterios de evaluación
Se evaluará:
* Funcionamiento del sistema
* Calidad del código
* Diseño de la interfaz
* Integración con IA
* Arquitectura utilizada
* Creatividad
* Calidad de la presentación

## Funcionalidades Extras Opcionales
Los grupos podrán implementar funcionalidades adicionales para mejorar el sistema.

1. **Ranking automático de candidatos:** La IA puede ordenar candidatos según su compatibilidad con una vacante.
2. **Análisis de habilidades faltantes:** El sistema puede indicar qué habilidades le faltan a un candidato para un puesto.
3. **Recomendación de empleos para candidatos:** La IA puede sugerir ofertas laborales según el perfil del usuario.
4. **Generación automática de resumen profesional:** La IA puede generar un resumen del perfil del candidato a partir del CV.
5. **Sistema de evaluación de CV:** Asignar una puntuación al currículum según claridad, habilidades y experiencia.
6. **Comparación de candidatos:** Permitir comparar varios candidatos para una misma vacante.
7. **Dashboard de empresas:** Mostrar estadísticas como: cantidad de postulaciones, ofertas más vistas, perfiles más buscados.
8. **Sistema de favoritos:** Las empresas pueden guardar candidatos favoritos.
9. **Historial de postulaciones:** Los candidatos pueden ver todas las postulaciones realizadas.
10. **Notificaciones automáticas:** Enviar notificaciones cuando una empresa revisa el CV o cuando una empresa acepta o rechaza una postulación.
11. **Generador automático de CV:** Permitir crear un CV desde el perfil del sistema.
12. **Análisis de palabras clave en CV:** La IA puede detectar tecnologías y habilidades mencionadas.
13. **Filtros avanzados de búsqueda:** Permitir filtrar candidatos por tecnologías, años de experiencia o estudios.
14. **Perfil público del candidato:** Permitir compartir un perfil profesional público.
15. **Sistema de mensajes entre empresa y candidato:** Implementar mensajería dentro de la plataforma.
16. **Análisis de compatibilidad candidato-puesto:** Mostrar porcentaje de compatibilidad.
17. **Ranking de habilidades más demandadas:** Mostrar tendencias del mercado laboral dentro de la plataforma.
18. **Visualización gráfica de habilidades:** Mostrar habilidades del candidato en gráficos.
19. **Simulación de entrevistas:** La IA podría generar preguntas de entrevista según el perfil.
20. **Panel de administración:** Un administrador podría ver estadísticas globales de la plataforma.