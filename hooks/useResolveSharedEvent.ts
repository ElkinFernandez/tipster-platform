import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calculateBetResult } from '@/hooks/useRegisterResult'
import { BetLeg } from '@/types'

export function useResolveSharedEvent() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resolveEvent = async function (eventId: string, status: string, resultAt: string) {
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const resultAtISO = new Date(resultAt).toISOString()

      const eventUpdate = await supabase
        .from('shared_events')
        .update({ status: status, result_at: resultAtISO })
        .eq('id', eventId)

      if (eventUpdate.error) throw new Error(eventUpdate.error.message)

      const legsUpdate = await supabase
        .from('bet_legs')
        .update({ status: status })
        .eq('shared_event_id', eventId)

      if (legsUpdate.error) throw new Error(legsUpdate.error.message)

      const affectedLegs = await supabase
        .from('bet_legs')
        .select('bet_id')
        .eq('shared_event_id', eventId)

      if (affectedLegs.error) throw new Error(affectedLegs.error.message)

      const betIds = Array.from(new Set((affectedLegs.data || []).map(function (l) { return l.bet_id })))

      for (const betId of betIds) {
        const betResult = await supabase.from('bets').select('*').eq('id', betId).single()
        if (betResult.error || !betResult.data) continue
        const bet = betResult.data

        const legsResult = await supabase.from('bet_legs').select('*').eq('bet_id', betId)
        if (legsResult.error || !legsResult.data) continue
        const allLegs = legsResult.data as BetLeg[]

        const stillPending = allLegs.some(function (l) { return l.status === 'PENDING' })
        if (stillPending) continue

        const result = calculateBetResult(allLegs, Number(bet.odds_combined), Number(bet.stake))

        await supabase
          .from('bets')
          .update({
            status: result.status,
            odds_combined: result.finalOdds,
            profit: result.profit,
            result_at: resultAtISO,
          })
          .eq('id', betId)
      }

      setSaving(false)
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      setSaving(false)
      return { success: false }
    }
  }

  return { resolveEvent, saving, error }
}