"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import type { Customer, CustomerType, CustomerTag, Interaction, ServiceRecord } from "@/lib/data/customers"
import { customerSeed } from "@/lib/data/customers"

interface CustomersContextValue {
  customers: Customer[]
  getCustomer: (id: string) => Customer | undefined
  addCustomer: (data: Omit<Customer, "id" | "initials">) => Customer
  updateCustomer: (id: string, patch: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  addInteraction: (customerId: string, interaction: Omit<Interaction, "id">) => void
  deleteInteraction: (customerId: string, interactionId: string) => void
  addService: (customerId: string, service: ServiceRecord) => void
  addTag: (customerId: string, tag: CustomerTag) => void
  removeTag: (customerId: string, tag: CustomerTag) => void
  autoVip: (customerId: string) => void // auto-promote to VIP if >= 3 services
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

let nextId = 200
let nextIntId = 500

export function CustomersProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(() => [...customerSeed])

  const getCustomer = useCallback(
    (id: string) => customers.find((c) => c.id === id),
    [customers]
  )

  const addCustomer = useCallback((data: Omit<Customer, "id" | "initials">) => {
    const id = `cli-${String(++nextId).padStart(3, "0")}`
    const newCust: Customer = { ...data, id, initials: makeInitials(data.name) }
    setCustomers((prev) => [...prev, newCust])
    return newCust
  }, [])

  const updateCustomer = useCallback((id: string, patch: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c
        const updated = { ...c, ...patch }
        if (patch.name) updated.initials = makeInitials(patch.name)
        return updated
      })
    )
  }, [])

  const deleteCustomer = useCallback((id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const addInteraction = useCallback((customerId: string, interaction: Omit<Interaction, "id">) => {
    const id = `int-${String(++nextIntId).padStart(3, "0")}`
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customerId) return c
        return { ...c, interactions: [{ ...interaction, id }, ...c.interactions] }
      })
    )
  }, [])

  const deleteInteraction = useCallback((customerId: string, interactionId: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customerId) return c
        return { ...c, interactions: c.interactions.filter((i) => i.id !== interactionId) }
      })
    )
  }, [])

  const addService = useCallback((customerId: string, service: ServiceRecord) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customerId) return c
        const newTotal = c.totalSpent + service.amount
        return {
          ...c,
          services: [service, ...c.services],
          totalSpent: newTotal,
          lifetimeValue: Math.max(c.lifetimeValue, newTotal),
        }
      })
    )
  }, [])

  const addTag = useCallback((customerId: string, tag: CustomerTag) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customerId || c.tags.includes(tag)) return c
        return { ...c, tags: [...c.tags, tag] }
      })
    )
  }, [])

  const removeTag = useCallback((customerId: string, tag: CustomerTag) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customerId) return c
        return { ...c, tags: c.tags.filter((t) => t !== tag) }
      })
    )
  }, [])

  // If customer has >= 3 completed services and is not VIP, promote them
  const autoVip = useCallback((customerId: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customerId) return c
        const completed = c.services.filter((s) => s.status === "completado").length
        if (completed >= 3 && !c.tags.includes("VIP")) {
          return { ...c, tags: [...c.tags, "VIP"] }
        }
        return c
      })
    )
  }, [])

  return (
    <CustomersContext.Provider
      value={{
        customers,
        getCustomer,
        addCustomer,
        updateCustomer,
        deleteCustomer,
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
