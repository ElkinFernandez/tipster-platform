import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bet, BetLeg } from '@/types'

export function useBetDetail(betId: string) {
  const [bet, setBet] = useState<Bet | null>(null)
  const [legs, setLegs] = useState<BetLeg[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchDetail = async function () {
      try {
        setLoading(true)
        const supabase = createClient()

        const betResult = await supabase.from('bets').select('*').eq('id', betId).maybeSingle()
        if (betResult.error) throw betResult.error
        setBet(betResult.data)

        const legsResult = await supabase.from('bet_legs').select('*').eq('bet_id', betId).order('created_at', { ascending: true })
        if (legsResult.error) throw legsResult.error
        setLegs(legsResult.data || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    if (betId) {
      fetchDetail()
    }
  }, [betId])

  return { bet, legs, loading, error }
}