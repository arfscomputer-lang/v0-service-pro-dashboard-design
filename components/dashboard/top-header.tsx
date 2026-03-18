"use client"

import { useState, useMemo } from "react"
import { Search, Bell, HelpCircle, Plus, Radio, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCustomers } from "@/lib/context/customers-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function TopHeader() {
  const { customers } = useCustomers()
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    customerId: "",
    locationId: "", // "main" or branch ID
    type: "",
    priority: "media",
    description: "",
  })

  // Get available locations (main address + branches) for selected customer
  const availableLocations = useMemo(() => {
    if (!formData.customerId) return []
    const customer = customers.find((c) => c.id === formData.customerId)
    if (!customer) return []

    const locations = [
      { id: "main", label: `${customer.name} (Sede Principal)`, address: customer.address, city: customer.city },
      ...(customer.branches || []).map((br) => ({
        id: br.id,
        label: `${br.address}, ${br.city}`,
        address: br.address,
        city: br.city,
      })),
    ]
    return locations
  }, [formData.customerId, customers])

  // Reset location when customer changes
  const handleCustomerChange = (customerId: string) => {
    setFormData({
      ...formData,
      customerId,
      locationId: "",
    })
  }

  const handleCreateOrder = async () => {
    if (!formData.customerId || !formData.locationId || !formData.type) {
      setError("Por favor completa los campos requeridos (cliente, sede, tipo)")
      return
    }

    const selectedLocation = availableLocations.find((l) => l.id === formData.locationId)
    if (!selectedLocation) {
      setError("Sede inválida")
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/work-orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: formData.customerId,
          locationId: formData.locationId,
          address: selectedLocation.address,
          city: selectedLocation.city,
          type: formData.type,
          priority: formData.priority,
          description: formData.description,
        }),
      })

      if (response.ok) {
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
      } else {
        const data = await response.json()
        setError(data.error || "Error al crear la orden")
      }
    } catch (err) {
      console.error("[v0] Error creating order:", err)
      setError("Error de conexión. Intente nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Search */}
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

      {/* Actions */}
      <div className="flex items-center gap-3 ml-6">
        {/* Live indicator */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 border border-emerald-200">
          <Radio className="h-3 w-3 text-emerald-600 animate-pulse" />
          <span className="text-[11px] font-medium text-emerald-700">En Vivo</span>
        </div>

        {/* Nueva Orden Dialog */}
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
              <DialogDescription>
                Selecciona cliente, sede y completa los datos para crear una nueva orden.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Cliente *</Label>
                <Select value={formData.customerId} onValueChange={handleCustomerChange} disabled={isSubmitting}>
                  <SelectTrigger id="customer">
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.customerId && (
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
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Reparacion HVAC">Reparación HVAC</SelectItem>
                    <SelectItem value="Mantenimiento Preventivo">Mantenimiento Preventivo</SelectItem>
                    <SelectItem value="Inspeccion de Gas">Inspección de Gas</SelectItem>
                    <SelectItem value="Instalacion AC">Instalación AC</SelectItem>
                    <SelectItem value="Reparacion Caldera">Reparación Caldera</SelectItem>
                    <SelectItem value="Reparacion Electrica">Reparación Eléctrica</SelectItem>
                    <SelectItem value="Mantenimiento Plomeria">Mantenimiento Plomería</SelectItem>
                    <SelectItem value="Instalacion Electrica">Instalación Eléctrica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })} disabled={isSubmitting}>
                  <SelectTrigger id="priority">
                    <SelectValue />
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
                <Input
                  id="description"
                  placeholder="Detalles adicionales..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
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
                <Button
                  onClick={handleCreateOrder}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Creando..." : "Crear Orden"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setOrderDialogOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Notifications */}
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        {/* Help */}
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
