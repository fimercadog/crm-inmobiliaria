# CRM Inmobiliaria

Aplicación web para gestión inmobiliaria con dos frentes:

- CRM privado para administrar propiedades, propietarios, clientes, leads, oportunidades, visitas, tareas, documentos, reportes, equipo y blog.
- Web pública inmobiliaria para mostrar propiedades, recibir leads, publicar artículos y facilitar contacto por WhatsApp.

El proyecto está dividido en `backend` y `frontend`.

## Stack

### Backend

- Laravel 12
- PHP 8.2+
- JWT Auth
- SQLite por defecto en desarrollo
- PHPUnit
- Exportaciones CSV/PDF

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/radix-ui
- Redux Toolkit
- Axios

## Estructura

```txt
.
├── backend/   # API Laravel, autenticación, modelos, migraciones, seeders y tests
└── frontend/  # Next.js: CRM privado + web pública inmobiliaria
```

## Requisitos

- PHP 8.2 o superior
- Composer
- Node.js 20 o superior recomendado
- npm
- SQLite habilitado en PHP para desarrollo local

## Configuración del backend

Desde la raíz del repositorio:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```

Si vas a usar SQLite, crea el archivo de base de datos:

```bash
mkdir -p database
touch database/database.sqlite
```

En Windows PowerShell puedes usar:

```powershell
New-Item -ItemType File -Force database/database.sqlite
```

Luego ejecuta migraciones y datos de prueba:

```bash
php artisan migrate --seed
php artisan storage:link
```

Variables importantes del backend:

```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:3000
DB_CONNECTION=sqlite
JWT_SECRET=
```

## Configuración del frontend

Desde la raíz del repositorio:

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

Variables públicas principales:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Inmobiliaria Prime
NEXT_PUBLIC_WHATSAPP_NUMBER=573001234567
NEXT_PUBLIC_CONTACT_PHONE=+57 300 123 4567
NEXT_PUBLIC_CONTACT_EMAIL=contacto@inmobiliariaprime.test
NEXT_PUBLIC_CONTACT_ADDRESS=Calle 100 #15-20, Bogotá, Colombia
```

## Ejecutar en desarrollo

Terminal 1, API Laravel:

```bash
cd backend
php artisan serve
```

La API queda disponible en:

```txt
http://localhost:8000/api/v1
```

Terminal 2, frontend Next.js:

```bash
cd frontend
npm run dev
```

La aplicación queda disponible en:

```txt
http://localhost:3000
```

## Credenciales de prueba

El seeder crea estos usuarios:

| Rol | Email | Password |
| --- | --- | --- |
| Admin | `admin@crm.test` | `password` |
| Agente | `agente@crm.test` | `password` |
| Asistente | `asistente@crm.test` | `password` |

## Rutas principales

### Web pública

- `/` — Inicio
- `/propiedades` — Catálogo de propiedades
- `/comprar` — Propiedades en venta
- `/arrendar` — Propiedades en arriendo
- `/propiedades/[slug]` — Detalle de propiedad
- `/blog` — Blog público
- `/blog/[slug]` — Detalle de artículo
- `/nosotros` — Información de la inmobiliaria
- `/contacto` — Formulario de contacto
- `/vender-mi-propiedad` — Captación de propietarios

### CRM privado

- `/login` — Acceso
- `/dashboard` — Resumen operativo
- `/properties` — Propiedades
- `/owners` — Propietarios
- `/clients` — Clientes
- `/leads` — Leads
- `/opportunities` — Oportunidades
- `/visits` — Visitas
- `/activities` — Seguimientos
- `/tasks` — Tareas
- `/closings` — Cierres
- `/blog-posts` — Blog
- `/reports` — Reportes
- `/settings` — Configuración
- `/team/*` — Equipo y roles

## Endpoints destacados

Base URL:

```txt
http://localhost:8000/api/v1
```

Públicos:

- `GET /ping`
- `GET /public/properties`
- `GET /public/properties/featured`
- `GET /public/properties/{slug}`
- `GET /public/blog`
- `GET /public/blog/{slug}`
- `POST /public/leads`

Autenticación:

- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

Recursos privados protegidos con JWT:

- `/properties`
- `/owners`
- `/clients`
- `/leads`
- `/opportunities`
- `/visits`
- `/activities`
- `/tasks`
- `/users`
- `/agents`
- `/documents`
- `/blog-posts`
- `/reports/*`

## Comandos útiles

Backend:

```bash
cd backend
php artisan test
php artisan migrate:fresh --seed
php artisan route:list
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
npm run start
```

## Validación antes de entregar cambios

Recomendado:

```bash
cd backend
php artisan test
```

```bash
cd frontend
npm run lint
npm run build
```

## Identidad pública

La web pública incluye:

- Logo y favicon propios en `frontend/public/brand`.
- Paleta visual inmobiliaria premium.
- Botón flotante global de WhatsApp.
- Animaciones sutiles en páginas públicas.
- Imagen de ejemplo para propiedades sin fotografía.

La información de marca/contacto se centraliza en:

```txt
frontend/src/constants/site.ts
```

## Notas de desarrollo

- El frontend consume la API desde `NEXT_PUBLIC_API_URL`.
- El backend permite CORS desde `CORS_ALLOWED_ORIGINS`.
- Las propiedades públicas dependen de `published_at`.
- Las imágenes cargadas por Laravel se exponen mediante `php artisan storage:link`.
- En desarrollo, Next tiene desactivado el indicador visual de devtools (`devIndicators: false`).
