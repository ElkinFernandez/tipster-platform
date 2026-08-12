import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toTitleCase } from '@/lib/utils'
import { NewLeg, NewBetData } from '@/hooks/useCreateBet'

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as { message: unknown }).message
    if (msg) return String(msg)
  }
  try {
    const json = JSON.stringify(err)
    if (json && json !== '{}') return json
  } catch (e) {
    // ignore
  }
  return 'Error desconocido al guardar'
}

export function useUpdateBet() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateBet = async function (betId: string, data: NewBetData) {
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
      const createdAtISO = new Date(data.created_at).toISOString()

      const betUpdate = await supabase
        .from('bets')
        .update({
          type: data.type,
          timing: data.timing,
          analysis_type: data.analysis_type,
          total_legs: data.legs.length,
          odds_combined: combinedOdds,
          stake: stakeNum,
          explanation_url: data.explanation_url || null,
          evidence_url: data.evidence_url || null,
          created_at: createdAtISO,
          published_at: createdAtISO,
        })
        .eq('id', betId)

      if (betUpdate.error) {
        console.error('Error actualizando bet:', betUpdate.error)
        throw new Error(getErrorMessage(betUpdate.error))
      }

      const deleteOld = await supabase.from('bet_legs').delete().eq('bet_id', betId)
      if (deleteOld.error) {
        console.error('Error borrando legs viejos:', deleteOld.error)
        throw new Error(getErrorMessage(deleteOld.error))
      }

      const legsToInsert = data.legs.map(function (leg: NewLeg) {
        const isFreeText = leg.market_selection_id === 'FREE_TEXT'

        const leagueClean = toTitleCase(leg.league)
        const comp1Clean = toTitleCase(leg.competitor_1)
        const comp2Clean = toTitleCase(leg.competitor_2)

        const selectionFinal = isFreeText ? toTitleCase(leg.selection_free_text) : leg.selection_name_text

        const marketIdValid = leg.sport_market_id && leg.sport_market_id !== 'CUSTOM' ? leg.sport_market_id : null
        const selectionIdValid = leg.market_selection_id && leg.market_selection_id !== 'FREE_TEXT' ? leg.market_selection_id : null

        return {
          bet_id: betId,
          sport: leg.sport,
          league: leagueClean,
          competitor_1: comp1Clean,
          competitor_2: comp2Clean,
          sport_market_id: marketIdValid,
          market_selection_id: selectionIdValid,
          market_custom: null,
          selection_custom: null,
          market: leg.market_name_text,
          selection: selectionFinal,
          odds: parseFloat(leg.odds),
          status: 'PENDING',
          created_at: createdAtISO,
        }
      })

      const legsInsert = await supabase.from('bet_legs').insert(legsToInsert)

      if (legsInsert.error) {
        console.error('Error insertando bet_legs nuevos:', legsInsert.error)
        throw new Error(getErrorMessage(legsInsert.error))
      }

      setSaving(false)
      return { success: true }
    } catch (err) {
      const message = getErrorMessage(err)
      console.error('Error completo:', err)
      setError(message)
      setSaving(false)
      return { success: false }
    }
  }

  return { updateBet, saving, error }
}