import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface MarketSelection {
  id: string
  sport_market_id: string
  selection_name: string
  selection_key: string
  display_order: number
}

export function useSelections(marketId: string) {
  const [selections, setSelections] = useState<MarketSelection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    const fetchSelections = async function () {
      try {
        setLoading(true)
        const supabase = createClient()

        const result = await supabase
          .from('market_selections')
          .select('id, sport_market_id, selection_name, selection_key, display_order')
          .eq('sport_market_id', marketId)
          .order('display_order', { ascending: true })

        if (result.error) throw result.error

        setSelections(result.data || [])
      } catch (err) {
        console.error('Error cargando selecciones:', err)
      } finally {
        setLoading(false)
      }
    }

    if (marketId) {
      fetchSelections()
    } else {
      setSelections([])
      setLoading(false)
    }
  }, [marketId])

  return { selections, loading }
}