'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useBetDetail } from '@/hooks/useBetDetail'
import { useRegisterResult, calculateBetResult } from '@/hooks/useRegisterResult'
import { useLegShareCounts } from '@/hooks/useLegShareCounts'
import { formatBetType, formatSport, getStatusVerb } from '@/lib/utils'

function formatUnits(value: number): string {
  const sign = value > 0 ? '+' : ''
  return sign + value.toFixed(2) + 'u'
}

function nowForInput(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const local = new Date(now.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

function isTournamentLevelMarket(marketName: string): boolean {
  const clean = (marketName || '').toLowerCase()
  return clean.indexOf('ganador del torneo') !== -1 || clean.indexOf('goleador del torneo') !== -1
}

function RegistrarContent() {
  const params = useParams()
  const router = useRouter()
  const betId = String(params.id)
  const { bet, legs, loading } = useBetDetail(betId)
  const { registerResult, saving, error } = useRegisterResult()

  const sharedIds = legs
    .filter(function (l) { return !!l.shared_event_id })
    .map(function (l) { return l.shared_event_id as string })

  const { counts, loading: loadingCounts } = useLegShareCounts(sharedIds)

  const [legStatuses, setLegStatuses] = useState<Record<string, string>>({})
  const [successMsg, setSuccessMsg] = useState(false)
  const [resultAt, setResultAt] = useState(nowForInput())

  useEffect(function () {
    if (legs.length > 0) {
      const initial: Record<string, string> = {}
      legs.forEach(function (leg) {
        initial[leg.id] = leg.status !== 'PENDING' ? leg.status : 'WIN'
      })
      setLegStatuses(initial)
    }
  }, [legs])

  function setStatus(legId: string, status: string) {
    const updated = Object.assign({}, legStatuses)
    updated[legId] = status
    setLegStatuses(updated)
  }

  function isLegLocked(leg: typeof legs[number]): boolean {
    if (!leg.shared_event_id) return false
    const count = counts[leg.shared_event_id] || 1
    return count > 1
  }

  const editableLegs = legs.filter(function (leg) { return !isLegLocked(leg) })
  const lockedLegs = legs.filter(function (leg) { return isLegLocked(leg) })

  function getPreview() {
    if (!bet || legs.length === 0) return null
    if (lockedLegs.length > 0) return null

    const previewLegs = legs.map(function (leg) {
      return Object.assign({}, leg, { status: legStatuses[leg.id] || 'WIN' })
    })
    return calculateBetResult(previewLegs, Number(bet.odds_combined), Number(bet.stake))
  }

  async function handleSubmit() {
    if (!bet) return
    setSuccessMsg(false)

    const legsPayload = editableLegs.map(function (leg) {
      return {
        id: leg.id,
        status: legStatuses[leg.id] || 'WIN',
        sharedEventId: leg.shared_event_id,
      }
    })

    const result = await registerResult(betId, legsPayload, resultAt)

    if (result.success) {
      setSuccessMsg(true)
      setTimeout(function () { router.push('/admin/apuestas') }, 1500)
    }
  }

  const preview = getPreview()
  const previewLabel = preview ? getStatusVerb(preview.status) : ''
  const inputClass = 'w-full rounded-xl border border-black/20 bg-white p-3 text-sm text-[#1F2937]'

  return (
    <div className="min-h-screen bg-[#F3F1EA]">
      <header className="sticky top-0 z-10 bg-[#F3F1EA]/95 backdrop-blur-sm border-b border-black/15">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center gap-3">
          <a href="/admin/apuestas" className="text-sm text-[#4B5563] font-medium">Volver</a>
          <span className="font-display font-bold text-[#1F2937] text-sm sm:text-base">Registrar resultado</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 sm:px-8 py-6 space-y-4">

        {(loading || loadingCounts) && <p className="text-sm text-[#4B5563]">Cargando...</p>}

        {successMsg && (
          <div className="rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30 p-4">
            <p className="text-sm text-[#0D9668] font-bold">Resultado guardado correctamente</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-[#FF7A8C]/15 border border-[#FF7A8C]/30 p-4">
            <p className="text-sm text-[#E23A52] font-bold">{error}</p>
          </div>
        )}

        {!loading && !loadingCounts && bet && (
          <div>
            <section className="rounded-3xl border border-black/15 bg-white p-5 mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-1">
                {formatBetType(bet.type)} - {legs.length} {legs.length === 1 ? 'evento' : 'eventos'}
              </p>
              <p className="text-sm font-semibold text-[#1F2937]">
                Cuota original {Number(bet.odds_combined).toFixed(2)} - Stake {Number(bet.stake).toFixed(1)}u
              </p>
            </section>

            {editableLegs.length > 0 && (
              <section className="rounded-3xl border border-black/15 bg-white p-5 mb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-2">Fecha y hora del resultado</p>
                <input type="datetime-local" value={resultAt} onChange={function (e) { setResultAt(e.target.value) }} className={inputClass} />
                <p className="text-xs text-[#4B5563] mt-2">Escribe la hora exacta que ves en tu propio reloj, sin convertir nada.</p>
              </section>
            )}

            {lockedLegs.length > 0 && (
              <div className="space-y-3 mb-4">
                {lockedLegs.map(function (leg) {
                  const sport = formatSport(leg.sport)
                  const isTournament = isTournamentLevelMarket(leg.market)
                  const count = leg.shared_event_id ? (counts[leg.shared_event_id] || 1) : 1
                  return (
                    <section key={leg.id} className="rounded-3xl border-2 border-[#3FA9B7]/30 bg-[#3FA9B7]/5 p-5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-[#3FA9B7] bg-[#3FA9B7]/15 rounded-full px-2.5 py-1">{sport} - {leg.league}</span>
                        <span className="text-[10px] font-bold text-[#3FA9B7]">{count} apuestas</span>
                      </div>
                      {isTournament && <p className="text-sm font-semibold text-[#1F2937] mt-2">{leg.league}</p>}
                      {!isTournament && <p className="text-sm font-semibold text-[#1F2937] mt-2">{leg.competitor_1} vs {leg.competitor_2}</p>}
                      <p className="text-xs text-[#4B5563] mt-1 mb-3">{leg.market}: {leg.selection} - Cuota {Number(leg.odds).toFixed(2)}</p>
                      <p className="text-xs text-[#4B5563]">Este evento esta en mas de una apuesta. Se resuelve desde <a href="/admin/eventos-pendientes" className="font-bold text-[#3FA9B7]">Eventos pendientes</a>.</p>
                    </section>
                  )
                })}
              </div>
            )}

            {editableLegs.length > 0 && (
              <div className="space-y-3 mb-4">
                {editableLegs.map(function (leg) {
                  const currentStatus = legStatuses[leg.id] || 'WIN'
                  const sport = formatSport(leg.sport)
                  const isTournament = isTournamentLevelMarket(leg.market)
                  return (
                    <section key={leg.id} className="rounded-3xl border border-black/15 bg-white p-5">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-[#3FA9B7] bg-[#3FA9B7]/15 rounded-full px-2.5 py-1">{sport} - {leg.league}</span>
                      {isTournament && <p className="text-sm font-semibold text-[#1F2937] mt-2 mb-1">{leg.league}</p>}
                      {!isTournament && <p className="text-sm font-semibold text-[#1F2937] mt-2 mb-1">{leg.competitor_1} vs {leg.competitor_2}</p>}
                      <p className="text-xs text-[#4B5563] mb-4">{leg.market}: {leg.selection} - Cuota {Number(leg.odds).toFixed(2)}</p>

                      <div className="grid grid-cols-3 gap-2">
                        <button onClick={function () { setStatus(leg.id, 'WIN') }} className={'rounded-xl py-2.5 text-xs font-bold border-2 ' + (currentStatus === 'WIN' ? 'bg-[#10B981] text-white border-[#10B981]' : 'bg-white text-[#1F2937] border-black/20')}>Gano</button>
                        <button onClick={function () { setStatus(leg.id, 'LOSS') }} className={'rounded-xl py-2.5 text-xs font-bold border-2 ' + (currentStatus === 'LOSS' ? 'bg-[#FF7A8C] text-white border-[#FF7A8C]' : 'bg-white text-[#1F2937] border-black/20')}>Perdio</button>
                        <button onClick={function () { setStatus(leg.id, 'VOID') }} className={'rounded-xl py-2.5 text-xs font-bold border-2 ' + (currentStatus === 'VOID' ? 'bg-[#9CA3AF] text-white border-[#9CA3AF]' : 'bg-white text-[#1F2937] border-black/20')}>Anulado</button>
                      </div>
                    </section>
                  )
                })}
              </div>
            )}

            {preview && (
              <section className="rounded-3xl p-6 mb-4" style={{ backgroundColor: '#1F2937' }}>
                <p className="text-xs uppercase tracking-wider text-white/50 mb-2">Resultado previsto</p>
                <p className="font-display text-3xl font-extrabold" style={{ color: preview.profit >= 0 ? '#10B981' : '#FF7A8C' }}>{previewLabel} {formatUnits(preview.profit)}</p>
                <p className="text-xs text-white/50 mt-2">Cuota final: {preview.finalOdds.toFixed(2)}</p>
              </section>
            )}

            {editableLegs.length > 0 && (
              <button onClick={handleSubmit} disabled={saving} className="w-full rounded-2xl bg-[#FFA94D] text-white font-bold text-sm py-4 disabled:opacity-40">
                {saving ? 'Guardando...' : 'Guardar resultado'}
              </button>
            )}
          </div>
        )}

      </main>
    </div>
  )
}

export default function RegistrarPage() {
  return (
    <ProtectedRoute>
      <RegistrarContent />
    </ProtectedRoute>
  )
}