import { useEffect, useState } from 'react'

export function useNextWorkOrderId() {
  const [nextId, setNextId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchNextId() {
      try {
        const res = await fetch('/api/work-orders/next-id')
        if (!res.ok) throw new Error('Failed to fetch next ID')
        const data = await res.json()
        setNextId(data.nextId)
      } catch (err) {
        console.error('[v0] Error fetching next work order ID:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setNextId(`OT-${String(Date.now() % 10000).padStart(4, '0')}`)
      } finally {
        setLoading(false)
      }
    }
    fetchNextId()
  }, [])

  return { nextId, loading, error }
}
