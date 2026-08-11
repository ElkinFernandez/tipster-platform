'use client'

import { useState } from 'react'
import { useAllBets, SportFilter, StatusFilter, TypeFilter } from '@/hooks/useAllBets'

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

const sportOptions = [
  { value: 'ALL', label: 'Todos' },
  { value: 'FOOTBALL', label: 'Futbol' },
  { value: 'TENNIS', label: 'Tenis' },
  { value: 'BASKETBALL', label: 'Basquet' },
]

const statusOptions = [
  { value: 'ALL', label: 'Todos' },
  { value: 'WIN', label: 'Ganadas' },
  { value: 'LOSS', label: 'Perdidas' },
  { value: 'PARTIAL_WIN', label: 'Parciales' },
  { value: 'VOID', label: 'Anuladas' },
]

const typeOptions = [
  { value: 'ALL', label: 'Todos' },
  { value: 'SINGLE', label: 'Simple' },
  { value: 'DOUBLE', label: 'Doble' },
  { value: 'TRIPLE', label: 'Triple' },
  { value: '4X', label: '4X' },
  { value: '5X', label: '5X' },
  { value: '6X', label: '6X' },
]

export default function ResultadosPage() {
  const [sportFilter, setSportFilter] = useState<SportFilter>('ALL')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL')
  const { bets, loading } = useAllBets(sportFilter, statusFilter, typeFilter)

  const selectClass = 'w-full rounded-xl border border-black/20 bg-white px-3 py-2.5 text-xs font-semibold text-[#1F2937]'
  const labelClass = 'text-[10px] font-bold uppercase tracking-wider text-[#4B5563] mb-1.5 block'

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F1EA]">
      <header className="bg-[#1F2937] text-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <a href="/" className="font-display font-bold tracking-wide text-sm sm:text-base">TIPSTER PLATFORM</a>
          <span className="text-xs text-white/50">EST. 2025</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-5 sm:px-8 py-8">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1F2937] mb-4">Resultados</h1>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <div>
            <label className={labelClass}>Deporte</label>
            <select value={sportFilter} onChange={function (e) { setSportFilter(e.target.value as SportFilter) }} className={selectClass}>
              {sportOptions.map(function (o) { return <option key={o.value} value={o.value}>{o.label}</option> })}
            </select>
          </div>
          <div>
            <label className={labelClass}>Resultado</label>
            <select value={statusFilter} onChange={function (e) { setStatusFilter(e.target.value as StatusFilter) }} className={selectClass}>
              {statusOptions.map(function (o) { return <option key={o.value} value={o.value}>{o.label}</option> })}
            </select>
          </div>
          <div>
            <label className={labelClass}>Tipo</label>
            <select value={typeFilter} onChange={function (e) { setTypeFilter(e.target.value as TypeFilter) }} className={selectClass}>
              {typeOptions.map(function (o) { return <option key={o.value} value={o.value}>{o.label}</option> })}
            </select>
          </div>
        </div>

        {loading && <p className="text-sm text-[#4B5563]">Cargando...</p>}

        {!loading && bets.length === 0 && (
          <div className="rounded-3xl border border-black/15 bg-white p-8 text-center">
            <p className="text-sm text-[#4B5563]">No hay pronosticos registrados con estos filtros.</p>
          </div>
        )}

        {!loading && bets.length > 0 && (
          <div className="divide-y divide-black/10 border-t border-black/10">
            {bets.map(function (bet) {
              const color = statusColor[bet.status] || '#1F2937'
              const detailUrl = '/resultados/' + bet.id
              const oddsText = 'Cuota ' + Number(bet.odds_combined).toFixed(2) + ' - Stake ' + Number(bet.stake).toFixed(1) + 'u'
              const profitText = formatUnits(Number(bet.profit))
              return (
                <a key={bet.id} href={detailUrl} className="flex items-center justify-between py-4 hover:bg-white/60 transition -mx-2 px-2 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[#3FA9B7] bg-[#3FA9B7]/15 rounded-full px-2.5 py-1">{bet.type}</span>
                    <div>
                      <p className="text-sm font-semibold text-[#1F2937]">{formatDate(bet.created_at)}</p>
                      <p className="text-xs text-[#4B5563]">{oddsText}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold whitespace-nowrap" style={{ color: color }}>{profitText}</span>
                </a>
              )
            })}
          </div>
        )}
      </main>

      <nav className="sticky bottom-0 bg-[#F3F1EA]/95 backdrop-blur-sm border-t border-black/15">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-3 flex justify-between text-xs">
          <a href="/" className="text-[#4B5563]">Inicio</a>
          <span className="font-semibold text-[#1F2937]">Resultados</span>
          <a href="/estadisticas" className="text-[#4B5563]">Estadisticas</a>
          <a href="/perfil" className="text-[#4B5563]">Perfil</a>
        </div>
      </nav>
    </div>
  )
}