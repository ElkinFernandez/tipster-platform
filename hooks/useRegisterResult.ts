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
    legs: { id: string; status: string }[],
    allLegs: BetLeg[],
    originalOdds: number,
    stake: number,
    resultAt: string
  ) {
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()

      for (const leg of legs) {
        const updateResult = await supabase
          .from('bet_legs')
          .update({ status: leg.status })
          .eq('id', leg.id)

        if (updateResult.error) throw updateResult.error
      }

      const updatedLegs = allLegs.map(function (leg) {
        const match = legs.find(function (l) { return l.id === leg.id })
        if (match) {
          const copy = Object.assign({}, leg)
          copy.status = match.status as 'WIN' | 'LOSS' | 'VOID'
          return copy
        }
        return leg
      })

      const result = calculateBetResult(updatedLegs, originalOdds, stake)
      const resultAtISO = new Date(resultAt).toISOString()

      const betUpdate = await supabase
        .from('bets')
        .update({
          status: result.status,
          odds_combined: result.finalOdds,
          profit: result.profit,
          result_at: resultAtISO,
        })
        .eq('id', betId)

      if (betUpdate.error) throw betUpdate.error

      setSaving(false)
      return { success: true, result: result }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      setSaving(false)
      return { success: false, result: null }
    }
  }

  return { registerResult, saving, error }
}