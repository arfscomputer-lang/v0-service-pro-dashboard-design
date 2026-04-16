'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { SidebarNav } from '@/components/dashboard/sidebar-nav'
import { TopHeader } from '@/components/dashboard/top-header'
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
import { Plus, Trash2, AlertCircle, Loader, Pencil, CalendarClock, Wrench, CheckCircle, AlertTriangle } from 'lucide-react'
import { getMaintenanceStatus, daysUntilMaintenance, formatMaintenanceDate } from '@/lib/maintenance'

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
  next_maintenance_date?: string | null
  last_maintenance_date?: string | null
  created_at?: string
}

interface MaintenanceSummary {
  total: number
  overdue: number
  upcoming: number
  up_to_date: number
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

function AssetForm({ form, setForm }: { form: typeof EMPTY_FORM, setForm: (f: typeof EMPTY_FORM) => void }) {
  return (
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
          <Label className="font-semibold">{"Categoría *"}</Label>
          <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="reactivo">Reactivo</SelectItem>
              <SelectItem value="preventivo">Preventivo</SelectItem>
              <SelectItem value="predictivo">Predictivo</SelectItem>
              <SelectItem value="instalacion">{"Instalación"}</SelectItem>
              <SelectItem value="inspeccion">{"Inspección"}</SelectItem>
              <SelectItem value="proyecto">Proyecto</SelectItem>
              <SelectItem value="garantia">{"Garantía"}</SelectItem>
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
        <Label>{"Descripción"}</Label>
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
              <SelectItem value="en_reparacion">En {"Reparación"}</SelectItem>
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
              <SelectItem value="critico">{"Crítica"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="has_plan" checked={form.has_maintenance_plan} onChange={e => setForm({ ...form, has_maintenance_plan: e.target.checked })} className="w-4 h-4" />
        <Label htmlFor="has_plan" className="cursor-pointer">Tiene Plan de Mantenimiento</Label>
      </div>
      {form.has_maintenance_plan && (
        <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded border border-blue-100">
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
            <Input type="number" value={form.interval_months} onChange={e => setForm({ ...form, interval_months: parseInt(e.target.value) || 1 })} min="1" />
          </div>
        </div>
      )}
    </div>
  )
}

function MaintenanceBadge({ asset }: { asset: Asset }) {
  if (!asset.has_maintenance_plan) return null

  const assetInfo = {
    ...asset,
    created_at: asset.created_at || new Date().toISOString(),
  }

  const status = getMaintenanceStatus(assetInfo as any, 7)
  const days = daysUntilMaintenance(asset.next_maintenance_date || null)

  if (status === 'sin_plan') return null

  if (status === 'vencido') {
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200 border text-xs">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Vencido {days !== null ? `(${Math.abs(days)}d)` : ''}
      </Badge>
    )
  }
  if (status === 'proximo') {
    return (
      <Badge className="bg-orange-100 text-orange-800 border-orange-200 border text-xs">
        <CalendarClock className="w-3 h-3 mr-1" />
        {days !== null ? `En ${days}d` : 'Proximo'}
      </Badge>
    )
  }
  return (
    <Badge className="bg-green-100 text-green-800 border-green-200 border text-xs">
      <CheckCircle className="w-3 h-3 mr-1" />
      Al dia
    </Badge>
  )
}

export default function ActivosPage() {
  const auth = useAuth()
  const { customers } = useCustomers()

  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [maintenanceSummary, setMaintenanceSummary] = useState<MaintenanceSummary | null>(null)

  const [createForm, setCreateForm] = useState({ ...EMPTY_FORM })
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM })

  useEffect(() => {
    if (auth?.user?.role === 'cliente' && auth.user.customerId) {
      setSelectedCustomerId(auth.user.customerId)
      setCreateForm(prev => ({ ...prev, customer_id: auth.user.customerId }))
    } else if (auth?.user?.role !== 'cliente' && customers.length > 0) {
      setSelectedCustomerId(customers[0].id)
      setCreateForm(prev => ({ ...prev, customer_id: customers[0].id }))
    }
  }, [auth?.user, customers])

  const loadAssets = useCallback(async (customerId: string) => {
    if (!customerId) return
    setLoading(true)
    setError(null)
    try {
      const [assetsRes, maintenanceRes] = await Promise.all([
        fetch(`/api/assets?customer_id=${customerId}`),
        fetch(`/api/maintenance/generate?customer_id=${customerId}`),
      ])
      if (!assetsRes.ok) throw new Error('Failed to fetch assets')
      const assetsData = await assetsRes.json()
      setAssets(assetsData.assets || [])
      if (maintenanceRes.ok) {
        const maintData = await maintenanceRes.json()
        setMaintenanceSummary(maintData.summary || null)
      }
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedCustomerId) loadAssets(selectedCustomerId)
  }, [selectedCustomerId, loadAssets])

  const handleGenerateOrders = useCallback(async () => {
    if (!selectedCustomerId) return
    setIsGenerating(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const res = await fetch('/api/maintenance/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: selectedCustomerId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate orders')
      setSuccessMsg(data.message)
      await loadAssets(selectedCustomerId)
    } catch (err) {
      setError(String(err))
    } finally {
      setIsGenerating(false)
    }
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
        throw new Error(data.details || data.error || 'Failed to create asset')
      }
      setIsCreateOpen(false)
      setCreateForm({ ...EMPTY_FORM, customer_id: selectedCustomerId })
      await loadAssets(selectedCustomerId)
    } catch (err) {
      setError(String(err))
    } finally {
      setIsSaving(false)
    }
  }, [createForm, selectedCustomerId, loadAssets])

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
        throw new Error(data.details || data.error || 'Failed to update asset')
      }
      setIsEditOpen(false)
      setEditingAsset(null)
      await loadAssets(selectedCustomerId)
    } catch (err) {
      setError(String(err))
    } finally {
      setIsSaving(false)
    }
  }, [editingAsset, editForm, selectedCustomerId, loadAssets])

  const handleDeleteAsset = useCallback(async (assetId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este activo?')) return
    setIsDeleting(assetId)
    try {
      const res = await fetch(`/api/assets/${assetId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete asset')
      await loadAssets(selectedCustomerId)
    } catch (err) {
      setError(String(err))
    } finally {
      setIsDeleting(null)
    }
  }, [selectedCustomerId, loadAssets])

  const canSelectCustomer = auth?.user?.role === 'admin' || auth?.user?.role === 'supervisor'
  const overdueAssets = assets.filter(a => a.has_maintenance_plan && getMaintenanceStatus(a as any, 7) === 'vencido')
  const upcomingAssets = assets.filter(a => a.has_maintenance_plan && getMaintenanceStatus(a as any, 7) === 'proximo')

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{"Gestión de Activos"}</h1>
          <p className="text-slate-500 mt-1">Equipos y máquinas bajo mantenimiento</p>
        </div>

        {/* Customer selector */}
        {canSelectCustomer && (
          <div className="bg-white rounded-lg border p-4">
            <Label className="block mb-2 font-medium text-slate-700">Seleccionar Cliente</Label>
            <Select value={selectedCustomerId} onValueChange={(v) => {
              setSelectedCustomerId(v)
              setCreateForm(prev => ({ ...prev, customer_id: v }))
            }}>
              <SelectTrigger className="w-full max-w-sm">
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

        {/* Maintenance summary cards */}
        {maintenanceSummary && maintenanceSummary.total > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">{maintenanceSummary.overdue}</p>
                <p className="text-sm text-red-600">Vencidos</p>
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <CalendarClock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-700">{maintenanceSummary.upcoming}</p>
                <p className="text-sm text-orange-600">{"Próximos (≤7 días)"}</p>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{maintenanceSummary.up_to_date}</p>
                <p className="text-sm text-green-600">Al dia</p>
              </div>
            </div>
          </div>
        )}

        {/* Alert banner for overdue/upcoming */}
        {(overdueAssets.length > 0 || upcomingAssets.length > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-900">
                    {overdueAssets.length > 0
                      ? `${overdueAssets.length} activo(s) con mantenimiento vencido`
                      : `${upcomingAssets.length} activo(s) con mantenimiento en los proximos 7 dias`}
                  </p>
                  <p className="text-sm text-amber-700 mt-0.5">
                    {[...overdueAssets, ...upcomingAssets].slice(0, 3).map(a => a.name).join(', ')}
                    {overdueAssets.length + upcomingAssets.length > 3 ? ` y ${overdueAssets.length + upcomingAssets.length - 3} mas...` : ''}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleGenerateOrders}
                disabled={isGenerating}
                className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
              >
                {isGenerating
                  ? <Loader className="w-4 h-4 mr-1 animate-spin" />
                  : <Wrench className="w-4 h-4 mr-1" />}
                Generar Ordenes
              </Button>
            </div>
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">{successMsg}</p>
            <button onClick={() => setSuccessMsg(null)} className="ml-auto text-green-600 hover:text-green-700">x</button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-700">x</button>
          </div>
        )}

        {/* Actions bar */}
        <div className="flex items-center justify-between">
          <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Activo
          </Button>
          {assets.length > 0 && (
            <p className="text-sm text-slate-500">{assets.length} activo(s)</p>
          )}
        </div>

        {/* Assets table */}
        <div className="bg-white rounded-lg border overflow-hidden">
          {loading ? (
            <div className="p-10 text-center">
              <Loader className="w-6 h-6 mx-auto animate-spin text-blue-600 mb-2" />
              <p className="text-slate-400">Cargando activos...</p>
            </div>
          ) : assets.length === 0 ? (
            <div className="p-10 text-center text-slate-400">No hay activos registrados para este cliente</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Nombre / ID</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Marca / Modelo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Criticidad</TableHead>
                  <TableHead>Mantenimiento</TableHead>
                  <TableHead>{"Próxima Fecha"}</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map(asset => (
                  <TableRow key={asset.id} className="hover:bg-slate-50">
                    <TableCell>
                      <p className="font-medium text-slate-900">{asset.name}</p>
                      <p className="text-xs text-slate-400">{asset.asset_id}</p>
                    </TableCell>
                    <TableCell className="capitalize text-sm">{asset.type}</TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {asset.brand || asset.model ? `${asset.brand || ''} ${asset.model || ''}`.trim() : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          asset.status === 'activo' ? 'bg-green-50 text-green-700 border-green-200' :
                          asset.status === 'en_reparacion' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }
                      >
                        {asset.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          asset.criticality === 'critico' ? 'bg-red-50 text-red-700 border-red-200' :
                          asset.criticality === 'alto' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          asset.criticality === 'medio' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-slate-50 text-slate-600 border-slate-200'
                        }
                      >
                        {asset.criticality}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <MaintenanceBadge asset={asset} />
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {asset.has_maintenance_plan
                        ? formatMaintenanceDate(asset.next_maintenance_date || null)
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(asset)} title="Editar">
                          <Pencil className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAsset(asset.id)}
                          disabled={isDeleting === asset.id}
                          title="Eliminar"
                        >
                          {isDeleting === asset.id
                            ? <Loader className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4 text-red-500" />}
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
            <div className="flex gap-3 mt-4 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreateAsset} disabled={isSaving} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {isSaving && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                Crear Activo
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar — {editingAsset?.name}</DialogTitle>
            </DialogHeader>
            <AssetForm form={editForm} setForm={setEditForm} />
            <div className="flex gap-3 mt-4 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => { setIsEditOpen(false); setEditingAsset(null) }}>Cancelar</Button>
              <Button onClick={handleEditAsset} disabled={isSaving} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {isSaving && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                Guardar Cambios
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
        </main>
      </div>
    </div>
  )
}
