// Catálogo de productos Centronic CCTV
export const CATALOGO_PRODUCTOS = {
  // EQUIPOS PRINCIPALES
  equiposPrincipales: [
    // Cámaras IP
    { nombre: "Cámara Oculta IP Tipo PinHole", marca: "Visualarm", modelo: "VSA-PH1-IP", categoria: "Cámara IP", precio: 0 },
    { nombre: "Bullet IP 30m IR / PoE", marca: "Hikvision", modelo: "DS-2CD1023G0-I", categoria: "Cámara IP 2MP", precio: 0 },
    { nombre: "Bullet IP AUDIO-MIC / 30m IR", marca: "Hikvision", modelo: "DS-2CD1023G0-IU", categoria: "Cámara IP 2MP", precio: 0 },
    { nombre: "Domo IP AUDIO-MIC / 30m IR", marca: "Hikvision", modelo: "DS-2CD1323G0E-IU", categoria: "Cámara IP 2MP", precio: 0 },
    { nombre: "Domo IP AUDIO + Alarma / 30m IR", marca: "Hikvision", modelo: "DS-2CD2143G0-IS", categoria: "Cámara IP 2MP", precio: 0 },
    { nombre: "Bullet IP 30m IR / PoE 4MP", marca: "Hikvision", modelo: "DS-2CD1043G0-I", categoria: "Cámara IP 4MP", precio: 0 },
    { nombre: "Domo IP 30m IR / PoE 4MP", marca: "Hikvision", modelo: "DS-2CD1143G0-I", categoria: "Cámara IP 4MP", precio: 0 },
    { nombre: "Bullet IP DarkFighter 30m IR 4MP", marca: "Hikvision", modelo: "DS-2CD2043G2-I", categoria: "Cámara IP 4MP", precio: 0 },
    { nombre: "Bullet IP 30m IR / PoE 6MP", marca: "Hikvision", modelo: "DS-2CD2063G0-I", categoria: "Cámara IP 6MP", precio: 0 },
    { nombre: "Bullet IP AUDIO-MIC / 30m IR 6MP", marca: "Hikvision", modelo: "DS-2CD2163G0-IU", categoria: "Cámara IP 6MP", precio: 0 },
    { nombre: "Bullet IP 80m IR 6MP", marca: "Hikvision", modelo: "DS-2CD2063G0-I", categoria: "Cámara IP 6MP", precio: 0 },
    { nombre: "Bullet IP 30m IR / PoE 8MP/4K", marca: "Hikvision", modelo: "DS-2CD2083G0-I", categoria: "Cámara IP 8MP", precio: 0 },
    { nombre: "Bullet IP AUDIO-IN / 30m IR 8MP", marca: "Hikvision", modelo: "DS-2CD2183G0-IS", categoria: "Cámara IP 8MP", precio: 0 },
    
    // Cámaras ColorVu IP
    { nombre: "Bullet IP ColorVu 30m Luz Blanca 2MP", marca: "Hikvision", modelo: "DS-2CD2T27G3E-L", categoria: "Cámara ColorVu", precio: 0 },
    { nombre: "Bullet IP ColorVu 30m Luz Blanca 4MP", marca: "Hikvision", modelo: "DS-2CD2T47G3E-L", categoria: "Cámara ColorVu", precio: 0 },
    
    // Cámaras PTZ IP
    { nombre: "PTZ IP 15X Zoom Óptico / IR 100m 2MP", marca: "Hikvision", modelo: "DS-2DE4215IW-DE", categoria: "Cámara PTZ", precio: 0 },
    { nombre: "PTZ IP 25X Zoom Óptico / IR 100m 2MP", marca: "Hikvision", modelo: "DS-2DE4225IW-DE", categoria: "Cámara PTZ", precio: 0 },
    
    // Cámaras TurboHD
    { nombre: "Mini Bullet TurboHD 20m IR 720P", marca: "Hikvision", modelo: "DS-2CE16C0T-IRPF", categoria: "Cámara TurboHD", precio: 0 },
    { nombre: "Domo Interno TurboHD 20m IR 720P", marca: "Hikvision", modelo: "DS-2CE56C0T-IRPF", categoria: "Cámara TurboHD", precio: 0 },
    { nombre: "Cámara Oculta PinHole AHD-TVI 1080P", marca: "Visualarm", modelo: "VSA-PH1", categoria: "Cámara TurboHD", precio: 0 },
    { nombre: "Cámara Oculta Sensor PIR AHD-TVI 1080P", marca: "Visualarm", modelo: "VSA-PIR1", categoria: "Cámara TurboHD", precio: 0 },
    
    // DVR Grabadores
    { nombre: "DVR 4ch TurboHD serie HGHI", marca: "Hikvision", modelo: "DS-7104HGHI-F1", categoria: "Grabador DVR", precio: 0 },
    { nombre: "DVR 8ch TurboHD serie HGHI", marca: "Hikvision", modelo: "DS-7108HGHI-F1/N", categoria: "Grabador DVR", precio: 0 },
    { nombre: "DVR 4ch TurboHD serie HQHI Plástico", marca: "Hikvision", modelo: "DS-7104HQHI-K1", categoria: "Grabador DVR", precio: 0 },
    { nombre: "DVR 4ch TurboHD serie HQHI Metálico", marca: "Hikvision", modelo: "DS-7204HQHI-K1", categoria: "Grabador DVR", precio: 0 },
    { nombre: "DVR 16ch TurboHD serie HQHI", marca: "Hikvision", modelo: "DS-7116HQHI-K1", categoria: "Grabador DVR", precio: 0 },
    { nombre: "DVR 32ch TurboHD serie HQHI Metálico", marca: "Hikvision", modelo: "DS-7332HGHI-SH", categoria: "Grabador DVR", precio: 0 },
    
    // NVR Grabadores
    { nombre: "NVR 4ch sin PoE 1xHDD", marca: "Hikvision", modelo: "DS-7104NI-Q1/M", categoria: "Grabador NVR", precio: 0 },
    { nombre: "NVR 8ch sin PoE 1xHDD", marca: "Hikvision", modelo: "DS-7108NI-Q1/M", categoria: "Grabador NVR", precio: 0 },
    { nombre: "NVR 4ch con PoE 1xHDD", marca: "Hikvision", modelo: "DS-7104NI-Q1/4P/M", categoria: "Grabador NVR", precio: 0 },
    { nombre: "NVR 8ch con PoE 2xHDD", marca: "Hikvision", modelo: "DS-7608NI-K2/8P", categoria: "Grabador NVR", precio: 0 },
  ],
  
  // MATERIALES DE INSTALACIÓN
  materialesInstalacion: [
    // Cables UTP
    { nombre: "Cable UTP Cat.5e 100m Interior", marca: "Prismatic", modelo: "PRM-L208/100", categoria: "Cable UTP", precio: 0 },
    { nombre: "Cable UTP Cat.5e 100m Exterior PVC", marca: "Prismatic", modelo: "PRM-L158/100", categoria: "Cable UTP", precio: 0 },
    { nombre: "Cable UTP Cat.5e 100% Cobre 100m", marca: "Visualarm", modelo: "Ref. 208", categoria: "Cable UTP", precio: 0 },
    { nombre: "Cable UTP Cat.5e 100% Cobre 305m", marca: "Visualarm", modelo: "Ref. 208", categoria: "Cable UTP", precio: 0 },
    { nombre: "Cable UTP Cat.5e 305m Exterior Antillama", marca: "Visualarm", modelo: "Ref. 1526", categoria: "Cable UTP", precio: 0 },
    { nombre: "Cable UTP Cat.5e + Par Alimentación 100m", marca: "Visualarm", modelo: "Ref. 529", categoria: "Cable UTP", precio: 0 },
    { nombre: "Cable UTP Cat.5e 305m Interior", marca: "HiLook", modelo: "NC-5EAU-G", categoria: "Cable UTP", precio: 0 },
    
    // Conectores y Balunes
    { nombre: "Conector RJ45 Cat.5e Macho", marca: "Visualarm", modelo: "VSA-RCAT5C01", categoria: "Conector", precio: 0 },
    { nombre: "Conector RJ45 Cat.6 Macho", marca: "Visualarm", modelo: "VSA-RCAT6C01", categoria: "Conector", precio: 0 },
    { nombre: "Conector Alimentación 12V Bornera", marca: "Visualarm", modelo: "DCM-BOR", categoria: "Conector", precio: 0 },
    { nombre: "Video Balun HD Pasivo Hasta 4K", marca: "Visualarm", modelo: "Ref. 469", categoria: "Balun", precio: 0 },
    { nombre: "Batería 12V 7Ah AGM", marca: "General", modelo: "Ref. 843", categoria: "Batería", precio: 0 },
    
    // Switches PoE
    { nombre: "Switch LAN 5 puertos SIN PoE", marca: "Hikvision", modelo: "DS-3E0105D-E", categoria: "Switch", precio: 0 },
    { nombre: "Switch LAN 8 puertos SIN PoE", marca: "Hikvision", modelo: "DS-3E0108D-E", categoria: "Switch", precio: 0 },
    { nombre: "Switch PoE 5 puertos (4P PoE + 1 Uplink)", marca: "Hikvision", modelo: "Ref. 487", categoria: "Switch PoE", precio: 0 },
    { nombre: "Switch PoE 9 puertos (8P PoE + 1 Uplink)", marca: "Hikvision", modelo: "Ref. 486", categoria: "Switch PoE", precio: 0 },
    { nombre: "Switch PoE 9 puertos PoE 250m", marca: "Hikvision", modelo: "Ref. 1330", categoria: "Switch PoE", precio: 0 },
    { nombre: "Switch PoE 18 puertos (16P + 1 RJ45 + SFP)", marca: "Hikvision", modelo: "Ref. 1331", categoria: "Switch PoE", precio: 0 },
    { nombre: "Switch PoE 18 puertos (16P + 2 RJ45 + 2 SFP)", marca: "Hikvision", modelo: "Ref. 647", categoria: "Switch PoE", precio: 0 },
    { nombre: "Switch PoE 26 puertos (24P + 1 RJ45 + SFP)", marca: "Hikvision", modelo: "Ref. 1362", categoria: "Switch PoE", precio: 0 },
    
    // Discos Duros
    { nombre: "Disco Duro Purple 1TB SATA CCTV", marca: "Western Digital", modelo: "WD10PURX", categoria: "Disco Duro", precio: 0 },
    { nombre: "Disco Duro Purple 2TB SATA CCTV", marca: "Western Digital", modelo: "WD20PURX", categoria: "Disco Duro", precio: 0 },
    { nombre: "Disco Duro Purple 4TB SATA CCTV", marca: "Western Digital", modelo: "WD42PURZ", categoria: "Disco Duro", precio: 0 },
    
    // Fuentes de Alimentación
    { nombre: "Fuente Alimentación 12V 2A Plástico", marca: "Visualarm", modelo: "VSA-12V2A-P", categoria: "Fuente 12V", precio: 0 },
    { nombre: "Fuente Alimentación 12V 3A Plástico", marca: "Visualarm", modelo: "VSA-12V3A-P", categoria: "Fuente 12V", precio: 0 },
    
    // UPS
    { nombre: "UPS 800VA 480W Línea Interactiva", marca: "Centronet", modelo: "CTR-UPS800VA", categoria: "UPS", precio: 0 },
    { nombre: "UPS 1500VA 900W Línea Interactiva", marca: "Centronet", modelo: "CTR-UPS1500VA", categoria: "UPS", precio: 0 },
    { nombre: "UPS 2000VA 1200W Línea Interactiva", marca: "Centronet", modelo: "Ref. 1461", categoria: "UPS", precio: 0 },
  ]
}
