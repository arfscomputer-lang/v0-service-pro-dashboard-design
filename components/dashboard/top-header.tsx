"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Search,
  Plus,
  Bell,
  HelpCircle,
  Radio,
  X,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Keyboard,
  BookOpen,
  MessageCircle,
  LifeBuoy,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { SearchCommand } from "./search-command"
import { useAuth } from "@/lib/context/auth-context"
import { useWorkOrders } from "@/lib/context/work-orders-context"
import { useCustomers } from "@/lib/context/customers-context"
import { useTechnicians } from "@/lib/context/technicians-context"
import { useNextWorkOrderId } from "@/lib/hooks/use-next-work-order-id"

/* ─── Notifications data ─── */
interface Notification {
  id: string
  type: "alerta" | "info" | "completado" | "asignacion"
  title: string
  body: string
  time: string
  read: boolean
  href: string
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "alerta",
    title: "Alerta Critica - OT-1042",
    body: "Tecnico sin llegar al sitio despues de 45 min.",
    time: "Hace 5 min",
    read: false,
    href: "/orden/OT-1042",
  },
  {
    id: "n2",
    type: "completado",
    title: "Trabajo Completado - OT-1038",
    body: "Carlos Mendez finalizo la instalacion en Polanco.",
    time: "Hace 12 min",
    read: false,
    href: "/orden/OT-1038",
  },
  {
    id: "n3",
    type: "asignacion",
    title: "Tecnico Reasignado",
    body: "Ana Garcia fue reasignada a OT-1045 por proximidad.",
    time: "Hace 28 min",
    read: false,
    href: "/orden/OT-1045",
  },
  {
    id: "n4",
    type: "info",
    title: "Nuevo Cliente Registrado",
    body: "Grupo Ferretero del Sur se agrego al sistema.",
    time: "Hace 1 hr",
    read: true,
    href: "/clientes",
  },
  {
    id: "n5",
    type: "alerta",
    title: "Inventario Bajo",
    body: "Filtro HEPA 14x20 tiene solo 2 unidades en almacen.",
    time: "Hace 2 hr",
    read: true,
    href: "/inventario",
  },
]

const typeIcon = {
  alerta: AlertTriangle,
  info: CheckCircle2,
  completado: CheckCircle2,
  asignacion: UserCheck,
}
const typeColor = {
  alerta: "text-destructive",
  info: "text-primary",
  completado: "text-success",
  asignacion: "text-chart-2",
}

/* ─── Help items ─── */
const helpSections = [
  {
    title: "Atajos de Teclado",
    icon: Keyboard,
    items: [
      { keys: "Ctrl + K", desc: "Buscar" },
      { keys: "Ctrl + D", desc: "Ir a Despacho" },
      { keys: "Esc", desc: "Cerrar panel" },
    ],
  },
]

const helpLinks = [
  { icon: BookOpen, label: "Documentacion", href: "#" },
  { icon: MessageCircle, label: "Chat de Soporte", href: "#" },
  { icon: LifeBuoy, label: "Centro de Ayuda", href: "#" },
]

/* ─── Component ─── */
export function TopHeader() {
  const { user } = useAuth()
  const { addWorkOrder } = useWorkOrders()
  const { customers } = useCustomers()
  const { technicians } = useTechnicians()
  const { nextId } = useNextWorkOrderId()
  
  const [searchOpen, setSearchOpen] = useState(false)
  const [orderOpen, setOrderOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [submitted, setSubmitted] = useState(false)
  
  const [formData, setFormData] = useState({
    orderId: '',
    customerId: '',
    technicianId: '',
    type: '',
    priority: 'normal',
    description: '',
    status: 'pendiente',
  })

  const unread = notifications.filter((n) => !n.read).length

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  const markRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))

  /* Keyboard shortcuts */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  /* Populate nextId when dialog opens */
  useEffect(() => {
    if (orderOpen && nextId && !formData.orderId) {
      setFormData(prev => ({ ...prev, orderId: nextId }))
    }
  }, [orderOpen, nextId])

  /* Reset form when dialog closes */
  useEffect(() => {
    if (!orderOpen) {
      setSubmitted(false)
      setFormData({
        orderId: '',
        customerId: '',
        technicianId: '',
        type: '',
        priority: 'normal',
        description: '',
        status: 'pendiente',
      })
    }
  }, [orderOpen])

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Search trigger */}
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="relative w-full max-w-md flex items-center rounded-md border border-border bg-secondary px-3 py-2 text-sm text-muted-foreground hover:bg-muted/70 transition-colors cursor-pointer"
      >
        <Search className="h-4 w-4 mr-3 shrink-0" />
        <span className="flex-1 text-left truncate">Buscar Orden #, Cliente o Tecnico...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground ml-4 shrink-0">
          <span className="text-xs">{"Ctrl"}</span>K
        </kbd>
      </button>
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Live indicator */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 border border-emerald-200">
          <Radio className="h-3 w-3 text-emerald-600 animate-pulse" />
          <span className="text-[11px] font-medium text-emerald-700">En Vivo</span>
        </div>

        {/* Nueva Orden Button */}
        <Button 
          size="sm" 
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setOrderOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nueva Orden</span>
        </Button>

        {/* ── Notifications (Popover) ── */}
        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-destructive p-0 text-[10px] text-destructive-foreground">
                  {unread}
                </Badge>
              )}
              <span className="sr-only">Notificaciones</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0" sideOffset={8}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Notificaciones</h3>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Marcar todas como leidas
                </button>
              )}
            </div>
            <ScrollArea className="max-h-[380px]">
              <div className="flex flex-col">
                {notifications.map((n) => {
                  const Icon = typeIcon[n.type]
                  const color = typeColor[n.type]
                  return (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={() => {
                        markRead(n.id)
                        setNotifOpen(false)
                      }}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 border-b border-border last:border-0",
                        !n.read && "bg-primary/[0.03]"
                      )}
                    >
                      <div className={cn("mt-0.5 shrink-0", color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn("text-xs font-semibold truncate", !n.read ? "text-foreground" : "text-muted-foreground")}>
                            {n.title}
                          </p>
                          {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[10px] text-muted-foreground/60">{n.time}</p>
                          <span className="text-[10px] text-primary font-medium">Ver detalle</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </ScrollArea>
            <Separator />
            <div className="p-2">
              <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" asChild>
                <Link href="/ordenes">Ver todas las ordenes</Link>
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* ── Help (Popover) ── */}
        <Popover open={helpOpen} onOpenChange={setHelpOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <HelpCircle className="h-5 w-5" />
              <span className="sr-only">Ayuda</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Centro de Ayuda</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">ServicePro v2.4</p>
            </div>

            {/* Shortcuts */}
            {helpSections.map((section) => {
              const SectionIcon = section.icon;
              return (
              <div key={section.title} className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2 mb-2">
                  <SectionIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <h4 className="text-xs font-semibold text-muted-foreground">{section.title}</h4>
                </div>
                <div className="grid gap-1.5">
                  {section.items.map((item) => (
                    <div key={item.keys} className="flex items-center justify-between">
                      <span className="text-xs text-foreground">{item.desc}</span>
                      <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                        {item.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )
            })}

            {/* Links */}
            <div className="p-2 flex flex-col">
              {helpLinks.map((link) => {
                const LinkIcon = link.icon;
                return (
                <Button key={link.label} variant="ghost" size="sm" className="justify-start gap-2 text-xs text-muted-foreground h-8" asChild>
                  <a href={link.href}>
                    <LinkIcon className="h-3.5 w-3.5" />
                    {link.label}
                    <ExternalLink className="h-3 w-3 ml-auto opacity-40" />
                  </a>
                </Button>
              )
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Nueva Orden Dialog */}
      <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Orden de Trabajo</DialogTitle>
            <DialogDescription>Completa los campos para crear una nueva orden</DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-lg font-semibold">Orden Creada Exitosamente</p>
              <p className="text-sm text-muted-foreground text-center">La orden ha sido registrada en el sistema</p>
              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={() => setOrderOpen(false)}>
                  Cerrar
                </Button>
                <Button onClick={() => setSubmitted(false)} className="bg-primary text-primary-foreground">
                  Crear Otra
                </Button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                try {
                  console.log('[v0] Creating work order:', JSON.stringify(formData))
                  await addWorkOrder({
                    orderId: formData.orderId,
                    customerId: formData.customerId || null,
                    technicianId: formData.technicianId || null,
                    type: formData.type,
                    description: formData.description,
                    status: formData.status,
                    priority: formData.priority,
                    address: '',
                    city: '',
                    scheduledDate: new Date().toISOString().split('T')[0],
                    scheduledTime: '09:00',
                  })
                  setSubmitted(true)
                } catch (error) {
                  console.error('[v0] Error:', error)
                }
              }}
              className="space-y-4"
            >
              {/* Order ID - Read Only */}
              <div>
                <Label className="text-xs font-semibold">ID de Orden</Label>
                <Input value={formData.orderId} readOnly className="bg-muted/50 mt-1" />
              </div>

              {/* Cliente y Tecnico */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Cliente *</Label>
                  <Select value={formData.customerId} onValueChange={(v) => setFormData({ ...formData, customerId: v })} required>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar cliente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Tecnico</Label>
                  <Select value={formData.technicianId} onValueChange={(v) => setFormData({ ...formData, technicianId: v === 'auto' ? '' : v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Auto-asignar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-asignar por proximidad</SelectItem>
                      {technicians.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tipo, Estado y Prioridad */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Tipo *</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })} required>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Reparacion HVAC">Reparacion HVAC</SelectItem>
                      <SelectItem value="Reparacion Electrica">Reparacion Electrica</SelectItem>
                      <SelectItem value="Instalacion Electrica">Instalacion Electrica</SelectItem>
                      <SelectItem value="Mantenimiento Plomeria">Mantenimiento Plomeria</SelectItem>
                      <SelectItem value="Instalacion Panel Solar">Instalacion Panel Solar</SelectItem>
                      <SelectItem value="Inspeccion Gas">Inspeccion Gas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Estado *</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })} required>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="asignada">Asignada</SelectItem>
                      <SelectItem value="en_ruta">En Ruta</SelectItem>
                      <SelectItem value="en_sitio">En Sitio</SelectItem>
                      <SelectItem value="completada">Completada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Prioridad *</Label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })} required>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baja">Baja</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Descripcion */}
              <div>
                <Label className="text-xs font-semibold">Descripción</Label>
                <Textarea
                  placeholder="Describe el trabajo a realizar..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="mt-1 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setOrderOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="gap-2 bg-primary text-primary-foreground">
                  <Plus className="h-4 w-4" />
                  Crear Orden
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </header>
  )
}

    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))

  /* Keyboard shortcuts */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Search trigger */}
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="relative w-full max-w-md flex items-center rounded-md border border-border bg-secondary px-3 py-2 text-sm text-muted-foreground hover:bg-muted/70 transition-colors cursor-pointer"
      >
        <Search className="h-4 w-4 mr-3 shrink-0" />
        <span className="flex-1 text-left truncate">Buscar Orden #, Cliente o Tecnico...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground ml-4 shrink-0">
          <span className="text-xs">{"Ctrl"}</span>K
        </kbd>
      </button>
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Live indicator */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 border border-emerald-200">
          <Radio className="h-3 w-3 text-emerald-600 animate-pulse" />
          <span className="text-[11px] font-medium text-emerald-700">En Vivo</span>
        </div>

        {/* Nueva Orden Button */}
        <Button 
          size="sm" 
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setOrderOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nueva Orden</span>
        </Button>

        {/* ── Notifications (Popover) ── */}
        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-destructive p-0 text-[10px] text-destructive-foreground">
                  {unread}
                </Badge>
              )}
              <span className="sr-only">Notificaciones</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0" sideOffset={8}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Notificaciones</h3>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Marcar todas como leidas
                </button>
              )}
            </div>
            <ScrollArea className="max-h-[380px]">
              <div className="flex flex-col">
                {notifications.map((n) => {
                  const Icon = typeIcon[n.type]
                  const color = typeColor[n.type]
                  return (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={() => {
                        markRead(n.id)
                        setNotifOpen(false)
                      }}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 border-b border-border last:border-0",
                        !n.read && "bg-primary/[0.03]"
                      )}
                    >
                      <div className={cn("mt-0.5 shrink-0", color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn("text-xs font-semibold truncate", !n.read ? "text-foreground" : "text-muted-foreground")}>
                            {n.title}
                          </p>
                          {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[10px] text-muted-foreground/60">{n.time}</p>
                          <span className="text-[10px] text-primary font-medium">Ver detalle</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </ScrollArea>
            <Separator />
            <div className="p-2">
              <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" asChild>
                <Link href="/ordenes">Ver todas las ordenes</Link>
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* ── Help (Popover) ── */}
        <Popover open={helpOpen} onOpenChange={setHelpOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <HelpCircle className="h-5 w-5" />
              <span className="sr-only">Ayuda</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Centro de Ayuda</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">ServicePro v2.4</p>
            </div>

            {/* Shortcuts */}
            {helpSections.map((section) => {
              const SectionIcon = section.icon;
              return (
              <div key={section.title} className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2 mb-2">
                  <SectionIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <h4 className="text-xs font-semibold text-muted-foreground">{section.title}</h4>
                </div>
                <div className="grid gap-1.5">
                  {section.items.map((item) => (
                    <div key={item.keys} className="flex items-center justify-between">
                      <span className="text-xs text-foreground">{item.desc}</span>
                      <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                        {item.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )
            })}

            {/* Links */}
            <div className="p-2 flex flex-col">
              {helpLinks.map((link) => {
                const LinkIcon = link.icon;
                return (
                <Button key={link.label} variant="ghost" size="sm" className="justify-start gap-2 text-xs text-muted-foreground h-8" asChild>
                  <a href={link.href}>
                    <LinkIcon className="h-3.5 w-3.5" />
                    {link.label}
                    <ExternalLink className="h-3 w-3 ml-auto opacity-40" />
                  </a>
                </Button>
              )
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}
