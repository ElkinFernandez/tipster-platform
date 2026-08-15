import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useDashboardSummary() {
  const [todayCount, setTodayCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [weekCount, setWeekCount] = useState(0)
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
          .select('id, created_at, status')
          .order('created_at', { ascending: true })

        if (allResult.error) throw allResult.error

        const bets = allResult.data || []

        const publishedTodayCount = bets.filter(function (b) { return new Date(b.created_at) >= startOfToday }).length
        const weekBets = bets.filter(function (b) { return new Date(b.created_at) >= startOfWeek })
        const pending = bets.filter(function (b) { return b.status === 'PENDING' })

        setTodayCount(publishedTodayCount)
        setPendingCount(pending.length)
        setWeekCount(weekBets.length)
      } catch (err) {
        console.error('Error cargando resumen:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [])

  return { todayCount, pendingCount, weekCount, loading }
}