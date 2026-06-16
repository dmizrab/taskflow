-- =============================================
-- TaskFlow - Datos de ejemplo
-- Ejecutar DESPUÉS de crear los usuarios en Supabase Auth
-- =============================================

-- NOTA: Reemplaza los UUIDs con los IDs reales de tus usuarios.
-- Puedes crear los usuarios desde: Authentication > Users en Supabase Dashboard
-- Correos sugeridos: admin@empresa.com / manager@empresa.com / user1@empresa.com

-- Actualizar roles de ejemplo (ejecutar después de que los usuarios se registren)
-- UPDATE profiles SET role = 'admin', full_name = 'Ana García' WHERE email = 'admin@empresa.com';
-- UPDATE profiles SET role = 'manager', full_name = 'Carlos López' WHERE email = 'manager@empresa.com';
-- UPDATE profiles SET full_name = 'María Rodríguez' WHERE email = 'user1@empresa.com';

-- Ejemplo con UUIDs ficticios para referencia visual:
/*
INSERT INTO projects (id, name, description, color, owner_id) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Lanzamiento Producto Q3', 'Coordinación para el lanzamiento del nuevo producto en Q3 2025', '#3b82f6', '<admin_uuid>'),
  ('11111111-0000-0000-0000-000000000002', 'Rediseño Web Corporativa', 'Actualización del sitio web corporativo con nueva identidad', '#8b5cf6', '<admin_uuid>'),
  ('11111111-0000-0000-0000-000000000003', 'Onboarding Nuevos Empleados', 'Proceso de integración para nuevas incorporaciones', '#10b981', '<manager_uuid>');
*/

-- Script de seed real: ejecutar desde la aplicación o Supabase dashboard
-- después de crear usuarios reales.
SELECT 'Seed data: crea usuarios primero desde Supabase Auth, luego actualiza sus roles con UPDATE profiles SET role = ''admin'' WHERE email = ''tu@email.com''' AS instrucciones;
