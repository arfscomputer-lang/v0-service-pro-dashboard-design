"use client"

import React from "react"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Clock,
  MapPin,
  Flame,
  GripVertical,
  Wrench,
  Zap,
  Droplets,
  Sun,
  Thermometer,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { WorkOrder } from "./dispatch-calendar"

const priorityConfig = {
  alta: { label: "Alta", className: "bg-destructive/10 text-destructive border-destructive/30" },
  media: { label: "Media", className: "bg-warning/10 text-warning border-warning/30" },
  baja: { label: "Baja", className: "bg-muted text-muted-foreground border-border" },
}

const typeIcons: Record<string, React.ElementType> = {
  "Reparacion HVAC": Thermometer,
  "Instalacion Electrica": Zap,
  "Mantenimiento Plomeria": Droplets,
  "Inspeccion Gas": Flame,
  "Reparacion Electrica": Zap,
  "Instalacion Panel Solar": Sun,
  "Mantenimiento General": Wrench,
  "Revision Caldera": Flame,
}

interface UnassignedOrdersProps {
  orders: WorkOrder[]
  onDragStart: (order: WorkOrder) => void
  onDragEnd: () => void
}

export function UnassignedOrders({ orders, onDragStart, onDragEnd }: UnassignedOrdersProps) {
  return (
    <Card className="border border-border bg-card shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground">
            Ordenes Sin Asignar
          </CardTitle>
          <Badge
            variant="secondary"
            className="text-xs font-semibold bg-destructive/10 text-destructive border-none"
          >
            {orders.length}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Arrastra una orden al calendario para asignarla
        </p>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden px-0 pb-0">
        <ScrollArea className="h-full">
          <div className="space-y-2 px-4 pb-4">
            {orders.map((order) => {
              const priority = priorityConfig[order.priority]
              const TypeIcon = typeIcons[order.type] || Wrench
              return (
                <div
                  key={order.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move"
                    e.dataTransfer.setData("text/plain", order.id)
                    onDragStart(order)
                  }}
                  onDragEnd={onDragEnd}
                  className={cn(
                    "group relative rounded-lg border bg-card p-3 cursor-grab active:cursor-grabbing",
                    "hover:shadow-md hover:border-primary/30 transition-all duration-150",
                    "active:opacity-70 active:scale-[0.98]"
                  )}
                >
                  {/* Grip handle */}
                  <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-opacity">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="pl-3">
                    {/* Header row */}
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/orden/${order.id}`}
                        className="text-[11px] font-mono text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {order.id}
                      </Link>
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] px-1.5 py-0 h-5", priority.className)}
                      >
                        {priority.label}
                      </Badge>
                    </div>

                    {/* Customer */}
                    <p className="text-sm font-medium text-foreground mt-1.5 truncate">
                      {order.customer}
                    </p>

                    {/* Type chip */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <TypeIcon className="h-3.5 w-3.5 text-primary/70" />
                      <span className="text-xs text-muted-foreground">{order.type}</span>
                    </div>

                    {/* Address */}
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{order.address}</span>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>Duracion est.: {order.durationHours}h</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
