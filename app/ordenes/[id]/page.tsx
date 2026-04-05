'use client'

import { useState, useEffect } from 'react'
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
import { ArrowLeft, Save, Trash2, Loader } from 'lucide-react'
import { useWorkOrders, type WorkOrder } from '@/lib/context/work-orders-context'
import { cn } from '@/lib/utils'

interface Technician {
  id: string
  name: string
  role?: string
  email?: string
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  
  const { workOrders, updateWorkOrder, deleteWorkOrder } = useWorkOrders()
  const [order, setOrder] = useState<WorkOrder | null>(null)
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState<Partial<WorkOrder>>({})

  // Load order
  useEffect(() => {
    const foundOrder = workOrders.find(wo => wo.id === orderId)
    if (foundOrder) {
      setOrder(foundOrder)
      setEditForm(foundOrder)
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [orderId, workOrders])

  // Load technicians
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const response = await fetch('/api/technicians')
        if (response.ok) {
          const json = await response.json()
          setTechnicians(json.data || [])
        }
      } catch (error) {
        console.error('[v0] Error loading technicians:', error)
      }
    }

    fetchTechnicians()
  }, [])

  const handleSave = async () => {
    if (!order) return
    
    try {
      setIsSaving(true)
      const formattedData = { ...editForm }
      
      // Format date if present
      if (formattedData.scheduledDate) {
        const dateObj = new Date(formattedData.scheduledDate)
        formattedData.scheduledDate = dateObj.toISOString().split('T')[0]
      }

      await updateWorkOrder(order.id, formattedData)
      setIsEditing(false)
      setOrder({ ...order, ...editForm })
    } catch (error) {
      console.error('[v0] Error saving order:', error)
      alert('Error al guardar la orden')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!order) return
    
    if (!confirm('¿Estás seguro de que deseas eliminar esta orden?')) return

    try {
      await deleteWorkOrder(order.id)
      router.push('/ordenes')
    } catch (error) {
      console.error('[v0] Error deleting order:', error)
      alert('Error al eliminar la orden')
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <SidebarNav />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex items-center justify-center">
            <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          </main>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <SidebarNav />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <Card className="border border-border">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <p className="text-lg font-semibold text-foreground">Orden no encontrada</p>
                  <p className="text-sm text-muted-foreground">La orden que intentas acceder no existe</p>
                  <Link href="/ordenes">
                    <Button variant="outline" className="gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Volver a Órdenes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  const statusColors: Record<string, { bg: string; text: string }> = {
    pendiente: { bg: 'bg-yellow-100 dark:bg-yellow-950', text: 'text-yellow-800 dark:text-yellow-200' },
    en_ruta: { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-800 dark:text-blue-200' },
    en_sitio: { bg: 'bg-purple-100 dark:bg-purple-950', text: 'text-purple-800 dark:text-purple-200' },
    completada: { bg: 'bg-green-100 dark:bg-green-950', text: 'text-green-800 dark:text-green-200' },
    cancelada: { bg: 'bg-red-100 dark:bg-red-950', text: 'text-red-800 dark:text-red-200' },
  }

  const priorityColors: Record<string, string> = {
    baja: 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200',
    normal: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200',
    alta: 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200',
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Link href="/ordenes">
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div className="min-w-0">
                  <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">
                    Orden {order.orderId}
                  </h1>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    ID: {order.id}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false)
                        setEditForm(order)
                      }}
                      disabled={isSaving}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="gap-2"
                    >
                      {isSaving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Guardar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden md:inline">Eliminar</span>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex gap-2 flex-wrap">
              <Badge className={`${statusColors[order.status]?.bg} ${statusColors[order.status]?.text}`}>
                {order.status}
              </Badge>
              <Badge className={`${priorityColors[order.priority]}`}>
                {order.priority}
              </Badge>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - Main Details */}
              <div className="md:col-span-2 space-y-6">
                {/* Order Info */}
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="text-base md:text-lg">Información de la Orden</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs md:text-sm">Tipo de Servicio</Label>
                        {isEditing ? (
                          <Input
                            value={editForm.type || ''}
                            onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                            className="mt-1 text-xs md:text-sm"
                          />
                        ) : (
                          <p className="mt-1 text-xs md:text-sm text-foreground">{order.type}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs md:text-sm">Status</Label>
                        {isEditing ? (
                          <Select value={editForm.status || 'pendiente'} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                            <SelectTrigger className="mt-1 text-xs md:text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendiente">Pendiente</SelectItem>
                              <SelectItem value="en_ruta">En Ruta</SelectItem>
                              <SelectItem value="en_sitio">En Sitio</SelectItem>
                              <SelectItem value="completada">Completada</SelectItem>
                              <SelectItem value="cancelada">Cancelada</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="mt-1 text-xs md:text-sm text-foreground capitalize">{order.status}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs md:text-sm">Descripción</Label>
                      {isEditing ? (
                        <Textarea
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="mt-1 text-xs md:text-sm"
                          rows={3}
                        />
                      ) : (
                        <p className="mt-1 text-xs md:text-sm text-foreground">{order.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Location Info */}
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="text-base md:text-lg">Ubicación</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs md:text-sm">Dirección</Label>
                      {isEditing ? (
                        <Input
                          value={editForm.address || ''}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          className="mt-1 text-xs md:text-sm"
                        />
                      ) : (
                        <p className="mt-1 text-xs md:text-sm text-foreground">{order.address}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs md:text-sm">Ciudad</Label>
                      {isEditing ? (
                        <Input
                          value={editForm.city || ''}
                          onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                          className="mt-1 text-xs md:text-sm"
                        />
                      ) : (
                        <p className="mt-1 text-xs md:text-sm text-foreground">{order.city}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Schedule Info */}
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="text-base md:text-lg">Programación</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs md:text-sm">Fecha</Label>
                        {isEditing ? (
                          <Input
                            type="date"
                            value={editForm.scheduledDate || ''}
                            onChange={(e) => setEditForm({ ...editForm, scheduledDate: e.target.value })}
                            className="mt-1 text-xs md:text-sm"
                          />
                        ) : (
                          <p className="mt-1 text-xs md:text-sm text-foreground">
                            {order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString('es-MX') : 'No programada'}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs md:text-sm">Hora</Label>
                        {isEditing ? (
                          <Input
                            type="time"
                            value={editForm.scheduledTime || ''}
                            onChange={(e) => setEditForm({ ...editForm, scheduledTime: e.target.value })}
                            className="mt-1 text-xs md:text-sm"
                          />
                        ) : (
                          <p className="mt-1 text-xs md:text-sm text-foreground">{order.scheduledTime || 'No programada'}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Sidebar Info */}
              <div className="space-y-6">
                {/* Technician */}
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="text-base">Técnico</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Select value={editForm.technicianId || 'none'} onValueChange={(v) => setEditForm({ ...editForm, technicianId: v === 'none' ? null : v })}>
                        <SelectTrigger className="text-xs md:text-sm">
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
                    ) : (
                      <p className="text-xs md:text-sm text-foreground">
                        {order.technicianId ? technicians.find(t => t.id === order.technicianId)?.name || 'Técnico no encontrado' : 'Sin asignar'}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Priority */}
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="text-base">Prioridad</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Select value={editForm.priority || 'normal'} onValueChange={(v) => setEditForm({ ...editForm, priority: v })}>
                        <SelectTrigger className="text-xs md:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baja">Baja</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={`${priorityColors[order.priority]}`}>
                        {order.priority}
                      </Badge>
                    )}
                  </CardContent>
                </Card>

                {/* Dates */}
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="text-base">Fechas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Creada</p>
                      <p className="text-foreground font-medium">
                        {new Date(order.createdAt).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                    {order.updatedAt && (
                      <div>
                        <p className="text-muted-foreground">Actualizada</p>
                        <p className="text-foreground font-medium">
                          {new Date(order.updatedAt).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
