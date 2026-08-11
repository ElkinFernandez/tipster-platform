import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bet, BetStats } from '@/types'

export function useHomeStats() {
  const [stats, setStats] = useState<BetStats>({
    total_bets: 0,
    win_rate: 0,
    roi: 0,
    total_profit: 0,
    average_odds: 0,
  })
  const [recentBets, setRecentBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const supabase = createClient()

        // Trae TODAS las apuestas con resultado (no las pendientes)
        const { data: allBets, error: betsError } = await supabase
          .from('bets')
          .select('*')
          .neq('status', 'PENDING')
          .order('created_at', { ascending: false })

        if (betsError) throw betsError

        const bets = allBets || []

        // Calcula estadísticas generales
        const totalBets = bets.length
        const wonBets = bets.filter(
          b => b.status === 'WIN' || b.status === 'PARTIAL_WIN'
        ).length
        const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0

        const totalProfit = bets.reduce((sum, b) => sum + Number(b.profit || 0), 0)
        const totalStake = bets.reduce((sum, b) => sum + Number(b.stake || 0), 0)
        const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0

        const averageOdds =
          totalBets > 0
            ? bets.reduce((sum, b) => sum + Number(b.odds_combined || 0), 0) / totalBets
            : 0

        setStats({
          total_bets: totalBets,
          win_rate: Math.round(winRate * 10) / 10,
          roi: Math.round(roi * 10) / 10,
          total_profit: Math.round(totalProfit * 100) / 100,
          average_odds: Math.round(averageOdds * 1000) / 1000,
        })

        // Las 5 más recientes para la vista previa
        setRecentBets(bets.slice(0, 5))
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, recentBets, loading, error }
}