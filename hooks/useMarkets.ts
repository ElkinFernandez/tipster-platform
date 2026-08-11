import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface SportMarket {
  id: string
  sport: string
  market_name: string
  market_key: string
  market_category: string
  display_order: number
}

export function useMarkets(sport: string) {
  const [markets, setMarkets] = useState<SportMarket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    const fetchMarkets = async function () {
      try {
        setLoading(true)
        const supabase = createClient()

        const result = await supabase
          .from('sport_markets')
          .select('id, sport, market_name, market_key, market_category, display_order')
          .eq('sport', sport)
          .order('display_order', { ascending: true })

        if (result.error) throw result.error

        setMarkets(result.data || [])
      } catch (err) {
        console.error('Error cargando mercados:', err)
      } finally {
        setLoading(false)
      }
    }

    if (sport) {
      fetchMarkets()
    }
  }, [sport])

  return { markets, loading }
}