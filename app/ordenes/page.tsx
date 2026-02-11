"use client"

import Link from "next/link"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { TopHeader } from "@/components/dashboard/top-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  ChevronRight,
  Clock,
  MapPin,
  Wrench,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const orders = [
  { id: "OT-1050", customer: "Maria Gonzalez", type: "Reparacion HVAC", address: "Av. Reforma 450, Col. Centro", status: "en_progreso", priority: "alta", date: "11 Feb 2026", time: "09:00" },
  { id: "OT-1051", customer: "Fernando Lopez", type: "Inspeccion Gas", address: "Av. Universidad 1200", status: "pendiente", priority: "alta", date: "11 Feb 2026", time: "10:30" },
  { id: "OT-1052", customer: "Patricia Herrera", type: "Reparacion Electrica", address: "Col. Roma Norte 78", status: "pendiente", priority: "media", date: "11 Feb 2026", time: "11:00" },
  { id: "OT-1053", customer: "Laura Castillo", type: "Mantenimiento Plomeria", address: "Calle Juarez 340", status: "pendiente", priority: "media", date: "11 Feb 2026", time: "13:00" },
  { id: "OT-1054", customer: "Diego Ramirez", type: "Instalacion Panel Solar", address: "Av. Chapultepec 560", status: "pendiente", priority: "baja", date: "12 Feb 2026", time: "08:00" },
  { id: "OT-1055", customer: "Alejandra Ruiz", type: "Revision Caldera", address: "Blvd. Insurgentes 890", status: "en_progreso", priority: "alta", date: "11 Feb 2026", time: "14:00" },
  { id: "OT-1056", customer: "Roberto Martinez", type: "Mantenimiento General", address: "Calle 5 de Mayo 220", status: "completada", priority: "baja", date: "10 Feb 2026", time: "09:00" },
  { id: "OT-1042", customer: "Empresa Alfa", type: "Reparacion HVAC", address: "Blvd. Industrial 100", status: "completada", priority: "media", date: "10 Feb 2026", time: "08:00" },
  { id: "OT-1043", customer: "Roberto Martinez", type: "Instalacion Electrica", address: "Calle 5 de Mayo 220", status: "completada", priority: "alta", date: "09 Feb 2026", time: "09:30" },
]

const statusConfig: Record<string, { label: string; className: string }> = {
  pendiente: { label: "Pendiente", className: "bg-amber-100 text-amber-800 border-amber-200" },
  en_progreso: { label: "En Progreso", className: "bg-blue-100 text-blue-800 border-blue-200" },
  completada: { label: "Completada", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  cancelada: { label: "Cancelada", className: "bg-red-100 text-red-800 border-red-200" },
}

const priorityConfig: Record<string, { label: string; dot: string }> = {
  alta: { label: "Alta", dot: "bg-destructive" },
  media: { label: "Media", dot: "bg-warning" },
  baja: { label: "Baja", dot: "bg-muted-foreground" },
}

export default function OrdenesPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />

        <main className="flex flex-1 flex-col overflow-hidden p-4 gap-4">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Ordenes de Trabajo</h1>
                <p className="text-sm text-muted-foreground">{orders.length} ordenes en total</p>
              </div>
            </div>
            <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Nueva Orden
            </Button>
          </div>

          {/* Search and filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar por # de orden, cliente..." className="pl-10 bg-card border-border" />
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>

          {/* Orders list */}
          <div className="flex-1 overflow-hidden rounded-xl border border-border bg-card">
            <ScrollArea className="h-full">
              <div className="divide-y divide-border">
                {orders.map((order) => {
                  const st = statusConfig[order.status]
                  const pr = priorityConfig[order.priority]
                  return (
                    <Link
                      key={order.id}
                      href={`/orden/${order.id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/40 transition-colors group"
                    >
                      {/* Priority dot */}
                      <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", pr.dot)} title={`Prioridad ${pr.label}`} />

                      {/* Order info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold font-mono text-primary">{order.id}</span>
                          <span className="text-sm font-semibold text-foreground">{order.customer}</span>
                          <Badge variant="outline" className={cn("text-[10px]", st.className)}>{st.label}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Wrench className="h-3 w-3" />
                            {order.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-[200px]">{order.address}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {order.date} - {order.time}
                          </span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </main>
      </div>
    </div>
  )
}
