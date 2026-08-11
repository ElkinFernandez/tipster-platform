import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tipster } from '@/types'

export function useTipster() {
  const [tipster, setTipster] = useState<Tipster | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchTipster = async () => {
      try {
        setLoading(true)
        const supabase = createClient()

        const { data, error } = await supabase
          .from('tipsters')
          .select('*')
          .limit(1)
          .maybeSingle()

        if (error) throw error

        setTipster(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchTipster()
  }, [])

  return { tipster, loading, error }
}