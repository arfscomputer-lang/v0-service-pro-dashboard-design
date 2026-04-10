'use client'

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react'
import { authenticatedFetch } from '@/lib/authenticated-fetch'

export interface WorkOrder {
  id: string
  orderId: string
  type: string
  description: string
  status: 'pendiente' | 'asignada' | 'en_ruta' | 'en_sitio' | 'completada' | 'cancelada'
  priority: 'baja' | 'normal' | 'alta' | 'urgente'
  address: string
  city: string
  scheduledDate: string
  scheduledTime: string
  customerId: string | null
  technicianId: string | null
  createdAt: string
  updatedAt: string
}

interface WorkOrdersContextType {
  workOrders: WorkOrder[]
  addWorkOrder: (data: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<WorkOrder>
  updateWorkOrder: (id: string, data: Partial<WorkOrder>) => Promise<void>
  deleteWorkOrder: (id: string) => Promise<void>
}

const WorkOrdersContext = createContext<WorkOrdersContextType | undefined>(undefined)

export function WorkOrdersProvider({ children }: { children: React.ReactNode }) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        console.log('[v0] Fetching work orders from API...')
        const res = await authenticatedFetch('/api/work-orders')
        console.log('[v0] API response status:', res.status)
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        const json = await res.json()
        console.log('[v0] API response JSON:', json)
        const list = json.data || json.workOrders || json || []
        console.log('[v0] Parsed work orders list:', list)
        setWorkOrders(Array.isArray(list) ? list : [])
      } catch (error) {
        console.error('[v0] Error fetching work orders:', error)
        setWorkOrders([])
      }
    }
    fetchWorkOrders()
  }, [])

  const addWorkOrder = useCallback(
    async (data: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        // Validation: ensure address and city are not empty
        if (!data.address?.trim() || !data.city?.trim()) {
          const error = new Error('La dirección y ciudad son obligatorias para crear una orden')
          console.error('[v0] Validation failed in addWorkOrder:', error.message)
          throw error
        }
        
        const res = await authenticatedFetch('/api/work-orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: data.orderId,
            type: data.type,
            description: data.description,
            status: data.status,
            priority: data.priority,
            address: data.address.trim(),
            city: data.city.trim(),
            scheduled_date: data.scheduledDate,
            scheduled_time: data.scheduledTime,
            customer_id: data.customerId,
            technician_id: data.technicianId,
          }),
        })

        if (!res.ok) {
          throw new Error(`Failed to create work order: ${res.status}`)
        }

        const result = await res.json()
        const newWorkOrder = result.data || result.workOrder
        setWorkOrders((prev) => [...prev, newWorkOrder])
        return newWorkOrder
      } catch (error) {
        console.error('[v0] Error creating work order:', error)
        throw error
      }
    },
    []
  )

  const updateWorkOrder = useCallback(
    async (id: string, data: Partial<WorkOrder>) => {
      try {
        const payload: Record<string, any> = {}
        if (data.orderId !== undefined) payload.order_id = data.orderId
        if (data.type !== undefined) payload.type = data.type
        if (data.description !== undefined) payload.description = data.description
        if (data.status !== undefined) payload.status = data.status
        if (data.priority !== undefined) payload.priority = data.priority
        if (data.address !== undefined) payload.address = data.address
        if (data.city !== undefined) payload.city = data.city
        if (data.scheduledDate !== undefined) payload.scheduled_date = data.scheduledDate
        if (data.scheduledTime !== undefined) payload.scheduled_time = data.scheduledTime
        if (data.customerId !== undefined) payload.customer_id = data.customerId
        if (data.technicianId !== undefined) payload.technician_id = data.technicianId

        // Call API to update in database
        const res = await fetch(`/api/work-orders/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          throw new Error(`Failed to update work order: ${res.status}`)
        }

        // Update local state after successful API call
        setWorkOrders((prev) =>
          prev.map((wo) => (wo.id !== id ? wo : { ...wo, ...data }))
        )
        
        console.log('[v0] Updated work order in database:', id, data)
      } catch (error) {
        console.error('[v0] Error updating work order:', error)
        throw error
      }
    },
    []
  )

  const deleteWorkOrder = useCallback(
    async (id: string) => {
      try {
        // Call API to delete from database
        const res = await fetch(`/api/work-orders/${id}`, {
          method: 'DELETE',
        })

        if (!res.ok) {
          throw new Error(`Failed to delete work order: ${res.status}`)
        }

        // Update local state after successful API call
        setWorkOrders((prev) => prev.filter((wo) => wo.id !== id))
        console.log('[v0] Deleted work order from database:', id)
      } catch (error) {
        console.error('[v0] Error deleting work order:', error)
        throw error
      }
    },
    []
  )

  return (
    <WorkOrdersContext.Provider value={{ workOrders, addWorkOrder, updateWorkOrder, deleteWorkOrder }}>
      {children}
    </WorkOrdersContext.Provider>
  )
}

export function useWorkOrders() {
  const context = useContext(WorkOrdersContext)
  if (!context) {
    throw new Error('useWorkOrders must be used within WorkOrdersProvider')
  }
  return context
}
