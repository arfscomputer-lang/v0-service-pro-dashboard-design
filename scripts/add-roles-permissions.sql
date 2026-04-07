-- Add Roles and Permissions Management Tables

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(20) DEFAULT '#3b82f6',
  is_system BOOLEAN DEFAULT FALSE, -- System roles cannot be deleted
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- e.g., 'ordenes', 'usuarios', 'reportes', 'configuracion'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role_id, permission_id)
);

-- Insert default system roles
INSERT INTO roles (id, name, description, color, is_system) VALUES
  (gen_random_uuid(), 'Administrador', 'Acceso total al sistema', '#ef4444', TRUE),
  (gen_random_uuid(), 'Supervisor', 'Gestión de órdenes y técnicos', '#f97316', TRUE),
  (gen_random_uuid(), 'Técnico', 'Ejecución de órdenes', '#06b6d4', TRUE),
  (gen_random_uuid(), 'Cliente', 'Visualización de órdenes propias', '#8b5cf6', TRUE)
ON CONFLICT DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (name, description, category) VALUES
  ('ver_ordenes', 'Ver órdenes de trabajo', 'ordenes'),
  ('crear_ordenes', 'Crear órdenes de trabajo', 'ordenes'),
  ('editar_ordenes', 'Editar órdenes de trabajo', 'ordenes'),
  ('eliminar_ordenes', 'Eliminar órdenes de trabajo', 'ordenes'),
  ('asignar_tecnico', 'Asignar técnicos a órdenes', 'ordenes'),
  
  ('ver_usuarios', 'Ver listado de usuarios', 'usuarios'),
  ('crear_usuarios', 'Crear nuevos usuarios', 'usuarios'),
  ('editar_usuarios', 'Editar usuarios', 'usuarios'),
  ('eliminar_usuarios', 'Eliminar usuarios', 'usuarios'),
  
  ('ver_tecnicos', 'Ver técnicos', 'tecnicos'),
  ('crear_tecnicos', 'Crear técnicos', 'tecnicos'),
  ('editar_tecnicos', 'Editar técnicos', 'tecnicos'),
  ('eliminar_tecnicos', 'Eliminar técnicos', 'tecnicos'),
  
  ('ver_clientes', 'Ver clientes', 'clientes'),
  ('crear_clientes', 'Crear clientes', 'clientes'),
  ('editar_clientes', 'Editar clientes', 'clientes'),
  ('eliminar_clientes', 'Eliminar clientes', 'clientes'),
  
  ('ver_reportes', 'Ver reportes y analítica', 'reportes'),
  ('exportar_reportes', 'Exportar reportes', 'reportes'),
  
  ('gestionar_roles', 'Gestionar roles y permisos', 'configuracion'),
  ('ver_configuracion', 'Acceder a configuración del sistema', 'configuracion')
ON CONFLICT DO NOTHING;
