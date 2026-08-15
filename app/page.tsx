'use client'

import { useState, useMemo } from 'react'
import { useTipster } from '@/hooks/useTipster'
import { useBetsFullData } from '@/hooks/useBetsFullData'
import { usePublicPendingBets } from '@/hooks/usePublicPendingBets'
import { useInView } from '@/hooks/useInView'
import { formatBetType, getStatusColor, formatDate } from '@/lib/utils'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts'

function formatUnits(value: number): string {
  const sign = value > 0 ? '+' : ''
  return sign + value.toFixed(2) + 'u'
}

const monthShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

interface TooltipProps {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}

function CustomTooltip(props: TooltipProps) {
  if (props.active && props.payload && props.payload.length > 0) {
    const value = props.payload[0].value
    const color = value >= 0 ? '#17C971' : '#E23A52'
    return (
      <div className="rounded-xl bg-[#1F2937] px-3 py-2 shadow-lg">
        <p className="text-[10px] text-white/50 mb-0.5">{props.label}</p>
        <p className="text-sm font-bold" style={{ color: color }}>{formatUnits(value)}</p>
      </div>
    )
  }
  return null
}

const sportOptions = [
  { key: 'ALL', label: 'Todo' },
  { key: 'TENNIS', label: 'Tenis' },
  { key: 'FOOTBALL', label: 'Futbol' },
  { key: 'BASKETBALL', label: 'Basquet' },
]

export default function HomePage() {
  const { tipster, loading: loadingTipster } = useTipster()
  const { bets, loading: loadingBets } = useBetsFullData()
  const { bets: pendingBets, loading: loadingPending } = usePublicPendingBets()
  const { ref: chartRef, inView: chartInView } = useInView()
  const [sportFilter, setSportFilter] = useState('TENNIS')

  const displayName = tipster?.name || 'Ragux'
  const telegramUrl = tipster?.telegram_url || '#'
  const hasPending = !loadingPending && pendingBets.length > 0

  const filteredBets = useMemo(function () {
    if (sportFilter === 'ALL') return bets
    return bets.filter(function (b) {
      return (b.bet_legs || []).some(function (l) { return l.sport === sportFilter })
    })
  }, [bets, sportFilter])

  const stats = useMemo(function () {
    const total = filteredBets.length
    const won = filteredBets.filter(function (b) { return b.status === 'WIN' || b.status === 'PARTIAL_WIN' }).length
    const winRate = total > 0 ? (won / total) * 100 : 0
    const totalProfit = filteredBets.reduce(function (s, b) { return s + Number(b.profit || 0) }, 0)
    const totalStake = filteredBets.reduce(function (s, b) { return s + Number(b.stake || 0) }, 0)
    const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0
    const avgOdds = total > 0 ? filteredBets.reduce(function (s, b) { return s + Number(b.odds_combined || 0) }, 0) / total : 0
    return {
      total_bets: total,
      win_rate: Math.round(winRate * 10) / 10,
      roi: Math.round(roi * 10) / 10,
      total_profit: Math.round(totalProfit * 100) / 100,
      average_odds: Math.round(avgOdds * 1000) / 1000,
    }
  }, [filteredBets])

  const chartPoints = useMemo(function () {
    const sorted = filteredBets.slice().sort(function (a, b) {
      const da = a.result_at ? new Date(a.result_at).getTime() : new Date(a.created_at).getTime()
      const db = b.result_at ? new Date(b.result_at).getTime() : new Date(b.created_at).getTime()
      return da - db
    })
    let running = 0
    return sorted.map(function (b, i) {
      running += Number(b.profit || 0)
      const d = new Date(b.result_at || b.created_at)
      return {
        shortLabel: d.getDate() + ' ' + monthShort[d.getMonth()] + ' #' + (i + 1),
        dateLabel: d.getDate() + ' ' + monthShort[d.getMonth()],
        profit: Math.round(running * 100) / 100,
      }
    })
  }, [filteredBets])

  const peak = useMemo(function () {
    if (chartPoints.length === 0) return null
    let best = chartPoints[0]
    chartPoints.forEach(function (p) { if (p.profit > best.profit) best = p })
    return best
  }, [chartPoints])

  const chartColor = stats.total_profit >= 0 ? '#17C971' : '#E23A52'

  const recentBets = useMemo(function () {
    return bets.slice().sort(function (a, b) { return new Date(b.created_at).getTime() - new Date(a.created_at).getTime() }).slice(0, 5)
  }, [bets])

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F1EA]">
      <header className="bg-[#1F2937] text-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-full border border-white/20 bg-cover bg-center" style={{ backgroundImage: 'url(/avatar-ragux.png)' }}></span>
            <span className="font-display font-bold tracking-wide text-sm sm:text-base">{loadingTipster ? '...' : displayName.toUpperCase()}</span>
          </div>
          <span className="text-xs text-white/50">EST. 2025</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-5 sm:px-8">
        <section className="pt-8 pb-6">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#1F2937] leading-tight mb-3">Resultados que puedes comprobar.</h1>
          <p className="text-sm text-[#4B5563] leading-relaxed mb-5 max-w-md">Cada pronostico publicado, cada resultado registrado. Historial completo, sin capturas sueltas.</p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {sportOptions.map(function (s) {
              const active = sportFilter === s.key
              return (
                <button key={s.key} onClick={function () { setSportFilter(s.key) }} className={'rounded-full text-xs font-bold px-3.5 py-1.5 border-2 ' + (active ? 'bg-[#3FA9B7] text-white border-[#3FA9B7]' : 'bg-white text-[#1F2937] border-[#3FA9B7]/40')}>{s.label}</button>
              )
            })}
          </div>

          <div className="rounded-3xl border-1.5 border-black/15 bg-white p-5">
            {loadingBets && <p className="text-sm text-[#4B5563]">Cargando...</p>}
            {!loadingBets && (
              <div>
                <div className="flex items-start justify-between mb-3.5">
                  <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#4B5563]">Profit historico</p>
                  <span className="text-[10.5px] font-bold text-[#FF9933] bg-[#FFA94D]/15 px-2.5 py-1 rounded-full">{stats.roi}% ROI</span>
                </div>
                <p className="font-display text-[42px] font-extrabold leading-none mb-3.5" style={{ color: stats.total_profit >= 0 ? '#17C971' : '#E23A52' }}>{formatUnits(stats.total_profit)}</p>
                <div className="flex justify-between border-t border-black/10 pt-3.5">
                  <div><p className="font-display text-base font-extrabold text-[#1F2937]">{stats.win_rate}%</p><p className="text-[10px] text-[#4B5563] font-semibold">Win Rate</p></div>
                  <div><p className="font-display text-base font-extrabold text-[#1F2937]">{stats.total_bets}</p><p className="text-[10px] text-[#4B5563] font-semibold">Pronosticos</p></div>
                  <div><p className="font-display text-base font-extrabold text-[#1F2937]">{stats.average_odds}</p><p className="text-[10px] text-[#4B5563] font-semibold">Cuota media</p></div>
                </div>
              </div>
            )}
          </div>

          {!loadingBets && stats.total_bets === 0 && (
            <p className="text-xs text-[#4B5563] italic mt-3">Aun no hay pronosticos en este deporte.</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <a href="/estadisticas" className="rounded-2xl bg-[#FFA94D] text-white font-bold text-sm py-3 px-6 text-center hover:bg-[#FF9933] transition">Ver estadisticas</a>
            <a href="/resultados" className="rounded-2xl border-2 border-black/15 text-[#1F2937] font-bold text-sm py-3 px-6 text-center hover:bg-white transition">Ver resultados</a>
          </div>
        </section>

        <section className="py-6 border-t border-black/10">
          <p className="text-xs font-bold uppercase tracking-wider text-[#FF9933] mb-1">Pronosticos en juego</p>
          <h2 className="font-display text-base font-bold text-[#1F2937] mb-3">
            {loadingPending ? 'Cargando...' : (hasPending ? pendingBets.length + ' esperando resultado' : 'No hay pronosticos en juego')}
          </h2>
          {!loadingPending && !hasPending && (
            <a href={telegramUrl} className="rounded-2xl bg-[#FFA94D] text-white font-bold text-sm py-2.5 px-6 text-center block hover:bg-[#FF9933] transition">Unirme a Telegram</a>
          )}
          {hasPending && (
            <div className="space-y-2.5">
              {pendingBets.map(function (bet) {
                const hasLink = bet.evidence_url
                const content = (
                  <div className="rounded-r-2xl border-1.5 border-l-0 border-black/15 bg-white pl-4 pr-3.5 py-3 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#3FA9B7]"></div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-display font-extrabold text-sm text-[#1F2937]">{formatBetType(bet.type)}</span>
                      {hasLink && <span className="font-display font-extrabold text-[10.5px] text-white bg-[#FFA94D] px-2.5 py-1 rounded-lg">Ver &rarr;</span>}
                    </div>
                    <p className="text-[11px] text-[#4B5563]">Cuota {Number(bet.odds_combined).toFixed(2)}</p>
                  </div>
                )
                if (hasLink) return <a key={bet.id} href={bet.evidence_url as string} target="_blank" rel="noopener noreferrer" className="block">{content}</a>
                return <div key={bet.id}>{content}</div>
              })}
            </div>
          )}
        </section>

        <section className="py-6 border-t border-black/10" ref={chartRef}>
          <p className="text-xs font-bold uppercase tracking-wider text-[#FF9933] mb-1">Performance</p>
          <h2 className="font-display text-base font-bold text-[#1F2937] mb-3">Evolucion acumulada</h2>

          {!loadingBets && chartPoints.length > 1 && (
            <div className="rounded-3xl border-1.5 border-black/15 bg-white p-4" style={{ width: '100%', height: 250 }}>
              {chartInView && (
                <ResponsiveContainer>
                  <AreaChart data={chartPoints} margin={{ top: 24, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartColor} stopOpacity={0.28} />
                        <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#1F2937" strokeOpacity={0.06} />
                    <XAxis dataKey="shortLabel" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={38} tickFormatter={function (v) { return v + 'u' }} />
                    <Tooltip content={CustomTooltip} />
                    <Area type="monotone" dataKey="profit" stroke={chartColor} strokeWidth={3} fill="url(#profitFill)" dot={false} activeDot={{ r: 5, fill: chartColor, strokeWidth: 2, stroke: '#fff' }} isAnimationActive={true} animationDuration={1300} animationEasing="ease-out" />
                    {peak && (
                      <ReferenceDot x={peak.shortLabel} y={peak.profit} r={4.5} fill={chartColor} stroke="#fff" strokeWidth={2} label={{ value: 'Max ' + formatUnits(peak.profit) + ' \u00B7 ' + peak.dateLabel, position: 'top', fill: '#1F2937', fontSize: 9.5, fontWeight: 700 }} />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {!loadingBets && chartPoints.length <= 1 && (
            <div className="rounded-3xl border-1.5 border-black/15 bg-white p-6 text-center">
              <p className="text-sm text-[#4B5563]">Necesitas al menos 2 pronosticos en este deporte para ver la evolucion.</p>
            </div>
          )}
        </section>

        <section className="py-6 border-t border-black/10">
          <p className="text-xs font-bold uppercase tracking-wider text-[#FF9933] mb-1">Ultimos resultados</p>
          <h2 className="font-display text-base font-bold text-[#1F2937] mb-3">Pronosticos recientes</h2>
          {loadingBets && <p className="text-sm text-[#4B5563]">Cargando...</p>}
          {!loadingBets && recentBets.length === 0 && (
            <div className="rounded-3xl border-1.5 border-black/15 bg-white p-6 text-center"><p className="text-sm text-[#4B5563]">Todavia no hay pronosticos registrados.</p></div>
          )}
          {!loadingBets && recentBets.length > 0 && (
            <div className="space-y-2.5">
              {recentBets.map(function (bet) {
                const color = getStatusColor(bet.status)
                return (
                  <a key={bet.id} href={'/resultados/' + bet.id} className="block rounded-r-2xl border-1.5 border-l-0 border-black/15 bg-white pl-4 pr-3.5 py-3 relative overflow-hidden hover:bg-[#F3F1EA] transition">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: color }}></div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-display font-extrabold text-sm text-[#1F2937]">{formatBetType(bet.type)}</span>
                      <span className="font-display font-extrabold text-[10.5px] text-white px-2.5 py-1 rounded-lg" style={{ backgroundColor: color }}>{formatUnits(Number(bet.profit))}</span>
                    </div>
                    <p className="text-[11px] text-[#4B5563]">{formatDate(bet.created_at)} &middot; Cuota {Number(bet.odds_combined).toFixed(2)}</p>
                  </a>
                )
              })}
            </div>
          )}
        </section>
      </main>

      <section className="bg-[#1F2937] text-white mt-2">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-8">
          <h3 className="font-display text-lg font-bold mb-2">Los pronosticos se publican primero en Telegram.</h3>
          <p className="text-sm text-white/60 mb-5 max-w-md">Unete a la comunidad y recibe cada aviso antes que nadie.</p>
          <a href={telegramUrl} className="inline-block rounded-2xl bg-[#FFA94D] text-white font-bold text-sm py-3 px-6 hover:bg-[#FF9933] transition">Unirme a Telegram</a>
        </div>
      </section>

      <nav className="sticky bottom-0 bg-[#F3F1EA]/95 backdrop-blur-sm border-t border-black/15">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-3 flex justify-between text-xs">
          <span className="font-semibold text-[#1F2937]">Inicio</span>
          <a href="/resultados" className="text-[#4B5563]">Resultados</a>
          <a href="/estadisticas" className="text-[#4B5563]">Estadisticas</a>
          <a href="/como-funciona" className="text-[#4B5563]">Como funciona</a>
          <a href="/perfil" className="text-[#4B5563]">Perfil</a>
        </div>
      </nav>
    </div>
  )
}