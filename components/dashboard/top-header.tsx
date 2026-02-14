"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Search,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { SearchCommand } from "./search-command"
import { useAuth } from "@/lib/context/auth-context"

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
  
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)

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
