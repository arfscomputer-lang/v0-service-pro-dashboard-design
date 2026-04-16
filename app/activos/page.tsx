'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import { useAssets } from '@/lib/context/assets-context'
import { useCustomers } from '@/lib/context/customers-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2, ChevronDown, AlertCircle } from 'lucide-react'

export default function ActivosPage() {
  const auth = useAuth()
  const { assets, isLoading, addAsset, deleteAsset, getAssetsByCustomer } = useAssets()
  const { customers } = useCustomers()

  // State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [createForm, setCreateForm] = useState({
    asset_id: '',
    name: '',
    description: '',
    brand: '',
    model: '',
    serial_number: '',
    year_manufactured: new Date().getFullYear(),
    type: 'compresor',
    category: 'reactivo',
    status: 'active' as const,
    criticality: 'medium' as const,
    site_location: '',
    capacity: '',
    has_maintenance_plan: false,
    recurrence_type: 'monthly',
    interval_months: 1,
  })

  // Determine which customer to display
  const displayCustomerId = useMemo(() => {
    if (auth?.user?.role === 'cliente') {
      return auth.user.customerId || ''
    }
    return selectedCustomerId
  }, [auth?.user?.role, auth?.user?.customerId, selectedCustomerId])

  // Initialize customer selection for admins/supervisors
  useEffect(() => {
    if (auth?.user?.role !== 'cliente' && !selectedCustomerId && customers.length > 0) {
      setSelectedCustomerId(customers[0].id)
    }
  }, [auth?.user?.role, customers, selectedCustomerId])

  // Filter assets for current customer
  const displayedAssets = useMemo(() => {
    if (!displayCustomerId) return []
    return getAssetsByCustomer(displayCustomerId)
  }, [displayCustomerId, getAsse tsByCustomer])

  const selectedCustomer = useMemo(
    () => customers.find(c => c.id === displayCustomerId),
    [customers, displayCustomerId]
  )

  // Handlers
  const handleCreateAsset = useCallback(async () => {
    setError(null)

    if (!displayCustomerId) {
      setError('Por favor selecciona un cliente')
      return
    }

    if (!createForm.name || !createForm.asset_id || !createForm.serial_number) {
      setError('Por favor completa los campos obligatorios: Nombre, ID Activo y Serial')
      return
    }

    try {
      await addAsset(displayCustomerId, createForm as any)
      setIsCreateOpen(false)
      setCreateForm({
        asset_id: '',
        name: '',
        description: '',
        brand: '',
        model: '',
        serial_number: '',
        year_manufactured: new Date().getFullYear(),
        type: 'compresor',
        category: 'reactivo',
        status: 'active',
        criticality: 'medium',
        site_location: '',
        capacity: '',
        has_maintenance_plan: false,
        recurrence_type: 'monthly',
        interval_months: 1,
      })
    } catch (err) {
      setError('Error al crear activo: ' + String(err))
    }
  }, [displayCustomerId, createForm, addAsset])

  const handleDeleteAsset = useCallback(async (assetId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este activo?')) return

    setIsDeleting(assetId)
    try {
      await deleteAsset(assetId)
    } catch (err) {
      setError('Error al eliminar activo: ' + String(err))
    } finally {
      setIsDeleting(null)
    }
  }, [deleteAsset])

  // Role-based rendering
  const canSelectCustomer = auth?.user?.role === 'admin' || auth?.user?.role === 'supervisor'
  const isClient = auth?.user?.role === 'cliente'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Gestión de Activos</h1>
          <p className="text-slate-600">Equipos y máquinas bajo mantenimiento</p>
        </div>

        {/* Customer Selection (admin/supervisor only) */}
        {canSelectCustomer && (
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="customer-select" className="block mb-2 font-semibold text-slate-900">
                  Seleccionar Cliente
                </Label>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger id="customer-select">
                    <SelectValue placeholder="Elige un cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <span className="text-xs text-slate-500 pb-2">
                {isLoading ? 'Cargando...' : `${displayedAssets.length} activo${displayedAssets.length !== 1 ? 's' : ''}`}
              </span>
            </div>
          </div>
        )}

        {/* Client Info Banner */}
        {isClient && selectedCustomer && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 text-sm">
              <span className="font-semibold">Cliente:</span> {selectedCustomer.name}
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-900 font-medium">Error</p>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">
              ✕
            </button>
          </div>
        )}

        {/* Create Button */}
        <div className="mb-6">
          <Button
            onClick={() => {
              setError(null)
              setIsCreateOpen(true)
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Activo
          </Button>
        </div>

        {/* Assets Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Cargando activos...</div>
          ) : displayedAssets.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-500">No hay activos registrados para este cliente</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Marca/Modelo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Criticidad</TableHead>
                  <TableHead>Mantenimiento</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedAssets.map(asset => (
                  <React.Fragment key={asset.id}>
                    <TableRow className="hover:bg-slate-50">
                      <TableCell className="w-10">
                        <button
                          onClick={() =>
                            setExpandedAssetId(
                              expandedAssetId === asset.id ? null : asset.id
                            )
                          }
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              expandedAssetId === asset.id ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {asset.name}
                      </TableCell>
                      <TableCell className="text-slate-600">{asset.type}</TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {asset.brand && asset.model
                          ? `${asset.brand} ${asset.model}`
                          : asset.brand || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={asset.status === 'active' ? 'default' : 'secondary'}
                          className={
                            asset.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : ''
                          }
                        >
                          {asset.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${
                            asset.criticality === 'critical'
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : asset.criticality === 'high'
                              ? 'bg-orange-100 text-orange-800 border-orange-200'
                              : asset.criticality === 'medium'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : 'bg-green-100 text-green-800 border-green-200'
                          }`}
                        >
                          {asset.criticality}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {asset.has_maintenance_plan ? (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 border-blue-200 text-blue-800"
                          >
                            {asset.recurrence_type}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-sm">Sin plan</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAsset(asset.id)}
                          disabled={isDeleting === asset.id}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Row */}
                    {expandedAssetId === asset.id && (
                      <TableRow className="hover:bg-slate-50">
                        <TableCell colSpan={8} className="bg-slate-50 p-6">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                                  Serial
                                </p>
                                <p className="font-mono text-sm">{asset.serial_number}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                                  Año
                                </p>
                                <p className="text-sm">{asset.year_manufactured}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                                  Ubicación
                                </p>
                                <p className="text-sm">{asset.site_location || '—'}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                                  Capacidad
                                </p>
                                <p className="text-sm">{asset.capacity || '—'}</p>
                              </div>
                            </div>

                            {asset.description && (
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                                  Descripción
                                </p>
                                <p className="text-sm text-slate-700">
                                  {asset.description}
                                </p>
                              </div>
                            )}

                            {asset.has_maintenance_plan && (
                              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                                <p className="text-sm font-semibold text-blue-900 mb-1">
                                  Plan de Mantenimiento
                                </p>
                                <p className="text-sm text-blue-800">
                                  {asset.recurrence_type === 'monthly'
                                    ? 'Mensual'
                                    : asset.recurrence_type === 'quarterly'
                                    ? 'Trimestral'
                                    : asset.recurrence_type === 'biannual'
                                    ? 'Semestral'
                                    : 'Anual'}{' '}
                                  • Cada {asset.interval_months} mes
                                  {asset.interval_months !== 1 ? 'es' : ''}
                                </p>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Create Asset Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Activo</DialogTitle>
              {selectedCustomer && (
                <p className="text-sm text-slate-600 mt-2">
                  Para: <span className="font-semibold">{selectedCustomer.name}</span>
                </p>
              )}
            </DialogHeader>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">ID Activo *</Label>
                  <Input
                    value={createForm.asset_id}
                    onChange={e =>
                      setCreateForm({ ...createForm, asset_id: e.target.value })
                    }
                    placeholder="AC-2024-001"
                  />
                </div>
                <div>
                  <Label className="font-semibold">Nombre *</Label>
                  <Input
                    value={createForm.name}
                    onChange={e =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                    placeholder="Compresor Atlas Copco"
                  />
                </div>
              </div>

              {/* Brand, Model, Serial */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="font-semibold">Marca</Label>
                  <Input
                    value={createForm.brand}
                    onChange={e =>
                      setCreateForm({ ...createForm, brand: e.target.value })
                    }
                    placeholder="Atlas Copco"
                  />
                </div>
                <div>
                  <Label className="font-semibold">Modelo</Label>
                  <Input
                    value={createForm.model}
                    onChange={e =>
                      setCreateForm({ ...createForm, model: e.target.value })
                    }
                    placeholder="GA15"
                  />
                </div>
                <div>
                  <Label className="font-semibold">Serial *</Label>
                  <Input
                    value={createForm.serial_number}
                    onChange={e =>
                      setCreateForm({
                        ...createForm,
                        serial_number: e.target.value,
                      })
                    }
                    placeholder="AB123456"
                  />
                </div>
              </div>

              {/* Year, Type, Category */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="font-semibold">Año Fabricación</Label>
                  <Input
                    type="number"
                    value={createForm.year_manufactured}
                    onChange={e =>
                      setCreateForm({
                        ...createForm,
                        year_manufactured: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="font-semibold">Tipo</Label>
                  <Select
                    value={createForm.type}
                    onValueChange={v =>
                      setCreateForm({ ...createForm, type: v })
                    }
                  >
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
                  <Label className="font-semibold">Categoría</Label>
                  <Select
                    value={createForm.category}
                    onValueChange={v =>
                      setCreateForm({ ...createForm, category: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reactivo">Reactivo</SelectItem>
                      <SelectItem value="preventivo">Preventivo</SelectItem>
                      <SelectItem value="predictivo">Predictivo</SelectItem>
                      <SelectItem value="instalacion">Instalación</SelectItem>
                      <SelectItem value="inspeccion">Inspección</SelectItem>
                      <SelectItem value="proyecto">Proyecto/Mejora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Status, Criticality */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Estado</Label>
                  <Select
                    value={createForm.status}
                    onValueChange={v =>
                      setCreateForm({ ...createForm, status: v as any })
                    }
                  >
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
                  <Label className="font-semibold">Criticidad</Label>
                  <Select
                    value={createForm.criticality}
                    onValueChange={v =>
                      setCreateForm({ ...createForm, criticality: v as any })
                    }
                  >
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

              {/* Description */}
              <div>
                <Label className="font-semibold">Descripción</Label>
                <Textarea
                  value={createForm.description}
                  onChange={e =>
                    setCreateForm({
                      ...createForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Detalles del equipo..."
                  rows={3}
                />
              </div>

              {/* Location & Capacity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Ubicación</Label>
                  <Input
                    value={createForm.site_location}
                    onChange={e =>
                      setCreateForm({
                        ...createForm,
                        site_location: e.target.value,
                      })
                    }
                    placeholder="Planta A - Sala de máquinas"
                  />
                </div>
                <div>
                  <Label className="font-semibold">Capacidad</Label>
                  <Input
                    value={createForm.capacity}
                    onChange={e =>
                      setCreateForm({ ...createForm, capacity: e.target.value })
                    }
                    placeholder="150 PSI"
                  />
                </div>
              </div>

              {/* Maintenance Plan */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="has_plan"
                  checked={createForm.has_maintenance_plan}
                  onChange={e =>
                    setCreateForm({
                      ...createForm,
                      has_maintenance_plan: e.target.checked,
                    })
                  }
                  className="rounded border-slate-300"
                />
                <Label htmlFor="has_plan" className="font-semibold cursor-pointer">
                  Tiene Plan de Mantenimiento
                </Label>
              </div>

              {createForm.has_maintenance_plan && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <div>
                    <Label className="font-semibold text-blue-900">
                      Tipo Recurrencia
                    </Label>
                    <Select
                      value={createForm.recurrence_type}
                      onValueChange={v =>
                        setCreateForm({
                          ...createForm,
                          recurrence_type: v,
                        })
                      }
                    >
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
                    <Label className="font-semibold text-blue-900">
                      Intervalo (meses)
                    </Label>
                    <Input
                      type="number"
                      value={createForm.interval_months}
                      onChange={e =>
                        setCreateForm({
                          ...createForm,
                          interval_months: parseInt(e.target.value),
                        })
                      }
                      min="1"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false)
                  setError(null)
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateAsset}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Crear Activo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}


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
      console.log('[v0] Validation failed - missing required fields')
      alert('Por favor completa los campos obligatorios')
      return
    }

    try {
      console.log('[v0] Sending asset creation request:', createForm)
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })

      console.log('[v0] Response status:', res.status)
      const data = await res.json()
      console.log('[v0] Response data:', data)

      if (res.ok) {
        const newAsset = data
        console.log('[v0] Asset created successfully:', newAsset)
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
          type: 'compresor',
          category: 'reactivo',
          status: 'active',
          criticality: 'medium',
          customer_id: '',
          site_location: '',
          capacity: '',
          has_maintenance_plan: false,
          recurrence_type: 'monthly',
          interval_months: 1,
        })
        alert('Activo creado exitosamente')
      } else {
        console.error('[v0] Create failed with status', res.status, data)
        alert(`Error al crear activo: ${data.error || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error('[v0] Error creating asset:', error)
      alert('Error al crear activo: ' + String(error))
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
                  <Select value={createForm.type} onValueChange={(v) => setCreateForm({ ...createForm, type: v })}>
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
                      value={createForm.interval_months}
                      onChange={(e) => setCreateForm({ ...createForm, interval_months: parseInt(e.target.value) })}
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
                      <p>{asset.site_location || '—'}</p>
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
                      <p className="text-sm text-blue-800">Recurrencia: {asset.recurrence_type} • {asset.interval_months} meses</p>
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
