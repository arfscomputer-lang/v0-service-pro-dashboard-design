"use client"

import { useState, useMemo } from "react"
import { Search, Bell, HelpCircle, Plus, Radio, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

  // Get available locations for a customer (with valid addresses)
  const getLocationsByCustomerId = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId)
    if (!customer) return []

    const locations = []
    // Only add main location if it has a valid address
    if (customer.address && customer.city) {
      locations.push({
        id: "main",
        label: `${customer.name} (Sede Principal)`,
        address: customer.address,
        city: customer.city,
      })
    }
    // Only add branches with valid addresses
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

  const handleCustomerChange = (customerId: string) => {
    setFormData({ ...formData, customerId, locationId: "" })
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

    // Extra strict validation for address and city - must exist and not be empty
    if (!selectedLocation.address?.trim()) {
      setError("La sede seleccionada no tiene dirección válida. Contacte al administrador.")
      return
    }

    if (!selectedLocation.city?.trim()) {
      setError("La sede seleccionada no tiene ciudad válida. Contacte al administrador.")
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const orderData = {
        order_id: `OT-${Date.now()}`,
        type: formData.type.trim(),
        description: (formData.description || "").trim(),
        status: "pendiente",
        priority: formData.priority === "media" ? "normal" : formData.priority,
        address: selectedLocation.address.trim(),
        city: selectedLocation.city.trim(),
        scheduled_date: new Date().toISOString().split('T')[0],
        scheduled_time: "09:00",
        customer_id: formData.customerId,
        technician_id: null,
      }

      console.log("[v0] Sending order data to API:", JSON.stringify(orderData))

      const response = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const text = await response.text()
        console.error("[v0] API Response (status:", response.status, "):", text)
        
        let errorMsg = `Error: ${response.status}`
        if (response.headers.get("content-type")?.includes("application/json")) {
          try {
            const data = JSON.parse(text)
            errorMsg = data.error || errorMsg
          } catch (e) {
            // Failed to parse JSON, use generic error
          }
        }
        setError(errorMsg)
        setIsSubmitting(false)
        return
      }

      const data = await response.json()
      console.log("[v0] Order created successfully:", data)

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
      setError("Error de conexión. Intente nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

    const selectedLocation = availableLocations.find((l) => l.id === formData.locationId)
    
    // Extra validation to ensure address and city are not null
    if (!selectedLocation || !selectedLocation.address?.trim() || !selectedLocation.city?.trim()) {
      setError("Sede seleccionada no tiene dirección válida. Contacte al administrador.")
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const orderData = {
        order_id: `OT-${Date.now()}`,
        type: formData.type,
        description: formData.description || "",
        status: "pendiente",
        priority: formData.priority === "media" ? "normal" : formData.priority,
        address: selectedLocation.address.trim(),
        city: selectedLocation.city.trim(),
        scheduled_date: new Date().toISOString().split('T')[0],
        scheduled_time: "09:00",
        customer_id: formData.customerId,
        technician_id: null,
      }

      console.log("[v0] Sending order data to API:", orderData)

      const response = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const text = await response.text()
        console.error("[v0] API Response (status:", response.status, "):", text)
        
        let errorMsg = `Error: ${response.status}`
        if (response.headers.get("content-type")?.includes("application/json")) {
          try {
            const data = JSON.parse(text)
            errorMsg = data.error || errorMsg
          } catch (e) {
            // Failed to parse JSON, use generic error
          }
        }
        setError(errorMsg)
        setIsSubmitting(false)
        return
      }

      const data = await response.json()
      console.log("[v0] Order created successfully:", data)

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
      setError("Error de conexión. Intente nuevamente.")
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
                      .filter((customer) => {
                        // Only show customers that have at least one location with valid address
                        const locations = getLocationsByCustomerId(customer.id)
                        return locations.length > 0
                      })
                      .map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {customers.filter((c) => getLocationsByCustomerId(c.id).length === 0).length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {customers.filter((c) => getLocationsByCustomerId(c.id).length === 0).length} cliente(s) sin dirección registrada
                  </p>
                )}
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
