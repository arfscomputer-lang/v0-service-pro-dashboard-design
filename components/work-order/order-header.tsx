"use client"

import { ArrowLeft, Printer, MoreHorizontal, Clock, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface OrderHeaderProps {
  orderId: string
  status: "pendiente" | "en_progreso" | "completada" | "cancelada"
  priority: "alta" | "media" | "baja"
  createdAt: string
  onEdit: () => void
  onStatusChange?: (status: "pendiente" | "en_progreso" | "completada" | "cancelada") => void
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pendiente: {
    label: "Pendiente",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  en_progreso: {
    label: "En Progreso",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  completada: {
    label: "Completada",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  cancelada: {
    label: "Cancelada",
    className: "bg-red-100 text-red-800 border-red-200",
  },
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  alta: {
    label: "Prioridad Alta",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  media: {
    label: "Prioridad Media",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  baja: {
    label: "Prioridad Baja",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
}

export function OrderHeader({ orderId, status, priority, createdAt, onEdit, onStatusChange }: OrderHeaderProps) {
  const st = statusConfig[status]
  const pr = priorityConfig[priority]

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <Link href="/ordenes">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Volver a ordenes</span>
          </Button>
        </Link>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Orden {orderId}
            </h1>
            <Badge variant="outline" className={st.className}>
              {st.label}
            </Badge>
            <Badge variant="outline" className={pr.className}>
              {pr.label}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Creada el {createdAt}</span>
          </div>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-muted-foreground bg-transparent"
          onClick={onEdit}
        >
          <Edit2 className="h-4 w-4" />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-muted-foreground bg-transparent"
          onClick={handlePrint}
        >
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="text-muted-foreground bg-transparent">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Mas opciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>Editar Orden</DropdownMenuItem>
            <DropdownMenuItem onClick={handlePrint}>Imprimir</DropdownMenuItem>
            <DropdownMenuSeparator />
            {onStatusChange && status !== "completada" && (
              <DropdownMenuItem onClick={() => onStatusChange("completada")}>
                Marcar como Completada
              </DropdownMenuItem>
            )}
            {onStatusChange && status !== "cancelada" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onStatusChange("cancelada")}
                >
                  Cancelar Orden
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
