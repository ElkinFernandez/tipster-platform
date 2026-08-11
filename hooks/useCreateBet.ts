import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toTitleCase } from '@/lib/utils'

export interface NewLeg {
  sport: string
  league: string
  competitor_1: string
  competitor_2: string
  sport_market_id: string
  market_selection_id: string
  market_custom: string
  selection_custom: string
  selection_free_text: string
  market_name_text: string
  selection_name_text: string
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
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message)
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
        if (!isNaN(oddsNum)) combinedOdds = combinedOdds * oddsNum
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
        const isCustom = leg.sport_market_id === 'CUSTOM'
        const isFreeTextSelection = leg.market_selection_id === 'FREE_TEXT'

        const leagueClean = toTitleCase(leg.league)
        const comp1Clean = toTitleCase(leg.competitor_1)
        const comp2Clean = toTitleCase(leg.competitor_2)

        let marketFinal = leg.market_name_text
        let selectionFinal = leg.selection_name_text
        let sportMarketIdFinal: string | null = leg.sport_market_id
        let marketSelectionIdFinal: string | null = leg.market_selection_id
        let marketCustomFinal: string | null = null
        let selectionCustomFinal: string | null = null

        if (isCustom) {
          marketFinal = toTitleCase(leg.market_custom)
          selectionFinal = toTitleCase(leg.selection_custom)
          sportMarketIdFinal = null
          marketSelectionIdFinal = null
          marketCustomFinal = toTitleCase(leg.market_custom)
          selectionCustomFinal = toTitleCase(leg.selection_custom)
        } else if (isFreeTextSelection) {
          selectionFinal = toTitleCase(leg.selection_free_text)
          marketSelectionIdFinal = null
        } else {
          selectionFinal = toTitleCase(leg.selection_name_text)
        }

        return {
          bet_id: betId,
          sport: leg.sport,
          league: leagueClean,
          competitor_1: comp1Clean,
          competitor_2: comp2Clean,
          sport_market_id: sportMarketIdFinal,
          market_selection_id: marketSelectionIdFinal,
          market_custom: marketCustomFinal,
          selection_custom: selectionCustomFinal,
          market: marketFinal,
          selection: selectionFinal,
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