"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/context/auth-context"

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col gap-6 text-left">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20">
              <Image
                src="/images/all-services-logo.png"
                alt="All Services Logo"
                fill
                sizes="80px"
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">All Services</h1>
              <p className="text-sm text-muted-foreground">Integramos Tecnologías</p>
            </div>
          </div>
          
          <div className="space-y-4 mt-4">
            <h2 className="text-2xl font-semibold">Gestiona tus servicios de manera eficiente</h2>
            <p className="text-muted-foreground leading-relaxed">
              Plataforma integral para administración de órdenes de trabajo, técnicos, clientes e inventario con autenticación segura.
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex lg:hidden items-center gap-3 mb-4">
              <div className="relative h-14 w-14">
                <Image
                  src="/images/all-services-logo.png"
                  alt="All Services Logo"
                  fill
                  sizes="56px"
                  className="object-contain"
                />
              </div>
              <div>
                <CardTitle className="text-2xl">All Services</CardTitle>
                <p className="text-xs text-muted-foreground">Integramos Tecnologías</p>
              </div>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
