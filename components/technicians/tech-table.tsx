"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import {
  Search,
  Star,
  MapPin,
  Clock,
  ChevronUp,
  ChevronDown,
  Filter,
  Zap,
  Flame,
  Droplets,
  Sun,
  Wrench,
  Wind,
  Pencil,
  Trash2,
  MoreHorizontal,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { TechnicianProfile, TechStatus, TechSpecialty } from "@/lib/data/technicians"

// ── Helpers ──────────────────────────────────────────────────

const statusConfig: Record<TechStatus, { label: string; dot: string; bg: string }> = {
  disponible: { label: "Disponible", dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700" },
  ocupado: { label: "Ocupado", dot: "bg-amber-500", bg: "bg-amber-50 text-amber-700" },
  en_viaje: { label: "En Viaje", dot: "bg-blue-500", bg: "bg-blue-50 text-blue-700" },
  desconectado: { label: "Desconectado", dot: "bg-gray-400", bg: "bg-gray-100 text-gray-500" },
}

const specialtyIcons: Record<TechSpecialty, React.ReactNode> = {
  HVAC: <Wind className="h-3 w-3" />,
  Electricidad: <Zap className="h-3 w-3" />,
  Plomeria: <Droplets className="h-3 w-3" />,
  Gas: <Flame className="h-3 w-3" />,
  Solar: <Sun className="h-3 w-3" />,
  General: <Wrench className="h-3 w-3" />,
}

type SortKey = "name" | "status" | "rating" | "completedJobs" | "avgResponseMin"
type SortDir = "asc" | "desc"

// ── Component ───────────────────────────────────────────────

interface TechTableProps {
  technicians: TechnicianProfile[]
  onEdit: (tech: TechnicianProfile) => void
  onDelete: (tech: TechnicianProfile) => void
  onStatusChange: (id: string, status: TechStatus) => void
}

export function TechTable({ technicians, onEdit, onDelete, onStatusChange }: TechTableProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<TechStatus | "todos">("todos")
  const [specialtyFilter, setSpecialtyFilter] = useState<TechSpecialty | "todas">("todas")
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const filtered = useMemo(() => {
    let list = [...technicians]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.role.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "todos") list = list.filter((t) => t.status === statusFilter)
    if (specialtyFilter !== "todas") list = list.filter((t) => t.specialties.includes(specialtyFilter))
    list.sort((a, b) => {
      let diff = 0
      switch (sortKey) {
        case "name": diff = a.name.localeCompare(b.name); break
        case "status": diff = a.status.localeCompare(b.status); break
        case "rating": diff = a.rating - b.rating; break
        case "completedJobs": diff = a.completedJobs - b.completedJobs; break
        case "avgResponseMin": diff = a.avgResponseMin - b.avgResponseMin; break
      }
      return sortDir === "asc" ? diff : -diff
    })
    return list
  }, [technicians, search, statusFilter, specialtyFilter, sortKey, sortDir])

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp className="h-3 w-3 opacity-30" />
    return sortDir === "asc" ? <ChevronUp className="h-3 w-3 text-primary" /> : <ChevronDown className="h-3 w-3 text-primary" />
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = { todos: technicians.length }
    for (const t of technicians) c[t.status] = (c[t.status] || 0) + 1
    return c
  }, [technicians])

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nombre, rol o email..." className="pl-10 bg-card" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {(["todos", "disponible", "ocupado", "en_viaje", "desconectado"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
                statusFilter === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              )}
            >
              {s === "todos" ? "Todos" : statusConfig[s].label}
              <span className="ml-1 opacity-70">({counts[s] || 0})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Specialty filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Especialidad:</span>
        {(["todas", "HVAC", "Electricidad", "Plomeria", "Gas", "Solar", "General"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSpecialtyFilter(s)}
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border transition-colors",
              specialtyFilter === s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:bg-muted"
            )}
          >
            {s !== "todas" && specialtyIcons[s]}
            {s === "todas" ? "Todas" : s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  <button type="button" onClick={() => toggleSort("name")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Tecnico <SortIcon col="name" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Especialidades</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  <button type="button" onClick={() => toggleSort("status")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Estado <SortIcon col="status" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  <button type="button" onClick={() => toggleSort("rating")} className="flex items-center justify-center gap-1 hover:text-foreground transition-colors">
                    Calif. <SortIcon col="rating" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  <button type="button" onClick={() => toggleSort("completedJobs")} className="flex items-center justify-center gap-1 hover:text-foreground transition-colors">
                    Trabajos <SortIcon col="completedJobs" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  <button type="button" onClick={() => toggleSort("avgResponseMin")} className="flex items-center justify-center gap-1 hover:text-foreground transition-colors">
                    Resp. <SortIcon col="avgResponseMin" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ubicacion</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tech) => {
                const st = statusConfig[tech.status]
                return (
                  <tr key={tech.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{tech.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <Link href={`/tecnicos/${tech.id}`} className="text-sm font-semibold text-foreground hover:text-primary hover:underline transition-colors">
                            {tech.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">{tech.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {tech.specialties.map((sp) => (
                          <Badge key={sp} variant="outline" className="gap-1 text-[10px] px-1.5 py-0 border-border text-muted-foreground">
                            {specialtyIcons[sp]} {sp}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    {/* Status -- clickable dropdown to change */}
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button type="button" className="cursor-pointer">
                            <Badge variant="outline" className={cn("gap-1.5 text-xs font-medium border-0", st.bg)}>
                              <span className={cn("h-2 w-2 rounded-full", st.dot, tech.status !== "desconectado" && "animate-pulse")} />
                              {st.label}
                            </Badge>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {(Object.entries(statusConfig) as [TechStatus, typeof st][]).map(([key, val]) => (
                            <DropdownMenuItem
                              key={key}
                              onClick={() => onStatusChange(tech.id, key)}
                              className={cn(tech.status === key && "bg-muted")}
                            >
                              <span className={cn("h-2 w-2 rounded-full mr-2", val.dot)} />
                              {val.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-foreground">{tech.rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-foreground">{tech.completedJobs}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className="text-foreground font-medium">{tech.avgResponseMin} min</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0 text-primary" />
                        <span className="truncate max-w-[120px]">{tech.address}</span>
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Acciones para {tech.name}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/tecnicos/${tech.id}`}>Ver Perfil</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(tech)}>
                            <Pencil className="h-3.5 w-3.5 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Cambiar Estado</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {(Object.entries(statusConfig) as [TechStatus, typeof st][]).map(([key, val]) => (
                                <DropdownMenuItem key={key} onClick={() => onStatusChange(tech.id, key)}>
                                  <span className={cn("h-2 w-2 rounded-full mr-2", val.dot)} />
                                  {val.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(tech)}>
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No se encontraron tecnicos con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2.5">
          <span className="text-xs text-muted-foreground">Mostrando {filtered.length} de {technicians.length} tecnicos</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{counts.disponible || 0} disponibles</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="text-xs text-muted-foreground">{counts.ocupado || 0} ocupados</span>
          </div>
        </div>
      </div>
    </div>
  )
}
