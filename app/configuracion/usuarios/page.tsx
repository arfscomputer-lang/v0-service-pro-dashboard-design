"use client"

import { useState, useEffect } from "react"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { TopHeader } from "@/components/dashboard/top-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, AlertCircle, CheckCircle2, Mail, User, Lock, Shield } from "lucide-react"

export default function UsuariosConfigPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "tecnico",
    status: "activo",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("El nombre es requerido")
      return false
    }
    if (!formData.email.trim()) {
      setError("El email es requerido")
      return false
    }
    if (!formData.email.includes("@")) {
      setError("Email inválido")
      return false
    }
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          status: formData.status,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al crear el usuario")
        setIsLoading(false)
        return
      }

      setSuccess("Usuario creado exitosamente")
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "tecnico",
        status: "activo",
      })

      setTimeout(() => {
        setIsDialogOpen(false)
        setSuccess("")
      }, 2000)
    } catch (err) {
      setError("Error de conexión. Intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Gestión de Usuarios
              </h1>
              <p className="text-sm text-muted-foreground">
                Administra los usuarios del sistema. Desde aquí puedes crear nuevos usuarios con diferentes roles.
              </p>
            </div>

            {/* Create User Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" size="lg">
                  <Plus className="h-4 w-4" />
                  Crear Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                  <DialogDescription>
                    Completa todos los campos para agregar un nuevo usuario al sistema.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Nombre */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nombre Completo *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Juan Pérez García"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Correo Electrónico *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="usuario@ejemplo.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Contraseña */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Contraseña *
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
                  </div>

                  {/* Confirmar Contraseña */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Confirmar Contraseña *
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Rol */}
                  <div className="space-y-2">
                    <Label htmlFor="role" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Rol *
                    </Label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(value) => handleInputChange("role", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="tecnico">Técnico</SelectItem>
                        <SelectItem value="cliente">Cliente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Estado */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado *</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => handleInputChange("status", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activo">Activo</SelectItem>
                        <SelectItem value="inactivo">Inactivo</SelectItem>
                        <SelectItem value="suspendido">Suspendido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Success */}
                  {success && (
                    <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>{success}</span>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Creando..." : "Crear Usuario"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Campos Requeridos</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>• Nombre completo</p>
                  <p>• Email único</p>
                  <p>• Contraseña (min 6 caracteres)</p>
                  <p>• Rol del usuario</p>
                  <p>• Estado (activo/inactivo/suspendido)</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Roles Disponibles</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>• <strong>Admin:</strong> Acceso total</p>
                  <p>• <strong>Supervisor:</strong> Gestión de órdenes y técnicos</p>
                  <p>• <strong>Técnico:</strong> Ejecutor de órdenes</p>
                  <p>• <strong>Cliente:</strong> Visualización de órdenes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Información Almacenada</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>Los datos se guardan en Neon PostgreSQL:</p>
                  <p>• ID único (UUID)</p>
                  <p>• Timestamps (creación/actualización)</p>
                  <p>• Relación con clientes (opcional)</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
