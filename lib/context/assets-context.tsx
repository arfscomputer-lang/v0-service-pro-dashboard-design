"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { authenticatedFetch } from "@/lib/authenticated-fetch"
import { useAuth } from "./auth-context"

export interface Asset {
  id: string
  asset_id: string
  name: string
  description?: string
  brand?: string
  model?: string
  serial_number: string
  year_manufactured: number
  type: string
  category: string
  status: 'active' | 'inactive' | 'in_repair' | 'retired'
  criticality: 'low' | 'medium' | 'high' | 'critical'
  customer_id: string
  site_location?: string
  capacity?: string
  has_maintenance_plan: boolean
  recurrence_type?: string
  interval_months?: number
  interval_hours?: number
  interval_cycles?: number
  hours_threshold_alert?: number
  created_at: string
  updated_at: string
}

interface AssetsContextValue {
  assets: Asset[]
  isLoading: boolean
  getAsset: (id: string) => Asset | undefined
  getAssetsByCustomer: (customerId: string) => Asset[]
  addAsset: (customerId: string, data: Omit<Asset, 'id' | 'created_at' | 'updated_at'>) => Promise<Asset>
  updateAsset: (id: string, data: Partial<Asset>) => Promise<Asset>
  deleteAsset: (id: string) => Promise<void>
  refreshAssets: () => Promise<void>
}

const AssetsContext = createContext<AssetsContextValue | null>(null)

function normalizeAsset(a: any): Asset {
  return {
    ...a,
    has_maintenance_plan: a.has_maintenance_plan ?? false,
    criticality: a.criticality ?? 'medium',
    status: a.status ?? 'active',
    created_at: a.created_at ?? new Date().toISOString(),
    updated_at: a.updated_at ?? new Date().toISOString(),
  }
}

export function AssetsProvider({ children }: { children: React.ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const auth = useAuth()

  const refreshAssets = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await authenticatedFetch("/api/assets")
      if (!response.ok) throw new Error("Failed to fetch assets")
      const data = await response.json()
      setAssets((data.assets || []).map(normalizeAsset))
    } catch (error) {
      console.error("[v0] Error fetching assets:", error)
      setAssets([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshAssets()
  }, [refreshAssets])

  const getAsset = useCallback((id: string) => {
    return assets.find(a => a.id === id)
  }, [assets])

  const getAssetsByCustomer = useCallback((customerId: string) => {
    return assets.filter(a => a.customer_id === customerId)
  }, [assets])

  const addAsset = useCallback(async (customerId: string, data: Omit<Asset, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await authenticatedFetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          customer_id: customerId,
        }),
      })
      if (!response.ok) throw new Error("Failed to create asset")
      const result = await response.json()
      const newAsset = normalizeAsset(result)
      setAssets([newAsset, ...assets])
      return newAsset
    } catch (error) {
      console.error("[v0] Error creating asset:", error)
      throw error
    }
  }, [assets])

  const updateAsset = useCallback(async (id: string, data: Partial<Asset>) => {
    try {
      const response = await authenticatedFetch(`/api/assets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to update asset")
      const result = await response.json()
      const updated = normalizeAsset(result)
      setAssets(assets.map(a => a.id === id ? updated : a))
      return updated
    } catch (error) {
      console.error("[v0] Error updating asset:", error)
      throw error
    }
  }, [assets])

  const deleteAsset = useCallback(async (id: string) => {
    try {
      const response = await authenticatedFetch(`/api/assets/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete asset")
      setAssets(assets.filter(a => a.id !== id))
    } catch (error) {
      console.error("[v0] Error deleting asset:", error)
      throw error
    }
  }, [assets])

  const value: AssetsContextValue = {
    assets,
    isLoading,
    getAsset,
    getAssetsByCustomer,
    addAsset,
    updateAsset,
    deleteAsset,
    refreshAssets,
  }

  return (
    <AssetsContext.Provider value={value}>
      {children}
    </AssetsContext.Provider>
  )
}

export function useAssets() {
  const context = useContext(AssetsContext)
  if (!context) {
    throw new Error("useAssets must be used within AssetsProvider")
  }
  return context
}
