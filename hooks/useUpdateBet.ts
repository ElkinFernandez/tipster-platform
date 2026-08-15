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
  return 'Error desconocido al guardar'
}

export function useUpdateBet() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateBet = async function (
    betId: string,
    data: NewBetData,
    preserve: { keepResult: boolean; status: string; profit: number; resultAt: string | null; legStatuses: string[] }
  ) {
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

      const betUpdatePayload: Record<string, unknown> = {
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
      }

      if (preserve.keepResult) {
        betUpdatePayload.status = preserve.status
        betUpdatePayload.profit = preserve.profit
        betUpdatePayload.result_at = preserve.resultAt
      } else {
        betUpdatePayload.status = 'PENDING'
        betUpdatePayload.profit = 0
        betUpdatePayload.result_at = null
      }

      const betUpdate = await supabase.from('bets').update(betUpdatePayload).eq('id', betId)

      if (betUpdate.error) {
        console.error('Error actualizando bet:', betUpdate.error)
        throw new Error(getErrorMessage(betUpdate.error))
      }

      const deleteOld = await supabase.from('bet_legs').delete().eq('bet_id', betId)
      if (deleteOld.error) {
        console.error('Error borrando legs viejos:', deleteOld.error)
        throw new Error(getErrorMessage(deleteOld.error))
      }

      let i = 0
      for (const leg of data.legs as NewLeg[]) {
        const isFreeText = leg.market_selection_id === 'FREE_TEXT'
        const leagueClean = toTitleCase(leg.league)
        const comp1Clean = toTitleCase(leg.competitor_1)
        const comp2Clean = toTitleCase(leg.competitor_2)
        const selectionFinal = isFreeText ? toTitleCase(leg.selection_free_text) : leg.selection_name_text
        const oddsNum = parseFloat(leg.odds)

        let sharedEventId = leg.reused_event_id || null

        if (!sharedEventId) {
          const eventInsert = await supabase
            .from('shared_events')
            .insert({
              sport: leg.sport,
              league: leagueClean,
              competitor_1: comp1Clean,
              competitor_2: comp2Clean,
              sport_market_id: leg.sport_market_id || null,
              market_selection_id: isFreeText ? null : (leg.market_selection_id || null),
              market: leg.market_name_text,
              selection: selectionFinal,
              status: preserve.keepResult ? (preserve.legStatuses[i] || 'PENDING') : 'PENDING',
            })
            .select('id')
            .single()

          if (eventInsert.error) {
            console.error('Error creando shared_event:', eventInsert.error)
            throw new Error(getErrorMessage(eventInsert.error))
          }

          sharedEventId = eventInsert.data.id
        }

        const legStatus = preserve.keepResult ? (preserve.legStatuses[i] || 'PENDING') : 'PENDING'

        const legInsert = await supabase.from('bet_legs').insert({
          bet_id: betId,
          sport: leg.sport,
          league: leagueClean,
          competitor_1: comp1Clean,
          competitor_2: comp2Clean,
          sport_market_id: leg.sport_market_id || null,
          market_selection_id: isFreeText ? null : (leg.market_selection_id || null),
          market_custom: null,
          selection_custom: null,
          market: leg.market_name_text,
          selection: selectionFinal,
          odds: oddsNum,
          status: legStatus,
          created_at: createdAtISO,
          shared_event_id: sharedEventId,
        })

        if (legInsert.error) {
          console.error('Error insertando bet_leg nuevo:', legInsert.error)
          throw new Error(getErrorMessage(legInsert.error))
        }

        i = i + 1
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