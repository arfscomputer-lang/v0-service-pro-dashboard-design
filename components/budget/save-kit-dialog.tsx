'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Save } from 'lucide-react'

interface Item {
  desc: string
  unit: string
  qty: number
  price: number
}

interface SaveKitDialogProps {
  equipment: Item[]
  materials: Item[]
  labor: Item[]
  onSave: (kitName: string) => void
}

export function SaveKitDialog({ equipment, materials, labor, onSave }: SaveKitDialogProps) {
  const [open, setOpen] = useState(false)
  const [kitName, setKitName] = useState('')

  const hasItems = equipment.length > 0 || materials.length > 0 || labor.length > 0

  const handleSave = () => {
    if (!kitName.trim()) {
      alert('Por favor ingresa un nombre para el kit')
      return
    }

    // Save to localStorage
    const customKits = JSON.parse(localStorage.getItem('customKits') || '[]')
    const newKit = {
      id: `custom-${Date.now()}`,
      name: kitName,
      icon: '⭐',
      items: [
        ...equipment.map(e => ({ section: 'equipos' as const, description: e.desc, unit: e.unit, quantity: e.qty, price: e.price })),
        ...materials.map(m => ({ section: 'materiales' as const, description: m.desc, unit: m.unit, quantity: m.qty, price: m.price })),
        ...labor.map(l => ({ section: 'mano_de_obra' as const, description: l.desc, unit: l.unit, quantity: l.qty, price: l.price })),
      ],
    }

    customKits.push(newKit)
    localStorage.setItem('customKits', JSON.stringify(customKits))

    alert(`Kit "${kitName}" guardado exitosamente`)
    onSave(kitName)
    setKitName('')
    setOpen(false)
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={!hasItems}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Save className="h-4 w-4" />
        Guardar como Kit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Guardar como Kit Personalizado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Nombre del Kit</label>
              <Input
                placeholder="Ej: Kit Cliente ABC - 8 Cámaras"
                value={kitName}
                onChange={(e) => setKitName(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Se guardará con:</p>
              <ul className="mt-2 space-y-1 ml-4">
                {equipment.length > 0 && <li>• {equipment.length} equipo(s)</li>}
                {materials.length > 0 && <li>• {materials.length} material(es)</li>}
                {labor.length > 0 && <li>• {labor.length} servicio(s) de mano de obra</li>}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Guardar Kit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
