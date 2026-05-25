"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { useCustomers } from "@/lib/context/customers-context"
import { useWorkOrders } from "@/lib/context/work-orders-context"
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
  PieChart as PieChartIcon,
  FileText,
  Send,
  MessageSquare,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { cn } from "@/lib/utils"

const priorityMap = {
  alta: { label: "Alta", color: "bg-destructive/10 text-destructive border-destructive/20" },
  media: { label: "Media", color: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
  baja: { label: "Baja", color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
}
const statusMap: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  completado: { label: "Completado", color: "text-emerald-600", icon: CheckCircle2 },
  pendiente: { label: "Pendiente", color: "text-amber-600", icon: Clock },
  cancelado: { label: "Cancelado", color: "text-muted-foreground", icon: XCircle },
}

export default function ClientPortalPage() {
  const { user, logout } = useAuth()
  const { customers } = useCustomers()
  const { workOrders } = useWorkOrders()
  const router = useRouter()
  const [orderOpen, setOrderOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [tab, setTab] = useState<"dashboard" | "ordenes" | "reportes" | "presupuestos">("dashboard")
  const [customerAssets, setCustomerAssets] = useState<{ id: string; name: string; asset_id: string; type: string }[]>([])
  const [selectedAssetId, setSelectedAssetId] = useState("")

  // presupuestos
  const [budgets, setBudgets] = useState<any[]>([])
  const [budgetComments, setBudgetComments] = useState<Record<string, string>>({})
  const [budgetCommentSending, setBudgetCommentSending] = useState<Record<string, boolean>>({})
  const [viewingBudget, setViewingBudget] = useState<any | null>(null)
  const [viewingBudgetLoading, setViewingBudgetLoading] = useState(false)

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

  useEffect(() => {
    if (!user?.customerId) return
    fetch(`/api/assets?customer_id=${user.customerId}`)
      .then((r) => r.json())
      .then((d) => setCustomerAssets(d.assets || []))
      .catch(() => setCustomerAssets([]))
  }, [user?.customerId])

  useEffect(() => {
    if (!user?.customerId) return
    fetch(`/api/budgets?customer_id=${user.customerId}`)
      .then((r) => r.json())
      .then((d) => setBudgets((d.budgets || []).filter((b: any) => b.status !== 'borrador')))
      .catch(() => setBudgets([]))
  }, [user?.customerId])

  const handleViewBudget = async (budgetId: string) => {
    setViewingBudgetLoading(true)
    setViewingBudget(null)
    try {
      const res = await fetch(`/api/budgets/${budgetId}`)
      const { budget } = await res.json()
      setViewingBudget(budget)
    } catch { /* ignore */ }
    finally { setViewingBudgetLoading(false) }
  }

  const handleAcceptBudget = async (budgetId: string) => {
    await fetch(`/api/budgets/${budgetId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'aceptado' }),
    })
    setBudgets((prev) => prev.map((b) => b.id === budgetId ? { ...b, status: 'aceptado' } : b))
  }

  const handleSendComment = async (budgetId: string) => {
    const text = budgetComments[budgetId]?.trim()
    if (!text) return
    setBudgetCommentSending((prev) => ({ ...prev, [budgetId]: true }))
    const res = await fetch(`/api/budgets/${budgetId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: customer?.name || 'Cliente', text }),
    })
    const data = await res.json().catch(() => ({}))
    setBudgetComments((prev) => ({ ...prev, [budgetId]: '' }))
    setBudgetCommentSending((prev) => ({ ...prev, [budgetId]: false }))
    // Reflect new status (en_revision) immediately
    if (data.newStatus) {
      setBudgets((prev) => prev.map((b) => b.id === budgetId ? { ...b, status: data.newStatus } : b))
    }
  }

  if (!user || !customer) return null

  const myOrders = workOrders.filter((o) => o.customerId === user.customerId)
  const completedOrders = myOrders.filter((o) => o.status === "completada")
  const pendingOrders = myOrders.filter((o) => o.status !== "completada" && o.status !== "cancelada")

  const completedServices = customer.services.filter((s) => s.status === "completado")
  const avgRating = completedServices.length > 0
    ? completedServices.filter((s) => s.rating !== null).reduce((a, s) => a + (s.rating ?? 0), 0) / completedServices.filter((s) => s.rating !== null).length
    : 0

  const kpis = [
    { label: "Servicios Completados", value: completedOrders.length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { label: "Ordenes Pendientes", value: pendingOrders.length, icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10" },
    { label: "Calificacion Promedio", value: avgRating > 0 ? avgRating.toFixed(1) : "N/A", icon: Star, color: "text-primary", bg: "bg-primary/10" },
    { label: "Total Invertido", value: `$${customer.totalSpent.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-500/10" },
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
          <button
            type="button"
            onClick={() => setTab("reportes")}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              tab === "reportes"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
          >
            <PieChartIcon className="h-5 w-5 shrink-0" />
            <span>Mis Reportes</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("presupuestos")}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              tab === "presupuestos"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
          >
            <FileText className="h-5 w-5 shrink-0" />
            <span>Presupuestos</span>
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
              {tab === "dashboard" ? "Mi Dashboard" : tab === "ordenes" ? "Mis Órdenes de Servicio" : tab === "presupuestos" ? "Mis Presupuestos" : "Mis Reportes"}
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
                      {myOrders.slice(0, 5).map((o) => {
                        const st = statusMap[o.status === "completada" ? "completado" : o.status === "cancelada" ? "cancelado" : "pendiente"] ?? statusMap.pendiente
                        return (
                          <div key={o.id} className="flex items-center justify-between px-5 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <st.icon className={cn("h-4 w-4 shrink-0", st.color)} />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{o.orderId} — {o.type}</p>
                                <p className="text-xs text-muted-foreground">{o.scheduledDate} · {o.address}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className={cn("text-[10px] shrink-0", st.color)}>
                              {st.label}
                            </Badge>
                          </div>
                        )
                      })}
                      {myOrders.length === 0 && (
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

              {/* Budget summary */}
              {budgets.length > 0 && (() => {
                const bStats = {
                  porAprobar:  budgets.filter((b) => b.status === 'enviado').length,
                  enAnalisis:  budgets.filter((b) => b.status === 'en_revision').length,
                  aprobados:   budgets.filter((b) => b.status === 'aceptado').length,
                  rechazados:  budgets.filter((b) => b.status === 'rechazado').length,
                }
                return (
                  <Card className="border border-border shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          Mis Presupuestos
                        </CardTitle>
                        <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => setTab("presupuestos")}>
                          Ver todos
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {[
                          { label: 'Por Aprobar',  value: bStats.porAprobar, color: 'text-blue-600',    border: 'border-t-2 border-t-blue-400', pulse: bStats.porAprobar > 0 },
                          { label: 'En Análisis',  value: bStats.enAnalisis, color: 'text-amber-600',   border: 'border-t-2 border-t-amber-400', pulse: bStats.enAnalisis > 0 },
                          { label: 'Aprobados',    value: bStats.aprobados,  color: 'text-emerald-600', border: 'border-t-2 border-t-emerald-400' },
                          { label: 'Rechazados',   value: bStats.rechazados, color: 'text-red-600',     border: 'border-t-2 border-t-red-400' },
                        ].map((s) => (
                          <div key={s.label} className={cn('rounded-lg border border-border bg-muted/30 p-3 relative', s.border)}>
                            {s.pulse && s.value > 0 && (
                              <span className="absolute top-2 right-2 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-60" style={{ color: 'inherit' }} />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-current" style={{ color: 'inherit' }} />
                              </span>
                            )}
                            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">{s.label}</p>
                            <p className={cn('text-2xl font-bold mt-0.5', s.color)}>{s.value}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })()}
            </div>
          ) : tab === "reportes" ? (
            /* ─── Reportes tab ─── */
            (() => {
              const servicesByMonth = (() => {
                const map: Record<string, { mes: string; total: number; completados: number }> = {}
                myOrders.forEach(o => {
                  const [y, m] = (o.scheduledDate || "").split("-")
                  if (!y || !m) return
                  const key = `${y}-${m}`
                  const label = new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString("es-ES", { month: "short", year: "2-digit" })
                  if (!map[key]) map[key] = { mes: label, total: 0, completados: 0 }
                  map[key].total++
                  if (o.status === "completada") map[key].completados++
                })
                return Object.values(map).slice(-6)
              })()

              const byType = (() => {
                const map: Record<string, number> = {}
                myOrders.forEach(o => { map[o.type] = (map[o.type] || 0) + 1 })
                return Object.entries(map).map(([name, value]) => ({ name, value }))
              })()

              const canceledOrders = myOrders.filter(o => o.status === "cancelada")

              const statusBreakdown = [
                { name: "Completados", value: completedOrders.length, color: "#10b981" },
                { name: "Pendientes", value: pendingOrders.length, color: "#f59e0b" },
                { name: "Cancelados", value: canceledOrders.length, color: "#6b7280" },
              ].filter(s => s.value > 0)

              const COLORS = ["#2e5cb8", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"]

              return (
                <div className="space-y-6">
                  {/* KPI row */}
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[
                      { label: "Total solicitudes", value: myOrders.length, icon: ClipboardList, color: "text-primary", bg: "bg-primary/10" },
                      { label: "Completados", value: completedOrders.length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/10" },
                      { label: "Tasa de éxito", value: myOrders.length ? `${Math.round(completedOrders.length / myOrders.length * 100)}%` : "0%", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-500/10" },
                      { label: "Rating promedio", value: avgRating > 0 ? `${avgRating.toFixed(1)} ★` : "N/A", icon: Star, color: "text-amber-600", bg: "bg-amber-500/10" },
                    ].map(k => (
                      <Card key={k.label} className="border border-border shadow-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", k.bg)}>
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

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Servicios por mes */}
                    <Card className="border border-border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">Solicitudes por Mes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {servicesByMonth.length === 0 ? (
                          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">Sin datos</div>
                        ) : (
                          <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={servicesByMonth} barSize={20}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                              <Bar dataKey="total" name="Total" fill="#2e5cb8" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="completados" name="Completados" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </CardContent>
                    </Card>

                    {/* Distribución por estado */}
                    <Card className="border border-border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">Estado de Solicitudes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {statusBreakdown.length === 0 ? (
                          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">Sin datos</div>
                        ) : (
                          <div className="flex items-center gap-6">
                            <ResponsiveContainer width={150} height={150}>
                              <PieChart>
                                <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                                  {statusBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 flex-1">
                              {statusBreakdown.map(s => (
                                <div key={s.name} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                                    <span className="text-sm text-muted-foreground">{s.name}</span>
                                  </div>
                                  <span className="text-sm font-semibold text-foreground">{s.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Tipo de servicio */}
                    <Card className="border border-border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">Tipos de Servicio</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {byType.length === 0 ? (
                          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">Sin datos</div>
                        ) : (
                          <div className="space-y-2.5">
                            {byType.sort((a, b) => b.value - a.value).map((t, i) => (
                              <div key={t.name} className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground w-24 truncate">{t.name}</span>
                                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${(t.value / myOrders.length) * 100}%`, background: COLORS[i % COLORS.length] }} />
                                </div>
                                <span className="text-xs font-semibold text-foreground w-4 text-right">{t.value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Gasto mensual */}
                    <Card className="border border-border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">Gasto Mensual</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {servicesByMonth.length === 0 ? (
                          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">Sin datos</div>
                        ) : (
                          <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={servicesByMonth}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v.toLocaleString()}`} />
                              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`$${v.toLocaleString()}`, "Gasto"]} />
                              <Line type="monotone" dataKey="monto" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )
            })()
          ) : tab === "presupuestos" ? (
            /* ─── Presupuestos tab ─── */
            <div className="space-y-4">
              {budgets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <FileText className="h-10 w-10 mb-3 opacity-30" />
                  <p className="text-sm">No hay presupuestos enviados</p>
                </div>
              ) : (
                budgets.map((b) => {
                  const statusColors: Record<string, string> = {
                    enviado:     'bg-blue-100 text-blue-700 border-blue-300',
                    en_revision: 'bg-amber-100 text-amber-700 border-amber-300',
                    aceptado:    'bg-emerald-100 text-emerald-700 border-emerald-300',
                    devuelto:    'bg-orange-100 text-orange-700 border-orange-300',
                    rechazado:   'bg-red-100 text-red-700 border-red-300',
                  }
                  const statusLabels: Record<string, string> = {
                    enviado: 'Enviado', en_revision: 'En Revisión',
                    aceptado: 'Aceptado', devuelto: 'Devuelto', rechazado: 'Rechazado',
                  }
                  return (
                    <Card key={b.id} className="border border-border shadow-sm">
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono font-semibold text-foreground text-sm">{b.numero}</span>
                              <span className={cn("text-[10px] border rounded-full px-2 py-0.5 font-medium", statusColors[b.status] || 'bg-gray-100 text-gray-700 border-gray-300')}>
                                {statusLabels[b.status] || b.status}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Rubro: {b.rubro} · Fecha: {new Date(b.fecha).toLocaleDateString('es-ES')} · Vigencia: {b.vigencia}
                            </p>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground uppercase font-medium">Total</p>
                              <p className="text-xl font-bold text-foreground">
                                {b.currency === 'USD' ? '$' : b.currency === 'VES' ? 'Bs.' : '₲'} {Number(b.total).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                            <Button size="sm" variant="outline" className="gap-1.5 text-xs shrink-0" onClick={() => handleViewBudget(b.id)}>
                              <FileText className="h-3.5 w-3.5" />
                              Ver detalle
                            </Button>
                          </div>
                        </div>

                        {b.status === 'enviado' && (
                          <div className="space-y-3 pt-2 border-t border-border">
                            <Textarea
                              placeholder="Escribir comentario o ajuste solicitado…"
                              value={budgetComments[b.id] || ''}
                              onChange={(e) => setBudgetComments((prev) => ({ ...prev, [b.id]: e.target.value }))}
                              rows={2}
                              className="text-sm resize-none"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 text-xs border-blue-400 text-blue-600 hover:bg-blue-50"
                                disabled={!budgetComments[b.id]?.trim() || budgetCommentSending[b.id]}
                                onClick={() => handleSendComment(b.id)}
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                                {budgetCommentSending[b.id] ? 'Enviando…' : 'Enviar comentario'}
                              </Button>
                              <Button
                                size="sm"
                                className="gap-1.5 text-xs"
                                onClick={() => handleAcceptBudget(b.id)}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Aceptar presupuesto
                              </Button>
                            </div>
                          </div>
                        )}
                        {b.status === 'aceptado' && (
                          <div className="flex items-center gap-2 text-emerald-600 text-sm pt-2 border-t border-border">
                            <CheckCircle2 className="h-4 w-4" />
                            Presupuesto aceptado. Nos pondremos en contacto para coordinar el trabajo.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })
              )}
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
                      <p className="text-lg font-bold">{myOrders.length}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-border shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pendientes</p>
                      <p className="text-lg font-bold">{pendingOrders.length}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-border shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Completados</p>
                      <p className="text-lg font-bold">{completedOrders.length}</p>
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
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Dirección</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Estado</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Prioridad</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {myOrders.map((o) => {
                        const st = statusMap[o.status === "completada" ? "completado" : o.status === "cancelada" ? "cancelado" : "pendiente"] ?? statusMap.pendiente
                        const prioridad = { alta: "text-destructive", urgente: "text-destructive", normal: "text-muted-foreground", baja: "text-muted-foreground" }
                        return (
                          <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{o.orderId}</td>
                            <td className="px-4 py-3 text-muted-foreground">{o.type}</td>
                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{o.scheduledDate}</td>
                            <td className="px-4 py-3 text-muted-foreground truncate max-w-[160px]">{o.address}</td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className={cn("text-[10px]", st.color)}>{st.label}</Badge>
                            </td>
                            <td className={cn("px-4 py-3 text-xs capitalize", prioridad[o.priority] ?? "text-muted-foreground")}>
                              {o.priority}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {myOrders.length === 0 && (
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

      {/* ── Budget detail dialog ── */}
      <Dialog open={!!viewingBudget || viewingBudgetLoading} onOpenChange={(open) => { if (!open) setViewingBudget(null) }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <DialogTitle className="sr-only">Detalle del presupuesto</DialogTitle>
          {viewingBudgetLoading && (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Cargando…</div>
          )}
          {viewingBudget && (() => {
            const b = viewingBudget
            const sym = b.currency === 'VES' ? 'Bs.' : b.currency === 'PYG' ? '₲' : '$'
            const sections: Array<{ key: string; label: string }> = [
              { key: 'equipos', label: 'Equipos' },
              { key: 'materiales', label: 'Materiales' },
              { key: 'mano_de_obra', label: 'Mano de Obra' },
            ]
            const allSections = b.sections || {}
            const taxRate = Number(b.tax_rate ?? 0)
            const subtotal = Number(b.total) / (1 + taxRate / 100)
            const taxAmt = Number(b.total) - subtotal

            return (
              <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">Presupuesto</p>
                    <h2 className="text-xl font-bold font-mono text-foreground">{b.numero}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Rubro: {b.rubro} · Fecha: {new Date(b.fecha).toLocaleDateString('es-ES')} · Vigencia: {b.vigencia}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Total</p>
                    <p className="text-2xl font-bold text-foreground">{sym} {Number(b.total).toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>

                {/* Company / client info */}
                {b.company_data && (b.company_data.name || b.company_data.address) && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Cliente</p>
                      <p className="font-medium text-foreground">{b.company_data.name}</p>
                      {b.company_data.rif && <p className="text-muted-foreground">RIF: {b.company_data.rif}</p>}
                      {b.company_data.address && <p className="text-muted-foreground">{b.company_data.address}</p>}
                      {b.company_data.phone && <p className="text-muted-foreground">{b.company_data.phone}</p>}
                    </div>
                    {b.conditions && (b.conditions.payment || b.conditions.warranty || b.conditions.notes) && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Condiciones</p>
                        {b.conditions.payment && <p className="text-muted-foreground">Pago: {b.conditions.payment}</p>}
                        {b.conditions.warranty && <p className="text-muted-foreground">Garantía: {b.conditions.warranty}</p>}
                        {b.conditions.notes && <p className="text-muted-foreground">{b.conditions.notes}</p>}
                      </div>
                    )}
                  </div>
                )}

                {/* Sections */}
                {sections.map(({ key, label }) => {
                  const items: any[] = allSections[key] || []
                  if (items.length === 0) return null
                  const sectionTotal = items.reduce((s: number, i: any) => s + ((Number(i.qty ?? i.quantity) || 0) * (Number(i.price) || 0)), 0)
                  return (
                    <div key={key}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{label}</p>
                      <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted/40 border-b border-border">
                              <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Descripción</th>
                              <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Unid.</th>
                              <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Cant.</th>
                              <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">P. Unit.</th>
                              <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {items.map((item: any, idx: number) => {
                              const desc = item.desc || item.description || ''
                              const qty = Number(item.qty ?? item.quantity) || 0
                              const price = Number(item.price) || 0
                              return (
                              <tr key={idx} className="hover:bg-muted/20">
                                <td className="px-3 py-2 text-foreground">{desc || <span className="text-muted-foreground/40 italic">—</span>}</td>
                                <td className="px-3 py-2 text-center text-muted-foreground">{item.unit || '—'}</td>
                                <td className="px-3 py-2 text-right text-muted-foreground">{qty}</td>
                                <td className="px-3 py-2 text-right text-muted-foreground">{sym} {price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                                <td className="px-3 py-2 text-right font-medium text-foreground">{sym} {(qty * price).toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                              </tr>
                              )
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="bg-muted/30 border-t border-border">
                              <td colSpan={4} className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Subtotal {label}</td>
                              <td className="px-3 py-2 text-right font-semibold text-foreground">{sym} {sectionTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )
                })}

                {/* Totals */}
                <div className="flex justify-end pt-2 border-t border-border">
                  <div className="space-y-1 text-sm min-w-[220px]">
                    {taxRate > 0 && (
                      <>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Subtotal</span>
                          <span>{sym} {subtotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>IVA ({taxRate}%)</span>
                          <span>{sym} {taxAmt.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between font-bold text-base text-foreground pt-1 border-t border-border">
                      <span>TOTAL</span>
                      <span>{sym} {Number(b.total).toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>

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
                  {customerAssets.length > 0 ? (
                    <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Seleccioná un equipo..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="otro">Otro / No listado</SelectItem>
                        {customerAssets.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name} — {a.asset_id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input className="h-9" placeholder="Ej: HVAC Piso 3, Caldera Principal..." />
                  )}
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
