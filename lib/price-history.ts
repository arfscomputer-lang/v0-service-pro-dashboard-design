export interface PriceRecord {
  productName: string
  price: number
  currency: 'USD' | 'VES' | 'PYG'
  date: string
}

export function savePriceHistory(productName: string, price: number, currency: 'USD' | 'VES' | 'PYG' = 'USD') {
  try {
    const history = getPriceHistory()
    const record: PriceRecord = {
      productName: productName.toLowerCase(),
      price,
      currency,
      date: new Date().toISOString(),
    }
    history.push(record)
    // Mantener solo los últimos 500 registros para no saturar localStorage
    if (history.length > 500) {
      history.shift()
    }
    localStorage.setItem('priceHistory', JSON.stringify(history))
  } catch (e) {
    console.error('[v0] Error saving price history:', e)
  }
}

export function getPriceHistory(): PriceRecord[] {
  try {
    const data = localStorage.getItem('priceHistory')
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('[v0] Error reading price history:', e)
    return []
  }
}

export function getHistoricalPrice(productName: string, currency: 'USD' | 'VES' | 'PYG' = 'USD'): number | null {
  const history = getPriceHistory()
  // Buscar el precio más reciente del producto en la moneda especificada
  const records = history.filter(
    r => r.productName === productName.toLowerCase() && r.currency === currency
  )
  if (records.length === 0) return null
  
  // Ordenar por fecha descendente y retornar el más reciente
  records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return records[0].price
}

export function getAveragePriceHistory(productName: string, currency: 'USD' | 'VES' | 'PYG' = 'USD'): number | null {
  const history = getPriceHistory()
  const records = history.filter(
    r => r.productName === productName.toLowerCase() && r.currency === currency
  )
  if (records.length === 0) return null
  
  const sum = records.reduce((acc, r) => acc + r.price, 0)
  return sum / records.length
}

export function getPriceHistory30Days(productName: string, currency: 'USD' | 'VES' | 'PYG' = 'USD'): PriceRecord[] {
  const history = getPriceHistory()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  return history.filter(
    r =>
      r.productName === productName.toLowerCase() &&
      r.currency === currency &&
      new Date(r.date) >= thirtyDaysAgo
  )
}

export function clearPriceHistory() {
  try {
    localStorage.removeItem('priceHistory')
  } catch (e) {
    console.error('[v0] Error clearing price history:', e)
  }
}
