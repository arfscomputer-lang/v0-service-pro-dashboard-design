"use client"

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react"
import type { InventoryItem, StockMovement, ItemCategory, StockLocation } from "@/lib/data/inventory"
import { authenticatedFetch } from "@/lib/authenticated-fetch"

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

/* Normalise an inventory row from the DB so every array/number field the UI
   relies on is never undefined */
function normalizeItem(i: any): InventoryItem {
  return {
    ...i,
    id: i.id ?? `INV-${Date.now()}`,
    sku: i.sku ?? "",
    barcode: i.barcode ?? i.sku ?? "",
    name: i.name ?? "",
    description: i.description ?? "",
    category: i.category ?? "refaccion",
    unit: i.unit ?? "pieza",
    totalStock: i.totalStock ?? i.total_stock ?? 0,
    minStock: i.minStock ?? i.min_threshold ?? 10,
    maxStock: i.maxStock ?? i.max_stock ?? 100,
    costUnit: i.costUnit ?? i.unit_cost ?? 0,
    priceUnit: i.priceUnit ?? i.price_unit ?? 0,
    locations: Array.isArray(i.locations) ? i.locations : [],
    movements: Array.isArray(i.movements) ? i.movements : [],
    supplier: i.supplier ?? { id: "", name: "", phone: "", email: "", leadTimeDays: 0, lastOrderDate: "" },
    imageUrl: i.imageUrl ?? i.image_url ?? "",
    isActive: i.isActive ?? i.is_active ?? true,
  }
}

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch inventory from database on mount
  const refreshItems = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await authenticatedFetch("/api/inventory")
      if (!response.ok) {
        console.warn("[v0] Inventory API responded with", response.status, "— using seed data")
        const { inventorySeed } = await import("@/lib/data/inventory")
        setItems(inventorySeed)
        return
      }
      const data = await response.json()
      setItems((data.items || []).map(normalizeItem))
    } catch (error) {
      console.warn("[v0] Error fetching inventory, using seed data:", error)
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
      const response = await authenticatedFetch("/api/inventory", {
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
    // Optimistic update
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      if (!response.ok) throw new Error("Failed to update item")
      console.log("[v0] Updated item in database:", id)
    } catch (error) {
      console.error("[v0] Error updating item, reverting:", error)
      await refreshItems()
    }
  }, [refreshItems])

  const deleteItem = useCallback(async (id: string) => {
    // Optimistic update
    setItems((prev) => prev.filter((i) => i.id !== id))
    try {
      const response = await fetch(`/api/inventory/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete item")
      console.log("[v0] Deleted item from database:", id)
    } catch (error) {
      console.error("[v0] Error deleting item, reverting:", error)
      await refreshItems()
    }
  }, [refreshItems])

  // Local-only operations (not yet persisted to DB)
  const addMovement = useCallback((itemId: string, mov: Omit<StockMovement, "id">) => {
    const id = `mv-${String(++nextMovId).padStart(3, "0")}`
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item
        let newTotal = item.totalStock
        if (mov.type === "entrada") newTotal += mov.qty
        else if (mov.type === "salida") newTotal -= mov.qty
        return {
          ...item,
          totalStock: Math.max(0, newTotal),
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
        return { ...item, locations: newLocations, totalStock: newTotal }
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
          totalStock: item.totalStock + loc.qty,
        }
      })
    )
  }, [])

  const lowStockItems = useMemo(
    () => items.filter((i) => i.isActive && i.totalStock <= i.minStock),
    [items]
  )

  const totalValue = useMemo(
    () => items.reduce((sum, i) => sum + i.totalStock * i.costUnit, 0),
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
