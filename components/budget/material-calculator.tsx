import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'

interface Item {
  id: number
  desc: string
  unit: string
  qty: number
  price: number
}

interface MaterialCalculatorProps {
  equipment: Item[]
  materials: Item[]
  onAddMaterials: (items: Item[]) => void
}

export function MaterialCalculator({ equipment, materials, onAddMaterials }: MaterialCalculatorProps) {
  const [suggestions, setSuggestions] = useState<{ desc: string; qty: number; reason: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const calculateMaterials = () => {
    const suggests: { desc: string; qty: number; reason: string }[] = []
    const existingMaterials = materials.map(m => m.desc.toLowerCase())

    // Contar cámaras IP vs TurboHD
    const camIP = equipment.filter(e => e.desc.toLowerCase().includes('ip')).length
    const camTurbo = equipment.filter(e => e.desc.toLowerCase().includes('turbohd') || e.desc.toLowerCase().includes('ahd')).length
    
    // Conectores RJ45 para cámaras IP
    if (camIP > 0 && !existingMaterials.some(m => m.includes('rj45'))) {
      suggests.push({
        desc: 'Conector RJ45 Cat.5e Macho (pack 20)',
        qty: Math.ceil((camIP * 2) / 20),
        reason: `2 conectores por cada ${camIP} cámara IP`
      })
    }

    // Cable UTP para cámaras
    const totalCams = camIP + camTurbo
    if (totalCams > 0 && !existingMaterials.some(m => m.includes('cable utp'))) {
      const metersNeeded = totalCams * 40
      const rollo = Math.ceil(metersNeeded / 100)
      suggests.push({
        desc: 'Cable UTP Cat.5e 100% Cobre 100m',
        qty: rollo,
        reason: `~40m por cámara (${totalCams} cámaras = ${metersNeeded}m)`
      })
    }

    // Balunes para TurboHD
    if (camTurbo > 0 && !existingMaterials.some(m => m.includes('balun'))) {
      suggests.push({
        desc: 'Video Balun HD Pasivo Hasta 4K',
        qty: camTurbo,
        reason: `1 balun por cada cámara TurboHD`
      })
    }

    // Fuentes 12V para TurboHD
    if (camTurbo > 0 && !existingMaterials.some(m => m.includes('fuente'))) {
      suggests.push({
        desc: 'Fuente Alimentación 12V 2A Plástico',
        qty: Math.ceil(camTurbo / 4),
        reason: `1 fuente para cada 4 cámaras TurboHD`
      })
    }

    // Verificar NVR/DVR y sugerir disco
    const hasNVR = equipment.some(e => e.desc.toLowerCase().includes('nvr') || e.desc.toLowerCase().includes('dvr'))
    const hasHDD = materials.some(m => m.desc.toLowerCase().includes('disco duro') || m.desc.toLowerCase().includes('hdd'))
    
    if (hasNVR && !hasHDD) {
      const suggestedCapacity = totalCams <= 4 ? '1TB' : totalCams <= 8 ? '2TB' : '4TB'
      suggests.push({
        desc: `Disco Duro Purple ${suggestedCapacity} SATA CCTV`,
        qty: 1,
        reason: `${suggestedCapacity} recomendado para ${totalCams} cámaras`
      })
    }

    setSuggestions(suggests)
    setShowSuggestions(true)
  }

  const handleAddSuggestion = (idx: number) => {
    const sugg = suggestions[idx]
    const newMaterial: Item = {
      id: Math.max(...materials.map(m => m.id), 0) + 1,
      desc: sugg.desc,
      unit: 'Und',
      qty: sugg.qty,
      price: 0
    }
    onAddMaterials([...materials, newMaterial])
    // Remover la sugerencia
    setSuggestions(suggestions.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={calculateMaterials}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Zap className="h-4 w-4" />
        Calcular materiales
      </Button>

      {showSuggestions && suggestions.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
          <p className="text-sm font-semibold text-blue-900">Materiales sugeridos:</p>
          {suggestions.map((sugg, idx) => (
            <div key={idx} className="flex items-start justify-between gap-2 p-2 bg-white rounded border border-blue-100 text-sm">
              <div className="flex-1">
                <p className="font-medium text-foreground">{sugg.desc}</p>
                <p className="text-xs text-muted-foreground">{sugg.reason} (Qty: {sugg.qty})</p>
              </div>
              <Button
                onClick={() => handleAddSuggestion(idx)}
                size="sm"
                variant="default"
                className="h-8 text-xs"
              >
                Agregar
              </Button>
            </div>
          ))}
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && (
        <p className="text-sm text-muted-foreground">Todos los materiales necesarios están ya incluidos.</p>
      )}
    </div>
  )
}
