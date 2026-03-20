import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BUDGET_KITS } from '@/lib/budget-kits'
import { Package, Trash2 } from 'lucide-react'

interface KitSelectorProps {
  onLoadKit: (items: Array<{ section: 'equipos' | 'materiales' | 'mano_de_obra'; description: string; unit: string; quantity: number; price: number }>) => void
}

export function KitSelector({ onLoadKit }: KitSelectorProps) {
  const [selectedKit, setSelectedKit] = useState<string>('')
  const [customKits, setCustomKits] = useState<any[]>([])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('customKits') || '[]')
    setCustomKits(saved)
  }, [])

  const handleLoadKit = () => {
    const allKits = [...BUDGET_KITS, ...customKits]
    const kit = allKits.find(k => k.id === selectedKit)
    if (kit) {
      onLoadKit(kit.items)
      setSelectedKit('')
    }
  }

  const handleDeleteCustomKit = (kitId: string) => {
    if (confirm('¿Eliminar este kit personalizado?')) {
      const updated = customKits.filter(k => k.id !== kitId)
      setCustomKits(updated)
      localStorage.setItem('customKits', JSON.stringify(updated))
    }
  }

  const allKits = [...BUDGET_KITS, ...customKits]

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedKit} onValueChange={setSelectedKit}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Seleccionar kit predefinido..." />
          </SelectTrigger>
          <SelectContent>
            {allKits.length > 0 ? (
              allKits.map(kit => (
                <SelectItem key={kit.id} value={kit.id}>
                  <div className="flex items-center gap-2">
                    <span>{kit.icon}</span>
                    <span>{kit.name}</span>
                  </div>
                </SelectItem>
              ))
            ) : (
              <div className="px-2 py-1 text-sm text-muted-foreground">Sin kits disponibles</div>
            )}
          </SelectContent>
        </Select>
        <Button 
          onClick={handleLoadKit}
          disabled={!selectedKit}
          variant="outline"
          size="sm"
        >
          Cargar
        </Button>
      </div>
      {customKits.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Mis Kits Personalizados:</p>
          <div className="flex flex-wrap gap-2">
            {customKits.map(kit => (
              <div
                key={kit.id}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-sm"
              >
                <span>{kit.icon}</span>
                <span>{kit.name}</span>
                <button
                  onClick={() => handleDeleteCustomKit(kit.id)}
                  className="ml-1 text-destructive hover:text-destructive/80"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
