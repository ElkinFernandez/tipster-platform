'use client'

import { useTipster } from '@/hooks/useTipster'
import { useHomeStats } from '@/hooks/useStats'
import { useProfitEvolution } from '@/hooks/useProfitEvolution'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function formatUnits(value: number): string {
  const sign = value > 0 ? '+' : ''
  return sign + value.toFixed(2) + 'u'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const statusColor: Record<string, string> = {
  WIN: '#10B981',
  PARTIAL_WIN: '#10B981',
  LOSS: '#FF7A8C',
  VOID: '#9CA3AF',
}

interface TooltipProps {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}

function CustomTooltip(props: TooltipProps) {
  if (props.active && props.payload && props.payload.length > 0) {
    const value = props.payload[0].value
    const color = value >= 0 ? '#10B981' : '#FF7A8C'
    return (
      <div className="rounded-xl bg-[#1F2937] px-3 py-2 shadow-lg">
        <p className="text-[10px] text-white/50 mb-0.5">{props.label}</p>
        <p className="text-sm font-bold" style={{ color: color }}>{formatUnits(value)}</p>
      </div>
    )
  }
  return null
}

export default function HomePage() {
  const { tipster, loading: loadingTipster } = useTipster()
  const { stats, recentBets, loading: loadingStats } = useHomeStats()
  const { points, loading: loadingChart } = useProfitEvolution()

  const displayName = tipster?.name || 'Tipster'
  const hasData = stats.total_bets > 0
  const telegramUrl = tipster?.telegram_url || '#'
  const chartColor = stats.total_profit >= 0 ? '#10B981' : '#FF7A8C'

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F1EA]">
      <header className="bg-[#1F2937] text-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-full border border-white/20"></span>
            <span className="font-display font-bold tracking-wide text-sm sm:text-base">{loadingTipster ? '...' : displayName.toUpperCase()}</span>
          </div>
          <span className="text-xs text-white/50">EST. 2025</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-5 sm:px-8">
        <section className="pt-10 pb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#1F2937] leading-tight mb-3">Resultados que puedes comprobar.</h1>
          <p className="text-sm text-[#4B5563] leading-relaxed mb-8 max-w-md">Cada pronostico publicado, cada resultado registrado. Historial completo, sin capturas sueltas.</p>

          {loadingStats && (
            <div className="h-16 flex items-center">
              <span className="text-sm text-[#4B5563]">Cargando estadisticas...</span>
            </div>
          )}

          {!loadingStats && (
            <div>
              <p className="font-display text-5xl sm:text-6xl font-extrabold text-[#1F2937] leading-none mb-1">{formatUnits(stats.total_profit)}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#4B5563] mb-6">Profit historico acumulado</p>

              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8">
                <div>
                  <span className="font-display text-lg font-bold text-[#1F2937]">{stats.win_rate}%</span>
                  <span className="text-xs text-[#4B5563] ml-1.5">Win Rate</span>
                </div>
                <div>
                  <span className="font-display text-lg font-bold text-[#1F2937]">{stats.roi}%</span>
                  <span className="text-xs text-[#4B5563] ml-1.5">ROI</span>
                </div>
                <div>
                  <span className="font-display text-lg font-bold text-[#1F2937]">{stats.total_bets}</span>
                  <span className="text-xs text-[#4B5563] ml-1.5">Pronosticos</span>
                </div>
              </div>
            </div>
          )}

          {!hasData && !loadingStats && (
            <p className="text-xs text-[#4B5563] italic mb-6">Aun no hay pronosticos publicados. Vuelve pronto.</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <a href="/estadisticas" className="rounded-2xl bg-[#FFA94D] text-white font-bold text-sm py-3 px-6 text-center hover:bg-[#FF9933] transition">Ver estadisticas completas</a>
            <a href="/resultados" className="rounded-2xl border border-black/20 text-[#1F2937] font-bold text-sm py-3 px-6 text-center hover:bg-white transition">Ver ultimos pronosticos</a>
          </div>
        </section>

        {hasData && (
          <section className="py-10 border-t border-black/10">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[#FFA94D]">Performance</p>
              <span className="text-xs font-bold" style={{ color: chartColor }}>{formatUnits(stats.total_profit)}</span>
            </div>
            <h2 className="font-display text-xl font-bold text-[#1F2937] mb-6">Evolucion acumulada</h2>

            {loadingChart && <p className="text-sm text-[#4B5563]">Cargando grafico...</p>}

            {!loadingChart && points.length > 1 && (
              <div className="rounded-3xl border border-black/15 bg-white p-4" style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <AreaChart data={points} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartColor} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#1F2937" strokeOpacity={0.08} />
                    <XAxis dataKey="shortLabel" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={40} tickFormatter={function (v) { return v + 'u' }} />
                    <Tooltip content={CustomTooltip} />
                    <Area type="monotone" dataKey="profit" stroke={chartColor} strokeWidth={2.5} fill="url(#profitFill)" dot={false} activeDot={{ r: 5, fill: chartColor, strokeWidth: 2, stroke: '#fff' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {!loadingChart && points.length <= 1 && (
              <div className="rounded-3xl border border-black/15 bg-white p-6 text-center">
                <p className="text-sm text-[#4B5563]">Necesitas al menos 2 pronosticos con resultado para ver la evolucion.</p>
              </div>
            )}
          </section>
        )}

        <section className="py-10 border-t border-black/10">
          <p className="text-xs font-bold uppercase tracking-wider text-[#FFA94D] mb-1">Transparencia</p>
          <h2 className="font-display text-xl font-bold text-[#1F2937] mb-1">Como se registra cada dato</h2>
          <p className="text-sm text-[#4B5563] mb-6">Ningun resultado se anota despues de forma arbitraria.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="font-display text-2xl font-extrabold text-[#1F2937]">01</p>
              <p className="text-xs text-[#4B5563] uppercase tracking-wide mt-1">Publicacion</p>
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold text-[#1F2937]">02</p>
              <p className="text-xs text-[#4B5563] uppercase tracking-wide mt-1">Registro</p>
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold text-[#1F2937]">03</p>
              <p className="text-xs text-[#4B5563] uppercase tracking-wide mt-1">Resultado</p>
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold text-[#1F2937]">04</p>
              <p className="text-xs text-[#4B5563] uppercase tracking-wide mt-1">Estadistica</p>
            </div>
          </div>
        </section>

        <section className="py-10 border-t border-black/10">
          <p className="text-xs font-bold uppercase tracking-wider text-[#FFA94D] mb-1">Ultimos resultados</p>
          <h2 className="font-display text-xl font-bold text-[#1F2937] mb-6">Pronosticos recientes</h2>

          {loadingStats && <p className="text-sm text-[#4B5563]">Cargando...</p>}

          {!loadingStats && recentBets.length === 0 && (
            <div className="rounded-3xl border border-black/15 bg-white p-6 text-center">
              <p className="text-sm text-[#4B5563]">Todavia no hay pronosticos registrados.</p>
            </div>
          )}

          {!loadingStats && recentBets.length > 0 && (
            <div className="space-y-3">
              {recentBets.map(function (bet) {
                const color = statusColor[bet.status] || '#1F2937'
                return (
                  <a key={bet.id} href={'/resultados/' + bet.id} className="rounded-2xl border border-black/15 bg-white p-4 flex items-center justify-between block hover:bg-[#F3F1EA] transition">
                    <div>
                      <p className="text-xs text-[#4B5563] mb-0.5">{formatDate(bet.created_at)} - {bet.type}</p>
                      <p className="text-sm font-semibold text-[#1F2937]">Cuota {Number(bet.odds_combined).toFixed(2)} - Stake {Number(bet.stake).toFixed(1)}u</p>
                    </div>
                    <span className="text-sm font-bold whitespace-nowrap ml-3" style={{ color: color }}>{formatUnits(Number(bet.profit))}</span>
                  </a>
                )
              })}
            </div>
          )}
        </section>
      </main>

      <section className="bg-[#1F2937] text-white mt-4">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10">
          <h3 className="font-display text-xl font-bold mb-2">Los pronosticos se publican primero en Telegram.</h3>
          <p className="text-sm text-white/60 mb-6 max-w-md">Unete a la comunidad y recibe cada aviso antes que nadie.</p>
          <a href={telegramUrl} className="inline-block rounded-2xl bg-[#FFA94D] text-white font-bold text-sm py-3 px-6 hover:bg-[#FF9933] transition">Unirme a Telegram</a>
        </div>
      </section>

      <nav className="sticky bottom-0 bg-[#F3F1EA]/95 backdrop-blur-sm border-t border-black/15">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-3 flex justify-between text-xs">
          <span className="font-semibold text-[#1F2937]">Inicio</span>
          <a href="/resultados" className="text-[#4B5563]">Resultados</a>
          <a href="/estadisticas" className="text-[#4B5563]">Estadisticas</a>
          <a href="/perfil" className="text-[#4B5563]">Perfil</a>
        </div>
      </nav>
    </div>
  )
}