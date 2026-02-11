"use client"

import { useState, useCallback } from "react"
import { UnassignedOrders } from "./unassigned-orders"
import { TimelineGrid } from "./timeline-grid"

// ── Shared Types ──────────────────────────────────────────────────────

export interface WorkOrder {
  id: string
  customer: string
  address: string
  type: string
  priority: "alta" | "media" | "baja"
  durationHours: number
}

export interface Technician {
  id: string
  name: string
  initials: string
  role: string
  status: "disponible" | "ocupado" | "desconectado"
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

// ── Seed Data ─────────────────────────────────────────────────────────

const initialUnassigned: WorkOrder[] = [
  {
    id: "OT-1050",
    customer: "Maria Gonzalez",
    address: "Av. Reforma 450, Col. Centro",
    type: "Reparacion HVAC",
    priority: "alta",
    durationHours: 2,
  },
  {
    id: "OT-1051",
    customer: "Fernando Lopez",
    address: "Av. Universidad 1200",
    type: "Inspeccion Gas",
    priority: "alta",
    durationHours: 1.5,
  },
  {
    id: "OT-1052",
    customer: "Patricia Herrera",
    address: "Col. Roma Norte 78",
    type: "Reparacion Electrica",
    priority: "media",
    durationHours: 2,
  },
  {
    id: "OT-1053",
    customer: "Laura Castillo",
    address: "Calle Juarez 340",
    type: "Mantenimiento Plomeria",
    priority: "media",
    durationHours: 1.5,
  },
  {
    id: "OT-1054",
    customer: "Diego Ramirez",
    address: "Av. Chapultepec 560",
    type: "Instalacion Panel Solar",
    priority: "baja",
    durationHours: 3,
  },
  {
    id: "OT-1055",
    customer: "Alejandra Ruiz",
    address: "Blvd. Insurgentes 890",
    type: "Revision Caldera",
    priority: "alta",
    durationHours: 1,
  },
  {
    id: "OT-1056",
    customer: "Roberto Martinez",
    address: "Calle 5 de Mayo 220",
    type: "Mantenimiento General",
    priority: "baja",
    durationHours: 2,
  },
]

const technicians: Technician[] = [
  { id: "tech-1", name: "Luis Hernandez", initials: "LH", role: "Especialista HVAC", status: "ocupado" },
  { id: "tech-2", name: "Ana Torres", initials: "AT", role: "Electricista Senior", status: "ocupado" },
  { id: "tech-3", name: "Pedro Sanchez", initials: "PS", role: "Plomero", status: "disponible" },
  { id: "tech-4", name: "Sofia Morales", initials: "SM", role: "Inspectora de Gas", status: "disponible" },
  { id: "tech-5", name: "Carlos Vega", initials: "CV", role: "Paneles Solares", status: "ocupado" },
  { id: "tech-6", name: "Miguel Flores", initials: "MF", role: "Mantenimiento General", status: "disponible" },
]

const initialBlocks: ScheduledBlock[] = [
  {
    id: "blk-1",
    orderId: "OT-1042",
    customer: "Empresa Alfa",
    type: "Reparacion HVAC",
    techId: "tech-1",
    startHour: 8,
    durationHours: 2,
  },
  {
    id: "blk-2",
    orderId: "OT-1043",
    customer: "Roberto Martinez",
    type: "Instalacion Electrica",
    techId: "tech-2",
    startHour: 9.5,
    durationHours: 2,
  },
  {
    id: "blk-3",
    orderId: "OT-1044",
    customer: "Alejandra Ruiz",
    type: "Mantenimiento Plomeria",
    techId: "tech-3",
    startHour: 10,
    durationHours: 2,
  },
  {
    id: "blk-4",
    orderId: "OT-1047",
    customer: "Diego Ramirez",
    type: "Instalacion Panel Solar",
    techId: "tech-5",
    startHour: 14,
    durationHours: 3,
  },
  {
    id: "blk-5",
    orderId: "OT-1046",
    customer: "Laura Castillo",
    type: "Reparacion HVAC",
    techId: "tech-1",
    startHour: 13,
    durationHours: 2,
  },
]

// ── Component ────────────────────────────────────────────────────────

export function DispatchCalendar() {
  const [unassigned, setUnassigned] = useState<WorkOrder[]>(initialUnassigned)
  const [blocks, setBlocks] = useState<ScheduledBlock[]>(initialBlocks)
  const [draggingOrder, setDraggingOrder] = useState<WorkOrder | null>(null)

  const handleDragStart = useCallback((order: WorkOrder) => {
    setDraggingOrder(order)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggingOrder(null)
  }, [])

  const handleDropOnTimeline = useCallback(
    (techId: string, startHour: number) => {
      if (!draggingOrder) return

      const newBlock: ScheduledBlock = {
        id: `blk-${Date.now()}`,
        orderId: draggingOrder.id,
        customer: draggingOrder.customer,
        type: draggingOrder.type,
        techId,
        startHour,
        durationHours: draggingOrder.durationHours,
      }

      setBlocks((prev) => [...prev, newBlock])
      setUnassigned((prev) => prev.filter((o) => o.id !== draggingOrder.id))
      setDraggingOrder(null)
    },
    [draggingOrder]
  )

  const handleRemoveBlock = useCallback((blockId: string) => {
    setBlocks((prev) => {
      const block = prev.find((b) => b.id === blockId)
      if (block) {
        // Return the order to the unassigned list
        const restoredOrder: WorkOrder = {
          id: block.orderId,
          customer: block.customer,
          address: "",
          type: block.type,
          priority: "media",
          durationHours: block.durationHours,
        }
        setUnassigned((prevU) => [...prevU, restoredOrder])
      }
      return prev.filter((b) => b.id !== blockId)
    })
  }, [])

  return (
    <div className="flex h-full gap-4">
      {/* Left panel: Unassigned orders */}
      <div className="w-[300px] shrink-0">
        <UnassignedOrders
          orders={unassigned}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />
      </div>

      {/* Right panel: Timeline grid */}
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
  )
}
