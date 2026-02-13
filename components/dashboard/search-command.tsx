"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search,
  ClipboardList,
  User,
  Wrench,
  ArrowRight,
  Hash,
  MapPin,
  Phone,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useCustomers } from "@/lib/context/customers-context"
import { useTechnicians } from "@/lib/context/technicians-context"

/* ── Static work‑order data (mirrors dispatch‑calendar seed) ── */
const WORK_ORDERS = [
  { id: "OT-1050", customer: "Maria Gonzalez", type: "Reparacion HVAC", address: "Av. Reforma 450, Col. Centro", priority: "alta" as const },
  { id: "OT-1051", customer: "Fernando Lopez", type: "Inspeccion Gas", address: "Av. Universidad 1200", priority: "alta" as const },
  { id: "OT-1052", customer: "Patricia Herrera", type: "Reparacion Electrica", address: "Col. Roma Norte 78", priority: "media" as const },
  { id: "OT-1053", customer: "Laura Castillo", type: "Mantenimiento Plomeria", address: "Calle Juarez 340", priority: "media" as const },
  { id: "OT-1054", customer: "Diego Ramirez", type: "Instalacion Panel Solar", address: "Av. Chapultepec 560", priority: "baja" as const },
  { id: "OT-1055", customer: "Sofia Aguilar", type: "Emergencia Electrica", address: "Privada Olivos 22", priority: "alta" as const },
  { id: "OT-1056", customer: "Andres Morales", type: "Calibracion Caldera", address: "Parque Industrial Sur", priority: "media" as const },
  { id: "OT-1040", customer: "Grupo Industrial Norte", type: "Mantenimiento HVAC", address: "Av. Industria 200", priority: "media" as const },
  { id: "OT-1041", customer: "Residencial Las Lomas", type: "Instalacion AC", address: "Lomas de Chapultepec 45", priority: "baja" as const },
  { id: "OT-1042", customer: "Cafe La Esquina", type: "Reparacion Refrigeracion", address: "Col. Roma Sur 123", priority: "alta" as const },
  { id: "OT-1043", customer: "Torre Reforma 115", type: "Inspeccion Electrica", address: "Paseo de la Reforma 115", priority: "media" as const },
  { id: "OT-1044", customer: "Ana Martinez", type: "Instalacion Calentador", address: "Col. Narvarte 67", priority: "baja" as const },
]

const priorityDot: Record<string, string> = {
  alta: "bg-destructive",
  media: "bg-warning",
  baja: "bg-success",
}

/* ── Component ── */
interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function SearchCommand({ open, onOpenChange }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [selectedIdx, setSelectedIdx] = useState(0)
  const { customers } = useCustomers()
  const { technicians } = useTechnicians()

  // Focus on open
  useEffect(() => {
    if (open) {
      setQuery("")
      setSelectedIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Build flat list of results
  const results = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return []

    const items: { category: string; id: string; label: string; sub: string; href: string; icon: typeof ClipboardList; meta?: string }[] = []

    // Work orders
    for (const wo of WORK_ORDERS) {
      const hay = [wo.id, wo.customer, wo.type, wo.address].some(s => s.toLowerCase().includes(q))
      if (hay) {
        items.push({
          category: "Ordenes de Trabajo",
          id: wo.id,
          label: wo.id,
          sub: `${wo.customer} - ${wo.type}`,
          href: `/orden/${wo.id}`,
          icon: ClipboardList,
          meta: wo.priority,
        })
      }
    }

    // Customers
    for (const c of customers) {
      const hay = [c.name, c.email, c.phone, c.address, c.id].some(s => s.toLowerCase().includes(q))
      if (hay) {
        items.push({
          category: "Clientes",
          id: c.id,
          label: c.name,
          sub: `${c.phone}  |  ${c.address}`,
          href: `/clientes/${c.id}`,
          icon: User,
        })
      }
    }

    // Technicians
    for (const t of technicians) {
      const hay = [t.name, t.email, t.phone, t.id, t.role, ...t.specialties].some(s => s.toLowerCase().includes(q))
      if (hay) {
        items.push({
          category: "Tecnicos",
          id: t.id,
          label: t.name,
          sub: `${t.role}  |  ${(t.specialties || []).join(", ")}`,
          href: `/tecnicos/${t.id}`,
          icon: Wrench,
          meta: String(t.rating),
        })
      }
    }

    return items
  }, [query, customers, technicians])

  const navigate = useCallback((href: string) => {
    onOpenChange(false)
    router.push(href)
  }, [onOpenChange, router])

  // Keyboard nav
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIdx(i => Math.min(i + 1, results.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIdx(i => Math.max(i - 1, 0))
      } else if (e.key === "Enter" && results[selectedIdx]) {
        e.preventDefault()
        navigate(results[selectedIdx].href)
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, results, selectedIdx, navigate])

  // Clamp selectedIdx when results change
  useEffect(() => {
    setSelectedIdx(0)
  }, [results.length])

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, typeof results>()
    for (const r of results) {
      const arr = map.get(r.category) ?? []
      arr.push(r)
      map.set(r.category, arr)
    }
    return map
  }, [results])

  let flatIdx = -1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden">
        <DialogTitle className="sr-only">Buscar en ServicePro</DialogTitle>
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar orden #, cliente o tecnico..."
            className="flex-1 h-12 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground"
            >
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                ESC
              </kbd>
            </button>
          )}
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[380px]">
          {query.trim() === "" ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <Search className="h-8 w-8 opacity-30" />
              <p className="text-sm">Escribe para buscar</p>
              <p className="text-[11px] opacity-60">Ordenes, clientes o tecnicos</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <Hash className="h-8 w-8 opacity-30" />
              <p className="text-sm">Sin resultados para &quot;{query}&quot;</p>
              <p className="text-[11px] opacity-60">Intenta con otro termino de busqueda</p>
            </div>
          ) : (
            <div className="py-1">
              {Array.from(grouped).map(([category, items]) => (
                <div key={category}>
                  <div className="px-4 py-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{category}</p>
                  </div>
                  {items.map((item) => {
                    flatIdx++
                    const idx = flatIdx
                    const isSelected = idx === selectedIdx
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigate(item.href)}
                        onMouseEnter={() => setSelectedIdx(idx)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                          isSelected ? "bg-primary/10" : "hover:bg-muted/50"
                        )}
                      >
                        <div className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={cn("text-sm font-medium truncate", isSelected ? "text-primary" : "text-foreground")}>
                              {item.label}
                            </p>
                            {item.meta && item.category === "Ordenes de Trabajo" && (
                              <span className={cn("h-2 w-2 rounded-full shrink-0", priorityDot[item.meta] ?? "bg-muted-foreground")} />
                            )}
                            {item.meta && item.category === "Tecnicos" && (
                              <span className="flex items-center gap-0.5 text-[10px] text-amber-500">
                                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                                {item.meta}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">{item.sub}</p>
                        </div>
                        <ArrowRight className={cn(
                          "h-3.5 w-3.5 shrink-0 transition-opacity",
                          isSelected ? "opacity-70 text-primary" : "opacity-0"
                        )} />
                      </button>
                    )
                  })}
                </div>
              ))}
              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-border mt-1">
                <p className="text-[10px] text-muted-foreground">{results.length} resultado{results.length !== 1 && "s"}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">{"↑↓"}</kbd>
                  <span>navegar</span>
                  <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">{"↵"}</kbd>
                  <span>abrir</span>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
