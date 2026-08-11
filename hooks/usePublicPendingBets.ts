import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface PublicPendingBet {
  id: string
  type: string
  odds_combined: number
  evidence_url: string | null
}

export function usePublicPendingBets() {
  const [bets, setBets] = useState<PublicPendingBet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    const fetchPending = async function () {
      try {
        setLoading(true)
        const supabase = createClient()

        const result = await supabase
          .from('bets')
          .select('id, type, odds_combined, evidence_url')
          .eq('status', 'PENDING')
          .order('created_at', { ascending: false })

        if (result.error) throw result.error

        setBets(result.data || [])
      } catch (err) {
        console.error('Error cargando pronosticos en juego:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPending()
  }, [])

  return { bets, loading }
}