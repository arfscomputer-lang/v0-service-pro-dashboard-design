import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BUDGET_KITS } from '@/lib/budget-kits'
import { Package } from 'lucide-react'

interface KitSelectorProps {
  onLoadKit: (items: Array<{ section: 'equipos' | 'materiales' | 'mano_de_obra'; description: string; unit: string; quantity: number; price: number }>) => void
}

export function KitSelector({ onLoadKit }: KitSelectorProps) {
  const [selectedKit, setSelectedKit] = useState<string>('')

  const handleLoadKit = () => {
    const kit = BUDGET_KITS.find(k => k.id === selectedKit)
    if (kit) {
      onLoadKit(kit.items)
      setSelectedKit('')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Package className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedKit} onValueChange={setSelectedKit}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Seleccionar kit predefinido..." />
        </SelectTrigger>
        <SelectContent>
          {BUDGET_KITS.map(kit => (
            <SelectItem key={kit.id} value={kit.id}>
              <div className="flex items-center gap-2">
                <span>{kit.icon}</span>
                <span>{kit.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button 
        onClick={handleLoadKit}
        disabled={!selectedKit}
        variant="outline"
        size="sm"
      >
        Cargar Kit
      </Button>
    </div>
  )
}
