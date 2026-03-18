-- ============================================================
--  CCTV Budget Pro — Esquema SQL (PostgreSQL / Neon)
--  Provisión de materiales e instalación de sistemas CCTV
-- ============================================================

-- ─── Extensiones ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Tipos ENUM ──────────────────────────────────────────────

CREATE TYPE budget_status AS ENUM (
  'borrador',
  'enviado',
  'aprobado',
  'rechazado',
  'vencido',
  'facturado'
);

CREATE TYPE section_type AS ENUM (
  'equipos',
  'materiales',
  'mano_de_obra'
);

CREATE TYPE unit_type AS ENUM (
  'Und', 'Gbl', 'Mt', 'Ml', 'Kg', 'Rollo', 'Kit', 'Hr', 'Día'
);

CREATE TYPE currency_code AS ENUM (
  'USD', 'EUR', 'VES', 'COP', 'BRL'
);

-- ─── Tabla: empresas (datos del proveedor) ───────────────────

CREATE TABLE IF NOT EXISTS companies (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(200) NOT NULL,
  rif           VARCHAR(30),
  address       TEXT,
  phone         VARCHAR(40),
  email         VARCHAR(120),
  website       VARCHAR(200),
  logo_url      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE companies IS 'Empresas proveedoras que emiten presupuestos';

-- ─── Tabla: usuarios ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS budget_users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email         VARCHAR(120) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     VARCHAR(150) NOT NULL,
  role          VARCHAR(30) NOT NULL DEFAULT 'vendedor'
                  CHECK (role IN ('admin', 'vendedor', 'tecnico', 'viewer')),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budget_users_company ON budget_users(company_id);
CREATE INDEX IF NOT EXISTS idx_budget_users_email ON budget_users(email);

COMMENT ON TABLE budget_users IS 'Usuarios del sistema de presupuestos con roles';

-- ─── Tabla: clientes ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS budget_clients (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name          VARCHAR(200) NOT NULL,
  rif           VARCHAR(30),
  contact_name  VARCHAR(150),
  phone         VARCHAR(40),
  email         VARCHAR(120),
  address       TEXT,
  city          VARCHAR(100),
  state         VARCHAR(100),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budget_clients_company ON budget_clients(company_id);
CREATE INDEX IF NOT EXISTS idx_budget_clients_name ON budget_clients(company_id, name);

COMMENT ON TABLE budget_clients IS 'Clientes a quienes se emiten presupuestos';

-- ─── Tabla: catálogo de productos/servicios ──────────────────

CREATE TABLE IF NOT EXISTS catalog_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  section       section_type NOT NULL,
  sku           VARCHAR(50),
  description   VARCHAR(300) NOT NULL,
  unit          unit_type NOT NULL DEFAULT 'Und',
  default_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  brand         VARCHAR(100),
  model         VARCHAR(100),
  specs         JSONB DEFAULT '{}',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catalog_company_section ON catalog_items(company_id, section);
CREATE INDEX IF NOT EXISTS idx_catalog_sku ON catalog_items(company_id, sku) WHERE sku IS NOT NULL;

COMMENT ON TABLE catalog_items IS 'Catálogo maestro de productos y servicios reutilizables';
COMMENT ON COLUMN catalog_items.specs IS 'Especificaciones técnicas en formato JSON (resolución, IR, etc.)';

-- ─── Tabla: presupuestos (cabecera) ──────────────────────────

CREATE TABLE IF NOT EXISTS budgets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id       UUID REFERENCES budget_clients(id) ON DELETE SET NULL,
  created_by      UUID REFERENCES budget_users(id) ON DELETE SET NULL,

  -- Identificación
  budget_number   VARCHAR(30) NOT NULL,
  revision        INT NOT NULL DEFAULT 1,

  -- Datos del proyecto
  project_name    VARCHAR(250),
  project_location TEXT,
  description     TEXT,

  -- Fechas y estado
  issue_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  validity_days   INT NOT NULL DEFAULT 15,
  expiry_date     DATE GENERATED ALWAYS AS (issue_date + validity_days * INTERVAL '1 day') STORED,
  status          budget_status NOT NULL DEFAULT 'borrador',

  -- Moneda e impuesto
  currency        currency_code NOT NULL DEFAULT 'USD',
  tax_label       VARCHAR(30) NOT NULL DEFAULT 'IVA',
  tax_rate        NUMERIC(5,2) NOT NULL DEFAULT 16.00,

  -- Totales (calculados por trigger)
  subtotal_equipment  NUMERIC(14,2) NOT NULL DEFAULT 0,
  subtotal_materials  NUMERIC(14,2) NOT NULL DEFAULT 0,
  subtotal_labor      NUMERIC(14,2) NOT NULL DEFAULT 0,
  subtotal            NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_amount          NUMERIC(14,2) NOT NULL DEFAULT 0,
  total               NUMERIC(14,2) NOT NULL DEFAULT 0,

  -- Descuento global opcional
  discount_pct    NUMERIC(5,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0,

  notes           TEXT,
  internal_notes  TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_budgets_number ON budgets(company_id, budget_number, revision);
CREATE INDEX IF NOT EXISTS idx_budgets_client ON budgets(client_id);
CREATE INDEX IF NOT EXISTS idx_budgets_status ON budgets(company_id, status);
CREATE INDEX IF NOT EXISTS idx_budgets_date ON budgets(company_id, issue_date DESC);

COMMENT ON TABLE budgets IS 'Presupuestos de provisión e instalación CCTV';
COMMENT ON COLUMN budgets.revision IS 'Número de revisión para versionar un mismo presupuesto';
COMMENT ON COLUMN budgets.expiry_date IS 'Fecha de vencimiento calculada automáticamente';

-- ─── Tabla: ítems del presupuesto ────────────────────────────

CREATE TABLE IF NOT EXISTS budget_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id     UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  catalog_id    UUID REFERENCES catalog_items(id) ON DELETE SET NULL,

  section       section_type NOT NULL,
  sort_order    INT NOT NULL DEFAULT 0,

  description   VARCHAR(300) NOT NULL,
  unit          unit_type NOT NULL DEFAULT 'Und',
  quantity      NUMERIC(10,2) NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  unit_price    NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  line_total    NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,

  brand         VARCHAR(100),
  model         VARCHAR(100),
  specs         JSONB DEFAULT '{}',
  notes         VARCHAR(500),

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_items_budget ON budget_items(budget_id);
CREATE INDEX IF NOT EXISTS idx_items_section ON budget_items(budget_id, section, sort_order);

COMMENT ON TABLE budget_items IS 'Líneas de detalle de cada presupuesto';
COMMENT ON COLUMN budget_items.line_total IS 'Total de línea calculado automáticamente (qty × precio)';

-- ─── Tabla: condiciones comerciales ──────────────────────────

CREATE TABLE IF NOT EXISTS budget_conditions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id     UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  sort_order    INT NOT NULL DEFAULT 0,
  condition_text TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conditions_budget ON budget_conditions(budget_id, sort_order);

COMMENT ON TABLE budget_conditions IS 'Condiciones comerciales y notas del presupuesto';

-- ─── Tabla: plantillas de condiciones reutilizables ──────────

CREATE TABLE IF NOT EXISTS condition_templates (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,
  conditions    TEXT[] NOT NULL DEFAULT '{}',
  is_default    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cond_templates_company ON condition_templates(company_id);

COMMENT ON TABLE condition_templates IS 'Plantillas reutilizables de condiciones comerciales';

-- ─── Tabla: historial de estados ─────────────────────────────

CREATE TABLE IF NOT EXISTS budget_status_history (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id     UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  old_status    budget_status,
  new_status    budget_status NOT NULL,
  changed_by    UUID REFERENCES budget_users(id) ON DELETE SET NULL,
  notes         TEXT,
  changed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_history_budget ON budget_status_history(budget_id, changed_at DESC);

COMMENT ON TABLE budget_status_history IS 'Auditoría de cambios de estado del presupuesto';

-- ═════════════════════════════════════════════════════════════
-- FUNCIONES Y TRIGGERS
-- ═════════════════════════════════════════════════════════════

-- ─── Función: recalcular totales del presupuesto ─────────────

CREATE OR REPLACE FUNCTION fn_recalc_budget_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_sub_equip   NUMERIC(14,2);
  v_sub_mat     NUMERIC(14,2);
  v_sub_labor   NUMERIC(14,2);
  v_subtotal    NUMERIC(14,2);
  v_discount    NUMERIC(14,2);
  v_tax         NUMERIC(14,2);
  v_total       NUMERIC(14,2);
  v_budget_id   UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_budget_id := OLD.budget_id;
  ELSE
    v_budget_id := NEW.budget_id;
  END IF;

  SELECT COALESCE(SUM(quantity * unit_price), 0)
    INTO v_sub_equip
    FROM budget_items WHERE budget_id = v_budget_id AND section = 'equipos';

  SELECT COALESCE(SUM(quantity * unit_price), 0)
    INTO v_sub_mat
    FROM budget_items WHERE budget_id = v_budget_id AND section = 'materiales';

  SELECT COALESCE(SUM(quantity * unit_price), 0)
    INTO v_sub_labor
    FROM budget_items WHERE budget_id = v_budget_id AND section = 'mano_de_obra';

  v_subtotal := v_sub_equip + v_sub_mat + v_sub_labor;

  SELECT ROUND(v_subtotal * discount_pct / 100, 2),
         ROUND((v_subtotal - ROUND(v_subtotal * discount_pct / 100, 2)) * tax_rate / 100, 2)
    INTO v_discount, v_tax
    FROM budgets WHERE id = v_budget_id;

  v_total := v_subtotal - v_discount + v_tax;

  UPDATE budgets SET
    subtotal_equipment = v_sub_equip,
    subtotal_materials = v_sub_mat,
    subtotal_labor     = v_sub_labor,
    subtotal           = v_subtotal,
    discount_amount    = v_discount,
    tax_amount         = v_tax,
    total              = v_total,
    updated_at         = NOW()
  WHERE id = v_budget_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recalc_on_item_change ON budget_items;
CREATE TRIGGER trg_recalc_on_item_change
AFTER INSERT OR UPDATE OR DELETE ON budget_items
FOR EACH ROW EXECUTE FUNCTION fn_recalc_budget_totals();

-- ─── Función: registrar cambio de estado ─────────────────────

CREATE OR REPLACE FUNCTION fn_log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO budget_status_history (budget_id, old_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_status_change ON budgets;
CREATE TRIGGER trg_log_status_change
AFTER UPDATE ON budgets
FOR EACH ROW EXECUTE FUNCTION fn_log_status_change();

-- ─── Función: updated_at automático ──────────────────────────

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_companies_updated ON companies;
DROP TRIGGER IF EXISTS trg_budget_users_updated ON budget_users;
DROP TRIGGER IF EXISTS trg_budget_clients_updated ON budget_clients;
DROP TRIGGER IF EXISTS trg_catalog_updated ON catalog_items;
DROP TRIGGER IF EXISTS trg_items_updated ON budget_items;

CREATE TRIGGER trg_companies_updated BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_budget_users_updated BEFORE UPDATE ON budget_users FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_budget_clients_updated BEFORE UPDATE ON budget_clients FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_catalog_updated BEFORE UPDATE ON catalog_items FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_items_updated BEFORE UPDATE ON budget_items FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ─── Función: generar número secuencial de presupuesto ───────

CREATE OR REPLACE FUNCTION fn_next_budget_number(p_company_id UUID)
RETURNS VARCHAR(30) AS $$
DECLARE
  v_year   TEXT := TO_CHAR(CURRENT_DATE, 'YYYY');
  v_count  INT;
  v_number VARCHAR(30);
BEGIN
  SELECT COUNT(*) + 1
    INTO v_count
    FROM budgets
   WHERE company_id = p_company_id
     AND EXTRACT(YEAR FROM issue_date) = EXTRACT(YEAR FROM CURRENT_DATE);

  v_number := 'CCTV-' || v_year || '-' || LPAD(v_count::TEXT, 4, '0');
  RETURN v_number;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_next_budget_number IS 'Genera número correlativo: CCTV-2026-0001';

-- ═════════════════════════════════════════════════════════════
-- VISTAS
-- ═════════════════════════════════════════════════════════════

-- ─── Vista: resumen de presupuestos ──────────────────────────

CREATE OR REPLACE VIEW v_budget_summary AS
SELECT
  b.id,
  b.budget_number,
  b.revision,
  b.project_name,
  b.issue_date,
  b.expiry_date,
  b.status,
  b.currency,
  b.subtotal,
  b.tax_amount,
  b.discount_amount,
  b.total,
  c.name                 AS client_name,
  c.phone                AS client_phone,
  co.name                AS company_name,
  u.full_name            AS created_by_name,
  (SELECT COUNT(*) FROM budget_items bi WHERE bi.budget_id = b.id)  AS item_count,
  CASE
    WHEN b.status = 'enviado' AND b.expiry_date < CURRENT_DATE THEN TRUE
    ELSE FALSE
  END                    AS is_overdue
FROM budgets b
LEFT JOIN budget_clients c  ON c.id  = b.client_id
LEFT JOIN companies co ON co.id = b.company_id
LEFT JOIN budget_users u  ON u.id  = b.created_by
ORDER BY b.issue_date DESC, b.budget_number DESC;

COMMENT ON VIEW v_budget_summary IS 'Vista resumen para listado de presupuestos';

-- ─── Vista: detalle completo de ítems por presupuesto ────────

CREATE OR REPLACE VIEW v_budget_detail AS
SELECT
  bi.budget_id,
  b.budget_number,
  bi.section,
  bi.sort_order,
  bi.description,
  bi.unit::TEXT,
  bi.quantity,
  bi.unit_price,
  bi.line_total,
  bi.brand,
  bi.model,
  bi.notes
FROM budget_items bi
JOIN budgets b ON b.id = bi.budget_id
ORDER BY bi.budget_id, bi.section, bi.sort_order;

-- ─── Vista: dashboard de métricas ────────────────────────────

CREATE OR REPLACE VIEW v_dashboard_metrics AS
SELECT
  company_id,
  COUNT(*)                                                     AS total_budgets,
  COUNT(*) FILTER (WHERE status = 'borrador')                  AS drafts,
  COUNT(*) FILTER (WHERE status = 'enviado')                   AS sent,
  COUNT(*) FILTER (WHERE status = 'aprobado')                  AS approved,
  COUNT(*) FILTER (WHERE status = 'rechazado')                 AS rejected,
  COUNT(*) FILTER (WHERE status = 'facturado')                 AS invoiced,
  COALESCE(SUM(total) FILTER (WHERE status = 'aprobado'), 0)   AS approved_total,
  COALESCE(SUM(total) FILTER (WHERE status = 'enviado'), 0)    AS pending_total,
  COALESCE(AVG(total), 0)                                      AS avg_budget_value,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'aprobado')::NUMERIC
    / NULLIF(COUNT(*) FILTER (WHERE status IN ('aprobado','rechazado')), 0) * 100
  , 1)                                                         AS approval_rate_pct
FROM budgets
GROUP BY company_id;

COMMENT ON VIEW v_dashboard_metrics IS 'Métricas por empresa para dashboard principal';
