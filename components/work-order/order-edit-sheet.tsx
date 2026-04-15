"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Save, X } from "lucide-react"

export interface OrderFormData {
  status: "pendiente" | "asignada" | "en_ruta" | "en_sitio" | "completada" | "cancelada"
  priority: "baja" | "normal" | "alta" | "urgente"
  type: string
  category: string
  scheduledDate: string
  scheduledTime: string
  estimatedDuration: string
  slaDeadline: string
  equipment: string
  serialNumber: string
  warranty: string
  description: string
  customerName: string
  customerCompany: string
  customerPhone: string
  customerEmail: string
  customerAddress: string
  technicianName: string
  technicianRole: string
  technicianPhone: string
}

interface Props {
  open: boolean
  onClose: () => void
  data: OrderFormData
  onSave: (data: OrderFormData) => void
  orderId: string
}

export function OrderEditSheet({ open, onClose, data, onSave, orderId }: Props) {
  const [form, setForm] = useState<OrderFormData>(data)

  useEffect(() => {
    if (open) setForm(data)
  }, [open, data])

  const set = <K extends keyof OrderFormData>(key: K, value: OrderFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = () => {
    onSave(form)
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle className="text-lg">Editar Orden {orderId}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-5">
          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Estado</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as OrderFormData["status"])}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="asignada">Asignada</SelectItem>
                  <SelectItem value="en_ruta">En Ruta</SelectItem>
                  <SelectItem value="en_sitio">En Sitio</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Prioridad</Label>
              <Select value={form.priority} onValueChange={(v) => set("priority", v as OrderFormData["priority"])}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Service Info */}
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Servicio</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Tipo de Servicio</Label>
              <Input value={form.type} onChange={(e) => set("type", e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Categoria</Label>
              <Input value={form.category} onChange={(e) => set("category", e.target.value)} className="h-9 text-sm" />
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Fecha Programada</Label>
              <Input value={form.scheduledDate} onChange={(e) => set("scheduledDate", e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Horario</Label>
              <Input value={form.scheduledTime} onChange={(e) => set("scheduledTime", e.target.value)} className="h-9 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Duracion Estimada</Label>
              <Input value={form.estimatedDuration} onChange={(e) => set("estimatedDuration", e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Limite SLA</Label>
              <Input value={form.slaDeadline} onChange={(e) => set("slaDeadline", e.target.value)} className="h-9 text-sm" />
            </div>
          </div>

          <Separator />

          {/* Equipment */}
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Equipo</p>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Equipo</Label>
              <Input value={form.equipment} onChange={(e) => set("equipment", e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">No. Serie</Label>
                <Input value={form.serialNumber} onChange={(e) => set("serialNumber", e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Garantia</Label>
                <Input value={form.warranty} onChange={(e) => set("warranty", e.target.value)} className="h-9 text-sm" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Descripcion del Problema</Label>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              className="text-sm resize-none"
            />
          </div>

          <Separator />

          {/* Customer */}
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cliente</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Nombre</Label>
              <Input value={form.customerName} onChange={(e) => set("customerName", e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Empresa</Label>
              <Input value={form.customerCompany} onChange={(e) => set("customerCompany", e.target.value)} className="h-9 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Telefono</Label>
              <Input value={form.customerPhone} onChange={(e) => set("customerPhone", e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Correo</Label>
              <Input value={form.customerEmail} onChange={(e) => set("customerEmail", e.target.value)} className="h-9 text-sm" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Direccion</Label>
            <Input value={form.customerAddress} onChange={(e) => set("customerAddress", e.target.value)} className="h-9 text-sm" />
          </div>

          <Separator />

          {/* Technician */}
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tecnico Asignado</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Nombre</Label>
              <Input value={form.technicianName} onChange={(e) => set("technicianName", e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Rol</Label>
              <Input value={form.technicianRole} onChange={(e) => set("technicianRole", e.target.value)} className="h-9 text-sm" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Telefono del Tecnico</Label>
            <Input value={form.technicianPhone} onChange={(e) => set("technicianPhone", e.target.value)} className="h-9 text-sm" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button onClick={handleSave} className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Save className="h-4 w-4" />
              Guardar Cambios
            </Button>
            <Button variant="outline" onClick={onClose} className="gap-2 bg-transparent">
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
