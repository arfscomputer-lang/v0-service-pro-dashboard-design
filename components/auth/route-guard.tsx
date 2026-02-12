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

  useEffect(() => {
    if (isLoading) return

    // /login is always public
    if (pathname === "/login") {
      if (user) {
        router.replace(getHomeRoute(user.role))
      }
      return
    }

    // Not logged in -> go to login
    if (!user) {
      router.replace("/login")
      return
    }

    // Logged in but no access -> go to role home
    if (!canAccess(pathname)) {
      router.replace(getHomeRoute(user.role))
    }
  }, [user, isLoading, pathname, canAccess, router])

  // Show nothing while deciding
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

  // On /login, always render
  if (pathname === "/login") return <>{children}</>

  // Not logged in and not on /login — will redirect, show nothing
  if (!user) return null

  // Logged in but no access — will redirect, show nothing
  if (!canAccess(pathname)) return null

  return <>{children}</>
}
