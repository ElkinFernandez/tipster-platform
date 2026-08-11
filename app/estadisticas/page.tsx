'use client'

import { useFullStats } from '@/hooks/useFullStats'

function formatUnits(value: number): string {
  const sign = value > 0 ? '+' : ''
  return sign + value.toFixed(2) + 'u'
}

const sportLabel: Record<string, string> = {
  FOOTBALL: 'Futbol',
  TENNIS: 'Tenis',
  BASKETBALL: 'Basquet',
}

const typeLabel: Record<string, string> = {
  SINGLE: 'Simple',
  DOUBLE: 'Doble',
  TRIPLE: 'Triple',
  '4X': '4 Vias',
  '5X': '5 Vias',
  '6X': '6 Vias',
  '7X': '7 Vias',
  '8X': '8 Vias',
  '9X': '9 Vias',
  '10X': '10 Vias',
}

const timingLabel: Record<string, string> = {
  LIVE: 'En vivo',
  PRE_MATCH: 'Pre-partido',
}

const analysisLabel: Record<string, string> = {
  SOFTWARE: 'Software',
  MANUAL: 'Manual',
}

export default function EstadisticasPage() {
  const { general, bySport, byType, byTiming, byAnalysis, loading } = useFullStats()

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F1EA]">
      <header className="bg-[#1F2937] text-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <a href="/" className="font-display font-bold tracking-wide text-sm sm:text-base">TIPSTER PLATFORM</a>
          <span className="text-xs text-white/50">EST. 2025</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-5 sm:px-8 py-8">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1F2937] mb-8">Estadisticas</h1>

        {loading && <p className="text-sm text-[#4B5563]">Cargando...</p>}

        {!loading && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#FFA94D] mb-4">Rendimiento general</p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="rounded-2xl border border-black/15 bg-white p-4">
                <p className="font-display text-2xl font-extrabold text-[#1F2937]">{general.total_bets}</p>
                <p className="text-xs text-[#4B5563] mt-1">Pronosticos</p>
              </div>
              <div className="rounded-2xl border border-black/15 bg-white p-4">
                <p className="font-display text-2xl font-extrabold text-[#1F2937]">{general.average_odds}</p>
                <p className="text-xs text-[#4B5563] mt-1">Cuota media</p>
              </div>
              <div className="rounded-2xl border border-black/15 bg-white p-4">
                <p className="font-display text-2xl font-extrabold text-[#10B981]">{general.win_rate}%</p>
                <p className="text-xs text-[#4B5563] mt-1">Win Rate</p>
              </div>
              <div className="rounded-2xl border border-black/15 bg-white p-4">
                <p className="font-display text-2xl font-extrabold text-[#1F2937]">{general.roi}%</p>
                <p className="text-xs text-[#4B5563] mt-1">ROI</p>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden mb-10" style={{ backgroundColor: '#1F2937' }}>
              <div className="p-6 text-center">
                <p className="text-xs uppercase tracking-wider text-white/50 mb-2">Profit historico acumulado</p>
                <p className="font-display text-4xl font-extrabold text-[#FFA94D]">{formatUnits(general.total_profit)}</p>
              </div>
            </div>

            <p className="text-xs font-bold uppercase tracking-wider text-[#FFA94D] mb-4">Segmentacion</p>

            <h2 className="font-display text-lg font-bold text-[#1F2937] mb-4">Rendimiento por deporte</h2>
            {bySport.length === 0 && (
              <div className="rounded-2xl border border-black/15 bg-white p-6 text-center mb-10">
                <p className="text-sm text-[#4B5563]">Aun no hay datos suficientes.</p>
              </div>
            )}
            {bySport.length > 0 && (
              <div className="space-y-3 mb-10">
                {bySport.map(function (s) {
                  const label = sportLabel[s.sport] || s.sport
                  return (
                    <div key={s.sport} className="flex items-center justify-between rounded-2xl border border-black/15 bg-white p-4">
                      <div>
                        <p className="text-sm font-semibold text-[#1F2937]">{label}</p>
                        <p className="text-xs text-[#4B5563]">{s.count} pronosticos</p>
                      </div>
                      <span className="text-sm font-bold" style={{ color: s.profit >= 0 ? '#10B981' : '#FF7A8C' }}>{formatUnits(s.profit)}</span>
                    </div>
                  )
                })}
              </div>
            )}

            <h2 className="font-display text-lg font-bold text-[#1F2937] mb-4">Rendimiento por mercado</h2>
            {byType.length === 0 && (
              <div className="rounded-2xl border border-black/15 bg-white p-6 text-center mb-10">
                <p className="text-sm text-[#4B5563]">Aun no hay datos suficientes.</p>
              </div>
            )}
            {byType.length > 0 && (
              <div className="space-y-3 mb-10">
                {byType.map(function (t) {
                  const label = typeLabel[t.type] || t.type
                  return (
                    <div key={t.type} className="flex items-center justify-between rounded-2xl border border-black/15 bg-white p-4">
                      <div>
                        <p className="text-sm font-semibold text-[#1F2937]">{label}</p>
                        <p className="text-xs text-[#4B5563]">{t.count} pronosticos</p>
                      </div>
                      <span className="text-sm font-bold text-[#1F2937]">{t.win_rate}% WR</span>
                    </div>
                  )
                })}
              </div>
            )}

            <h2 className="font-display text-lg font-bold text-[#1F2937] mb-4">En vivo vs Pre-partido</h2>
            {byTiming.length === 0 && (
              <div className="rounded-2xl border border-black/15 bg-white p-6 text-center mb-10">
                <p className="text-sm text-[#4B5563]">Aun no hay datos suficientes.</p>
              </div>
            )}
            {byTiming.length > 0 && (
              <div className="space-y-3 mb-10">
                {byTiming.map(function (t) {
                  const label = timingLabel[t.timing] || t.timing
                  return (
                    <div key={t.timing} className="rounded-2xl border border-black/15 bg-white p-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-[#1F2937]">{label}</p>
                        <span className="text-sm font-bold text-[#1F2937]">{t.win_rate}% WR</span>
                      </div>
                      <p className="text-xs text-[#4B5563]">{t.count} pronosticos - {t.percentage}% del total</p>
                    </div>
                  )
                })}
              </div>
            )}

            <h2 className="font-display text-lg font-bold text-[#1F2937] mb-4">Software vs Manual</h2>
            {byAnalysis.length === 0 && (
              <div className="rounded-2xl border border-black/15 bg-white p-6 text-center">
                <p className="text-sm text-[#4B5563]">Aun no hay datos suficientes.</p>
              </div>
            )}
            {byAnalysis.length > 0 && (
              <div className="space-y-3">
                {byAnalysis.map(function (a) {
                  const label = analysisLabel[a.analysis] || a.analysis
                  return (
                    <div key={a.analysis} className="rounded-2xl border border-black/15 bg-white p-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-[#1F2937]">{label}</p>
                        <span className="text-sm font-bold" style={{ color: a.profit >= 0 ? '#10B981' : '#FF7A8C' }}>{formatUnits(a.profit)}</span>
                      </div>
                      <p className="text-xs text-[#4B5563]">{a.count} pronosticos - {a.percentage}% del total - {a.win_rate}% WR</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="sticky bottom-0 bg-[#F3F1EA]/95 backdrop-blur-sm border-t border-black/15">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-3 flex justify-between text-xs">
          <a href="/" className="text-[#4B5563]">Inicio</a>
          <a href="/resultados" className="text-[#4B5563]">Resultados</a>
          <span className="font-semibold text-[#1F2937]">Estadisticas</span>
          <a href="/perfil" className="text-[#4B5563]">Perfil</a>
        </div>
      </nav>
    </div>
  )
}