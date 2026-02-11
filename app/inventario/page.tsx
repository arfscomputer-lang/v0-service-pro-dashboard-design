"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { TopHeader } from "@/components/dashboard/top-header"
import { useInventory } from "@/lib/context/inventory-context"
import { categoryLabels } from "@/lib/data/inventory"
import type { ItemCategory, InventoryItem } from "@/lib/data/inventory"
import { BarcodeScanner } from "@/components/inventory/barcode-scanner"
import { ItemFormDialog } from "@/components/inventory/item-form-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import {
  Package,
  Search,
  Plus,
  ScanBarcode,
  AlertTriangle,
  ArrowUpDown,
  Download,
  Warehouse,
  Truck,
  DollarSign,
  TrendingDown,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ── Category badge config ─── */
const catColor: Record<ItemCategory, string> = {
  refaccion: "bg-chart-1/10 text-chart-1",
  herramienta: "bg-chart-2/10 text-chart-2",
  consumible: "bg-chart-3/10 text-chart-3",
  equipo: "bg-chart-4/10 text-chart-4",
  material: "bg-chart-5/10 text-chart-5",
}

type SortKey = "name" | "totalStock" | "costUnit" | "category"

export default function InventarioPage() {
  const { items, lowStockItems, totalValue, addItem } = useInventory()
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState<string>("all")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortKey>("name")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [scannerOpen, setScannerOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  /* Stats */
  const totalItems = items.length
  const totalUnits = items.reduce((s, i) => s + i.totalStock, 0)
  const vehicleStock = items.reduce(
    (s, i) => s + i.locations.filter((l) => l.type === "vehiculo").reduce((a, l) => a + l.qty, 0),
    0
  )

  /* Filter + sort */
  const filtered = useMemo(() => {
    let result = [...items]

    // search
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q) ||
          i.barcode.includes(q) ||
          i.supplier.name.toLowerCase().includes(q)
      )
    }

    // category
    if (catFilter !== "all") {
      result = result.filter((i) => i.category === catFilter)
    }

    // stock status
    if (stockFilter === "low") {
      result = result.filter((i) => i.totalStock <= i.minStock)
    } else if (stockFilter === "ok") {
      result = result.filter((i) => i.totalStock > i.minStock)
    }

    // sort
    result.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1
      if (sortBy === "name") return a.name.localeCompare(b.name) * dir
      if (sortBy === "totalStock") return (a.totalStock - b.totalStock) * dir
      if (sortBy === "costUnit") return (a.costUnit - b.costUnit) * dir
      if (sortBy === "category") return a.category.localeCompare(b.category) * dir
      return 0
    })

    return result
  }, [items, search, catFilter, stockFilter, sortBy, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortBy(key); setSortDir("asc") }
  }

  /* CSV export */
  const handleExport = () => {
    const header = "SKU,Nombre,Categoria,Stock,Minimo,Costo,Precio,Proveedor"
    const rows = filtered.map(
      (i) => `${i.sku},${i.name},${categoryLabels[i.category]},${i.totalStock},${i.minStock},${i.costUnit},${i.priceUnit},${i.supplier.name}`
    )
    const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "inventario.csv"
    a.click()
  }

  /* Barcode scan handler */
  const handleScan = (code: string) => {
    const found = items.find((i) => i.barcode === code || i.sku.toLowerCase() === code.toLowerCase())
    if (found) {
      setSearch(found.name)
    } else {
      setSearch(code)
    }
  }

  /* Add item */
  const handleAddItem = (data: Partial<InventoryItem>) => {
    addItem(data as Omit<InventoryItem, "id">)
  }

  const fmt = (n: number) =>
    n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 })

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-auto bg-content">
          <div className="p-6 flex flex-col gap-6">

            {/* ── Page header ── */}
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Inventario</h1>
                <p className="text-sm text-muted-foreground">Control de refacciones, herramientas y materiales</p>
              </div>
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <Button variant="outline" size="sm" className="gap-2 text-muted-foreground bg-transparent" onClick={() => setScannerOpen(true)}>
                  <ScanBarcode className="h-4 w-4" />
                  Escanear
                </Button>
                <Button variant="outline" size="sm" className="gap-2 text-muted-foreground bg-transparent" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
                <Button size="sm" className="gap-2 bg-primary text-primary-foreground" onClick={() => setFormOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Nuevo Articulo
                </Button>
              </div>
            </div>

            {/* ── KPI cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-border shadow-sm">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground font-medium">Total Articulos</p>
                    <p className="text-xl font-bold text-foreground">{totalItems}</p>
                    <p className="text-[10px] text-muted-foreground">{totalUnits} unidades en stock</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border shadow-sm">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                    <TrendingDown className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground font-medium">Stock Bajo</p>
                    <p className="text-xl font-bold text-destructive">{lowStockItems.length}</p>
                    <p className="text-[10px] text-muted-foreground">requieren reorden</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border shadow-sm">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center shrink-0">
                    <Truck className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground font-medium">En Vehiculos</p>
                    <p className="text-xl font-bold text-foreground">{vehicleStock}</p>
                    <p className="text-[10px] text-muted-foreground">unidades distribuidas</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border shadow-sm">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center shrink-0">
                    <DollarSign className="h-5 w-5 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground font-medium">Valor Total</p>
                    <p className="text-xl font-bold text-foreground">{fmt(totalValue)}</p>
                    <p className="text-[10px] text-muted-foreground">costo en inventario</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── Low stock alerts ── */}
            {lowStockItems.length > 0 && (
              <Card className="border-destructive/30 bg-destructive/[0.03] shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <p className="text-sm font-semibold text-destructive">
                      Alertas de Stock Bajo ({lowStockItems.length})
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {lowStockItems.map((item) => (
                      <Link key={item.id} href={`/inventario/${item.id}`}>
                        <Badge variant="outline" className="gap-1.5 border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive/10 cursor-pointer transition-colors">
                          <span className="font-semibold">{item.totalStock}/{item.minStock}</span>
                          {item.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Filters bar ── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, SKU o codigo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-card"
                />
              </div>
              <Select value={catFilter} onValueChange={setCatFilter}>
                <SelectTrigger className="w-[160px] bg-card">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Object.entries(categoryLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-[160px] bg-card">
                  <SelectValue placeholder="Estado Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="low">Stock Bajo</SelectItem>
                  <SelectItem value="ok">Stock OK</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground ml-auto">{filtered.length} articulos</p>
            </div>

            {/* ── Table ── */}
            <Card className="border-border shadow-sm overflow-hidden">
              <ScrollArea className="max-h-[520px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-muted/60 text-muted-foreground">
                      <th className="text-left px-4 py-3 font-semibold">
                        <button type="button" onClick={() => toggleSort("name")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                          Articulo <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="text-left px-4 py-3 font-semibold">
                        <button type="button" onClick={() => toggleSort("category")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                          Categoria <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="text-center px-4 py-3 font-semibold">Ubicaciones</th>
                      <th className="text-center px-4 py-3 font-semibold">
                        <button type="button" onClick={() => toggleSort("totalStock")} className="flex items-center gap-1 justify-center hover:text-foreground transition-colors">
                          Stock <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="text-right px-4 py-3 font-semibold">
                        <button type="button" onClick={() => toggleSort("costUnit")} className="flex items-center gap-1 justify-end hover:text-foreground transition-colors">
                          Costo <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="text-center px-4 py-3 font-semibold">Proveedor</th>
                      <th className="text-center px-4 py-3 font-semibold w-12" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => {
                      const isLow = item.totalStock <= item.minStock
                      const pct = Math.min(100, (item.totalStock / item.maxStock) * 100)
                      const almacen = item.locations.filter((l) => l.type === "almacen").reduce((s, l) => s + l.qty, 0)
                      const vehiculos = item.locations.filter((l) => l.type === "vehiculo").reduce((s, l) => s + l.qty, 0)
                      return (
                        <tr key={item.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          {/* Name + SKU */}
                          <td className="px-4 py-3">
                            <Link href={`/inventario/${item.id}`} className="hover:underline">
                              <p className="font-medium text-foreground leading-tight">{item.name}</p>
                            </Link>
                            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{item.sku}</p>
                          </td>
                          {/* Category */}
                          <td className="px-4 py-3">
                            <Badge variant="secondary" className={cn("text-[10px] font-semibold", catColor[item.category])}>
                              {categoryLabels[item.category]}
                            </Badge>
                          </td>
                          {/* Locations */}
                          <td className="px-4 py-3">
                            <TooltipProvider>
                              <div className="flex items-center justify-center gap-2">
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Warehouse className="h-3.5 w-3.5" />
                                      <span>{almacen}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>Almacen: {almacen}</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Truck className="h-3.5 w-3.5" />
                                      <span>{vehiculos}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>Vehiculos: {vehiculos}</TooltipContent>
                                </Tooltip>
                              </div>
                            </TooltipProvider>
                          </td>
                          {/* Stock bar */}
                          <td className="px-4 py-3">
                            <div className="flex flex-col items-center gap-1 min-w-[80px]">
                              <span className={cn("text-xs font-bold", isLow ? "text-destructive" : "text-foreground")}>
                                {item.totalStock} / {item.maxStock}
                              </span>
                              <Progress
                                value={pct}
                                className={cn("h-1.5 w-full", isLow && "[&>div]:bg-destructive")}
                              />
                              {isLow && (
                                <span className="text-[9px] text-destructive font-semibold flex items-center gap-0.5">
                                  <AlertTriangle className="h-2.5 w-2.5" /> Min: {item.minStock}
                                </span>
                              )}
                            </div>
                          </td>
                          {/* Cost */}
                          <td className="px-4 py-3 text-right">
                            <p className="text-xs font-semibold text-foreground">{fmt(item.costUnit)}</p>
                            {item.priceUnit > 0 && (
                              <p className="text-[10px] text-muted-foreground">Venta: {fmt(item.priceUnit)}</p>
                            )}
                          </td>
                          {/* Supplier */}
                          <td className="px-4 py-3 text-center">
                            <p className="text-xs text-foreground truncate max-w-[120px] mx-auto">{item.supplier.name}</p>
                            <p className="text-[10px] text-muted-foreground">{item.supplier.leadTimeDays}d entrega</p>
                          </td>
                          {/* Actions */}
                          <td className="px-4 py-3 text-center">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" asChild>
                              <Link href={`/inventario/${item.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                          No se encontraron articulos.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </ScrollArea>
            </Card>
          </div>
        </main>
      </div>

      {/* Modals */}
      <BarcodeScanner open={scannerOpen} onOpenChange={setScannerOpen} onScan={handleScan} />
      <ItemFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSave={handleAddItem} />
    </div>
  )
}
