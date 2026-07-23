'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SidebarNav } from '@/components/dashboard/sidebar-nav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  Plus,
  Search,
  Eye,
  Trash2,
  Send,
  ChevronRight,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { RUBROS } from '@/lib/rubro-kits'

interface Budget {
  id: string
  numero: string
  rubro: string
  status: string
  customer_name: string | null
  total: number
  currency: string
  fecha: string
  created_at: string
}

const STATUS_CONFIG: Record<string, { label: string; className: string; rowClass?: string; pulse?: boolean }> = {
  borrador:    { label: 'Borrador',    className: 'bg-gray-100 text-gray-600 border-gray-200' },
  enviado:     { label: 'Enviado',     className: 'bg-blue-100 text-blue-700 border-blue-200' },
  en_revision: { label: 'En Revisión', className: 'bg-amber-100 text-amber-700 border-amber-300', rowClass: 'bg-amber-50/40 border-l-2 border-l-amber-400', pulse: true },
  devuelto:    { label: 'Devuelto',    className: 'bg-orange-100 text-orange-700 border-orange-300', rowClass: 'bg-orange-50/30' },
  aceptado:    { label: 'Aceptado',    className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  rechazado:   { label: 'Rechazado',   className: 'bg-red-100 text-red-700 border-red-200' },
}

function fmt(n: number, currency = 'USD') {
  const rate = currency === 'VES' ? 36.5 : currency === 'PYG' ? 6800 : 1
  const sym = currency === 'VES' ? 'Bs.' : currency === 'PYG' ? '₲' : '$'
  return `${sym} ${(n * rate).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function PresupuestosPage() {
  const router = useRouter()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRubro, setFilterRubro] = useState('todos')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true)
    const params = new URLSearchParams()
    if (filterRubro !== 'todos') params.set('rubro', filterRubro)
    if (filterStatus !== 'todos') params.set('status', filterStatus)
    try {
      const res = await fetch(`/api/budgets?${params}`)
      const { budgets: data } = await res.json()
      setBudgets(data || [])
    } catch {
      if (!opts?.silent) setBudgets([])
    } finally {
      if (!opts?.silent) setLoading(false)
    }
  }, [filterRubro, filterStatus])

  useEffect(() => { load() }, [load])

  // Refresh in the background so status changes made by the client (e.g. accept/reject) show up without a manual reload
  useEffect(() => {
    const interval = setInterval(() => load({ silent: true }), 30_000)
    return () => clearInterval(interval)
  }, [load])

  const handleDelete = async (id: string, numero: string) => {
    if (!confirm(`¿Eliminar el presupuesto ${numero}? Esta acción no se puede deshacer.`)) return
    setDeleting(id)
    await fetch(`/api/budgets/${id}`, { method: 'DELETE' })
    setBudgets((prev) => prev.filter((b) => b.id !== id))
    setDeleting(null)
  }

  const handleSend = async (id: string) => {
    if (!confirm('¿Enviar este presupuesto al cliente? El estado cambiará a "Enviado".')) return
    await fetch(`/api/budgets/${id}/send`, { method: 'POST' })
    setBudgets((prev) => prev.map((b) => b.id === id ? { ...b, status: 'enviado' } : b))
  }

  const filtered = budgets.filter((b) =>
    b.numero.toLowerCase().includes(search.toLowerCase()) ||
    (b.customer_name || '').toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: budgets.length,
    enviado: budgets.filter((b) => b.status === 'enviado').length,
    en_revision: budgets.filter((b) => b.status === 'en_revision').length,
    aceptado: budgets.filter((b) => b.status === 'aceptado').length,
    rechazado: budgets.filter((b) => b.status === 'rechazado').length,
    monthlyTotal: budgets
      .filter((b) => {
        const d = new Date(b.created_at)
        const now = new Date()
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      .reduce((s, b) => s + Number(b.total), 0),
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-card border-b border-border px-6 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Presupuestos</h1>
                <p className="text-xs text-muted-foreground">Gestión de cotizaciones por rubro</p>
              </div>
            </div>
            <Link href="/presupuestos/nuevo">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Presupuesto
              </Button>
            </Link>
          </div>
        </div>

        <div className="px-6 py-6 max-w-7xl mx-auto space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Total',        value: stats.total,       color: 'text-foreground',    border: '' },
              { label: 'Enviados',     value: stats.enviado,     color: 'text-blue-600',      border: 'border-t-2 border-t-blue-400' },
              { label: 'En Revisión',  value: stats.en_revision, color: 'text-amber-600',     border: 'border-t-2 border-t-amber-400', pulse: stats.en_revision > 0 },
              { label: 'Aceptados',    value: stats.aceptado,    color: 'text-emerald-600',   border: 'border-t-2 border-t-emerald-400' },
              { label: 'Rechazados',   value: stats.rechazado,   color: 'text-red-600',       border: 'border-t-2 border-t-red-400' },
              { label: 'Cotizado mes', value: `$${stats.monthlyTotal.toLocaleString('es-ES', { minimumFractionDigits: 0 })}`, color: 'text-primary', border: 'border-t-2 border-t-primary' },
            ].map((k) => (
              <div key={k.label} className={cn('bg-card border border-border rounded-lg p-4 relative overflow-hidden', k.border)}>
                {k.pulse && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                )}
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">{k.label}</p>
                <p className={cn('text-2xl font-bold mt-1', k.color)}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por número o cliente…" className="pl-9" />
            </div>
            <Select value={filterRubro} onValueChange={setFilterRubro}>
              <SelectTrigger className="w-44">
                <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los rubros</SelectItem>
                {RUBROS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Nº</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Rubro</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Fecha</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-muted animate-pulse rounded" /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No hay presupuestos{search ? ' que coincidan con la búsqueda' : ''}</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => {
                    const st = STATUS_CONFIG[b.status] || STATUS_CONFIG.borrador
                    return (
                      <tr key={b.id} className={cn('hover:bg-muted/20 transition-colors', st.rowClass)}>
                        <td className="px-4 py-3 font-mono font-medium text-foreground">{b.numero}</td>
                        <td className="px-4 py-3 text-muted-foreground">{b.rubro}</td>
                        <td className="px-4 py-3 text-muted-foreground">{b.customer_name || <span className="text-muted-foreground/50 italic">Sin cliente</span>}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">{fmt(Number(b.total), b.currency)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {st.pulse && (
                              <span className="flex h-1.5 w-1.5 shrink-0">
                                <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-amber-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                              </span>
                            )}
                            <Badge variant="outline" className={cn('text-[10px]', st.className)}>{st.label}</Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {new Date(b.fecha).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            <Link href={`/presupuestos/${b.id}`}>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                            {b.status === 'borrador' && (
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => handleSend(b.id)}>
                                <Send className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={deleting === b.id}
                              onClick={() => handleDelete(b.id, b.numero)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
