"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { TopHeader } from "@/components/dashboard/top-header"
import {
  Calendar,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  MapPin,
  Wrench,
  User,
  FileText,
  CalendarCheck,
  Filter,
  RefreshCw,
  X,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

// ============================================================
// TYPES
// ============================================================

type MaintenanceStatus = "vencido" | "proximo" | "al_dia" | "sin_plan"
type QuickFilter = "todos" | "vencido" | "proximo_15"

interface PlanDeMantenimiento {
  id: string
  asset_id: string
  name: string
  brand: string
  model: string
  site_location: string | null
  customer_id: string
  customer_name: string
  recurrence_type: string | null
  interval_months: number | null
  last_maintenance_date: string | null
  next_maintenance_date: string | null
  has_maintenance_plan: boolean
  created_at: string
  maintenance_status: MaintenanceStatus
  days_until: number | null
}

interface HistorialEjecucion {
  id: string
  order_id: string
  status: string
  scheduled_date: string | null
  completed_date: string | null
  description: string
  notes: string | null
  created_at: string
  technician_name: string | null
}

interface Summary {
  total: number
  vencido: number
  proximo: number
  al_dia: number
  cumplimiento: number
}

interface CompleteFormData {
  completed_date: string
  technician_name: string
  notes: string
  was_overdue: boolean
}

interface Customer {
  id: string
  name: string
}

// ============================================================
// HELPERS
// ============================================================

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "No definida"
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatDateLabel(days: number | null, status: MaintenanceStatus): string {
  if (days === null) return "Sin fecha"
  if (status === "vencido") return `Vencido hace ${Math.abs(days)} día${Math.abs(days) !== 1 ? "s" : ""}`
  if (days === 0) return "Vence hoy"
  return `En ${days} día${days !== 1 ? "s" : ""}`
}

function recurrenceLabel(type: string | null, months: number | null): string {
  if (!type) return "Sin recurrencia"
  const labels: Record<string, string> = {
    mensual: "Mensual",
    trimestral: "Trimestral",
    semestral: "Semestral",
    anual: "Anual",
    por_uso: "Por uso",
    mixta: "Mixta",
  }
  const base = labels[type] ?? type
  if (months && !["mensual", "trimestral", "semestral", "anual"].includes(type)) {
    return `${base} (${months} meses)`
  }
  return base
}

const STATUS_CONFIG = {
  vencido: {
    label: "Vencido",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700",
    icon: AlertTriangle,
    hex: "#ef4444",
  },
  proximo: {
    label: "Proximo",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    icon: Clock,
    hex: "#f59e0b",
  },
  al_dia: {
    label: "Al dia",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle2,
    hex: "#10b981",
  },
  sin_plan: {
    label: "Sin plan",
    color: "text-gray-500",
    bg: "bg-gray-50",
    border: "border-gray-200",
    badge: "bg-gray-100 text-gray-600",
    icon: FileText,
    hex: "#6b7280",
  },
}

// ============================================================
// SPARKLINE COMPONENT
// ============================================================

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null
  const max = Math.max(...data, 1)
  const w = 200
  const h = 40
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - (v / max) * (h - 6) - 3
    return `${x},${y}`
  })
  const path = `M ${pts.join(" L ")}`
  const fill = `M ${pts[0]} L ${pts.join(" L ")} L ${w},${h} L 0,${h} Z`

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <path d={fill} fill="#10b981" fillOpacity={0.1} />
      <path d={path} fill="none" stroke="#10b981" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => (
        <circle
          key={i}
          cx={(i / (data.length - 1)) * w}
          cy={h - (v / max) * (h - 6) - 3}
          r={3}
          fill="#10b981"
        />
      ))}
    </svg>
  )
}

// ============================================================
// KPI CARD
// ============================================================

function KpiCard({
  title,
  value,
  sub,
  color,
  loading,
}: {
  title: string
  value: string | number
  sub?: string
  color: string
  loading?: boolean
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-4 pb-4">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{title}</p>
        <p className={cn("text-2xl font-bold", color)}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  )
}

// ============================================================
// ASSET CARD (list item)
// ============================================================

function AssetCard({
  plan,
  selected,
  onClick,
  onComplete,
}: {
  plan: PlanDeMantenimiento
  selected: boolean
  onClick: () => void
  onComplete: (plan: PlanDeMantenimiento) => void
}) {
  const cfg = STATUS_CONFIG[plan.maintenance_status]
  const Icon = cfg.icon

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg border p-3 transition-all",
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border hover:border-primary/40 hover:bg-muted/40"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-sm font-semibold leading-tight line-clamp-1">{plan.name}</span>
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap shrink-0", cfg.badge)}>
          <Icon className="h-3 w-3" />
          {cfg.label}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-1">{plan.asset_id} &bull; {plan.customer_name}</p>
      <p className={cn("text-xs font-medium", cfg.color)}>
        {formatDateLabel(plan.days_until, plan.maintenance_status)}
      </p>
      {plan.maintenance_status !== "al_dia" && plan.maintenance_status !== "sin_plan" && (
        <div className="mt-2 flex justify-end">
          <Button
            size="sm"
            variant="default"
            className="h-6 px-2 text-[11px]"
            onClick={(e) => {
              e.stopPropagation()
              onComplete(plan)
            }}
          >
            Completar
          </Button>
        </div>
      )}
    </button>
  )
}

// ============================================================
// GROUP SECTION
// ============================================================

function GroupSection({
  status,
  plans,
  selectedId,
  onSelect,
  onComplete,
}: {
  status: MaintenanceStatus
  plans: PlanDeMantenimiento[]
  selectedId: string | null
  onSelect: (plan: PlanDeMantenimiento) => void
  onComplete: (plan: PlanDeMantenimiento) => void
}) {
  const [open, setOpen] = useState(true)
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.icon

  if (plans.length === 0) return null

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg px-3 py-2 mb-1",
          cfg.bg
        )}
      >
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", cfg.color)} />
          <span className={cn("text-sm font-semibold", cfg.color)}>{cfg.label}</span>
          <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", cfg.badge)}>
            {plans.length}
          </span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="space-y-2 pl-1">
          {plans.map((p) => (
            <AssetCard
              key={p.id}
              plan={p}
              selected={selectedId === p.id}
              onClick={() => onSelect(p)}
              onComplete={onComplete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// DETAIL PANEL
// ============================================================

function DetailPanel({
  plan,
  history,
  historyLoading,
  onComplete,
}: {
  plan: PlanDeMantenimiento
  history: HistorialEjecucion[]
  historyLoading: boolean
  onComplete: (plan: PlanDeMantenimiento) => void
}) {
  const cfg = STATUS_CONFIG[plan.maintenance_status]
  const Icon = cfg.icon

  // Build sparkline: 12 months of completed executions
  const sparkData = useMemo(() => {
    const now = new Date()
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })
    return months.map(({ y, m }) =>
      history.filter((h) => {
        if (!h.completed_date) return false
        const d = new Date(h.completed_date)
        return d.getFullYear() === y && d.getMonth() === m
      }).length
    )
  }, [history])

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{plan.asset_id}</p>
            </div>
            <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold", cfg.badge)}>
              <Icon className="h-4 w-4" />
              {cfg.label}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Cliente</p>
                <p className="font-medium">{plan.customer_name}</p>
              </div>
            </div>
            {plan.site_location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Ubicacion</p>
                  <p className="font-medium">{plan.site_location}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Frecuencia</p>
                <p className="font-medium">{recurrenceLabel(plan.recurrence_type, plan.interval_months)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Proxima fecha</p>
                <p className={cn("font-medium", cfg.color)}>{formatDate(plan.next_maintenance_date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Ultima ejecucion</p>
                <p className="font-medium">{formatDate(plan.last_maintenance_date)}</p>
              </div>
            </div>
            {plan.brand && (
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Equipo</p>
                  <p className="font-medium">{plan.brand} {plan.model}</p>
                </div>
              </div>
            )}
          </div>
          {plan.maintenance_status !== "al_dia" && plan.maintenance_status !== "sin_plan" && (
            <Button className="mt-4 w-full" onClick={() => onComplete(plan)}>
              Registrar Ejecucion
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Sparkline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Cumplimiento ultimos 12 meses</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {historyLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div className="flex items-end gap-3">
              <Sparkline data={sparkData} />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {sparkData.filter(Boolean).length} ejecuciones
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Historial de ejecuciones</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {historyLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : history.length === 0 ? (
            <div className="py-8 text-center">
              <CalendarCheck className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Sin ejecuciones registradas</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-4 pl-8">
                {history.map((h) => (
                  <div key={h.id} className="relative">
                    <div className={cn(
                      "absolute -left-5 top-1 h-3 w-3 rounded-full border-2 border-background",
                      h.status === "completada" ? "bg-emerald-500" : "bg-gray-400"
                    )} />
                    <div className="rounded-lg border bg-card p-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {h.completed_date ? formatDate(h.completed_date) : formatDate(h.scheduled_date)}
                        </span>
                        <Badge variant="outline" className="text-[11px]">
                          {h.order_id}
                        </Badge>
                      </div>
                      {h.technician_name && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" /> {h.technician_name}
                        </p>
                      )}
                      {h.notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{h.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// COMPLETE MODAL
// ============================================================

const EMPTY_FORM: CompleteFormData = {
  completed_date: new Date().toISOString().split("T")[0],
  technician_name: "",
  notes: "",
  was_overdue: false,
}

function CompleteModal({
  plan,
  onClose,
  onSuccess,
}: {
  plan: PlanDeMantenimiento
  onClose: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState<CompleteFormData>({
    ...EMPTY_FORM,
    was_overdue: plan.maintenance_status === "vencido",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.completed_date) {
      setError("La fecha de ejecucion es obligatoria")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/maintenance/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_id: plan.asset_id,
          asset_internal_id: plan.id,
          customer_id: plan.customer_id,
          asset_name: plan.name,
          completed_date: form.completed_date,
          technician_name: form.technician_name,
          notes: form.notes,
          was_overdue: form.was_overdue,
          recurrence_type: plan.recurrence_type,
          interval_months: plan.interval_months,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al registrar")
      onSuccess()
    } catch (err: any) {
      setError(String(err.message))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar Ejecucion de Mantenimiento</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {plan.name} &bull; {plan.asset_id}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="completed_date">Fecha de ejecucion *</Label>
              <Input
                id="completed_date"
                type="date"
                value={form.completed_date}
                onChange={(e) => setForm({ ...form, completed_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="technician_name">Tecnico / Responsable</Label>
              <Input
                id="technician_name"
                placeholder="Nombre del tecnico"
                value={form.technician_name}
                onChange={(e) => setForm({ ...form, technician_name: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Observaciones</Label>
            <Textarea
              id="notes"
              placeholder="Descripcion del trabajo realizado, repuestos usados, condiciones del equipo..."
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <input
              type="checkbox"
              id="was_overdue"
              checked={form.was_overdue}
              onChange={(e) => setForm({ ...form, was_overdue: e.target.checked })}
              className="h-4 w-4 rounded"
            />
            <Label htmlFor="was_overdue" className="cursor-pointer text-amber-700 font-medium">
              Ejecucion fuera de fecha programada
            </Label>
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Registrando..." : "Registrar Ejecucion"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <CalendarCheck className="h-12 w-12 text-muted-foreground/25 mb-3" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function MantenimientoPage() {
  const [plans, setPlans] = useState<PlanDeMantenimiento[]>([])
  const [summary, setSummary] = useState<Summary>({ total: 0, vencido: 0, proximo: 0, al_dia: 0, cumplimiento: 0 })
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("todos")
  const [search, setSearch] = useState("")
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("todos")
  const [selectedPlan, setSelectedPlan] = useState<PlanDeMantenimiento | null>(null)
  const [history, setHistory] = useState<HistorialEjecucion[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [completingPlan, setCompletingPlan] = useState<PlanDeMantenimiento | null>(null)
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)

  // Load customers
  useEffect(() => {
    fetch("/api/customers")
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers ?? []))
      .catch(() => {})
  }, [])

  // Load plans
  const loadPlans = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCustomerId !== "todos") params.set("customer_id", selectedCustomerId)
      if (search.trim()) params.set("search", search.trim())
      const res = await fetch(`/api/maintenance/plans?${params}`)
      const data = await res.json()
      setPlans(data.plans ?? [])
      setSummary(data.summary ?? { total: 0, vencido: 0, proximo: 0, al_dia: 0, cumplimiento: 0 })
    } catch {
      setPlans([])
    } finally {
      setLoading(false)
    }
  }, [selectedCustomerId, search])

  useEffect(() => {
    loadPlans()
  }, [loadPlans])

  // Load history when plan is selected
  useEffect(() => {
    if (!selectedPlan) return
    setHistory([])
    setHistoryLoading(true)
    fetch(`/api/maintenance/history/${selectedPlan.asset_id}`)
      .then((r) => r.json())
      .then((d) => setHistory(d.history ?? []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false))
  }, [selectedPlan])

  // Filtered + grouped
  const filtered = useMemo(() => {
    return plans.filter((p) => {
      if (quickFilter === "vencido") return p.maintenance_status === "vencido"
      if (quickFilter === "proximo_15") {
        return (
          p.maintenance_status === "proximo" ||
          (p.maintenance_status === "vencido") ||
          (p.days_until !== null && p.days_until <= 15)
        )
      }
      return true
    })
  }, [plans, quickFilter])

  const groups = useMemo(() => ({
    vencido: filtered.filter((p) => p.maintenance_status === "vencido"),
    proximo: filtered.filter((p) => p.maintenance_status === "proximo"),
    al_dia: filtered.filter((p) => p.maintenance_status === "al_dia"),
  }), [filtered])

  function handleSelectPlan(plan: PlanDeMantenimiento) {
    setSelectedPlan(plan)
    setMobileDetailOpen(true)
  }

  function handleComplete(plan: PlanDeMantenimiento) {
    setCompletingPlan(plan)
  }

  function handleCompleteSuccess() {
    setCompletingPlan(null)
    loadPlans()
    if (selectedPlan) {
      // Refresh history
      setHistoryLoading(true)
      fetch(`/api/maintenance/history/${selectedPlan.asset_id}`)
        .then((r) => r.json())
        .then((d) => setHistory(d.history ?? []))
        .catch(() => {})
        .finally(() => setHistoryLoading(false))
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />
        <div className="flex flex-col flex-1 overflow-hidden bg-background">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="border-b bg-card px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight mb-4">Planes de Mantenimiento</h1>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <KpiCard
            title="Total planes activos"
            value={summary.total}
            color="text-foreground"
            loading={loading}
          />
          <KpiCard
            title="Vencidos"
            value={summary.vencido}
            color="text-red-600"
            sub={summary.vencido > 0 ? "Requieren atencion inmediata" : "Ninguno vencido"}
            loading={loading}
          />
          <KpiCard
            title="Proximos 30 dias"
            value={summary.proximo}
            color="text-amber-600"
            sub="Programar visita"
            loading={loading}
          />
          <KpiCard
            title="Cumplimiento mes"
            value={`${summary.cumplimiento}%`}
            color={summary.cumplimiento >= 80 ? "text-emerald-600" : summary.cumplimiento >= 50 ? "text-amber-600" : "text-red-600"}
            loading={loading}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={selectedCustomerId}
            onValueChange={(v) => setSelectedCustomerId(v)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos los clientes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los clientes</SelectItem>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o codigo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
            {(["todos", "vencido", "proximo_15"] as QuickFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setQuickFilter(f)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  quickFilter === f
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f === "todos" ? "Todos" : f === "vencido" ? "Solo Vencidos" : "Proximos 15 dias"}
              </button>
            ))}
          </div>

          <Button variant="outline" size="icon" onClick={loadPlans} title="Actualizar">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Main two-column layout ──────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT — Asset list */}
        <aside className="w-full md:w-[34%] border-r overflow-y-auto px-4 py-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState message="No hay activos con plan de mantenimiento para los filtros seleccionados." />
          ) : (
            <>
              <GroupSection
                status="vencido"
                plans={groups.vencido}
                selectedId={selectedPlan?.id ?? null}
                onSelect={handleSelectPlan}
                onComplete={handleComplete}
              />
              <GroupSection
                status="proximo"
                plans={groups.proximo}
                selectedId={selectedPlan?.id ?? null}
                onSelect={handleSelectPlan}
                onComplete={handleComplete}
              />
              <GroupSection
                status="al_dia"
                plans={groups.al_dia}
                selectedId={selectedPlan?.id ?? null}
                onSelect={handleSelectPlan}
                onComplete={handleComplete}
              />
            </>
          )}
        </aside>

        {/* RIGHT — Detail panel (desktop) */}
        <main className="hidden md:block flex-1 overflow-y-auto px-6 py-4">
          {!selectedPlan ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Filter className="h-16 w-16 text-muted-foreground/20 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">Selecciona un activo</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                Haz clic en cualquier activo de la izquierda para ver su detalle e historial
              </p>
            </div>
          ) : (
            <DetailPanel
              plan={selectedPlan}
              history={history}
              historyLoading={historyLoading}
              onComplete={handleComplete}
            />
          )}
        </main>
      </div>

      {/* Mobile bottom sheet (detail) */}
      <Sheet open={mobileDetailOpen} onOpenChange={setMobileDetailOpen}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>{selectedPlan?.name}</SheetTitle>
          </SheetHeader>
          {selectedPlan && (
            <DetailPanel
              plan={selectedPlan}
              history={history}
              historyLoading={historyLoading}
              onComplete={handleComplete}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Complete modal */}
      {completingPlan && (
        <CompleteModal
          plan={completingPlan}
          onClose={() => setCompletingPlan(null)}
          onSuccess={handleCompleteSuccess}
        />
      )}
        </div>
      </div>
    </div>
  )
}
