"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2, Loader2, Plus } from "lucide-react"
import { useWorkOrders } from "@/lib/context/work-orders-context"
import { useCustomers } from "@/lib/context/customers-context"

interface Technician { id: string; name: string; role?: string }
interface Asset { id: string; name: string; asset_id: string; next_maintenance_date?: string }

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const emptyForm = () => ({
  orderId: `OT-${Date.now()}`,
  customerId: "",
  type: "",
  category: "otros" as const,
  description: "",
  status: "pendiente" as const,
  priority: "normal" as const,
  address: "",
  city: "",
  scheduledDate: new Date().toISOString().split("T")[0],
  scheduledTime: "09:00",
  technicianId: null as string | null,
  assetId: null as string | null,
})

export function NewOrderDialog({ open, onOpenChange }: Props) {
  const { addWorkOrder } = useWorkOrders()
  const { customers } = useCustomers()
  const [form, setForm] = useState(emptyForm)
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    setForm(emptyForm())
    setSuccess(false)
    setError("")
    fetch("/api/technicians")
      .then(r => r.json())
      .then(d => setTechnicians(d.data || []))
      .catch(() => {})
    fetch("/api/maintenance/plans")
      .then(r => r.json())
      .then(d => setAssets(d.plans || []))
      .catch(() => {})
  }, [open])

  // Prefill address when customer changes
  useEffect(() => {
    if (!form.customerId) return
    const c = customers.find(c => c.id === form.customerId)
    if (c?.address) setForm(f => ({ ...f, address: c.address, city: c.city ?? f.city }))
  }, [form.customerId, customers])

  const set = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!form.type.trim()) return setError("Ingresá el tipo de servicio")
    if (!form.address.trim()) return setError("Ingresá la dirección")
    if (!form.city.trim()) return setError("Ingresá la ciudad")

    setIsSubmitting(true)
    try {
      await addWorkOrder({
        orderId: form.orderId,
        type: form.type.trim(),
        category: form.category,
        description: form.description.trim(),
        status: form.status,
        priority: form.priority,
        address: form.address.trim(),
        city: form.city.trim(),
        scheduledDate: form.scheduledDate,
        scheduledTime: form.scheduledTime,
        customerId: form.customerId || null,
        technicianId: form.technicianId,
      })
      setSuccess(true)
      setTimeout(() => onOpenChange(false), 2000)
    } catch {
      setError("Error al crear la orden. Intentá de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle>Nueva Orden de Trabajo</DialogTitle>
          <DialogDescription>Completá los datos para registrar la nueva orden</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center gap-4 p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Orden creada exitosamente</p>
              <p className="text-sm text-muted-foreground mt-1">ID: {form.orderId}</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="max-h-[75vh]">
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* ID + Cliente */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="no-orderId">ID Orden</Label>
                  <Input id="no-orderId" value={form.orderId}
                    onChange={e => set("orderId", e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="no-customer">Cliente</Label>
                  <Select value={form.customerId || "none"}
                    onValueChange={v => set("customerId", v === "none" ? "" : v)} disabled={isSubmitting}>
                    <SelectTrigger id="no-customer"><SelectValue placeholder="Sin cliente" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin cliente</SelectItem>
                      {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tipo + Categoría */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="no-type">Tipo de Servicio *</Label>
                  <Input id="no-type" placeholder="Reparación HVAC"
                    value={form.type} onChange={e => set("type", e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="space-y-1.5">
                  <Label>Categoría</Label>
                  <Select value={form.category} onValueChange={v => set("category", v)} disabled={isSubmitting}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reactivo">Reactivo / Correctivo</SelectItem>
                      <SelectItem value="preventivo">Preventivo</SelectItem>
                      <SelectItem value="predictivo">Predictivo</SelectItem>
                      <SelectItem value="instalacion">Instalación</SelectItem>
                      <SelectItem value="inspeccion">Inspección</SelectItem>
                      <SelectItem value="proyecto">Proyecto / Mejora</SelectItem>
                      <SelectItem value="garantia">Garantía</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <Label htmlFor="no-desc">Descripción</Label>
                <Textarea id="no-desc" rows={2} placeholder="Detalles del trabajo..."
                  value={form.description} onChange={e => set("description", e.target.value)} disabled={isSubmitting} />
              </div>

              {/* Estado + Prioridad */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Estado</Label>
                  <Select value={form.status} onValueChange={v => set("status", v)} disabled={isSubmitting}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                <div className="space-y-1.5">
                  <Label>Prioridad</Label>
                  <Select value={form.priority} onValueChange={v => set("priority", v)} disabled={isSubmitting}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baja">Baja</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dirección + Ciudad */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="no-address">Dirección *</Label>
                  <Input id="no-address" placeholder="Calle 123"
                    value={form.address} onChange={e => set("address", e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="no-city">Ciudad *</Label>
                  <Input id="no-city" placeholder="Asunción"
                    value={form.city} onChange={e => set("city", e.target.value)} disabled={isSubmitting} />
                </div>
              </div>

              {/* Fecha + Hora */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="no-date">Fecha Programada</Label>
                  <Input id="no-date" type="date" value={form.scheduledDate}
                    onChange={e => set("scheduledDate", e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="no-time">Hora</Label>
                  <Input id="no-time" type="time" value={form.scheduledTime}
                    onChange={e => set("scheduledTime", e.target.value)} disabled={isSubmitting} />
                </div>
              </div>

              {/* Técnico */}
              <div className="space-y-1.5">
                <Label>Técnico Asignado</Label>
                <Select value={form.technicianId ?? "none"}
                  onValueChange={v => set("technicianId", v === "none" ? null : v)} disabled={isSubmitting}>
                  <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin asignar</SelectItem>
                    {technicians.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}{t.role ? ` — ${t.role}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Activo */}
              {assets.length > 0 && (
                <div className="space-y-1.5">
                  <Label>Activo / Equipo</Label>
                  <Select value={form.assetId ?? "none"}
                    onValueChange={v => set("assetId", v === "none" ? null : v)} disabled={isSubmitting}>
                    <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin asignar</SelectItem>
                      {assets.map(a => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name} ({a.asset_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.assetId && (
                    <p className="text-xs text-muted-foreground">
                      Próximo mantenimiento: {assets.find(a => a.id === form.assetId)?.next_maintenance_date ?? "N/A"}
                    </p>
                  )}
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />{error}
                </div>
              )}

              <div className="flex gap-2 pb-1">
                <Button type="submit" className="flex-1 gap-2" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {isSubmitting ? "Creando..." : "Crear Orden"}
                </Button>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </form>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
