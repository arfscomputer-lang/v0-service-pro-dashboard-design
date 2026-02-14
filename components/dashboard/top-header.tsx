'use client'

import { useState } from 'react'
import { Search, Bell, HelpCircle, Plus, Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function TopHeader() {
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    customer: '',
    address: '',
    type: '',
    priority: 'media',
    description: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateOrder = async () => {
    if (!formData.customer || !formData.address || !formData.type) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/work-orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setOrderDialogOpen(false)
        setFormData({ customer: '', address: '', type: '', priority: 'media', description: '' })
        window.location.reload()
      } else {
        alert('Error al crear la orden')
      }
    } catch (error) {
      console.error('[v0] Error creating order:', error)
      alert('Error de conexión')
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
                Completa los datos para crear una nueva orden de trabajo en el sistema.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Cliente *</Label>
                <Input
                  id="customer"
                  placeholder="Nombre del cliente"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección *</Label>
                <Input
                  id="address"
                  placeholder="Dirección del servicio"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Servicio *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reparacion_hvac">Reparación HVAC</SelectItem>
                    <SelectItem value="mantenimiento">Mantenimiento Preventivo</SelectItem>
                    <SelectItem value="inspeccion_gas">Inspección de Gas</SelectItem>
                    <SelectItem value="instalacion_ac">Instalación AC</SelectItem>
                    <SelectItem value="reparacion_caldera">Reparación Caldera</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
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
                />
              </div>

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
