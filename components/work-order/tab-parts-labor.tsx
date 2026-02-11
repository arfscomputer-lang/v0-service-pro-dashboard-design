"use client"

import { Package, Clock, DollarSign, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Part {
  name: string
  sku: string
  qty: number
  unitPrice: number
  status: "en_inventario" | "pedido" | "instalada"
}

interface LaborEntry {
  technician: string
  date: string
  hours: number
  rate: number
  description: string
}

const parts: Part[] = [
  { name: "Filtro de aire HEPA 20x25", sku: "FLT-HEPA-2025", qty: 2, unitPrice: 450, status: "instalada" },
  { name: "Capacitor de arranque 35/5 MFD", sku: "CAP-355-MFD", qty: 1, unitPrice: 320, status: "instalada" },
  { name: "Valvula de expansion termostatica", sku: "VET-R410A-03", qty: 1, unitPrice: 1850, status: "en_inventario" },
  { name: "Termostato digital programable", sku: "TERM-DIG-PRO", qty: 1, unitPrice: 2200, status: "pedido" },
  { name: "Refrigerante R-410A (kg)", sku: "REF-R410A-KG", qty: 3, unitPrice: 380, status: "en_inventario" },
]

const labor: LaborEntry[] = [
  {
    technician: "Luis Hernandez",
    date: "11 Feb 2026",
    hours: 1.5,
    rate: 350,
    description: "Diagnostico inicial del sistema y revision de componentes electricos.",
  },
  {
    technician: "Luis Hernandez",
    date: "11 Feb 2026",
    hours: 2,
    rate: 350,
    description: "Reemplazo de filtros y capacitor de arranque.",
  },
  {
    technician: "Ana Torres",
    date: "11 Feb 2026",
    hours: 0.5,
    rate: 400,
    description: "Asistencia electrica: verificacion del cableado del compresor.",
  },
]

const statusLabels: Record<string, { label: string; className: string }> = {
  en_inventario: { label: "En Inventario", className: "bg-blue-50 text-blue-700 border-blue-200" },
  pedido: { label: "Pedido", className: "bg-amber-50 text-amber-700 border-amber-200" },
  instalada: { label: "Instalada", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
}

export function TabPartsLabor() {
  const partsTotal = parts.reduce((sum, p) => sum + p.qty * p.unitPrice, 0)
  const laborTotal = labor.reduce((sum, l) => sum + l.hours * l.rate, 0)
  const grandTotal = partsTotal + laborTotal

  return (
    <div className="flex flex-col gap-6">
      {/* Parts Section */}
      <section className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Refacciones y Materiales
          </h3>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs bg-transparent">
            <Plus className="h-3.5 w-3.5" />
            Agregar
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Articulo</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">SKU</th>
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cant.</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Precio Unit.</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((part) => {
                const st = statusLabels[part.status]
                return (
                  <tr key={part.sku} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{part.name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{part.sku}</td>
                    <td className="px-5 py-3 text-center text-foreground">{part.qty}</td>
                    <td className="px-5 py-3 text-right text-foreground">${part.unitPrice.toLocaleString("es-MX")}</td>
                    <td className="px-5 py-3 text-right font-semibold text-foreground">${(part.qty * part.unitPrice).toLocaleString("es-MX")}</td>
                    <td className="px-5 py-3 text-center">
                      <Badge variant="outline" className={`text-[10px] ${st.className}`}>{st.label}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-secondary/50">
                <td colSpan={4} className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Subtotal Refacciones
                </td>
                <td className="px-5 py-3 text-right font-bold text-foreground">${partsTotal.toLocaleString("es-MX")}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Labor Section */}
      <section className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Mano de Obra
          </h3>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs bg-transparent">
            <Plus className="h-3.5 w-3.5" />
            Agregar
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tecnico</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fecha</th>
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Horas</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tarifa/hr</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Descripcion</th>
              </tr>
            </thead>
            <tbody>
              {labor.map((entry, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">{entry.technician}</td>
                  <td className="px-5 py-3 text-muted-foreground">{entry.date}</td>
                  <td className="px-5 py-3 text-center text-foreground">{entry.hours}</td>
                  <td className="px-5 py-3 text-right text-foreground">${entry.rate.toLocaleString("es-MX")}</td>
                  <td className="px-5 py-3 text-right font-semibold text-foreground">${(entry.hours * entry.rate).toLocaleString("es-MX")}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground max-w-[220px] truncate">{entry.description}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-secondary/50">
                <td colSpan={4} className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Subtotal Mano de Obra
                </td>
                <td className="px-5 py-3 text-right font-bold text-foreground">${laborTotal.toLocaleString("es-MX")}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Grand Total */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">Total General Estimado</span>
          </div>
          <span className="text-2xl font-bold text-primary">${grandTotal.toLocaleString("es-MX")} MXN</span>
        </div>
        <Separator className="my-3" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Refacciones: ${partsTotal.toLocaleString("es-MX")}</span>
          <span>Mano de Obra: ${laborTotal.toLocaleString("es-MX")}</span>
          <span>IVA (16%): ${Math.round(grandTotal * 0.16).toLocaleString("es-MX")}</span>
          <span className="font-semibold text-foreground">
            Con IVA: ${Math.round(grandTotal * 1.16).toLocaleString("es-MX")} MXN
          </span>
        </div>
      </div>
    </div>
  )
}
