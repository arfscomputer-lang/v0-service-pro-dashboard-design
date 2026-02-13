"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { useCustomers } from "@/lib/context/customers-context"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Wrench,
  Plus,
  ClipboardList,
  BarChart3,
  Star,
  DollarSign,
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  LogOut,
  Phone,
  Mail,
  TrendingUp,
  Award,
} from "lucide-react"
import { cn } from "@/lib/utils"

const priorityMap = {
  alta: { label: "Alta", color: "bg-destructive/10 text-destructive border-destructive/20" },
  media: { label: "Media", color: "bg-amber-50 text-amber-700 border-amber-200" },
  baja: { label: "Baja", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
}
const statusMap: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  completado: { label: "Completado", color: "text-emerald-600", icon: CheckCircle2 },
  pendiente: { label: "Pendiente", color: "text-amber-600", icon: Clock },
  cancelado: { label: "Cancelado", color: "text-muted-foreground", icon: XCircle },
}

export default function ClientPortalPage() {
  const { user, logout } = useAuth()
  const { customers } = useCustomers()
  const router = useRouter()
  const [orderOpen, setOrderOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [tab, setTab] = useState<"dashboard" | "ordenes">("dashboard")

  const customer = useMemo(() => {
    if (!user?.customerId) return null
    return customers.find((c) => c.id === user.customerId) ?? null
  }, [user, customers])

  useEffect(() => {
    if (!orderOpen) {
      const t = setTimeout(() => setSubmitted(false), 300)
      return () => clearTimeout(t)
    }
  }, [orderOpen])

  if (!user || !customer) return null

  const completedServices = customer.services.filter((s) => s.status === "completado")
  const pendingServices = customer.services.filter((s) => s.status === "pendiente")
  const avgRating = completedServices.length > 0
    ? completedServices.filter((s) => s.rating !== null).reduce((a, s) => a + (s.rating ?? 0), 0) / completedServices.filter((s) => s.rating !== null).length
    : 0

  const kpis = [
    { label: "Servicios Completados", value: completedServices.length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Ordenes Pendientes", value: pendingServices.length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Calificacion Promedio", value: avgRating > 0 ? avgRating.toFixed(1) : "N/A", icon: Star, color: "text-primary", bg: "bg-primary/10" },
    { label: "Total Invertido", value: `$${customer.totalSpent.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  ]

  function handleLogout() {
    logout()
    router.replace("/login")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Custom client sidebar */}
      <aside className="flex h-screen w-[260px] flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <Wrench className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-sidebar-primary-foreground">
            ServicePro
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <button
            type="button"
            onClick={() => setTab("dashboard")}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              tab === "dashboard"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
          >
            <BarChart3 className="h-5 w-5 shrink-0" />
            <span>Mi Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("ordenes")}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              tab === "ordenes"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
          >
            <ClipboardList className="h-5 w-5 shrink-0" />
            <span>Mis Ordenes</span>
          </button>
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border px-3 py-4 space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
              {customer.initials}
            </div>
            <div className="flex flex-col overflow-hidden flex-1 min-w-0">
              <span className="truncate text-sm font-medium text-sidebar-primary-foreground">
                {customer.name}
              </span>
              <span className="truncate text-xs text-sidebar-foreground/60">Cliente</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/60 hover:bg-destructive/20 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Cerrar Sesion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <div>
            <h1 className="text-lg font-bold text-foreground">
              {tab === "dashboard" ? "Mi Dashboard" : "Mis Ordenes de Servicio"}
            </h1>
            <p className="text-xs text-muted-foreground">Bienvenido, {customer.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              {customer.phone}
            </div>
            <Button size="sm" className="gap-2" onClick={() => setOrderOpen(true)}>
              <Plus className="h-4 w-4" />
              Solicitar Servicio
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-content">
          {tab === "dashboard" ? (
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {kpis.map((k) => (
                  <Card key={k.label} className="border border-border shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", k.bg)}>
                        <k.icon className={cn("h-5 w-5", k.color)} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{k.label}</p>
                        <p className="text-xl font-bold text-foreground">{k.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Client info card */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="border border-border shadow-sm lg:col-span-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Informacion de Cuenta</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{customer.phone}</span>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground">Direccion</p>
                      <p className="text-sm text-foreground mt-0.5">{customer.address}</p>
                      <p className="text-sm text-foreground">{customer.city}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground">Horario Preferido</p>
                      <p className="text-sm text-foreground mt-0.5">{customer.preferredSchedule}</p>
                    </div>
                    <Separator />
                    <div className="flex flex-wrap gap-1.5">
                      {(customer.tags || []).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                    {customer.nps !== null && (
                      <>
                        <Separator />
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">NPS: {customer.nps}/10</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Recent services */}
                <Card className="border border-border shadow-sm lg:col-span-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">Servicios Recientes</CardTitle>
                      <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => setTab("ordenes")}>
                        Ver todos
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {customer.services.slice(0, 5).map((s) => {
                        const st = statusMap[s.status] ?? statusMap.pendiente
                        return (
                          <div key={s.orderId} className="flex items-center justify-between px-5 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <st.icon className={cn("h-4 w-4 shrink-0", st.color)} />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{s.orderId} - {s.type}</p>
                                <p className="text-xs text-muted-foreground">{s.date} | {s.technicianName}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              {s.rating !== null && (
                                <div className="flex items-center gap-1 text-xs text-amber-600">
                                  <Star className="h-3 w-3 fill-amber-400" />
                                  {s.rating}
                                </div>
                              )}
                              <Badge variant="outline" className={cn("text-[10px]", st.color)}>
                                {st.label}
                              </Badge>
                            </div>
                          </div>
                        )
                      })}
                      {customer.services.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                          <ClipboardList className="h-8 w-8 mb-2 opacity-40" />
                          <p className="text-sm">No hay servicios registrados</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Spending summary */}
              <Card className="border border-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Resumen Financiero</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Gastado</p>
                      <p className="text-lg font-bold text-foreground">${customer.totalSpent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Valor de Vida</p>
                      <p className="text-lg font-bold text-foreground">${customer.lifetimeValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Servicios Totales</p>
                      <p className="text-lg font-bold text-foreground">{customer.services.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Promedio por Servicio</p>
                      <p className="text-lg font-bold text-foreground">
                        ${customer.services.length > 0
                          ? Math.round(customer.totalSpent / customer.services.length).toLocaleString()
                          : 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* ─── Ordenes tab ─── */
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Card className="border border-border shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-lg font-bold">{customer.services.length}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-border shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pendientes</p>
                      <p className="text-lg font-bold">{pendingServices.length}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-border shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Completados</p>
                      <p className="text-lg font-bold">{completedServices.length}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border border-border shadow-sm">
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Orden</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Tipo</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Fecha</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Tecnico</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Estado</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Monto</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {customer.services.map((s) => {
                        const st = statusMap[s.status] ?? statusMap.pendiente
                        return (
                          <tr key={s.orderId} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{s.orderId}</td>
                            <td className="px-4 py-3 text-muted-foreground">{s.type}</td>
                            <td className="px-4 py-3 text-muted-foreground">{s.date}</td>
                            <td className="px-4 py-3 text-muted-foreground">{s.technicianName}</td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className={cn("text-[10px]", st.color)}>{st.label}</Badge>
                            </td>
                            <td className="px-4 py-3 text-right font-medium">${s.amount.toLocaleString()}</td>
                            <td className="px-4 py-3 text-center">
                              {s.rating !== null ? (
                                <div className="flex items-center justify-center gap-1 text-xs text-amber-600">
                                  <Star className="h-3 w-3 fill-amber-400" />
                                  {s.rating}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">--</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {customer.services.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <ClipboardList className="h-10 w-10 mb-3 opacity-30" />
                      <p className="text-sm">No hay ordenes de servicio</p>
                      <Button size="sm" variant="outline" className="mt-3 gap-2" onClick={() => setOrderOpen(true)}>
                        <Plus className="h-4 w-4" />
                        Solicitar Servicio
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* ── New order sheet ── */}
      <Sheet open={orderOpen} onOpenChange={setOrderOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
            <SheetTitle className="text-foreground">Solicitar Nuevo Servicio</SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Complete los datos para solicitar una orden de servicio.
            </SheetDescription>
          </SheetHeader>

          {!submitted ? (
            <ScrollArea className="flex-1">
              <form
                className="p-6 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  setSubmitted(true)
                }}
              >
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Tipo de Servicio</Label>
                  <Select defaultValue="reparacion">
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reparacion">Reparacion</SelectItem>
                      <SelectItem value="mantenimiento">Mantenimiento Preventivo</SelectItem>
                      <SelectItem value="instalacion">Instalacion</SelectItem>
                      <SelectItem value="inspeccion">Inspeccion</SelectItem>
                      <SelectItem value="emergencia">Emergencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Prioridad</Label>
                  <Select defaultValue="media">
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="baja">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">Fecha Preferida</Label>
                    <Input type="date" className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">Horario</Label>
                    <Select defaultValue="manana">
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manana">Manana (8-12)</SelectItem>
                        <SelectItem value="tarde">Tarde (12-17)</SelectItem>
                        <SelectItem value="urgente">Lo antes posible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Direccion del Servicio</Label>
                  <Input className="h-9" defaultValue={customer.address} />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Equipo / Unidad</Label>
                  <Input className="h-9" placeholder="Ej: HVAC Piso 3, Caldera Principal..." />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Descripcion del Problema</Label>
                  <Textarea rows={4} placeholder="Describa el problema o necesidad..." />
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Enviar Solicitud
                  </Button>
                </div>
              </form>
            </ScrollArea>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-foreground">Solicitud Enviada</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Su orden de servicio ha sido registrada. Recibira una confirmacion por correo con el numero de orden y el tecnico asignado.
                </p>
              </div>
              <Button variant="outline" onClick={() => setOrderOpen(false)} className="mt-2">
                Cerrar
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
