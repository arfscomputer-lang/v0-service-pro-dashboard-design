"use client"

import { useState, useEffect, useCallback } from "react"

export interface LiveEvent {
  id: string
  type: "status_change" | "location_update" | "new_order" | "completed"
  technicianName: string
  technicianInitials: string
  orderId?: string
  message: string
  timestamp: Date
}

const techNames = [
  { name: "Luis Hernandez", initials: "LH" },
  { name: "Ana Torres", initials: "AT" },
  { name: "Pedro Sanchez", initials: "PS" },
  { name: "Sofia Morales", initials: "SM" },
  { name: "Carlos Vega", initials: "CV" },
  { name: "Miguel Flores", initials: "MF" },
]

const eventTemplates = [
  { type: "status_change" as const, messages: ["cambio a En Viaje", "cambio a En Sitio", "inicio la tarea"] },
  { type: "location_update" as const, messages: ["actualizo su ubicacion GPS", "esta a 5 min del destino", "se esta acercando al sitio"] },
  { type: "new_order" as const, messages: ["recibio nueva asignacion", "fue asignado automaticamente"] },
  { type: "completed" as const, messages: ["completo la orden", "finalizo el trabajo", "cerro la orden con exito"] },
]

function generateEvent(): LiveEvent {
  const tech = techNames[Math.floor(Math.random() * techNames.length)]
  const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)]
  const message = template.messages[Math.floor(Math.random() * template.messages.length)]
  const orderId = `OT-${1040 + Math.floor(Math.random() * 20)}`

  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: template.type,
    technicianName: tech.name,
    technicianInitials: tech.initials,
    orderId,
    message: `${message} (${orderId})`,
    timestamp: new Date(),
  }
}

export function useRealtimeStatus(maxEvents = 8) {
  // Initialize empty to avoid hydration mismatch (Math.random / new Date differ server vs client)
  const [events, setEvents] = useState<LiveEvent[]>([])
  const [isConnected, setIsConnected] = useState(true)
  const [lastPing, setLastPing] = useState<Date | null>(null)

  const addEvent = useCallback(
    (event: LiveEvent) => {
      setEvents((prev) => [event, ...prev].slice(0, maxEvents))
      setLastPing(new Date())
    },
    [maxEvents]
  )

  useEffect(() => {
    // Seed initial events only on the client after mount
    const initial: LiveEvent[] = Array.from({ length: 3 }, () => generateEvent())
    setEvents(initial)
    setLastPing(new Date())

    const interval = setInterval(() => {
      addEvent(generateEvent())
    }, 4000 + Math.random() * 6000)

    return () => clearInterval(interval)
  }, [addEvent])

  return {
    events,
    isConnected,
    lastPing,
    toggleConnection: () => setIsConnected((c) => !c),
  }
}
