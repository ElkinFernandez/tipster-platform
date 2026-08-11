import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bet, Sport } from '@/types'

export type SportFilter = 'ALL' | Sport

export function useAllBets(sportFilter: SportFilter) {
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchBets = async () => {
      try {
        setLoading(true)
        const supabase = createClient()

        const { data, error } = await supabase
          .from('bets')
          .select('*, bet_legs(sport, league)')
          .neq('status', 'PENDING')
          .order('created_at', { ascending: false })

        if (error) throw error

        const allBets = data || []

        if (sportFilter === 'ALL') {
          setBets(allBets)
        } else {
          const filtered = allBets.filter(function (bet) {
            const legs = bet.bet_legs || []
            return legs.some(function (leg: { sport: string }) {
              return leg.sport === sportFilter
            })
          })
          setBets(filtered)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchBets()
  }, [sportFilter])

  return { bets, loading, error }
}