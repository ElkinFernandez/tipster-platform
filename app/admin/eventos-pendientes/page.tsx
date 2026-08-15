'use client'

import { useState } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { usePendingSharedEvents } from '@/hooks/usePendingSharedEvents'
import { useResolveSharedEvent } from '@/hooks/useResolveSharedEvent'
import { formatSport } from '@/lib/utils'

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

function EventosPendientesContent() {
  const { events, loading } = usePendingSharedEvents()
  const { resolveEvent, saving, error } = useResolveSharedEvent()
  const [resultAt, setResultAt] = useState(nowForInput())
  const [resolvedId, setResolvedId] = useState<string | null>(null)

  async function handleResolve(eventId: string, status: string) {
    const result = await resolveEvent(eventId, status, resultAt)
    if (result.success) {
      setResolvedId(eventId)
      setTimeout(function () { window.location.reload() }, 1200)
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F1EA]">
      <header className="sticky top-0 z-10 bg-[#F3F1EA]/95 backdrop-blur-sm border-b border-black/15">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center gap-3">
          <a href="/admin" className="text-sm text-[#4B5563] font-medium">Volver</a>
          <span className="font-display font-bold text-[#1F2937] text-sm sm:text-base">Eventos pendientes</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 sm:px-8 py-6">

        <div className="rounded-2xl border border-black/15 bg-white p-4 mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-2">Fecha y hora del resultado</p>
          <input type="datetime-local" value={resultAt} onChange={function (e) { setResultAt(e.target.value) }} className="w-full rounded-xl border border-black/20 bg-white p-3 text-sm text-[#1F2937]" />
          <p className="text-xs text-[#4B5563] mt-2">Se aplicara a cualquier evento que resuelvas aqui. Escribe la hora tal como la ves en tu propio reloj.</p>
        </div>

        {loading && <p className="text-sm text-[#4B5563]">Cargando...</p>}

        {!loading && events.length === 0 && (
          <div className="rounded-3xl border border-black/15 bg-white p-8 text-center">
            <p className="text-sm text-[#4B5563]">No hay eventos compartidos pendientes.</p>
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="space-y-3">
            {events.map(function (ev) {
              const isTournament = isTournamentLevelMarket(ev.market)
              return (
                <div key={ev.id} className="rounded-2xl border border-black/15 bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[#3FA9B7] bg-[#3FA9B7]/15 rounded-full px-2.5 py-1">{formatSport(ev.sport)} - {ev.league}</span>
                    <span className="text-[10px] font-bold text-[#4B5563]">{ev.bet_count} {ev.bet_count === 1 ? 'apuesta' : 'apuestas'}</span>
                  </div>
                  {isTournament && <p className="text-sm font-semibold text-[#1F2937] mb-1">{ev.league}</p>}
                  {!isTournament && <p className="text-sm font-semibold text-[#1F2937] mb-1">{ev.competitor_1} vs {ev.competitor_2}</p>}
                  <p className="text-xs text-[#4B5563] mb-4">{ev.market}: {ev.selection}</p>

                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={function () { handleResolve(ev.id, 'WIN') }} disabled={saving} className="rounded-xl py-2.5 text-xs font-bold border-2 border-black/20 text-[#1F2937] hover:bg-[#10B981] hover:text-white hover:border-[#10B981] transition disabled:opacity-40">Gano</button>
                    <button onClick={function () { handleResolve(ev.id, 'LOSS') }} disabled={saving} className="rounded-xl py-2.5 text-xs font-bold border-2 border-black/20 text-[#1F2937] hover:bg-[#FF7A8C] hover:text-white hover:border-[#FF7A8C] transition disabled:opacity-40">Perdio</button>
                    <button onClick={function () { handleResolve(ev.id, 'VOID') }} disabled={saving} className="rounded-xl py-2.5 text-xs font-bold border-2 border-black/20 text-[#1F2937] hover:bg-[#9CA3AF] hover:text-white hover:border-[#9CA3AF] transition disabled:opacity-40">Anulado</button>
                  </div>

                  {resolvedId === ev.id && (
                    <p className="text-xs text-[#0D9668] font-bold mt-3">Evento resuelto, actualizando apuestas...</p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-[#FF7A8C]/15 border border-[#FF7A8C]/30 p-4 mt-4">
            <p className="text-sm text-[#E23A52] font-bold">{error}</p>
          </div>
        )}

      </main>
    </div>
  )
}

export default function EventosPendientesPage() {
  return (
    <ProtectedRoute>
      <EventosPendientesContent />
    </ProtectedRoute>
  )
}