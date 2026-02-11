"use client"

import React from "react"

import { use, useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { TopHeader } from "@/components/dashboard/top-header"
import { useInventory } from "@/lib/context/inventory-context"
import { categoryLabels } from "@/lib/data/inventory"
import type { ItemCategory, StockMovement } from "@/lib/data/inventory"
import { ItemFormDialog } from "@/components/inventory/item-form-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Edit,
  Trash2,
  AlertTriangle,
  Warehouse,
  Truck,
  Store,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Wrench,
  Package,
  Phone,
  Mail,
  Clock,
  Plus,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

const catColor: Record<ItemCategory, string> = {
  refaccion: "bg-chart-1/10 text-chart-1",
  herramienta: "bg-chart-2/10 text-chart-2",
  consumible: "bg-chart-3/10 text-chart-3",
  equipo: "bg-chart-4/10 text-chart-4",
  material: "bg-chart-5/10 text-chart-5",
}

const locIcon = { almacen: Warehouse, vehiculo: Truck, proveedor: Store }
const locLabel = { almacen: "Almacen", vehiculo: "Vehiculo", proveedor: "Proveedor" }
const movIcon = { entrada: ArrowDownToLine, salida: ArrowUpFromLine, transferencia: ArrowLeftRight, ajuste: Wrench }
const movColor = { entrada: "text-success", salida: "text-destructive", transferencia: "text-primary", ajuste: "text-chart-3" }
const movLabel = { entrada: "Entrada", salida: "Salida", transferencia: "Transferencia", ajuste: "Ajuste" }

const fmt = (n: number) => n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 })

export default function InventarioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { getItem, updateItem, deleteItem, addMovement } = useInventory()
  const item = getItem(id)

  const [editOpen, setEditOpen] = useState(false)
  const [movOpen, setMovOpen] = useState(false)
  const [movForm, setMovForm] = useState<Omit<StockMovement, "id">>({
    date: new Date().toISOString().split("T")[0],
    type: "entrada",
    qty: 1,
    from: "",
    to: "",
    notes: "",
    user: "Admin",
  })

  // Movement chart data
  const chartData = useMemo(() => {
    if (!item) return []
    const byDate: Record<string, { entradas: number; salidas: number }> = {}
    for (const m of item.movements) {
      if (!byDate[m.date]) byDate[m.date] = { entradas: 0, salidas: 0 }
      if (m.type === "entrada") byDate[m.date].entradas += m.qty
      else if (m.type === "salida") byDate[m.date].salidas += m.qty
    }
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-10)
      .map(([date, v]) => ({ date: date.slice(5), ...v }))
  }, [item])

  if (!item) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <SidebarNav />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopHeader />
          <main className="flex-1 flex items-center justify-center bg-content">
            <div className="text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-lg font-semibold text-foreground">Articulo no encontrado</p>
              <Button variant="outline" className="mt-4 bg-transparent" asChild>
                <Link href="/inventario">Volver al inventario</Link>
              </Button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const isLow = item.totalStock <= item.minStock
  const pct = Math.min(100, (item.totalStock / item.maxStock) * 100)

  const handleDelete = () => {
    deleteItem(item.id)
    router.push("/inventario")
  }

  const handleAddMovement = (e: React.FormEvent) => {
    e.preventDefault()
    addMovement(item.id, movForm)
    setMovOpen(false)
    setMovForm((prev) => ({ ...prev, qty: 1, notes: "", from: "", to: "" }))
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-auto bg-content">
          <div className="p-6 flex flex-col gap-6 max-w-6xl mx-auto">

            {/* ── Back + Header ── */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <Button variant="ghost" size="icon" className="mt-1 shrink-0" asChild>
                  <Link href="/inventario"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold text-foreground">{item.name}</h1>
                    <Badge variant="secondary" className={cn("text-[10px] font-semibold", catColor[item.category])}>
                      {categoryLabels[item.category]}
                    </Badge>
                    {isLow && (
                      <Badge variant="destructive" className="gap-1 text-[10px]">
                        <AlertTriangle className="h-3 w-3" /> Stock Bajo
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    SKU: <span className="font-mono font-medium text-foreground">{item.sku}</span>
                    {item.barcode && (
                      <> &middot; Barcode: <span className="font-mono">{item.barcode}</span></>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={() => setEditOpen(true)}>
                  <Edit className="h-4 w-4" /> Editar
                </Button>
                <Button variant="outline" size="sm" className="gap-2 text-destructive hover:bg-destructive/10 bg-transparent" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" /> Eliminar
                </Button>
              </div>
            </div>

            {/* ── Main content grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left -- 2/3 */}
              <div className="lg:col-span-2 flex flex-col gap-6">

                {/* Stock overview */}
                <Card className="border-border shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-foreground">Nivel de Stock</p>
                      <Button size="sm" className="gap-2 bg-primary text-primary-foreground" onClick={() => setMovOpen(true)}>
                        <Plus className="h-4 w-4" /> Registrar Movimiento
                      </Button>
                    </div>
                    <div className="flex items-end gap-8">
                      <div>
                        <p className={cn("text-4xl font-bold", isLow ? "text-destructive" : "text-foreground")}>
                          {item.totalStock}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.unit}(s) disponibles</p>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                          <span>Min: {item.minStock}</span>
                          <span>Max: {item.maxStock}</span>
                        </div>
                        <Progress value={pct} className={cn("h-3", isLow && "[&>div]:bg-destructive")} />
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">{fmt(item.totalStock * item.costUnit)}</p>
                        <p className="text-[10px] text-muted-foreground">valor en stock</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="locations" className="flex flex-col gap-0">
                  <TabsList className="bg-muted/60 p-1 rounded-lg w-fit">
                    <TabsTrigger value="locations" className="text-xs">Ubicaciones</TabsTrigger>
                    <TabsTrigger value="movements" className="text-xs">Movimientos</TabsTrigger>
                    <TabsTrigger value="chart" className="text-xs">Grafica</TabsTrigger>
                  </TabsList>

                  {/* Locations tab */}
                  <TabsContent value="locations" className="mt-4">
                    <Card className="border-border shadow-sm">
                      <CardContent className="p-0">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted/60 text-muted-foreground">
                              <th className="text-left px-4 py-3 font-semibold">Ubicacion</th>
                              <th className="text-center px-4 py-3 font-semibold">Tipo</th>
                              <th className="text-center px-4 py-3 font-semibold">Cantidad</th>
                              <th className="text-right px-4 py-3 font-semibold">Valor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.locations.map((loc) => {
                              const Icon = locIcon[loc.type]
                              return (
                                <tr key={loc.id} className="border-b border-border">
                                  <td className="px-4 py-3 font-medium text-foreground">{loc.name}</td>
                                  <td className="px-4 py-3 text-center">
                                    <Badge variant="secondary" className="gap-1 text-[10px]">
                                      <Icon className="h-3 w-3" /> {locLabel[loc.type]}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3 text-center font-semibold text-foreground">{loc.qty}</td>
                                  <td className="px-4 py-3 text-right text-muted-foreground">{fmt(loc.qty * item.costUnit)}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Movements tab */}
                  <TabsContent value="movements" className="mt-4">
                    <Card className="border-border shadow-sm">
                      <ScrollArea className="max-h-[400px]">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 z-10">
                            <tr className="bg-muted/60 text-muted-foreground">
                              <th className="text-left px-4 py-3 font-semibold">Fecha</th>
                              <th className="text-center px-4 py-3 font-semibold">Tipo</th>
                              <th className="text-center px-4 py-3 font-semibold">Cant.</th>
                              <th className="text-left px-4 py-3 font-semibold">De / A</th>
                              <th className="text-left px-4 py-3 font-semibold">Notas</th>
                              <th className="text-left px-4 py-3 font-semibold">Usuario</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.movements.map((m) => {
                              const Icon = movIcon[m.type]
                              return (
                                <tr key={m.id} className="border-b border-border">
                                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{m.date}</td>
                                  <td className="px-4 py-3 text-center">
                                    <Badge variant="secondary" className={cn("gap-1 text-[10px]", movColor[m.type])}>
                                      <Icon className="h-3 w-3" /> {movLabel[m.type]}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3 text-center font-bold text-foreground">
                                    {m.type === "entrada" ? "+" : m.type === "salida" ? "-" : ""}{m.qty}
                                  </td>
                                  <td className="px-4 py-3 text-xs">
                                    <span className="text-muted-foreground">{m.from}</span>
                                    <span className="mx-1 text-muted-foreground/50">→</span>
                                    <span className="text-foreground font-medium">{m.to}</span>
                                  </td>
                                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                                    {m.orderId && (
                                      <Link href={`/orden/${m.orderId}`} className="text-primary hover:underline mr-1">
                                        {m.orderId}
                                      </Link>
                                    )}
                                    {m.notes}
                                  </td>
                                  <td className="px-4 py-3 text-xs text-muted-foreground">{m.user}</td>
                                </tr>
                              )
                            })}
                            {item.movements.length === 0 && (
                              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Sin movimientos registrados.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </ScrollArea>
                    </Card>
                  </TabsContent>

                  {/* Chart tab */}
                  <TabsContent value="chart" className="mt-4">
                    <Card className="border-border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-foreground">Entradas vs Salidas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {chartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={chartData} barGap={2}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                              <XAxis dataKey="date" className="text-[10px]" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                              <YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                              <RTooltip />
                              <Bar dataKey="entradas" name="Entradas" radius={[4, 4, 0, 0]}>
                                {chartData.map((_, i) => (
                                  <Cell key={i} fill="hsl(var(--success))" />
                                ))}
                              </Bar>
                              <Bar dataKey="salidas" name="Salidas" radius={[4, 4, 0, 0]}>
                                {chartData.map((_, i) => (
                                  <Cell key={i} fill="hsl(var(--destructive))" />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-8">No hay datos suficientes para la grafica.</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right sidebar -- 1/3 */}
              <div className="flex flex-col gap-5">
                {/* Description */}
                <Card className="border-border shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Descripcion</p>
                    <p className="text-sm text-foreground leading-relaxed">{item.description || "Sin descripcion."}</p>
                  </CardContent>
                </Card>

                {/* Pricing */}
                <Card className="border-border shadow-sm">
                  <CardContent className="p-4 flex flex-col gap-3">
                    <p className="text-xs font-semibold text-muted-foreground">Precios</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-[10px] text-muted-foreground mb-1">Costo</p>
                        <p className="text-lg font-bold text-foreground">{fmt(item.costUnit)}</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-[10px] text-muted-foreground mb-1">Venta</p>
                        <p className="text-lg font-bold text-foreground">{item.priceUnit > 0 ? fmt(item.priceUnit) : "N/A"}</p>
                      </div>
                    </div>
                    {item.priceUnit > 0 && (
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground">Margen</p>
                        <p className="text-sm font-bold text-success">
                          {((1 - item.costUnit / item.priceUnit) * 100).toFixed(1)}%
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Supplier card */}
                <Card className="border-border shadow-sm">
                  <CardContent className="p-4 flex flex-col gap-3">
                    <p className="text-xs font-semibold text-muted-foreground">Proveedor</p>
                    <p className="text-sm font-semibold text-foreground">{item.supplier.name}</p>
                    <Separator />
                    <div className="flex flex-col gap-2 text-xs">
                      {item.supplier.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <a href={`tel:${item.supplier.phone}`} className="hover:text-primary">{item.supplier.phone}</a>
                        </div>
                      )}
                      {item.supplier.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <a href={`mailto:${item.supplier.email}`} className="hover:text-primary">{item.supplier.email}</a>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>Tiempo de entrega: <span className="font-semibold text-foreground">{item.supplier.leadTimeDays} dias</span></span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 mt-1 bg-transparent">
                      <ExternalLink className="h-3.5 w-3.5" /> Solicitar Reorden
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Edit dialog */}
      <ItemFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={(data) => updateItem(item.id, data)}
        initialData={item}
      />

      {/* New movement dialog */}
      <Dialog open={movOpen} onOpenChange={setMovOpen}>
        <DialogContent className="max-w-md p-0 gap-0">
          <DialogTitle className="px-6 pt-5 pb-3 border-b border-border text-base font-semibold text-foreground">
            Registrar Movimiento
          </DialogTitle>
          <form onSubmit={handleAddMovement} className="p-6 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Tipo *</Label>
                <Select value={movForm.type} onValueChange={(v) => setMovForm((p) => ({ ...p, type: v as StockMovement["type"] }))}>
                  <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="salida">Salida</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="ajuste">Ajuste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Cantidad *</Label>
                <Input type="number" min={0.1} step="0.1" required value={movForm.qty} onChange={(e) => setMovForm((p) => ({ ...p, qty: Number(e.target.value) }))} className="bg-card" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Origen</Label>
                <Input value={movForm.from} onChange={(e) => setMovForm((p) => ({ ...p, from: e.target.value }))} placeholder="Ej: Almacen Central" className="bg-card" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Destino</Label>
                <Input value={movForm.to} onChange={(e) => setMovForm((p) => ({ ...p, to: e.target.value }))} placeholder="Ej: OT-1042" className="bg-card" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Notas</Label>
              <Input value={movForm.notes} onChange={(e) => setMovForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Descripcion del movimiento..." className="bg-card" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setMovOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-primary text-primary-foreground">Registrar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
