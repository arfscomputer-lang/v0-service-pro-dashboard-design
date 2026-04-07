"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit2, Trash2, Lock, CheckCircle2, AlertCircle } from "lucide-react"
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

export default function PermisosPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  // Cargar roles y permisos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/roles')
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setRoles(data.roles || [])
        setPermissions(data.permissions || [])
        console.log('[v0] Loaded roles and permissions')
      } catch (error) {
        console.error('[v0] Error loading roles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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

  const handlePermissionToggle = (permId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permId)
        ? prev.filter(id => id !== permId)
        : [...prev, permId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingRole ? `/api/roles/${editingRole.id}` : '/api/roles'
      const method = editingRole ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          permissions: selectedPermissions,
        }),
      })

      if (!response.ok) throw new Error('Failed to save role')

      const result = await response.json()
      setMessage(editingRole ? 'Rol actualizado correctamente' : 'Rol creado correctamente')

      // Recargar datos
      const reloadResponse = await fetch('/api/roles')
      const reloadData = await reloadResponse.json()
      setRoles(reloadData.roles || [])

      setTimeout(() => {
        setIsDialogOpen(false)
        setMessage("")
      }, 2000)
    } catch (error) {
      console.error('[v0] Error saving role:', error)
      setMessage('Error al guardar el rol')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (!confirm(`¿Está seguro de que desea eliminar el rol "${roleName}"?`)) return

    try {
      const response = await fetch(`/api/roles/${roleId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')

      setMessage('Rol eliminado correctamente')

      // Recargar datos
      const reloadResponse = await fetch('/api/roles')
      const reloadData = await reloadResponse.json()
      setRoles(reloadData.roles || [])

      setTimeout(() => setMessage(""), 2000)
    } catch (error) {
      console.error('[v0] Error deleting role:', error)
      setMessage('Error al eliminar el rol')
    }
  }

  const groupedPermissions = permissions.reduce((acc, perm) => {
    const category = perm.category || 'General'
    if (!acc[category]) acc[category] = []
    acc[category].push(perm)
    return acc
  }, {} as Record<string, Permission[]>)

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Roles y Permisos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona los roles del sistema y sus permisos
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
                <DialogTitle>{editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}</DialogTitle>
                <DialogDescription>
                  {editingRole ? 'Modifica los detalles y permisos del rol' : 'Crea un nuevo rol y asigna permisos'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre del Rol</Label>
                    <Input
                      id="name"
                      placeholder="ej: Supervisor de Ventas"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Input
                      id="description"
                      placeholder="ej: Gestiona órdenes de venta y técnicos"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Permissions */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Permisos</h3>
                  <div className="space-y-4 max-h-60 overflow-y-auto p-4 bg-muted/30 rounded-lg border">
                    {Object.entries(groupedPermissions).map(([category, perms]) => (
                      <div key={category}>
                        <h4 className="font-medium text-sm text-foreground mb-2">{category}</h4>
                        <div className="space-y-2 ml-2">
                          {perms.map((perm) => (
                            <label key={perm.id} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedPermissions.includes(perm.id)}
                                onChange={() => handlePermissionToggle(perm.id)}
                                className="h-4 w-4 rounded border-input"
                              />
                              <div className="flex-1">
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

                {/* Message */}
                {message && (
                  <div className={cn(
                    "flex items-center gap-2 p-3 rounded-lg",
                    message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                  )}>
                    {message.includes('Error') ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {message}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : 'Guardar Rol'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Roles List */}
        {loading ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">Cargando roles...</div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {roles.map((role) => (
              <Card key={role.id} className="hover:bg-muted/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        {role.is_system && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            Sistema
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{role.description}</CardDescription>
                    </div>
                    {!role.is_system && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditRole(role)}
                          className="gap-1"
                        >
                          <Edit2 className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteRole(role.id, role.name)}
                          className="gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Permisos asignados:</p>
                    <div className="flex flex-wrap gap-2">
                      {(role.permissions || []).length === 0 ? (
                        <p className="text-xs text-muted-foreground">Sin permisos asignados</p>
                      ) : (
                        (role.permissions || []).map((perm) => (
                          <Badge key={perm.id} variant="secondary">
                            {perm.name}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
