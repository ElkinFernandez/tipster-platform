'use client'

import { useState } from 'react'
import { useEstadisticasStats, Period } from '@/hooks/useEstadisticasStats'
import { formatBetType, formatSport } from '@/lib/utils'
import { InfoTooltip } from '@/components/InfoTooltip'

function formatUnits(value: number): string {
  const sign = value > 0 ? '+' : ''
  return sign + value.toFixed(2) + 'u'
}

const timingLabel: Record<string, string> = {
  LIVE: 'En vivo',
  PRE_MATCH: 'Pre-partido',
}

const analysisLabel: Record<string, string> = {
  SOFTWARE: 'Software',
  MANUAL: 'Manual',
}

const periodOptions: { key: Period; label: string }[] = [
  { key: 'TODAY', label: 'Hoy' },
  { key: 'YESTERDAY', label: 'Ayer' },
  { key: '7D', label: '7 dias' },
  { key: '30D', label: '30 dias' },
  { key: '60D', label: '60 dias' },
  { key: 'ALL', label: 'Todo' },
]

export default function EstadisticasPage() {
  const [period, setPeriod] = useState<Period>('ALL')
  const { general, bySport, byType, byTiming, byAnalysis, loading } = useEstadisticasStats(period)

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F1EA]">
      <header className="bg-[#1F2937] text-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <a href="/" className="font-display font-bold tracking-wide text-sm sm:text-base">TIPSTER PLATFORM</a>
          <span className="text-xs text-white/50">EST. 2025</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-5 sm:px-8 py-8">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1F2937] mb-6">Estadisticas</h1>

        <div className="flex flex-wrap gap-1.5 mb-6">
          {periodOptions.map(function (p) {
            const active = period === p.key
            const cls = active ? 'bg-[#1F2937] text-white' : 'bg-white text-[#1F2937] border border-black/20'
            return (
              <button key={p.key} onClick={function () { setPeriod(p.key) }} className={'rounded-full text-xs font-semibold px-3 py-1.5 ' + cls}>{p.label}</button>
            )
          })}
        </div>

        {loading && <p className="text-sm text-[#4B5563] mb-8">Cargando...</p>}

        {!loading && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#FFA94D] mb-4">Rendimiento</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-2xl border border-black/15 bg-white p-4">
                <p className="font-display text-2xl font-extrabold text-[#1F2937]">{general.total_bets}</p>
                <p className="text-xs text-[#4B5563] mt-1">Pronosticos</p>
              </div>
              <div className="rounded-2xl border border-black/15 bg-white p-4">
                <p className="font-display text-2xl font-extrabold text-[#10B981]">{general.win_rate}%</p>
                <p className="text-xs text-[#4B5563] mt-1 flex items-center">Win Rate <InfoTooltip text="Porcentaje de pronosticos ganados o parcialmente ganados sobre el total." /></p>
              </div>
              <div className="rounded-2xl border border-black/15 bg-white p-4">
                <p className="font-display text-2xl font-extrabold text-[#1F2937]">{general.roi}%</p>
                <p className="text-xs text-[#4B5563] mt-1 flex items-center">ROI <InfoTooltip text="Cuanto se gana en promedio por cada unidad apostada. Un ROI de 20% significa 0.20u de ganancia por cada 1u apostada." /></p>
              </div>
              <div className="rounded-2xl border border-black/15 bg-white p-4">
                <p className="font-display text-2xl font-extrabold" style={{ color: general.total_profit >= 0 ? '#10B981' : '#FF7A8C' }}>{formatUnits(general.total_profit)}</p>
                <p className="text-xs text-[#4B5563] mt-1">Profit</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-10">
              <div className="rounded-2xl border border-black/15 bg-white p-4">
                <p className="font-display text-xl font-extrabold text-[#FF7A8C]">{general.max_drawdown > 0 ? '-' + general.max_drawdown.toFixed(2) + 'u' : '0.00u'}</p>
                <p className="text-xs text-[#4B5563] mt-1 flex items-center">Max. drawdown <InfoTooltip text="La peor racha de perdidas acumuladas, medida desde el punto mas alto hasta el mas bajo. Indica el riesgo real de seguir al tipster." /></p>
              </div>
              <div className="rounded-2xl border border-black/15 bg-white p-4">
                <p className="font-display text-xl font-extrabold text-[#1F2937]">{general.profit_factor !== null ? general.profit_factor.toFixed(2) : '-'}</p>
                <p className="text-xs text-[#4B5563] mt-1 flex items-center">Profit factor <InfoTooltip text="Cuanto se gana por cada unidad que se pierde. Mayor a 1 significa que las ganancias superan a las perdidas." /></p>
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
                  const label = formatSport(s.sport)
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
                  const label = formatBetType(t.type)
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