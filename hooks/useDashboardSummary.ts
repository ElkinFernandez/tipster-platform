import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bet } from '@/types'

export function useDashboardSummary() {
  const [todayCount, setTodayCount] = useState(0)
  const [todayWon, setTodayWon] = useState(0)
  const [todayProfit, setTodayProfit] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [weekCount, setWeekCount] = useState(0)
  const [nextPending, setNextPending] = useState<Bet | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    const fetchSummary = async function () {
      try {
        setLoading(true)
        const supabase = createClient()

        const now = new Date()
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        const allResult = await supabase
          .from('bets')
          .select('*')
          .order('created_at', { ascending: true })

        if (allResult.error) throw allResult.error

        const bets = allResult.data || []

        const todayBets = bets.filter(function (b) {
          return new Date(b.created_at) >= startOfToday
        })
        const weekBets = bets.filter(function (b) {
          return new Date(b.created_at) >= startOfWeek
        })
        const wonToday = todayBets.filter(function (b) {
          return b.status === 'WIN' || b.status === 'PARTIAL_WIN'
        })
        const profitToday = todayBets.reduce(function (sum, b) {
          return sum + Number(b.profit || 0)
        }, 0)
        const pending = bets.filter(function (b) {
          return b.status === 'PENDING'
        })

        setTodayCount(todayBets.length)
        setTodayWon(wonToday.length)
        setTodayProfit(Math.round(profitToday * 100) / 100)
        setPendingCount(pending.length)
        setWeekCount(weekBets.length)
        setNextPending(pending.length > 0 ? pending[0] : null)
      } catch (err) {
        console.error('Error cargando resumen:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [])

  return { todayCount, todayWon, todayProfit, pendingCount, weekCount, nextPending, loading }
}