"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import type { TechnicianProfile, TechStatus, TechSpecialty, Certification } from "@/lib/data/technicians"
import { technicianProfiles as seedData } from "@/lib/data/technicians"

// ── Actions ──────────────────────────────────────────────────

interface TechniciansContextValue {
  technicians: TechnicianProfile[]
  getTech: (id: string) => TechnicianProfile | undefined
  addTech: (tech: Omit<TechnicianProfile, "id" | "initials">) => TechnicianProfile
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

let nextIdCounter = 100

// ── Provider ─────────────────────────────────────────────────

export function TechniciansProvider({ children }: { children: React.ReactNode }) {
  const [technicians, setTechnicians] = useState<TechnicianProfile[]>(() => [...seedData])

  const getTech = useCallback(
    (id: string) => technicians.find((t) => t.id === id),
    [technicians]
  )

  const addTech = useCallback((data: Omit<TechnicianProfile, "id" | "initials">) => {
    const id = `tech-${++nextIdCounter}`
    const newTech: TechnicianProfile = {
      ...data,
      id,
      initials: makeInitials(data.name),
    }
    setTechnicians((prev) => [...prev, newTech])
    return newTech
  }, [])

  const updateTech = useCallback((id: string, patch: Partial<TechnicianProfile>) => {
    setTechnicians((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const updated = { ...t, ...patch }
        // Recalculate initials if name changed
        if (patch.name) {
          updated.initials = makeInitials(patch.name)
        }
        return updated
      })
    )
  }, [])

  const deleteTech = useCallback((id: string) => {
    setTechnicians((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const updateStatus = useCallback((id: string, status: TechStatus) => {
    setTechnicians((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    )
  }, [])

  const addSpecialty = useCallback((id: string, specialty: TechSpecialty) => {
    setTechnicians((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const specialties = t.specialties || []
        if (specialties.includes(specialty)) return t
        return { ...t, specialties: [...specialties, specialty] }
      })
    )
  }, [])

  const removeSpecialty = useCallback((id: string, specialty: TechSpecialty) => {
    setTechnicians((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const specialties = t.specialties || []
        return { ...t, specialties: specialties.filter((s) => s !== specialty) }
      })
    )
  }, [])

  const addCertification = useCallback((id: string, cert: Certification) => {
    setTechnicians((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        return { ...t, certifications: [...t.certifications, cert] }
      })
    )
  }, [])

  const removeCertification = useCallback((id: string, certName: string) => {
    setTechnicians((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        return { ...t, certifications: (t.certifications || []).filter((c) => c.name !== certName) }
      })
    )
  }, [])

  const updateCertification = useCallback((id: string, oldName: string, cert: Certification) => {
    setTechnicians((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        return {
          ...t,
          certifications: (t.certifications || []).map((c) => (c.name === oldName ? cert : c)),
        }
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
