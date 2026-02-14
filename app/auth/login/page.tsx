"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wrench, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/context/auth-context"

const DEMO_USERS = [
  {
    email: "admin@servicepro.mx",
    password: "admin123",
    name: "Administrador Sistema",
    description: "Acceso completo",
  },
  {
    email: "supervisor@servicepro.mx",
    password: "super123",
    name: "Supervisor General",
    description: "Gestión de órdenes",
  },
  {
    email: "tecnico@servicepro.mx",
    password: "tecnico123",
    name: "Técnico",
    description: "Vista móvil",
  },
  {
    email: "cliente@empresaalfa.mx",
    password: "cliente123",
    name: "Cliente",
    description: "Portal del cliente",
  },
]

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await login(email, password)
      
      if (!result.success) {
        setError(result.error || "Error al iniciar sesión")
        setIsLoading(false)
        return
      }

      // Login successful - redirect is handled by auth context
    } catch (err) {
      console.error("[v0] Login error:", err)
      setError("Error de conexión. Intente nuevamente.")
      setIsLoading(false)
    }
  }

  const handleQuickLogin = (demoUser: typeof DEMO_USERS[0]) => {
    setEmail(demoUser.email)
    setPassword(demoUser.password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col gap-6 text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Wrench className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">ServicePro</h1>
              <p className="text-sm text-muted-foreground">Sistema de Gestión de Servicios</p>
            </div>
          </div>
          
          <div className="space-y-4 mt-4">
            <h2 className="text-2xl font-semibold">Gestiona tus servicios de manera eficiente</h2>
            <p className="text-muted-foreground leading-relaxed">
              Plataforma integral para administración de órdenes de trabajo, técnicos, clientes e inventario con autenticación segura.
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="space-y-3 mt-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Cuentas de Demostración
            </h3>
            <div className="grid gap-2">
              {DEMO_USERS.map((user) => (
                <button
                  key={user.email}
                  type="button"
                  onClick={() => handleQuickLogin(user)}
                  className="text-left p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Usar →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex lg:hidden items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Wrench className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">ServicePro</CardTitle>
            </div>
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingrese sus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            {/* Mobile Demo Accounts */}
            <div className="lg:hidden mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3">Cuentas de demostración:</p>
              <div className="grid gap-2">
                {DEMO_USERS.map((user) => (
                  <button
                    key={user.email}
                    type="button"
                    onClick={() => handleQuickLogin(user)}
                    className="text-left p-2.5 rounded-md border border-border bg-muted/50 hover:bg-accent transition-colors text-xs"
                  >
                    <p className="font-medium">{user.name}</p>
                    <p className="text-muted-foreground">{user.email}</p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
