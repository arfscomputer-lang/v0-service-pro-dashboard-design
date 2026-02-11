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
  Clock,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Wrench,
  MapPin,
  Keyboard,
  BookOpen,
  MessageCircle,
  LifeBuoy,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
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

/* ─── Notifications data ─── */
interface Notification {
  id: string
  type: "alerta" | "info" | "completado" | "asignacion"
  title: string
  body: string
  time: string
  read: boolean
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "alerta",
    title: "Alerta Critica - OT-1042",
    body: "Tecnico sin llegar al sitio despues de 45 min.",
    time: "Hace 5 min",
    read: false,
  },
  {
    id: "n2",
    type: "completado",
    title: "Trabajo Completado - OT-1038",
    body: "Carlos Mendez finalizo la instalacion en Polanco.",
    time: "Hace 12 min",
    read: false,
  },
  {
    id: "n3",
    type: "asignacion",
    title: "Tecnico Reasignado",
    body: "Ana Garcia fue reasignada a OT-1045 por proximidad.",
    time: "Hace 28 min",
    read: false,
  },
  {
    id: "n4",
    type: "info",
    title: "Nuevo Cliente Registrado",
    body: "Grupo Ferretero del Sur se agrego al sistema.",
    time: "Hace 1 hr",
    read: true,
  },
  {
    id: "n5",
    type: "alerta",
    title: "Inventario Bajo",
    body: "Filtro HEPA 14x20 tiene solo 2 unidades en almacen.",
    time: "Hace 2 hr",
    read: true,
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
      { keys: "Ctrl + N", desc: "Nueva Orden" },
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
  const [orderOpen, setOrderOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [submitted, setSubmitted] = useState(false)

  const unread = notifications.filter((n) => !n.read).length

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  const markRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))

  /* Keyboard shortcuts */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault()
        setOrderOpen(true)
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  /* Reset form state when sheet closes */
  useEffect(() => {
    if (!orderOpen) {
      const t = setTimeout(() => setSubmitted(false), 300)
      return () => clearTimeout(t)
    }
  }, [orderOpen])

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar Orden #, Cliente o Tecnico..."
          className="pl-10 pr-16 bg-secondary border-border"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden select-none items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
          <span className="text-xs">{"Ctrl"}</span>K
        </kbd>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Live indicator */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 border border-emerald-200">
          <Radio className="h-3 w-3 text-emerald-600 animate-pulse" />
          <span className="text-[11px] font-medium text-emerald-700">En Vivo</span>
        </div>

        {/* ── Nueva Orden (Sheet) ── */}
        <Button
          size="sm"
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setOrderOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nueva Orden</span>
        </Button>

        <Sheet open={orderOpen} onOpenChange={setOrderOpen}>
          <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
            <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
              <SheetTitle className="text-foreground">Crear Nueva Orden de Trabajo</SheetTitle>
              <SheetDescription className="text-muted-foreground">
                Completa los campos para generar una nueva OT.
              </SheetDescription>
            </SheetHeader>

            {submitted ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <p className="text-lg font-semibold text-foreground">Orden Creada</p>
                <p className="text-sm text-muted-foreground text-center">
                  La orden fue registrada exitosamente y esta lista para asignarse.
                </p>
                <div className="flex gap-3 mt-2">
                  <Button variant="outline" onClick={() => setOrderOpen(false)}>
                    Cerrar
                  </Button>
                  <Button onClick={() => setSubmitted(false)} className="bg-primary text-primary-foreground">
                    Crear Otra
                  </Button>
                </div>
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <form
                  className="flex flex-col gap-5 p-6"
                  onSubmit={(e) => {
                    e.preventDefault()
                    setSubmitted(true)
                  }}
                >
                  {/* Client */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">Cliente *</Label>
                    <Select required>
                      <SelectTrigger className="bg-card">
                        <SelectValue placeholder="Seleccionar cliente..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="c1">Grupo Industrial Norte S.A.</SelectItem>
                        <SelectItem value="c2">Residencial Las Lomas</SelectItem>
                        <SelectItem value="c3">Cafe La Esquina</SelectItem>
                        <SelectItem value="c4">Torre Reforma 115</SelectItem>
                        <SelectItem value="c5">Roberto Sanchez P.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Type + Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Tipo de Trabajo *</Label>
                      <Select required>
                        <SelectTrigger className="bg-card">
                          <SelectValue placeholder="Tipo..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instalacion">Instalacion</SelectItem>
                          <SelectItem value="reparacion">Reparacion</SelectItem>
                          <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                          <SelectItem value="inspeccion">Inspeccion</SelectItem>
                          <SelectItem value="emergencia">Emergencia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Prioridad *</Label>
                      <Select required>
                        <SelectTrigger className="bg-card">
                          <SelectValue placeholder="Prioridad..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baja">Baja</SelectItem>
                          <SelectItem value="media">Media</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="critica">Critica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">Direccion del Sitio *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Av. Reforma 222, Col. Juarez, CDMX"
                        required
                        className="pl-10 bg-card"
                      />
                    </div>
                  </div>

                  {/* Scheduled Date/Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Fecha Programada</Label>
                      <Input type="date" className="bg-card" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Hora Estimada</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="time" className="pl-10 bg-card" />
                      </div>
                    </div>
                  </div>

                  {/* Duration + Tech */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Duracion Estimada</Label>
                      <Select>
                        <SelectTrigger className="bg-card">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.5">30 min</SelectItem>
                          <SelectItem value="1">1 hora</SelectItem>
                          <SelectItem value="1.5">1.5 horas</SelectItem>
                          <SelectItem value="2">2 horas</SelectItem>
                          <SelectItem value="3">3 horas</SelectItem>
                          <SelectItem value="4">4 horas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Tecnico Asignado</Label>
                      <Select>
                        <SelectTrigger className="bg-card">
                          <SelectValue placeholder="Auto-asignar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto-asignar por proximidad</SelectItem>
                          <SelectItem value="t1">Carlos Mendez</SelectItem>
                          <SelectItem value="t2">Ana Garcia</SelectItem>
                          <SelectItem value="t3">Roberto Lopez</SelectItem>
                          <SelectItem value="t4">Maria Fernandez</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">Descripcion del Problema</Label>
                    <Textarea
                      placeholder="Describe la situacion que reporta el cliente..."
                      rows={3}
                      className="bg-card resize-none"
                    />
                  </div>

                  {/* Equipment */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">Equipo Relacionado</Label>
                    <div className="relative">
                      <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Ej: Minisplit Carrier 2 Ton, Caldera industrial..."
                        className="pl-10 bg-card"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setOrderOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-primary text-primary-foreground gap-2">
                      <Plus className="h-4 w-4" />
                      Crear Orden
                    </Button>
                  </div>
                </form>
              </ScrollArea>
            )}
          </SheetContent>
        </Sheet>

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
                    <button
                      type="button"
                      key={n.id}
                      onClick={() => markRead(n.id)}
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
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{n.time}</p>
                      </div>
                    </button>
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
            {helpSections.map((section) => (
              <div key={section.title} className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2 mb-2">
                  <section.icon className="h-3.5 w-3.5 text-muted-foreground" />
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
            ))}

            {/* Links */}
            <div className="p-2 flex flex-col">
              {helpLinks.map((link) => (
                <Button key={link.label} variant="ghost" size="sm" className="justify-start gap-2 text-xs text-muted-foreground h-8" asChild>
                  <a href={link.href}>
                    <link.icon className="h-3.5 w-3.5" />
                    {link.label}
                    <ExternalLink className="h-3 w-3 ml-auto opacity-40" />
                  </a>
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}
