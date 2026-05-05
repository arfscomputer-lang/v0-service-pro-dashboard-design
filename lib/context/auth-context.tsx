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
// admin@servicepro.mx (Admin)
// supervisor@servicepro.mx (Supervisor)
// tecnico@servicepro.mx (Tecnico)
// cliente@empresaalfa.mx (Cliente)

const SEED_USERS: AuthUser[] = [
  {
    id: "u-001",
    name: "Carlos Rodriguez",
    email: "admin@servicepro.mx",
    role: "admin",
    initials: "CR",
  },
  {
    id: "u-002",
    name: "Laura Sanchez",
    email: "supervisor@servicepro.mx",
    role: "supervisor",
    initials: "LS",
  },
  {
    id: "u-003",
    name: "Miguel Torres",
    email: "tecnico@servicepro.mx",
    role: "tecnico",
    initials: "MT",
    technicianId: "tech-001",
  },
  {
    id: "u-004",
    name: "Ana Empresa Alfa",
    email: "cliente@empresaalfa.mx",
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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  canAccess: (pathname: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    const validateSession = async () => {
      try {
        const token = sessionStorage.getItem("sp_auth_token")
        if (token) {
          const response = await fetch("/api/auth/session", {
            headers: { "Authorization": `Bearer ${token}` },
          })
          
          if (response.ok) {
            const data = await response.json()
            if (data.user) {
              const authUser: AuthUser = {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                role: data.user.role,
                initials: data.user.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2),
              }
              setUser(authUser)
            } else {
              sessionStorage.removeItem("sp_auth_token")
            }
          } else {
            // Token invalid, clear it
            sessionStorage.removeItem("sp_auth_token")
          }
        }
      } catch (error) {
        console.error("[v0] Error validating session:", error)
      }
      setIsLoading(false)
    }
    
    validateSession()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        return { success: false, error: data.error || 'Error al iniciar sesión' }
      }

      const data = await response.json()
      const token = data.token
      const authUser: AuthUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        initials: data.user.initials,
        customerId: data.user.customerId,
        technicianId: data.user.technicianId ?? undefined,
      }

      // Store token in sessionStorage (token validates session on server)
      sessionStorage.setItem("sp_auth_token", token)
      setUser(authUser)
      
      return { success: true }
    } catch (error) {
      console.error('[v0] Login error:', error)
      return { success: false, error: 'Error de conexión. Intente nuevamente.' }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      const token = sessionStorage.getItem("sp_auth_token")
      if (token) {
        // Delete session from database
        await fetch("/api/auth/session", {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` },
        })
      }
    } catch (error) {
      console.error("[v0] Error during logout:", error)
    }
    
    setUser(null)
    sessionStorage.removeItem("sp_auth_token")
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
