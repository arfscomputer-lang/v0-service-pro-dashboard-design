"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth, getHomeRoute } from "@/lib/context/auth-context"

/**
 * Wraps the entire app. Redirects unauthenticated users to /login,
 * and unauthorized users to their role's home route.
 * The /login page is always accessible.
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, canAccess } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const isPublicRoute = pathname === "/login" || pathname === "/auth/login" || pathname === "/crear-usuario"

  useEffect(() => {
    if (isLoading) return

    // Public routes - if logged in, redirect to home
    if (isPublicRoute) {
      if (user) {
        router.replace(getHomeRoute(user.role))
      }
      return
    }

    // Not logged in -> go to login
    if (!user) {
      router.replace("/auth/login")
      return
    }

    // Logged in but no access -> go to role home
    if (!canAccess(pathname)) {
      router.replace(getHomeRoute(user.role))
    }
  }, [user, isLoading, pathname, isPublicRoute, canAccess, router])

  // Public routes ALWAYS render immediately, even while loading
  if (isPublicRoute) return <>{children}</>

  // Show spinner while deciding on protected routes
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  // Not logged in and not on public route — will redirect, show nothing
  if (!user) return null

  // Logged in but no access — will redirect, show nothing
  if (!canAccess(pathname)) return null

  return <>{children}</>
}
