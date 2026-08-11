import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Period = 'TODAY' | 'YESTERDAY' | '7D' | '30D' | '60D' | 'ALL'

interface PeriodStats {
  total_bets: number
  win_rate: number
  roi: number
  total_profit: number
}

function getRangeStart(period: Period): Date | null {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (period === 'TODAY') return startOfToday
  if (period === 'YESTERDAY') return new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000)
  if (period === '7D') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  if (period === '30D') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  if (period === '60D') return new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
  return null
}

export function useStatsByPeriod(period: Period) {
  const [stats, setStats] = useState<PeriodStats>({ total_bets: 0, win_rate: 0, roi: 0, total_profit: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    const fetchStats = async function () {
      try {
        setLoading(true)
        const supabase = createClient()

        const result = await supabase
          .from('bets')
          .select('*')
          .neq('status', 'PENDING')
          .order('created_at', { ascending: false })

        if (result.error) throw result.error

        let bets = result.data || []
        const start = getRangeStart(period)

        if (start) {
          if (period === 'YESTERDAY') {
            const now = new Date()
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            bets = bets.filter(function (b) {
              const d = new Date(b.created_at)
              return d >= start && d < startOfToday
            })
          } else {
            bets = bets.filter(function (b) { return new Date(b.created_at) >= start })
          }
        }

        const total = bets.length
        const won = bets.filter(function (b) { return b.status === 'WIN' || b.status === 'PARTIAL_WIN' }).length
        const winRate = total > 0 ? (won / total) * 100 : 0
        const totalProfit = bets.reduce(function (sum, b) { return sum + Number(b.profit || 0) }, 0)
        const totalStake = bets.reduce(function (sum, b) { return sum + Number(b.stake || 0) }, 0)
        const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0

        setStats({
          total_bets: total,
          win_rate: Math.round(winRate * 10) / 10,
          roi: Math.round(roi * 10) / 10,
          total_profit: Math.round(totalProfit * 100) / 100,
        })
      } catch (err) {
        console.error('Error cargando stats por periodo:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [period])

  return { stats, loading }
}