'use client'

import { useState, useMemo } from 'react'
import { Plus, AlertCircle, CheckCircle2, Bell, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCustomers } from '@/lib/context/customers-context'
import { useWorkOrders } from '@/lib/context/work-orders-context'

export function TopHeader() {
  const { customers } = useCustomers()
  const { addWorkOrder } = useWorkOrders()
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    customerId: '',
    locationId: '',
    type: '',
    priority: 'media',
    description: '',
  })

  const getLocationsByCustomerId = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId)
    if (!customer) return []

    const locations = []
    if (customer.address && customer.city) {
      locations.push({
        id: 'main',
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

  const handleCustomerChange = (value: string) => {
    setFormData({ ...formData, customerId: value, locationId: '' })
    setError('')
  }

  const handleCreateOrder = async () => {
    if (!formData.customerId || !formData.locationId || !formData.type) {
      setError('Por favor completa los campos requeridos (cliente, sede, tipo)')
      return
    }

    const selectedLocation = availableLocations.find((l) => l.id === formData.locationId)
    if (!selectedLocation) {
      setError('Sede inválida')
      return
    }

    if (!selectedLocation.address?.trim()) {
      setError('La sede seleccionada no tiene dirección válida. Contacte al administrador.')
      return
    }

    if (!selectedLocation.city?.trim()) {
      setError('La sede seleccionada no tiene ciudad válida. Contacte al administrador.')
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const orderData = {
        order_id: `OT-${Date.now()}`,
        type: formData.type.trim(),
        description: (formData.description || '').trim(),
        status: 'pendiente',
        priority: formData.priority === 'media' ? 'normal' : formData.priority,
        address: selectedLocation.address.trim(),
        city: selectedLocation.city.trim(),
        scheduled_date: new Date().toISOString().split('T')[0],
        scheduled_time: '09:00',
        customer_id: formData.customerId,
        technician_id: null,
      }

      const response = await fetch('/api/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const text = await response.text()
        let errorMsg = `Error: ${response.status}`
        if (response.headers.get('content-type')?.includes('application/json')) {
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

      setSuccess('Orden creada exitosamente')
      setFormData({
        customerId: '',
        locationId: '',
        type: '',
        priority: 'media',
        description: '',
      })
      setTimeout(() => {
        setOrderDialogOpen(false)
        setSuccess('')
      }, 2000)
    } catch (err) {
      setError('Error de conexión. Intente nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="flex items-center justify-between h-16 px-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Panel de Control</h2>
          <p className="text-xs text-muted-foreground">Bienvenido al sistema CCTV</p>
        </div>

        <div className="flex items-center gap-4">
          <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
            <Button
              onClick={() => setOrderDialogOpen(true)}
              className="gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Nueva Orden
            </Button>

            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Crear Nueva Orden de Trabajo</DialogTitle>
                <DialogDescription>
                  Completa los datos para crear una nueva orden de servicio
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Cliente *</label>
                  <Select
                    value={formData.customerId}
                    onValueChange={handleCustomerChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers
                        .filter((customer) => {
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
                </div>

                {formData.customerId && availableLocations.length === 0 && (
                  <div className="flex items-center gap-2 p-3 text-sm text-amber-600 bg-amber-50 rounded-lg border border-amber-200">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Este cliente no tiene sedes con dirección registrada</span>
                  </div>
                )}

                {formData.customerId && availableLocations.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Sede / Sucursal *</label>
                    <Select
                      value={formData.locationId}
                      onValueChange={(value) => setFormData({ ...formData, locationId: value })}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
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
                  <label className="text-sm font-medium text-foreground">Tipo de Servicio *</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instalacion">Instalación</SelectItem>
                      <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="reparacion">Reparación</SelectItem>
                      <SelectItem value="inspeccion">Inspección</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Prioridad</label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
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
                  <label className="text-sm font-medium text-foreground">Descripción</label>
                  <Textarea
                    placeholder="Detalles adicionales de la orden..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={isSubmitting}
                    rows={3}
                  />
                </div>

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
                    {isSubmitting ? 'Creando...' : 'Crear Orden'}
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

          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
