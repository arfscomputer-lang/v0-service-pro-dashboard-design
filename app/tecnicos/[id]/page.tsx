"use client"

import React, { use, useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { TopHeader } from "@/components/dashboard/top-header"
import { useTechnicians } from "@/lib/context/technicians-context"
import { TechFormDialog } from "@/components/technicians/tech-form-dialog"
import type { TechFormData } from "@/components/technicians/tech-form-dialog"
import { DeleteTechDialog } from "@/components/technicians/delete-tech-dialog"
import type { TechStatus, TechSpecialty, Certification } from "@/lib/data/technicians"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  Clock,
  CalendarDays,
  Shield,
  Zap,
  Flame,
  Droplets,
  Sun,
  Wrench,
  Wind,
  CheckCircle2,
  TrendingUp,
  Navigation,
  Timer,
  Award,
  Briefcase,
  Calendar,
  Pencil,
  Trash2,
  Save,
  X,
  Plus,
} from "lucide-react"

// ── Config ────────────────────────────────────────────────────

const statusConfig: Record<TechStatus, { label: string; dot: string; bg: string }> = {
  disponible: { label: "Disponible", dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700" },
  ocupado: { label: "Ocupado", dot: "bg-amber-500", bg: "bg-amber-50 text-amber-700" },
  en_viaje: { label: "En Viaje", dot: "bg-blue-500", bg: "bg-blue-50 text-blue-700" },
  desconectado: { label: "Desconectado", dot: "bg-gray-400", bg: "bg-gray-100 text-gray-500" },
}

const specialtyIcons: Record<TechSpecialty, React.ReactNode> = {
  HVAC: <Wind className="h-4 w-4" />,
  Electricidad: <Zap className="h-4 w-4" />,
  Plomeria: <Droplets className="h-4 w-4" />,
  Gas: <Flame className="h-4 w-4" />,
  Solar: <Sun className="h-4 w-4" />,
  General: <Wrench className="h-4 w-4" />,
}

const ALL_SPECIALTIES: TechSpecialty[] = ["HVAC", "Electricidad", "Plomeria", "Gas", "Solar", "General"]
const ALL_DAYS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]

const jobHistory = [
  { id: "OT-1042", customer: "Empresa Alfa S.A.", type: "Reparacion HVAC", date: "2026-02-11", status: "completado", rating: 5 },
  { id: "OT-1038", customer: "Roberto Martinez", type: "Mantenimiento Preventivo", date: "2026-02-10", status: "completado", rating: 4 },
  { id: "OT-1035", customer: "Maria Gonzalez", type: "Reparacion HVAC", date: "2026-02-09", status: "completado", rating: 5 },
  { id: "OT-1030", customer: "Patricia Herrera", type: "Inspeccion de Gas", date: "2026-02-07", status: "completado", rating: 5 },
  { id: "OT-1025", customer: "Fernando Lopez", type: "Mantenimiento HVAC", date: "2026-02-06", status: "completado", rating: 4 },
  { id: "OT-1020", customer: "Alejandra Ruiz", type: "Instalacion AC", date: "2026-02-05", status: "completado", rating: 5 },
  { id: "OT-1015", customer: "Diego Ramirez", type: "Reparacion Caldera", date: "2026-02-04", status: "completado", rating: 3 },
  { id: "OT-1010", customer: "Laura Castillo", type: "Mantenimiento Preventivo", date: "2026-02-03", status: "completado", rating: 5 },
]

// ── Page ──────────────────────────────────────────────────────

export default function TechnicianDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { getTech, updateTech, updateStatus, deleteTech, addSpecialty, removeSpecialty, addCertification, removeCertification, updateAvailability } = useTechnicians()
  const tech = getTech(id)

  const [activeTab, setActiveTab] = useState<"info" | "historial" | "rendimiento">("info")
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [yearsWorking, setYearsWorking] = useState(1)
  const [clientNow, setClientNow] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setClientNow(Date.now())
    if (tech) {
      setYearsWorking(Math.max(1, new Date().getFullYear() - new Date(tech.joinDate).getFullYear()))
    }
  }, [tech])

  const tabs = [
    { key: "info" as const, label: "Informacion" },
    { key: "historial" as const, label: "Historial de Tareas" },
    { key: "rendimiento" as const, label: "Rendimiento" },
  ]

  if (!tech) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <SidebarNav />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopHeader />
          <main className="flex flex-1 items-center justify-center bg-content">
            <div className="text-center">
              <h1 className="text-xl font-bold text-foreground">Tecnico no encontrado</h1>
              <p className="text-sm text-muted-foreground mt-1">No existe un tecnico con ID: {id}</p>
              <Link href="/tecnicos">
                <Button variant="outline" className="mt-4 gap-2 bg-transparent">
                  <ArrowLeft className="h-4 w-4" /> Volver al registro
                </Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const st = statusConfig[tech.status]

  function handleFullEdit(data: TechFormData) {
    updateTech(id, data)
  }

  function handleDelete() {
    deleteTech(id)
    router.push("/tecnicos")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto bg-content">
          {/* Page header */}
          <div className="border-b border-border bg-card px-6 py-5">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/tecnicos" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                Registro de Tecnicos
              </Link>
              <span className="text-muted-foreground/40">/</span>
              <span className="text-sm font-medium text-foreground">{tech.name}</span>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">{tech.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold text-foreground">{tech.name}</h1>
                    {/* Status dropdown -- inline editable */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button type="button" className="cursor-pointer" title="Cambiar estado">
                          <Badge variant="outline" className={cn("gap-1.5 text-xs font-medium border-0", st.bg)}>
                            <span className={cn("h-2 w-2 rounded-full", st.dot, tech.status !== "desconectado" && "animate-pulse")} />
                            {st.label}
                          </Badge>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {(Object.entries(statusConfig) as [TechStatus, typeof st][]).map(([key, val]) => (
                          <DropdownMenuItem key={key} onClick={() => updateStatus(id, key)} className={cn(tech.status === key && "bg-muted")}>
                            <span className={cn("h-2 w-2 rounded-full mr-2", val.dot)} /> {val.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-sm text-muted-foreground">{tech.role}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-foreground">{tech.rating}</span>
                    </div>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <span className="text-sm text-muted-foreground">{tech.completedJobs} trabajos</span>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <span className="text-sm text-muted-foreground">{yearsWorking} {yearsWorking === 1 ? "ano" : "anos"} en la empresa</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={() => setFormOpen(true)}>
                  <Pencil className="h-4 w-4" /> Editar Todo
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="h-4 w-4" /> Eliminar
                </Button>
                <a href={`tel:${tech.phone}`}>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent"><Phone className="h-4 w-4" /> Llamar</Button>
                </a>
                <a href={`mailto:${tech.email}`}>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent"><Mail className="h-4 w-4" /> Correo</Button>
                </a>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-5 border-b-0">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border border-b-0",
                    activeTab === tab.key
                      ? "bg-content text-primary border-border"
                      : "text-muted-foreground hover:text-foreground bg-transparent border-transparent"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === "info" && (
              <InfoTab
                tech={tech}
                onUpdateTech={(patch) => updateTech(id, patch)}
                onAddSpecialty={(sp) => addSpecialty(id, sp)}
                onRemoveSpecialty={(sp) => removeSpecialty(id, sp)}
                onAddCert={(cert) => addCertification(id, cert)}
                onRemoveCert={(name) => removeCertification(id, name)}
                onUpdateAvailability={(avail) => updateAvailability(id, avail)}
              />
            )}
            {activeTab === "historial" && <HistoryTab />}
            {activeTab === "rendimiento" && <PerformanceTab tech={tech} />}
          </div>
        </main>
      </div>

      {/* Full-edit dialog */}
      <TechFormDialog open={formOpen} onOpenChange={setFormOpen} tech={tech} onSave={handleFullEdit} />
      <DeleteTechDialog open={deleteOpen} onOpenChange={setDeleteOpen} techName={tech.name} onConfirm={handleDelete} />
    </div>
  )
}

// ── Info Tab (inline editable) ──────────────────────────────

interface InfoTabProps {
  tech: ReturnType<ReturnType<typeof useTechnicians>["getTech"]> & {}
  onUpdateTech: (patch: Record<string, unknown>) => void
  onAddSpecialty: (sp: TechSpecialty) => void
  onRemoveSpecialty: (sp: TechSpecialty) => void
  onAddCert: (cert: Certification) => void
  onRemoveCert: (name: string) => void
  onUpdateAvailability: (avail: { days: string[]; startHour: number; endHour: number }) => void
}

function InfoTab({ tech, onUpdateTech, onAddSpecialty, onRemoveSpecialty, onAddCert, onRemoveCert, onUpdateAvailability }: InfoTabProps) {
  // ── Inline edit states ──
  const [editingContact, setEditingContact] = useState(false)
  const [contactDraft, setContactDraft] = useState({ phone: "", email: "", address: "" })

  const [certDraft, setCertDraft] = useState({ name: "", issuer: "", expires: "" })
  const [showCertForm, setShowCertForm] = useState(false)

  const [editingAvail, setEditingAvail] = useState(false)
  const [availDraft, setAvailDraft] = useState({ days: [] as string[], startHour: 0, endHour: 0 })

  function startEditContact() {
    setContactDraft({ phone: tech.phone, email: tech.email, address: tech.address })
    setEditingContact(true)
  }

  function saveContact() {
    onUpdateTech(contactDraft)
    setEditingContact(false)
  }

  function startEditAvail() {
    setAvailDraft({ ...tech.availability, days: [...tech.availability.days] })
    setEditingAvail(true)
  }

  function saveAvail() {
    onUpdateAvailability(availDraft)
    setEditingAvail(false)
  }

  function toggleAvailDay(day: string) {
    setAvailDraft((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day],
    }))
  }

  function handleAddCert() {
    if (!certDraft.name || !certDraft.issuer || !certDraft.expires) return
    onAddCert(certDraft)
    setCertDraft({ name: "", issuer: "", expires: "" })
    setShowCertForm(false)
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* Left column */}
      <div className="flex flex-col gap-5 lg:col-span-2">
        {/* Contact info */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-foreground">Datos de Contacto</CardTitle>
            {!editingContact ? (
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-primary" onClick={startEditContact}>
                <Pencil className="h-3 w-3" /> Editar
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button size="sm" className="gap-1 text-xs h-7" onClick={saveContact}>
                  <Save className="h-3 w-3" /> Guardar
                </Button>
                <Button variant="ghost" size="sm" className="gap-1 text-xs h-7 text-muted-foreground" onClick={() => setEditingContact(false)}>
                  <X className="h-3 w-3" /> Cancelar
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Telefono</p>
                {editingContact ? (
                  <Input value={contactDraft.phone} onChange={(e) => setContactDraft((d) => ({ ...d, phone: e.target.value }))} className="h-8 text-sm bg-card mt-0.5" />
                ) : (
                  <a href={`tel:${tech.phone}`} className="text-sm font-medium text-foreground hover:text-primary">{tech.phone}</a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Correo Electronico</p>
                {editingContact ? (
                  <Input value={contactDraft.email} onChange={(e) => setContactDraft((d) => ({ ...d, email: e.target.value }))} className="h-8 text-sm bg-card mt-0.5" />
                ) : (
                  <a href={`mailto:${tech.email}`} className="text-sm font-medium text-foreground hover:text-primary">{tech.email}</a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Ubicacion Actual</p>
                {editingContact ? (
                  <Input value={contactDraft.address} onChange={(e) => setContactDraft((d) => ({ ...d, address: e.target.value }))} className="h-8 text-sm bg-card mt-0.5" />
                ) : (
                  <p className="text-sm font-medium text-foreground">{tech.address}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <CalendarDays className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fecha de Ingreso</p>
                <p className="text-sm font-medium text-foreground">
                    {tech.joinDate}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Specialties -- editable inline */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">Especialidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ALL_SPECIALTIES.map((sp) => {
                const active = tech.specialties.includes(sp)
                return (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => (active ? onRemoveSpecialty(sp) : onAddSpecialty(sp))}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border p-3 transition-all",
                      active
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-dashed border-border bg-muted/40 text-muted-foreground hover:border-primary/50 hover:text-primary/70"
                    )}
                  >
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", active ? "bg-primary/10" : "bg-muted")}>
                      {specialtyIcons[sp]}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold">{sp}</p>
                      <p className="text-[10px] opacity-70">{active ? "Activa -- clic para quitar" : "Clic para agregar"}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Certifications -- editable */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Certificaciones
            </CardTitle>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-primary" onClick={() => setShowCertForm(true)}>
              <Plus className="h-3 w-3" /> Agregar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {tech.certifications.map((cert) => {
                const expires = new Date(cert.expires)
                const refNow = window.clientNow ?? expires.getTime() // safe fallback for SSR
                const daysLeft = Math.ceil((expires.getTime() - refNow) / (1000 * 60 * 60 * 24))
                const isExpiring = daysLeft < 90
                return (
                  <div key={cert.name} className="flex items-center justify-between rounded-xl border border-border p-4 group">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", isExpiring ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600")}>
                        <Award className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{cert.name}</p>
                        <p className="text-xs text-muted-foreground">Emisor: {cert.issuer}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Vence</p>
                        <p className={cn("text-sm font-medium", window.mounted && isExpiring ? "text-amber-600" : "text-foreground")}>
                          {cert.expires}
                        </p>
                        {window.mounted && isExpiring && <p className="text-[10px] text-amber-500 font-semibold mt-0.5">{daysLeft} dias restantes</p>}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 transition-opacity"
                        onClick={() => onRemoveCert(cert.name)}
                        title="Eliminar certificacion"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}

              {/* Add cert inline form */}
              {showCertForm && (
                <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
                  <p className="text-xs font-semibold text-foreground mb-3">Nueva Certificacion</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="flex flex-col gap-1">
                      <Label className="text-[10px] text-muted-foreground">Nombre</Label>
                      <Input value={certDraft.name} onChange={(e) => setCertDraft((d) => ({ ...d, name: e.target.value }))} className="h-8 text-sm bg-card" placeholder="Ej: HVAC Nivel III" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-[10px] text-muted-foreground">Emisor</Label>
                      <Input value={certDraft.issuer} onChange={(e) => setCertDraft((d) => ({ ...d, issuer: e.target.value }))} className="h-8 text-sm bg-card" placeholder="Ej: CONOCER" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-[10px] text-muted-foreground">Fecha de Vencimiento</Label>
                      <Input type="date" value={certDraft.expires} onChange={(e) => setCertDraft((d) => ({ ...d, expires: e.target.value }))} className="h-8 text-sm bg-card" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setShowCertForm(false); setCertDraft({ name: "", issuer: "", expires: "" }) }}>
                      Cancelar
                    </Button>
                    <Button size="sm" className="text-xs gap-1" onClick={handleAddCert} disabled={!certDraft.name || !certDraft.issuer || !certDraft.expires}>
                      <Plus className="h-3 w-3" /> Agregar
                    </Button>
                  </div>
                </div>
              )}

              {tech.certifications.length === 0 && !showCertForm && (
                <p className="text-sm text-muted-foreground text-center py-4">Sin certificaciones registradas.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-5">
        {/* Availability -- editable */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Disponibilidad
            </CardTitle>
            {!editingAvail ? (
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-primary" onClick={startEditAvail}>
                <Pencil className="h-3 w-3" /> Editar
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button size="sm" className="gap-1 text-xs h-7" onClick={saveAvail}>
                  <Save className="h-3 w-3" /> Guardar
                </Button>
                <Button variant="ghost" size="sm" className="gap-1 text-xs h-7 text-muted-foreground" onClick={() => setEditingAvail(false)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Dias laborales</p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_DAYS.map((day) => {
                    const active = editingAvail ? availDraft.days.includes(day) : tech.availability.days.includes(day)
                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={!editingAvail}
                        onClick={() => editingAvail && toggleAvailDay(day)}
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg text-xs font-medium transition-colors",
                          active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                          editingAvail && "cursor-pointer hover:opacity-80",
                          !editingAvail && "cursor-default"
                        )}
                      >
                        {day.slice(0, 2)}
                      </button>
                    )
                  })}
                </div>
              </div>
              {editingAvail ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <Label className="text-[10px] text-muted-foreground">Hora Inicio</Label>
                    <Input
                      type="number"
                      min={0}
                      max={23}
                      value={availDraft.startHour}
                      onChange={(e) => setAvailDraft((d) => ({ ...d, startHour: parseInt(e.target.value) || 0 }))}
                      className="h-8 text-sm bg-card"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-[10px] text-muted-foreground">Hora Fin</Label>
                    <Input
                      type="number"
                      min={0}
                      max={23}
                      value={availDraft.endHour}
                      onChange={(e) => setAvailDraft((d) => ({ ...d, endHour: parseInt(e.target.value) || 0 }))}
                      className="h-8 text-sm bg-card"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-muted/60 px-3 py-2.5">
                  <p className="text-xs text-muted-foreground">Horario</p>
                  <p className="text-sm font-semibold text-foreground">
                    {String(tech.availability.startHour).padStart(2, "0")}:00 - {String(tech.availability.endHour).padStart(2, "0")}:00
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* GPS */}
        <Card className="border border-border shadow-sm overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Navigation className="h-4 w-4 text-primary" /> Ubicacion GPS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative h-48 bg-muted">
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50">
                <MapPin className="h-8 w-8 text-primary animate-bounce" />
                <p className="mt-2 text-xs text-muted-foreground font-medium">{tech.address}</p>
                <p className="text-[10px] text-muted-foreground">{tech.latitude.toFixed(4)}, {tech.longitude.toFixed(4)}</p>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-border">
              <a href={`https://www.google.com/maps?q=${tech.latitude},${tech.longitude}`} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Ver en Google Maps
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Quick stats */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">Estadisticas Rapidas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Briefcase className="h-4 w-4" /> Trabajos Completados</div>
              <span className="text-sm font-bold text-foreground">{tech.completedJobs}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Timer className="h-4 w-4" /> Resp. Promedio</div>
              <span className="text-sm font-bold text-foreground">{tech.avgResponseMin} min</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Star className="h-4 w-4" /> Calificacion</div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("h-3.5 w-3.5", i < Math.round(tech.rating) ? "fill-amber-400 text-amber-400" : "text-muted fill-muted")} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ── History Tab ──────────────────────────────────────────────

function HistoryTab() {
  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground">Historial de Tareas Recientes</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Orden</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipo</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fecha</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Calif.</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {jobHistory.map((job) => (
                <tr key={job.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3"><Link href={`/orden/${job.id}`} className="font-mono text-xs text-primary hover:underline">{job.id}</Link></td>
                  <td className="px-4 py-3 text-foreground">{job.customer}</td>
                  <td className="px-4 py-3 text-muted-foreground">{job.type}</td>
                        <td className="px-4 py-3 text-muted-foreground">{job.date}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn("h-3 w-3", i < job.rating ? "fill-amber-400 text-amber-400" : "text-muted fill-muted")} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="outline" className="gap-1 text-[10px] border-0 bg-emerald-50 text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" /> Completado
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Performance Tab ─────────────────────────────────────────

function PerformanceTab({ tech }: { tech: NonNullable<ReturnType<ReturnType<typeof useTechnicians>["getTech"]>> }) {
  const metrics = [
    { label: "Tasa de Finalizacion", value: 96, suffix: "%", icon: CheckCircle2, color: "text-emerald-600" },
    { label: "Puntualidad", value: 91, suffix: "%", icon: Clock, color: "text-blue-600" },
    { label: "Satisfaccion Cliente", value: Math.round(tech.rating * 20), suffix: "%", icon: Star, color: "text-amber-600" },
    { label: "Eficiencia", value: 88, suffix: "%", icon: TrendingUp, color: "text-primary" },
  ]

  const weeklyData = [
    { day: "Lun", jobs: 4, hours: 7.5 },
    { day: "Mar", jobs: 3, hours: 6 },
    { day: "Mie", jobs: 5, hours: 8 },
    { day: "Jue", jobs: 3, hours: 5.5 },
    { day: "Vie", jobs: 4, hours: 7 },
    { day: "Sab", jobs: 1, hours: 3 },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label} className="border border-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <m.icon className={cn("h-5 w-5", m.color)} />
                <span className="text-2xl font-bold text-foreground">{m.value}{m.suffix}</span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">{m.label}</p>
              <Progress value={m.value} className="mt-2 h-1.5" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Resumen Semanal (Ultima Semana)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Dia</th>
                  <th className="px-4 py-2 text-center font-medium text-muted-foreground">Trabajos</th>
                  <th className="px-4 py-2 text-center font-medium text-muted-foreground">Horas</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Carga</th>
                </tr>
              </thead>
              <tbody>
                {weeklyData.map((d) => (
                  <tr key={d.day} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 font-medium text-foreground">{d.day}</td>
                    <td className="px-4 py-2.5 text-center text-foreground">{d.jobs}</td>
                    <td className="px-4 py-2.5 text-center text-foreground">{d.hours}h</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-muted">
                          <div className="h-2 rounded-full bg-primary" style={{ width: `${(d.hours / 8) * 100}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">{Math.round((d.hours / 8) * 100)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <span className="text-xs text-muted-foreground">Total semanal</span>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-foreground">{weeklyData.reduce((s, d) => s + d.jobs, 0)} trabajos</span>
              <span className="text-sm font-semibold text-foreground">{weeklyData.reduce((s, d) => s + d.hours, 0)}h trabajadas</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
