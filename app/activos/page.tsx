'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
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
import { Plus, Trash2, AlertCircle, Loader2, Pencil, CalendarClock, Wrench, CheckCircle, AlertTriangle, X, Settings2, QrCode, Printer, MapPin, Navigation } from 'lucide-react'
import { getMaintenanceStatus, daysUntilMaintenance, formatMaintenanceDate } from '@/lib/maintenance'
import QRCode from 'react-qr-code'
import { cn } from '@/lib/utils'

interface LastService {
  last_technician_name?: string | null
  last_service_type?: string | null
  last_service_description?: string | null
  last_technician_notes?: string | null
  last_service_date?: string | null
}

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
  department?: string
  lat?: number
  lng?: number
  capacity?: string
  recurrence_type?: string
  interval_months?: number
  next_maintenance_date?: string | null
  last_maintenance_date?: string | null
  created_at?: string
  lastService?: LastService | null
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
  department: '',
  lat: 0,
  lng: 0,
  capacity: '',
  description: '',
  has_maintenance_plan: false,
  recurrence_type: 'mensual',
  interval_months: 1,
}

// ── Asset Form ────────────────────────────────────────────────
function AssetForm({ form, setForm }: { form: typeof EMPTY_FORM; setForm: (f: typeof EMPTY_FORM) => void }) {
  const [capturingGeo, setCapturingGeo] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  function captureGeo() {
    if (!navigator.geolocation) {
      setGeoError('Geolocalización no disponible en este dispositivo.')
      return
    }
    setCapturingGeo(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm({ ...form, lat: pos.coords.latitude, lng: pos.coords.longitude })
        setCapturingGeo(false)
      },
      () => {
        setGeoError('No se pudo obtener la ubicación. Verificá los permisos.')
        setCapturingGeo(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

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
        <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detalles del equipo..." rows={2} />
      </div>

      {/* Department + Location */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Área / Departamento</Label>
          <Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="Producción, HVAC, Planta B..." />
        </div>
        <div>
          <Label>{"Ubicación física"}</Label>
          <Input value={form.site_location} onChange={e => setForm({ ...form, site_location: e.target.value })} placeholder="Sala de máquinas, Piso 2..." />
        </div>
      </div>

      {/* Geolocation */}
      <div className="space-y-1.5">
        <Label>{"Geolocalización GPS"}</Label>
        {form.lat && form.lng ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
            <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="text-sm text-emerald-700 font-medium flex-1">
              {form.lat.toFixed(6)}, {form.lng.toFixed(6)}
            </span>
            <button type="button" onClick={() => setForm({ ...form, lat: 0, lng: 0 })} className="text-muted-foreground hover:text-destructive transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={captureGeo}
            disabled={capturingGeo}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
          >
            {capturingGeo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
            {capturingGeo ? 'Capturando ubicación...' : 'Capturar ubicación GPS'}
          </button>
        )}
        {geoError && <p className="text-xs text-destructive">{geoError}</p>}
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
        <input type="checkbox" id="has_plan" checked={form.has_maintenance_plan} onChange={e => setForm({ ...form, has_maintenance_plan: e.target.checked })} className="w-4 h-4 accent-primary" />
        <Label htmlFor="has_plan" className="cursor-pointer font-medium">Tiene Plan de Mantenimiento</Label>
      </div>
      {form.has_maintenance_plan && (
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <Label>Recurrencia</Label>
          <Select value={form.recurrence_type} onValueChange={v => setForm({ ...form, recurrence_type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mensual">Mensual (cada 1 mes)</SelectItem>
              <SelectItem value="trimestral">Trimestral (cada 3 meses)</SelectItem>
              <SelectItem value="semestral">Semestral (cada 6 meses)</SelectItem>
              <SelectItem value="anual">Anual (cada 12 meses)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">El intervalo se calcula automáticamente según la recurrencia</p>
        </div>
      )}
    </div>
  )
}

// ── Maintenance Badge ─────────────────────────────────────────
function MaintenanceBadge({ asset }: { asset: Asset }) {
  if (!asset.has_maintenance_plan) return null
  const assetInfo = { ...asset, created_at: asset.created_at || new Date().toISOString() }
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

// ── QR Sticker Dialog ─────────────────────────────────────────
function QrStickerDialog({ asset, customerName, onClose }: { asset: Asset; customerName: string; onClose: () => void }) {
  const qrRef = useRef<SVGSVGElement>(null)

  const qrData = JSON.stringify({
    id: asset.id,
    asset_id: asset.asset_id,
    name: asset.name,
    serial: asset.serial_number || '',
    brand: asset.brand || '',
    model: asset.model || '',
    type: asset.type,
    department: asset.department || '',
    location: asset.site_location || '',
    criticality: asset.criticality,
    customer: customerName,
  })

  function handlePrint() {
    const svgEl = qrRef.current
    if (!svgEl) return
    const svgStr = new XMLSerializer().serializeToString(svgEl)
    const pw = window.open('', '', 'width=360,height=520')
    if (!pw) return
    pw.document.write(`<!DOCTYPE html><html><head><title>Sticker QR - ${asset.name}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: system-ui, -apple-system, sans-serif; padding: 16px; background: white; }
      .sticker { display: flex; flex-direction: column; align-items: center; gap: 10px; border: 2px dashed #999; border-radius: 8px; padding: 16px; width: 260px; }
      .qr-wrap { background: white; padding: 8px; border: 1px solid #eee; border-radius: 4px; }
      h2 { font-size: 13px; font-weight: 700; text-align: center; }
      .info { width: 100%; }
      .row { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 3px; }
      .key { font-size: 10px; color: #666; }
      .val { font-size: 10px; font-weight: 600; text-align: right; }
      .badge { display: inline-block; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 10px; border: 1px solid; text-transform: uppercase; letter-spacing: 0.5px; }
      .critico { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }
      .alto { background: #ffedd5; color: #9a3412; border-color: #fdba74; }
      .medio { background: #fef3c7; color: #92400e; border-color: #fcd34d; }
      .bajo { background: #f0fdf4; color: #166534; border-color: #86efac; }
      @media print { body { padding: 4px; } }
    </style>
    </head><body><div class="sticker">
      <div class="qr-wrap">${svgStr}</div>
      <h2>${asset.name}</h2>
      <div class="info">
        <div class="row"><span class="key">ID</span><span class="val">${asset.asset_id}</span></div>
        ${asset.serial_number ? `<div class="row"><span class="key">Serie</span><span class="val">${asset.serial_number}</span></div>` : ''}
        ${asset.brand ? `<div class="row"><span class="key">Equipo</span><span class="val">${asset.brand}${asset.model ? ' ' + asset.model : ''}</span></div>` : ''}
        ${asset.department ? `<div class="row"><span class="key">Área</span><span class="val">${asset.department}</span></div>` : ''}
        ${asset.site_location ? `<div class="row"><span class="key">Ubicación</span><span class="val">${asset.site_location}</span></div>` : ''}
        <div class="row"><span class="key">Criticidad</span><span class="val"><span class="badge ${asset.criticality}">${asset.criticality}</span></span></div>
        <div class="row"><span class="key">Cliente</span><span class="val">${customerName}</span></div>
      </div>
    </div>
    <script>window.onload = function() { window.print(); }<\/script>
    </body></html>`)
    pw.document.close()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Sticker QR
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-col items-center gap-3 p-4 border-2 border-dashed border-border rounded-xl w-full bg-white">
            <QRCode ref={qrRef as any} value={qrData} size={160} level="M" />
            <div className="text-center space-y-0.5 w-full">
              <p className="font-bold text-sm leading-tight">{asset.name}</p>
              <p className="text-xs text-muted-foreground">ID: {asset.asset_id}</p>
              {asset.serial_number && <p className="text-xs text-muted-foreground">S/N: {asset.serial_number}</p>}
              {asset.brand && <p className="text-xs text-muted-foreground">{asset.brand} {asset.model}</p>}
              {asset.department && <p className="text-xs font-semibold text-primary">{asset.department}</p>}
              {asset.site_location && <p className="text-xs text-muted-foreground">{asset.site_location}</p>}
            </div>
          </div>
          <p className="text-xs text-center text-muted-foreground px-2">
            {"Escaneá con la sesión del técnico para ver los datos del equipo"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cerrar</Button>
          <Button className="flex-1" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Main Page ─────────────────────────────────────────────────
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
  const [qrAsset, setQrAsset] = useState<Asset | null>(null)
  const [lastService, setLastService] = useState<LastService | null>(null)
  const [loadingLastService, setLoadingLastService] = useState(false)

  const [createForm, setCreateForm] = useState({ ...EMPTY_FORM })
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM })

  const customerName = customers.find(c => c.id === selectedCustomerId)?.name || ''

  useEffect(() => {
    if (auth?.user?.role === 'cliente' && auth.user.customerId) {
      setSelectedCustomerId(auth.user.customerId)
      setCreateForm(prev => ({ ...prev, customer_id: auth.user.customerId! }))
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
    setLastService(null)
    setLoadingLastService(true)
    fetch(`/api/assets/${asset.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.lastService) setLastService(data.lastService) })
      .catch(() => {})
      .finally(() => setLoadingLastService(false))
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
      department: asset.department || '',
      lat: asset.lat || 0,
      lng: asset.lng || 0,
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
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Settings2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">{"Gestión de Activos"}</h1>
                <p className="text-sm text-muted-foreground">Equipos y máquinas bajo mantenimiento</p>
              </div>
            </div>

            {/* Customer selector */}
            {canSelectCustomer && (
              <div className="bg-card rounded-lg border border-border p-4">
                <Label className="block mb-2 font-medium text-foreground">Seleccionar Cliente</Label>
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
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-destructive">{maintenanceSummary.overdue}</p>
                    <p className="text-sm text-destructive/80 font-medium">Vencidos</p>
                  </div>
                </div>
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                    <CalendarClock className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{maintenanceSummary.upcoming}</p>
                    <p className="text-sm text-orange-500/80 font-medium">{"Próximos 7 días"}</p>
                  </div>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">{maintenanceSummary.up_to_date}</p>
                    <p className="text-sm text-emerald-600/80 font-medium">Al día</p>
                  </div>
                </div>
              </div>
            )}

            {/* Alert banner */}
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
                  <Button size="sm" onClick={handleGenerateOrders} disabled={isGenerating} className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
                    {isGenerating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Wrench className="w-4 h-4 mr-1" />}
                    Generar Ordenes
                  </Button>
                </div>
              </div>
            )}

            {successMsg && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800 font-medium">{successMsg}</p>
                <button onClick={() => setSuccessMsg(null)} className="ml-auto text-green-600 hover:text-green-700"><X className="w-4 h-4" /></button>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">{error}</p>
                <button onClick={() => setError(null)} className="ml-auto text-destructive hover:text-destructive/80"><X className="w-4 h-4" /></button>
              </div>
            )}

            {/* Actions bar */}
            <div className="flex items-center justify-between">
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Activo
              </Button>
              {assets.length > 0 && (
                <p className="text-sm text-muted-foreground">{assets.length} activo(s)</p>
              )}
            </div>

            {/* Assets table */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              {loading ? (
                <div className="p-10 text-center">
                  <Loader2 className="w-6 h-6 mx-auto animate-spin text-primary mb-2" />
                  <p className="text-muted-foreground text-sm">Cargando activos...</p>
                </div>
              ) : assets.length === 0 ? (
                <div className="p-12 text-center">
                  <Settings2 className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground text-sm font-medium">No hay activos registrados para este cliente</p>
                  <p className="text-muted-foreground/60 text-xs mt-1">{"Agregá un activo con el botón \"Nuevo Activo\""}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Nombre / ID</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Marca / Modelo</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Criticidad</TableHead>
                      <TableHead>Mantenimiento</TableHead>
                      <TableHead>{"Próxima Fecha"}</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map(asset => (
                      <TableRow key={asset.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <p className="font-medium text-foreground">{asset.name}</p>
                          <p className="text-xs text-muted-foreground">{asset.asset_id}</p>
                        </TableCell>
                        <TableCell className="capitalize text-sm">{asset.type}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {asset.brand || asset.model ? `${asset.brand || ''} ${asset.model || ''}`.trim() : '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {asset.department ? (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 shrink-0" />
                              {asset.department}
                            </span>
                          ) : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            asset.status === 'activo' ? 'bg-green-50 text-green-700 border-green-200' :
                            asset.status === 'en_reparacion' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }>
                            {asset.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            asset.criticality === 'critico' ? 'bg-red-50 text-red-700 border-red-200' :
                            asset.criticality === 'alto' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            asset.criticality === 'medio' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-slate-50 text-slate-600 border-slate-200'
                          }>
                            {asset.criticality}
                          </Badge>
                        </TableCell>
                        <TableCell><MaintenanceBadge asset={asset} /></TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {asset.has_maintenance_plan ? formatMaintenanceDate(asset.next_maintenance_date || null) : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setQrAsset(asset)} title="Ver QR Sticker">
                              <QrCode className="w-4 h-4 text-violet-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(asset)} title="Editar">
                              <Pencil className="w-4 h-4 text-primary" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteAsset(asset.id)} disabled={isDeleting === asset.id} title="Eliminar">
                              {isDeleting === asset.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-red-500" />}
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
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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

                {/* Último servicio */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-4 mb-2">
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Wrench className="h-3.5 w-3.5" /> Último servicio registrado
                  </p>
                  {loadingLastService ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" /> Cargando...
                    </div>
                  ) : lastService ? (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div>
                        <span className="text-muted-foreground">Técnico</span>
                        <p className="font-semibold text-foreground">{lastService.last_technician_name ?? '—'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fecha</span>
                        <p className="font-semibold text-foreground">
                          {lastService.last_service_date
                            ? new Date(lastService.last_service_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—'}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Tarea</span>
                        <p className="font-semibold text-foreground">{lastService.last_service_description ?? lastService.last_service_type ?? '—'}</p>
                      </div>
                      {lastService.last_technician_notes && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Notas del técnico</span>
                          <p className="text-foreground">{lastService.last_technician_notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Sin servicios completados aún</p>
                  )}
                </div>

                <AssetForm form={editForm} setForm={setEditForm} />
                <div className="flex gap-3 mt-4 pt-4 border-t">
                  <Button variant="outline" className="flex-1" onClick={() => { setIsEditOpen(false); setEditingAsset(null) }}>Cancelar</Button>
                  <Button onClick={handleEditAsset} disabled={isSaving} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Guardar Cambios
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* QR Sticker Dialog */}
            {qrAsset && (
              <QrStickerDialog
                asset={qrAsset}
                customerName={customerName}
                onClose={() => setQrAsset(null)}
              />
            )}

          </div>
        </main>
      </div>
    </div>
  )
}
