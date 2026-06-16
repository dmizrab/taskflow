-- =============================================
-- Script de datos de ejemplo
-- Ejecutar DESPUÉS de crear los usuarios manualmente en Supabase Auth
-- y DESPUÉS de correr 001_initial_schema.sql
-- =============================================

-- PASO 1: Crea estos usuarios desde Supabase Dashboard > Authentication > Users:
--   admin@empresa.com       / contraseña: Admin1234
--   manager@empresa.com     / contraseña: Manager1234
--   maria@empresa.com       / contraseña: User1234
--   carlos@empresa.com      / contraseña: User1234

-- PASO 2: Actualiza los roles (los perfiles se crean automáticamente al registrarse)
-- Reemplaza los emails con los que usaste

UPDATE profiles SET role = 'admin',   full_name = 'Ana García (Admin)'   WHERE email = 'admin@empresa.com';
UPDATE profiles SET role = 'manager', full_name = 'Carlos López'          WHERE email = 'manager@empresa.com';
UPDATE profiles SET role = 'member',  full_name = 'María Rodríguez'       WHERE email = 'maria@empresa.com';
UPDATE profiles SET role = 'member',  full_name = 'Carlos Jiménez'        WHERE email = 'carlos@empresa.com';

-- PASO 3: Crear proyectos de ejemplo
-- (Reemplaza <admin_id> con el UUID real del admin)

DO $$
DECLARE
  admin_id UUID;
  manager_id UUID;
  maria_id UUID;
  carlos_id UUID;
  proj1_id UUID;
  proj2_id UUID;
  proj3_id UUID;
BEGIN
  SELECT id INTO admin_id FROM profiles WHERE email = 'admin@empresa.com';
  SELECT id INTO manager_id FROM profiles WHERE email = 'manager@empresa.com';
  SELECT id INTO maria_id FROM profiles WHERE email = 'maria@empresa.com';
  SELECT id INTO carlos_id FROM profiles WHERE email = 'carlos@empresa.com';

  -- Proyectos
  proj1_id := gen_random_uuid();
  proj2_id := gen_random_uuid();
  proj3_id := gen_random_uuid();

  INSERT INTO projects (id, name, description, color, owner_id) VALUES
    (proj1_id, 'Lanzamiento Producto Q3', 'Coordinación para el lanzamiento del nuevo producto en Q3', '#3b82f6', admin_id),
    (proj2_id, 'Rediseño Web Corporativa', 'Actualización del sitio web con nueva identidad visual', '#8b5cf6', manager_id),
    (proj3_id, 'Onboarding Nuevos Empleados', 'Proceso de integración para nuevas incorporaciones', '#10b981', admin_id);

  -- Miembros de proyectos
  INSERT INTO project_members (project_id, user_id, role) VALUES
    (proj1_id, admin_id, 'admin'),
    (proj1_id, manager_id, 'manager'),
    (proj1_id, maria_id, 'member'),
    (proj1_id, carlos_id, 'member'),
    (proj2_id, manager_id, 'admin'),
    (proj2_id, maria_id, 'member'),
    (proj3_id, admin_id, 'admin'),
    (proj3_id, carlos_id, 'member');

  -- Tareas proyecto 1
  INSERT INTO tasks (project_id, name, description, assignee_id, status, priority, due_date, position, created_by) VALUES
    (proj1_id, 'Definir estrategia de lanzamiento', 'Documento con plan de go-to-market', manager_id, 'completed', 'high', CURRENT_DATE - 5, 0, admin_id),
    (proj1_id, 'Crear materiales de marketing', 'Brochures, banners y posts para redes', maria_id, 'in_progress', 'high', CURRENT_DATE + 7, 1, manager_id),
    (proj1_id, 'Configurar campaña de email', 'Configurar Mailchimp para el lanzamiento', carlos_id, 'pending', 'medium', CURRENT_DATE + 10, 2, manager_id),
    (proj1_id, 'Revisar pricing final', NULL, 'blocked', 'urgent', CURRENT_DATE - 2, 3, admin_id),
    (proj1_id, 'Preparar demo para clientes', 'Video demo de 3 minutos del producto', maria_id, 'in_progress', 'high', CURRENT_DATE + 3, 4, manager_id),
    (proj1_id, 'Coordinar con equipo de ventas', NULL, 'pending', 'medium', CURRENT_DATE + 14, 5, admin_id);

  -- Tareas proyecto 2
  INSERT INTO tasks (project_id, name, description, assignee_id, status, priority, due_date, position, created_by) VALUES
    (proj2_id, 'Auditoría del sitio actual', 'Analizar analytics y feedback de usuarios', maria_id, 'completed', 'medium', CURRENT_DATE - 10, 0, manager_id),
    (proj2_id, 'Diseñar wireframes', 'Wireframes para homepage, about y contacto', maria_id, 'completed', 'high', CURRENT_DATE - 3, 1, manager_id),
    (proj2_id, 'Desarrollar nuevo frontend', 'Implementar diseño en Next.js', carlos_id, 'in_progress', 'high', CURRENT_DATE + 14, 2, manager_id),
    (proj2_id, 'Migrar contenido', 'Pasar contenido actual al nuevo CMS', NULL, 'pending', 'low', CURRENT_DATE + 20, 3, manager_id),
    (proj2_id, 'Revisión SEO', 'Optimizar metadatos y estructura', NULL, 'blocked', 'medium', CURRENT_DATE - 1, 4, manager_id);

  -- Tareas proyecto 3
  INSERT INTO tasks (project_id, name, description, assignee_id, status, priority, due_date, position, created_by) VALUES
    (proj3_id, 'Crear manual de bienvenida', 'PDF con cultura, procesos y herramientas', carlos_id, 'in_progress', 'medium', CURRENT_DATE + 5, 0, admin_id),
    (proj3_id, 'Configurar accesos de sistema', 'Crear cuentas en todas las herramientas', carlos_id, 'pending', 'high', CURRENT_DATE + 2, 1, admin_id),
    (proj3_id, 'Agendar reunión introductoria', 'Meet de 1h con todo el equipo', admin_id, 'completed', 'medium', CURRENT_DATE - 1, 2, admin_id);

  RAISE NOTICE 'Seed completado correctamente.';
END;
$$;
