"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { UnassignedOrders } from "./unassigned-orders"
import { TimelineGrid } from "./timeline-grid"
import { useWorkOrders } from "@/lib/context/work-orders-context"
import { useCustomers } from "@/lib/context/customers-context"

// ── Shared Types ──────────────────────────────────────────────────────
// `id` is always the real work_orders.id (uuid) — used for links, keys, and
// to call the API. `orderNumber`/`orderId` is the human-readable order_id
// (e.g. "OT-1050") — display only.

export interface WorkOrder {
  id: string
  orderNumber: string
  customer: string
  address: string
  type: string
  priority: "baja" | "normal" | "alta" | "urgente"
  durationHours: number
}

export interface Technician {
  id: string
  name: string
  initials: string
  role: string
  status: "disponible" | "ocupado" | "en_viaje" | "desconectado"
}

export interface ScheduledBlock {
  id: string
  orderId: string
  customer: string
  type: string
  techId: string
  startHour: number
  durationHours: number
}

// No explicit duration is tracked on a work order today, so blocks render
// at a fixed width on the timeline.
const DEFAULT_DURATION_HOURS = 2

function timeToHour(time: string | null | undefined): number {
  if (!time) return 8
  const [h, m] = time.split(":").map(Number)
  return (h || 0) + (m || 0) / 60
}

function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

// ── Component ────────────────────────────────────────────────────────

interface DispatchCalendarProps {
  date: Date
}

export function DispatchCalendar({ date }: DispatchCalendarProps) {
  const { workOrders, updateWorkOrder } = useWorkOrders()
  const { customers } = useCustomers()
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [draggingOrder, setDraggingOrder] = useState<WorkOrder | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/technicians")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => setTechnicians(j.data || []))
      .catch(() => setTechnicians([]))
  }, [])

  const customerName = useCallback(
    (customerId: string | null) => customers.find((c) => c.id === customerId)?.name || "Sin cliente",
    [customers]
  )

  const unassigned: WorkOrder[] = useMemo(
    () =>
      workOrders
        .filter((o) => !o.technicianId && o.status === "pendiente")
        .map((o) => ({
          id: o.id,
          orderNumber: o.orderId,
          customer: customerName(o.customerId),
          address: o.address,
          type: o.type,
          priority: o.priority,
          durationHours: DEFAULT_DURATION_HOURS,
        })),
    [workOrders, customerName]
  )

  const isoDate = toISODate(date)
  const blocks: ScheduledBlock[] = useMemo(
    () =>
      workOrders
        .filter((o) => o.technicianId && (o.scheduledDate || "").slice(0, 10) === isoDate)
        .map((o) => ({
          id: o.id,
          orderId: o.orderId,
          customer: customerName(o.customerId),
          type: o.type,
          techId: o.technicianId as string,
          startHour: timeToHour(o.scheduledTime),
          durationHours: DEFAULT_DURATION_HOURS,
        })),
    [workOrders, isoDate, customerName]
  )

  const handleDragStart = useCallback((order: WorkOrder) => setDraggingOrder(order), [])
  const handleDragEnd = useCallback(() => setDraggingOrder(null), [])

  const handleDropOnTimeline = useCallback(
    async (techId: string, startHour: number) => {
      if (!draggingOrder) return
      const order = draggingOrder
      setDraggingOrder(null)
      const hh = Math.floor(startHour).toString().padStart(2, "0")
      const mm = startHour % 1 >= 0.5 ? "30" : "00"
      try {
        await updateWorkOrder(order.id, {
          technicianId: techId,
          scheduledDate: isoDate,
          scheduledTime: `${hh}:${mm}`,
          status: "asignada",
        })
        setError(null)
      } catch {
        setError("No se pudo asignar la orden. Intentá de nuevo.")
      }
    },
    [draggingOrder, isoDate, updateWorkOrder]
  )

  const handleRemoveBlock = useCallback(
    async (blockId: string) => {
      try {
        await updateWorkOrder(blockId, { technicianId: null, status: "pendiente" })
        setError(null)
      } catch {
        setError("No se pudo quitar la asignación. Intentá de nuevo.")
      }
    },
    [updateWorkOrder]
  )

  return (
    <div className="flex h-full flex-col gap-3">
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}
      <div className="flex flex-1 min-h-0 gap-4">
        <div className="w-[300px] shrink-0">
          <UnassignedOrders orders={unassigned} onDragStart={handleDragStart} onDragEnd={handleDragEnd} />
        </div>

        <div className="flex-1 min-w-0">
          <TimelineGrid
            technicians={technicians}
            blocks={blocks}
            draggingOrder={draggingOrder}
            onDropOnTimeline={handleDropOnTimeline}
            onRemoveBlock={handleRemoveBlock}
          />
        </div>
      </div>
    </div>
  )
}
