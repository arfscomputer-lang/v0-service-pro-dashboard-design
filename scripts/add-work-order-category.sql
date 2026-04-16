-- Add work order category column
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Otros' CHECK (category IN (
  'Reactivo',
  'Preventivo',
  'Predictivo',
  'Instalación / Puesta en Marcha',
  'Inspección / Auditoría',
  'Proyecto / Mejora',
  'Garantía',
  'Otros'
));

-- Create index for faster queries by category
CREATE INDEX IF NOT EXISTS idx_work_orders_category ON work_orders(category);
