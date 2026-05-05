"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, ClipboardList, User, MessageSquare, ScanLine } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { icon: CalendarDays, label: "Agenda", href: "/tecnico/agenda" },
  { icon: ClipboardList, label: "Historial", href: "/tecnico/historial" },
  { icon: ScanLine, label: "Escanear", href: "/tecnico/escanear" },
  { icon: MessageSquare, label: "Mensajes", href: "/tecnico/mensajes" },
  { icon: User, label: "Perfil", href: "/tecnico/perfil" },
]

export function BottomTabs() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
      <div className="flex items-stretch">
        {tabs.map((tab) => {
          const active = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <tab.icon className={cn("h-5 w-5", active && "text-primary")} />
              <span>{tab.label}</span>
              {active && (
                <span className="absolute top-0 h-0.5 w-10 rounded-b-full bg-primary" />
              )}
            </Link>
          )
        })}
      </div>
      {/* Safe area for phones with home indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
