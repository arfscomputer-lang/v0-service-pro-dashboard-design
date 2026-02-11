"use client"

import React, { createContext, useContext, useState, useCallback, useMemo } from "react"
import type { InventoryItem, StockMovement, ItemCategory, StockLocation } from "@/lib/data/inventory"
import { inventorySeed } from "@/lib/data/inventory"

interface InventoryContextValue {
  items: InventoryItem[]
  getItem: (id: string) => InventoryItem | undefined
  addItem: (data: Omit<InventoryItem, "id">) => InventoryItem
  updateItem: (id: string, patch: Partial<InventoryItem>) => void
  deleteItem: (id: string) => void
  addMovement: (itemId: string, mov: Omit<StockMovement, "id">) => void
  updateStock: (itemId: string, locationId: string, newQty: number) => void
  addLocation: (itemId: string, loc: StockLocation) => void
  lowStockItems: InventoryItem[]
  totalValue: number
}

const InventoryContext = createContext<InventoryContextValue | null>(null)

let nextItemId = 100
let nextMovId = 200

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>(() => [...inventorySeed])

  const getItem = useCallback(
    (id: string) => items.find((i) => i.id === id),
    [items]
  )

  const addItem = useCallback((data: Omit<InventoryItem, "id">) => {
    const id = `inv-${String(++nextItemId).padStart(3, "0")}`
    const newItem: InventoryItem = { ...data, id }
    setItems((prev) => [...prev, newItem])
    return newItem
  }, [])

  const updateItem = useCallback((id: string, patch: Partial<InventoryItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }, [])

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const addMovement = useCallback((itemId: string, mov: Omit<StockMovement, "id">) => {
    const id = `mv-${String(++nextMovId).padStart(3, "0")}`
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item
        let newTotal = item.totalStock
        if (mov.type === "entrada") newTotal += mov.qty
        else if (mov.type === "salida") newTotal -= mov.qty
        // transferencia and ajuste don't change total
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
        getItem,
        addItem,
        updateItem,
        deleteItem,
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
