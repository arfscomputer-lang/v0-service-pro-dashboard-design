"use strict"

// ── Types ────────────────────────────────────────────────────

export type ItemCategory =
  | "refaccion"
  | "herramienta"
  | "consumible"
  | "equipo"
  | "material"

export type LocationType = "almacen" | "vehiculo" | "proveedor"

export interface StockLocation {
  id: string
  name: string
  type: LocationType
  qty: number
}

export interface StockMovement {
  id: string
  date: string
  type: "entrada" | "salida" | "transferencia" | "ajuste"
  qty: number
  from: string
  to: string
  orderId?: string
  notes: string
  user: string
}

export interface Supplier {
  id: string
  name: string
  phone: string
  email: string
  leadTimeDays: number
  lastOrderDate: string
}

export interface InventoryItem {
  id: string
  sku: string
  barcode: string
  name: string
  description: string
  category: ItemCategory
  unit: string
  totalStock: number
  minStock: number
  maxStock: number
  costUnit: number
  priceUnit: number
  locations: StockLocation[]
  movements: StockMovement[]
  supplier: Supplier
  imageUrl: string
  isActive: boolean
}

// ── Category labels ──────────────────────────────────────────

export const categoryLabels: Record<ItemCategory, string> = {
  refaccion: "Refaccion",
  herramienta: "Herramienta",
  consumible: "Consumible",
  equipo: "Equipo",
  material: "Material",
}

// ── Seed data ────────────────────────────────────────────────

export const inventorySeed: InventoryItem[] = [
  {
    id: "inv-001",
    sku: "FLT-HEPA-14x20",
    barcode: "7501234560010",
    name: "Filtro HEPA 14x20",
    description: "Filtro de alta eficiencia para sistemas de ventilacion HVAC residencial y comercial.",
    category: "refaccion",
    unit: "pieza",
    totalStock: 2,
    minStock: 10,
    maxStock: 50,
    costUnit: 185.0,
    priceUnit: 320.0,
    locations: [
      { id: "loc-1", name: "Almacen Central", type: "almacen", qty: 1 },
      { id: "loc-2", name: "Vehiculo CM-01 (Carlos Mendez)", type: "vehiculo", qty: 1 },
    ],
    movements: [
      { id: "mv-1", date: "2026-02-10", type: "salida", qty: 3, from: "Almacen Central", to: "OT-1038", orderId: "OT-1038", notes: "Uso en instalacion Polanco", user: "Carlos Mendez" },
      { id: "mv-2", date: "2026-02-08", type: "entrada", qty: 10, from: "Proveedor FilterMex", to: "Almacen Central", notes: "Reabastecimiento semanal", user: "Admin" },
      { id: "mv-3", date: "2026-02-05", type: "salida", qty: 5, from: "Almacen Central", to: "OT-1030", orderId: "OT-1030", notes: "Mantenimiento preventivo", user: "Ana Garcia" },
    ],
    supplier: { id: "sup-1", name: "FilterMex S.A.", phone: "+52 55 1234 5678", email: "ventas@filtermex.com", leadTimeDays: 3, lastOrderDate: "2026-02-08" },
    imageUrl: "",
    isActive: true,
  },
  {
    id: "inv-002",
    sku: "REF-GAS-R410A",
    barcode: "7501234560027",
    name: "Refrigerante R-410A (11.3 kg)",
    description: "Gas refrigerante ecologico para aires acondicionados tipo mini-split e inverter.",
    category: "consumible",
    unit: "cilindro",
    totalStock: 8,
    minStock: 5,
    maxStock: 20,
    costUnit: 1850.0,
    priceUnit: 2600.0,
    locations: [
      { id: "loc-3", name: "Almacen Central", type: "almacen", qty: 5 },
      { id: "loc-4", name: "Vehiculo AG-02 (Ana Garcia)", type: "vehiculo", qty: 2 },
      { id: "loc-5", name: "Vehiculo RL-03 (Roberto Lopez)", type: "vehiculo", qty: 1 },
    ],
    movements: [
      { id: "mv-4", date: "2026-02-11", type: "transferencia", qty: 2, from: "Almacen Central", to: "Vehiculo AG-02", notes: "Reposicion semanal", user: "Admin" },
      { id: "mv-5", date: "2026-02-09", type: "salida", qty: 1, from: "Vehiculo RL-03", to: "OT-1041", orderId: "OT-1041", notes: "Recarga de gas en equipo", user: "Roberto Lopez" },
    ],
    supplier: { id: "sup-2", name: "Gases Industriales MX", phone: "+52 55 9876 5432", email: "pedidos@gasesmx.com", leadTimeDays: 2, lastOrderDate: "2026-02-06" },
    imageUrl: "",
    isActive: true,
  },
  {
    id: "inv-003",
    sku: "HER-MANOMETRO-DIG",
    barcode: "7501234560034",
    name: "Manometro Digital Dual",
    description: "Manometro digital de alta precision con conexion Bluetooth para lectura en app.",
    category: "herramienta",
    unit: "pieza",
    totalStock: 4,
    minStock: 2,
    maxStock: 8,
    costUnit: 3200.0,
    priceUnit: 0,
    locations: [
      { id: "loc-6", name: "Almacen Central", type: "almacen", qty: 1 },
      { id: "loc-7", name: "Vehiculo CM-01", type: "vehiculo", qty: 1 },
      { id: "loc-8", name: "Vehiculo AG-02", type: "vehiculo", qty: 1 },
      { id: "loc-9", name: "Vehiculo MF-04 (Maria Fernandez)", type: "vehiculo", qty: 1 },
    ],
    movements: [
      { id: "mv-6", date: "2026-01-15", type: "entrada", qty: 4, from: "Proveedor TechTools", to: "Almacen Central", notes: "Compra inicial", user: "Admin" },
      { id: "mv-7", date: "2026-01-16", type: "transferencia", qty: 3, from: "Almacen Central", to: "Vehiculos", notes: "Distribucion a tecnicos", user: "Admin" },
    ],
    supplier: { id: "sup-3", name: "TechTools Industrial", phone: "+52 55 2468 1357", email: "info@techtools.mx", leadTimeDays: 7, lastOrderDate: "2026-01-15" },
    imageUrl: "",
    isActive: true,
  },
  {
    id: "inv-004",
    sku: "REF-COMPRESOR-1.5T",
    barcode: "7501234560041",
    name: "Compresor Scroll 1.5 Ton",
    description: "Compresor scroll de reemplazo para unidades condensadoras residenciales de 1.5 toneladas.",
    category: "equipo",
    unit: "pieza",
    totalStock: 3,
    minStock: 2,
    maxStock: 6,
    costUnit: 8500.0,
    priceUnit: 12800.0,
    locations: [
      { id: "loc-10", name: "Almacen Central", type: "almacen", qty: 3 },
    ],
    movements: [
      { id: "mv-8", date: "2026-02-01", type: "entrada", qty: 3, from: "Proveedor CompresoresMX", to: "Almacen Central", notes: "Orden de compra #4521", user: "Admin" },
      { id: "mv-9", date: "2026-01-20", type: "salida", qty: 1, from: "Almacen Central", to: "OT-1025", orderId: "OT-1025", notes: "Reemplazo de compresor danado", user: "Carlos Mendez" },
    ],
    supplier: { id: "sup-4", name: "CompresoresMX", phone: "+52 55 1111 2222", email: "ventas@compresores.mx", leadTimeDays: 5, lastOrderDate: "2026-02-01" },
    imageUrl: "",
    isActive: true,
  },
  {
    id: "inv-005",
    sku: "MAT-TUBO-CU-3/8",
    barcode: "7501234560058",
    name: "Tubo de Cobre 3/8\" (rollo 15m)",
    description: "Tubo de cobre suave de 3/8 pulgada para linea de liquido en instalaciones de aire acondicionado.",
    category: "material",
    unit: "rollo",
    totalStock: 12,
    minStock: 8,
    maxStock: 30,
    costUnit: 650.0,
    priceUnit: 950.0,
    locations: [
      { id: "loc-11", name: "Almacen Central", type: "almacen", qty: 8 },
      { id: "loc-12", name: "Vehiculo CM-01", type: "vehiculo", qty: 2 },
      { id: "loc-13", name: "Vehiculo AG-02", type: "vehiculo", qty: 2 },
    ],
    movements: [
      { id: "mv-10", date: "2026-02-10", type: "salida", qty: 1, from: "Vehiculo CM-01", to: "OT-1042", orderId: "OT-1042", notes: "Instalacion linea nueva", user: "Carlos Mendez" },
      { id: "mv-11", date: "2026-02-07", type: "entrada", qty: 15, from: "Proveedor CobreMex", to: "Almacen Central", notes: "Pedido mensual", user: "Admin" },
    ],
    supplier: { id: "sup-5", name: "CobreMex Industrial", phone: "+52 55 3333 4444", email: "pedidos@cobremex.com", leadTimeDays: 4, lastOrderDate: "2026-02-07" },
    imageUrl: "",
    isActive: true,
  },
  {
    id: "inv-006",
    sku: "CON-SOLDADURA-15",
    barcode: "7501234560065",
    name: "Varilla de Soldadura Plata 15%",
    description: "Varilla de soldadura con 15% plata para uniones de tuberias de cobre en refrigeracion.",
    category: "consumible",
    unit: "kg",
    totalStock: 1.5,
    minStock: 3,
    maxStock: 10,
    costUnit: 2800.0,
    priceUnit: 3500.0,
    locations: [
      { id: "loc-14", name: "Almacen Central", type: "almacen", qty: 0.5 },
      { id: "loc-15", name: "Vehiculo CM-01", type: "vehiculo", qty: 0.5 },
      { id: "loc-16", name: "Vehiculo AG-02", type: "vehiculo", qty: 0.5 },
    ],
    movements: [
      { id: "mv-12", date: "2026-02-09", type: "salida", qty: 0.5, from: "Almacen Central", to: "OT-1040", orderId: "OT-1040", notes: "Soldadura de tuberias", user: "Ana Garcia" },
    ],
    supplier: { id: "sup-6", name: "SoldaMex S.A.", phone: "+52 55 5555 6666", email: "info@soldamex.com", leadTimeDays: 3, lastOrderDate: "2026-01-25" },
    imageUrl: "",
    isActive: true,
  },
  {
    id: "inv-007",
    sku: "HER-BOMBA-VACIO",
    barcode: "7501234560072",
    name: "Bomba de Vacio 6 CFM",
    description: "Bomba de vacio de doble etapa para evacuacion de sistemas de refrigeracion.",
    category: "herramienta",
    unit: "pieza",
    totalStock: 3,
    minStock: 2,
    maxStock: 5,
    costUnit: 5600.0,
    priceUnit: 0,
    locations: [
      { id: "loc-17", name: "Almacen Central", type: "almacen", qty: 1 },
      { id: "loc-18", name: "Vehiculo CM-01", type: "vehiculo", qty: 1 },
      { id: "loc-19", name: "Vehiculo RL-03", type: "vehiculo", qty: 1 },
    ],
    movements: [
      { id: "mv-13", date: "2025-12-10", type: "entrada", qty: 3, from: "Proveedor TechTools", to: "Almacen Central", notes: "Renovacion de equipo", user: "Admin" },
    ],
    supplier: { id: "sup-3", name: "TechTools Industrial", phone: "+52 55 2468 1357", email: "info@techtools.mx", leadTimeDays: 7, lastOrderDate: "2025-12-10" },
    imageUrl: "",
    isActive: true,
  },
  {
    id: "inv-008",
    sku: "REF-TERMOSTATO-WIFI",
    barcode: "7501234560089",
    name: "Termostato WiFi Programable",
    description: "Termostato inteligente con conexion WiFi, compatible con Alexa y Google Home.",
    category: "equipo",
    unit: "pieza",
    totalStock: 15,
    minStock: 5,
    maxStock: 25,
    costUnit: 1200.0,
    priceUnit: 1950.0,
    locations: [
      { id: "loc-20", name: "Almacen Central", type: "almacen", qty: 12 },
      { id: "loc-21", name: "Vehiculo CM-01", type: "vehiculo", qty: 2 },
      { id: "loc-22", name: "Vehiculo MF-04", type: "vehiculo", qty: 1 },
    ],
    movements: [
      { id: "mv-14", date: "2026-02-05", type: "entrada", qty: 20, from: "Proveedor SmartHome", to: "Almacen Central", notes: "Pedido trimestral", user: "Admin" },
      { id: "mv-15", date: "2026-02-10", type: "salida", qty: 2, from: "Almacen Central", to: "OT-1039", orderId: "OT-1039", notes: "Instalacion domicilio", user: "Maria Fernandez" },
    ],
    supplier: { id: "sup-7", name: "SmartHome Distribution", phone: "+52 55 7777 8888", email: "orders@smarthome.mx", leadTimeDays: 5, lastOrderDate: "2026-02-05" },
    imageUrl: "",
    isActive: true,
  },
]
