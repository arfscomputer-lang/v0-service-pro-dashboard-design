"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"

export type UserRole = "admin" | "supervisor" | "tecnico" | "cliente"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  initials: string
  avatar?: string
  /** Only for role=cliente — links to a customer ID */
  customerId?: string
  /** Only for role=tecnico — links to a technician ID */
  technicianId?: string
}

/* ─── Seed users reference (now in database) ─── */
// Users are now stored in Neon PostgreSQL database
// Kept here for reference:
// admin@servicepro.mx / admin123 (Admin)
// supervisor@servicepro.mx / super123 (Supervisor)
// tecnico@servicepro.mx / tecnico123 (Tecnico)
// cliente@empresaalfa.mx / cliente123 (Cliente)

export const SEED_USERS: (AuthUser & { password: string })[] = [
  {
    id: "u-001",
    name: "Carlos Rodriguez",
    email: "admin@servicepro.mx",
    password: "admin123",
    role: "admin",
    initials: "CR",
  },
  {
    id: "u-002",
    name: "Laura Sanchez",
    email: "supervisor@servicepro.mx",
    password: "super123",
    role: "supervisor",
    initials: "LS",
  },
  {
    id: "u-003",
    name: "Miguel Torres",
    email: "tecnico@servicepro.mx",
    password: "tecnico123",
    role: "tecnico",
    initials: "MT",
    technicianId: "tech-001",
  },
  {
    id: "u-004",
    name: "Ana Empresa Alfa",
    email: "cliente@empresaalfa.mx",
    password: "cliente123",
    role: "cliente",
    initials: "EA",
    customerId: "cli-001",
  },
]

/* ─── Role-based route permissions ─── */
export const ROLE_ROUTES: Record<UserRole, string[]> = {
  admin: ["*"], // all routes
  supervisor: [
    "/",
    "/ordenes",
    "/orden",
    "/despacho",
    "/clientes",
    "/inventario",
    "/reportes",
  ],
  tecnico: [
    "/tecnico",
  ],
  cliente: [
    "/portal",
  ],
}

/** Check if a role can access a given pathname */
export function canAccess(role: UserRole, pathname: string): boolean {
  const allowed = ROLE_ROUTES[role]
  if (allowed.includes("*")) return true
  return allowed.some((route) => pathname === route || pathname.startsWith(route + "/"))
}

/** Get the default home route for each role */
export function getHomeRoute(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/"
    case "supervisor":
      return "/"
    case "tecnico":
      return "/tecnico/agenda"
    case "cliente":
      return "/portal"
    default:
      return "/login"
  }
}

/* ─── Auth Context ─── */
interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => { success: boolean; error?: string }
  logout: () => void
  canAccess: (pathname: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("sp_auth_user")
      if (stored) {
        const parsed = JSON.parse(stored)
        setUser(parsed)
      }
    } catch {
      // ignore
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    // Simple authentication using seed data (temporary until DB is fully connected)
    const found = SEED_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    
    if (!found) {
      return { success: false, error: "Correo o contraseña incorrectos" }
    }

    const { password: _, ...authUser } = found
    setUser(authUser)
    sessionStorage.setItem("sp_auth_user", JSON.stringify(authUser))
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    sessionStorage.removeItem("sp_auth_user")
  }, [])

  const checkAccess = useCallback(
    (pathname: string) => {
      if (!user) return false
      return canAccess(user.role, pathname)
    },
    [user]
  )

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, canAccess: checkAccess }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
