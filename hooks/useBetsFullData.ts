import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface FullLeg {
  id: string
  sport: string
  league: string
  competitor_1: string
  competitor_2: string
  market: string
  selection: string
  odds: number
}

export interface FullBet {
  id: string
  type: string
  status: string
  profit: number
  odds_combined: number
  stake: number
  created_at: string
  result_at: string | null
  bet_legs: FullLeg[]
}

export function useBetsFullData() {
  const [bets, setBets] = useState<FullBet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    const fetchData = async function () {
      try {
        setLoading(true)
        const supabase = createClient()
        const result = await supabase
          .from('bets')
          .select('id, type, status, profit, odds_combined, stake, created_at, result_at, bet_legs(id, sport, league, competitor_1, competitor_2, market, selection, odds)')
          .neq('status', 'PENDING')
          .order('created_at', { ascending: true })
        if (result.error) throw result.error
        setBets(result.data || [])
      } catch (err) {
        console.error('Error cargando apuestas:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return { bets, loading }
}