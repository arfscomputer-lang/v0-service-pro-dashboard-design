// Items predefinidos por rubro — se cargan automáticamente al seleccionar el rubro en el editor

export interface RubroItem {
  desc: string
  unit: string
  qty: number
  price: number
}

export interface RubroKit {
  equipos: RubroItem[]
  materiales: RubroItem[]
  mano_de_obra: RubroItem[]
}

export const RUBROS = [
  'CCTV',
  'Electricidad',
  'Refrigeración',
  'Electromecánica',
  'Servicios Generales',
] as const

export type Rubro = typeof RUBROS[number]

export const RUBRO_PREFIXES: Record<string, string> = {
  CCTV: 'CCTV',
  Electricidad: 'ELE',
  Refrigeración: 'REF',
  Electromecánica: 'EME',
  'Servicios Generales': 'SG',
}

export const RUBRO_DEFAULT_KIT: Record<string, RubroKit> = {
  CCTV: {
    equipos: [
      { desc: 'Cámara IP Bullet 2MP 30m IR PoE', unit: 'Und', qty: 0, price: 0 },
      { desc: 'NVR 4ch PoE con 1xHDD', unit: 'Und', qty: 0, price: 0 },
      { desc: 'Disco Duro Purple 1TB CCTV', unit: 'Und', qty: 0, price: 0 },
      { desc: 'Switch PoE 8 puertos', unit: 'Und', qty: 0, price: 0 },
    ],
    materiales: [
      { desc: 'Cable UTP Cat.5e 100m', unit: 'Rollo', qty: 0, price: 0 },
      { desc: 'Conector RJ45 Cat.5e (pack 20)', unit: 'Pack', qty: 0, price: 0 },
      { desc: 'Video Balun HD Pasivo Hasta 4K', unit: 'Und', qty: 0, price: 0 },
    ],
    mano_de_obra: [
      { desc: 'Instalación cableado estructurado', unit: 'Servicio', qty: 1, price: 0 },
      { desc: 'Montaje y fijación de cámaras', unit: 'Und', qty: 0, price: 0 },
      { desc: 'Configuración NVR y acceso remoto', unit: 'Servicio', qty: 1, price: 0 },
    ],
  },

  Electricidad: {
    equipos: [
      { desc: 'Tablero eléctrico 12 circuitos', unit: 'Und', qty: 0, price: 0 },
      { desc: 'Breaker 20A bifásico', unit: 'Und', qty: 0, price: 0 },
      { desc: 'Tomacorriente GFCI 15A', unit: 'Und', qty: 0, price: 0 },
      { desc: 'Luminaria LED 40W empotrada', unit: 'Und', qty: 0, price: 0 },
    ],
    materiales: [
      { desc: 'Cable AWG 12 THHN (rollo 100m)', unit: 'Rollo', qty: 0, price: 0 },
      { desc: 'Cable AWG 14 THHN (rollo 100m)', unit: 'Rollo', qty: 0, price: 0 },
      { desc: 'Tubo conduit EMT 1/2" × 3m', unit: 'Und', qty: 0, price: 0 },
      { desc: 'Caja de paso 4×4 metálica', unit: 'Und', qty: 0, price: 0 },
      { desc: 'Conector EMT 1/2"', unit: 'Und', qty: 0, price: 0 },
    ],
    mano_de_obra: [
      { desc: 'Instalación eléctrica general', unit: 'Servicio', qty: 1, price: 0 },
      { desc: 'Tendido de cableado', unit: 'Punto', qty: 0, price: 0 },
      { desc: 'Pruebas y puesta en servicio', unit: 'Servicio', qty: 1, price: 0 },
    ],
  },

  Refrigeración: {
    equipos: [
      { desc: 'Unidad evaporadora mini-split 12000 BTU', unit: 'Und', qty: 0, price: 0 },
      { desc: 'Unidad condensadora mini-split 12000 BTU', unit: 'Und', qty: 0, price: 0 },
      { desc: 'Control remoto inalámbrico', unit: 'Und', qty: 0, price: 0 },
    ],
    materiales: [
      { desc: 'Tubería de cobre 1/4" × 3/8" (kit 3m)', unit: 'Kit', qty: 0, price: 0 },
      { desc: 'Cable eléctrico 3×14 AWG', unit: 'Mt', qty: 0, price: 0 },
      { desc: 'Soporte metálico para condensadora', unit: 'Und', qty: 0, price: 0 },
      { desc: 'Cinta aislante y accesorios de instalación', unit: 'Gbl', qty: 1, price: 0 },
    ],
    mano_de_obra: [
      { desc: 'Instalación y montaje del equipo', unit: 'Servicio', qty: 1, price: 0 },
      { desc: 'Carga de refrigerante R-410A', unit: 'Libra', qty: 0, price: 0 },
      { desc: 'Pruebas de funcionamiento', unit: 'Servicio', qty: 1, price: 0 },
    ],
  },

  Electromecánica: {
    equipos: [
      { desc: 'Motor eléctrico trifásico 5HP 1750rpm', unit: 'Und', qty: 0, price: 0 },
      { desc: 'Variador de frecuencia 5HP 220V', unit: 'Und', qty: 0, price: 0 },
      { desc: 'Arrancador estrella-triángulo', unit: 'Und', qty: 0, price: 0 },
    ],
    materiales: [
      { desc: 'Cable THHW-LS 3×10 AWG', unit: 'Mt', qty: 0, price: 0 },
      { desc: 'Contactor 25A 220V', unit: 'Und', qty: 0, price: 0 },
      { desc: 'Relé térmico 7-10A', unit: 'Und', qty: 0, price: 0 },
      { desc: 'Guardamotor 9-14A', unit: 'Und', qty: 0, price: 0 },
    ],
    mano_de_obra: [
      { desc: 'Instalación y conexionado de equipos', unit: 'Servicio', qty: 1, price: 0 },
      { desc: 'Programación de variador', unit: 'Servicio', qty: 1, price: 0 },
      { desc: 'Pruebas de funcionamiento y ajuste', unit: 'Servicio', qty: 1, price: 0 },
    ],
  },

  'Servicios Generales': {
    equipos: [],
    materiales: [
      { desc: 'Materiales de limpieza general', unit: 'Gbl', qty: 1, price: 0 },
      { desc: 'Insumos de mantenimiento', unit: 'Gbl', qty: 1, price: 0 },
    ],
    mano_de_obra: [
      { desc: 'Mano de obra general', unit: 'Hora', qty: 8, price: 0 },
      { desc: 'Transporte y logística', unit: 'Servicio', qty: 1, price: 0 },
    ],
  },
}
