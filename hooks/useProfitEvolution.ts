import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface ProfitPoint {
  label: string
  shortLabel: string
  profit: number
}

export function useProfitEvolution() {
  const [points, setPoints] = useState<ProfitPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    const fetchData = async function () {
      try {
        setLoading(true)
        const supabase = createClient()

        const result = await supabase
          .from('bets')
          .select('*')
          .neq('status', 'PENDING')
          .order('result_at', { ascending: true })

        if (result.error) throw result.error

        const bets = (result.data || []).filter(function (b) { return b.result_at })
        let running = 0
        const list: ProfitPoint[] = []

        bets.forEach(function (bet, index) {
          running = running + Number(bet.profit || 0)
          const date = new Date(bet.result_at)
          const fullLabel = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
          const shortLabel = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
          list.push({ label: fullLabel, shortLabel: shortLabel + ' #' + (index + 1), profit: Math.round(running * 100) / 100 })
        })

        setPoints(list)
      } catch (err) {
        console.error('Error cargando evolucion:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { points, loading }
}