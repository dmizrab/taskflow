# TaskFlow — Gestión interna de tareas

MVP de herramienta de seguimiento de tareas y proyectos inspirada en Monday.com.

## Stack

- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript
- **Estilos**: Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL + Auth + Storage)
- **Estado**: TanStack Query v5
- **Notificaciones**: react-hot-toast

---

## Instalación y configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Crea un nuevo proyecto
3. Ve a **Settings > API** y copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus valores reales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Crear el schema de base de datos

En Supabase Dashboard, ve a **SQL Editor** y ejecuta el contenido de:

```
supabase/migrations/001_initial_schema.sql
```

Esto crea todas las tablas, índices, políticas RLS y triggers.

### 5. (Opcional) Cargar datos de ejemplo

1. Ve a **Authentication > Users** en Supabase y crea estos usuarios:
   - `admin@empresa.com` / `Admin1234`
   - `manager@empresa.com` / `Manager1234`
   - `maria@empresa.com` / `User1234`
   - `carlos@empresa.com` / `User1234`

2. En el SQL Editor, ejecuta:
```
supabase/seed_example.sql
```

### 6. Correr la aplicación

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Funcionalidades incluidas

### Autenticación
- Login / Registro con email y contraseña
- Protección de rutas mediante middleware
- Sesión persistente con Supabase Auth

### Proyectos
- Crear proyectos con nombre, descripción y color
- Vista de tarjetas con progreso visual
- Eliminar proyectos (solo admin o dueño)

### Tareas
- Tabla editable en línea (clic para editar estado, prioridad, responsable, fecha)
- Doble clic para editar el nombre directamente en la tabla
- Modal de detalle completo con descripción, comentarios e historial
- Filtros: estado, prioridad, responsable, fecha (vencidas/hoy/semana)
- Búsqueda por texto
- Indicadores visuales: tareas vencidas (rojo), vencen hoy (naranja)
- Contadores de comentarios y archivos adjuntos en la tabla

### Dashboard
- Resumen general: tareas vencidas, bloqueadas, % completado
- Distribución de tareas por responsable con barra de progreso
- Avance por proyecto
- Estadísticas en tiempo real

### Roles
| Función | Admin | Manager | Member |
|---------|-------|---------|--------|
| Crear proyectos | ✅ | ✅ | ❌ |
| Eliminar proyectos | ✅ | Solo propios | ❌ |
| Crear tareas | ✅ | ✅ | ❌ |
| Editar cualquier tarea | ✅ | ✅ | Solo asignadas |
| Ver proyectos asignados | ✅ | ✅ | ✅ |
| Ver dashboard | ✅ | ✅ | ✅ |

### Historial de cambios
- Registro automático (trigger SQL) de cambios en: estado, prioridad, responsable, fecha límite
- Visible en la pestaña "Historial" del modal de tarea

---

## Estructura del proyecto

```
taskflow/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/          # Página de login
│   │   │   └── register/       # Página de registro
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/      # Panel principal con estadísticas
│   │   │   └── projects/
│   │   │       └── [id]/       # Vista de proyecto con tabla de tareas
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Redirige a /dashboard o /login
│   │   ├── providers.tsx       # QueryClient + Toaster
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # Button, Input, Select, Badge, Modal, Avatar
│   │   ├── tasks/              # TaskTable, TaskModal, CreateTaskModal, TaskFilters
│   │   ├── projects/           # ProjectCard, CreateProjectModal
│   │   ├── dashboard/          # StatsPanel
│   │   └── layout/             # Sidebar
│   ├── hooks/
│   │   ├── useAuth.ts          # Estado de autenticación
│   │   ├── useProjects.ts      # CRUD proyectos
│   │   └── useTasks.ts         # CRUD tareas + comentarios
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts       # Cliente para componentes
│   │   │   └── server.ts       # Cliente para Server Components
│   │   └── utils.ts            # cn(), formatDate(), labels/colors
│   ├── types/
│   │   └── index.ts            # Todos los tipos TypeScript
│   └── middleware.ts           # Protección de rutas
└── supabase/
    ├── migrations/
    │   └── 001_initial_schema.sql
    └── seed_example.sql
```

---

## Seguridad implementada

- **Row Level Security (RLS)**: todos los recursos están protegidos a nivel de base de datos
- **Middleware**: rutas protegidas por sesión activa
- **Roles**: permisos de creación/edición basados en rol
- **Sin secrets en cliente**: `SUPABASE_SERVICE_ROLE_KEY` solo se usa server-side
- **Validación de formularios**: en cliente antes de enviar
- **Sanitización implícita**: Supabase usa queries parametrizadas (sin riesgo de SQL injection)

---

## Próximas mejoras sugeridas

- Invitación de miembros a proyectos desde la UI
- Subida de archivos adjuntos (Supabase Storage)
- Notificaciones en tiempo real (Supabase Realtime)
- Vista Kanban (drag & drop por estado)
- Exportar tareas a CSV
- Panel de administración de usuarios
