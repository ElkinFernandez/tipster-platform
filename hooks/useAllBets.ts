import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bet, Sport } from '@/types'

export type SportFilter = 'ALL' | Sport
export type StatusFilter = 'ALL' | 'WIN' | 'LOSS' | 'PARTIAL_WIN' | 'VOID'
export type TypeFilter = 'ALL' | string

export function useAllBets(sportFilter: SportFilter, statusFilter: StatusFilter, typeFilter: TypeFilter) {
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(function () {
    const fetchBets = async function () {
      try {
        setLoading(true)
        const supabase = createClient()

        let query = supabase
          .from('bets')
          .select('*, bet_legs(sport, league)')
          .neq('status', 'PENDING')
          .order('created_at', { ascending: false })

        if (statusFilter !== 'ALL') {
          query = query.eq('status', statusFilter)
        }

        if (typeFilter !== 'ALL') {
          query = query.eq('type', typeFilter)
        }

        const result = await query

        if (result.error) throw result.error

        const allBets = result.data || []

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
  }, [sportFilter, statusFilter, typeFilter])

  return { bets, loading, error }
}