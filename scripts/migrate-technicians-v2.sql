-- Allow user_id to be nullable temporarily
ALTER TABLE technicians ALTER COLUMN user_id DROP NOT NULL;

-- Add missing columns to technicians table
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS role VARCHAR(255);
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS address VARCHAR(500);
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS avg_response_min INTEGER DEFAULT 30;
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS initials VARCHAR(10);

-- Clear existing data to avoid duplicates
DELETE FROM technician_availability;
DELETE FROM technicians;

-- Insert seed technicians
INSERT INTO technicians (id, name, initials, email, phone, role, specialties, certifications, status, average_rating, total_jobs, avg_response_min, join_date, lat, lng, address)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Luis Hernandez', 'LH', 'luis.hernandez@servicepro.mx', '+52 55 1234 5678', 'Especialista HVAC Senior',
   'HVAC,Gas',
   '[{"name":"Certificacion HVAC Nivel III","issuer":"CONOCER","expires":"2027-03-15"},{"name":"Manejo de Refrigerantes","issuer":"EPA Mexico","expires":"2026-11-01"}]',
   'ocupado', 4.8, 347, 22, '2021-06-10', 19.4326, -99.1332, 'Col. Centro, CDMX'),

  ('a0000000-0000-0000-0000-000000000002', 'Ana Torres', 'AT', 'ana.torres@servicepro.mx', '+52 55 9876 5432', 'Electricista Senior',
   'Electricidad,Solar',
   '[{"name":"Electricista Certificado NOM-001","issuer":"CONOCER","expires":"2027-01-20"},{"name":"Instalacion Solar Fotovoltaica","issuer":"ANCE","expires":"2026-09-30"}]',
   'ocupado', 4.9, 289, 18, '2022-01-15', 19.4205, -99.1684, 'Col. Roma, CDMX'),

  ('a0000000-0000-0000-0000-000000000003', 'Pedro Sanchez', 'PS', 'pedro.sanchez@servicepro.mx', '+52 55 5555 1234', 'Plomero Certificado',
   'Plomeria,Gas',
   '[{"name":"Plomeria Industrial","issuer":"CMIC","expires":"2026-07-12"}]',
   'disponible', 4.5, 215, 28, '2022-08-20', 19.3910, -99.1564, 'Col. Del Valle, CDMX'),

  ('a0000000-0000-0000-0000-000000000004', 'Sofia Morales', 'SM', 'sofia.morales@servicepro.mx', '+52 55 4321 8765', 'Inspectora de Gas',
   'Gas,HVAC',
   '[{"name":"Inspeccion de Gas NOM-002","issuer":"CRE","expires":"2026-12-01"},{"name":"Seguridad Industrial","issuer":"STPS","expires":"2027-02-28"}]',
   'disponible', 4.7, 178, 20, '2023-03-01', 19.4370, -99.1430, 'Col. Juarez, CDMX'),

  ('a0000000-0000-0000-0000-000000000005', 'Carlos Vega', 'CV', 'carlos.vega@servicepro.mx', '+52 55 6789 0123', 'Tecnico en Paneles Solares',
   'Solar,Electricidad',
   '[{"name":"Instalador Solar Certificado","issuer":"ANCE","expires":"2027-05-15"}]',
   'ocupado', 4.6, 132, 25, '2023-09-12', 19.4450, -99.1200, 'Col. Tepeyac, CDMX'),

  ('a0000000-0000-0000-0000-000000000006', 'Miguel Flores', 'MF', 'miguel.flores@servicepro.mx', '+52 55 3456 7890', 'Mantenimiento General',
   'General,Plomeria',
   '[{"name":"Mantenimiento Edificios","issuer":"CMIC","expires":"2026-08-20"}]',
   'disponible', 4.3, 201, 32, '2021-11-05', 19.4100, -99.1700, 'Col. Narvarte, CDMX'),

  ('a0000000-0000-0000-0000-000000000007', 'Gabriela Rios', 'GR', 'gabriela.rios@servicepro.mx', '+52 55 2345 6789', 'Especialista HVAC',
   'HVAC',
   '[{"name":"Certificacion HVAC Nivel II","issuer":"CONOCER","expires":"2027-04-01"}]',
   'desconectado', 4.4, 98, 24, '2024-02-18', 19.4260, -99.1900, 'Col. Tacubaya, CDMX'),

  ('a0000000-0000-0000-0000-000000000008', 'Ricardo Mendoza', 'RM', 'ricardo.mendoza@servicepro.mx', '+52 55 8901 2345', 'Electricista Junior',
   'Electricidad,General',
   '[{"name":"Electricista Basico","issuer":"CONOCER","expires":"2026-06-15"}]',
   'en_viaje', 4.1, 67, 35, '2024-08-01', 19.4500, -99.1100, 'Col. Lindavista, CDMX');

-- Insert availability for each technician
-- day_of_week: 1=Lun, 2=Mar, 3=Mie, 4=Jue, 5=Vie, 6=Sab

-- Luis Hernandez: Lun-Vie 7-17
INSERT INTO technician_availability (technician_id, day_of_week, start_hour, end_hour) VALUES
  ('a0000000-0000-0000-0000-000000000001', 1, '07:00', '17:00'),
  ('a0000000-0000-0000-0000-000000000001', 2, '07:00', '17:00'),
  ('a0000000-0000-0000-0000-000000000001', 3, '07:00', '17:00'),
  ('a0000000-0000-0000-0000-000000000001', 4, '07:00', '17:00'),
  ('a0000000-0000-0000-0000-000000000001', 5, '07:00', '17:00');

-- Ana Torres: Lun-Vie 8-18
INSERT INTO technician_availability (technician_id, day_of_week, start_hour, end_hour) VALUES
  ('a0000000-0000-0000-0000-000000000002', 1, '08:00', '18:00'),
  ('a0000000-0000-0000-0000-000000000002', 2, '08:00', '18:00'),
  ('a0000000-0000-0000-0000-000000000002', 3, '08:00', '18:00'),
  ('a0000000-0000-0000-0000-000000000002', 4, '08:00', '18:00'),
  ('a0000000-0000-0000-0000-000000000002', 5, '08:00', '18:00');

-- Pedro Sanchez: Lun-Sab 7-16
INSERT INTO technician_availability (technician_id, day_of_week, start_hour, end_hour) VALUES
  ('a0000000-0000-0000-0000-000000000003', 1, '07:00', '16:00'),
  ('a0000000-0000-0000-0000-000000000003', 2, '07:00', '16:00'),
  ('a0000000-0000-0000-0000-000000000003', 3, '07:00', '16:00'),
  ('a0000000-0000-0000-0000-000000000003', 4, '07:00', '16:00'),
  ('a0000000-0000-0000-0000-000000000003', 5, '07:00', '16:00'),
  ('a0000000-0000-0000-0000-000000000003', 6, '07:00', '16:00');

-- Sofia Morales: Lun-Vie 8-17
INSERT INTO technician_availability (technician_id, day_of_week, start_hour, end_hour) VALUES
  ('a0000000-0000-0000-0000-000000000004', 1, '08:00', '17:00'),
  ('a0000000-0000-0000-0000-000000000004', 2, '08:00', '17:00'),
  ('a0000000-0000-0000-0000-000000000004', 3, '08:00', '17:00'),
  ('a0000000-0000-0000-0000-000000000004', 4, '08:00', '17:00'),
  ('a0000000-0000-0000-0000-000000000004', 5, '08:00', '17:00');

-- Carlos Vega: Lun-Vie 7-16
INSERT INTO technician_availability (technician_id, day_of_week, start_hour, end_hour) VALUES
  ('a0000000-0000-0000-0000-000000000005', 1, '07:00', '16:00'),
  ('a0000000-0000-0000-0000-000000000005', 2, '07:00', '16:00'),
  ('a0000000-0000-0000-0000-000000000005', 3, '07:00', '16:00'),
  ('a0000000-0000-0000-0000-000000000005', 4, '07:00', '16:00'),
  ('a0000000-0000-0000-0000-000000000005', 5, '07:00', '16:00');

-- Miguel Flores: Lun-Sab 6-15
INSERT INTO technician_availability (technician_id, day_of_week, start_hour, end_hour) VALUES
  ('a0000000-0000-0000-0000-000000000006', 1, '06:00', '15:00'),
  ('a0000000-0000-0000-0000-000000000006', 2, '06:00', '15:00'),
  ('a0000000-0000-0000-0000-000000000006', 3, '06:00', '15:00'),
  ('a0000000-0000-0000-0000-000000000006', 4, '06:00', '15:00'),
  ('a0000000-0000-0000-0000-000000000006', 5, '06:00', '15:00'),
  ('a0000000-0000-0000-0000-000000000006', 6, '06:00', '15:00');

-- Gabriela Rios: Lun-Vie 8-17
INSERT INTO technician_availability (technician_id, day_of_week, start_hour, end_hour) VALUES
  ('a0000000-0000-0000-0000-000000000007', 1, '08:00', '17:00'),
  ('a0000000-0000-0000-0000-000000000007', 2, '08:00', '17:00'),
  ('a0000000-0000-0000-0000-000000000007', 3, '08:00', '17:00'),
  ('a0000000-0000-0000-0000-000000000007', 4, '08:00', '17:00'),
  ('a0000000-0000-0000-0000-000000000007', 5, '08:00', '17:00');

-- Ricardo Mendoza: Lun-Vie 8-18
INSERT INTO technician_availability (technician_id, day_of_week, start_hour, end_hour) VALUES
  ('a0000000-0000-0000-0000-000000000008', 1, '08:00', '18:00'),
  ('a0000000-0000-0000-0000-000000000008', 2, '08:00', '18:00'),
  ('a0000000-0000-0000-0000-000000000008', 3, '08:00', '18:00'),
  ('a0000000-0000-0000-0000-000000000008', 4, '08:00', '18:00'),
  ('a0000000-0000-0000-0000-000000000008', 5, '08:00', '18:00');
