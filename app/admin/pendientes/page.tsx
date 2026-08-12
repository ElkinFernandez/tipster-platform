'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { usePendingBets } from '@/hooks/usePendingBets'
import { formatBetType, formatDate } from '@/lib/utils'

function isTournamentLevelMarket(marketName: string): boolean {
  const clean = (marketName || '').toLowerCase()
  return clean.indexOf('ganador del torneo') !== -1 || clean.indexOf('goleador del torneo') !== -1
}

function PendientesContent() {
  const { bets, loading } = usePendingBets()

  return (
    <div className="min-h-screen bg-[#F3F1EA]">
      <header className="sticky top-0 z-10 bg-[#F3F1EA]/95 backdrop-blur-sm border-b border-black/15">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center gap-3">
          <a href="/admin" className="text-sm text-[#4B5563] font-medium">Volver</a>
          <span className="font-display font-bold text-[#1F2937] text-sm sm:text-base">Apuestas pendientes</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 sm:px-8 py-6">

        {loading && <p className="text-sm text-[#4B5563]">Cargando...</p>}

        {!loading && bets.length === 0 && (
          <div className="rounded-3xl border border-black/15 bg-white p-8 text-center">
            <p className="text-sm text-[#4B5563]">No hay apuestas pendientes de resultado.</p>
          </div>
        )}

        {!loading && bets.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-[#4B5563] mb-4">{bets.length} apuestas esperando resultado</p>
            <div className="space-y-3">
              {bets.map(function (bet) {
                const legs = bet.bet_legs || []
                return (
                  <div key={bet.id} className="rounded-2xl border border-black/15 bg-white p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-[#3FA9B7] bg-[#3FA9B7]/15 rounded-full px-2.5 py-1">{formatBetType(bet.type)}</span>
                    </div>

                    <div className="space-y-1.5 mb-3">
                      {legs.map(function (leg) {
                        const isTournament = isTournamentLevelMarket(leg.market)
                        if (isTournament) {
                          return (
                            <p key={leg.id} className="text-sm font-semibold text-[#1F2937]">
                              {leg.league}
                              <span className="text-xs font-normal text-[#4B5563]"> - {leg.market}: {leg.selection}</span>
                            </p>
                          )
                        }
                        return (
                          <p key={leg.id} className="text-sm font-semibold text-[#1F2937]">
                            {leg.competitor_1} vs {leg.competitor_2}
                            <span className="text-xs font-normal text-[#4B5563]"> - {leg.market}: {leg.selection}</span>
                          </p>
                        )
                      })}
                    </div>

                    <p className="text-xs text-[#4B5563] mb-3">{formatDate(bet.created_at)} - Cuota {Number(bet.odds_combined).toFixed(2)} - Stake {Number(bet.stake).toFixed(1)}u</p>

                    <div className="flex gap-2 pt-3 border-t border-black/10">
                      <a href={'/admin/editar/' + bet.id} className="flex-1 text-center rounded-xl border border-black/15 text-xs font-bold text-[#1F2937] py-2">Editar</a>
                      <a href={'/admin/registrar/' + bet.id} className="flex-1 text-center rounded-xl bg-[#FFA94D] text-xs font-bold text-white py-2">Registrar</a>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default function PendientesPage() {
  return (
    <ProtectedRoute>
      <PendientesContent />
    </ProtectedRoute>
  )
}