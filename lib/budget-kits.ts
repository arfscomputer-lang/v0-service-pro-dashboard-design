// Kits predefinidos de presupuestos por rubro

export interface BudgetKit {
  id: string
  rubro: string
  name: string
  description: string
  icon: string
  items: Array<{
    section: 'equipos' | 'materiales' | 'mano_de_obra'
    description: string
    unit: string
    quantity: number
    price: number
  }>
}

// ── CCTV ──────────────────────────────────────────────────────────────────────

const CCTV_KITS: BudgetKit[] = [
  {
    id: 'kit-economico-turbohd',
    rubro: 'CCTV',
    name: 'Kit TurboHD Económico 4ch',
    description: 'Sistema económico con 4 cámaras TurboHD 720P, DVR 4ch, todo incluido',
    icon: '📹',
    items: [
      { section: 'equipos', description: 'Mini Bullet TurboHD 20m IR 720P (DS-2CE16C0T-IRPF)', unit: 'Und', quantity: 4, price: 0 },
      { section: 'equipos', description: 'DVR 4ch TurboHD serie HGHI (DS-7104HGHI-F1)', unit: 'Und', quantity: 1, price: 0 },
      { section: 'equipos', description: 'Disco Duro Purple 1TB SATA CCTV', unit: 'Und', quantity: 1, price: 0 },
      { section: 'materiales', description: 'Cable UTP Cat.5e + Par Alimentación 100m', unit: 'Rollo', quantity: 1, price: 0 },
      { section: 'materiales', description: 'Conector RJ45 Cat.5e Macho (pack 20)', unit: 'Pack', quantity: 1, price: 0 },
      { section: 'materiales', description: 'Video Balun HD Pasivo Hasta 4K', unit: 'Und', quantity: 4, price: 0 },
      { section: 'materiales', description: 'Conector Alimentación 12V Bornera', unit: 'Und', quantity: 4, price: 0 },
      { section: 'mano_de_obra', description: 'Instalación cableado y alimentación', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Montaje y fijación de cámaras', unit: 'Und', quantity: 4, price: 0 },
      { section: 'mano_de_obra', description: 'Configuración DVR básica', unit: 'Servicio', quantity: 1, price: 0 },
    ],
  },
  {
    id: 'kit-basico-4cam',
    rubro: 'CCTV',
    name: 'Kit Básico 4 Cámaras IP 2MP',
    description: 'Sistema completo para 4 cámaras IP 2MP con NVR 4ch PoE, instalación y configuración',
    icon: '📷',
    items: [
      { section: 'equipos', description: 'Bullet IP 30m IR / PoE 2MP (Hikvision DS-2CD1023G0-I)', unit: 'Und', quantity: 4, price: 0 },
      { section: 'equipos', description: 'NVR 4ch con PoE 1xHDD (Hikvision DS-7104NI-Q1/4P/M)', unit: 'Und', quantity: 1, price: 0 },
      { section: 'equipos', description: 'Disco Duro Purple 1TB SATA CCTV (WD10PURX)', unit: 'Und', quantity: 1, price: 0 },
      { section: 'equipos', description: 'Fuente Alimentación 12V 2A Plástico', unit: 'Und', quantity: 1, price: 0 },
      { section: 'materiales', description: 'Cable UTP Cat.5e 100% Cobre 100m', unit: 'Rollo', quantity: 1, price: 0 },
      { section: 'materiales', description: 'Conector RJ45 Cat.5e Macho (pack 20)', unit: 'Pack', quantity: 2, price: 0 },
      { section: 'materiales', description: 'Video Balun HD Pasivo Hasta 4K', unit: 'Und', quantity: 4, price: 0 },
      { section: 'mano_de_obra', description: 'Instalación cableado estructurado (4 puntos)', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Montaje y fijación de cámaras', unit: 'Und', quantity: 4, price: 0 },
      { section: 'mano_de_obra', description: 'Configuración NVR y cámaras', unit: 'Servicio', quantity: 1, price: 0 },
    ],
  },
  {
    id: 'kit-estandar-8cam',
    rubro: 'CCTV',
    name: 'Kit Estándar 8 Cámaras IP 4MP',
    description: 'Sistema profesional con 8 cámaras IP 4MP, NVR 8ch PoE, UPS 1500VA, rack 12U',
    icon: '📹',
    items: [
      { section: 'equipos', description: 'Bullet IP 30m IR / PoE 4MP (Hikvision DS-2CD1043G0-I)', unit: 'Und', quantity: 4, price: 0 },
      { section: 'equipos', description: 'Domo IP 30m IR / PoE 4MP (Hikvision DS-2CD1143G0-I)', unit: 'Und', quantity: 4, price: 0 },
      { section: 'equipos', description: 'NVR 8ch con PoE 2xHDD (Hikvision DS-7608NI-K2/8P)', unit: 'Und', quantity: 1, price: 0 },
      { section: 'equipos', description: 'Disco Duro Purple 2TB SATA CCTV (WD20PURX)', unit: 'Und', quantity: 2, price: 0 },
      { section: 'equipos', description: 'Switch PoE 9 puertos (8P PoE + 1 Uplink)', unit: 'Und', quantity: 1, price: 0 },
      { section: 'equipos', description: 'UPS 1500VA 900W Línea Interactiva', unit: 'Und', quantity: 1, price: 0 },
      { section: 'materiales', description: 'Cable UTP Cat.5e 100% Cobre 305m', unit: 'Rollo', quantity: 2, price: 0 },
      { section: 'materiales', description: 'Conector RJ45 Cat.5e Macho (pack 20)', unit: 'Pack', quantity: 4, price: 0 },
      { section: 'materiales', description: 'Video Balun HD Pasivo Hasta 4K', unit: 'Und', quantity: 8, price: 0 },
      { section: 'materiales', description: 'Batería 12V 7Ah AGM', unit: 'Und', quantity: 2, price: 0 },
      { section: 'mano_de_obra', description: 'Instalación cableado estructurado (8 puntos)', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Montaje y fijación de cámaras', unit: 'Und', quantity: 8, price: 0 },
      { section: 'mano_de_obra', description: 'Configuración NVR, cámaras y acceso remoto', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Capacitación al personal del cliente', unit: 'Hora', quantity: 2, price: 0 },
    ],
  },
  {
    id: 'kit-premium-16cam',
    rubro: 'CCTV',
    name: 'Kit Premium 16 Cámaras 4K',
    description: 'Sistema enterprise con 16 cámaras 8MP 4K, NVR 16ch, UPS 2000VA, monitor profesional',
    icon: '🎥',
    items: [
      { section: 'equipos', description: 'Bullet IP 30m IR / PoE 8MP/4K (Hikvision DS-2CD2083G0-I)', unit: 'Und', quantity: 8, price: 0 },
      { section: 'equipos', description: 'Bullet IP AUDIO-IN / 30m IR 8MP (Hikvision DS-2CD2183G0-IS)', unit: 'Und', quantity: 8, price: 0 },
      { section: 'equipos', description: 'NVR 8ch con PoE 2xHDD (Hikvision DS-7608NI-K2/8P)', unit: 'Und', quantity: 2, price: 0 },
      { section: 'equipos', description: 'Disco Duro Purple 4TB SATA CCTV (WD42PURZ)', unit: 'Und', quantity: 4, price: 0 },
      { section: 'equipos', description: 'Switch PoE 18 puertos (16P + 2 RJ45 + 2 SFP)', unit: 'Und', quantity: 1, price: 0 },
      { section: 'equipos', description: 'UPS 2000VA 1200W Línea Interactiva', unit: 'Und', quantity: 1, price: 0 },
      { section: 'materiales', description: 'Cable UTP Cat.6 100% Cobre 305m', unit: 'Rollo', quantity: 3, price: 0 },
      { section: 'materiales', description: 'Conector RJ45 Cat.6 Macho (pack 20)', unit: 'Pack', quantity: 8, price: 0 },
      { section: 'materiales', description: 'Video Balun HD Pasivo Hasta 4K', unit: 'Und', quantity: 16, price: 0 },
      { section: 'materiales', description: 'Batería 12V 7Ah AGM', unit: 'Und', quantity: 4, price: 0 },
      { section: 'mano_de_obra', description: 'Instalación cableado estructurado completo', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Montaje y fijación de cámaras', unit: 'Und', quantity: 16, price: 0 },
      { section: 'mano_de_obra', description: 'Configuración NVR redundante y cámaras', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Instalación eléctrica y UPS', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Capacitación gerencial al personal', unit: 'Hora', quantity: 4, price: 0 },
    ],
  },
]

// ── Electricidad ───────────────────────────────────────────────────────────────

const ELECTRICIDAD_KITS: BudgetKit[] = [
  {
    id: 'kit-elec-residencial',
    rubro: 'Electricidad',
    name: 'Instalación Eléctrica Residencial',
    description: 'Instalación eléctrica completa para vivienda unifamiliar hasta 120m²',
    icon: '🏠',
    items: [
      { section: 'equipos', description: 'Tablero eléctrico 12 circuitos monofásico', unit: 'Und', quantity: 1, price: 0 },
      { section: 'equipos', description: 'Breaker principal 60A 2P', unit: 'Und', quantity: 1, price: 0 },
      { section: 'equipos', description: 'Breaker 20A 1P (circuito tomacorrientes)', unit: 'Und', quantity: 6, price: 0 },
      { section: 'equipos', description: 'Breaker 15A 1P (circuito iluminación)', unit: 'Und', quantity: 4, price: 0 },
      { section: 'equipos', description: 'Tomacorriente doble polarizado 15A', unit: 'Und', quantity: 12, price: 0 },
      { section: 'equipos', description: 'Interruptor sencillo 15A', unit: 'Und', quantity: 8, price: 0 },
      { section: 'materiales', description: 'Cable AWG 12 THHN negro (rollo 100m)', unit: 'Rollo', quantity: 2, price: 0 },
      { section: 'materiales', description: 'Cable AWG 14 THHN blanco (rollo 100m)', unit: 'Rollo', quantity: 2, price: 0 },
      { section: 'materiales', description: 'Cable AWG 12 THHN verde tierra (rollo 100m)', unit: 'Rollo', quantity: 1, price: 0 },
      { section: 'materiales', description: 'Tubo conduit EMT 1/2" × 3m', unit: 'Und', quantity: 20, price: 0 },
      { section: 'materiales', description: 'Caja octagonal metálica 4"', unit: 'Und', quantity: 10, price: 0 },
      { section: 'materiales', description: 'Caja rectangular metálica 2×4"', unit: 'Und', quantity: 20, price: 0 },
      { section: 'mano_de_obra', description: 'Instalación de tablero y acometida', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Tendido de cableado y tubería', unit: 'Punto', quantity: 20, price: 0 },
      { section: 'mano_de_obra', description: 'Instalación de salidas y dispositivos', unit: 'Punto', quantity: 20, price: 0 },
      { section: 'mano_de_obra', description: 'Pruebas y certificación', unit: 'Servicio', quantity: 1, price: 0 },
    ],
  },
  {
    id: 'kit-elec-comercial',
    rubro: 'Electricidad',
    name: 'Instalación Eléctrica Comercial',
    description: 'Instalación trifásica para local comercial o pequeña industria',
    icon: '🏢',
    items: [
      { section: 'equipos', description: 'Tablero eléctrico trifásico 24 circuitos', unit: 'Und', quantity: 1, price: 0 },
      { section: 'equipos', description: 'Breaker principal trifásico 100A', unit: 'Und', quantity: 1, price: 0 },
      { section: 'equipos', description: 'Breaker trifásico 30A (cargas trifásicas)', unit: 'Und', quantity: 4, price: 0 },
      { section: 'equipos', description: 'Breaker monofásico 20A (tomacorrientes)', unit: 'Und', quantity: 10, price: 0 },
      { section: 'equipos', description: 'Tomacorriente GFCI 20A (áreas húmedas)', unit: 'Und', quantity: 6, price: 0 },
      { section: 'equipos', description: 'UPS 3000VA para equipos críticos', unit: 'Und', quantity: 1, price: 0 },
      { section: 'materiales', description: 'Cable AWG 10 THHN (rollo 100m)', unit: 'Rollo', quantity: 3, price: 0 },
      { section: 'materiales', description: 'Cable AWG 12 THHN (rollo 100m)', unit: 'Rollo', quantity: 4, price: 0 },
      { section: 'materiales', description: 'Tubo conduit EMT 3/4" × 3m', unit: 'Und', quantity: 30, price: 0 },
      { section: 'materiales', description: 'Bandeja portacable 100mm × 3m', unit: 'Und', quantity: 10, price: 0 },
      { section: 'mano_de_obra', description: 'Instalación de tablero principal', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Tendido de cableado trifásico', unit: 'Punto', quantity: 30, price: 0 },
      { section: 'mano_de_obra', description: 'Puesta a tierra y protecciones', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Pruebas y certificación eléctrica', unit: 'Servicio', quantity: 1, price: 0 },
    ],
  },
  {
    id: 'kit-elec-iluminacion',
    rubro: 'Electricidad',
    name: 'Proyecto de Iluminación LED',
    description: 'Renovación de iluminación con tecnología LED para oficina o local',
    icon: '💡',
    items: [
      { section: 'equipos', description: 'Panel LED 60×60cm 40W luz fría', unit: 'Und', quantity: 12, price: 0 },
      { section: 'equipos', description: 'Luminaria LED industrial 100W', unit: 'Und', quantity: 6, price: 0 },
      { section: 'equipos', description: 'Interruptor inteligente dimmer LED', unit: 'Und', quantity: 4, price: 0 },
      { section: 'equipos', description: 'Sensor de movimiento 360° techo', unit: 'Und', quantity: 4, price: 0 },
      { section: 'materiales', description: 'Cable AWG 14 THHN (rollo 100m)', unit: 'Rollo', quantity: 2, price: 0 },
      { section: 'materiales', description: 'Caja octagonal 4" con tapa', unit: 'Und', quantity: 18, price: 0 },
      { section: 'materiales', description: 'Riel DIN 35mm × 1m', unit: 'Und', quantity: 4, price: 0 },
      { section: 'mano_de_obra', description: 'Desmontaje de luminarias existentes', unit: 'Punto', quantity: 18, price: 0 },
      { section: 'mano_de_obra', description: 'Instalación de luminarias LED', unit: 'Punto', quantity: 18, price: 0 },
      { section: 'mano_de_obra', description: 'Cableado y conexionado', unit: 'Servicio', quantity: 1, price: 0 },
    ],
  },
]

// ── Refrigeración ──────────────────────────────────────────────────────────────

const REFRIGERACION_KITS: BudgetKit[] = [
  {
    id: 'kit-ref-split-residencial',
    rubro: 'Refrigeración',
    name: 'Mini-Split Residencial 12000 BTU',
    description: 'Suministro e instalación de equipo de aire acondicionado split para habitación o sala',
    icon: '❄️',
    items: [
      { section: 'equipos', description: 'Equipo mini-split inverter 12000 BTU (Midea/Carrier)', unit: 'Und', quantity: 1, price: 0 },
      { section: 'equipos', description: 'Control remoto inalámbrico (incluido)', unit: 'Und', quantity: 1, price: 0 },
      { section: 'materiales', description: 'Kit tubería cobre 1/4"×3/8" preflareada 3m', unit: 'Kit', quantity: 1, price: 0 },
      { section: 'materiales', description: 'Cable eléctrico 3×12 AWG (m)', unit: 'Mt', quantity: 6, price: 0 },
      { section: 'materiales', description: 'Soporte metálico para unidad condensadora', unit: 'Und', quantity: 1, price: 0 },
      { section: 'materiales', description: 'Cinta aislante armaflex 1/2" (rollo)', unit: 'Rollo', quantity: 1, price: 0 },
      { section: 'materiales', description: 'Abrazaderas y tornillería', unit: 'Gbl', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Instalación y montaje del equipo', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Carga de refrigerante R-410A', unit: 'Libra', quantity: 2, price: 0 },
      { section: 'mano_de_obra', description: 'Pruebas y puesta en marcha', unit: 'Servicio', quantity: 1, price: 0 },
    ],
  },
  {
    id: 'kit-ref-multi-split',
    rubro: 'Refrigeración',
    name: 'Sistema Multi-Split 3 Zonas',
    description: 'Sistema de climatización multi-split para 3 ambientes con unidad exterior compartida',
    icon: '🌡️',
    items: [
      { section: 'equipos', description: 'Unidad exterior multi-split 24000 BTU', unit: 'Und', quantity: 1, price: 0 },
      { section: 'equipos', description: 'Unidad interior split 9000 BTU pared', unit: 'Und', quantity: 2, price: 0 },
      { section: 'equipos', description: 'Unidad interior split 12000 BTU pared', unit: 'Und', quantity: 1, price: 0 },
      { section: 'equipos', description: 'Control remoto inalámbrico', unit: 'Und', quantity: 3, price: 0 },
      { section: 'materiales', description: 'Kit tubería cobre 1/4"×3/8" 5m por zona', unit: 'Kit', quantity: 3, price: 0 },
      { section: 'materiales', description: 'Cable eléctrico 3×12 AWG (m)', unit: 'Mt', quantity: 20, price: 0 },
      { section: 'materiales', description: 'Soporte metálico condensadora', unit: 'Und', quantity: 1, price: 0 },
      { section: 'materiales', description: 'Cinta armaflex y accesorios', unit: 'Gbl', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Instalación sistema multi-split completo', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Carga de refrigerante R-410A', unit: 'Libra', quantity: 5, price: 0 },
      { section: 'mano_de_obra', description: 'Pruebas y balanceo del sistema', unit: 'Servicio', quantity: 1, price: 0 },
    ],
  },
  {
    id: 'kit-ref-mantenimiento',
    rubro: 'Refrigeración',
    name: 'Mantenimiento Preventivo A/C',
    description: 'Mantenimiento preventivo completo para equipos de aire acondicionado split',
    icon: '🔧',
    items: [
      { section: 'equipos', description: 'Filtro de repuesto para unidad interior', unit: 'Und', quantity: 2, price: 0 },
      { section: 'materiales', description: 'Limpiador de serpentines (spray)', unit: 'Und', quantity: 2, price: 0 },
      { section: 'materiales', description: 'Refrigerante R-410A (si requiere recarga)', unit: 'Libra', quantity: 0, price: 0 },
      { section: 'materiales', description: 'Cinta aislante y materiales menores', unit: 'Gbl', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Lavado de filtros y serpentines', unit: 'Equipo', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Revisión y limpieza de drenaje', unit: 'Equipo', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Medición de presiones y corrientes', unit: 'Equipo', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Informe técnico de estado', unit: 'Servicio', quantity: 1, price: 0 },
    ],
  },
]

// ── Electromecánica ────────────────────────────────────────────────────────────

const ELECTROMECANICA_KITS: BudgetKit[] = [
  {
    id: 'kit-eme-bomba-agua',
    rubro: 'Electromecánica',
    name: 'Sistema de Bombeo de Agua',
    description: 'Suministro e instalación de sistema de bombeo para tanque elevado o presión constante',
    icon: '💧',
    items: [
      { section: 'equipos', description: 'Bomba centrífuga 1HP 220V monofásica', unit: 'Und', quantity: 1, price: 0 },
      { section: 'equipos', description: 'Presostato ajustable 20-60 PSI', unit: 'Und', quantity: 1, price: 0 },
      { section: 'equipos', description: 'Tanque hidroneumático 20 litros', unit: 'Und', quantity: 1, price: 0 },
      { section: 'equipos', description: 'Arrancador directo con guardamotor', unit: 'Und', quantity: 1, price: 0 },
      { section: 'materiales', description: 'Tubería PVC 1" presión (m)', unit: 'Mt', quantity: 15, price: 0 },
      { section: 'materiales', description: 'Válvula check 1" bronce', unit: 'Und', quantity: 2, price: 0 },
      { section: 'materiales', description: 'Válvula de compuerta 1" bronce', unit: 'Und', quantity: 2, price: 0 },
      { section: 'materiales', description: 'Cable THHW-LS 2×12 AWG (m)', unit: 'Mt', quantity: 10, price: 0 },
      { section: 'materiales', description: 'Accesorios y tornillería', unit: 'Gbl', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Instalación mecánica de bomba y tuberías', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Conexión eléctrica y tablero', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Pruebas hidráulicas y ajuste', unit: 'Servicio', quantity: 1, price: 0 },
    ],
  },
  {
    id: 'kit-eme-motor-variador',
    rubro: 'Electromecánica',
    name: 'Motor + Variador de Frecuencia',
    description: 'Suministro e instalación de motor eléctrico con variador de velocidad',
    icon: '⚙️',
    items: [
      { section: 'equipos', description: 'Motor eléctrico trifásico 5HP 1750rpm IE3', unit: 'Und', quantity: 1, price: 0 },
      { section: 'equipos', description: 'Variador de frecuencia 5HP 380V (ABB/Danfoss)', unit: 'Und', quantity: 1, price: 0 },
      { section: 'equipos', description: 'Guardamotor ajustable 9-14A', unit: 'Und', quantity: 1, price: 0 },
      { section: 'equipos', description: 'Contactor 25A 220V con bobina', unit: 'Und', quantity: 1, price: 0 },
      { section: 'materiales', description: 'Cable apantallado 3×10 AWG para variador (m)', unit: 'Mt', quantity: 15, price: 0 },
      { section: 'materiales', description: 'Cable THHW-LS 3×10 AWG entrada variador (m)', unit: 'Mt', quantity: 10, price: 0 },
      { section: 'materiales', description: 'Riel DIN y accesorios de tablero', unit: 'Gbl', quantity: 1, price: 0 },
      { section: 'materiales', description: 'Ferretería y tornillería', unit: 'Gbl', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Instalación mecánica del motor', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Montaje y cableado del variador', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Programación y ajuste del variador', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Pruebas de carga y curvas', unit: 'Servicio', quantity: 1, price: 0 },
    ],
  },
  {
    id: 'kit-eme-mantenimiento',
    rubro: 'Electromecánica',
    name: 'Mantenimiento Equipos Electromecánicos',
    description: 'Mantenimiento preventivo anual de equipos electromecánicos industriales',
    icon: '🔩',
    items: [
      { section: 'materiales', description: 'Rodamientos 6205-2RS (par)', unit: 'Par', quantity: 2, price: 0 },
      { section: 'materiales', description: 'Grasa lubricante polivalente (kg)', unit: 'Kg', quantity: 1, price: 0 },
      { section: 'materiales', description: 'Limpiador de contactos eléctricos', unit: 'Und', quantity: 2, price: 0 },
      { section: 'materiales', description: 'Cinta aislante de alta temperatura', unit: 'Und', quantity: 2, price: 0 },
      { section: 'mano_de_obra', description: 'Inspección y diagnóstico general', unit: 'Equipo', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Cambio de rodamientos y lubricación', unit: 'Equipo', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Revisión de conexiones eléctricas', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Medición de vibraciones y temperatura', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Informe técnico y recomendaciones', unit: 'Servicio', quantity: 1, price: 0 },
    ],
  },
]

// ── Servicios Generales ────────────────────────────────────────────────────────

const SERVICIOS_GENERALES_KITS: BudgetKit[] = [
  {
    id: 'kit-sg-limpieza-industrial',
    rubro: 'Servicios Generales',
    name: 'Limpieza Industrial Profunda',
    description: 'Servicio de limpieza profunda para planta industrial o almacén',
    icon: '🧹',
    items: [
      { section: 'materiales', description: 'Detergente industrial desengrasante (litros)', unit: 'Lt', quantity: 20, price: 0 },
      { section: 'materiales', description: 'Desinfectante ambiental (litros)', unit: 'Lt', quantity: 10, price: 0 },
      { section: 'materiales', description: 'Guantes y EPP para personal', unit: 'Kit', quantity: 4, price: 0 },
      { section: 'materiales', description: 'Bolsas industriales de residuos', unit: 'Und', quantity: 30, price: 0 },
      { section: 'mano_de_obra', description: 'Limpieza de pisos y superficies', unit: 'Hora', quantity: 16, price: 0 },
      { section: 'mano_de_obra', description: 'Limpieza de altura (andamios)', unit: 'Hora', quantity: 8, price: 0 },
      { section: 'mano_de_obra', description: 'Disposición y retiro de residuos', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Transporte y logística', unit: 'Servicio', quantity: 1, price: 0 },
    ],
  },
  {
    id: 'kit-sg-pintura',
    rubro: 'Servicios Generales',
    name: 'Pintura y Acabados',
    description: 'Servicio de pintura interior/exterior para oficina o vivienda',
    icon: '🎨',
    items: [
      { section: 'materiales', description: 'Pintura látex interior base agua (galón)', unit: 'Galón', quantity: 10, price: 0 },
      { section: 'materiales', description: 'Sellador / primer (galón)', unit: 'Galón', quantity: 5, price: 0 },
      { section: 'materiales', description: 'Masilla corriente (cubo 20kg)', unit: 'Und', quantity: 2, price: 0 },
      { section: 'materiales', description: 'Rodillo y accesorios de pintura', unit: 'Kit', quantity: 2, price: 0 },
      { section: 'materiales', description: 'Cinta de enmascarar y plástico protector', unit: 'Gbl', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Preparación de superficies (masillado)', unit: 'M2', quantity: 0, price: 0 },
      { section: 'mano_de_obra', description: 'Aplicación de sellador y pintura', unit: 'M2', quantity: 0, price: 0 },
      { section: 'mano_de_obra', description: 'Limpieza final y desmontaje', unit: 'Servicio', quantity: 1, price: 0 },
    ],
  },
  {
    id: 'kit-sg-jardineria',
    rubro: 'Servicios Generales',
    name: 'Mantenimiento de Jardín',
    description: 'Servicio mensual de mantenimiento de áreas verdes y jardines',
    icon: '🌿',
    items: [
      { section: 'materiales', description: 'Abono orgánico (saco 25kg)', unit: 'Saco', quantity: 2, price: 0 },
      { section: 'materiales', description: 'Herbicida selectivo (litro)', unit: 'Lt', quantity: 2, price: 0 },
      { section: 'materiales', description: 'Tierra preparada / sustrato (saco)', unit: 'Saco', quantity: 3, price: 0 },
      { section: 'mano_de_obra', description: 'Corte y perfilado de césped', unit: 'Hora', quantity: 4, price: 0 },
      { section: 'mano_de_obra', description: 'Poda de arbustos y árboles', unit: 'Hora', quantity: 4, price: 0 },
      { section: 'mano_de_obra', description: 'Fertilización y control de plagas', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Retiro de material vegetal', unit: 'Servicio', quantity: 1, price: 0 },
    ],
  },
]

// ── Export ─────────────────────────────────────────────────────────────────────

export const BUDGET_KITS: BudgetKit[] = [
  ...CCTV_KITS,
  ...ELECTRICIDAD_KITS,
  ...REFRIGERACION_KITS,
  ...ELECTROMECANICA_KITS,
  ...SERVICIOS_GENERALES_KITS,
]

export function getKitsByRubro(rubro: string): BudgetKit[] {
  return BUDGET_KITS.filter((k) => k.rubro === rubro)
}
