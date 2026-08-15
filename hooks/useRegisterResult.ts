import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BetLeg } from '@/types'

export function calculateBetResult(legs: BetLeg[], originalOdds: number, stake: number) {
  const hasLoss = legs.some(function (leg) { return leg.status === 'LOSS' })
  const allVoid = legs.every(function (leg) { return leg.status === 'VOID' })

  if (hasLoss) {
    return { status: 'LOSS', finalOdds: originalOdds, profit: -stake }
  }

  if (allVoid) {
    return { status: 'VOID', finalOdds: originalOdds, profit: 0 }
  }

  const hasVoid = legs.some(function (leg) { return leg.status === 'VOID' })

  let finalOdds = 1
  legs.forEach(function (leg) {
    if (leg.status === 'WIN') {
      finalOdds = finalOdds * Number(leg.odds)
    }
  })

  const profit = (finalOdds - 1) * stake

  if (hasVoid) {
    return { status: 'PARTIAL_WIN', finalOdds: finalOdds, profit: profit }
  }

  return { status: 'WIN', finalOdds: finalOdds, profit: profit }
}

export function useRegisterResult() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const registerResult = async function (
    betId: string,
    legsToUpdate: { id: string; status: string; sharedEventId: string | null }[],
    resultAt: string
  ) {
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const resultAtISO = new Date(resultAt).toISOString()

      for (const leg of legsToUpdate) {
        const legUpdate = await supabase
          .from('bet_legs')
          .update({ status: leg.status })
          .eq('id', leg.id)

        if (legUpdate.error) throw new Error(legUpdate.error.message)

        if (leg.sharedEventId) {
          await supabase
            .from('shared_events')
            .update({ status: leg.status, result_at: resultAtISO })
            .eq('id', leg.sharedEventId)
        }
      }

      const betResult = await supabase.from('bets').select('*').eq('id', betId).single()
      if (betResult.error) throw new Error(betResult.error.message)
      const bet = betResult.data

      const legsResult = await supabase.from('bet_legs').select('*').eq('bet_id', betId)
      if (legsResult.error) throw new Error(legsResult.error.message)
      const allLegs = legsResult.data as BetLeg[]

      const stillPending = allLegs.some(function (l) { return l.status === 'PENDING' })

      if (!stillPending) {
        const result = calculateBetResult(allLegs, Number(bet.odds_combined), Number(bet.stake))

        const betUpdate = await supabase
          .from('bets')
          .update({
            status: result.status,
            odds_combined: result.finalOdds,
            profit: result.profit,
            result_at: resultAtISO,
          })
          .eq('id', betId)

        if (betUpdate.error) throw new Error(betUpdate.error.message)
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

  return { registerResult, saving, error }
}