"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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
  onSave: (data: Omit<Customer, "id" | "initials">) => void
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
        setForm(rest)
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
      tags: p.tags.includes(tag) ? p.tags.filter((t) => t !== tag) : [...p.tags, tag],
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
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="px-6 py-5 gap-5 flex flex-col">
            {/* Row: Name + Type */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Nombre / Razon Social *</Label>
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nombre completo o empresa" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Tipo de Cliente</Label>
                <Select value={form.type} onValueChange={(v) => set("type", v as CustomerType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Correo Electronico *</Label>
                <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="correo@ejemplo.com" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Telefono</Label>
                <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+52 55 0000 0000" />
              </div>
            </div>

            {/* Row: Address + City */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-muted-foreground">Direccion</Label>
                <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Calle, numero, colonia" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Ciudad</Label>
                <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="CDMX" />
              </div>
            </div>

            {/* Geolocation */}
            <GeoFields lat={form.lat} lng={form.lng} onChangeLat={(v) => set("lat", v)} onChangeLng={(v) => set("lng", v)} />

            {/* Schedule */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Horario Preferido de Atencion</Label>
              <Input value={form.preferredSchedule} onChange={(e) => set("preferredSchedule", e.target.value)} placeholder="Ej: Lunes a Viernes, 9:00-14:00" />
            </div>

            {/* Tags */}
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold text-muted-foreground">Etiquetas de Segmentacion</Label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const active = form.tags.includes(tag)
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
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">NPS (0-10, dejar vacio si no aplica)</Label>
              <Input
                type="number"
                min={0}
                max={10}
                value={form.nps ?? ""}
                onChange={(e) => set("nps", e.target.value === "" ? null : Number(e.target.value))}
                placeholder="Ej: 8"
                className="max-w-[120px]"
              />
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Notas Internas</Label>
              <Textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Observaciones, preferencias, contexto importante..." />
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
