"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit2, Trash2, Lock, CheckCircle2, AlertCircle, Users, Loader2 } from "lucide-react"
import { authenticatedFetch } from "@/lib/authenticated-fetch"
import { cn } from "@/lib/utils"

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface Role {
  id: string
  name: string
  description: string
  is_system: boolean
  created_at: string
  permissions?: Permission[]
}

interface UserData {
  id: string
  name: string
  email: string
  role: string
  status: string
}

const roleColors: Record<string, string> = {
  admin: "bg-primary/10 text-primary border-primary/20",
  supervisor: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  tecnico: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  cliente: "bg-muted text-muted-foreground border-border",
}

export default function PermisosPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [formData, setFormData] = useState({ name: "", description: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  const loadData = async () => {
    try {
      setLoading(true)
      const [rolesRes, usersRes] = await Promise.all([
        authenticatedFetch("/api/roles"),
        authenticatedFetch("/api/users/list"),
      ])
      if (rolesRes.ok) {
        const data = await rolesRes.json()
        setRoles((data.roles || []).map((r: Role) => ({
          ...r,
          permissions: (r.permissions || []).filter((p: any) => p && p.id),
        })))
        setPermissions(data.permissions || [])
      }
      if (usersRes.ok) {
        const data = await usersRes.json()
        setUsers(data.data || [])
      }
    } catch {
      console.warn("[v0] Error loading roles/permissions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    setFormData({ name: role.name, description: role.description })
    setSelectedPermissions((role.permissions || []).map(p => p.id))
    setIsDialogOpen(true)
  }

  const handleNewRole = () => {
    setEditingRole(null)
    setFormData({ name: "", description: "" })
    setSelectedPermissions([])
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage("")
    try {
      const url = editingRole ? `/api/roles/${editingRole.id}` : "/api/roles"
      const method = editingRole ? "PUT" : "POST"
      const res = await authenticatedFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, permissions: selectedPermissions }),
      })
      if (!res.ok) { setMessage("Error al guardar el rol"); return }
      setMessage(editingRole ? "Rol actualizado correctamente" : "Rol creado correctamente")
      await loadData()
      setTimeout(() => { setIsDialogOpen(false); setMessage("") }, 2000)
    } catch {
      setMessage("Error de conexión")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el rol "${roleName}"?`)) return
    try {
      await authenticatedFetch(`/api/roles/${roleId}`, { method: "DELETE" })
      await loadData()
    } catch {
      console.warn("[v0] Error deleting role")
    }
  }

  const groupedPermissions = permissions.reduce((acc, perm) => {
    const cat = perm.category || "General"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(perm)
    return acc
  }, {} as Record<string, Permission[]>)

  const usersByRole = roles.reduce((acc, role) => {
    acc[role.name] = users.filter(u => u.role === role.name ||
      (role.name === "Administrador" && u.role === "admin") ||
      (role.name === "Supervisor" && u.role === "supervisor") ||
      (role.name === "Técnico" && u.role === "tecnico") ||
      (role.name === "Cliente" && u.role === "cliente"))
    return acc
  }, {} as Record<string, UserData[]>)

  const roleKeyMap: Record<string, string> = {
    admin: "admin", supervisor: "supervisor", tecnico: "tecnico", cliente: "cliente",
  }

  return (
    <main className="overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Roles y Permisos</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Gestioná los roles del sistema y sus permisos asignados
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewRole} className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Rol
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingRole ? "Editar Rol" : "Crear Nuevo Rol"}</DialogTitle>
                <DialogDescription>
                  {editingRole ? "Modificá los detalles y permisos del rol" : "Creá un nuevo rol y asigná permisos"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="rname">Nombre del Rol</Label>
                  <Input id="rname" placeholder="ej: Supervisor de Ventas"
                    value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rdesc">Descripción</Label>
                  <Input id="rdesc" placeholder="ej: Gestiona órdenes y técnicos"
                    value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} required />
                </div>
                {Object.keys(groupedPermissions).length > 0 && (
                  <div className="space-y-3">
                    <Label>Permisos</Label>
                    <div className="max-h-56 overflow-y-auto rounded-lg border border-border bg-muted/30 p-4 space-y-4">
                      {Object.entries(groupedPermissions).map(([category, perms]) => (
                        <div key={category}>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{category}</p>
                          <div className="space-y-2 ml-1">
                            {perms.map(perm => (
                              <label key={perm.id} className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="h-4 w-4 rounded border-input"
                                  checked={selectedPermissions.includes(perm.id)}
                                  onChange={() => setSelectedPermissions(prev =>
                                    prev.includes(perm.id) ? prev.filter(id => id !== perm.id) : [...prev, perm.id]
                                  )}
                                />
                                <div>
                                  <p className="text-sm font-medium text-foreground">{perm.name}</p>
                                  <p className="text-xs text-muted-foreground">{perm.description}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {message && (
                  <div className={cn("flex items-center gap-2 p-3 rounded-lg text-sm",
                    message.includes("Error") ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-700")}>
                    {message.includes("Error") ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    {message}
                  </div>
                )}
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={isSubmitting} className="gap-2">
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isSubmitting ? "Guardando..." : "Guardar Rol"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando roles y permisos...
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {roles.map((role) => {
              const assignedUsers = users.filter(u => u.role === Object.entries(roleKeyMap).find(([, v]) => role.name.toLowerCase().includes(v.toLowerCase()?.replace("admin", "administrador")))?.[0] || u.role === role.name.toLowerCase())
              const usersForRole = users.filter(u => {
                if (role.name === "Administrador") return u.role === "admin"
                if (role.name === "Supervisor") return u.role === "supervisor"
                if (role.name === "Técnico") return u.role === "tecnico"
                if (role.name === "Cliente") return u.role === "cliente"
                return u.role === role.name.toLowerCase()
              })

              return (
                <Card key={role.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{role.name}</CardTitle>
                          {role.is_system && (
                            <Badge variant="outline" className="gap-1 text-[11px]">
                              <Lock className="h-3 w-3" /> Sistema
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{role.description}</CardDescription>
                      </div>
                      {!role.is_system && (
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => handleEditRole(role)}>
                            <Edit2 className="h-3.5 w-3.5" /> Editar
                          </Button>
                          <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleDeleteRole(role.id, role.name)}>
                            <Trash2 className="h-3.5 w-3.5" /> Eliminar
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Permissions */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Permisos asignados</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(role.permissions || []).length === 0 ? (
                          <p className="text-xs text-muted-foreground">Sin permisos asignados</p>
                        ) : (
                          (role.permissions || []).map(perm => (
                            <Badge key={perm.id} variant="secondary" className="text-[11px]">{perm.name}</Badge>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Users with this role */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        Usuarios con este rol ({usersForRole.length})
                      </p>
                      {usersForRole.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Ningún usuario asignado</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {usersForRole.map(user => (
                            <div key={user.id} className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-2.5 py-1.5">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">
                                  {user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-medium text-foreground leading-tight">{user.name}</p>
                                <p className="text-[10px] text-muted-foreground leading-tight">{user.email}</p>
                              </div>
                              <Badge variant="outline" className={cn("text-[10px] ml-1",
                                user.status === "activo" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : "bg-muted text-muted-foreground"
                              )}>
                                {user.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
