'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, CheckCircle2, Plus, Bell, HelpCircle, Loader2 } from 'lucide-react'
import { useCustomers } from '@/lib/context/customers-context'
import { useWorkOrders } from '@/lib/context/work-orders-context'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Panel Principal',
  '/despacho': 'Agenda y Despacho',
  '/ordenes': 'Órdenes de Trabajo',
  '/tecnicos': 'Técnicos',
  '/clientes': 'Clientes',
  '/clientes/reportes': 'Reportes CRM',
  '/inventario': 'Inventario',
  '/presupuestos': 'Presupuestos',
  '/reportes': 'Reportes',
  '/facturas': 'Facturas',
  '/activos': 'Gestión de Activos',
  '/mantenimiento': 'Mantenimiento',
  '/configuracion': 'Configuración',
}

export function TopHeader() {
  const { customers } = useCustomers()
  const { addWorkOrder } = useWorkOrders()
  const pathname = usePathname()
  const pageTitle = PAGE_TITLES[pathname] ?? PAGE_TITLES[Object.keys(PAGE_TITLES).find(k => k !== '/' && pathname.startsWith(k)) ?? ''] ?? 'ServicePro'
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

  const availableLocations = getLocationsByCustomerId(formData.customerId)

  const handleCreateOrder = async () => {
    if (!formData.customerId || !formData.locationId || !formData.type) {
      setError('Por favor completa los campos requeridos')
      return
    }

    const selectedLocation = availableLocations.find((l) => l.id === formData.locationId)
    if (!selectedLocation || !selectedLocation.address?.trim() || !selectedLocation.city?.trim()) {
      setError('Sede sin dirección válida')
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Error al crear orden')
        return
      }

      setSuccess('Orden creada exitosamente')
      setFormData({ customerId: '', locationId: '', type: '', priority: 'media', description: '' })
      setTimeout(() => {
        setOrderDialogOpen(false)
        setSuccess('')
      }, 2000)
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <header className="border-b border-border bg-background sticky top-0 z-40">
      <div className="px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{pageTitle}</h1>

        <div className="flex items-center gap-4">
          <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva Orden
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nueva Orden de Trabajo</DialogTitle>
                <DialogDescription>Crea una nueva orden rápidamente</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Cliente *</Label>
                  <Select value={formData.customerId} onValueChange={(v) => setFormData({ ...formData, customerId: v, locationId: '' })} disabled={isSubmitting}>
                    <SelectTrigger id="customer">
                      <SelectValue placeholder="Selecciona cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.filter((c) => getLocationsByCustomerId(c.id).length > 0).map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.customerId && availableLocations.length === 0 && (
                  <div className="flex items-center gap-2 p-3 text-sm text-amber-600 bg-amber-50 rounded-lg border border-amber-200">
                    <AlertCircle className="h-4 w-4" />
                    <span>Cliente sin sedes con dirección</span>
                  </div>
                )}

                {formData.customerId && availableLocations.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="location">Sede *</Label>
                    <Select value={formData.locationId} onValueChange={(v) => setFormData({ ...formData, locationId: v })} disabled={isSubmitting}>
                      <SelectTrigger id="location">
                        <SelectValue placeholder="Selecciona sede" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLocations.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>{loc.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Servicio *</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })} disabled={isSubmitting}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instalacion">Instalación</SelectItem>
                      <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="reparacion">Reparación</SelectItem>
                      <SelectItem value="diagnostico">Diagnóstico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })} disabled={isSubmitting}>
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
                  <Input id="description" placeholder="Detalles..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} disabled={isSubmitting} />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 rounded-lg">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{success}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleCreateOrder} disabled={isSubmitting} className="flex-1 gap-2">
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Creando...' : 'Crear Orden'}
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
      </div>
    </header>
  )
}
