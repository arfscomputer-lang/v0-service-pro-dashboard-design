"use client"

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react"
import type { InventoryItem, StockMovement, ItemCategory, StockLocation } from "@/lib/data/inventory"

interface InventoryContextValue {
  items: InventoryItem[]
  isLoading: boolean
  getItem: (id: string) => InventoryItem | undefined
  addItem: (data: Omit<InventoryItem, "id">) => Promise<InventoryItem>
  updateItem: (id: string, patch: Partial<InventoryItem>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  refreshItems: () => Promise<void>
  addMovement: (itemId: string, mov: Omit<StockMovement, "id">) => void
  updateStock: (itemId: string, locationId: string, newQty: number) => void
  addLocation: (itemId: string, loc: StockLocation) => void
  lowStockItems: InventoryItem[]
  totalValue: number
}

const InventoryContext = createContext<InventoryContextValue | null>(null)

let nextMovId = 200

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch inventory from database on mount
  const refreshItems = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/inventory")
      if (!response.ok) throw new Error("Failed to fetch inventory")
      const data = await response.json()
      setItems(data.items || [])
    } catch (error) {
      console.error("[v0] Error fetching inventory, using seed data:", error)
      // Fallback to seed data if API fails
      const { inventorySeed } = await import("@/lib/data/inventory")
      setItems(inventorySeed)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshItems()
  }, [refreshItems])

  const getItem = useCallback(
    (id: string) => items.find((i) => i.id === id),
    [items]
  )

  const addItem = useCallback(async (data: Omit<InventoryItem, "id">) => {
    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: data.sku,
          name: data.name,
          category: data.category,
          description: data.description,
          unit_cost: data.costUnit,
          min_threshold: data.minStock,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        const newItem: InventoryItem = {
          ...data,
          id: result.item.id,
        }
        setItems((prev) => [...prev, newItem])
        console.log("[v0] Added item to database:", newItem.id)
        return newItem
      }
      throw new Error("Failed to create item")
    } catch (error) {
      console.error("[v0] Error adding item:", error)
      throw error
    }
  }, [])

  const updateItem = useCallback(async (id: string, patch: Partial<InventoryItem>) => {
    try {
      // Update local state immediately
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
      console.log("[v0] Updated item locally:", id)
      // TODO: Add PUT /api/inventory/:id when backend is ready
    } catch (error) {
      console.error("[v0] Error updating item:", error)
    }
  }, [])

  const deleteItem = useCallback(async (id: string) => {
    try {
      // Delete locally
      setItems((prev) => prev.filter((i) => i.id !== id))
      console.log("[v0] Deleted item locally:", id)
      // TODO: Add DELETE /api/inventory/:id when backend is ready
    } catch (error) {
      console.error("[v0] Error deleting item:", error)
    }
  }, [])

  // Local-only operations (not yet persisted to DB)
  const addMovement = useCallback((itemId: string, mov: Omit<StockMovement, "id">) => {
    const id = `mv-${String(++nextMovId).padStart(3, "0")}`
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item
        let newTotal = item.stockTotal
        if (mov.type === "entrada") newTotal += mov.qty
        else if (mov.type === "salida") newTotal -= mov.qty
        return {
          ...item,
          stockTotal: Math.max(0, newTotal),
          movements: [{ ...mov, id }, ...item.movements],
        }
      })
    )
  }, [])

  const updateStock = useCallback((itemId: string, locationId: string, newQty: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item
        const newLocations = item.locations.map((l) =>
          l.id === locationId ? { ...l, qty: newQty } : l
        )
        const newTotal = newLocations.reduce((sum, l) => sum + l.qty, 0)
        return { ...item, locations: newLocations, stockTotal: newTotal }
      })
    )
  }, [])

  const addLocation = useCallback((itemId: string, loc: StockLocation) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item
        return {
          ...item,
          locations: [...item.locations, loc],
          stockTotal: item.stockTotal + loc.qty,
        }
      })
    )
  }, [])

  const lowStockItems = useMemo(
    () => items.filter((i) => i.isActive && i.stockTotal <= i.minStock),
    [items]
  )

  const totalValue = useMemo(
    () => items.reduce((sum, i) => sum + i.stockTotal * i.costUnit, 0),
    [items]
  )

  return (
    <InventoryContext.Provider
      value={{
        items,
        isLoading,
        getItem,
        addItem,
        updateItem,
        deleteItem,
        refreshItems,
        addMovement,
        updateStock,
        addLocation,
        lowStockItems,
        totalValue,
      }}
    >
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const ctx = useContext(InventoryContext)
  if (!ctx) throw new Error("useInventory must be used within InventoryProvider")
  return ctx
}
