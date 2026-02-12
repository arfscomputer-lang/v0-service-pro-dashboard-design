-- Insert seed users (with bcrypt hashed passwords)
-- Passwords: admin123, super123, tecnico123, cliente123
INSERT INTO users (email, password_hash, name, role, status) VALUES
('admin@servicepro.mx', '$2b$10$YLq9Zw.Y.K8zJH7X4KxP5eZvz5Zy5vZ5vZ5vZ5vZ5vZ5vZ5vZ5vZ', 'Administrador Sistema', 'admin', 'activo'),
('supervisor@servicepro.mx', '$2b$10$2LFNZ1z4Y3Zx1Zy1Zy1Zy1Zy1Zy1Zy1Zy1Zy1Zy1Zy1Zy1Zy1Zy', 'Supervisor General', 'supervisor', 'activo'),
('tecnico@servicepro.mx', '$2b$10$5Zx1Zy5Z2Zy2Zy2Zy2Zy2Zy2Zy2Zy2Zy2Zy2Zy2Zy2Zy2Zy2Zy', 'Luis Hernandez', 'tecnico', 'activo'),
('cliente@empresaalfa.mx', '$2b$10$7Z2Zy7Z3Zy3Zy3Zy3Zy3Zy3Zy3Zy3Zy3Zy3Zy3Zy3Zy3Zy3Zy', 'Empresa Alfa', 'cliente', 'activo');

-- Get user IDs for reference
WITH user_ids AS (
  SELECT id, email, role FROM users
)

-- Insert customers
INSERT INTO customers (id, name, email, phone, address, city, lat, lng, type, nps_score, rating) VALUES
(gen_random_uuid(), 'Empresa Alfa', 'contacto@empresaalfa.mx', '+52 55 1234 5678', 'Av. Paseo de la Reforma 505', 'CDMX', 19.4370, -99.1278, 'comercial', 9, 4.8),
(gen_random_uuid(), 'Residencia Martinez', 'martinez@email.com', '+52 55 2345 6789', 'Calle Arcos 123', 'CDMX', 19.4180, -99.1470, 'residencial', 8, 4.5),
(gen_random_uuid(), 'Grupo Industrial Sur', 'info@gruposur.mx', '+52 55 3456 7890', 'Blvd Industrial 890', 'CDMX', 19.3620, -99.1550, 'industrial', 7, 4.3),
(gen_random_uuid(), 'Hotel Boutique Centro', 'gerencia@hotelboutique.mx', '+52 55 4567 8901', 'Calle Madero 456', 'CDMX', 19.4325, -99.1350, 'comercial', 9, 4.9),
(gen_random_uuid(), 'Casa Moderna', 'propietario@casamoderna.mx', '+52 55 5678 9012', 'Av. Vasco de Quiroga 789', 'CDMX', 19.3845, -99.1900, 'residencial', 8, 4.6),
(gen_random_uuid(), 'Fabrica Textil ABC', 'produccion@fabricatextil.mx', '+52 55 6789 0123', 'Av. 5 de Mayo 234', 'CDMX', 19.3500, -99.1620, 'industrial', 6, 4.0),
(gen_random_uuid(), 'Oficinas Corporativas', 'rh@corp.mx', '+52 55 7890 1234', 'Paseo de la Reforma 222', 'CDMX', 19.4370, -99.1278, 'comercial', 8, 4.4),
(gen_random_uuid(), 'Condominio Residencial', 'admin@condominio.mx', '+52 55 8901 2345', 'Av. Santa Fe 500', 'CDMX', 19.3800, -99.1900, 'residencial', 7, 4.2),
(gen_random_uuid(), 'Centro Comercial Mexicano', 'gerencia@cc-mexicano.mx', '+52 55 9012 3456', 'Blvd de los Virreyes 123', 'CDMX', 19.4130, -99.1710, 'comercial', 9, 4.7),
(gen_random_uuid(), 'Villa Privada', 'residentes@villaprivada.mx', '+52 55 0123 4567', 'Calle Roble 89', 'CDMX', 19.3560, -99.1780, 'residencial', 8, 4.5);

-- Insert suppliers
INSERT INTO suppliers (name, email, phone, api_endpoint, lead_time_days, reorder_cost) VALUES
('Proveedor Nacional', 'ventas@prov-nacional.mx', '+52 55 1111 1111', 'https://api.prov-nacional.mx/reorder', 3, 150),
('Importadora Global', 'orders@importadora-global.mx', '+52 55 2222 2222', 'https://api.importadora.mx/webhook', 7, 200),
('Distribuidor Directo', 'contacto@dist-directo.mx', '+52 55 3333 3333', 'https://api.dist-directo.mx/order', 2, 100);

-- Insert inventory items with locations
INSERT INTO inventory_items (id, sku, name, category, description, unit_cost, total_stock, min_threshold, supplier_id) VALUES
(gen_random_uuid(), 'REF-001', 'Filtro HEPA 14x20', 'filtros', 'Filtro de aire alta eficiencia 14x20 pulgadas', 45.00, 85, 20, (SELECT id FROM suppliers LIMIT 1)),
(gen_random_uuid(), 'REF-002', 'Filtro Carbon Activado', 'filtros', 'Filtro de carbón activado para aire', 28.00, 120, 30, (SELECT id FROM suppliers LIMIT 1)),
(gen_random_uuid(), 'REP-001', 'Compresor de Aire 5HP', 'refacciones', 'Compresor de aire monofasico 5 HP', 1200.00, 5, 2, (SELECT id FROM suppliers OFFSET 1 LIMIT 1)),
(gen_random_uuid(), 'REP-002', 'Motor Electrico 1HP', 'refacciones', 'Motor eléctrico trifasico 1 HP', 450.00, 12, 5, (SELECT id FROM suppliers OFFSET 1 LIMIT 1)),
(gen_random_uuid(), 'HER-001', 'Destornillador Phillips', 'herramientas', 'Juego de destornilladores phillips profesional', 25.00, 50, 10, (SELECT id FROM suppliers LIMIT 1)),
(gen_random_uuid(), 'HER-002', 'Llave Inglesa Ajustable', 'herramientas', 'Llave inglesa ajustable 12 pulgadas', 35.00, 40, 8, (SELECT id FROM suppliers LIMIT 1)),
(gen_random_uuid(), 'CON-001', 'Tubo PVC 3/4', 'consumibles', 'Tubo PVC blanco 3/4 pulgada 10 metros', 15.00, 200, 50, (SELECT id FROM suppliers LIMIT 1)),
(gen_random_uuid(), 'CON-002', 'Refrigerante R410A', 'consumibles', 'Gas refrigerante R410A 25 libras', 180.00, 15, 5, (SELECT id FROM suppliers OFFSET 2 LIMIT 1)),
(gen_random_uuid(), 'EQU-001', 'Medidor Digital Manometro', 'equipos', 'Medidor digital de presión manométrica', 250.00, 8, 2, (SELECT id FROM suppliers OFFSET 1 LIMIT 1)),
(gen_random_uuid(), 'EQU-002', 'Detector de Fugas UV', 'equipos', 'Detector de fugas con luz ultravioleta', 320.00, 6, 1, (SELECT id FROM suppliers OFFSET 2 LIMIT 1));

-- Insert inventory locations
INSERT INTO inventory_locations (item_id, location, quantity) 
SELECT id, 'almacen_central', total_stock FROM inventory_items;

-- Insert work orders (sample)
INSERT INTO work_orders (order_id, customer_id, status, priority, type, scheduled_date, scheduled_time, address, city, description, equipment_warranty) 
SELECT 
  'OT-' || LPAD(ROW_NUMBER() OVER (ORDER BY id)::TEXT, 4, '0'),
  id,
  CASE (ROW_NUMBER() OVER (ORDER BY id) % 5) WHEN 1 THEN 'pendiente' WHEN 2 THEN 'en_sitio' WHEN 3 THEN 'completada' ELSE 'asignada' END,
  CASE (ROW_NUMBER() OVER (ORDER BY id) % 3) WHEN 1 THEN 'alta' WHEN 2 THEN 'urgente' ELSE 'normal' END,
  'Mantenimiento Preventivo',
  CURRENT_DATE + (ROW_NUMBER() OVER (ORDER BY id) * 2)::INT * INTERVAL '1 day',
  '09:00:00',
  address,
  city,
  'Revisar sistemas de climatizacion y hacer limpieza general',
  TRUE
FROM customers LIMIT 10;
