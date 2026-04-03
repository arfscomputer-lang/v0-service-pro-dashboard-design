'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Save, AlertCircle, CheckCircle } from 'lucide-react'

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
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const hasItems = equipment.length > 0 || materials.length > 0 || labor.length > 0
  const totalItems = equipment.length + materials.length + labor.length

  const handleSave = () => {
    if (!kitName.trim()) {
      setSaveStatus('error')
      return
    }

    try {
      // Get existing custom kits
      const customKits = JSON.parse(localStorage.getItem('customKits') || '[]')
      
      // Create new kit object
      const newKit = {
        id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: kitName.trim(),
        icon: '⭐',
        items: [
          ...equipment.map(e => ({ 
            section: 'equipos' as const, 
            description: e.desc, 
            unit: e.unit, 
            quantity: e.qty, 
            price: e.price 
          })),
          ...materials.map(m => ({ 
            section: 'materiales' as const, 
            description: m.desc, 
            unit: m.unit, 
            quantity: m.qty, 
            price: m.price 
          })),
          ...labor.map(l => ({ 
            section: 'mano_de_obra' as const, 
            description: l.desc, 
            unit: l.unit, 
            quantity: l.qty, 
            price: l.price 
          })),
        ],
      }

      // Add to custom kits
      customKits.push(newKit)
      localStorage.setItem('customKits', JSON.stringify(customKits))

      setSaveStatus('success')
      setTimeout(() => {
        setKitName('')
        setSaveStatus('idle')
        setOpen(false)
        onSave(kitName)
      }, 1500)
    } catch (error) {
      console.error('[v0] Error saving kit:', error)
      setSaveStatus('error')
    }
  }

  return (
    <>
      <Button
        onClick={() => {
          setOpen(true)
          setSaveStatus('idle')
        }}
        disabled={!hasItems}
        variant="outline"
        size="sm"
        className="gap-2 text-xs md:text-sm"
      >
        <Save className="h-4 w-4" />
        Guardar Kit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-full md:max-w-md mx-4 md:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">Guardar como Kit Personalizado</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Guarda tu selección de items para reutilizarla en futuros presupuestos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Kit Name Input */}
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-medium text-foreground">Nombre del Kit</label>
              <Input
                placeholder="Ej: Kit Cliente ABC - 8 Cámaras"
                value={kitName}
                onChange={(e) => {
                  setKitName(e.target.value)
                  setSaveStatus('idle')
                }}
                disabled={saveStatus === 'success'}
                className="text-xs md:text-sm"
                autoFocus
              />
              {saveStatus === 'error' && kitName.trim() === '' && (
                <div className="flex items-center gap-2 text-red-600 text-xs">
                  <AlertCircle className="h-3 w-3" />
                  Por favor ingresa un nombre para el kit
                </div>
              )}
            </div>

            {/* Items Summary */}
            <div className="rounded-lg bg-secondary/30 p-3 space-y-2">
              <p className="text-xs font-semibold text-foreground">Se guardará con:</p>
              <ul className="space-y-1 ml-4 text-xs text-muted-foreground">
                {equipment.length > 0 && <li>• {equipment.length} equipo(s) principal(es)</li>}
                {materials.length > 0 && <li>• {materials.length} material(es) de instalación</li>}
                {labor.length > 0 && <li>• {labor.length} servicio(s) de mano de obra</li>}
                {totalItems > 0 && <li className="font-semibold text-foreground">Total: {totalItems} items</li>}
              </ul>
            </div>

            {/* Success Message */}
            {saveStatus === 'success' && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950 p-3 text-green-700 dark:text-green-300 text-xs">
                <CheckCircle className="h-4 w-4 shrink-0" />
                Kit guardado exitosamente
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              size="sm"
              disabled={saveStatus === 'success'}
              className="text-xs md:text-sm"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!kitName.trim() || saveStatus === 'success'}
              size="sm"
              className="text-xs md:text-sm"
            >
              {saveStatus === 'success' ? 'Guardado' : 'Guardar Kit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
