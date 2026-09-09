'use client'

import { useParams } from 'next/navigation'
import { useBetDetail } from '@/hooks/useBetDetail'
import { formatBetType, formatDateFull, getStatusColor, getStatusVerb, formatSport } from '@/lib/utils'
import { TelegramEmbed } from '@/components/TelegramEmbed'
import { BottomNav } from '@/components/BottomNav'

function formatUnits(value: number): string {
  const sign = value > 0 ? '+' : ''
  return sign + value.toFixed(2) + 'u'
}

function isTournamentLevelMarket(marketName: string): boolean {
  const clean = (marketName || '').toLowerCase()
  return clean.indexOf('ganador del torneo') !== -1 || clean.indexOf('goleador del torneo') !== -1
}

export default function DetalleApuestaPage() {
  const params = useParams()
  const betId = String(params.id)
  const { bet, legs, loading } = useBetDetail(betId)

  return (
    <div className="min-h-dvh bg-[#F3F1EA]">
      <header className="bg-[#1F2937] text-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center gap-3">
          <a href="/resultados" className="text-white/70 text-sm">&larr; Volver</a>
          <span className="font-display font-bold tracking-wide text-sm">Detalle</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 sm:px-8 py-6 pb-28">
        {loading && <p className="text-sm text-[#4B5563]">Cargando...</p>}

        {!loading && !bet && (
          <div className="rounded-3xl border-1.5 border-black/15 bg-white p-8 text-center">
            <p className="text-sm text-[#4B5563]">No se encontro este pronostico.</p>
          </div>
        )}

        {!loading && bet && (
          <div>
            <div className="rounded-r-3xl bg-[#1F2937] pl-5 pr-5 py-5 relative overflow-hidden mb-4">
              <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: getStatusColor(bet.status) }}></div>
              <p className="text-[11px] uppercase tracking-wide text-white/50 font-bold">{formatBetType(bet.type)} &middot; Cuota {Number(bet.odds_combined).toFixed(2)} &middot; Stake {Number(bet.stake).toFixed(1)}u</p>
              <p className="font-display text-2xl font-extrabold mt-2" style={{ color: getStatusColor(bet.status) }}>{getStatusVerb(bet.status)} {formatUnits(Number(bet.profit))}</p>
            </div>

            <div className="rounded-2xl border-1.5 border-black/15 bg-white p-4 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-[#4B5563]">Publicado</span>
                <span className="font-semibold text-[#1F2937]">{formatDateFull(bet.created_at)}</span>
              </div>
              {bet.result_at && (
                <div className="flex justify-between text-sm mt-2 pt-2 border-t border-black/10">
                  <span className="text-[#4B5563]">Resuelto</span>
                  <span className="font-semibold text-[#1F2937]">{formatDateFull(bet.result_at)}</span>
                </div>
              )}
            </div>

            <h2 className="font-display text-base font-bold text-[#1F2937] mb-3">{legs.length} {legs.length === 1 ? 'evento' : 'eventos'}</h2>

            <div className="space-y-2.5 mb-5">
              {legs.map(function (leg) {
                const color = getStatusColor(leg.status)
                const isTournament = isTournamentLevelMarket(leg.market)
                return (
                  <div key={leg.id} className="rounded-r-2xl border-1.5 border-l-0 border-black/15 bg-white pl-4 pr-3.5 py-3 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: color }}></div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9.5px] font-bold uppercase tracking-wide text-[#3FA9B7]">{formatSport(leg.sport)} &middot; {leg.league}</span>
                      <span className="text-[11px] font-bold" style={{ color: color }}>{getStatusVerb(leg.status)}</span>
                    </div>
                    <p className="text-[13px] font-semibold text-[#1F2937]">{isTournament ? leg.league : leg.competitor_1 + ' vs ' + leg.competitor_2}</p>
                    <p className="text-[11px] text-[#4B5563]">{leg.market}: {leg.selection} &middot; Cuota {Number(leg.odds).toFixed(2)}</p>
                  </div>
                )
              })}
            </div>

            {bet.explanation_url && (
              <a href={bet.explanation_url} target="_blank" rel="noopener noreferrer" className="block text-center rounded-2xl bg-[#FFA94D]/15 text-[#FF9933] font-bold text-sm py-3 mb-3">Explicacion de Apuesta</a>
            )}

            {bet.evidence_url && <TelegramEmbed url={bet.evidence_url} />}
          </div>
        )}
      </main>

      <BottomNav active="resultados" />
    </div>
  )
}