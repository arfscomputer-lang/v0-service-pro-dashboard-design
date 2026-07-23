-- Tabla de notificaciones internas.
-- customer_id NULL => notificación para admin/supervisor; customer_id seteado => para ese cliente (portal)
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type        text NOT NULL,
  message     text NOT NULL,
  budget_id   uuid REFERENCES budgets(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  read        boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_read_idx     ON notifications(read);
CREATE INDEX IF NOT EXISTS notifications_budget_idx   ON notifications(budget_id);
CREATE INDEX IF NOT EXISTS notifications_customer_idx ON notifications(customer_id);
CREATE INDEX IF NOT EXISTS notifications_created_idx  ON notifications(created_at DESC);
