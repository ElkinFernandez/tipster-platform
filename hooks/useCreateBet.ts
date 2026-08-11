import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface NewLeg {
  sport: string
  league: string
  competitor_1: string
  competitor_2: string
  market: string
  selection: string
  odds: string
}

export interface NewBetData {
  type: string
  timing: string
  analysis_type: string
  stake: string
  notes: string
  legs: NewLeg[]
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message
  }
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message: unknown }).message)
  }
  return JSON.stringify(err)
}

export function useCreateBet() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createBet = async function (data: NewBetData, tipsterId: string) {
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()

      let combinedOdds = 1
      data.legs.forEach(function (leg) {
        const oddsNum = parseFloat(leg.odds)
        if (!isNaN(oddsNum)) {
          combinedOdds = combinedOdds * oddsNum
        }
      })

      const stakeNum = parseFloat(data.stake)

      const betInsert = await supabase
        .from('bets')
        .insert({
          tipster_id: tipsterId,
          type: data.type,
          timing: data.timing,
          analysis_type: data.analysis_type,
          total_legs: data.legs.length,
          odds_combined: combinedOdds,
          stake: stakeNum,
          profit: 0,
          status: 'PENDING',
          notes: data.notes || null,
        })
        .select()
        .single()

      if (betInsert.error) {
        console.error('Error insertando bet:', betInsert.error)
        throw new Error(getErrorMessage(betInsert.error))
      }

      const betId = betInsert.data.id

      const legsToInsert = data.legs.map(function (leg) {
        return {
          bet_id: betId,
          sport: leg.sport,
          league: leg.league,
          competitor_1: leg.competitor_1,
          competitor_2: leg.competitor_2,
          market: leg.market,
          selection: leg.selection,
          odds: parseFloat(leg.odds),
          status: 'PENDING',
        }
      })

      const legsInsert = await supabase.from('bet_legs').insert(legsToInsert)

      if (legsInsert.error) {
        console.error('Error insertando bet_legs:', legsInsert.error)
        throw new Error(getErrorMessage(legsInsert.error))
      }

      setSaving(false)
      return { success: true, betId: betId }
    } catch (err) {
      const message = getErrorMessage(err)
      console.error('Error completo:', err)
      setError(message)
      setSaving(false)
      return { success: false, betId: null }
    }
  }

  return { createBet, saving, error }
}