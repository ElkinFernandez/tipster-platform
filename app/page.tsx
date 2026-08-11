'use client'

import { useTipster } from '@/hooks/useTipster'
import { useHomeStats } from '@/hooks/useStats'

function formatUnits(value: number): string {
  const sign = value > 0 ? '+' : ''
  return sign + value.toFixed(2) + 'u'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const statusColor: Record<string, string> = {
  WIN: '#10B981',
  PARTIAL_WIN: '#10B981',
  LOSS: '#FF7A8C',
  VOID: '#9CA3AF',
}

export default function HomePage() {
  const { tipster, loading: loadingTipster } = useTipster()
  const { stats, recentBets, loading: loadingStats } = useHomeStats()

  const displayName = tipster?.name || 'Tipster'
  const hasData = stats.total_bets > 0
  const telegramUrl = tipster?.telegram_url || '#'

  return (
    <div className="min-h-screen bg-[#F9F7F1]">
      <header className="bg-[#1F2937] text-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-full border border-white/20"></span>
            <span className="font-display font-bold tracking-wide text-sm sm:text-base">
              {loadingTipster ? '...' : displayName.toUpperCase()}
            </span>
          </div>
          <span className="text-xs text-white/50">EST. 2025</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 sm:px-8">
        <section className="pt-10 pb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#1F2937] leading-tight mb-3">
            Resultados que puedes comprobar.
          </h1>
          <p className="text-sm text-[#6B7280] leading-relaxed mb-8 max-w-md">
            Cada pronostico publicado, cada resultado registrado. Historial completo, sin capturas sueltas.
          </p>

          {loadingStats && (
            <div className="h-16 flex items-center">
              <span className="text-sm text-[#9CA3AF]">Cargando estadisticas...</span>
            </div>
          )}

          {!loadingStats && (
            <div>
              <p className="font-display text-5xl sm:text-6xl font-extrabold text-[#1F2937] leading-none mb-1">
                {formatUnits(stats.total_profit)}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-6">
                Profit historico acumulado
              </p>

              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8">
                <div>
                  <span className="font-display text-lg font-bold text-[#1F2937]">{stats.win_rate}%</span>
                  <span className="text-xs text-[#9CA3AF] ml-1.5">Win Rate</span>
                </div>
                <div>
                  <span className="font-display text-lg font-bold text-[#1F2937]">{stats.roi}%</span>
                  <span className="text-xs text-[#9CA3AF] ml-1.5">ROI</span>
                </div>
                <div>
                  <span className="font-display text-lg font-bold text-[#1F2937]">{stats.total_bets}</span>
                  <span className="text-xs text-[#9CA3AF] ml-1.5">Pronosticos</span>
                </div>
              </div>
            </div>
          )}

          {!hasData && !loadingStats && (
            <p className="text-xs text-[#9CA3AF] italic mb-6">
              Aun no hay pronosticos publicados. Vuelve pronto.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button className="rounded-2xl bg-[#FFA94D] text-white font-bold text-sm py-3 px-6">
              Ver estadisticas completas
            </button>
            <button className="rounded-2xl border border-black/15 text-[#1F2937] font-bold text-sm py-3 px-6">
              Ver ultimos pronosticos
            </button>
          </div>
        </section>

        <section className="py-10 border-t border-black/10">
          <p className="text-xs font-bold uppercase tracking-wider text-[#FFA94D] mb-1">Transparencia</p>
          <h2 className="font-display text-xl font-bold text-[#1F2937] mb-1">Como se registra cada dato</h2>
          <p className="text-sm text-[#9CA3AF] mb-6">Ningun resultado se anota despues de forma arbitraria.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="font-display text-2xl font-extrabold text-[#1F2937]">01</p>
              <p className="text-xs text-[#9CA3AF] uppercase tracking-wide mt-1">Publicacion</p>
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold text-[#1F2937]">02</p>
              <p className="text-xs text-[#9CA3AF] uppercase tracking-wide mt-1">Registro</p>
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold text-[#1F2937]">03</p>
              <p className="text-xs text-[#9CA3AF] uppercase tracking-wide mt-1">Resultado</p>
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold text-[#1F2937]">04</p>
              <p className="text-xs text-[#9CA3AF] uppercase tracking-wide mt-1">Estadistica</p>
            </div>
          </div>
        </section>

        <section className="py-10 border-t border-black/10">
          <p className="text-xs font-bold uppercase tracking-wider text-[#FFA94D] mb-1">Ultimos resultados</p>
          <h2 className="font-display text-xl font-bold text-[#1F2937] mb-6">Pronosticos recientes</h2>

          {loadingStats && <p className="text-sm text-[#9CA3AF]">Cargando...</p>}

          {!loadingStats && recentBets.length === 0 && (
            <div className="rounded-3xl border border-black/10 bg-white p-6 text-center">
              <p className="text-sm text-[#9CA3AF]">Todavia no hay pronosticos registrados.</p>
            </div>
          )}

          {!loadingStats && recentBets.length > 0 && (
            <div className="space-y-3">
              {recentBets.map(function (bet) {
                const color = statusColor[bet.status] || '#1F2937'
                return (
                  <div key={bet.id} className="rounded-2xl border border-black/10 bg-white p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#9CA3AF] mb-0.5">
                        {formatDate(bet.created_at)} - {bet.type}
                      </p>
                      <p className="text-sm font-semibold text-[#1F2937]">
                        Cuota {Number(bet.odds_combined).toFixed(2)} - Stake {Number(bet.stake).toFixed(1)}u
                      </p>
                    </div>
                    <span className="text-sm font-bold whitespace-nowrap ml-3" style={{ color: color }}>
                      {formatUnits(Number(bet.profit))}
                    </span>
                  </div>
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
          <a href={telegramUrl} className="inline-block rounded-2xl bg-[#FFA94D] text-white font-bold text-sm py-3 px-6">
            Unirme a Telegram
          </a>
        </div>
      </section>

      <nav className="sticky bottom-0 bg-[#F9F7F1]/95 backdrop-blur-sm border-t border-black/10">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-3 flex justify-between text-xs">
          <span className="font-semibold text-[#1F2937]">Inicio</span>
          <span className="text-[#9CA3AF]">Resultados</span>
          <span className="text-[#9CA3AF]">Estadisticas</span>
          <span className="text-[#9CA3AF]">Perfil</span>
        </div>
      </nav>
    </div>
  )
}