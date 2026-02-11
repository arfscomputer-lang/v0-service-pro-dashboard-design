import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { TopHeader } from "@/components/dashboard/top-header"
import { UserCircle } from "lucide-react"

export default function ClientesPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 bg-content">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <UserCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Directorio de clientes y gestion de contactos. Esta seccion esta en desarrollo.
          </p>
        </main>
      </div>
    </div>
  )
}
