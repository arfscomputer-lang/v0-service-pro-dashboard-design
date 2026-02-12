"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth, SEED_USERS, getHomeRoute, type UserRole } from "@/lib/context/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Wrench,
  ShieldCheck,
  Eye,
  HardHat,
  Building2,
  AlertCircle,
  EyeOff,
  LogIn,
} from "lucide-react"
import { cn } from "@/lib/utils"

const roleCards: {
  role: UserRole
  label: string
  description: string
  icon: typeof ShieldCheck
  color: string
  bgColor: string
  borderColor: string
}[] = [
  {
    role: "admin",
    label: "Administrador",
    description: "Acceso total al sistema. Gestion completa de ordenes, tecnicos, clientes, inventario y reportes.",
    icon: ShieldCheck,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/40",
  },
  {
    role: "supervisor",
    label: "Supervisor",
    description: "Crear y editar ordenes de trabajo. Gestionar clientes. Visualizar inventarios y reportes.",
    icon: Eye,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
  },
  {
    role: "tecnico",
    label: "Tecnico",
    description: "Vista movil con agenda del dia, control de trabajos, evidencia fotografica y tiempos.",
    icon: HardHat,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-300",
  },
  {
    role: "cliente",
    label: "Cliente",
    description: "Crear ordenes de servicio propias. Ver el dashboard de KPIs y reportes de sus trabajos.",
    icon: Building2,
    color: "text-sky-600",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-300",
  },
]

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  /** Prefill email/password when a role card is clicked */
  function selectRole(role: UserRole) {
    setSelectedRole(role)
    setError("")
    const seedUser = SEED_USERS.find((u) => u.role === role)
    if (seedUser) {
      setEmail(seedUser.email)
      setPassword(seedUser.password)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simulate slight delay
    setTimeout(() => {
      const result = login(email, password)
      if (!result.success) {
        setError(result.error || "Error al iniciar sesion")
        setLoading(false)
        return
      }
      const user = SEED_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())
      router.replace(user ? getHomeRoute(user.role) : "/")
    }, 400)
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-[480px] flex-col justify-between p-10 text-sidebar-primary-foreground" style={{ background: "hsl(226 71% 20%)" }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "hsl(226 70% 55%)" }}>
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">ServicePro</span>
        </div>

        <div>
          <h1 className="text-3xl font-bold leading-tight text-white text-balance">
            Gestion de Servicios en Campo
          </h1>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "hsl(220 20% 75%)" }}>
            Plataforma integral para administrar ordenes de trabajo, despacho de tecnicos, inventarios y relacion con clientes. Selecciona un rol para explorar el sistema.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(220 20% 60%)" }}>
            Credenciales de prueba
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SEED_USERS.map((u) => (
              <div
                key={u.id}
                className="rounded-md px-3 py-2 text-xs"
                style={{ background: "hsl(226 60% 28%)" }}
              >
                <p className="font-medium text-white">{u.role}</p>
                <p style={{ color: "hsl(220 20% 70%)" }}>{u.email}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Wrench className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">ServicePro</span>
        </div>

        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Iniciar Sesion</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Selecciona tu rol y accede al sistema
            </p>
          </div>

          {/* Role cards */}
          <div className="grid grid-cols-2 gap-3">
            {roleCards.map((rc) => (
              <button
                key={rc.role}
                type="button"
                onClick={() => selectRole(rc.role)}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all hover:shadow-md",
                  selectedRole === rc.role
                    ? cn(rc.borderColor, rc.bgColor, "shadow-md")
                    : "border-border bg-card hover:border-muted-foreground/30"
                )}
              >
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", rc.bgColor)}>
                  <rc.icon className={cn("h-5 w-5", rc.color)} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{rc.label}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                    {rc.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Login form */}
          <Card className="border border-border shadow-sm">
            <CardContent className="p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground">
                    Correo Electronico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError("") }}
                    placeholder="usuario@correo.com"
                    className="h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground">
                    Contrasena
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError("") }}
                      placeholder="********"
                      className="h-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full h-10 gap-2" disabled={loading}>
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <LogIn className="h-4 w-4" />
                  )}
                  {loading ? "Accediendo..." : "Iniciar Sesion"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            Sistema de demostracion. Las credenciales se prellenan al seleccionar un rol.
          </p>
        </div>
      </div>
    </div>
  )
}
