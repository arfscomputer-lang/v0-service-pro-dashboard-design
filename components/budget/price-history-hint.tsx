'use client'

import { useState, useEffect } from 'react'
import { getHistoricalPrice } from '@/lib/price-history'
import { Button } from '@/components/ui/button'
import { TrendingUp } from 'lucide-react'

interface PriceHistoryHintProps {
  productName: string
  currency: 'USD' | 'VES' | 'PYG'
  onUsePrice: (price: number) => void
}

const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  VES: 36.5,
  PYG: 6800,
}

export function PriceHistoryHint({ productName, currency, onUsePrice }: PriceHistoryHintProps) {
  const [historicalPrice, setHistoricalPrice] = useState<number | null>(null)

  useEffect(() => {
    const price = getHistoricalPrice(productName, 'USD')
    setHistoricalPrice(price)
  }, [productName])

  if (!historicalPrice || !productName) return null

  const displayPrice = historicalPrice * EXCHANGE_RATES[currency]

  return (
    <div className="mt-2 flex items-center gap-2 p-2 rounded bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <div className="flex-1">
        <p className="text-xs font-medium text-blue-900 dark:text-blue-200">
          Precio histórico: <span className="font-bold">{displayPrice.toFixed(2)} {currency === 'USD' ? '$' : currency === 'VES' ? 'Bs.' : '₲'}</span>
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="text-xs h-7"
        onClick={() => onUsePrice(historicalPrice)}
      >
        Usar
      </Button>
    </div>
  )
}
