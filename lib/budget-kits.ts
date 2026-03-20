// Kits predefinidos de presupuestos CCTV
export interface BudgetKit {
  id: string
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

export const BUDGET_KITS: BudgetKit[] = [
  {
    id: 'kit-basico-4cam',
    name: 'Kit Básico 4 Cámaras IP 2MP',
    description: 'Sistema completo para 4 cámaras IP 2MP con NVR 4ch PoE, instalación y configuración',
    icon: '📹',
    items: [
      // Equipos
      { section: 'equipos', description: 'Bullet IP 30m IR / PoE (Hikvision DS-2CD1023G0-I)', unit: 'Und', quantity: 4, price: 0 },
      { section: 'equipos', description: 'NVR 4ch con PoE 1xHDD (Hikvision DS-7104NI-Q1/4P/M)', unit: 'Und', quantity: 1, price: 0 },
      { section: 'equipos', description: 'Disco Duro Purple 1TB SATA CCTV (WD10PURX)', unit: 'Und', quantity: 1, price: 0 },
      { section: 'equipos', description: 'Fuente Alimentación 12V 2A Plástico (VSA-12V2A-P)', unit: 'Und', quantity: 1, price: 0 },
      // Materiales
      { section: 'materiales', description: 'Cable UTP Cat.5e 100% Cobre 100m', unit: 'Rollo', quantity: 1, price: 0 },
      { section: 'materiales', description: 'Conector RJ45 Cat.5e Macho (pack 20)', unit: 'Pack', quantity: 2, price: 0 },
      { section: 'materiales', description: 'Video Balun HD Pasivo Hasta 4K', unit: 'Und', quantity: 4, price: 0 },
      // Mano de obra
      { section: 'mano_de_obra', description: 'Instalación cableado estructurado (4 puntos)', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Montaje y fijación de cámaras', unit: 'Und', quantity: 4, price: 0 },
      { section: 'mano_de_obra', description: 'Configuración NVR y cámaras', unit: 'Servicio', quantity: 1, price: 0 },
    ]
  },
  {
    id: 'kit-estandar-8cam',
    name: 'Kit Estándar 8 Cámaras IP 4MP',
    description: 'Sistema profesional con 8 cámaras IP 4MP, NVR 8ch PoE, UPS 1500VA, rack 12U',
    icon: '📹📹',
    items: [
      // Equipos
      { section: 'equipos', description: 'Bullet IP 30m IR / PoE 4MP (Hikvision DS-2CD1043G0-I)', unit: 'Und', quantity: 4, price: 0 },
      { section: 'equipos', description: 'Domo IP 30m IR / PoE 4MP (Hikvision DS-2CD1143G0-I)', unit: 'Und', quantity: 4, price: 0 },
      { section: 'equipos', description: 'NVR 8ch con PoE 2xHDD (Hikvision DS-7608NI-K2/8P)', unit: 'Und', quantity: 1, price: 0 },
      { section: 'equipos', description: 'Disco Duro Purple 2TB SATA CCTV (WD20PURX)', unit: 'Und', quantity: 2, price: 0 },
      { section: 'equipos', description: 'Switch PoE 9 puertos (8P PoE + 1 Uplink)', unit: 'Und', quantity: 1, price: 0 },
      { section: 'equipos', description: 'UPS 1500VA 900W Línea Interactiva (CTR-UPS1500VA)', unit: 'Und', quantity: 1, price: 0 },
      // Materiales
      { section: 'materiales', description: 'Cable UTP Cat.5e 100% Cobre 305m', unit: 'Rollo', quantity: 2, price: 0 },
      { section: 'materiales', description: 'Conector RJ45 Cat.5e Macho (pack 20)', unit: 'Pack', quantity: 4, price: 0 },
      { section: 'materiales', description: 'Video Balun HD Pasivo Hasta 4K', unit: 'Und', quantity: 8, price: 0 },
      { section: 'materiales', description: 'Batería 12V 7Ah AGM', unit: 'Und', quantity: 2, price: 0 },
      // Mano de obra
      { section: 'mano_de_obra', description: 'Instalación cableado estructurado (8 puntos)', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Montaje y fijación de cámaras', unit: 'Und', quantity: 8, price: 0 },
      { section: 'mano_de_obra', description: 'Configuración NVR, cámaras y acceso remoto', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Capacitación al personal del cliente', unit: 'Hora', quantity: 2, price: 0 },
    ]
  },
  {
    id: 'kit-premium-16cam',
    name: 'Kit Premium 16 Cámaras 4K',
    description: 'Sistema enterprise con 16 cámaras 8MP 4K, NVR 16ch, UPS 2000VA, monitor profesional',
    icon: '📺',
    items: [
      // Equipos
      { section: 'equipos', description: 'Bullet IP 30m IR / PoE 8MP/4K (Hikvision DS-2CD2083G0-I)', unit: 'Und', quantity: 8, price: 0 },
      { section: 'equipos', description: 'Bullet IP AUDIO-IN / 30m IR 8MP (Hikvision DS-2CD2183G0-IS)', unit: 'Und', quantity: 8, price: 0 },
      { section: 'equipos', description: 'NVR 8ch con PoE 2xHDD (Hikvision DS-7608NI-K2/8P)', unit: 'Und', quantity: 2, price: 0 },
      { section: 'equipos', description: 'Disco Duro Purple 4TB SATA CCTV (WD42PURZ)', unit: 'Und', quantity: 4, price: 0 },
      { section: 'equipos', description: 'Switch PoE 18 puertos (16P + 2 RJ45 + 2 SFP)', unit: 'Und', quantity: 1, price: 0 },
      { section: 'equipos', description: 'UPS 2000VA 1200W Línea Interactiva', unit: 'Und', quantity: 1, price: 0 },
      // Materiales
      { section: 'materiales', description: 'Cable UTP Cat.6 100% Cobre 305m', unit: 'Rollo', quantity: 3, price: 0 },
      { section: 'materiales', description: 'Conector RJ45 Cat.6 Macho (pack 20)', unit: 'Pack', quantity: 8, price: 0 },
      { section: 'materiales', description: 'Video Balun HD Pasivo Hasta 4K', unit: 'Und', quantity: 16, price: 0 },
      { section: 'materiales', description: 'Batería 12V 7Ah AGM', unit: 'Und', quantity: 4, price: 0 },
      // Mano de obra
      { section: 'mano_de_obra', description: 'Instalación cableado estructurado completo', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Montaje y fijación de cámaras', unit: 'Und', quantity: 16, price: 0 },
      { section: 'mano_de_obra', description: 'Configuración NVR redundante y cámaras', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Instalación eléctrica y UPS', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Capacitación gerencial al personal', unit: 'Hora', quantity: 4, price: 0 },
    ]
  },
  {
    id: 'kit-economico-turbohd',
    name: 'Kit TurboHD Económico 4ch',
    description: 'Sistema económico con 4 cámaras TurboHD 720P, DVR 4ch, todo incluido',
    icon: '📹',
    items: [
      // Equipos
      { section: 'equipos', description: 'Mini Bullet TurboHD 20m IR 720P (DS-2CE16C0T-IRPF)', unit: 'Und', quantity: 4, price: 0 },
      { section: 'equipos', description: 'DVR 4ch TurboHD serie HGHI (DS-7104HGHI-F1)', unit: 'Und', quantity: 1, price: 0 },
      { section: 'equipos', description: 'Disco Duro Purple 1TB SATA CCTV', unit: 'Und', quantity: 1, price: 0 },
      // Materiales
      { section: 'materiales', description: 'Cable UTP Cat.5e + Par Alimentación 100m', unit: 'Rollo', quantity: 1, price: 0 },
      { section: 'materiales', description: 'Conector RJ45 Cat.5e Macho (pack 20)', unit: 'Pack', quantity: 1, price: 0 },
      { section: 'materiales', description: 'Video Balun HD Pasivo Hasta 4K', unit: 'Und', quantity: 4, price: 0 },
      { section: 'materiales', description: 'Conector Alimentación 12V Bornera', unit: 'Und', quantity: 4, price: 0 },
      // Mano de obra
      { section: 'mano_de_obra', description: 'Instalación cableado y alimentación', unit: 'Servicio', quantity: 1, price: 0 },
      { section: 'mano_de_obra', description: 'Montaje y fijación de cámaras', unit: 'Und', quantity: 4, price: 0 },
      { section: 'mano_de_obra', description: 'Configuración DVR básica', unit: 'Servicio', quantity: 1, price: 0 },
    ]
  }
]
