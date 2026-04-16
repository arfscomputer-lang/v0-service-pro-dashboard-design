'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import { useCustomers } from '@/lib/context/customers-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, AlertCircle, Loader } from 'lucide-react'

interface Asset {
  id: string
  asset_id: string
  name: string
  type: string
  category: string
  status: string
  criticality: string
  has_maintenance_plan: boolean
  brand?: string
  model?: string
}

export default function ActivosPage() {
  const auth = useAuth()
  const { customers } = useCustomers()

  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const [createForm, setCreateForm] = useState({
    asset_id: '',
    name: '',
    customer_id: '',
    type: 'compresor',
    category: 'reactivo',
    serial_number: '',
    status: 'activo',
    criticality: 'medio',
    brand: '',
    model: '',
    year_manufactured: new Date().getFullYear(),
    site_location: '',
    capacity: '',
    description: '',
    has_maintenance_plan: false,
    recurrence_type: 'mensual',
    interval_months: 1,
  })

  // Set initial customer based on role
  useEffect(() => {
    if (auth?.user?.role === 'cliente' && auth.user.customerId) {
      setSelectedCustomerId(auth.user.customerId)
      setCreateForm(prev => ({ ...prev, customer_id: auth.user.customerId }))
    } else if (auth?.user?.role !== 'cliente' && customers.length > 0) {
      setSelectedCustomerId(customers[0].id)
      setCreateForm(prev => ({ ...prev, customer_id: customers[0].id }))
    }
  }, [auth?.user, customers])

  // Load assets for current customer
  useEffect(() => {
    if (!selectedCustomerId) return

    const loadAssets = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/assets?customer_id=${selectedCustomerId}`)
        if (!res.ok) throw new Error('Failed to fetch assets')
        const data = await res.json()
        setAssets(data.assets || [])
      } catch (err) {
        setError(String(err))
      } finally {
        setLoading(false)
      }
    }

    loadAssets()
  }, [selectedCustomerId])

  const handleCreateAsset = useCallback(async () => {
    setError(null)

    if (!createForm.name || !createForm.asset_id || !createForm.serial_number) {
      setError('Por favor completa los campos: Nombre, ID Activo y Serial')
      return
    }

    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create asset')
      }

      const newAsset = await res.json()
      setAssets([newAsset, ...assets])
      setIsCreateOpen(false)
      setCreateForm({
        asset_id: '',
        name: '',
        customer_id: selectedCustomerId,
        type: 'compresor',
        category: 'reactivo',
        serial_number: '',
        status: 'activo',
        criticality: 'medio',
        brand: '',
        model: '',
        year_manufactured: new Date().getFullYear(),
        site_location: '',
        capacity: '',
        description: '',
        has_maintenance_plan: false,
        recurrence_type: 'mensual',
        interval_months: 1,
      })
    } catch (err) {
      setError(String(err))
    }
  }, [createForm, selectedCustomerId, assets])

  const handleDeleteAsset = useCallback(
    async (assetId: string) => {
      if (!confirm('¿Estás seguro de que quieres eliminar este activo?')) return

      setIsDeleting(assetId)
      try {
        const res = await fetch(`/api/assets/${assetId}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Failed to delete asset')
        setAssets(assets.filter(a => a.id !== assetId))
      } catch (err) {
        setError(String(err))
      } finally {
        setIsDeleting(null)
      }
    },
    [assets]
  )

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

        {/* Customer Selection */}
        {canSelectCustomer && (
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <Label htmlFor="customer-select" className="block mb-2 font-semibold">
              Seleccionar Cliente
            </Label>
            <Select value={selectedCustomerId} onValueChange={(v) => {
              setSelectedCustomerId(v)
              setCreateForm(prev => ({ ...prev, customer_id: v }))
            }}>
              <SelectTrigger id="customer-select" className="w-full max-w-md">
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
          <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Activo
          </Button>
        </div>

        {/* Assets Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <Loader className="w-6 h-6 mx-auto animate-spin text-blue-600 mb-2" />
              <p className="text-slate-500">Cargando activos...</p>
            </div>
          ) : assets.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No hay activos registrados para este cliente
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Nombre</TableHead>
                  <TableHead>ID Activo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Marca/Modelo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Criticidad</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map(asset => (
                  <TableRow key={asset.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell className="text-sm text-slate-600">{asset.asset_id}</TableCell>
                    <TableCell>{asset.type}</TableCell>
                    <TableCell className="text-sm">
                      {asset.brand && asset.model ? `${asset.brand} ${asset.model}` : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={asset.status === 'active' ? 'default' : 'secondary'}>
                        {asset.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          asset.criticality === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : asset.criticality === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {asset.criticality}
                      </Badge>
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
            </DialogHeader>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">ID Activo *</Label>
                  <Input
                    value={createForm.asset_id}
                    onChange={e => setCreateForm({ ...createForm, asset_id: e.target.value })}
                    placeholder="AC-2024-001"
                  />
                </div>
                <div>
                  <Label className="font-semibold">Nombre *</Label>
                  <Input
                    value={createForm.name}
                    onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="Compresor Atlas Copco"
                  />
                </div>
              </div>

              {/* Serial & Type */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="font-semibold">Serial *</Label>
                  <Input
                    value={createForm.serial_number}
                    onChange={e => setCreateForm({ ...createForm, serial_number: e.target.value })}
                    placeholder="AB123456"
                  />
                </div>
                <div>
                  <Label className="font-semibold">Tipo *</Label>
                  <Select value={createForm.type} onValueChange={v => setCreateForm({ ...createForm, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compresor">Compresor</SelectItem>
                      <SelectItem value="bomba">Bomba</SelectItem>
                      <SelectItem value="caldera">Caldera</SelectItem>
                      <SelectItem value="hvac">HVAC</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-semibold">Categoría *</Label>
                  <Select value={createForm.category} onValueChange={v => setCreateForm({ ...createForm, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reactivo">Reactivo</SelectItem>
                      <SelectItem value="preventivo">Preventivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Brand & Model */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Marca</Label>
                  <Input
                    value={createForm.brand}
                    onChange={e => setCreateForm({ ...createForm, brand: e.target.value })}
                    placeholder="Atlas Copco"
                  />
                </div>
                <div>
                  <Label>Modelo</Label>
                  <Input
                    value={createForm.model}
                    onChange={e => setCreateForm({ ...createForm, model: e.target.value })}
                    placeholder="GA15"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <Label>Descripción</Label>
                <Textarea
                  value={createForm.description}
                  onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Detalles del equipo..."
                  rows={3}
                />
              </div>

              {/* Status & Criticality */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Estado</Label>
                  <Select value={createForm.status} onValueChange={v => setCreateForm({ ...createForm, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                      <SelectItem value="en_reparacion">En Reparacion</SelectItem>
                      <SelectItem value="retirado">Retirado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Criticidad</Label>
                  <Select value={createForm.criticality} onValueChange={v => setCreateForm({ ...createForm, criticality: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bajo">Baja</SelectItem>
                      <SelectItem value="medio">Normal/Medio</SelectItem>
                      <SelectItem value="alto">Alta</SelectItem>
                      <SelectItem value="critico">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Maintenance Plan */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="has_plan"
                  checked={createForm.has_maintenance_plan}
                  onChange={e => setCreateForm({ ...createForm, has_maintenance_plan: e.target.checked })}
                />
                <Label htmlFor="has_plan" className="cursor-pointer">
                  Tiene Plan de Mantenimiento
                </Label>
              </div>

              {createForm.has_maintenance_plan && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded">
                  <div>
                    <Label>Recurrencia</Label>
                    <Select value={createForm.recurrence_type} onValueChange={v => setCreateForm({ ...createForm, recurrence_type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mensual">Mensual</SelectItem>
                        <SelectItem value="trimestral">Trimestral</SelectItem>
                        <SelectItem value="semestral">Semestral</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Intervalo (meses)</Label>
                    <Input
                      type="number"
                      value={createForm.interval_months}
                      onChange={e => setCreateForm({ ...createForm, interval_months: parseInt(e.target.value) })}
                      min="1"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateAsset} className="bg-blue-600 hover:bg-blue-700">
                Crear Activo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
