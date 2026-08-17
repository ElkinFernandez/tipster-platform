import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface PendingSharedEvent {
  id: string
  sport: string
  league: string
  competitor_1: string
  competitor_2: string
  market: string
  selection: string
  status: string
  result_at: string | null
  bet_count: number
}

export function usePendingSharedEvents(statusFilter: 'PENDING' | 'RESOLVED') {
  const [events, setEvents] = useState<PendingSharedEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    const fetchEvents = async function () {
      try {
        setLoading(true)
        const supabase = createClient()

        let query = supabase
          .from('shared_events')
          .select('id, sport, league, competitor_1, competitor_2, market, selection, status, result_at')

        query = statusFilter === 'PENDING' ? query.eq('status', 'PENDING') : query.neq('status', 'PENDING')

        const eventsResult = await query.order('created_at', { ascending: false })

        if (eventsResult.error) throw eventsResult.error

        const eventsList = eventsResult.data || []
        const withCounts: PendingSharedEvent[] = []

        for (const ev of eventsList) {
          const countResult = await supabase
            .from('bet_legs')
            .select('id', { count: 'exact', head: true })
            .eq('shared_event_id', ev.id)

          const count = countResult.count || 0

          if (count > 1) {
            withCounts.push({
              id: ev.id,
              sport: ev.sport,
              league: ev.league,
              competitor_1: ev.competitor_1,
              competitor_2: ev.competitor_2,
              market: ev.market,
              selection: ev.selection,
              status: ev.status,
              result_at: ev.result_at,
              bet_count: count,
            })
          }
        }

        setEvents(withCounts)
      } catch (err) {
        console.error('Error cargando eventos compartidos:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [statusFilter])

  return { events, loading }
}
