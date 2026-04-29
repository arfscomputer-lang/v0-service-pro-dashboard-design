import Link from "next/link"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { TopHeader } from "@/components/dashboard/top-header"
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CalendarClock,
  ClipboardList,
  Users,
  BarChart3,
  ArrowRight,
  Zap,
} from "lucide-react"

const quickLinks = [
  {
    title: "Agenda de Despacho",
    description: "Calendario para asignar órdenes a técnicos con drag-and-drop.",
    href: "/despacho",
    icon: CalendarClock,
  },
  {
    title: "Órdenes de Trabajo",
    description: "Gestión completa de órdenes activas, pendientes y completadas.",
    href: "/ordenes",
    icon: ClipboardList,
  },
  {
    title: "Técnicos",
    description: "Administra técnicos, disponibilidad, especialidades y rendimiento.",
    href: "/tecnicos",
    icon: Users,
  },
  {
    title: "Reportes",
    description: "Analítica de productividad, tiempos de respuesta y calificaciones.",
    href: "/reportes",
    icon: BarChart3,
  },
]

export default function DashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden w-full">
        <TopHeader />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 gap-6 flex flex-col bg-background">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Panel Principal
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Resumen en tiempo real de la operación desde la base de datos Neon
            </p>
          </div>

          {/* Metrics Grid */}
          <DashboardMetrics />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
            {/* Recent Orders */}
            <RecentOrders />

            {/* Quick Links */}
            <div className="lg:col-span-1">
              <h2 className="text-sm font-semibold text-foreground mb-3">
                Accesos Rápidos
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {quickLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <Link key={link.href} href={link.href}>
                      <Card className="h-full border border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                        <CardContent className="p-3 md:p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                {link.title}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {link.description}
                              </p>
                            </div>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Info Box */}
          <Card className="border border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4 text-primary" />
                Conectado a Base de Datos Neon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Todos los datos mostrados en este panel se obtienen en tiempo real desde tu base de datos PostgreSQL en Neon. 
                Las métricas se actualizan automáticamente y reflejan el estado actual de órdenes, técnicos e inventario.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
