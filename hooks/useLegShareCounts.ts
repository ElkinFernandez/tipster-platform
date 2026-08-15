import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLegShareCounts(sharedEventIds: string[]) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const key = sharedEventIds.slice().sort().join(',')

  useEffect(function () {
    const ids = key ? key.split(',') : []

    const fetchCounts = async function () {
      if (ids.length === 0) {
        setCounts({})
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const supabase = createClient()
        const result = await supabase
          .from('bet_legs')
          .select('shared_event_id')
          .in('shared_event_id', ids)

        if (result.error) throw result.error

        const map: Record<string, number> = {}
        result.data.forEach(function (row: { shared_event_id: string | null }) {
          const id = row.shared_event_id
          if (!id) return
          map[id] = (map[id] || 0) + 1
        })
        setCounts(map)
      } catch (err) {
        console.error('Error contando eventos compartidos:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCounts()
  }, [key])

  return { counts, loading }
}