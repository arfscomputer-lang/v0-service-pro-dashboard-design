"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  X,
  Plus,
  Trash2,
  Wind,
  Zap,
  Droplets,
  Flame,
  Sun,
  Wrench,
} from "lucide-react"
import type { TechnicianProfile, TechSpecialty, TechStatus, Certification } from "@/lib/data/technicians"

// ── Helpers ──────────────────────────────────────────────────

const ALL_SPECIALTIES: TechSpecialty[] = ["HVAC", "Electricidad", "Plomeria", "Gas", "Solar", "General"]
const ALL_STATUSES: { value: TechStatus; label: string }[] = [
  { value: "disponible", label: "Disponible" },
  { value: "ocupado", label: "Ocupado" },
  { value: "en_viaje", label: "En Viaje" },
  { value: "desconectado", label: "Desconectado" },
]
const ALL_DAYS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]

const specialtyIcons: Record<TechSpecialty, React.ReactNode> = {
  HVAC: <Wind className="h-3 w-3" />,
  Electricidad: <Zap className="h-3 w-3" />,
  Plomeria: <Droplets className="h-3 w-3" />,
  Gas: <Flame className="h-3 w-3" />,
  Solar: <Sun className="h-3 w-3" />,
  General: <Wrench className="h-3 w-3" />,
}

// ── Form state ───────────────────────────────────────────────

interface FormData {
  name: string
  email: string
  phone: string
  role: string
  status: TechStatus
  specialties: TechSpecialty[]
  certifications: Certification[]
  address: string
  latitude: number
  longitude: number
  joinDate: string
  rating: number
  completedJobs: number
  avgResponseMin: number
  availability: {
    days: string[]
    startHour: number
    endHour: number
  }
}

function getEmptyForm(): FormData {
  return {
    name: "",
    email: "",
    phone: "",
    role: "",
    status: "disponible",
    specialties: [],
    certifications: [],
    address: "",
    latitude: 19.4326,
    longitude: -99.1332,
    joinDate: new Date().toISOString().split("T")[0],
    rating: 0,
    completedJobs: 0,
    avgResponseMin: 0,
    availability: { days: ["Lun", "Mar", "Mie", "Jue", "Vie"], startHour: 8, endHour: 17 },
  }
}

function techToForm(tech: TechnicianProfile): FormData {
  return {
    name: tech.name,
    email: tech.email,
    phone: tech.phone,
    role: tech.role,
    status: tech.status,
    specialties: [...(tech.specialties || [])],
    certifications: (tech.certifications || []).map((c) => ({ ...c })),
    address: tech.address,
    latitude: tech.latitude,
    longitude: tech.longitude,
    joinDate: tech.joinDate,
    rating: tech.rating,
    completedJobs: tech.completedJobs,
    avgResponseMin: tech.avgResponseMin,
    availability: {
      days: [...tech.availability.days],
      startHour: tech.availability.startHour,
      endHour: tech.availability.endHour,
    },
  }
}

// ── Component ────────────────────────────────────────────────

interface TechFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tech?: TechnicianProfile | null
  onSave: (data: FormData) => void
}

export function TechFormDialog({ open, onOpenChange, tech, onSave }: TechFormDialogProps) {
  const isEdit = !!tech
  const [form, setForm] = useState<FormData>(getEmptyForm)
  const [certDraft, setCertDraft] = useState({ name: "", issuer: "", expires: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setForm(tech ? techToForm(tech) : getEmptyForm())
      setCertDraft({ name: "", issuer: "", expires: "" })
      setErrors({})
    }
  }, [open, tech])

  const setField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  // Toggle specialty
  function toggleSpecialty(sp: TechSpecialty) {
    setForm((prev) => ({
      ...prev,
      specialties: (prev.specialties || []).includes(sp)
        ? (prev.specialties || []).filter((s) => s !== sp)
        : [...(prev.specialties || []), sp],
    }))
  }

  // Toggle availability day
  function toggleDay(day: string) {
    setForm((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        days: prev.availability.days.includes(day)
          ? prev.availability.days.filter((d) => d !== day)
          : [...prev.availability.days, day],
      },
    }))
  }

  // Add certification
  function addCert() {
    if (!certDraft.name || !certDraft.issuer || !certDraft.expires) return
    setForm((prev) => ({
      ...prev,
      certifications: [...prev.certifications, { ...certDraft }],
    }))
    setCertDraft({ name: "", issuer: "", expires: "" })
  }

  // Remove certification
  function removeCert(index: number) {
    setForm((prev) => ({
      ...prev,
      certifications: (prev.certifications || []).filter((_, i) => i !== index),
    }))
  }

  // Validate
  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = "El nombre es obligatorio"
    if (!form.email.trim()) errs.email = "El correo es obligatorio"
    if (!form.phone.trim()) errs.phone = "El telefono es obligatorio"
    if (!form.role.trim()) errs.role = "El rol es obligatorio"
    if ((form.specialties || []).length === 0) errs.specialties = "Selecciona al menos una especialidad"
    if ((form.availability?.days || []).length === 0) errs.days = "Selecciona al menos un dia"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    onSave(form)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-lg font-bold text-foreground">
            {isEdit ? "Editar Tecnico" : "Nuevo Tecnico"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isEdit
              ? "Modifica los datos del tecnico. Los cambios se aplicaran inmediatamente."
              : "Completa la informacion para registrar un nuevo tecnico en el sistema."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-6 py-5">
          <div className="flex flex-col gap-6">
            {/* ── Section: Datos Personales ── */}
            <fieldset className="flex flex-col gap-4">
              <legend className="text-sm font-semibold text-foreground mb-1">Datos Personales</legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">Nombre Completo *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="Ej: Luis Hernandez"
                    className={cn("bg-card", errors.name && "border-destructive")}
                  />
                  {errors.name && <span className="text-[11px] text-destructive">{errors.name}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="role" className="text-xs font-medium text-muted-foreground">Rol / Cargo *</Label>
                  <Input
                    id="role"
                    value={form.role}
                    onChange={(e) => setField("role", e.target.value)}
                    placeholder="Ej: Especialista HVAC Senior"
                    className={cn("bg-card", errors.role && "border-destructive")}
                  />
                  {errors.role && <span className="text-[11px] text-destructive">{errors.role}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Correo Electronico *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="Ej: luis@servicepro.mx"
                    className={cn("bg-card", errors.email && "border-destructive")}
                  />
                  {errors.email && <span className="text-[11px] text-destructive">{errors.email}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">Telefono *</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    placeholder="Ej: +52 55 1234 5678"
                    className={cn("bg-card", errors.phone && "border-destructive")}
                  />
                  {errors.phone && <span className="text-[11px] text-destructive">{errors.phone}</span>}
                </div>
              </div>

              {/* Status + Join date */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Estado</Label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_STATUSES.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setField("status", s.value)}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
                          form.status === s.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-muted-foreground border-border hover:bg-muted"
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="joinDate" className="text-xs font-medium text-muted-foreground">Fecha de Ingreso</Label>
                  <Input
                    id="joinDate"
                    type="date"
                    value={form.joinDate}
                    onChange={(e) => setField("joinDate", e.target.value)}
                    className="bg-card"
                  />
                </div>
              </div>
            </fieldset>

            {/* ── Section: Ubicacion ── */}
            <fieldset className="flex flex-col gap-4">
              <legend className="text-sm font-semibold text-foreground mb-1">Ubicacion</legend>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="address" className="text-xs font-medium text-muted-foreground">Direccion</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                  placeholder="Ej: Col. Centro, CDMX"
                  className="bg-card"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="latitude" className="text-xs font-medium text-muted-foreground">Latitud</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.0001"
                    value={form.latitude}
                    onChange={(e) => setField("latitude", parseFloat(e.target.value) || 0)}
                    className="bg-card"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="longitude" className="text-xs font-medium text-muted-foreground">Longitud</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.0001"
                    value={form.longitude}
                    onChange={(e) => setField("longitude", parseFloat(e.target.value) || 0)}
                    className="bg-card"
                  />
                </div>
              </div>
            </fieldset>

            {/* ── Section: Especialidades ── */}
            <fieldset className="flex flex-col gap-3">
              <legend className="text-sm font-semibold text-foreground mb-1">Especialidades *</legend>
              {errors.specialties && <span className="text-[11px] text-destructive -mt-1">{errors.specialties}</span>}
              <div className="flex flex-wrap gap-2">
                {ALL_SPECIALTIES.map((sp) => {
                  const active = (form.specialties || []).includes(sp)
                  return (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => toggleSpecialty(sp)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium border transition-all",
                        active
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-card text-muted-foreground border-border hover:bg-muted"
                      )}
                    >
                      {specialtyIcons[sp]}
                      {sp}
                      {active && <X className="h-3 w-3 ml-1 opacity-70" />}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            {/* ── Section: Certificaciones ── */}
            <fieldset className="flex flex-col gap-3">
              <legend className="text-sm font-semibold text-foreground mb-1">Certificaciones</legend>

              {/* Existing certs */}
              {(form.certifications || []).length > 0 && (
                <div className="flex flex-col gap-2">
                  {(form.certifications || []).map((cert, i) => (
                    <div
                      key={`${cert.name}-${i}`}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{cert.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {cert.issuer} &middot; Vence: {new Date(cert.expires).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeCert(i)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Eliminar certificacion</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new cert */}
              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Agregar certificacion</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <Input
                    placeholder="Nombre"
                    value={certDraft.name}
                    onChange={(e) => setCertDraft((d) => ({ ...d, name: e.target.value }))}
                    className="bg-card text-sm"
                  />
                  <Input
                    placeholder="Emisor"
                    value={certDraft.issuer}
                    onChange={(e) => setCertDraft((d) => ({ ...d, issuer: e.target.value }))}
                    className="bg-card text-sm"
                  />
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={certDraft.expires}
                      onChange={(e) => setCertDraft((d) => ({ ...d, expires: e.target.value }))}
                      className="bg-card text-sm flex-1"
                    />
                    <Button
                      type="button"
                      size="icon"
                      className="shrink-0"
                      onClick={addCert}
                      disabled={!certDraft.name || !certDraft.issuer || !certDraft.expires}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Agregar</span>
                    </Button>
                  </div>
                </div>
              </div>
            </fieldset>

            {/* ── Section: Disponibilidad ── */}
            <fieldset className="flex flex-col gap-3">
              <legend className="text-sm font-semibold text-foreground mb-1">Disponibilidad</legend>
              {errors.days && <span className="text-[11px] text-destructive -mt-1">{errors.days}</span>}

              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-2 block">Dias Laborales</Label>
                <div className="flex flex-wrap gap-2">
                  {ALL_DAYS.map((day) => {
                    const active = form.availability.days.includes(day)
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg text-xs font-semibold border transition-all",
                          active
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-muted-foreground border-border hover:bg-muted"
                        )}
                      >
                        {day.slice(0, 2)}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="startHour" className="text-xs font-medium text-muted-foreground">Hora Inicio</Label>
                  <Input
                    id="startHour"
                    type="number"
                    min={0}
                    max={23}
                    value={form.availability.startHour}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        availability: { ...prev.availability, startHour: parseInt(e.target.value) || 0 },
                      }))
                    }
                    className="bg-card"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="endHour" className="text-xs font-medium text-muted-foreground">Hora Fin</Label>
                  <Input
                    id="endHour"
                    type="number"
                    min={0}
                    max={23}
                    value={form.availability.endHour}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        availability: { ...prev.availability, endHour: parseInt(e.target.value) || 0 },
                      }))
                    }
                    className="bg-card"
                  />
                </div>
              </div>
            </fieldset>

            {/* ── Section: Metricas (solo editar) ── */}
            {isEdit && (
              <fieldset className="flex flex-col gap-4">
                <legend className="text-sm font-semibold text-foreground mb-1">Metricas</legend>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="rating" className="text-xs font-medium text-muted-foreground">Calificacion (1-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      min={0}
                      max={5}
                      step={0.1}
                      value={form.rating}
                      onChange={(e) => setField("rating", parseFloat(e.target.value) || 0)}
                      className="bg-card"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="completedJobs" className="text-xs font-medium text-muted-foreground">Trabajos Completados</Label>
                    <Input
                      id="completedJobs"
                      type="number"
                      min={0}
                      value={form.completedJobs}
                      onChange={(e) => setField("completedJobs", parseInt(e.target.value) || 0)}
                      className="bg-card"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="avgResponseMin" className="text-xs font-medium text-muted-foreground">Resp. Promedio (min)</Label>
                    <Input
                      id="avgResponseMin"
                      type="number"
                      min={0}
                      value={form.avgResponseMin}
                      onChange={(e) => setField("avgResponseMin", parseInt(e.target.value) || 0)}
                      className="bg-card"
                    />
                  </div>
                </div>
              </fieldset>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-border gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            {isEdit ? "Guardar Cambios" : "Crear Tecnico"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export type { FormData as TechFormData }
