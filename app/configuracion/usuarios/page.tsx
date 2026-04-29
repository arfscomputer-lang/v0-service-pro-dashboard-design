"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Plus, AlertCircle, CheckCircle2, User, Pencil, Trash2, Loader2 } from "lucide-react"
import { authenticatedFetch } from "@/lib/authenticated-fetch"
import { cn } from "@/lib/utils"

interface UserData {
  id: string
  name: string
  email: string
  role: string
  status: string
  created_at: string
}

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  supervisor: "Supervisor",
  tecnico: "Técnico",
  cliente: "Cliente",
}

const roleColors: Record<string, string> = {
  admin: "bg-primary/10 text-primary border-primary/20",
  supervisor: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  tecnico: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  cliente: "bg-muted text-muted-foreground border-border",
}

const statusColors: Record<string, string> = {
  activo: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  inactivo: "bg-muted text-muted-foreground border-border",
  suspendido: "bg-destructive/10 text-destructive border-destructive/20",
}

export default function UsuariosConfigPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<UserData | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserData | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [createForm, setCreateForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    role: "tecnico", status: "activo",
  })
  const [editForm, setEditForm] = useState({ name: "", status: "activo" })

  const loadUsers = async () => {
    try {
      setLoadingUsers(true)
      const res = await authenticatedFetch("/api/users/list")
      if (!res.ok) { setUsers([]); return }
      const data = await res.json()
      setUsers(data.data || [])
    } catch {
      console.warn("[v0] Error loading users")
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!createForm.name.trim()) return setError("El nombre es requerido") as undefined
    if (!createForm.email.includes("@")) return setError("Email inválido") as undefined
    if (createForm.password.length < 6) return setError("Contraseña mínimo 6 caracteres") as undefined
    if (createForm.password !== createForm.confirmPassword) return setError("Las contraseñas no coinciden") as undefined

    setIsLoading(true)
    try {
      const res = await authenticatedFetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createForm.name, email: createForm.email,
          password: createForm.password, role: createForm.role, status: createForm.status,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Error al crear el usuario"); return }

      setSuccess("Usuario creado exitosamente")
      setCreateForm({ name: "", email: "", password: "", confirmPassword: "", role: "tecnico", status: "activo" })
      await loadUsers()
      setTimeout(() => { setCreateOpen(false); setSuccess("") }, 2000)
    } catch {
      setError("Error de conexión")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTarget) return
    setError("")
    setIsLoading(true)
    try {
      const res = await authenticatedFetch(`/api/users/${editTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editForm.name, status: editForm.status }),
      })
      if (!res.ok) { setError("Error al actualizar usuario"); return }
      setSuccess("Usuario actualizado")
      await loadUsers()
      setTimeout(() => { setEditOpen(false); setSuccess("") }, 1500)
    } catch {
      setError("Error de conexión")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await authenticatedFetch(`/api/users/${deleteTarget.id}`, { method: "DELETE" })
      setDeleteTarget(null)
      await loadUsers()
    } catch {
      console.warn("[v0] Error deleting user")
    }
  }

  return (
    <main className="overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {users.length} usuario{users.length !== 1 ? "s" : ""} en el sistema
            </p>
          </div>
          <Button onClick={() => { setError(""); setSuccess(""); setCreateOpen(true) }} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios Registrados</CardTitle>
            <CardDescription>Administrá el acceso, rol y estado de cada usuario</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loadingUsers ? (
              <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando usuarios...
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <User className="h-10 w-10 mb-2 opacity-30" />
                <p className="text-sm">No hay usuarios registrados aún</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Usuario</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Rol</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Estado</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Alta</th>
                      <th className="py-3 px-4 w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className={cn("text-[11px]", roleColors[user.role] ?? "bg-muted text-muted-foreground")}>
                            {roleLabels[user.role] ?? user.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className={cn("text-[11px]", statusColors[user.status] ?? statusColors.inactivo)}>
                            {user.status === "activo" ? "Activo" : user.status === "inactivo" ? "Inactivo" : "Suspendido"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString("es-ES")}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 justify-end">
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7"
                              onClick={() => { setEditTarget(user); setEditForm({ name: user.name, status: user.status }); setError(""); setSuccess(""); setEditOpen(true) }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(user)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>Completá todos los campos para agregar un nuevo usuario.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="cn-name">Nombre Completo *</Label>
              <Input id="cn-name" placeholder="Juan Pérez" value={createForm.name}
                onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cn-email">Email *</Label>
              <Input id="cn-email" type="email" placeholder="usuario@ejemplo.com" value={createForm.email}
                onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} disabled={isLoading} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cn-pass">Contraseña *</Label>
                <Input id="cn-pass" type="password" placeholder="••••••••" value={createForm.password}
                  onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cn-confirm">Confirmar *</Label>
                <Input id="cn-confirm" type="password" placeholder="••••••••" value={createForm.confirmPassword}
                  onChange={e => setCreateForm(f => ({ ...f, confirmPassword: e.target.value }))} disabled={isLoading} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Rol *</Label>
                <Select value={createForm.role} onValueChange={v => setCreateForm(f => ({ ...f, role: v }))} disabled={isLoading}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="tecnico">Técnico</SelectItem>
                    <SelectItem value="cliente">Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado *</Label>
                <Select value={createForm.status} onValueChange={v => setCreateForm(f => ({ ...f, status: v }))} disabled={isLoading}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                    <SelectItem value="suspendido">Suspendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0" />{error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 p-3 text-sm text-emerald-700 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 shrink-0" />{success}
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1 gap-2" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? "Creando..." : "Crear Usuario"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={isLoading} className="flex-1">Cancelar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>{editTarget?.email}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={editForm.name}
                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))} disabled={isLoading}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                  <SelectItem value="suspendido">Suspendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0" />{error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 p-3 text-sm text-emerald-700 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 shrink-0" />{success}
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 gap-2" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="flex-1">Cancelar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente a <strong>{deleteTarget?.name}</strong>. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
