-- ServicePro Database Schema
-- PostgreSQL Database for complete system

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'supervisor', 'tecnico', 'cliente')),
  status VARCHAR(50) DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo', 'suspendido')),
  customer_id UUID, -- Foreign key for 'cliente' role
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CUSTOMERS
-- ============================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address VARCHAR(500),
  city VARCHAR(100),
  lat FLOAT,
  lng FLOAT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('residencial', 'comercial', 'industrial', 'gobierno')),
  nps_score INT CHECK (nps_score >= 0 AND nps_score <= 10),
  rating FLOAT CHECK (rating >= 0 AND rating <= 5),
  total_spent FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer_tags (
  id SERIAL PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TECHNICIANS
-- ============================================

CREATE TABLE technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  specialties TEXT, -- JSON array
  certifications TEXT, -- JSON array
  average_rating FLOAT DEFAULT 0,
  total_jobs INT DEFAULT 0,
  lat FLOAT,
  lng FLOAT,
  status VARCHAR(50) DEFAULT 'disponible' CHECK (status IN ('disponible', 'en_ruta', 'en_sitio', 'ocupado', 'descuento', 'inactivo')),
  join_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE technician_availability (
  id SERIAL PRIMARY KEY,
  technician_id UUID NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  start_hour TIME NOT NULL,
  end_hour TIME NOT NULL
);

-- ============================================
-- WORK ORDERS
-- ============================================

CREATE TABLE work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(20) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  technician_id UUID REFERENCES technicians(id),
  status VARCHAR(50) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'asignada', 'en_ruta', 'en_sitio', 'completada', 'cancelada')),
  priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('baja', 'normal', 'alta', 'urgente')),
  type VARCHAR(100) NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  completed_date TIMESTAMP,
  address VARCHAR(500) NOT NULL,
  city VARCHAR(100),
  description TEXT,
  equipment_warranty BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE work_order_checklist (
  id SERIAL PRIMARY KEY,
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  item VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE
);

-- ============================================
-- INVENTORY
-- ============================================

CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  unit_cost FLOAT NOT NULL,
  total_stock INT DEFAULT 0,
  min_threshold INT DEFAULT 10,
  supplier_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_locations (
  id SERIAL PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  location VARCHAR(100) NOT NULL, -- almacen_central, vehiculo_1, sucursal_2, etc
  quantity INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_movements (
  id SERIAL PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES inventory_items(id),
  type VARCHAR(50) NOT NULL CHECK (type IN ('entrada', 'salida', 'transferencia', 'devolucion', 'ajuste')),
  quantity INT NOT NULL,
  from_location VARCHAR(100),
  to_location VARCHAR(100),
  reference_id UUID, -- work_order_id if applicable
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  api_endpoint VARCHAR(500),
  api_key VARCHAR(255),
  lead_time_days INT DEFAULT 5,
  reorder_cost FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CUSTOMER INTERACTIONS
-- ============================================

CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('llamada', 'email', 'visita', 'chat', 'formulario')),
  subject VARCHAR(255),
  description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  reference_id UUID,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_technicians_user_id ON technicians(user_id);
CREATE INDEX idx_technicians_email ON technicians(email);
CREATE INDEX idx_technicians_status ON technicians(status);
CREATE INDEX idx_work_orders_customer_id ON work_orders(customer_id);
CREATE INDEX idx_work_orders_technician_id ON work_orders(technician_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_order_id ON work_orders(order_id);
CREATE INDEX idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_stock_movements_item_id ON stock_movements(item_id);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX idx_interactions_customer_id ON interactions(customer_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_technicians_updated_at BEFORE UPDATE ON technicians
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON work_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
