import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface SharedEvent {
  id: string
  sport: string
  league: string
  competitor_1: string
  competitor_2: string
  sport_market_id: string | null
  market_selection_id: string | null
  market: string
  selection: string
  status: string
}

export function useSharedEvents(sport: string) {
  const [events, setEvents] = useState<SharedEvent[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEvents = useCallback(async function () {
    try {
      setLoading(true)
      const supabase = createClient()
      const result = await supabase
        .from('shared_events')
        .select('id, sport, league, competitor_1, competitor_2, sport_market_id, market_selection_id, market, selection, status')
        .eq('sport', sport)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false })
      if (result.error) throw result.error
      setEvents(result.data || [])
    } catch (err) {
      console.error('Error cargando eventos compartidos:', err)
    } finally {
      setLoading(false)
    }
  }, [sport])

  useEffect(function () {
    if (sport) fetchEvents()
  }, [fetchEvents, sport])

  return { events, loading, refetch: fetchEvents }
}