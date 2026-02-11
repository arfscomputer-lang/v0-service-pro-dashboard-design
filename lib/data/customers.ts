// Shared customer data & types used across the CRM module

export type CustomerType = "residencial" | "comercial" | "industrial" | "gobierno"
export type CustomerTag = "VIP" | "nuevo" | "frecuente" | "moroso" | "corporativo"
export type InteractionType = "llamada" | "email" | "visita" | "nota"
export type InteractionDirection = "entrante" | "saliente"

export interface Interaction {
  id: string
  type: InteractionType
  direction: InteractionDirection
  date: string // ISO
  summary: string
  agent: string
}

export interface ServiceRecord {
  orderId: string
  date: string
  type: string
  technicianName: string
  status: "completado" | "pendiente" | "cancelado"
  rating: number | null
  amount: number
}

export interface Customer {
  id: string
  name: string
  initials: string
  email: string
  phone: string
  address: string
  city: string
  type: CustomerType
  tags: CustomerTag[]
  nps: number | null // 0-10
  preferredSchedule: string
  notes: string
  createdAt: string // ISO
  interactions: Interaction[]
  services: ServiceRecord[]
  totalSpent: number
  lifetimeValue: number
}

// ── Seed data ──────────────────────────────────────────

export const customerSeed: Customer[] = [
  {
    id: "cli-001",
    name: "Maria Garcia Lopez",
    initials: "MG",
    email: "maria.garcia@email.com",
    phone: "+52 55 1234 0001",
    address: "Av. Insurgentes Sur 1234, Col. Del Valle",
    city: "CDMX",
    type: "residencial",
    tags: ["VIP", "frecuente"],
    nps: 9,
    preferredSchedule: "Lunes a Viernes, 9:00-14:00",
    notes: "Cliente desde 2021. Prefiere comunicacion por WhatsApp.",
    createdAt: "2021-03-15",
    totalSpent: 45_800,
    lifetimeValue: 68_500,
    interactions: [
      { id: "int-001", type: "llamada", direction: "entrante", date: "2026-02-10", summary: "Solicita revision de clima por ruido inusual en la unidad exterior.", agent: "Carlos Rodriguez" },
      { id: "int-002", type: "email", direction: "saliente", date: "2026-01-28", summary: "Recordatorio de mantenimiento preventivo programado para febrero.", agent: "Sistema" },
      { id: "int-003", type: "visita", direction: "saliente", date: "2025-12-05", summary: "Mantenimiento semestral HVAC completado sin novedad.", agent: "Luis Hernandez" },
      { id: "int-004", type: "llamada", direction: "entrante", date: "2025-10-18", summary: "Consulta sobre cobertura de garantia del compresor.", agent: "Ana Soporte" },
    ],
    services: [
      { orderId: "OT-2026-0198", date: "2026-02-11", type: "Revision HVAC", technicianName: "Luis Hernandez", status: "pendiente", rating: null, amount: 2_500 },
      { orderId: "OT-2025-1847", date: "2025-12-05", type: "Mto. Preventivo HVAC", technicianName: "Luis Hernandez", status: "completado", rating: 5, amount: 3_200 },
      { orderId: "OT-2025-1534", date: "2025-09-12", type: "Reparacion Fuga Gas", technicianName: "Sofia Morales", status: "completado", rating: 5, amount: 4_800 },
      { orderId: "OT-2025-0987", date: "2025-06-20", type: "Instalacion Split", technicianName: "Luis Hernandez", status: "completado", rating: 4, amount: 18_500 },
    ],
  },
  {
    id: "cli-002",
    name: "Corporativo Azteca SA de CV",
    initials: "CA",
    email: "mantenimiento@corpazteca.mx",
    phone: "+52 55 9876 5432",
    address: "Paseo de la Reforma 505, Piso 14",
    city: "CDMX",
    type: "comercial",
    tags: ["corporativo", "VIP"],
    nps: 8,
    preferredSchedule: "Lunes a Sabado, 7:00-20:00",
    notes: "Contrato anual de mantenimiento. 3 edificios. Contacto principal: Ing. Roberto Salas.",
    createdAt: "2022-01-10",
    totalSpent: 234_600,
    lifetimeValue: 380_000,
    interactions: [
      { id: "int-005", type: "email", direction: "entrante", date: "2026-02-09", summary: "Solicitud de cotizacion para renovacion de sistema electrico piso 8.", agent: "Carlos Rodriguez" },
      { id: "int-006", type: "llamada", direction: "entrante", date: "2026-02-01", summary: "Reporte de falla en aire acondicionado central edificio B.", agent: "Ana Soporte" },
      { id: "int-007", type: "visita", direction: "saliente", date: "2026-01-15", summary: "Inspeccion trimestral de instalaciones electricas.", agent: "Ana Torres" },
    ],
    services: [
      { orderId: "OT-2026-0185", date: "2026-02-09", type: "Cotizacion Electrica", technicianName: "Ana Torres", status: "pendiente", rating: null, amount: 0 },
      { orderId: "OT-2026-0150", date: "2026-02-01", type: "Reparacion HVAC Central", technicianName: "Gabriela Rios", status: "completado", rating: 4, amount: 12_500 },
      { orderId: "OT-2026-0078", date: "2026-01-15", type: "Inspeccion Electrica", technicianName: "Ana Torres", status: "completado", rating: 5, amount: 8_900 },
    ],
  },
  {
    id: "cli-003",
    name: "Roberto Jimenez Nava",
    initials: "RJ",
    email: "rjimenez@gmail.com",
    phone: "+52 55 2345 6789",
    address: "Calle Maple 56, Col. Santa Fe",
    city: "CDMX",
    type: "residencial",
    tags: ["nuevo"],
    nps: 7,
    preferredSchedule: "Sabados, 10:00-15:00",
    notes: "Primera orden en enero 2026. Interesado en paneles solares.",
    createdAt: "2026-01-05",
    totalSpent: 6_200,
    lifetimeValue: 6_200,
    interactions: [
      { id: "int-008", type: "llamada", direction: "entrante", date: "2026-01-05", summary: "Solicita cotizacion de paneles solares para residencia.", agent: "Carlos Rodriguez" },
      { id: "int-009", type: "email", direction: "saliente", date: "2026-01-08", summary: "Envio de cotizacion detallada para sistema solar de 5kW.", agent: "Carlos Rodriguez" },
    ],
    services: [
      { orderId: "OT-2026-0045", date: "2026-01-20", type: "Evaluacion Solar", technicianName: "Carlos Vega", status: "completado", rating: 4, amount: 1_200 },
      { orderId: "OT-2026-0102", date: "2026-02-05", type: "Instalacion Panel Solar", technicianName: "Carlos Vega", status: "pendiente", rating: null, amount: 5_000 },
    ],
  },
  {
    id: "cli-004",
    name: "Hotel Estrella del Sur",
    initials: "HE",
    email: "operaciones@hotelestrella.mx",
    phone: "+52 55 3456 7890",
    address: "Blvd. Miguel de Cervantes 200",
    city: "CDMX",
    type: "comercial",
    tags: ["frecuente", "corporativo"],
    nps: 10,
    preferredSchedule: "Lunes a Domingo, 6:00-22:00",
    notes: "Contrato premium. Atencion prioritaria. 120 habitaciones.",
    createdAt: "2021-08-20",
    totalSpent: 189_400,
    lifetimeValue: 310_000,
    interactions: [
      { id: "int-010", type: "llamada", direction: "entrante", date: "2026-02-10", summary: "Urgente: fuga de agua en piso 3, 4 habitaciones afectadas.", agent: "Ana Soporte" },
      { id: "int-011", type: "visita", direction: "saliente", date: "2026-01-22", summary: "Mantenimiento mensual de plomeria general.", agent: "Pedro Sanchez" },
      { id: "int-012", type: "email", direction: "saliente", date: "2026-01-10", summary: "Informe mensual de mantenimiento y recomendaciones.", agent: "Sistema" },
    ],
    services: [
      { orderId: "OT-2026-0192", date: "2026-02-10", type: "Emergencia Plomeria", technicianName: "Pedro Sanchez", status: "pendiente", rating: null, amount: 0 },
      { orderId: "OT-2026-0065", date: "2026-01-22", type: "Mto. Plomeria General", technicianName: "Pedro Sanchez", status: "completado", rating: 5, amount: 15_000 },
      { orderId: "OT-2025-1920", date: "2025-12-20", type: "Mto. HVAC Habitaciones", technicianName: "Luis Hernandez", status: "completado", rating: 5, amount: 22_000 },
    ],
  },
  {
    id: "cli-005",
    name: "Laura Mendoza Perez",
    initials: "LM",
    email: "lauramendoza@outlook.com",
    phone: "+52 55 4567 8901",
    address: "Priv. Los Pinos 12, Coyoacan",
    city: "CDMX",
    type: "residencial",
    tags: ["frecuente"],
    nps: 6,
    preferredSchedule: "Martes y Jueves, 14:00-18:00",
    notes: "Ha reportado demora en 2 visitas. Necesita seguimiento especial.",
    createdAt: "2023-05-10",
    totalSpent: 28_300,
    lifetimeValue: 42_000,
    interactions: [
      { id: "int-013", type: "llamada", direction: "entrante", date: "2026-02-08", summary: "Queja por retraso en visita del 5 de febrero. Solicita compensacion.", agent: "Ana Soporte" },
      { id: "int-014", type: "nota", direction: "saliente", date: "2026-02-08", summary: "Se ofrecio descuento del 15% en proxima visita como compensacion.", agent: "Carlos Rodriguez" },
      { id: "int-015", type: "visita", direction: "saliente", date: "2026-02-05", summary: "Instalacion de calentador solar. Tecnico llego 45 min tarde.", agent: "Carlos Vega" },
    ],
    services: [
      { orderId: "OT-2026-0160", date: "2026-02-05", type: "Instalacion Calentador Solar", technicianName: "Carlos Vega", status: "completado", rating: 3, amount: 14_500 },
      { orderId: "OT-2025-1750", date: "2025-11-15", type: "Reparacion Electrica", technicianName: "Ricardo Mendoza", status: "completado", rating: 4, amount: 3_800 },
    ],
  },
  {
    id: "cli-006",
    name: "Gobierno Municipal Tlalpan",
    initials: "GT",
    email: "servicios@tlalpan.gob.mx",
    phone: "+52 55 5678 9012",
    address: "Plaza de la Constitucion 1, Tlalpan",
    city: "CDMX",
    type: "gobierno",
    tags: ["corporativo"],
    nps: 8,
    preferredSchedule: "Lunes a Viernes, 8:00-16:00",
    notes: "Contrato de mantenimiento edificios publicos. Facturacion a 30 dias.",
    createdAt: "2024-01-15",
    totalSpent: 95_600,
    lifetimeValue: 150_000,
    interactions: [
      { id: "int-016", type: "email", direction: "entrante", date: "2026-02-07", summary: "Solicitud de mantenimiento preventivo para edificio de cultura.", agent: "Carlos Rodriguez" },
      { id: "int-017", type: "llamada", direction: "saliente", date: "2026-01-20", summary: "Seguimiento de factura pendiente de diciembre.", agent: "Admin Facturacion" },
    ],
    services: [
      { orderId: "OT-2026-0175", date: "2026-02-07", type: "Mto. Preventivo Edificio", technicianName: "Miguel Flores", status: "pendiente", rating: null, amount: 18_000 },
      { orderId: "OT-2025-1890", date: "2025-12-10", type: "Reparacion Gas Cocina", technicianName: "Sofia Morales", status: "completado", rating: 5, amount: 7_600 },
    ],
  },
  {
    id: "cli-007",
    name: "Restaurante El Fogon",
    initials: "RF",
    email: "gerencia@elfogon.mx",
    phone: "+52 55 6789 0123",
    address: "Calle 16 de Septiembre 78, Centro",
    city: "CDMX",
    type: "comercial",
    tags: ["frecuente"],
    nps: 9,
    preferredSchedule: "Lunes a Sabado, 7:00-11:00 (antes de apertura)",
    notes: "Servicio de gas y plomeria regular. Solo se puede trabajar antes de las 11am.",
    createdAt: "2022-06-01",
    totalSpent: 67_200,
    lifetimeValue: 95_000,
    interactions: [
      { id: "int-018", type: "visita", direction: "saliente", date: "2026-02-03", summary: "Inspeccion mensual de lineas de gas. Todo en orden.", agent: "Sofia Morales" },
      { id: "int-019", type: "llamada", direction: "entrante", date: "2026-01-15", summary: "Solicita cambio de quemadores industriales.", agent: "Ana Soporte" },
    ],
    services: [
      { orderId: "OT-2026-0130", date: "2026-02-03", type: "Inspeccion Gas Mensual", technicianName: "Sofia Morales", status: "completado", rating: 5, amount: 3_500 },
      { orderId: "OT-2026-0090", date: "2026-01-25", type: "Cambio Quemadores", technicianName: "Sofia Morales", status: "completado", rating: 5, amount: 12_800 },
    ],
  },
  {
    id: "cli-008",
    name: "Patricia Ruiz Delgado",
    initials: "PR",
    email: "patricia.ruiz@yahoo.com",
    phone: "+52 55 7890 1234",
    address: "Cerrada Lilas 5, Col. Jardines",
    city: "CDMX",
    type: "residencial",
    tags: ["moroso"],
    nps: 4,
    preferredSchedule: "Viernes, 16:00-19:00",
    notes: "Factura de noviembre sin pagar. Se ha contactado 3 veces sin respuesta.",
    createdAt: "2024-09-01",
    totalSpent: 8_900,
    lifetimeValue: 8_900,
    interactions: [
      { id: "int-020", type: "llamada", direction: "saliente", date: "2026-02-06", summary: "Tercer intento de cobro. No contesta. Se dejara mensaje.", agent: "Admin Facturacion" },
      { id: "int-021", type: "email", direction: "saliente", date: "2026-01-30", summary: "Recordatorio de pago pendiente - Factura #F-2025-4521.", agent: "Sistema" },
      { id: "int-022", type: "llamada", direction: "saliente", date: "2026-01-15", summary: "Segundo intento de cobro. Dice que pagara la proxima semana.", agent: "Admin Facturacion" },
    ],
    services: [
      { orderId: "OT-2025-1680", date: "2025-11-08", type: "Reparacion Plomeria", technicianName: "Pedro Sanchez", status: "completado", rating: 3, amount: 5_200 },
      { orderId: "OT-2025-1420", date: "2025-09-01", type: "Instalacion Calentador", technicianName: "Miguel Flores", status: "completado", rating: 4, amount: 3_700 },
    ],
  },
  {
    id: "cli-009",
    name: "Edificio Torres del Parque",
    initials: "TP",
    email: "admin@torresdelparque.mx",
    phone: "+52 55 8901 2345",
    address: "Av. Chapultepec 340, Col. Condesa",
    city: "CDMX",
    type: "comercial",
    tags: ["VIP", "corporativo"],
    nps: 9,
    preferredSchedule: "Lunes a Viernes, 8:00-18:00",
    notes: "Condominio 80 departamentos. Administrador: Lic. Fernando Trejo.",
    createdAt: "2022-11-01",
    totalSpent: 156_800,
    lifetimeValue: 250_000,
    interactions: [
      { id: "int-023", type: "email", direction: "entrante", date: "2026-02-09", summary: "Solicita presupuesto para cambio de sistema hidraulico completo.", agent: "Carlos Rodriguez" },
      { id: "int-024", type: "visita", direction: "saliente", date: "2026-01-28", summary: "Revision trimestral de instalaciones electricas areas comunes.", agent: "Ana Torres" },
    ],
    services: [
      { orderId: "OT-2026-0188", date: "2026-02-09", type: "Presupuesto Hidraulico", technicianName: "Pedro Sanchez", status: "pendiente", rating: null, amount: 0 },
      { orderId: "OT-2026-0055", date: "2026-01-28", type: "Revision Electrica Trimestral", technicianName: "Ana Torres", status: "completado", rating: 5, amount: 11_200 },
    ],
  },
  {
    id: "cli-010",
    name: "Fernando Castillo Ortiz",
    initials: "FC",
    email: "fcastillo@protonmail.com",
    phone: "+52 55 0123 4567",
    address: "Calle Roble 89, Col. Florida",
    city: "CDMX",
    type: "residencial",
    tags: ["nuevo"],
    nps: null,
    preferredSchedule: "Cualquier dia, 8:00-20:00",
    notes: "Referido por Maria Garcia. Primera visita programada.",
    createdAt: "2026-02-01",
    totalSpent: 0,
    lifetimeValue: 0,
    interactions: [
      { id: "int-025", type: "llamada", direction: "entrante", date: "2026-02-01", summary: "Solicita servicio de revision electrica general. Referido por cli-001.", agent: "Ana Soporte" },
    ],
    services: [
      { orderId: "OT-2026-0200", date: "2026-02-15", type: "Revision Electrica", technicianName: "Ricardo Mendoza", status: "pendiente", rating: null, amount: 2_800 },
    ],
  },
]
