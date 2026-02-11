"use client"

import React from "react"

import { useRef, useState, useCallback } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Technician, ScheduledBlock, WorkOrder } from "./dispatch-calendar"

const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
const HOUR_WIDTH = 120
const ROW_HEIGHT = 72
const HEADER_HEIGHT = 40
const TECH_COL_WIDTH = 200

const statusColors: Record<string, string> = {
  disponible: "bg-success",
  ocupado: "bg-warning",
  desconectado: "bg-muted-foreground",
}

const blockColors = [
  "bg-primary/80 text-primary-foreground",
  "bg-chart-2/80 text-foreground",
  "bg-chart-4/80 text-foreground",
  "bg-chart-5/80 text-primary-foreground",
  "bg-primary/60 text-primary-foreground",
]

function getBlockColor(index: number) {
  return blockColors[index % blockColors.length]
}

function hourToX(hour: number): number {
  return (hour - HOURS[0]) * HOUR_WIDTH
}

interface TimelineGridProps {
  technicians: Technician[]
  blocks: ScheduledBlock[]
  draggingOrder: WorkOrder | null
  onDropOnTimeline: (techId: string, hour: number) => void
  onRemoveBlock: (blockId: string) => void
}

export function TimelineGrid({
  technicians,
  blocks,
  draggingOrder,
  onDropOnTimeline,
  onRemoveBlock,
}: TimelineGridProps) {
  const [dropTarget, setDropTarget] = useState<{ techId: string; hour: number } | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const now = new Date()
  const currentHour = now.getHours() + now.getMinutes() / 60
  const nowX = hourToX(currentHour)
  const showNowLine = currentHour >= HOURS[0] && currentHour <= HOURS[HOURS.length - 1] + 1

  const handleDragOver = useCallback(
    (e: React.DragEvent, techId: string) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = "move"
      if (!draggingOrder) return

      // Use the row element itself to compute position relative to the timeline area
      const rowEl = e.currentTarget as HTMLElement
      const rowRect = rowEl.getBoundingClientRect()
      const x = e.clientX - rowRect.left
      const rawHour = HOURS[0] + x / HOUR_WIDTH
      const snappedHour = Math.round(rawHour * 2) / 2
      const clampedHour = Math.max(HOURS[0], Math.min(snappedHour, HOURS[HOURS.length - 1] + 1 - draggingOrder.durationHours))

      setDropTarget({ techId, hour: clampedHour })
    },
    [draggingOrder]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent, _techId: string) => {
      e.preventDefault()
      if (!dropTarget) return
      onDropOnTimeline(dropTarget.techId, dropTarget.hour)
      setDropTarget(null)
    },
    [dropTarget, onDropOnTimeline]
  )

  const handleDragLeave = useCallback(() => {
    setDropTarget(null)
  }, [])

  const totalWidth = HOURS.length * HOUR_WIDTH

  return (
    <div className="flex flex-col h-full border border-border rounded-lg bg-card shadow-sm overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card shrink-0">
        <h3 className="text-sm font-semibold text-foreground">Calendario de Despacho</h3>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary/80" />
            Asignado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary/30 border border-dashed border-primary" />
            Vista previa
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1" type="always">
        <div ref={gridRef} className="relative" style={{ minWidth: TECH_COL_WIDTH + totalWidth }}>
          {/* Hours header row */}
          <div className="flex sticky top-0 z-20 bg-card border-b border-border">
            {/* Tech name column header */}
            <div
              className="shrink-0 flex items-center px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-r border-border bg-secondary/50"
              style={{ width: TECH_COL_WIDTH, height: HEADER_HEIGHT }}
            >
              Tecnico
            </div>
            {/* Hour columns */}
            <div className="relative flex" style={{ width: totalWidth, height: HEADER_HEIGHT }}>
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="flex items-center justify-center text-xs font-medium text-muted-foreground border-r border-border"
                  style={{ width: HOUR_WIDTH }}
                >
                  {hour.toString().padStart(2, "0")}:00
                </div>
              ))}
            </div>
          </div>

          {/* Technician rows */}
          {technicians.map((tech, techIndex) => {
            const techBlocks = blocks.filter((b) => b.techId === tech.id)
            const isDropRow = dropTarget?.techId === tech.id

            return (
              <div key={tech.id} className="flex border-b border-border last:border-b-0">
                {/* Tech name cell */}
                <div
                  className="shrink-0 flex items-center gap-3 px-4 border-r border-border bg-card"
                  style={{ width: TECH_COL_WIDTH, height: ROW_HEIGHT }}
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                        {tech.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card",
                        statusColors[tech.status]
                      )}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{tech.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{tech.role}</p>
                  </div>
                </div>

                {/* Timeline row */}
                <div
                  className={cn(
                    "relative",
                    isDropRow && "bg-primary/5"
                  )}
                  style={{ width: totalWidth, height: ROW_HEIGHT }}
                  onDragOver={(e) => handleDragOver(e, tech.id)}
                  onDrop={(e) => handleDrop(e, tech.id)}
                  onDragLeave={handleDragLeave}
                >
                  {/* Vertical grid lines */}
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="absolute top-0 bottom-0 border-r border-border/50"
                      style={{ left: hourToX(hour) }}
                    />
                  ))}

                  {/* Alternating half-hour subtle lines */}
                  {HOURS.map((hour) => (
                    <div
                      key={`half-${hour}`}
                      className="absolute top-0 bottom-0 border-r border-dashed border-border/30"
                      style={{ left: hourToX(hour) + HOUR_WIDTH / 2 }}
                    />
                  ))}

                  {/* Scheduled blocks */}
                  {techBlocks.map((block, i) => {
                    const left = hourToX(block.startHour)
                    const width = block.durationHours * HOUR_WIDTH
                    const colorClass = getBlockColor(techIndex + i)
                    return (
                      <div
                        key={block.id}
                        className={cn(
                          "absolute top-2 bottom-2 rounded-md flex items-center px-3 gap-2 group cursor-default transition-shadow hover:shadow-lg",
                          colorClass
                        )}
                        style={{ left, width: Math.max(width, 48) }}
                        title={`${block.orderId} - ${block.customer}`}
                      >
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="text-xs font-semibold truncate">{block.orderId}</p>
                          <p className="text-[10px] opacity-80 truncate">{block.customer} - {block.type}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveBlock(block.id)}
                          className="opacity-0 group-hover:opacity-100 shrink-0 h-5 w-5 rounded-full bg-foreground/20 hover:bg-foreground/40 flex items-center justify-center transition-opacity"
                          aria-label={`Quitar ${block.orderId}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )
                  })}

                  {/* Drop preview ghost */}
                  {isDropRow && dropTarget && draggingOrder && (
                    <div
                      className="absolute top-2 bottom-2 rounded-md border-2 border-dashed border-primary bg-primary/10 flex items-center justify-center pointer-events-none"
                      style={{
                        left: hourToX(dropTarget.hour),
                        width: draggingOrder.durationHours * HOUR_WIDTH,
                      }}
                    >
                      <span className="text-xs font-medium text-primary">
                        {draggingOrder.id}
                      </span>
                    </div>
                  )}

                  {/* Current time indicator */}
                  {showNowLine && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-destructive z-10 pointer-events-none"
                      style={{ left: nowX }}
                    >
                      <div className="absolute -top-0.5 -left-1 h-2 w-2 rounded-full bg-destructive" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Footer summary */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-secondary/30 shrink-0">
        <span className="text-xs text-muted-foreground">
          {blocks.length} ordenes programadas hoy
        </span>
        <div className="flex items-center gap-3">
          {technicians.map((tech) => {
            const techBlockCount = blocks.filter((b) => b.techId === tech.id).length
            return (
              <Badge
                key={tech.id}
                variant="outline"
                className="text-[10px] bg-transparent gap-1 px-2"
              >
                {tech.initials}: {techBlockCount}
              </Badge>
            )
          })}
        </div>
      </div>
    </div>
  )
}
