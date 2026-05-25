-- Tabla de notificaciones internas para el sistema admin/supervisor
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type        text NOT NULL,
  message     text NOT NULL,
  budget_id   uuid REFERENCES budgets(id) ON DELETE CASCADE,
  read        boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_read_idx    ON notifications(read);
CREATE INDEX IF NOT EXISTS notifications_budget_idx  ON notifications(budget_id);
CREATE INDEX IF NOT EXISTS notifications_created_idx ON notifications(created_at DESC);
