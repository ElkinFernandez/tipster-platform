import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bet } from '@/types'

export function useAllBetsAdmin() {
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBets = useCallback(async function () {
    try {
      setLoading(true)
      const supabase = createClient()

      const result = await supabase
        .from('bets')
        .select('*')
        .order('created_at', { ascending: false })

      if (result.error) throw result.error

      setBets(result.data || [])
    } catch (err) {
      console.error('Error cargando apuestas:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(function () {
    fetchBets()
  }, [fetchBets])

  return { bets, loading, refetch: fetchBets }
}