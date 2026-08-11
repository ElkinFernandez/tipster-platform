import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface GeneralStats {
  total_bets: number
  win_rate: number
  roi: number
  total_profit: number
  average_odds: number
}

interface SportBreakdown {
  sport: string
  profit: number
  count: number
}

interface TypeBreakdown {
  type: string
  count: number
  win_rate: number
}

interface TimingBreakdown {
  timing: string
  count: number
  percentage: number
  win_rate: number
}

interface AnalysisBreakdown {
  analysis: string
  count: number
  percentage: number
  win_rate: number
  profit: number
}

export function useFullStats() {
  const [general, setGeneral] = useState<GeneralStats>({
    total_bets: 0,
    win_rate: 0,
    roi: 0,
    total_profit: 0,
    average_odds: 0,
  })
  const [bySport, setBySport] = useState<SportBreakdown[]>([])
  const [byType, setByType] = useState<TypeBreakdown[]>([])
  const [byTiming, setByTiming] = useState<TimingBreakdown[]>([])
  const [byAnalysis, setByAnalysis] = useState<AnalysisBreakdown[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    const fetchAll = async function () {
      try {
        setLoading(true)
        const supabase = createClient()

        const betsResult = await supabase
          .from('bets')
          .select('*, bet_legs(sport)')
          .neq('status', 'PENDING')

        if (betsResult.error) throw betsResult.error

        const bets = betsResult.data || []
        const total = bets.length
        const won = bets.filter(function (b) {
          return b.status === 'WIN' || b.status === 'PARTIAL_WIN'
        }).length
        const winRate = total > 0 ? (won / total) * 100 : 0

        const totalProfit = bets.reduce(function (sum, b) { return sum + Number(b.profit || 0) }, 0)
        const totalStake = bets.reduce(function (sum, b) { return sum + Number(b.stake || 0) }, 0)
        const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0
        const avgOdds = total > 0
          ? bets.reduce(function (sum, b) { return sum + Number(b.odds_combined || 0) }, 0) / total
          : 0

        setGeneral({
          total_bets: total,
          win_rate: Math.round(winRate * 10) / 10,
          roi: Math.round(roi * 10) / 10,
          total_profit: Math.round(totalProfit * 100) / 100,
          average_odds: Math.round(avgOdds * 1000) / 1000,
        })

        const sportMap: Record<string, { profit: number; count: number }> = {}
        bets.forEach(function (bet) {
          const legs = bet.bet_legs || []
          const uniqueSports = new Set(legs.map(function (l: { sport: string }) { return l.sport }))
          uniqueSports.forEach(function (sport) {
            const key = String(sport)
            if (!sportMap[key]) sportMap[key] = { profit: 0, count: 0 }
            sportMap[key].profit += Number(bet.profit || 0)
            sportMap[key].count += 1
          })
        })
        const sportList = Object.keys(sportMap).map(function (key) {
          return { sport: key, profit: Math.round(sportMap[key].profit * 100) / 100, count: sportMap[key].count }
        })
        setBySport(sportList)

        const typeMap: Record<string, { won: number; total: number }> = {}
        bets.forEach(function (bet) {
          const key = bet.type
          if (!typeMap[key]) typeMap[key] = { won: 0, total: 0 }
          typeMap[key].total += 1
          if (bet.status === 'WIN' || bet.status === 'PARTIAL_WIN') typeMap[key].won += 1
        })
        const typeList = Object.keys(typeMap).map(function (key) {
          const data = typeMap[key]
          const wr = data.total > 0 ? (data.won / data.total) * 100 : 0
          return { type: key, count: data.total, win_rate: Math.round(wr * 10) / 10 }
        })
        setByType(typeList)

        const timingMap: Record<string, { won: number; total: number }> = {}
        bets.forEach(function (bet) {
          const key = bet.timing
          if (!timingMap[key]) timingMap[key] = { won: 0, total: 0 }
          timingMap[key].total += 1
          if (bet.status === 'WIN' || bet.status === 'PARTIAL_WIN') timingMap[key].won += 1
        })
        const timingList = Object.keys(timingMap).map(function (key) {
          const data = timingMap[key]
          const wr = data.total > 0 ? (data.won / data.total) * 100 : 0
          const pct = total > 0 ? (data.total / total) * 100 : 0
          return { timing: key, count: data.total, percentage: Math.round(pct * 10) / 10, win_rate: Math.round(wr * 10) / 10 }
        })
        setByTiming(timingList)

        const analysisMap: Record<string, { won: number; total: number; profit: number }> = {}
        bets.forEach(function (bet) {
          const key = bet.analysis_type
          if (!analysisMap[key]) analysisMap[key] = { won: 0, total: 0, profit: 0 }
          analysisMap[key].total += 1
          analysisMap[key].profit += Number(bet.profit || 0)
          if (bet.status === 'WIN' || bet.status === 'PARTIAL_WIN') analysisMap[key].won += 1
        })
        const analysisList = Object.keys(analysisMap).map(function (key) {
          const data = analysisMap[key]
          const wr = data.total > 0 ? (data.won / data.total) * 100 : 0
          const pct = total > 0 ? (data.total / total) * 100 : 0
          return { analysis: key, count: data.total, percentage: Math.round(pct * 10) / 10, win_rate: Math.round(wr * 10) / 10, profit: Math.round(data.profit * 100) / 100 }
        })
        setByAnalysis(analysisList)
      } catch (err) {
        console.error('Error cargando estadisticas:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  return { general, bySport, byType, byTiming, byAnalysis, loading }
}