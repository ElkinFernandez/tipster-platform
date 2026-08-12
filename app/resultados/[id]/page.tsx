'use client'

import { useParams } from 'next/navigation'
import { useBetDetail } from '@/hooks/useBetDetail'
import { formatBetType, formatDateFull, getStatusColor, getStatusVerb, formatSport } from '@/lib/utils'
import { TelegramEmbed } from '@/components/TelegramEmbed'

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
    <div className="min-h-screen bg-[#F3F1EA]">
      <header className="bg-[#1F2937] text-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center gap-3">
          <a href="/resultados" className="text-white/70 text-sm">Volver</a>
          <span className="font-display font-bold tracking-wide text-sm sm:text-base">Detalle del pronostico</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 sm:px-8 py-8">
        {loading && <p className="text-sm text-[#4B5563]">Cargando...</p>}

        {!loading && !bet && (
          <div className="rounded-3xl border border-black/15 bg-white p-8 text-center">
            <p className="text-sm text-[#4B5563]">No se encontro este pronostico.</p>
          </div>
        )}

        {!loading && bet && (
          <div>
            <div className="rounded-3xl overflow-hidden border border-black/15 mb-6">
              <div className="p-6" style={{ backgroundColor: '#1F2937' }}>
                <p className="text-xs uppercase tracking-wider text-white/50 mb-2">
                  {formatBetType(bet.type)} - Cuota {Number(bet.odds_combined).toFixed(2)} - Stake {Number(bet.stake).toFixed(1)}u
                </p>
                <p className="font-display text-3xl sm:text-4xl font-extrabold" style={{ color: getStatusColor(bet.status) }}>
                  {getStatusVerb(bet.status)} {formatUnits(Number(bet.profit))}
                </p>
              </div>
            </div>

            <h2 className="font-display text-lg font-bold text-[#1F2937] mb-4">Cuando paso</h2>

            <div className="space-y-3 mb-8 text-sm">
              <div className="flex justify-between border-b border-black/10 pb-2">
                <span className="text-[#4B5563]">Publicado</span>
                <span className="text-[#1F2937] font-medium">{formatDateFull(bet.created_at)}</span>
              </div>
              {bet.result_at && (
                <div className="flex justify-between border-b border-black/10 pb-2">
                  <span className="text-[#4B5563]">Resultado registrado</span>
                  <span className="text-[#1F2937] font-medium">{formatDateFull(bet.result_at)}</span>
                </div>
              )}
            </div>

            <h2 className="font-display text-lg font-bold text-[#1F2937] mb-4">Eventos</h2>

            <div className="space-y-3 mb-8">
              {legs.map(function (leg) {
                const color = getStatusColor(leg.status)
                const label = getStatusVerb(leg.status)
                const sport = formatSport(leg.sport)
                const isTournament = isTournamentLevelMarket(leg.market)
                return (
                  <div key={leg.id} className="rounded-2xl border border-black/15 bg-white p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-[#3FA9B7] bg-[#3FA9B7]/15 rounded-full px-2.5 py-1">{sport} - {leg.league}</span>
                      <span className="text-xs font-bold" style={{ color: color }}>{label}</span>
                    </div>
                    {isTournament && (
                      <p className="text-sm font-semibold text-[#1F2937] mb-1">{leg.league}</p>
                    )}
                    {!isTournament && (
                      <p className="text-sm font-semibold text-[#1F2937] mb-1">{leg.competitor_1} vs {leg.competitor_2}</p>
                    )}
                    <p className="text-xs text-[#4B5563]">{leg.market}: {leg.selection} - Cuota {Number(leg.odds).toFixed(2)}</p>
                  </div>
                )
              })}
            </div>

            {bet.explanation_url && (
              <a href={bet.explanation_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 rounded-full border border-[#FFA94D]/40 bg-[#FFA94D]/10 px-3 py-2.5 text-xs font-bold text-[#FFA94D] hover:bg-[#FFA94D]/20 transition mb-4">Explicacion de Apuesta</a>
            )}

            {bet.evidence_url && (
              <TelegramEmbed url={bet.evidence_url} />
            )}
          </div>
        )}
      </main>

      <nav className="sticky bottom-0 bg-[#F3F1EA]/95 backdrop-blur-sm border-t border-black/15">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-3 flex justify-between text-xs">
          <a href="/" className="text-[#4B5563]">Inicio</a>
          <a href="/resultados" className="text-[#4B5563]">Resultados</a>
          <a href="/estadisticas" className="text-[#4B5563]">Estadisticas</a>
          <a href="/perfil" className="text-[#4B5563]">Perfil</a>
        </div>
      </nav>
    </div>
  )
}