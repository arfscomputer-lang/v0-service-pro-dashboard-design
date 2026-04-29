"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { TopHeader } from "@/components/dashboard/top-header"
import { NewOrderDialog } from "@/components/work-orders/new-order-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  ChevronRight,
  Clock,
  MapPin,
  Edit2,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useWorkOrders, type WorkOrder } from "@/lib/context/work-orders-context"
import { authenticatedFetch } from "@/lib/authenticated-fetch"

interface Technician {
  id: string
  name: string
  role?: string
  email?: string
  phone?: string
  status?: string
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pendiente: { label: "Pendiente", className: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
  asignada: { label: "Asignada", className: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
  en_ruta: { label: "En Ruta", className: "bg-violet-500/10 text-violet-700 border-violet-500/20" },
  en_sitio: { label: "En Sitio", className: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20" },
  en_proceso: { label: "En Proceso", className: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20" },
  completada: { label: "Completada", className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
  cancelada: { label: "Cancelada", className: "bg-destructive/10 text-destructive border-destructive/20" },
}

const priorityConfig: Record<string, { label: string; dot: string; badge: string }> = {
  baja:    { label: "Baja",    dot: "bg-muted-foreground/40", badge: "bg-muted text-muted-foreground" },
  normal:  { label: "Normal",  dot: "bg-blue-500",            badge: "bg-blue-50 text-blue-700 border-blue-200" },
  alta:    { label: "Alta",    dot: "bg-amber-500",           badge: "bg-amber-50 text-amber-700 border-amber-200" },
  urgente: { label: "Urgente", dot: "bg-destructive",         badge: "bg-destructive/10 text-destructive border-destructive/20" },
}

export default function OrdenesPage() {
  const { workOrders, updateWorkOrder, deleteWorkOrder } = useWorkOrders()
  const [searchTerm, setSearchTerm] = useState("")
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loadingTechnicians, setLoadingTechnicians] = useState(true)
  const [assets, setAssets] = useState<any[]>([])
  const [loadingAssets, setLoadingAssets] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null)
  const [editForm, setEditForm] = useState<Partial<WorkOrder>>({})

  // Cargar técnicos desde la API
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        setLoadingTechnicians(true)
        const response = await authenticatedFetch('/api/technicians')
        if (!response.ok) throw new Error('Failed to fetch technicians')
        const json = await response.json()
        setTechnicians(json.data || [])
        console.log('[v0] Loaded technicians from database:', json.data?.length)
      } catch (error) {
        console.error('[v0] Error loading technicians:', error)
        setTechnicians([])
      } finally {
        setLoadingTechnicians(false)
      }
    }

    fetchTechnicians()
  }, [])

  // Load assets with maintenance plans
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoadingAssets(true)
        const res = await fetch('/api/maintenance/plans')
        const data = await res.json()
        if (data.plans) {
          setAssets(data.plans)
        }
      } catch (error) {
        console.error('Error loading assets:', error)
        setAssets([])
      } finally {
        setLoadingAssets(false)
      }
    }
    fetchAssets()
  }, [])

  const filteredOrders = workOrders.filter(
    (order) =>
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEditOpen = useCallback((order: WorkOrder) => {
    setEditingOrder(order)
    setEditForm(order)
  }, [])

  const handleSaveEdit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!editingOrder) return
      try {
        // Format date to ensure it's in YYYY-MM-DD format
        const formattedData = { ...editForm }
        if (formattedData.scheduledDate) {
          // If it's a Date object or string, convert to ISO date format
          const dateObj = new Date(formattedData.scheduledDate)
          formattedData.scheduledDate = dateObj.toISOString().split('T')[0]
        }
        await updateWorkOrder(editingOrder.id, formattedData)
        setEditingOrder(null)
        setEditForm({})
      } catch (error) {
        console.error("[v0] Error saving work order:", error)
      }
    },
    [editingOrder, editForm, updateWorkOrder]
  )

  const handleDelete = useCallback(
    async (orderId: string) => {
      if (!confirm("¿Estás seguro de que deseas eliminar esta orden?")) return
      try {
        await deleteWorkOrder(orderId)
      } catch (error) {
        console.error("[v0] Error deleting work order:", error)
      }
    },
    [deleteWorkOrder]
  )

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />

        <main className="flex flex-1 flex-col overflow-hidden p-4 gap-4 bg-content">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Órdenes de Trabajo</h1>
                <p className="text-sm text-muted-foreground">{workOrders.length} órdenes · {workOrders.filter(o => o.status === 'pendiente').length} pendientes</p>
              </div>
            </div>
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Orden
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar orden..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtrar
            </Button>
          </div>

          {/* Orders Table */}
          <ScrollArea className="flex-1 rounded-lg border bg-card">
            <div className="divide-y">
              {filteredOrders.map((order) => {
                const st = statusConfig[order.status] || statusConfig.pendiente
                const pr = priorityConfig[order.priority] || priorityConfig.normal
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 flex items-center gap-4 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{order.orderId}</span>
                          <Badge variant="outline" className={cn("text-xs", st.className)}>
                            {st.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{order.type}</p>
                        <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{order.address}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{order.scheduledDate} {order.scheduledTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5 hidden sm:flex", pr.badge)}>
                        {pr.label}
                      </Badge>
                      <Link href={`/orden/${order.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleEditOpen(order)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(order.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
              {filteredOrders.length === 0 && (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <div className="p-3 rounded-full bg-muted">
                    <ClipboardList className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {searchTerm ? "Sin resultados para tu búsqueda" : "No hay órdenes disponibles"}
                  </p>
                  {!searchTerm && (
                    <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" /> Crear primera orden
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingOrder} onOpenChange={(open) => !open && setEditingOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Orden de Trabajo</DialogTitle>
            <DialogDescription>Modifica los detalles de la orden</DialogDescription>
          </DialogHeader>
          {editingOrder && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <Label htmlFor="orderId">Número de Orden</Label>
                <Input
                  id="orderId"
                  value={editForm.orderId || ""}
                  onChange={(e) => setEditForm({ ...editForm, orderId: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo de Servicio</Label>
                <Input
                  id="type"
                  value={editForm.type || ""}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={editForm.description || ""}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assetId">Activo / Equipo</Label>
                  <Select 
                    value={editForm.assetId || "none"}
                    onValueChange={(v) => setEditForm({ 
                      ...editForm, 
                      assetId: v === "none" ? null : v,
                      scheduledDate: assets.find(a => a.id === v)?.next_maintenance_date || editForm.scheduledDate
                    })}
                  >
                    <SelectTrigger id="assetId">
                      <SelectValue placeholder="Seleccionar activo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin asignar</SelectItem>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name} ({asset.asset_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {editForm.assetId && (
                    <p className="text-xs text-gray-500 mt-1">
                      Próximo mantenimiento: {assets.find(a => a.id === editForm.assetId)?.next_maintenance_date || 'N/A'}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5" />
              </div>
              <div>
                <Label htmlFor="edit-category">Categoría de Trabajo</Label>
                <Select 
                  value={editForm.category || 'otros'} 
                  onValueChange={(v) => setEditForm({ ...editForm, category: v as any })}
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reactivo">Reactivo / Correctivo</SelectItem>
                    <SelectItem value="preventivo">Preventivo</SelectItem>
                    <SelectItem value="predictivo">Predictivo</SelectItem>
                    <SelectItem value="instalacion">Instalación / Puesta en Marcha</SelectItem>
                    <SelectItem value="inspeccion">Inspección / Auditoría</SelectItem>
                    <SelectItem value="proyecto">Proyecto / Mejora</SelectItem>
                    <SelectItem value="garantia">Garantía</SelectItem>
                    <SelectItem value="otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select value={editForm.status || ""} onValueChange={(v) => setEditForm({ ...editForm, status: v as any })}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select value={editForm.priority || ""} onValueChange={(v) => setEditForm({ ...editForm, priority: v as any })}>
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityConfig).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={editForm.address || ""}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduledDate">Fecha</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={editForm.scheduledDate || ""}
                    onChange={(e) => setEditForm({ ...editForm, scheduledDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="scheduledTime">Hora</Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={editForm.scheduledTime || ""}
                    onChange={(e) => setEditForm({ ...editForm, scheduledTime: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="technicianId">Técnico Asignado</Label>
                <Select 
                  value={editForm.technicianId || "none"} 
                  onValueChange={(v) => setEditForm({ ...editForm, technicianId: v === "none" ? null : v })}
                >
                  <SelectTrigger id="technicianId">
                    <SelectValue placeholder="Seleccionar técnico..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin asignar</SelectItem>
                    {technicians.map((tech) => (
                      <SelectItem key={tech.id} value={tech.id}>
                        {tech.name} {tech.role ? `- ${tech.role}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditingOrder(null)}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar Cambios</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <NewOrderDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}
