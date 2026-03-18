"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, LocateFixed, Loader2 } from "lucide-react"
import type { Customer, CustomerType, CustomerTag } from "@/lib/data/customers"
import { GeoFields } from "@/components/customers/geo-fields" // Import GeoFields component

const customerTypes: { value: CustomerType; label: string }[] = [
  { value: "residencial", label: "Residencial" },
  { value: "comercial", label: "Comercial" },
  { value: "industrial", label: "Industrial" },
  { value: "gobierno", label: "Gobierno" },
]

const allTags: CustomerTag[] = ["VIP", "nuevo", "frecuente", "moroso", "corporativo"]

interface Props {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Customer, "id" | "initials">) => void | Promise<void>
  initialData?: Customer | null
}

function getEmpty(): Omit<Customer, "id" | "initials"> {
  return {
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "CDMX",
    lat: null,
    lng: null,
    type: "residencial",
    tags: ["nuevo"],
    nps: null,
    preferredSchedule: "",
    notes: "",
    createdAt: new Date().toISOString().slice(0, 10),
    interactions: [],
    services: [],
    branches: [],
    totalSpent: 0,
    lifetimeValue: 0,
  }
}

export function CustomerFormDialog({ open, onClose, onSave, initialData }: Props) {
  const [form, setForm] = useState<Omit<Customer, "id" | "initials">>(getEmpty)

  useEffect(() => {
    if (open) {
      if (initialData) {
        const { id: _id, initials: _ini, ...rest } = initialData
        // Ensure all string fields have a value (empty string instead of undefined/null)
        const normalized = {
          ...getEmpty(),
          ...rest,
          name: rest.name || "",
          email: rest.email || "",
          phone: rest.phone || "",
          address: rest.address || "",
          city: rest.city || "",
          preferredSchedule: rest.preferredSchedule || "",
          notes: rest.notes || "",
        }
        setForm(normalized)
      } else {
        setForm(getEmpty())
      }
    }
  }, [open, initialData])

  const set = useCallback(
    <K extends keyof Omit<Customer, "id" | "initials">>(key: K, val: Omit<Customer, "id" | "initials">[K]) =>
      setForm((p) => ({ ...p, [key]: val })),
    []
  )

  const toggleTag = (tag: CustomerTag) => {
    setForm((p) => ({
      ...p,
      tags: (p.tags || []).includes(tag) ? (p.tags || []).filter((t) => t !== tag) : [...(p.tags || []), tag],
    }))
  }

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim()) return
    onSave(form)
    onClose()
  }

  const isEdit = !!initialData

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-lg font-bold text-foreground">
            {isEdit ? "Editar Cliente" : "Nuevo Cliente"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Modifica la información del cliente" : "Registra un nuevo cliente en el sistema"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="px-6 py-5 space-y-6">
            {/* Main Customer Info Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Información Principal</h3>
              
              {/* Row: Name + Type */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">Nombre / Razón Social *</Label>
                  <Input id="name" value={form.name || ""} onChange={(e) => set("name", e.target.value)} placeholder="Nombre completo o empresa" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="type" className="text-xs font-medium text-muted-foreground">Tipo de Cliente</Label>
                  <Select value={form.type || "residencial"} onValueChange={(v) => set("type", v as CustomerType)}>
                    <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {customerTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row: Email + Phone */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Correo Electrónico *</Label>
                  <Input id="email" type="email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} placeholder="correo@ejemplo.com" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">Teléfono</Label>
                  <Input id="phone" value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} placeholder="+52 55 0000 0000" />
                </div>
              </div>

              {/* Row: Address + City */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="address" className="text-xs font-medium text-muted-foreground">Dirección</Label>
                  <Input id="address" value={form.address || ""} onChange={(e) => set("address", e.target.value)} placeholder="Calle, número, colonia" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="city" className="text-xs font-medium text-muted-foreground">Ciudad</Label>
                  <Input id="city" value={form.city || ""} onChange={(e) => set("city", e.target.value)} placeholder="CDMX" />
                </div>
              </div>

              {/* Geolocation */}
              <GeoFields lat={form.lat} lng={form.lng} onChangeLat={(v) => set("lat", v)} onChangeLng={(v) => set("lng", v)} />

              {/* Schedule */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="schedule" className="text-xs font-medium text-muted-foreground">Horario Preferido de Atención</Label>
                <Input id="schedule" value={form.preferredSchedule || ""} onChange={(e) => set("preferredSchedule", e.target.value)} placeholder="Ej: Lunes a Viernes, 9:00-14:00" />
              </div>
            </div>

            {/* Branches Section */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground">Sucursales / Sedes</h3>
              {form.branches && form.branches.length > 0 ? (
                <div className="space-y-3">
                  {form.branches.map((branch, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-medium text-foreground">{branch.address}, {branch.city}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => set("branches", form.branches?.filter((_, i) => i !== idx))}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {branch.notes && <p className="text-xs text-muted-foreground">{branch.notes}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No hay sucursales registradas</p>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground">Etiquetas de Segmentación</Label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const active = (form.tags || []).includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {active && <X className="h-3 w-3 inline mr-1" />}
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* NPS */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="nps" className="text-xs font-medium text-muted-foreground">NPS (0-10, dejar vacío si no aplica)</Label>
              <Input
                id="nps"
                type="number"
                min={0}
                max={10}
                value={form.nps !== null && form.nps !== undefined ? form.nps : ""}
                onChange={(e) => set("nps", e.target.value === "" ? null : Number(e.target.value))}
                placeholder="Ej: 8"
                className="max-w-[120px]"
              />
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes" className="text-xs font-medium text-muted-foreground">Notas Internas</Label>
              <Textarea id="notes" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Observaciones, preferencias, contexto importante..." />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!form.name.trim() || !form.email.trim()} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {isEdit ? "Guardar Cambios" : "Registrar Cliente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
