'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Asset {
  id: string
  asset_id: string
  name: string
  description?: string
  brand?: string
  model?: string
  serial_number: string
  year_manufactured: number
  asset_type: string
  category: string
  status: 'active' | 'inactive' | 'in_repair' | 'retired'
  criticality: 'low' | 'medium' | 'high' | 'critical'
  customer_id?: string
  location?: string
  capacity?: string
  has_maintenance_plan: boolean
  recurrence_type?: string
  recurrence_months?: number
  created_at: string
  updated_at: string
}

export default function ActivosPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [createForm, setCreateForm] = useState({
    asset_id: '',
    name: '',
    description: '',
    brand: '',
    model: '',
    serial_number: '',
    year_manufactured: new Date().getFullYear(),
    asset_type: 'compresor',
    category: 'reactivo',
    status: 'active',
    criticality: 'medium',
    customer_id: '',
    location: '',
    capacity: '',
    has_maintenance_plan: false,
    recurrence_type: 'monthly',
    recurrence_months: 1,
  })

  // Cargar activos
  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets')
      const data = await res.json()
      setAssets(data || [])
    } catch (error) {
      console.error('[v0] Error fetching assets:', error)
    } finally {
      setLoading(false)
    }
  }

  // Crear activo
  const handleCreate = useCallback(async () => {
    if (!createForm.name || !createForm.asset_id || !createForm.serial_number) {
      alert('Por favor completa los campos obligatorios')
      return
    }

    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })

      if (res.ok) {
        const newAsset = await res.json()
        setAssets([newAsset, ...assets])
        setIsCreateOpen(false)
        setCreateForm({
          asset_id: '',
          name: '',
          description: '',
          brand: '',
          model: '',
          serial_number: '',
          year_manufactured: new Date().getFullYear(),
          asset_type: 'compresor',
          category: 'reactivo',
          status: 'active',
          criticality: 'medium',
          customer_id: '',
          location: '',
          capacity: '',
          has_maintenance_plan: false,
          recurrence_type: 'monthly',
          recurrence_months: 1,
        })
        alert('Activo creado exitosamente')
      }
    } catch (error) {
      console.error('[v0] Error creating asset:', error)
      alert('Error al crear activo')
    }
  }, [createForm, assets])

  // Actualizar activo
  const handleUpdate = useCallback(async () => {
    if (!editingAsset) return

    try {
      const res = await fetch(`/api/assets/${editingAsset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAsset),
      })

      if (res.ok) {
        const updated = await res.json()
        setAssets(assets.map(a => a.id === updated.id ? updated : a))
        setIsEditOpen(false)
        setEditingAsset(null)
        alert('Activo actualizado exitosamente')
      }
    } catch (error) {
      console.error('[v0] Error updating asset:', error)
      alert('Error al actualizar activo')
    }
  }, [editingAsset, assets])

  // Eliminar activo
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este activo?')) return

    try {
      const res = await fetch(`/api/assets/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setAssets(assets.filter(a => a.id !== id))
        alert('Activo eliminado')
      }
    } catch (error) {
      console.error('[v0] Error deleting asset:', error)
      alert('Error al eliminar activo')
    }
  }, [assets])

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'in_repair': return 'bg-orange-100 text-orange-800'
      case 'retired': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Activos</h1>
          <p className="text-sm text-muted-foreground">Equipos y máquinas bajo mantenimiento</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Activo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Activo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Información Básica */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ID Activo *</Label>
                  <Input
                    value={createForm.asset_id}
                    onChange={(e) => setCreateForm({ ...createForm, asset_id: e.target.value })}
                    placeholder="AC-2024-001"
                  />
                </div>
                <div>
                  <Label>Nombre *</Label>
                  <Input
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="Compresor Rotativo"
                  />
                </div>
              </div>

              {/* Marca, Modelo, Serial */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Marca</Label>
                  <Input
                    value={createForm.brand}
                    onChange={(e) => setCreateForm({ ...createForm, brand: e.target.value })}
                    placeholder="Atlas Copco"
                  />
                </div>
                <div>
                  <Label>Modelo</Label>
                  <Input
                    value={createForm.model}
                    onChange={(e) => setCreateForm({ ...createForm, model: e.target.value })}
                    placeholder="GA15 VSD+"
                  />
                </div>
                <div>
                  <Label>Número de Serie *</Label>
                  <Input
                    value={createForm.serial_number}
                    onChange={(e) => setCreateForm({ ...createForm, serial_number: e.target.value })}
                    placeholder="XYZ123456"
                  />
                </div>
              </div>

              {/* Año, Tipo, Categoría */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Año Fabricación</Label>
                  <Input
                    type="number"
                    value={createForm.year_manufactured}
                    onChange={(e) => setCreateForm({ ...createForm, year_manufactured: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Tipo de Activo</Label>
                  <Select value={createForm.asset_type} onValueChange={(v) => setCreateForm({ ...createForm, asset_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compresor">Compresor</SelectItem>
                      <SelectItem value="bomba">Bomba</SelectItem>
                      <SelectItem value="caldera">Caldera</SelectItem>
                      <SelectItem value="hvac">HVAC</SelectItem>
                      <SelectItem value="filtro">Filtro</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Categoría</Label>
                  <Select value={createForm.category} onValueChange={(v) => setCreateForm({ ...createForm, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reactivo">Reactivo</SelectItem>
                      <SelectItem value="preventivo">Preventivo</SelectItem>
                      <SelectItem value="predictivo">Predictivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Estado, Criticidad */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Estado</Label>
                  <Select value={createForm.status} onValueChange={(v) => setCreateForm({ ...createForm, status: v as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="in_repair">En Reparación</SelectItem>
                      <SelectItem value="retired">Retirado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Criticidad</Label>
                  <Select value={createForm.criticality} onValueChange={(v) => setCreateForm({ ...createForm, criticality: v as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <Label>Descripción</Label>
                <Textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Detalles adicionales..."
                  rows={3}
                />
              </div>

              {/* Mantenimiento */}
              <div>
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={createForm.has_maintenance_plan}
                    onChange={(e) => setCreateForm({ ...createForm, has_maintenance_plan: e.target.checked })}
                  />
                  Tiene Plan de Mantenimiento
                </Label>
              </div>

              {createForm.has_maintenance_plan && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
                  <div>
                    <Label>Tipo de Recurrencia</Label>
                    <Select value={createForm.recurrence_type || 'monthly'} onValueChange={(v) => setCreateForm({ ...createForm, recurrence_type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensual</SelectItem>
                        <SelectItem value="quarterly">Trimestral</SelectItem>
                        <SelectItem value="biannual">Semestral</SelectItem>
                        <SelectItem value="annual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Intervalo (meses)</Label>
                    <Input
                      type="number"
                      value={createForm.recurrence_months}
                      onChange={(e) => setCreateForm({ ...createForm, recurrence_months: parseInt(e.target.value) })}
                      min="1"
                    />
                  </div>
                </div>
              )}

              <Button onClick={handleCreate} className="w-full">Crear Activo</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabla de Activos */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando activos...</div>
      ) : assets.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No hay activos registrados</div>
      ) : (
        <div className="space-y-2">
          {assets.map((asset) => (
            <div key={asset.id} className="border rounded-lg overflow-hidden">
              {/* Row Collapsed */}
              <div
                onClick={() => setExpandedId(expandedId === asset.id ? null : asset.id)}
                className="flex items-center justify-between p-4 bg-muted/50 hover:bg-muted cursor-pointer"
              >
                <div className="flex items-center gap-4 flex-1">
                  {expandedId === asset.id ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-semibold">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">{asset.asset_id} • {asset.brand} {asset.model}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(asset.status)}>{asset.status}</Badge>
                  <Badge className={getCriticalityColor(asset.criticality)}>
                    {asset.criticality}
                  </Badge>
                  {asset.has_maintenance_plan && (
                    <Badge variant="outline" className="bg-green-50">Preventivo</Badge>
                  )}
                </div>
              </div>

              {/* Row Expanded */}
              {expandedId === asset.id && (
                <div className="border-t p-4 bg-background space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Serial</p>
                      <p className="font-mono">{asset.serial_number}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ubicación</p>
                      <p>{asset.location || '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Capacidad</p>
                      <p>{asset.capacity || '—'}</p>
                    </div>
                  </div>

                  {asset.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">Descripción</p>
                      <p className="text-sm">{asset.description}</p>
                    </div>
                  )}

                  {asset.has_maintenance_plan && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900">Plan de Mantenimiento</p>
                      <p className="text-sm text-blue-800">Recurrencia: {asset.recurrence_type} • {asset.recurrence_months} meses</p>
                    </div>
                  )}

                  <div className="flex gap-2 justify-end pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingAsset(asset)
                        setIsEditOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(asset.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editingAsset && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Activo: {editingAsset.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={editingAsset.name}
                  onChange={(e) => setEditingAsset({ ...editingAsset, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Descripción</Label>
                <Textarea
                  value={editingAsset.description || ''}
                  onChange={(e) => setEditingAsset({ ...editingAsset, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Estado</Label>
                  <Select value={editingAsset.status} onValueChange={(v) => setEditingAsset({ ...editingAsset, status: v as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="in_repair">En Reparación</SelectItem>
                      <SelectItem value="retired">Retirado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Criticidad</Label>
                  <Select value={editingAsset.criticality} onValueChange={(v) => setEditingAsset({ ...editingAsset, criticality: v as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleUpdate} className="w-full">Guardar Cambios</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
