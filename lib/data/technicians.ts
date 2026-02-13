//  Shared technician data & types used across the app
//  In a real app this would come from a DB via an API layer

export type TechSpecialty =
  | "HVAC"
  | "Electricidad"
  | "Plomeria"
  | "Gas"
  | "Solar"
  | "General"

export type TechStatus = "disponible" | "ocupado" | "en_viaje" | "en_ruta" | "en_sitio" | "desconectado" | "descuento" | "inactivo"

export interface Certification {
  name: string
  issuer: string
  expires: string // ISO date
}

export interface TechnicianProfile {
  id: string
  name: string
  initials: string
  email: string
  phone: string
  role: string
  specialties: TechSpecialty[]
  certifications: Certification[]
  status: TechStatus
  rating: number // 1-5
  completedJobs: number
  avgResponseMin: number
  joinDate: string // ISO date
  latitude: number
  longitude: number
  address: string
  availability: {
    days: string[] // e.g. ["Lun","Mar","Mie","Jue","Vie"]
    startHour: number
    endHour: number
  }
  photoUrl?: string
}

export const technicianProfiles: TechnicianProfile[] = [
  {
    id: "tech-1",
    name: "Luis Hernandez",
    initials: "LH",
    email: "luis.hernandez@servicepro.mx",
    phone: "+52 55 1234 5678",
    role: "Especialista HVAC Senior",
    specialties: ["HVAC", "Gas"],
    certifications: [
      { name: "Certificacion HVAC Nivel III", issuer: "CONOCER", expires: "2027-03-15" },
      { name: "Manejo de Refrigerantes", issuer: "EPA Mexico", expires: "2026-11-01" },
    ],
    status: "ocupado",
    rating: 4.8,
    completedJobs: 347,
    avgResponseMin: 22,
    joinDate: "2021-06-10",
    latitude: 19.4326,
    longitude: -99.1332,
    address: "Col. Centro, CDMX",
    availability: { days: ["Lun", "Mar", "Mie", "Jue", "Vie"], startHour: 7, endHour: 17 },
  },
  {
    id: "tech-2",
    name: "Ana Torres",
    initials: "AT",
    email: "ana.torres@servicepro.mx",
    phone: "+52 55 9876 5432",
    role: "Electricista Senior",
    specialties: ["Electricidad", "Solar"],
    certifications: [
      { name: "Electricista Certificado NOM-001", issuer: "CONOCER", expires: "2027-01-20" },
      { name: "Instalacion Solar Fotovoltaica", issuer: "ANCE", expires: "2026-09-30" },
    ],
    status: "ocupado",
    rating: 4.9,
    completedJobs: 289,
    avgResponseMin: 18,
    joinDate: "2022-01-15",
    latitude: 19.4205,
    longitude: -99.1684,
    address: "Col. Roma, CDMX",
    availability: { days: ["Lun", "Mar", "Mie", "Jue", "Vie"], startHour: 8, endHour: 18 },
  },
  {
    id: "tech-3",
    name: "Pedro Sanchez",
    initials: "PS",
    email: "pedro.sanchez@servicepro.mx",
    phone: "+52 55 5555 1234",
    role: "Plomero Certificado",
    specialties: ["Plomeria", "Gas"],
    certifications: [
      { name: "Plomeria Industrial", issuer: "CMIC", expires: "2026-07-12" },
    ],
    status: "disponible",
    rating: 4.5,
    completedJobs: 215,
    avgResponseMin: 28,
    joinDate: "2022-08-20",
    latitude: 19.3910,
    longitude: -99.1564,
    address: "Col. Del Valle, CDMX",
    availability: { days: ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab"], startHour: 7, endHour: 16 },
  },
  {
    id: "tech-4",
    name: "Sofia Morales",
    initials: "SM",
    email: "sofia.morales@servicepro.mx",
    phone: "+52 55 4321 8765",
    role: "Inspectora de Gas",
    specialties: ["Gas", "HVAC"],
    certifications: [
      { name: "Inspeccion de Gas NOM-002", issuer: "CRE", expires: "2026-12-01" },
      { name: "Seguridad Industrial", issuer: "STPS", expires: "2027-02-28" },
    ],
    status: "disponible",
    rating: 4.7,
    completedJobs: 178,
    avgResponseMin: 20,
    joinDate: "2023-03-01",
    latitude: 19.4370,
    longitude: -99.1430,
    address: "Col. Juarez, CDMX",
    availability: { days: ["Lun", "Mar", "Mie", "Jue", "Vie"], startHour: 8, endHour: 17 },
  },
  {
    id: "tech-5",
    name: "Carlos Vega",
    initials: "CV",
    email: "carlos.vega@servicepro.mx",
    phone: "+52 55 6789 0123",
    role: "Tecnico en Paneles Solares",
    specialties: ["Solar", "Electricidad"],
    certifications: [
      { name: "Instalador Solar Certificado", issuer: "ANCE", expires: "2027-05-15" },
    ],
    status: "ocupado",
    rating: 4.6,
    completedJobs: 132,
    avgResponseMin: 25,
    joinDate: "2023-09-12",
    latitude: 19.4450,
    longitude: -99.1200,
    address: "Col. Tepeyac, CDMX",
    availability: { days: ["Lun", "Mar", "Mie", "Jue", "Vie"], startHour: 7, endHour: 16 },
  },
  {
    id: "tech-6",
    name: "Miguel Flores",
    initials: "MF",
    email: "miguel.flores@servicepro.mx",
    phone: "+52 55 3456 7890",
    role: "Mantenimiento General",
    specialties: ["General", "Plomeria"],
    certifications: [
      { name: "Mantenimiento Edificios", issuer: "CMIC", expires: "2026-08-20" },
    ],
    status: "disponible",
    rating: 4.3,
    completedJobs: 201,
    avgResponseMin: 32,
    joinDate: "2021-11-05",
    latitude: 19.4100,
    longitude: -99.1700,
    address: "Col. Narvarte, CDMX",
    availability: { days: ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab"], startHour: 6, endHour: 15 },
  },
  {
    id: "tech-7",
    name: "Gabriela Rios",
    initials: "GR",
    email: "gabriela.rios@servicepro.mx",
    phone: "+52 55 2345 6789",
    role: "Especialista HVAC",
    specialties: ["HVAC"],
    certifications: [
      { name: "Certificacion HVAC Nivel II", issuer: "CONOCER", expires: "2027-04-01" },
    ],
    status: "desconectado",
    rating: 4.4,
    completedJobs: 98,
    avgResponseMin: 24,
    joinDate: "2024-02-18",
    latitude: 19.4260,
    longitude: -99.1900,
    address: "Col. Tacubaya, CDMX",
    availability: { days: ["Lun", "Mar", "Mie", "Jue", "Vie"], startHour: 8, endHour: 17 },
  },
  {
    id: "tech-8",
    name: "Ricardo Mendoza",
    initials: "RM",
    email: "ricardo.mendoza@servicepro.mx",
    phone: "+52 55 8901 2345",
    role: "Electricista Junior",
    specialties: ["Electricidad", "General"],
    certifications: [
      { name: "Electricista Basico", issuer: "CONOCER", expires: "2026-06-15" },
    ],
    status: "en_viaje",
    rating: 4.1,
    completedJobs: 67,
    avgResponseMin: 35,
    joinDate: "2024-08-01",
    latitude: 19.4500,
    longitude: -99.1100,
    address: "Col. Lindavista, CDMX",
    availability: { days: ["Lun", "Mar", "Mie", "Jue", "Vie"], startHour: 8, endHour: 18 },
  },
]
