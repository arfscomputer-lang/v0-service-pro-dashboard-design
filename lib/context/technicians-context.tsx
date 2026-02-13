"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { TechnicianProfile, TechStatus, TechSpecialty, Certification } from "@/lib/data/technicians"

// ── Actions ──────────────────────────────────────────────────

interface TechniciansContextValue {
  technicians: TechnicianProfile[]
  isLoading: boolean
  getTech: (id: string) => TechnicianProfile | undefined
  addTech: (tech: Omit<TechnicianProfile, "id" | "initials">) => Promise<TechnicianProfile>
  updateTech: (id: string, patch: Partial<TechnicianProfile>) => void
  deleteTech: (id: string) => void
  updateStatus: (id: string, status: TechStatus) => void
  addSpecialty: (id: string, specialty: TechSpecialty) => void
  removeSpecialty: (id: string, specialty: TechSpecialty) => void
  addCertification: (id: string, cert: Certification) => void
  removeCertification: (id: string, certName: string) => void
  updateCertification: (id: string, oldName: string, cert: Certification) => void
  updateAvailability: (id: string, availability: TechnicianProfile["availability"]) => void
}

const TechniciansContext = createContext<TechniciansContextValue | null>(null)

// ── Helper ───────────────────────────────────────────────────

function makeInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("")
}

/** Ensure every field the UI needs is never undefined */
function normalizeTech(t: any): TechnicianProfile {
  return {
    ...t,
    id: t.id ?? `local-${Date.now()}`,
    name: t.name ?? "",
    initials: t.initials || makeInitials(t.name || ""),
    email: t.email ?? "",
    phone: t.phone ?? "",
    role: t.role ?? "junior",
    status: t.status ?? "disponible",
    specialties: Array.isArray(t.specialties) ? t.specialties : [],
    certifications: Array.isArray(t.certifications) ? t.certifications : [],
    rating: t.rating ?? 0,
    completedJobs: t.completedJobs ?? 0,
    avgResponseMin: t.avgResponseMin ?? 0,
    latitude: t.latitude ?? 0,
    longitude: t.longitude ?? 0,
    address: t.address ?? "",
    joinDate: t.joinDate ?? "",
    availability: t.availability ?? { days: ["Lun", "Mar", "Mie", "Jue", "Vie"], startHour: 8, endHour: 18 },
  }
}

// ── Provider ─────────────────────────────────────────────────

export function TechniciansProvider({ children }: { children: React.ReactNode }) {
  const [technicians, setTechnicians] = useState<TechnicianProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch from Neon via API on mount
  const refreshTechnicians = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/technicians")
      if (!res.ok) throw new Error("Failed to fetch technicians")
      const data = await res.json()
      setTechnicians((data.technicians || []).map(normalizeTech))
    } catch (error) {
      console.error("[v0] Error fetching technicians, using seed data:", error)
      const { technicianProfiles } = await import("@/lib/data/technicians")
      setTechnicians(technicianProfiles)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { refreshTechnicians() }, [refreshTechnicians])

  const getTech = useCallback(
    (id: string) => technicians.find((t) => t.id === id),
    [technicians]
  )

  const addTech = useCallback(async (data: Omit<TechnicianProfile, "id" | "initials">) => {
    try {
      const res = await fetch("/api/technicians", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role,
          status: data.status || "disponible",
          specialties: data.specialties,
          certifications: data.certifications,
          address: data.address,
          lat: data.latitude,
          lng: data.longitude,
          avg_response_min: data.avgResponseMin,
        }),
      })
      if (!res.ok) throw new Error("Failed to create technician")
      const result = await res.json()
      const newTech = normalizeTech(result.technician)
      setTechnicians((prev) => [...prev, newTech])
      return newTech
    } catch (error) {
      console.error("[v0] Error creating technician:", error)
      // Fallback: create locally
      const id = `local-${Date.now()}`
      const newTech: TechnicianProfile = normalizeTech({ ...data, id, initials: makeInitials(data.name) })
      setTechnicians((prev) => [...prev, newTech])
      return newTech
    }
  }, [])

  const updateTech = useCallback((id: string, patch: Partial<TechnicianProfile>) => {
    // Optimistic update
    setTechnicians((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const updated = { ...t, ...patch }
        if (patch.name) updated.initials = makeInitials(patch.name)
        return updated
      })
    )
    // Persist to API
    fetch(`/api/technicians/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: patch.name,
        email: patch.email,
        phone: patch.phone,
        role: patch.role,
        status: patch.status,
        address: patch.address,
        lat: patch.latitude,
        lng: patch.longitude,
        avg_response_min: patch.avgResponseMin,
        average_rating: patch.rating,
        total_jobs: patch.completedJobs,
        specialties: patch.specialties,
        certifications: patch.certifications,
      }),
    }).catch((err) => console.error("[v0] Error updating technician:", err))
  }, [])

  const deleteTech = useCallback((id: string) => {
    setTechnicians((prev) => prev.filter((t) => t.id !== id))
    fetch(`/api/technicians/${id}`, { method: "DELETE" })
      .catch((err) => console.error("[v0] Error deleting technician:", err))
  }, [])

  const updateStatus = useCallback((id: string, status: TechStatus) => {
    setTechnicians((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    )
    fetch(`/api/technicians/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch((err) => console.error("[v0] Error updating status:", err))
  }, [])

  const addSpecialty = useCallback((id: string, specialty: TechSpecialty) => {
    setTechnicians((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const specialties = t.specialties || []
        if (specialties.includes(specialty)) return t
        const updated = [...specialties, specialty]
        // Persist
        fetch(`/api/technicians/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ specialties: updated }),
        }).catch((err) => console.error("[v0] Error adding specialty:", err))
        return { ...t, specialties: updated }
      })
    )
  }, [])

  const removeSpecialty = useCallback((id: string, specialty: TechSpecialty) => {
    setTechnicians((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const specialties = t.specialties || []
        const updated = specialties.filter((s) => s !== specialty)
        fetch(`/api/technicians/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ specialties: updated }),
        }).catch((err) => console.error("[v0] Error removing specialty:", err))
        return { ...t, specialties: updated }
      })
    )
  }, [])

  const addCertification = useCallback((id: string, cert: Certification) => {
    setTechnicians((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const certs = [...(t.certifications || []), cert]
        fetch(`/api/technicians/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ certifications: certs }),
        }).catch((err) => console.error("[v0] Error adding cert:", err))
        return { ...t, certifications: certs }
      })
    )
  }, [])

  const removeCertification = useCallback((id: string, certName: string) => {
    setTechnicians((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const certs = (t.certifications || []).filter((c) => c.name !== certName)
        fetch(`/api/technicians/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ certifications: certs }),
        }).catch((err) => console.error("[v0] Error removing cert:", err))
        return { ...t, certifications: certs }
      })
    )
  }, [])

  const updateCertification = useCallback((id: string, oldName: string, cert: Certification) => {
    setTechnicians((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const certs = (t.certifications || []).map((c) => (c.name === oldName ? cert : c))
        fetch(`/api/technicians/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ certifications: certs }),
        }).catch((err) => console.error("[v0] Error updating cert:", err))
        return { ...t, certifications: certs }
      })
    )
  }, [])

  const updateAvailability = useCallback((id: string, availability: TechnicianProfile["availability"]) => {
    setTechnicians((prev) =>
      prev.map((t) => (t.id === id ? { ...t, availability } : t))
    )
  }, [])

  return (
    <TechniciansContext.Provider
      value={{
        technicians,
        isLoading,
        getTech,
        addTech,
        updateTech,
        deleteTech,
        updateStatus,
        addSpecialty,
        removeSpecialty,
        addCertification,
        removeCertification,
        updateCertification,
        updateAvailability,
      }}
    >
      {children}
    </TechniciansContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────

export function useTechnicians() {
  const ctx = useContext(TechniciansContext)
  if (!ctx) {
    throw new Error("useTechnicians must be used within a TechniciansProvider")
  }
  return ctx
}
