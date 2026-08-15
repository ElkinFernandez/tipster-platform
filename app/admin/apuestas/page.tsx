'use client'

import { useState } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAllBetsAdmin } from '@/hooks/useAllBetsAdmin'
import { useDeleteBet } from '@/hooks/useDeleteBet'
import { formatBetType, formatDate, getStatusAdj, getStatusColor } from '@/lib/utils'

function formatUnits(value: number): string {
  const sign = value > 0 ? '+' : ''
  return sign + value.toFixed(2) + 'u'
}

function isTournamentLevelMarket(marketName: string): boolean {
  const clean = (marketName || '').toLowerCase()
  return clean.indexOf('ganador del torneo') !== -1 || clean.indexOf('goleador del torneo') !== -1
}

function AllBetsContent() {
  const { bets, loading, refetch } = useAllBetsAdmin()
  const { deleteBet, deleting } = useDeleteBet()
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function handleDelete(betId: string) {
    const result = await deleteBet(betId)
    if (result.success) {
      setConfirmingId(null)
      refetch()
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F1EA]">
      <header className="sticky top-0 z-10 bg-[#F3F1EA]/95 backdrop-blur-sm border-b border-black/15">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center gap-3">
          <a href="/admin" className="text-sm text-[#4B5563] font-medium">Volver</a>
          <span className="font-display font-bold text-[#1F2937] text-sm sm:text-base">Todas las apuestas</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 sm:px-8 py-6">

        {loading && <p className="text-sm text-[#4B5563]">Cargando...</p>}

        {!loading && bets.length === 0 && (
          <div className="rounded-3xl border border-black/15 bg-white p-8 text-center">
            <p className="text-sm text-[#4B5563]">No hay apuestas registradas todavia.</p>
          </div>
        )}

        {!loading && bets.length > 0 && (
          <div className="space-y-3">
            {bets.map(function (bet) {
              const color = getStatusColor(bet.status)
              const label = getStatusAdj(bet.status)
              const isConfirming = confirmingId === bet.id
              const legs = bet.bet_legs || []
              const isSingle = legs.length <= 1
              const isExpanded = expandedId === bet.id

              return (
                <div key={bet.id} className="rounded-2xl border border-black/15 bg-white p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wide text-[#3FA9B7] bg-[#3FA9B7]/15 rounded-full px-2.5 py-1">{formatBetType(bet.type)}</span>
                      <p className="text-sm font-semibold text-[#1F2937] mt-2">{formatDate(bet.created_at)}</p>
                      <p className="text-xs text-[#4B5563]">Cuota {Number(bet.odds_combined).toFixed(2)} - Stake {Number(bet.stake).toFixed(1)}u</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold" style={{ color: color }}>{label}</p>
                      {bet.status !== 'PENDING' && (
                        <p className="text-sm font-bold" style={{ color: color }}>{formatUnits(Number(bet.profit))}</p>
                      )}
                    </div>
                  </div>

                  {isSingle && legs.length === 1 && (
                    <div className="rounded-xl bg-[#F3F1EA] p-3 mb-3">
                      {isTournamentLevelMarket(legs[0].market) ? (
                        <p className="text-xs font-semibold text-[#1F2937]">{legs[0].league}</p>
                      ) : (
                        <p className="text-xs font-semibold text-[#1F2937]">{legs[0].competitor_1} vs {legs[0].competitor_2}</p>
                      )}
                      <p className="text-[11px] text-[#4B5563] mt-0.5">{legs[0].market}: {legs[0].selection}</p>
                    </div>
                  )}

                  {!isSingle && (
                    <div className="mb-3">
                      <button
                        onClick={function () { setExpandedId(isExpanded ? null : bet.id) }}
                        className="w-full flex items-center justify-between rounded-xl bg-[#F3F1EA] p-3 text-left"
                      >
                        <span className="text-xs font-semibold text-[#1F2937]">{legs.length} eventos</span>
                        <span className="text-xs font-bold text-[#3FA9B7]">{isExpanded ? 'Ocultar' : 'Ver eventos'}</span>
                      </button>

                      {isExpanded && (
                        <div className="space-y-2 mt-2">
                          {legs.map(function (leg) {
                            return (
                              <div key={leg.id} className="rounded-xl border border-black/10 bg-white p-3">
                                {isTournamentLevelMarket(leg.market) ? (
                                  <p className="text-xs font-semibold text-[#1F2937]">{leg.league}</p>
                                ) : (
                                  <p className="text-xs font-semibold text-[#1F2937]">{leg.competitor_1} vs {leg.competitor_2}</p>
                                )}
                                <p className="text-[11px] text-[#4B5563] mt-0.5">{leg.market}: {leg.selection} - Cuota {Number(leg.odds).toFixed(2)}</p>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {!isConfirming && (
                    <div className="flex gap-2 pt-3 border-t border-black/10">
                      <a href={'/admin/editar/' + bet.id} className="flex-1 text-center rounded-xl border border-black/15 text-xs font-bold text-[#1F2937] py-2">Editar</a>
                      <a href={'/admin/registrar/' + bet.id} className="flex-1 text-center rounded-xl border border-black/15 text-xs font-bold text-[#1F2937] py-2">
                        {bet.status === 'PENDING' ? 'Registrar' : 'Corregir resultado'}
                      </a>
                      <button onClick={function () { setConfirmingId(bet.id) }} className="flex-1 rounded-xl border border-[#E23A52]/40 text-xs font-bold text-[#E23A52] py-2">Eliminar</button>
                    </div>
                  )}

                  {isConfirming && (
                    <div className="pt-3 border-t border-black/10">
                      <p className="text-xs text-[#4B5563] mb-3">Esta accion no se puede deshacer. Se borrara la apuesta y todos sus eventos.</p>
                      <div className="flex gap-2">
                        <button onClick={function () { setConfirmingId(null) }} className="flex-1 rounded-xl border border-black/15 text-xs font-bold text-[#1F2937] py-2">Cancelar</button>
                        <button onClick={function () { handleDelete(bet.id) }} disabled={deleting} className="flex-1 rounded-xl bg-[#E23A52] text-xs font-bold text-white py-2 disabled:opacity-50">{deleting ? 'Borrando...' : 'Si, eliminar'}</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </main>
    </div>
  )
}

export default function AllBetsPage() {
  return (
    <ProtectedRoute>
      <AllBetsContent />
    </ProtectedRoute>
  )
}