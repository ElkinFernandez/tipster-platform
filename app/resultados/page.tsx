'use client'

import { useState } from 'react'
import { useAllBets, SportFilter } from '@/hooks/useAllBets'

function formatUnits(value: number): string {
  const sign = value > 0 ? '+' : ''
  return sign + value.toFixed(2) + 'u'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

const statusColor: Record<string, string> = {
  WIN: '#10B981',
  PARTIAL_WIN: '#10B981',
  LOSS: '#FF7A8C',
  VOID: '#9CA3AF',
}

const sportFilters: { key: SportFilter; label: string }[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'FOOTBALL', label: 'Futbol' },
  { key: 'TENNIS', label: 'Tenis' },
  { key: 'BASKETBALL', label: 'Basquet' },
]

export default function ResultadosPage() {
  const [sportFilter, setSportFilter] = useState<SportFilter>('ALL')
  const { bets, loading } = useAllBets(sportFilter)

  return (
    <div className="min-h-screen bg-[#F9F7F1]">
      <header className="bg-[#1F2937] text-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <a href="/" className="font-display font-bold tracking-wide text-sm sm:text-base">TIPSTER PLATFORM</a>
          <span className="text-xs text-white/50">EST. 2025</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 sm:px-8 py-8">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1F2937] mb-6">Resultados</h1>

        <div className="flex flex-wrap gap-2 mb-8">
          {sportFilters.map(function (f) {
            const isActive = sportFilter === f.key
            const activeClass = isActive ? 'bg-[#1F2937] text-white' : 'bg-white text-[#1F2937] border border-black/10'
            function handleClick() {
              setSportFilter(f.key)
            }
            return (
              <button key={f.key} onClick={handleClick} className={'rounded-full text-xs font-semibold px-4 py-2 transition ' + activeClass}>{f.label}</button>
            )
          })}
        </div>

        {loading && <p className="text-sm text-[#9CA3AF]">Cargando...</p>}

        {!loading && bets.length === 0 && (
          <div className="rounded-3xl border border-black/10 bg-white p-8 text-center">
            <p className="text-sm text-[#9CA3AF]">No hay pronosticos registrados con este filtro.</p>
          </div>
        )}

        {!loading && bets.length > 0 && (
          <div className="divide-y divide-black/10 border-t border-b border-black/10">
            {bets.map(function (bet) {
              const color = statusColor[bet.status] || '#1F2937'
              const detailUrl = '/resultados/' + bet.id
              const oddsText = 'Cuota ' + Number(bet.odds_combined).toFixed(2) + ' - Stake ' + Number(bet.stake).toFixed(1) + 'u'
              const profitText = formatUnits(Number(bet.profit))
              return (
                <a key={bet.id} href={detailUrl} className="flex items-center justify-between py-4 hover:bg-white/60 transition -mx-2 px-2 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[#3FA9B7] bg-[#3FA9B7]/10 rounded-full px-2.5 py-1">{bet.type}</span>
                    <div>
                      <p className="text-sm font-semibold text-[#1F2937]">{formatDate(bet.created_at)}</p>
                      <p className="text-xs text-[#9CA3AF]">{oddsText}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold whitespace-nowrap" style={{ color: color }}>{profitText}</span>
                </a>
              )
            })}
          </div>
        )}
      </main>

      <nav className="sticky bottom-0 bg-[#F9F7F1]/95 backdrop-blur-sm border-t border-black/10">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-3 flex justify-between text-xs">
          <a href="/" className="text-[#9CA3AF]">Inicio</a>
          <span className="font-semibold text-[#1F2937]">Resultados</span>
          <a href="/estadisticas" className="text-[#9CA3AF]">Estadisticas</a>
          <a href="/perfil" className="text-[#9CA3AF]">Perfil</a>
        </div>
      </nav>
    </div>
  )
}