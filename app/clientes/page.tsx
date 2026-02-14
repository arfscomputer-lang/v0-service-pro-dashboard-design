"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { TopHeader } from "@/components/dashboard/top-header"
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog"
import { useCustomers } from "@/lib/context/customers-context"
import type { Customer, CustomerType, CustomerTag } from "@/lib/data/customers"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  Plus,
  Download,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
  UserCircle,
  Building2,
  Landmark,
  Factory,
  Star,
  ArrowUpDown,
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronUp,
  Briefcase,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Helpers ──────────────────────────────────────────────

const typeConfig: Record<CustomerType, { label: string; icon: typeof UserCircle; color: string }> = {
  residencial: { label: "Residencial", icon: UserCircle, color: "text-blue-600 bg-blue-50 border-blue-200" },
  comercial: { label: "Comercial", icon: Building2, color: "text-amber-600 bg-amber-50 border-amber-200" },
  industrial: { label: "Industrial", icon: Factory, color: "text-slate-600 bg-slate-50 border-slate-200" },
  gobierno: { label: "Gobierno", icon: Landmark, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
}

const tagColors: Record<CustomerTag, string> = {
  VIP: "bg-amber-100 text-amber-700 border-amber-300",
  nuevo: "bg-sky-100 text-sky-700 border-sky-300",
  frecuente: "bg-emerald-100 text-emerald-700 border-emerald-300",
  moroso: "bg-red-100 text-red-700 border-red-300",
  corporativo: "bg-indigo-100 text-indigo-700 border-indigo-300",
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 }).format(n)
}

type SortKey = "name" | "type" | "totalSpent" | "nps" | "createdAt"

// ── Page ─────────────────────────────────────────────────

export default function ClientesPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomers()

  const [activeTab, setActiveTab] = useState("list")
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [tagFilter, setTagFilter] = useState<string>("all")
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [sortAsc, setSortAsc] = useState(true)
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [selectedForSchedule, setSelectedForSchedule] = useState<Customer | null>(null)
  const [branches, setBranches] = useState([
    { address: '', city: '', zip: '', contactName: '', contactEmail: '', phone: '', notes: '' }
  ])

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Customer | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)

  // Filter + sort
  const filtered = useMemo(() => {
    let list = [...customers]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.id.includes(q) ||
          c.address.toLowerCase().includes(q)
      )
    }

    if (typeFilter !== "all") {
      list = list.filter((c) => c.type === typeFilter)
    }
    if (tagFilter !== "all") {
      list = list.filter((c) => (c.tags || []).includes(tagFilter as CustomerTag))
    }

    list.sort((a, b) => {
      let cmp = 0
      if (sortKey === "name") cmp = a.name.localeCompare(b.name)
      else if (sortKey === "type") cmp = a.type.localeCompare(b.type)
      else if (sortKey === "totalSpent") cmp = a.totalSpent - b.totalSpent
      else if (sortKey === "nps") cmp = (a.nps ?? -1) - (b.nps ?? -1)
      else if (sortKey === "createdAt") cmp = a.createdAt.localeCompare(b.createdAt)
      return sortAsc ? cmp : -cmp
    })

    return list
  }, [customers, search, typeFilter, tagFilter, sortKey, sortAsc])

  const toggleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) setSortAsc((p) => !p)
      else {
        setSortKey(key)
        setSortAsc(true)
      }
    },
    [sortKey]
  )

  // CSV export
  const handleExportCsv = useCallback(() => {
    const header = "ID,Nombre,Email,Telefono,Tipo,Etiquetas,NPS,Total Gastado,CLV,Direccion,Ciudad,Fecha Alta\n"
    const rows = filtered
      .map(
        (c) =>
          `"${c.id}","${c.name}","${c.email}","${c.phone}","${c.type}","${(c.tags || []).join(";")}",${c.nps ?? ""},${c.totalSpent ?? 0},${c.lifetimeValue ?? 0},"${c.address ?? ""}","${c.city ?? ""}","${c.createdAt ?? ""}"`
      )
      .join("\n")
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `clientes-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [filtered])

  // Save handler
  const handleSave = useCallback(
    async (data: Omit<Customer, "id" | "initials">) => {
      try {
        if (editTarget) {
          await updateCustomer(editTarget.id, data)
        } else {
          await addCustomer(data)
        }
        setEditTarget(null)
      } catch (err) {
        console.error("[v0] Error saving customer:", err)
      }
    },
    [editTarget, addCustomer, updateCustomer]
  )

  const handleAddBranch = () => {
    setBranches([...branches, { address: '', city: '', zip: '', contactName: '', contactEmail: '', phone: '', notes: '' }])
  }

  const handleRemoveBranch = (index: number) => {
    setBranches(branches.filter((_, i) => i !== index))
  }

  // Stats
  const totalClients = customers.length
  const vipCount = customers.filter((c) => (c.tags || []).includes("VIP")).length
  const avgNps = customers.filter((c) => c.nps != null).reduce((a, c) => a + (c.nps ?? 0), 0) / (customers.filter((c) => c.nps != null).length || 1)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex flex-1 flex-col overflow-hidden bg-content">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col">
            {/* Tab Navigation */}
            <div className="border-b border-border bg-card">
              <TabsList className="w-full justify-start rounded-none bg-card p-0 h-auto">
                <TabsTrigger value="list" className="rounded-none border-b-2 border-transparent px-6 py-4 data-[state=active]:border-primary">
                  Lista de Clientes
                </TabsTrigger>
                <TabsTrigger value="add" className="rounded-none border-b-2 border-transparent px-6 py-4 data-[state=active]:border-primary">
                  Agregar Cliente
                </TabsTrigger>
                <TabsTrigger value="reports" className="rounded-none border-b-2 border-transparent px-6 py-4 data-[state=active]:border-primary">
                  Reportes
                </TabsTrigger>
              </TabsList>
            </div>

            {/* CUSTOMERS LIST TAB */}
            <TabsContent value="list" className="flex-1 overflow-hidden flex flex-col">
              {/* Header bar */}
              <div className="flex flex-col gap-4 px-6 py-5 border-b border-border bg-card sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Clientes</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {totalClients} registrados · {vipCount} VIP · NPS promedio: {avgNps.toFixed(1)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-muted-foreground bg-transparent"
                    onClick={handleExportCsv}
                  >
                    <Download className="h-4 w-4" />
                    Exportar CSV
                  </Button>
                  <Button
                    size="sm"
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => {
                      setEditTarget(null)
                      setFormOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Nuevo Cliente
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-border bg-card">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar nombre, email, telefono..."
                    className="pl-10 bg-secondary border-border"
                  />
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[160px] bg-secondary border-border">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="residencial">Residencial</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="gobierno">Gobierno</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={tagFilter} onValueChange={setTagFilter}>
                  <SelectTrigger className="w-[160px] bg-secondary border-border">
                    <SelectValue placeholder="Etiqueta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las etiquetas</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                    <SelectItem value="nuevo">Nuevo</SelectItem>
                    <SelectItem value="frecuente">Frecuente</SelectItem>
                    <SelectItem value="moroso">Moroso</SelectItem>
                    <SelectItem value="corporativo">Corporativo</SelectItem>
                  </SelectContent>
                </Select>

                <span className="text-xs text-muted-foreground ml-auto">{filtered.length} resultado(s)</span>
              </div>

              {/* Table */}
              <ScrollArea className="flex-1">
                <div className="min-w-[900px]">
                  {/* Table header */}
                  <div className="sticky top-0 z-10 grid grid-cols-[0.5fr_2.5fr_1fr_1fr_1fr_1fr_0.5fr] items-center gap-4 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/60 border-b border-border">
                    <div></div>
                    <button type="button" onClick={() => toggleSort("name")} className="flex items-center gap-1 text-left hover:text-foreground transition-colors">
                      Cliente <ArrowUpDown className="h-3 w-3" />
                    </button>
                    <button type="button" onClick={() => toggleSort("type")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Tipo <ArrowUpDown className="h-3 w-3" />
                    </button>
                    <span>Etiquetas</span>
                    <button type="button" onClick={() => toggleSort("totalSpent")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Total Gastado <ArrowUpDown className="h-3 w-3" />
                    </button>
                    <button type="button" onClick={() => toggleSort("nps")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                      NPS <ArrowUpDown className="h-3 w-3" />
                    </button>
                    <span className="text-center">Acciones</span>
                  </div>

                  {/* Rows */}
                  {filtered.map((c) => {
                    const tc = typeConfig[c.type]
                    const TypeIcon = tc.icon
                    const isExpanded = expandedCustomer === c.id
                    return (
                      <div key={c.id}>
                        <div className="grid grid-cols-[0.5fr_2.5fr_1fr_1fr_1fr_1fr_0.5fr] items-center gap-4 px-6 py-3.5 border-b border-border hover:bg-muted/30 transition-colors">
                          {/* Expand button */}
                          <button
                            onClick={() => setExpandedCustomer(isExpanded ? null : c.id)}
                            className="flex items-center justify-center text-muted-foreground hover:text-foreground"
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>

                          {/* Name */}
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-9 w-9 shrink-0">
                              <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                                {c.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <Link
                                href={`/clientes/${c.id}`}
                                className="text-sm font-semibold text-foreground hover:text-primary hover:underline truncate block"
                              >
                                {c.name}
                              </Link>
                              <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                            </div>
                          </div>

                          {/* Type */}
                          <div>
                            <Badge variant="outline" className={cn("gap-1 text-[11px]", tc.color)}>
                              <TypeIcon className="h-3 w-3" />
                              {tc.label}
                            </Badge>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1">
                            {(c.tags || []).map((tag) => (
                              <Badge key={tag} variant="outline" className={cn("text-[10px] px-1.5 py-0", tagColors[tag])}>
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          {/* Total spent */}
                          <span className="text-sm font-medium text-foreground">{formatCurrency(c.totalSpent)}</span>

                          {/* NPS */}
                          <div className="flex items-center gap-1">
                            {c.nps != null ? (
                              <>
                                <Star className={cn("h-3.5 w-3.5", c.nps >= 9 ? "text-amber-500 fill-amber-500" : c.nps >= 7 ? "text-amber-400 fill-amber-400" : "text-muted-foreground")} />
                                <span className="text-sm font-medium">{c.nps}</span>
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground">--</span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex justify-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/clientes/${c.id}`} className="gap-2">
                                    <ExternalLink className="h-4 w-4" /> Ver Perfil
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => {
                                    setEditTarget(c)
                                    setFormOpen(true)
                                  }}
                                >
                                  <Pencil className="h-4 w-4" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => {
                                    setSelectedForSchedule(c)
                                    setScheduleOpen(true)
                                  }}
                                >
                                  <Calendar className="h-4 w-4" /> Agendar Servicio
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2 text-destructive focus:text-destructive"
                                  onClick={() => setDeleteTarget(c)}
                                >
                                  <Trash2 className="h-4 w-4" /> Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Expanded branches view */}
                        {isExpanded && (
                          <div className="bg-muted/50 border-b border-border p-6">
                            <h4 className="font-semibold mb-4 flex items-center gap-2">
                              <Briefcase className="h-4 w-4" />
                              Sucursales ({c.city ? 1 : 0})
                            </h4>
                            <div className="space-y-4">
                              <div className="border border-border rounded-lg p-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Dirección</p>
                                    <p className="font-medium">{c.address}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Ciudad</p>
                                    <p className="font-medium">{c.city}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Contacto</p>
                                    <p className="font-medium">{c.name}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Teléfono</p>
                                    <p className="font-medium">{c.phone}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <UserCircle className="h-12 w-12 mb-3 opacity-40" />
                      <p className="text-sm font-medium">No se encontraron clientes</p>
                      <p className="text-xs mt-1">Intenta con otros filtros o crea un nuevo registro.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* ADD CUSTOMER TAB */}
            <TabsContent value="add" className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto space-y-8">
                <div>
                  <h2 className="text-2xl font-bold">Agregar Nuevo Cliente</h2>
                  <p className="text-sm text-muted-foreground mt-1">Completa la información del cliente y sus sucursales</p>
                </div>

                {/* Parent Customer Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Información del Cliente Principal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Nombre Empresa *</Label>
                        <Input placeholder="Nombre del cliente" />
                      </div>
                      <div className="space-y-2">
                        <Label>RFC *</Label>
                        <Input placeholder="RFC" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" placeholder="email@empresa.com" />
                      </div>
                      <div className="space-y-2">
                        <Label>Teléfono</Label>
                        <Input placeholder="+52 55 0000 0000" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Términos de Pago</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona términos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inmediato">Pago Inmediato</SelectItem>
                          <SelectItem value="30">Plazo 30 días</SelectItem>
                          <SelectItem value="60">Plazo 60 días</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Branches Section */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Sucursales</CardTitle>
                    <Button variant="outline" size="sm" onClick={handleAddBranch} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Agregar Sucursal
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {branches.map((branch, idx) => (
                      <div key={idx} className="space-y-4 p-4 border border-border rounded-lg">
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold">Sucursal {idx + 1}</h4>
                          {branches.length > 1 && (
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveBranch(idx)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Dirección</Label>
                            <Input placeholder="Calle y número" />
                          </div>
                          <div className="space-y-2">
                            <Label>Ciudad</Label>
                            <Input placeholder="Ciudad" />
                          </div>
                          <div className="space-y-2">
                            <Label>Código Postal</Label>
                            <Input placeholder="CP" />
                          </div>
                          <div className="space-y-2">
                            <Label>Teléfono Sucursal</Label>
                            <Input placeholder="+52 55 0000 0000" />
                          </div>
                          <div className="space-y-2 col-span-2">
                            <Label>Nombre de Contacto</Label>
                            <Input placeholder="Nombre" />
                          </div>
                          <div className="space-y-2 col-span-2">
                            <Label>Email Contacto</Label>
                            <Input type="email" placeholder="email@sucursal.com" />
                          </div>
                          <div className="space-y-2 col-span-2">
                            <Label>Notas Especiales</Label>
                            <Input placeholder="Detalles adicionales..." />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Integration Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Integraciones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="crm-integration" className="rounded" />
                      <Label htmlFor="crm-integration">Integrar con CRM</Label>
                    </div>

                    <div className="space-y-2">
                      <Label>Sistema ERP</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona ERP" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Ninguno</SelectItem>
                          <SelectItem value="sap">SAP</SelectItem>
                          <SelectItem value="oracle">Oracle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Button className="w-full" size="lg">Guardar Cliente</Button>
              </div>
            </TabsContent>

            {/* REPORTS TAB */}
            <TabsContent value="reports" className="flex-1 overflow-y-auto p-6">
              <div className="max-w-6xl mx-auto space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Reportes y Análisis</h2>
                  <p className="text-sm text-muted-foreground mt-1">Métricas y análisis de clientes y servicios</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <UserCircle className="h-4 w-4" />
                        Total Clientes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{totalClients}</div>
                      <p className="text-xs text-muted-foreground mt-1">+3 este mes</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4" />
                        Servicios Totales
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">238</div>
                      <p className="text-xs text-muted-foreground mt-1">+45 este mes</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        Tiempo Respuesta
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">2.4h</div>
                      <p className="text-xs text-muted-foreground mt-1">Promedio</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Services per Customer */}
                <Card>
                  <CardHeader>
                    <CardTitle>Servicios por Cliente</CardTitle>
                    <CardDescription>Top 5 clientes por volumen de servicios</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: 'Empresa Alfa S.A.', services: 45, percentage: 95 },
                        { name: 'Grupo Ferretero del Sur', services: 32, percentage: 67 },
                        { name: 'Inmuebles Construcción', services: 28, percentage: 59 },
                        { name: 'Tech Solutions Inc', services: 22, percentage: 46 },
                        { name: 'Global Services Ltd', services: 18, percentage: 38 },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <div className="mt-1 h-2 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${item.percentage}%` }} />
                            </div>
                          </div>
                          <p className="text-sm font-semibold">{item.services}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Branch Response Time */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tiempo Respuesta por Sucursal</CardTitle>
                    <CardDescription>Promedio de tiempo desde creación hasta asignación</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { branch: 'CDMX - Centro', time: '1.2h' },
                        { branch: 'Monterrey - Norte', time: '2.8h' },
                        { branch: 'Guadalajara - Occidente', time: '3.1h' },
                        { branch: 'Cancún - Caribe', time: '4.5h' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <p className="text-sm font-medium">{item.branch}</p>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${Math.random() * 100}%` }} />
                            </div>
                            <p className="text-sm font-semibold w-12">{item.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Form dialog */}
      <CustomerFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditTarget(null)
        }}
        onSave={handleSave}
        initialData={editTarget}
      />

      {/* Schedule Service Modal */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Programar Servicio</DialogTitle>
            <DialogDescription>
              {selectedForSchedule?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Fecha del Servicio</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Hora</Label>
              <Input type="time" />
            </div>
            <div className="space-y-2">
              <Label>Técnico Asignado</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona técnico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Carlos López</SelectItem>
                  <SelectItem value="2">Ana García</SelectItem>
                  <SelectItem value="3">Roberto Martínez</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full">Agendar Servicio</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminara permanentemente a <strong>{deleteTarget?.name}</strong> y todo su historial. Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) deleteCustomer(deleteTarget.id)
                setDeleteTarget(null)
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


// ── Helpers ──────────────────────────────────────────────

const typeConfig: Record<CustomerType, { label: string; icon: typeof UserCircle; color: string }> = {
  residencial: { label: "Residencial", icon: UserCircle, color: "text-blue-600 bg-blue-50 border-blue-200" },
  comercial: { label: "Comercial", icon: Building2, color: "text-amber-600 bg-amber-50 border-amber-200" },
  industrial: { label: "Industrial", icon: Factory, color: "text-slate-600 bg-slate-50 border-slate-200" },
  gobierno: { label: "Gobierno", icon: Landmark, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
}

const tagColors: Record<CustomerTag, string> = {
  VIP: "bg-amber-100 text-amber-700 border-amber-300",
  nuevo: "bg-sky-100 text-sky-700 border-sky-300",
  frecuente: "bg-emerald-100 text-emerald-700 border-emerald-300",
  moroso: "bg-red-100 text-red-700 border-red-300",
  corporativo: "bg-indigo-100 text-indigo-700 border-indigo-300",
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 }).format(n)
}

type SortKey = "name" | "type" | "totalSpent" | "nps" | "createdAt"


    if (typeFilter !== "all") {
      list = list.filter((c) => c.type === typeFilter)
    }
    if (tagFilter !== "all") {
      list = list.filter((c) => (c.tags || []).includes(tagFilter as CustomerTag))
    }

    list.sort((a, b) => {
      let cmp = 0
      if (sortKey === "name") cmp = a.name.localeCompare(b.name)
      else if (sortKey === "type") cmp = a.type.localeCompare(b.type)
      else if (sortKey === "totalSpent") cmp = a.totalSpent - b.totalSpent
      else if (sortKey === "nps") cmp = (a.nps ?? -1) - (b.nps ?? -1)
      else if (sortKey === "createdAt") cmp = a.createdAt.localeCompare(b.createdAt)
      return sortAsc ? cmp : -cmp
    })

    return list
  }, [customers, search, typeFilter, tagFilter, sortKey, sortAsc])

  const toggleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) setSortAsc((p) => !p)
      else {
        setSortKey(key)
        setSortAsc(true)
      }
    },
    [sortKey]
  )

  // CSV export
  const handleExportCsv = useCallback(() => {
    const header = "ID,Nombre,Email,Telefono,Tipo,Etiquetas,NPS,Total Gastado,CLV,Direccion,Ciudad,Fecha Alta\n"
    const rows = filtered
      .map(
        (c) =>
          `"${c.id}","${c.name}","${c.email}","${c.phone}","${c.type}","${(c.tags || []).join(";")}",${c.nps ?? ""},${c.totalSpent ?? 0},${c.lifetimeValue ?? 0},"${c.address ?? ""}","${c.city ?? ""}","${c.createdAt ?? ""}"`
      )
      .join("\n")
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `clientes-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [filtered])

  // Save handler
  const handleSave = useCallback(
    async (data: Omit<Customer, "id" | "initials">) => {
      try {
        console.log("[v0] handleSave called, editTarget:", editTarget?.id, "data.name:", data.name)
        if (editTarget) {
          await updateCustomer(editTarget.id, data)
        } else {
          await addCustomer(data)
        }
        setEditTarget(null)
      } catch (err) {
        console.error("[v0] Error saving customer:", err)
      }
    },
    [editTarget, addCustomer, updateCustomer]
  )

  // Stats
  const totalClients = customers.length
  const vipCount = customers.filter((c) => (c.tags || []).includes("VIP")).length
  const avgNps = customers.filter((c) => c.nps != null).reduce((a, c) => a + (c.nps ?? 0), 0) / (customers.filter((c) => c.nps != null).length || 1)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex flex-1 flex-col overflow-hidden bg-content">
          {/* Header bar */}
          <div className="flex flex-col gap-4 px-6 py-5 border-b border-border bg-card sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Clientes</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {totalClients} registrados &middot; {vipCount} VIP &middot; NPS promedio: {avgNps.toFixed(1)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2 text-muted-foreground bg-transparent" asChild>
                <Link href="/clientes/reportes">
                  <BarChart3 className="h-4 w-4" />
                  Reportes CRM
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-muted-foreground bg-transparent"
                onClick={handleExportCsv}
              >
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
              <Button
                size="sm"
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  setEditTarget(null)
                  setFormOpen(true)
                }}
              >
                <Plus className="h-4 w-4" />
                Nuevo Cliente
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-border bg-card">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar nombre, email, telefono, ID..."
                className="pl-10 bg-secondary border-border"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px] bg-secondary border-border">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="residencial">Residencial</SelectItem>
                <SelectItem value="comercial">Comercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="gobierno">Gobierno</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-[160px] bg-secondary border-border">
                <SelectValue placeholder="Etiqueta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las etiquetas</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
                <SelectItem value="nuevo">Nuevo</SelectItem>
                <SelectItem value="frecuente">Frecuente</SelectItem>
                <SelectItem value="moroso">Moroso</SelectItem>
                <SelectItem value="corporativo">Corporativo</SelectItem>
              </SelectContent>
            </Select>

            <span className="text-xs text-muted-foreground ml-auto">{filtered.length} resultado(s)</span>
          </div>

          {/* Table */}
          <ScrollArea className="flex-1">
            <div className="min-w-[900px]">
              {/* Table header */}
              <div className="sticky top-0 z-10 grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_0.5fr] items-center gap-4 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/60 border-b border-border">
                <button type="button" onClick={() => toggleSort("name")} className="flex items-center gap-1 text-left hover:text-foreground transition-colors">
                  Cliente <ArrowUpDown className="h-3 w-3" />
                </button>
                <button type="button" onClick={() => toggleSort("type")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  Tipo <ArrowUpDown className="h-3 w-3" />
                </button>
                <span>Etiquetas</span>
                <button type="button" onClick={() => toggleSort("totalSpent")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  Total Gastado <ArrowUpDown className="h-3 w-3" />
                </button>
                <button type="button" onClick={() => toggleSort("nps")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  NPS <ArrowUpDown className="h-3 w-3" />
                </button>
                <span className="text-center">Acciones</span>
              </div>

              {/* Rows */}
              {filtered.map((c) => {
                const tc = typeConfig[c.type]
                const TypeIcon = tc.icon
                return (
                  <div
                    key={c.id}
                    className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_0.5fr] items-center gap-4 px-6 py-3.5 border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    {/* Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                          {c.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <Link
                          href={`/clientes/${c.id}`}
                          className="text-sm font-semibold text-foreground hover:text-primary hover:underline truncate block"
                        >
                          {c.name}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                      </div>
                    </div>

                    {/* Type */}
                    <div>
                      <Badge variant="outline" className={cn("gap-1 text-[11px]", tc.color)}>
                        <TypeIcon className="h-3 w-3" />
                        {tc.label}
                      </Badge>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {(c.tags || []).map((tag) => (
                        <Badge key={tag} variant="outline" className={cn("text-[10px] px-1.5 py-0", tagColors[tag])}>
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Total spent */}
                    <span className="text-sm font-medium text-foreground">{formatCurrency(c.totalSpent)}</span>

                    {/* NPS */}
                    <div className="flex items-center gap-1">
                      {c.nps != null ? (
                        <>
                          <Star className={cn("h-3.5 w-3.5", c.nps >= 9 ? "text-amber-500 fill-amber-500" : c.nps >= 7 ? "text-amber-400 fill-amber-400" : "text-muted-foreground")} />
                          <span className="text-sm font-medium">{c.nps}</span>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">--</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/clientes/${c.id}`} className="gap-2">
                              <ExternalLink className="h-4 w-4" /> Ver Perfil
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => {
                              setEditTarget(c)
                              setFormOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(c)}
                          >
                            <Trash2 className="h-4 w-4" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })}

              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <UserCircle className="h-12 w-12 mb-3 opacity-40" />
                  <p className="text-sm font-medium">No se encontraron clientes</p>
                  <p className="text-xs mt-1">Intenta con otros filtros o crea un nuevo registro.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </main>
      </div>

      {/* Form dialog */}
      <CustomerFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditTarget(null)
        }}
        onSave={handleSave}
        initialData={editTarget}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminara permanentemente a <strong>{deleteTarget?.name}</strong> y todo su historial. Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) deleteCustomer(deleteTarget.id)
                setDeleteTarget(null)
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
