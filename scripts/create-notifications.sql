-- The `notifications` table already exists (created by scripts/init-db.sql):
--   id, user_id (FK users, nullable), type, title, body, reference_id, read, created_at
-- This script only adds the columns needed for broadcast-style notifications
-- (admin/supervisor, or a specific client via the portal) on top of the
-- original per-user (technician) notification rows. Same effect as the lazy
-- migrations in lib/db.ts — safe to run repeatedly.

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;
ALTER TABLE notifications ALTER COLUMN user_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS notifications_customer_idx ON notifications(customer_id);
