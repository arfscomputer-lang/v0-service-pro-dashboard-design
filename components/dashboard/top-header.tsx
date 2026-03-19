"use client"

import { useState, useMemo, useCallback } from "react"
import { useCustomers } from "@/lib/context/customers-context"
import { useWorkOrders } from "@/lib/context/work-orders-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Bell, HelpCircle, AlertCircle, CheckCircle2, Radio } from "lucide-react"

export function TopHeader() {
  const { customers } = useCustomers()
  const { addWorkOrder } = useWorkOrders()
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    customerId: "",
    locationId: "",
    type: "",
    priority: "media",
    description: "",
  })

  const getLocationsByCustomerId = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId)
    if (!customer) return []

    const locations = []
    if (customer.address && customer.city) {
      locations.push({
        id: "main",
        label: `${customer.name} (Sede Principal)`,
        address: customer.address,
        city: customer.city,
      })
    }
    if (customer.branches) {
      customer.branches.forEach((br) => {
        if (br.address && br.city) {
          locations.push({
            id: br.id,
            label: `${br.address}, ${br.city}`,
            address: br.address,
            city: br.city,
          })
        }
      })
    }
    return locations
  }

  const availableLocations = useMemo(() => {
    return getLocationsByCustomerId(formData.customerId)
  }, [formData.customerId, customers])

  const handleCustomerChange = useCallback((customerId: string) => {
    setFormData((prev) => ({
      ...prev,
      customerId,
      locationId: "",
    }))
  }, [])

  const handleCreateOrder = async () => {
    if (!formData.customerId || !formData.locationId || !formData.type) {
      setError("Por favor completa los campos requeridos (cliente, sede, tipo)")
      return
    }

    const selectedLocation = availableLocations.find((l) => l.id === formData.locationId)
    if (!selectedLocation || !selectedLocation.address?.trim() || !selectedLocation.city?.trim()) {
      setError("Sede seleccionada no tiene dirección válida. Contacte al administrador.")
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const orderData = {
        orderId: `OT-${Date.now()}`,
        type: formData.type.trim(),
        description: (formData.description || "").trim(),
        status: "pendiente" as const,
        priority: formData.priority === "media" ? ("normal" as const) : (formData.priority as any),
        address: selectedLocation.address.trim(),
        city: selectedLocation.city.trim(),
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: "09:00",
        customerId: formData.customerId,
        technicianId: null,
      }

      await addWorkOrder(orderData)
      setSuccess("Orden creada exitosamente")
      setFormData({
        customerId: "",
        locationId: "",
        type: "",
        priority: "media",
        description: "",
      })
      setTimeout(() => {
        setOrderDialogOpen(false)
        setSuccess("")
      }, 2000)
    } catch (err) {
      console.error("[v0] Error creating order:", err)
      setError(err instanceof Error ? err.message : "Error de conexión. Intente nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex-1 max-w-md">
        <div className="relative flex items-center rounded-md border border-border bg-secondary px-3 py-2">
          <Search className="h-4 w-4 mr-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar orden, cliente o técnico..."
            className="flex-1 bg-transparent text-sm outline-none text-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-6">
        <div className="hidden md:flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 border border-emerald-200">
          <Radio className="h-3 w-3 text-emerald-600 animate-pulse" />
          <span className="text-[11px] font-medium text-emerald-700">En Vivo</span>
        </div>

        <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva Orden</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Crear Nueva Orden de Trabajo</DialogTitle>
              <DialogDescription>Selecciona cliente, sede y completa los datos para crear una nueva orden.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Cliente *</Label>
                <Select value={formData.customerId} onValueChange={handleCustomerChange} disabled={isSubmitting}>
                  <SelectTrigger id="customer">
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers
                      .filter((customer) => getLocationsByCustomerId(customer.id).length > 0)
                      .map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.customerId && availableLocations.length === 0 && (
                <div className="flex items-center gap-2 p-3 text-sm text-amber-600 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Este cliente no tiene sedes con dirección registrada</span>
                </div>
              )}

              {formData.customerId && availableLocations.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="location">Sede / Sucursal *</Label>
                  <Select value={formData.locationId} onValueChange={(value) => setFormData({ ...formData, locationId: value })} disabled={isSubmitting}>
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Selecciona una sede" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLocations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Servicio *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })} disabled={isSubmitting}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instalacion">Instalación</SelectItem>
                    <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                    <SelectItem value="reparacion">Reparación</SelectItem>
                    <SelectItem value="revision">Revisión</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })} disabled={isSubmitting}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Selecciona prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Notas adicionales sobre la orden..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button onClick={handleCreateOrder} disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Creando..." : "Crear Orden"}
                </Button>
                <Button variant="outline" onClick={() => setOrderDialogOpen(false)} disabled={isSubmitting} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
