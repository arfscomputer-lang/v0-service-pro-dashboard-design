"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { TopHeader } from "@/components/dashboard/top-header"
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
  Wrench,
  Edit2,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useWorkOrders, type WorkOrder } from "@/lib/context/work-orders-context"

const statusConfig: Record<string, { label: string; className: string }> = {
  pendiente: { label: "Pendiente", className: "bg-amber-100 text-amber-800 border-amber-200" },
  asignada: { label: "Asignada", className: "bg-blue-100 text-blue-800 border-blue-200" },
  en_ruta: { label: "En Ruta", className: "bg-violet-100 text-violet-800 border-violet-200" },
  en_sitio: { label: "En Sitio", className: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  en_proceso: { label: "En Proceso", className: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  completada: { label: "Completada", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  cancelada: { label: "Cancelada", className: "bg-red-100 text-red-800 border-red-200" },
}

const priorityConfig: Record<string, { label: string; dot: string }> = {
  baja: { label: "Baja", dot: "bg-gray-400" },
  normal: { label: "Normal", dot: "bg-blue-500" },
  alta: { label: "Alta", dot: "bg-amber-500" },
  urgente: { label: "Urgente", dot: "bg-destructive" },
}

export default function OrdenesPage() {
  const { workOrders, addWorkOrder, updateWorkOrder, deleteWorkOrder } = useWorkOrders()
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>>({
    orderId: '',
    type: '',
    description: '',
    status: 'pendiente',
    priority: 'normal',
    address: '',
    city: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '09:00',
    customerId: null,
    technicianId: null,
  })
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null)
  const [editForm, setEditForm] = useState<Partial<WorkOrder>>({})

  const filteredOrders = workOrders.filter(
    (order) =>
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateOpen = useCallback(() => {
    setIsCreateOpen(true)
  }, [])

  const handleCreateClose = useCallback(() => {
    setIsCreateOpen(false)
    setCreateForm({
      orderId: '',
      type: '',
      description: '',
      status: 'pendiente',
      priority: 'normal',
      address: '',
      city: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '09:00',
      customerId: null,
      technicianId: null,
    })
  }, [])

  const handleCreateSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        console.log('[v0] Creating work order with data:', JSON.stringify(createForm))
        await addWorkOrder(createForm)
        console.log('[v0] Work order added to context successfully')
        handleCreateClose()
      } catch (error) {
        console.error('[v0] Error creating work order:', error)
      }
    },
    [createForm, addWorkOrder, handleCreateClose]
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
        await updateWorkOrder(editingOrder.id, editForm)
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
              <h1 className="text-2xl font-bold text-foreground">Órdenes de Trabajo</h1>
            </div>
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
                      <div className={cn("h-2 w-2 rounded-full", pr.dot)} title={pr.label} />
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
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                  No hay órdenes disponibles
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

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva Orden de Trabajo</DialogTitle>
            <DialogDescription>Crea una nueva orden de trabajo en el sistema</DialogDescription>
          </DialogHeader>
          {isCreateOpen && (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <Label htmlFor="orderId">ID Orden</Label>
                <Input
                  id="orderId"
                  value={createForm.orderId}
                  onChange={(e) => setCreateForm({ ...createForm, orderId: e.target.value })}
                  placeholder="OT-1001"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo de Servicio</Label>
                <Input
                  id="type"
                  value={createForm.type}
                  onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                  placeholder="Reparación HVAC"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Detalles del trabajo..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select value={createForm.status} onValueChange={(v) => setCreateForm({ ...createForm, status: v as any })}>
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
                  <Select value={createForm.priority} onValueChange={(v) => setCreateForm({ ...createForm, priority: v as any })}>
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
                  value={createForm.address}
                  onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                  placeholder="Calle Principal 123"
                  required
                />
              </div>
              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={createForm.city}
                  onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
                  placeholder="CDMX"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduledDate">Fecha Programada</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={createForm.scheduledDate}
                    onChange={(e) => setCreateForm({ ...createForm, scheduledDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="scheduledTime">Hora Programada</Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={createForm.scheduledTime}
                    onChange={(e) => setCreateForm({ ...createForm, scheduledTime: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCreateClose}>
                  Cancelar
                </Button>
                <Button type="submit">Crear Orden</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
