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
  bet_count: number
}

export function usePendingSharedEvents() {
  const [events, setEvents] = useState<PendingSharedEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    const fetchEvents = async function () {
      try {
        setLoading(true)
        const supabase = createClient()

        const eventsResult = await supabase
          .from('shared_events')
          .select('id, sport, league, competitor_1, competitor_2, market, selection')
          .eq('status', 'PENDING')
          .order('created_at', { ascending: true })

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
              bet_count: count,
            })
          }
        }

        setEvents(withCounts)
      } catch (err) {
        console.error('Error cargando eventos pendientes:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return { events, loading }
}