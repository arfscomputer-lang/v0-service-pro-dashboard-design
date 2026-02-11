import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { TopHeader } from "@/components/dashboard/top-header"
import { TechTable } from "@/components/technicians/tech-table"
import { technicianProfiles } from "@/lib/data/technicians"
import { Users } from "lucide-react"

export default function TecnicosPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex flex-1 flex-col overflow-y-auto p-6 gap-5 bg-content">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Registro de Tecnicos</h1>
                <p className="text-sm text-muted-foreground">
                  Gestion de perfiles, especialidades y disponibilidad del equipo de campo.
                </p>
              </div>
            </div>
            {/* Summary pills */}
            <div className="hidden md:flex items-center gap-2">
              <div className="rounded-full bg-card border border-border px-3 py-1.5 text-xs font-medium text-foreground">
                {technicianProfiles.length} tecnicos
              </div>
              <div className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700">
                {technicianProfiles.filter((t) => t.status === "disponible").length} disponibles
              </div>
            </div>
          </div>

          {/* Tech table */}
          <TechTable technicians={technicianProfiles} />
        </main>
      </div>
    </div>
  )
}
