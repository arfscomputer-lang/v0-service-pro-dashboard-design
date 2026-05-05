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
  ChevronLeft,
  ChevronRight,
  MapPin,
  Wrench,
  User,
  FileText,
  CalendarCheck,
  Filter,
  RefreshCw,
  X,
  LayoutList,
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
type ViewMode = "lista" | "calendario"

interface Occurrence {
  id: string
  asset_id: string
  scheduled_date: string
  status: string
  work_order_id: string | null
  completed_at: string | null
  notes: string | null
  asset_code: string
  asset_name: string
  customer_id: string
  customer_name: string
}

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
  planned_date: string
  asset_id_selected: string
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
    color: "text-destructive",
    bg: "bg-destructive/5",
    border: "border-destructive/20",
    badge: "bg-destructive/10 text-destructive",
    icon: AlertTriangle,
    hex: "#ef4444",
  },
  proximo: {
    label: "Proximo",
    color: "text-amber-600",
    bg: "bg-amber-500/5",
    border: "border-amber-500/20",
    badge: "bg-amber-500/10 text-amber-700",
    icon: Clock,
    hex: "#f59e0b",
  },
  al_dia: {
    label: "Al dia",
    color: "text-emerald-600",
    bg: "bg-emerald-500/5",
    border: "border-emerald-500/20",
    badge: "bg-emerald-500/10 text-emerald-700",
    icon: CheckCircle2,
    hex: "#10b981",
  },
  sin_plan: {
    label: "Sin plan",
    color: "text-muted-foreground",
    bg: "bg-muted/50",
    border: "border-border",
    badge: "bg-muted text-muted-foreground",
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
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      className={cn(
        "w-full text-left rounded-lg border p-3 transition-all cursor-pointer",
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
    </div>
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
                      h.status === "completada" ? "bg-emerald-500" : "bg-muted-foreground/40"
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
  planned_date: "",
  asset_id_selected: "",
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
  const [allAssets, setAllAssets] = useState<PlanDeMantenimiento[]>([])
  const [loadingAssets, setLoadingAssets] = useState(false)
  const [form, setForm] = useState<CompleteFormData>({
    completed_date: new Date().toISOString().split("T")[0],
    technician_name: "",
    notes: "",
    was_overdue: plan.maintenance_status === "vencido",
    planned_date: plan.next_maintenance_date || "",
    asset_id_selected: plan.id,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load all assets with maintenance plans on mount
  useEffect(() => {
    async function loadAssets() {
      setLoadingAssets(true)
      try {
        const res = await fetch(`/api/maintenance/plans?customer_id=${plan.customer_id}`)
        const data = await res.json()
        if (data.plans) {
          setAllAssets(data.plans)
        }
      } catch (err) {
        console.error("Error loading assets:", err)
      } finally {
        setLoadingAssets(false)
      }
    }
    loadAssets()
  }, [plan.customer_id])

  // Update planned_date when asset selection changes
  const handleAssetChange = (assetInternalId: string) => {
    const selectedAsset = allAssets.find((a) => a.id === assetInternalId)
    if (selectedAsset) {
      setForm({
        ...form,
        asset_id_selected: assetInternalId,
        planned_date: selectedAsset.next_maintenance_date || "",
      })
    }
  }

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
              <Label htmlFor="asset_id">Activo *</Label>
              <Select value={form.asset_id_selected} onValueChange={handleAssetChange} disabled={loadingAssets}>
                <SelectTrigger id="asset_id">
                  <SelectValue placeholder="Seleccionar activo..." />
                </SelectTrigger>
                <SelectContent>
                  {allAssets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name} ({asset.asset_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="planned_date">Fecha Planeada</Label>
              <Input
                id="planned_date"
                type="date"
                value={form.planned_date}
                disabled
                className="bg-muted text-muted-foreground"
              />
              {form.planned_date && (
                <p className="text-xs text-gray-500">
                  Próximo mantenimiento programado
                </p>
              )}
            </div>
          </div>
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
// CALENDARIO VIEW
// ============================================================

function getOccColor(occ: Occurrence, today: Date): string {
  if (occ.status === "completada") return "bg-emerald-500"
  const d = new Date(occ.scheduled_date)
  d.setHours(0, 0, 0, 0)
  if (d < today) return "bg-destructive"
  const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff <= 7) return "bg-amber-500"
  return "bg-blue-400"
}

function CalendarioView({
  occurrences,
  loading,
  year,
  month,
  onMonthChange,
}: {
  occurrences: Occurrence[]
  loading: boolean
  year: number
  month: number
  onMonthChange: (year: number, month: number) => void
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const byDate = useMemo(() => {
    const map: Record<string, Occurrence[]> = {}
    occurrences.forEach((occ) => {
      const d = occ.scheduled_date.slice(0, 10)
      if (!map[d]) map[d] = []
      map[d].push(occ)
    })
    return map
  }, [occurrences])

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDow = (firstDay.getDay() + 6) % 7 // Mon=0
    const result: (Date | null)[] = Array(startDow).fill(null)
    for (let d = 1; d <= lastDay.getDate(); d++) result.push(new Date(year, month, d))
    return result
  }, [year, month])

  const selectedOccs = selectedDate ? (byDate[selectedDate] ?? []) : []

  function prevMonth() {
    if (month === 0) onMonthChange(year - 1, 11)
    else onMonthChange(year, month - 1)
  }
  function nextMonth() {
    if (month === 11) onMonthChange(year + 1, 0)
    else onMonthChange(year, month + 1)
  }

  const monthLabel = new Date(year, month, 1).toLocaleDateString("es-ES", { month: "long", year: "numeric" })

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1 min-w-0">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold capitalize">{monthLabel}</span>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-[60px] rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, i) => {
              if (!date) return <div key={`e-${i}`} />
              const dateStr = date.toISOString().slice(0, 10)
              const occs = byDate[dateStr] ?? []
              const isToday = date.getTime() === today.getTime()
              const isSelected = selectedDate === dateStr

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={cn(
                    "min-h-[60px] rounded-lg border p-1.5 text-left transition-colors hover:bg-muted/50",
                    isToday && "border-primary/50 bg-primary/5",
                    isSelected && "border-primary bg-primary/10 shadow-sm",
                    !isToday && !isSelected && "border-border"
                  )}
                >
                  <span className={cn(
                    "text-xs font-medium block mb-1",
                    isToday ? "text-primary font-bold" : "text-muted-foreground"
                  )}>
                    {date.getDate()}
                  </span>
                  <div className="flex flex-wrap gap-0.5">
                    {occs.slice(0, 4).map((occ) => (
                      <span key={occ.id} className={cn("h-2 w-2 rounded-full", getOccColor(occ, today))} />
                    ))}
                    {occs.length > 4 && (
                      <span className="text-[9px] text-muted-foreground leading-none">+{occs.length - 4}</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-destructive" />Vencido</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />Próximo 7 días</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-400" />Programado</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Completado</span>
        </div>
      </div>

      {/* Day detail panel */}
      <div className="w-72 shrink-0">
        {selectedDate ? (
          <div>
            <h3 className="text-sm font-semibold mb-3 capitalize">
              {new Date(selectedDate + "T12:00:00").toLocaleDateString("es-ES", {
                weekday: "long", day: "numeric", month: "long",
              })}
            </h3>
            {selectedOccs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin mantenimientos programados</p>
            ) : (
              <div className="space-y-2">
                {selectedOccs.map((occ) => (
                  <div key={occ.id} className="rounded-lg border bg-card p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", getOccColor(occ, today))} />
                      <span className="text-sm font-medium leading-tight line-clamp-1">{occ.asset_name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{occ.asset_code} &bull; {occ.customer_name}</p>
                    {occ.status === "completada" && (
                      <Badge className="mt-2 text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                        Completada
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-52 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground/20 mb-2" />
            <p className="text-sm text-muted-foreground">Seleccioná un día para ver los mantenimientos programados</p>
          </div>
        )}
      </div>
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
  const [viewMode, setViewMode] = useState<ViewMode>("lista")
  const [occurrences, setOccurrences] = useState<Occurrence[]>([])
  const [occLoading, setOccLoading] = useState(false)
  const [calYear, setCalYear] = useState(() => new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth())

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

  // Load occurrences when calendar view is active
  useEffect(() => {
    if (viewMode !== "calendario") return
    setOccLoading(true)
    const from = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-01`
    const lastDay = new Date(calYear, calMonth + 1, 0).getDate()
    const to = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`
    const params = new URLSearchParams({ from, to })
    if (selectedCustomerId !== "todos") params.set("customer_id", selectedCustomerId)
    fetch(`/api/maintenance/occurrences?${params}`)
      .then((r) => r.json())
      .then((d) => setOccurrences(d.occurrences ?? []))
      .catch(() => setOccurrences([]))
      .finally(() => setOccLoading(false))
  }, [viewMode, calYear, calMonth, selectedCustomerId])

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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Planes de Mantenimiento</h1>
          <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setViewMode("lista")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                viewMode === "lista" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutList className="h-3.5 w-3.5" />
              Lista
            </button>
            <button
              type="button"
              onClick={() => setViewMode("calendario")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                viewMode === "calendario" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
              Calendario
            </button>
          </div>
        </div>

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

      {/* ── Calendario view ────────────────────────────────── */}
      {viewMode === "calendario" && (
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <CalendarioView
            occurrences={occurrences}
            loading={occLoading}
            year={calYear}
            month={calMonth}
            onMonthChange={(y, m) => { setCalYear(y); setCalMonth(m) }}
          />
        </div>
      )}

      {/* ── Main two-column layout ──────────────────────────── */}
      {viewMode === "lista" && <div className="flex flex-1 overflow-hidden">
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
      </div>}

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
