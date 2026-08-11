import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bet } from '@/types'

export function usePendingBets() {
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(function () {
    const fetchPending = async function () {
      try {
        setLoading(true)
        const supabase = createClient()

        const result = await supabase
          .from('bets')
          .select('*')
          .eq('status', 'PENDING')
          .order('created_at', { ascending: true })

        if (result.error) throw result.error

        setBets(result.data || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchPending()
  }, [])

  return { bets, loading, error }
}