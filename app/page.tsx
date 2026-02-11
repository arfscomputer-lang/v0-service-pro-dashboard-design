import Link from "next/link"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { TopHeader } from "@/components/dashboard/top-header"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { LiveFeed } from "@/components/dashboard/live-feed"
import { Card, CardContent } from "@/components/ui/card"
import {
  CalendarClock,
  ClipboardList,
  Users,
  BarChart3,
  ArrowRight,
} from "lucide-react"

const quickLinks = [
  {
    title: "Agenda de Despacho",
    description: "Calendario Gantt con drag-and-drop para asignar ordenes a tecnicos.",
    href: "/despacho",
    icon: CalendarClock,
  },
  {
    title: "Ordenes de Trabajo",
    description: "Lista completa de ordenes activas, pendientes y completadas.",
    href: "/ordenes",
    icon: ClipboardList,
  },
  {
    title: "Tecnicos",
    description: "Gestion de tecnicos, disponibilidad y rendimiento.",
    href: "/tecnicos",
    icon: Users,
  },
  {
    title: "Reportes",
    description: "Analitica de productividad, tiempos de respuesta y calificaciones.",
    href: "/reportes",
    icon: BarChart3,
  },
]

export default function DashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />

        <main className="flex-1 overflow-y-auto p-6 gap-6 flex flex-col bg-content">
          {/* Welcome header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Panel Principal
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Resumen general de la operacion del dia. 11 de Febrero, 2026.
            </p>
          </div>

          {/* KPI Cards */}
          <KpiCards />

          {/* Quick navigation + Live Feed */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Quick links */}
            <div className="lg:col-span-2">
              <h2 className="text-sm font-semibold text-foreground mb-3">Accesos Rapidos</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {quickLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Card className="border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all group h-full">
                      <CardContent className="p-5 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <link.icon className="h-5 w-5 text-primary" />
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{link.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {link.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
            {/* Live Feed */}
            <div className="lg:col-span-1">
              <LiveFeed />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
