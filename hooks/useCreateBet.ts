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
  reused_event_id: string
}

export interface NewBetData {
  type: string
  timing: string
  analysis_type: string
  stake: string
  explanation_url: string
  evidence_url: string
  legs: NewLeg[]
  created_at: string
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as { message: unknown }).message
    if (msg) return String(msg)
  }
  return 'Error desconocido al guardar'
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
      const createdAtISO = new Date(data.created_at).toISOString()

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
          explanation_url: data.explanation_url || null,
          evidence_url: data.evidence_url || null,
          created_at: createdAtISO,
          published_at: createdAtISO,
        })
        .select()
        .single()

      if (betInsert.error) {
        console.error('Error insertando bet:', betInsert.error)
        throw new Error(getErrorMessage(betInsert.error))
      }

      const betId = betInsert.data.id

      for (const leg of data.legs) {
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
              status: 'PENDING',
            })
            .select('id')
            .single()

          if (eventInsert.error) {
            console.error('Error creando shared_event:', eventInsert.error)
            throw new Error(getErrorMessage(eventInsert.error))
          }

          sharedEventId = eventInsert.data.id
        }

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
          status: 'PENDING',
          created_at: createdAtISO,
          shared_event_id: sharedEventId,
        })

        if (legInsert.error) {
          console.error('Error insertando bet_leg:', legInsert.error)
          throw new Error(getErrorMessage(legInsert.error))
        }
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