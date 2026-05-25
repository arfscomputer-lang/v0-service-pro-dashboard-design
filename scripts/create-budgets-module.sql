-- Módulo de Presupuestos
-- Ejecutar en la base de datos Neon una sola vez

CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  rubro TEXT NOT NULL DEFAULT 'CCTV',
  status TEXT NOT NULL DEFAULT 'borrador',   -- borrador | enviado | aceptado | rechazado
  numero TEXT NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  vigencia TEXT NOT NULL DEFAULT '15 días',
  company_data JSONB NOT NULL DEFAULT '{}',
  sections JSONB NOT NULL DEFAULT '{}',      -- { equipos:[], materiales:[], mano_de_obra:[] }
  currency TEXT NOT NULL DEFAULT 'USD',
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 16,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  conditions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budget_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rubro TEXT NOT NULL DEFAULT 'CCTV',
  name TEXT NOT NULL,
  sections JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budget_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  author TEXT NOT NULL DEFAULT 'Cliente',
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS budgets_customer_id_idx ON budgets(customer_id);
CREATE INDEX IF NOT EXISTS budgets_status_idx ON budgets(status);
CREATE INDEX IF NOT EXISTS budgets_rubro_idx ON budgets(rubro);
CREATE INDEX IF NOT EXISTS budget_comments_budget_id_idx ON budget_comments(budget_id);
