import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bet, BetLeg } from '@/types'

export function useBets(tipsterId?: string) {
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchBets = async () => {
      try {
        setLoading(true)
        const supabase = createClient()

        let query = supabase.from('bets').select('*')

        if (tipsterId) {
          query = query.eq('tipster_id', tipsterId)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) throw error

        setBets(data || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchBets()
  }, [tipsterId])

  return { bets, loading, error }
}

export function useBetDetail(betId: string) {
  const [bet, setBet] = useState<Bet | null>(null)
  const [legs, setLegs] = useState<BetLeg[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchBetDetail = async () => {
      try {
        setLoading(true)
        const supabase = createClient()

        const { data: betData, error: betError } = await supabase
          .from('bets')
          .select('*')
          .eq('id', betId)
          .single()

        if (betError) throw betError

        setBet(betData)

        const { data: legsData, error: legsError } = await supabase
          .from('bet_legs')
          .select('*')
          .eq('bet_id', betId)
          .order('created_at', { ascending: true })

        if (legsError) throw legsError

        setLegs(legsData || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    if (betId) {
      fetchBetDetail()
    }
  }, [betId])

  return { bet, legs, loading, error }
}