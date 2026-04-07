"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { TopHeader } from "@/components/dashboard/top-header"
import { Users, Shield, Bell, Database } from "lucide-react"
import { cn } from "@/lib/utils"

const configItems = [
  { icon: Users, label: "Usuarios", href: "/configuracion/usuarios" },
  { icon: Shield, label: "Permisos y Roles", href: "/configuracion/permisos" },
  { icon: Bell, label: "Notificaciones", href: "/configuracion/notificaciones" },
  { icon: Database, label: "Base de Datos", href: "/configuracion/base-datos" },
]

export default function ConfiguracionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex flex-1 overflow-hidden">
          {/* Config Sidebar */}
          <aside className="w-48 border-r border-border bg-muted/30 overflow-y-auto">
            <div className="p-4 space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 py-2">Configuración</h3>
              {configItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
