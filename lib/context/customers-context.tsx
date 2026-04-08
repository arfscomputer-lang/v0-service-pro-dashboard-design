"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { Customer, CustomerType, CustomerTag, Interaction, ServiceRecord } from "@/lib/data/customers"
import { authenticatedFetch } from "@/lib/authenticated-fetch"

interface CustomersContextValue {
  customers: Customer[]
  isLoading: boolean
  getCustomer: (id: string) => Customer | undefined
  addCustomer: (data: Omit<Customer, "id" | "initials">) => Promise<Customer>
  updateCustomer: (id: string, patch: Partial<Customer>) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>
  refreshCustomers: () => Promise<void>
  addInteraction: (customerId: string, interaction: Omit<Interaction, "id">) => void
  deleteInteraction: (customerId: string, interactionId: string) => void
  addService: (customerId: string, service: ServiceRecord) => void
  addTag: (customerId: string, tag: CustomerTag) => void
  removeTag: (customerId: string, tag: CustomerTag) => void
  autoVip: (customerId: string) => void
}

const CustomersContext = createContext<CustomersContextValue | null>(null)

function makeInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("")
}

let nextIntId = 500

/* Normalise a customer row coming from the DB (or API) so that
   every array/number field that the UI relies on is never undefined */
function normalizeCustomer(c: any): Customer {
  return {
    ...c,
    tags: Array.isArray(c.tags) ? c.tags : [],
    branches: Array.isArray(c.branches) ? c.branches : [],
    interactions: Array.isArray(c.interactions) ? c.interactions : [],
    services: Array.isArray(c.services) ? c.services : [],
    totalSpent: c.totalSpent ?? c.total_spent ?? 0,
    lifetimeValue: c.lifetimeValue ?? c.lifetime_value ?? 0,
    nps: c.nps ?? c.nps_score ?? null,
    initials: c.initials || (c.name ? c.name.split(" ").filter(Boolean).map((w: string) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("") : "??"),
    createdAt: c.createdAt ?? c.created_at ?? new Date().toISOString().slice(0, 10),
    preferredSchedule: c.preferredSchedule ?? c.preferred_schedule ?? "",
    notes: c.notes ?? "",
  }
}

export function CustomersProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch customers from database on mount
  const refreshCustomers = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await authenticatedFetch("/api/customers")
      if (!response.ok) throw new Error("Failed to fetch customers")
      const data = await response.json()
      setCustomers((data.customers || []).map(normalizeCustomer))
    } catch (error) {
      console.error("[v0] Error fetching customers, using seed data:", error)
      // Fallback to seed data if API fails
      const { customerSeed } = await import("@/lib/data/customers")
      setCustomers(customerSeed)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshCustomers()
  }, [refreshCustomers])

  const getCustomer = useCallback(
    (id: string) => customers.find((c) => c.id === id),
    [customers]
  )

  const addCustomer = useCallback(async (data: Omit<Customer, "id" | "initials">) => {
    try {
      const response = await authenticatedFetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          lat: data.lat,
          lng: data.lng,
          type: data.type,
        }),
      })

      const result = await response.json()
      console.log("[v0] addCustomer API response:", response.status, JSON.stringify(result))
      if (response.ok && result.customer) {
        const newCustomer: Customer = {
          ...data,
          id: result.customer.id,
          initials: makeInitials(data.name),
        }
        setCustomers((prev) => [...prev, newCustomer])
        return newCustomer
      }
      throw new Error(result.error || "Failed to create customer")
    } catch (error) {
      console.error("[v0] Error adding customer:", error)
      throw error
    }
  }, [])

  const updateCustomer = useCallback(async (id: string, patch: Partial<Customer>) => {
    try {
      const payload = {
        name: patch.name,
        email: patch.email,
        phone: patch.phone,
        address: patch.address,
        city: patch.city,
        lat: patch.lat,
        lng: patch.lng,
        type: patch.type,
        nps_score: patch.nps,
        rating: patch.nps,
      }
      console.log("[v0] updateCustomer called with id:", id, "payload:", JSON.stringify(payload))
      const response = await authenticatedFetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()
      console.log("[v0] updateCustomer API response:", response.status, JSON.stringify(result))

      if (response.ok) {
        setCustomers((prev) =>
          prev.map((c) => {
            if (c.id !== id) return c
            const updated = { ...c, ...patch }
            if (patch.name) updated.initials = makeInitials(patch.name)
            return updated
          })
        )
      } else {
        console.error("[v0] updateCustomer API error:", result.error)
      }
    } catch (error) {
      console.error("[v0] Error updating customer:", error)
    }
  }, [])

  const deleteCustomer = useCallback(async (id: string) => {
    try {
      const response = await authenticatedFetch(`/api/customers/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setCustomers((prev) => prev.filter((c) => c.id !== id))
        console.log("[v0] Deleted customer from database:", id)
      }
    } catch (error) {
      console.error("[v0] Error deleting customer:", error)
    }
  }, [])

  // Local-only operations (not yet persisted to DB)
  const addInteraction = useCallback((customerId: string, interaction: Omit<Interaction, "id">) => {
    const id = `int-${String(++nextIntId).padStart(3, "0")}`
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customerId) return c
        const interactions = c.interactions || []
        return { ...c, interactions: [{ ...interaction, id }, ...interactions] }
      })
    )
  }, [])

  const deleteInteraction = useCallback((customerId: string, interactionId: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customerId) return c
        const interactions = c.interactions || []
        return { ...c, interactions: interactions.filter((i) => i.id !== interactionId) }
      })
    )
  }, [])

  const addService = useCallback((customerId: string, service: ServiceRecord) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customerId) return c
        const services = c.services || []
        const totalSpent = c.totalSpent || 0
        const lifetimeValue = c.lifetimeValue || 0
        const newTotal = totalSpent + service.amount
        return {
          ...c,
          services: [service, ...services],
          totalSpent: newTotal,
          lifetimeValue: Math.max(lifetimeValue, newTotal),
        }
      })
    )
  }, [])

  const addTag = useCallback((customerId: string, tag: CustomerTag) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customerId) return c
        const tags = c.tags || []
        if (tags.includes(tag)) return c
        return { ...c, tags: [...tags, tag] }
      })
    )
  }, [])

  const removeTag = useCallback((customerId: string, tag: CustomerTag) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customerId) return c
        const tags = c.tags || []
        return { ...c, tags: tags.filter((t) => t !== tag) }
      })
    )
  }, [])

  const autoVip = useCallback((customerId: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customerId) return c
        const services = c.services || []
        const tags = c.tags || []
        const completed = services.filter((s) => s.status === "completado").length
        if (completed >= 3 && !tags.includes("VIP")) {
          return { ...c, tags: [...tags, "VIP"] }
        }
        return c
      })
    )
  }, [])

  return (
    <CustomersContext.Provider
      value={{
        customers,
        isLoading,
        getCustomer,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        refreshCustomers,
        addInteraction,
        deleteInteraction,
        addService,
        addTag,
        removeTag,
        autoVip,
      }}
    >
      {children}
    </CustomersContext.Provider>
  )
}

export function useCustomers() {
  const ctx = useContext(CustomersContext)
  if (!ctx) throw new Error("useCustomers must be used within CustomersProvider")
  return ctx
}
