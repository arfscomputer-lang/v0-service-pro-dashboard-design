'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { SidebarNav } from '@/components/dashboard/sidebar-nav'
import { TopHeader } from '@/components/dashboard/top-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft, Save, Trash2, Loader2, Plus, DollarSign,
  Paperclip, FileText, Eye, Camera, History, Wrench,
  Package, Upload, User, Phone, Mail, MapPin, Calendar,
  Clock, ChevronRight,
} from 'lucide-react'
import { useWorkOrders, type WorkOrder } from '@/lib/context/work-orders-context'
import { useAuth } from '@/lib/context/auth-context'
import { authenticatedFetch } from '@/lib/authenticated-fetch'
import { cn } from '@/lib/utils'

// ── Types ────────────────────────────────────────────────────────
interface Expense {
  id: string
  category: string
  description: string
  amount: number
  created_by: string
  created_at: string
  has_receipt: boolean
  receipt_name?: string
  receipt_type?: string
}

interface Technician {
  id: string
  name: string
  role?: string
  phone?: string
}

interface Customer {
  id: string
  name: string
  phone?: string
  email?: string
  created_at?: string
}

type Tab = 'detalles' | 'refacciones' | 'historial' | 'fotos'
type PhotoFilter = 'todas' | 'antes' | 'despues'

// ── Constants ────────────────────────────────────────────────────
const CATEGORY_LABEL: Record<string, string> = {
  mano_de_obra: 'Mano de obra',
  repuestos:    'Repuestos',
  traslado:     'Traslado',
  terceros:     'Servicios terceros',
  otros:        'Otros',
}

const EMPTY_EXPENSE = {
  category: 'repuestos', description: '', amount: '',
  receipt_data: '', receipt_name: '', receipt_type: '',
}

const STATUS_LABEL: Record<string, string> = {
  pendiente: 'Pendiente', asignada: 'Asignada', en_ruta: 'En Ruta',
  en_sitio: 'En Sitio', completada: 'Completada', cancelada: 'Cancelada',
}

const STATUS_COLOR: Record<string, string> = {
  pendiente:  'bg-yellow-100 text-yellow-800',
  asignada:   'bg-orange-100 text-orange-800',
  en_ruta:    'bg-blue-100 text-blue-800',
  en_sitio:   'bg-purple-100 text-purple-800',
  completada: 'bg-green-100 text-green-800',
  cancelada:  'bg-red-100 text-red-800',
}

const PRIORITY_COLOR: Record<string, string> = {
  baja:    'bg-gray-100 text-gray-700',
  normal:  'bg-blue-100 text-blue-700',
  alta:    'bg-orange-100 text-orange-700',
  urgente: 'bg-red-100 text-red-700',
}

// ── Component ────────────────────────────────────────────────────
export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const { workOrders, updateWorkOrder, deleteWorkOrder } = useWorkOrders()
  const { user } = useAuth()
  const canManageExpenses = user?.role === 'admin' || user?.role === 'supervisor'

  // Core state
  const [order, setOrder] = useState<WorkOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState<Partial<WorkOrder>>({})
  const [activeTab, setActiveTab] = useState<Tab>('detalles')

  // Sidebar data
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [customer, setCustomer] = useState<Customer | null>(null)

  // Expenses state
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [expensesTotal, setExpensesTotal] = useState(0)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [expenseForm, setExpenseForm] = useState(EMPTY_EXPENSE)
  const [savingExpense, setSavingExpense] = useState(false)

  // Photos state
  const [photos, setPhotos] = useState<{ before: string[]; after: string[] }>({ before: [], after: [] })
  const [photoFilter, setPhotoFilter] = useState<PhotoFilter>('todas')
  const [loadingPhotos, setLoadingPhotos] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // History state
  const [history, setHistory] = useState<WorkOrder[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  // ── Load order ──────────────────────────────────────────────
  useEffect(() => {
    const found = workOrders.find(wo => wo.id === orderId)
    if (found) { setOrder(found); setEditForm(found) }
    setIsLoading(false)
  }, [orderId, workOrders])

  // ── Load technicians ────────────────────────────────────────
  useEffect(() => {
    fetch('/api/technicians')
      .then(r => r.ok ? r.json() : { data: [] })
      .then(j => setTechnicians(j.data || []))
      .catch(() => {})
  }, [])

  // ── Load customer ───────────────────────────────────────────
  useEffect(() => {
    if (!order?.customerId) return
    fetch(`/api/customers/${order.customerId}`)
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (j) setCustomer(j.data ?? j) })
      .catch(() => {})
  }, [order?.customerId])

  // ── Load expenses ───────────────────────────────────────────
  const loadExpenses = useCallback(async () => {
    if (!canManageExpenses) return
    try {
      const res = await fetch(`/api/work-orders/${orderId}/expenses`)
      if (res.ok) {
        const j = await res.json()
        setExpenses(j.expenses ?? [])
        setExpensesTotal(j.total ?? 0)
      }
    } catch {}
  }, [orderId, canManageExpenses])

  useEffect(() => { loadExpenses() }, [loadExpenses])

  // ── Load photos ─────────────────────────────────────────────
  const loadPhotos = useCallback(async () => {
    setLoadingPhotos(true)
    try {
      const res = await authenticatedFetch(`/api/work-orders/${orderId}/photos`)
      if (res.ok) {
        const j = await res.json()
        setPhotos({ before: j.before ?? [], after: j.after ?? [] })
      }
    } catch {} finally { setLoadingPhotos(false) }
  }, [orderId])

  // ── Load history ────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    if (!order?.customerId) return
    setLoadingHistory(true)
    try {
      const res = await authenticatedFetch(`/api/work-orders?customer_id=${order.customerId}`)
      if (res.ok) {
        const j = await res.json()
        const all: WorkOrder[] = j.data ?? j.workOrders ?? []
        setHistory(all.filter(wo => wo.id !== orderId))
      }
    } catch {} finally { setLoadingHistory(false) }
  }, [orderId, order?.customerId])

  useEffect(() => {
    if (activeTab === 'fotos') loadPhotos()
    if (activeTab === 'historial') loadHistory()
  }, [activeTab])

  // ── Handlers ────────────────────────────────────────────────
  function handleReceiptFile(file: File) {
    const reader = new FileReader()
    reader.onload = e => setExpenseForm(prev => ({
      ...prev,
      receipt_data: e.target?.result as string,
      receipt_name: file.name,
      receipt_type: file.type,
    }))
    reader.readAsDataURL(file)
  }

  async function handleAddExpense() {
    if (!expenseForm.description.trim() || !expenseForm.amount) return
    setSavingExpense(true)
    try {
      const res = await fetch(`/api/work-orders/${orderId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: expenseForm.category,
          description: expenseForm.description,
          amount: parseFloat(expenseForm.amount as string),
          created_by: user?.name ?? '',
          receipt_data: expenseForm.receipt_data || null,
          receipt_name: expenseForm.receipt_name || null,
          receipt_type: expenseForm.receipt_type || null,
        }),
      })
      if (!res.ok) throw new Error('Error al guardar')
      setExpenseForm(EMPTY_EXPENSE)
      setShowExpenseForm(false)
      await loadExpenses()
    } catch (e: any) { alert(e.message) }
    finally { setSavingExpense(false) }
  }

  async function handleDeleteExpense(expenseId: string) {
    if (!confirm('¿Eliminar este gasto?')) return
    await fetch(`/api/work-orders/${orderId}/expenses?expense_id=${expenseId}`, { method: 'DELETE' })
    await loadExpenses()
  }

  async function handleSave() {
    if (!order) return
    setIsSaving(true)
    try {
      const data = { ...editForm }
      if (data.scheduledDate) data.scheduledDate = new Date(data.scheduledDate).toISOString().split('T')[0]
      await updateWorkOrder(order.id, data)
      setIsEditing(false)
      setOrder({ ...order, ...data })
    } catch { alert('Error al guardar la orden') }
    finally { setIsSaving(false) }
  }

  async function handleDelete() {
    if (!order || !confirm('¿Eliminar esta orden?')) return
    await deleteWorkOrder(order.id)
    router.push('/ordenes')
  }

  async function handlePhotoUpload(file: File, type: 'before' | 'after') {
    setUploadingPhoto(true)
    try {
      const reader = new FileReader()
      reader.onload = async e => {
        const data = e.target?.result as string
        await authenticatedFetch(`/api/work-orders/${orderId}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photo_type: type, data }),
        })
        await loadPhotos()
        setUploadingPhoto(false)
      }
      reader.readAsDataURL(file)
    } catch { setUploadingPhoto(false) }
  }

  // ── Loading / not found ──────────────────────────────────────
  if (isLoading) return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    </div>
  )

  if (!order) return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 p-8">
          <Card>
            <CardContent className="pt-6 text-center space-y-3">
              <p className="font-semibold">Orden no encontrada</p>
              <Link href="/ordenes"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Volver</Button></Link>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )

  const assignedTech = technicians.find(t => t.id === order.technicianId)
  const refacciones = expenses.filter(e => ['repuestos', 'terceros'].includes(e.category))
  const manoDeObra  = expenses.filter(e => e.category === 'mano_de_obra')
  const otrosGastos = expenses.filter(e => !['repuestos', 'terceros', 'mano_de_obra'].includes(e.category))

  const allPhotos = [
    ...photos.before.map(d => ({ data: d, type: 'antes' as const })),
    ...photos.after.map(d => ({ data: d, type: 'despues' as const })),
  ]
  const filteredPhotos = photoFilter === 'todas' ? allPhotos : allPhotos.filter(p => p.type === photoFilter)

  const completedHistory = history.filter(h => h.status === 'completada')
  const firstVisit = history.length > 0
    ? history.reduce((a, b) => (a.scheduledDate < b.scheduledDate ? a : b)).scheduledDate
    : null

  // ── Right sidebar ────────────────────────────────────────────
  const Sidebar = () => (
    <div className="space-y-4">
      {/* Customer */}
      <Card className="border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {customer ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {customer.name?.[0]?.toUpperCase() ?? 'C'}
                </div>
                <span className="font-medium text-sm">{customer.name}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />{customer.phone}
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />{customer.email}
                </div>
              )}
              {customer.created_at && (
                <p className="text-xs text-muted-foreground">
                  Cliente desde {new Date(customer.created_at).getFullYear()}
                </p>
              )}
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              {order.customerId ? 'Cargando...' : 'Sin cliente asignado'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Technician */}
      <Card className="border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Técnico Asignado</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Select value={editForm.technicianId || 'none'} onValueChange={v => setEditForm({ ...editForm, technicianId: v === 'none' ? null : v })}>
              <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin asignar</SelectItem>
                {technicians.map(t => <SelectItem key={t.id} value={t.id}>{t.name}{t.role ? ` — ${t.role}` : ''}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : assignedTech ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                {assignedTech.name[0]}
              </div>
              <div>
                <p className="text-sm font-medium">{assignedTech.name}</p>
                {assignedTech.role && <p className="text-xs text-muted-foreground">{assignedTech.role}</p>}
                {assignedTech.phone && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Phone className="h-3 w-3" />{assignedTech.phone}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin asignar</p>
          )}
        </CardContent>
      </Card>

      {/* Location */}
      {order.address && (
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ubicación del Sitio</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-start gap-1.5">
              <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
              <span>{order.address}{order.city ? `, ${order.city}` : ''}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dates */}
      <Card className="border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Fechas</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div><p className="text-muted-foreground">Creada</p><p className="font-medium">{new Date(order.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</p></div>
          {order.scheduledDate && <div><p className="text-muted-foreground">Programada</p><p className="font-medium">{new Date(order.scheduledDate).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })} {order.scheduledTime && `— ${order.scheduledTime}`}</p></div>}
          {order.updatedAt && <div><p className="text-muted-foreground">Actualizada</p><p className="font-medium">{new Date(order.updatedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</p></div>}
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto">
          {/* ── Header ── */}
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <Link href="/ordenes">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg font-bold text-foreground">{order.orderId}</h1>
                    <Badge className={cn('text-xs', STATUS_COLOR[order.status])}>{STATUS_LABEL[order.status] ?? order.status}</Badge>
                    <Badge className={cn('text-xs', PRIORITY_COLOR[order.priority])}>{order.priority}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Creada el {new Date(order.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })} a las {new Date(order.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setEditForm(order) }} disabled={isSaving}>Cancelar</Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5">
                      {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}Guardar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Editar</Button>
                    <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-1.5">
                      <Trash2 className="h-3.5 w-3.5" /><span className="hidden sm:inline">Eliminar</span>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-4">
              {([
                { key: 'detalles',    label: 'Detalles',               icon: FileText },
                { key: 'refacciones', label: 'Refacciones y Mano de Obra', icon: Package },
                { key: 'historial',   label: 'Historial del Sitio',    icon: History },
                { key: 'fotos',       label: 'Fotos',                  icon: Camera },
              ] as const).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-none border-b-2 transition-colors',
                    activeTab === key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />{label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Content ── */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Left content area */}
              <div className="lg:col-span-2 space-y-4">

                {/* ══ Tab: Detalles ══ */}
                {activeTab === 'detalles' && (
                  <>
                    <Card className="border border-border">
                      <CardHeader><CardTitle className="text-base">Información de la Orden</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Tipo de Servicio</Label>
                            {isEditing
                              ? <Input value={editForm.type || ''} onChange={e => setEditForm({ ...editForm, type: e.target.value })} className="mt-1 text-sm" />
                              : <p className="mt-1 text-sm font-medium">{order.type || '—'}</p>}
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Categoría</Label>
                            {isEditing
                              ? (
                                <Select value={editForm.category || 'Otros'} onValueChange={v => setEditForm({ ...editForm, category: v })}>
                                  <SelectTrigger className="mt-1 text-sm"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {['Reactivo','Preventivo','Predictivo','Instalación / Puesta en Marcha','Inspección / Auditoría','Proyecto / Mejora','Garantía','Otros'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              )
                              : <p className="mt-1 text-sm font-medium">{order.category || '—'}</p>}
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Fecha Programada</Label>
                            {isEditing
                              ? <Input type="date" value={editForm.scheduledDate || ''} onChange={e => setEditForm({ ...editForm, scheduledDate: e.target.value })} className="mt-1 text-sm" />
                              : <p className="mt-1 text-sm font-medium">{order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString('es-MX') : '—'}</p>}
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Horario</Label>
                            {isEditing
                              ? <Input type="time" value={editForm.scheduledTime || ''} onChange={e => setEditForm({ ...editForm, scheduledTime: e.target.value })} className="mt-1 text-sm" />
                              : <p className="mt-1 text-sm font-medium">{order.scheduledTime || '—'}</p>}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Estado</Label>
                          {isEditing
                            ? (
                              <Select value={editForm.status || 'pendiente'} onValueChange={v => setEditForm({ ...editForm, status: v as WorkOrder['status'] })}>
                                <SelectTrigger className="mt-1 text-sm"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {Object.entries(STATUS_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            )
                            : <div className="mt-1"><Badge className={cn('text-xs', STATUS_COLOR[order.status])}>{STATUS_LABEL[order.status]}</Badge></div>}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-border">
                      <CardHeader><CardTitle className="text-base">Descripción del Problema</CardTitle></CardHeader>
                      <CardContent>
                        {isEditing
                          ? <Textarea value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={4} className="text-sm" />
                          : <p className="text-sm text-foreground whitespace-pre-wrap">{order.description || 'Sin descripción'}</p>}
                      </CardContent>
                    </Card>

                    {order.address && (
                      <Card className="border border-border">
                        <CardHeader><CardTitle className="text-base">Ubicación</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Dirección</Label>
                            {isEditing
                              ? <Input value={editForm.address || ''} onChange={e => setEditForm({ ...editForm, address: e.target.value })} className="mt-1 text-sm" />
                              : <p className="mt-1 text-sm font-medium">{order.address}</p>}
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Ciudad</Label>
                            {isEditing
                              ? <Input value={editForm.city || ''} onChange={e => setEditForm({ ...editForm, city: e.target.value })} className="mt-1 text-sm" />
                              : <p className="mt-1 text-sm font-medium">{order.city || '—'}</p>}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Gastos summary for non-managers */}
                    {!canManageExpenses && expenses.length > 0 && (
                      <Card className="border border-border">
                        <CardContent className="pt-4 flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Total gastos del servicio</span>
                          <span className="font-bold">${expensesTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}

                {/* ══ Tab: Refacciones y Mano de Obra ══ */}
                {activeTab === 'refacciones' && (
                  <>
                    {/* Refacciones */}
                    <Card className="border border-border">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4" />Refacciones y Materiales</CardTitle>
                          {canManageExpenses && (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                              onClick={() => { setExpenseForm({ ...EMPTY_EXPENSE, category: 'repuestos' }); setShowExpenseForm(true) }}>
                              <Plus className="h-3 w-3" />Agregar
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {refacciones.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-6">Sin refacciones registradas</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead><tr className="border-b border-border text-muted-foreground">
                                <th className="text-left py-2 font-medium">ARTÍCULO</th>
                                <th className="text-right py-2 font-medium">TOTAL</th>
                                {canManageExpenses && <th className="w-8" />}
                              </tr></thead>
                              <tbody>
                                {refacciones.map(e => (
                                  <tr key={e.id} className="border-b border-border last:border-0">
                                    <td className="py-2.5">
                                      <p className="font-medium text-foreground">{e.description}</p>
                                      <p className="text-muted-foreground">{CATEGORY_LABEL[e.category]}</p>
                                    </td>
                                    <td className="py-2.5 text-right font-semibold">${parseFloat(String(e.amount)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                                    {canManageExpenses && (
                                      <td className="py-2.5">
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteExpense(e.id)}>
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot><tr><td className="pt-3 text-muted-foreground font-medium">SUBTOTAL REFACCIONES</td><td className="pt-3 text-right font-bold">${refacciones.reduce((s, e) => s + parseFloat(String(e.amount)), 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>{canManageExpenses && <td />}</tr></tfoot>
                            </table>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Mano de Obra */}
                    <Card className="border border-border">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2"><Wrench className="h-4 w-4" />Mano de Obra</CardTitle>
                          {canManageExpenses && (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                              onClick={() => { setExpenseForm({ ...EMPTY_EXPENSE, category: 'mano_de_obra' }); setShowExpenseForm(true) }}>
                              <Plus className="h-3 w-3" />Agregar
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {manoDeObra.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-6">Sin mano de obra registrada</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead><tr className="border-b border-border text-muted-foreground">
                                <th className="text-left py-2 font-medium">TÉCNICO</th>
                                <th className="text-left py-2 font-medium">DESCRIPCIÓN</th>
                                <th className="text-right py-2 font-medium">TOTAL</th>
                                {canManageExpenses && <th className="w-8" />}
                              </tr></thead>
                              <tbody>
                                {manoDeObra.map(e => (
                                  <tr key={e.id} className="border-b border-border last:border-0">
                                    <td className="py-2.5 font-medium">{e.created_by || 'Sin asignar'}</td>
                                    <td className="py-2.5 text-muted-foreground">{e.description}</td>
                                    <td className="py-2.5 text-right font-semibold">${parseFloat(String(e.amount)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                                    {canManageExpenses && (
                                      <td className="py-2.5">
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteExpense(e.id)}>
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot><tr><td colSpan={2} className="pt-3 text-muted-foreground font-medium">SUBTOTAL MANO DE OBRA</td><td className="pt-3 text-right font-bold">${manoDeObra.reduce((s, e) => s + parseFloat(String(e.amount)), 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>{canManageExpenses && <td />}</tr></tfoot>
                            </table>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Otros gastos */}
                    {otrosGastos.length > 0 && (
                      <Card className="border border-border">
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4" />Otros Gastos</CardTitle></CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {otrosGastos.map(e => (
                              <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                                <div>
                                  <p className="text-sm font-medium">{e.description}</p>
                                  <p className="text-xs text-muted-foreground">{CATEGORY_LABEL[e.category] ?? e.category}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm">${parseFloat(String(e.amount)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                  {canManageExpenses && <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteExpense(e.id)}><Trash2 className="h-3 w-3" /></Button>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Add expense form */}
                    {canManageExpenses && showExpenseForm && (
                      <Card className="border border-primary/30 bg-primary/5">
                        <CardHeader><CardTitle className="text-sm">Agregar gasto</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Categoría</Label>
                              <Select value={expenseForm.category} onValueChange={v => setExpenseForm({ ...expenseForm, category: v })}>
                                <SelectTrigger className="mt-1 text-xs h-8"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {Object.entries(CATEGORY_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Monto</Label>
                              <Input type="number" min="0" step="0.01" placeholder="0.00" className="mt-1 text-xs h-8" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">Descripción</Label>
                            <Input placeholder="Detalle..." className="mt-1 text-xs h-8" value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} />
                          </div>
                          <div>
                            <Label className="text-xs">Comprobante (opcional)</Label>
                            <label className="mt-1 flex items-center gap-2 cursor-pointer rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:bg-muted/40">
                              <Paperclip className="h-3 w-3" />
                              {expenseForm.receipt_name ? <span className="text-foreground">{expenseForm.receipt_name}</span> : 'Adjuntar PDF o imagen...'}
                              <input type="file" className="sr-only" accept="application/pdf,image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleReceiptFile(f) }} />
                            </label>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setShowExpenseForm(false); setExpenseForm(EMPTY_EXPENSE) }} disabled={savingExpense}>Cancelar</Button>
                            <Button size="sm" className="h-7 text-xs gap-1" onClick={handleAddExpense} disabled={savingExpense || !expenseForm.description.trim() || !expenseForm.amount}>
                              {savingExpense ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}Guardar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Total */}
                    {expenses.length > 0 && (
                      <Card className="border border-border bg-muted/30">
                        <CardContent className="pt-4 flex items-center justify-between">
                          <span className="font-semibold">TOTAL GENERAL</span>
                          <span className="text-lg font-bold">${expensesTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                        </CardContent>
                      </Card>
                    )}

                    {canManageExpenses && !showExpenseForm && (
                      <Button variant="outline" className="w-full gap-2" onClick={() => setShowExpenseForm(true)}>
                        <Plus className="h-4 w-4" />Agregar gasto
                      </Button>
                    )}
                  </>
                )}

                {/* ══ Tab: Historial del Sitio ══ */}
                {activeTab === 'historial' && (
                  <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Total Visitas', value: history.length + 1 },
                        { label: 'Completadas', value: completedHistory.length + (order.status === 'completada' ? 1 : 0) },
                        { label: 'Primera Visita', value: firstVisit ? new Date(firstVisit).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }) : new Date(order.scheduledDate || order.createdAt).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }) },
                        { label: 'Órdenes del Cliente', value: history.length + 1 },
                      ].map(s => (
                        <Card key={s.label} className="border border-border">
                          <CardContent className="pt-4">
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                            <p className="text-xl font-bold mt-1">{s.value}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card className="border border-border">
                      <CardHeader><CardTitle className="text-base flex items-center gap-2"><History className="h-4 w-4" />Historial de Visitas al Sitio</CardTitle></CardHeader>
                      <CardContent>
                        {loadingHistory ? (
                          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                        ) : history.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-6">No hay otras órdenes para este cliente</p>
                        ) : (
                          <div className="space-y-3">
                            {[...history].sort((a, b) => new Date(b.scheduledDate || b.createdAt).getTime() - new Date(a.scheduledDate || a.createdAt).getTime()).map(h => (
                              <Link key={h.id} href={`/ordenes/${h.id}`} className="block">
                                <div className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors">
                                  <div className="flex items-start gap-3">
                                    <div className={cn('w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5', h.status === 'completada' ? 'bg-green-100 text-green-700' : h.status === 'cancelada' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700')}>
                                      <div className="w-2 h-2 rounded-full bg-current" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-primary">{h.orderId}</p>
                                      <p className="text-sm font-medium mt-0.5">{h.type || h.description?.slice(0, 60)}</p>
                                      <p className="text-xs text-muted-foreground mt-0.5">{h.description?.slice(0, 80)}</p>
                                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                        {h.scheduledDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(h.scheduledDate).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
                                        <Badge className={cn('text-[10px] px-1.5 py-0 h-4', STATUS_COLOR[h.status])}>{STATUS_LABEL[h.status] ?? h.status}</Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* ══ Tab: Fotos ══ */}
                {activeTab === 'fotos' && (
                  <>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex gap-1">
                        {(['todas', 'antes', 'despues'] as const).map(f => (
                          <button key={f} onClick={() => setPhotoFilter(f)}
                            className={cn('px-3 py-1 rounded-full text-xs font-medium transition-colors',
                              photoFilter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                            {f === 'todas' ? `Todas (${allPhotos.length})` : f === 'antes' ? `Antes (${photos.before.length})` : `Después (${photos.after.length})`}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <label className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 transition-colors', uploadingPhoto && 'opacity-50 pointer-events-none')}>
                          {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          Subir Foto
                          <input type="file" className="sr-only" accept="image/*" disabled={uploadingPhoto}
                            onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f, 'after') }} />
                        </label>
                      </div>
                    </div>

                    {loadingPhotos ? (
                      <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                    ) : filteredPhotos.length === 0 ? (
                      <Card className="border border-dashed">
                        <CardContent className="py-12 text-center">
                          <Camera className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">Sin fotos {photoFilter !== 'todas' ? `de tipo "${photoFilter}"` : ''}registradas</p>
                          <p className="text-xs text-muted-foreground mt-1">Usá "Subir Foto" para agregar evidencia</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {filteredPhotos.map((p, i) => (
                          <div key={i} className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                            <img src={p.data} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute top-1.5 left-1.5">
                              <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', p.type === 'antes' ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white')}>
                                {p.type === 'antes' ? 'Antes' : 'Después'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload before photo */}
                    <div className="flex gap-2 pt-2">
                      <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:bg-muted/40 cursor-pointer transition-colors">
                        <Upload className="h-4 w-4" />Subir foto ANTES
                        <input type="file" className="sr-only" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f, 'before') }} />
                      </label>
                      <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:bg-muted/40 cursor-pointer transition-colors">
                        <Upload className="h-4 w-4" />Subir foto DESPUÉS
                        <input type="file" className="sr-only" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f, 'after') }} />
                      </label>
                    </div>
                  </>
                )}
              </div>

              {/* Right sidebar */}
              <div className="hidden lg:block">
                <Sidebar />
              </div>
            </div>

            {/* Mobile sidebar */}
            <div className="lg:hidden mt-6 max-w-6xl mx-auto">
              <Sidebar />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
