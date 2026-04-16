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
import { Plus, Trash2, AlertCircle, Loader, Pencil } from 'lucide-react'

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
  serial_number?: string
  description?: string
  year_manufactured?: number
  site_location?: string
  capacity?: string
  recurrence_type?: string
  interval_months?: number
}

const EMPTY_FORM = {
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
}

export default function ActivosPage() {
  const auth = useAuth()
  const { customers } = useCustomers()

  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)

  const [createForm, setCreateForm] = useState({ ...EMPTY_FORM })
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM })

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
  const loadAssets = useCallback(async (customerId: string) => {
    if (!customerId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/assets?customer_id=${customerId}`)
      if (!res.ok) throw new Error('Failed to fetch assets')
      const data = await res.json()
      setAssets(data.assets || [])
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedCustomerId) loadAssets(selectedCustomerId)
  }, [selectedCustomerId, loadAssets])

  const handleCreateAsset = useCallback(async () => {
    setError(null)
    if (!createForm.name || !createForm.asset_id || !createForm.serial_number) {
      setError('Por favor completa los campos: Nombre, ID Activo y Serial')
      return
    }
    setIsSaving(true)
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
      setAssets(prev => [newAsset, ...prev])
      setIsCreateOpen(false)
      setCreateForm({ ...EMPTY_FORM, customer_id: selectedCustomerId })
    } catch (err) {
      setError(String(err))
    } finally {
      setIsSaving(false)
    }
  }, [createForm, selectedCustomerId])

  const handleOpenEdit = useCallback((asset: Asset) => {
    setEditingAsset(asset)
    setEditForm({
      asset_id: asset.asset_id || '',
      name: asset.name || '',
      customer_id: selectedCustomerId,
      type: asset.type || 'compresor',
      category: asset.category || 'reactivo',
      serial_number: asset.serial_number || '',
      status: asset.status || 'activo',
      criticality: asset.criticality || 'medio',
      brand: asset.brand || '',
      model: asset.model || '',
      year_manufactured: asset.year_manufactured || new Date().getFullYear(),
      site_location: asset.site_location || '',
      capacity: asset.capacity || '',
      description: asset.description || '',
      has_maintenance_plan: asset.has_maintenance_plan || false,
      recurrence_type: asset.recurrence_type || 'mensual',
      interval_months: asset.interval_months || 1,
    })
    setIsEditOpen(true)
  }, [selectedCustomerId])

  const handleEditAsset = useCallback(async () => {
    if (!editingAsset) return
    setError(null)
    if (!editForm.name || !editForm.asset_id || !editForm.serial_number) {
      setError('Por favor completa los campos: Nombre, ID Activo y Serial')
      return
    }
    setIsSaving(true)
    try {
      const res = await fetch(`/api/assets/${editingAsset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update asset')
      }
      const updated = await res.json()
      setAssets(prev => prev.map(a => a.id === editingAsset.id ? updated : a))
      setIsEditOpen(false)
      setEditingAsset(null)
    } catch (err) {
      setError(String(err))
    } finally {
      setIsSaving(false)
    }
  }, [editingAsset, editForm])

  const handleDeleteAsset = useCallback(async (assetId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este activo?')) return
    setIsDeleting(assetId)
    try {
      const res = await fetch(`/api/assets/${assetId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete asset')
      setAssets(prev => prev.filter(a => a.id !== assetId))
    } catch (err) {
      setError(String(err))
    } finally {
      setIsDeleting(null)
    }
  }, [])

  const canSelectCustomer = auth?.user?.role === 'admin' || auth?.user?.role === 'supervisor'

  const AssetForm = ({ form, setForm }: { form: typeof EMPTY_FORM, setForm: (f: any) => void }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="font-semibold">ID Activo *</Label>
          <Input value={form.asset_id} onChange={e => setForm({ ...form, asset_id: e.target.value })} placeholder="AC-2024-001" />
        </div>
        <div>
          <Label className="font-semibold">Nombre *</Label>
          <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Compresor Atlas Copco" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="font-semibold">Serial *</Label>
          <Input value={form.serial_number} onChange={e => setForm({ ...form, serial_number: e.target.value })} placeholder="AB123456" />
        </div>
        <div>
          <Label className="font-semibold">Tipo *</Label>
          <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
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
          <Label className="font-semibold">Categoría *</Label>
          <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="reactivo">Reactivo</SelectItem>
              <SelectItem value="preventivo">Preventivo</SelectItem>
              <SelectItem value="predictivo">Predictivo</SelectItem>
              <SelectItem value="instalacion">Instalación</SelectItem>
              <SelectItem value="inspeccion">Inspección</SelectItem>
              <SelectItem value="proyecto">Proyecto</SelectItem>
              <SelectItem value="garantia">Garantía</SelectItem>
              <SelectItem value="otros">Otros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Marca</Label>
          <Input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="Atlas Copco" />
        </div>
        <div>
          <Label>Modelo</Label>
          <Input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="GA15" />
        </div>
      </div>
      <div>
        <Label>Descripción</Label>
        <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detalles del equipo..." rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Estado</Label>
          <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="inactivo">Inactivo</SelectItem>
              <SelectItem value="en_reparacion">En Reparación</SelectItem>
              <SelectItem value="retirado">Retirado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Criticidad</Label>
          <Select value={form.criticality} onValueChange={v => setForm({ ...form, criticality: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="bajo">Baja</SelectItem>
              <SelectItem value="medio">Media</SelectItem>
              <SelectItem value="alto">Alta</SelectItem>
              <SelectItem value="critico">Crítica</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="has_plan" checked={form.has_maintenance_plan} onChange={e => setForm({ ...form, has_maintenance_plan: e.target.checked })} />
        <Label htmlFor="has_plan" className="cursor-pointer">Tiene Plan de Mantenimiento</Label>
      </div>
      {form.has_maintenance_plan && (
        <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded">
          <div>
            <Label>Recurrencia</Label>
            <Select value={form.recurrence_type} onValueChange={v => setForm({ ...form, recurrence_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
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
            <Input type="number" value={form.interval_months} onChange={e => setForm({ ...form, interval_months: parseInt(e.target.value) })} min="1" />
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Gestión de Activos</h1>
          <p className="text-slate-600">Equipos y máquinas bajo mantenimiento</p>
        </div>

        {canSelectCustomer && (
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <Label htmlFor="customer-select" className="block mb-2 font-semibold">Seleccionar Cliente</Label>
            <Select value={selectedCustomerId} onValueChange={(v) => {
              setSelectedCustomerId(v)
              setCreateForm(prev => ({ ...prev, customer_id: v }))
            }}>
              <SelectTrigger id="customer-select" className="w-full max-w-md">
                <SelectValue placeholder="Elige un cliente..." />
              </SelectTrigger>
              <SelectContent>
                {customers.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-900 font-medium">Error</p>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">✕</button>
          </div>
        )}

        <div className="mb-6">
          <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Activo
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <Loader className="w-6 h-6 mx-auto animate-spin text-blue-600 mb-2" />
              <p className="text-slate-500">Cargando activos...</p>
            </div>
          ) : assets.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No hay activos registrados para este cliente</div>
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
                    <TableCell className="capitalize">{asset.type}</TableCell>
                    <TableCell className="text-sm">
                      {asset.brand || asset.model ? `${asset.brand || ''} ${asset.model || ''}`.trim() : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={asset.status === 'activo' ? 'default' : 'secondary'} className="capitalize">
                        {asset.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          asset.criticality === 'critico' ? 'bg-red-100 text-red-800 border-red-200' :
                          asset.criticality === 'alto' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                          asset.criticality === 'medio' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-green-100 text-green-800 border-green-200'
                        }
                      >
                        {asset.criticality}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(asset)}
                          title="Editar activo"
                        >
                          <Pencil className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAsset(asset.id)}
                          disabled={isDeleting === asset.id}
                          title="Eliminar activo"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Create Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Activo</DialogTitle>
            </DialogHeader>
            <AssetForm form={createForm} setForm={setCreateForm} />
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreateAsset} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                {isSaving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                Crear Activo
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Activo — {editingAsset?.name}</DialogTitle>
            </DialogHeader>
            <AssetForm form={editForm} setForm={setEditForm} />
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <Button variant="outline" onClick={() => { setIsEditOpen(false); setEditingAsset(null) }}>Cancelar</Button>
              <Button onClick={handleEditAsset} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                {isSaving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                Guardar Cambios
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
