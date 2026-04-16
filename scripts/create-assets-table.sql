-- ============================================
-- ASSETS / EQUIPMENT TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS assets (
  -- Basic Info
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Classification
  type VARCHAR(100) NOT NULL CHECK (type IN ('compresor', 'filtro', 'bomba', 'caldera', 'hvac', 'otro')),
  category VARCHAR(100) NOT NULL CHECK (category IN ('reactivo', 'preventivo', 'predictivo', 'instalacion', 'inspeccion', 'proyecto', 'garantia', 'otros')),
  criticality VARCHAR(50) NOT NULL CHECK (criticality IN ('critico', 'alto', 'medio', 'bajo')) DEFAULT 'medio',
  status VARCHAR(50) NOT NULL CHECK (status IN ('activo', 'inactivo', 'en_reparacion', 'retirado')) DEFAULT 'activo',
  
  -- Technical Specs
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  serial_number VARCHAR(100) UNIQUE NOT NULL,
  year_manufactured INT,
  capacity VARCHAR(100),
  power_output NUMERIC,
  power_unit VARCHAR(50),
  voltage VARCHAR(100),
  operating_pressure NUMERIC,
  pressure_unit VARCHAR(50),
  operating_temperature_min NUMERIC,
  operating_temperature_max NUMERIC,
  energy_consumption NUMERIC,
  
  -- Location
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  site_location VARCHAR(255),
  zone_within_site VARCHAR(255),
  lat FLOAT,
  lng FLOAT,
  contact_phone VARCHAR(20),
  
  -- Maintenance Recurrence Config
  has_maintenance_plan BOOLEAN DEFAULT FALSE,
  recurrence_type VARCHAR(50) CHECK (recurrence_type IN ('mensual', 'trimestral', 'semestral', 'anual', 'por_uso', 'mixta')),
  interval_months INT,
  interval_hours INT,
  interval_cycles INT,
  hours_threshold_alert INT,
  
  -- Maintenance Tracking
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  last_hours_reading INT DEFAULT 0,
  last_cycles_reading INT DEFAULT 0,
  total_maintenance_orders INT DEFAULT 0,
  
  -- Warranty & Contract
  under_warranty BOOLEAN DEFAULT FALSE,
  warranty_end_date DATE,
  maintenance_contract_id UUID,
  service_unit_price NUMERIC,
  includes_parts_in_contract BOOLEAN DEFAULT FALSE,
  
  -- Automation
  auto_generate_orders BOOLEAN DEFAULT FALSE,
  days_before_notify INT DEFAULT 7,
  default_priority VARCHAR(50) DEFAULT 'normal' CHECK (default_priority IN ('baja', 'normal', 'alta', 'urgente')),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX idx_assets_customer_id ON assets(customer_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_next_maintenance ON assets(next_maintenance_date);
CREATE INDEX idx_assets_criticality ON assets(criticality);
CREATE INDEX idx_assets_asset_id ON assets(asset_id);
