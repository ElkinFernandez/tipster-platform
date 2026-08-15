'use client'

import { useState, useMemo } from 'react'
import { useBetsFullData, FullBet } from '@/hooks/useBetsFullData'
import { formatBetType, getStatusColor } from '@/lib/utils'

function formatUnits(value: number): string {
  const sign = value > 0 ? '+' : ''
  return sign + value.toFixed(2) + 'u'
}

function isTournamentLevelMarket(marketName: string): boolean {
  const clean = (marketName || '').toLowerCase()
  return clean.indexOf('ganador del torneo') !== -1 || clean.indexOf('goleador del torneo') !== -1
}

const dowShort = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB']
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function dayKey(d: Date) { return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate() }

function ResultCard(props: { bet: FullBet }) {
  const [expanded, setExpanded] = useState(false)
  const bet = props.bet
  const color = getStatusColor(bet.status)
  const legs = bet.bet_legs || []
  const first = legs[0]
  const rest = legs.slice(1)
  const isTournament = first ? isTournamentLevelMarket(first.market) : false

  return (
    <div className="rounded-r-2xl border-1.5 border-l-0 border-black/15 bg-white pl-4 pr-3.5 py-3 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: color }}></div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-display font-extrabold text-sm text-[#1F2937]">{formatBetType(bet.type)}</span>
        <span className="font-display font-extrabold text-[10.5px] text-white px-2.5 py-1 rounded-lg" style={{ backgroundColor: color }}>{formatUnits(Number(bet.profit))}</span>
      </div>
      {first && (
        <div>
          <p className="text-[13px] font-semibold text-[#1F2937]">{isTournament ? first.league : first.competitor_1 + ' vs ' + first.competitor_2}</p>
          <p className="text-[11px] text-[#4B5563]">{first.market}: {first.selection} &middot; Cuota {Number(first.odds).toFixed(2)}</p>
        </div>
      )}
      {rest.length > 0 && (
        <button onClick={function () { setExpanded(!expanded) }} className="mt-2 inline-block bg-[#1F2937] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
          {expanded ? 'Ocultar' : 'Mas eventos (' + rest.length + ')'}
        </button>
      )}
      {expanded && rest.length > 0 && (
        <div className="mt-2 pt-2 border-t border-dashed border-black/15 space-y-2">
          {rest.map(function (leg) {
            const t = isTournamentLevelMarket(leg.market)
            return (
              <div key={leg.id}>
                <p className="text-[13px] font-semibold text-[#1F2937]">{t ? leg.league : leg.competitor_1 + ' vs ' + leg.competitor_2}</p>
                <p className="text-[11px] text-[#4B5563]">{leg.market}: {leg.selection} &middot; Cuota {Number(leg.odds).toFixed(2)}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function ResultadosPage() {
  const { bets, loading } = useBetsFullData()
  const today = new Date()
  const [monthOffset, setMonthOffset] = useState(0)
  const [selectedDayKey, setSelectedDayKey] = useState(dayKey(today))

  const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()

  const profitByDay = useMemo(function () {
    const map: Record<string, number> = {}
    bets.forEach(function (b) {
      const k = dayKey(new Date(b.created_at))
      map[k] = (map[k] || 0) + Number(b.profit || 0)
    })
    return map
  }, [bets])

  const days = useMemo(function () {
    const list = []
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), i)
      const key = dayKey(d)
      list.push({ key: key, dow: dowShort[d.getDay()], num: i, profit: profitByDay[key] })
    }
    return list
  }, [viewDate, daysInMonth, profitByDay])

  const betsForDay = useMemo(function () {
    return bets.filter(function (b) { return dayKey(new Date(b.created_at)) === selectedDayKey })
  }, [bets, selectedDayKey])

  function changeMonth(delta: number) {
    setMonthOffset(monthOffset + delta)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F1EA]">
      <header className="bg-[#1F2937] text-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <a href="/" className="font-display font-bold tracking-wide text-sm sm:text-base">RAGUX</a>
          <span className="text-xs text-white/50">EST. 2025</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-5 sm:px-8 py-5">
        <h1 className="font-display text-xl font-extrabold text-[#1F2937] mb-3">Resultados</h1>

        <div className="flex items-center justify-between mb-3">
          <button onClick={function () { changeMonth(-1) }} className="text-[#4B5563] text-sm font-bold px-2">&larr;</button>
          <span className="text-sm font-extrabold text-[#1F2937]">{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
          <button onClick={function () { changeMonth(1) }} className="text-[#4B5563] text-sm font-bold px-2">&rarr;</button>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-3 mb-3 border-b border-black/10">
          {days.map(function (d) {
            const active = d.key === selectedDayKey
            const hasProfit = d.profit !== undefined
            return (
              <button key={d.key} onClick={function () { setSelectedDayKey(d.key) }} className={'shrink-0 text-center px-2.5 py-1.5 rounded-xl ' + (active ? 'bg-white border border-[#FF9933]/40' : '')}>
                <p className={'text-[9.5px] font-bold ' + (active ? 'text-[#FF9933]' : 'text-[#4B5563]')}>{d.dow}</p>
                <p className={'text-[11px] font-extrabold ' + (active ? 'text-[#FF9933]' : 'text-[#1F2937]')}>{d.num}</p>
                <p className="text-[8.5px] font-bold mt-0.5" style={{ color: hasProfit ? (d.profit! >= 0 ? '#17C971' : '#E23A52') : 'transparent' }}>{hasProfit ? formatUnits(d.profit!) : '-'}</p>
              </button>
            )
          })}
        </div>

        {loading && <p className="text-sm text-[#4B5563] mt-4">Cargando...</p>}

        {!loading && betsForDay.length === 0 && (
          <div className="rounded-3xl border-1.5 border-black/15 bg-white p-6 text-center mt-3">
            <p className="text-sm text-[#4B5563]">No hay pronosticos resueltos este dia.</p>
          </div>
        )}

        {!loading && betsForDay.length > 0 && (
          <div className="space-y-2.5 mt-3">
            {betsForDay.map(function (bet) { return <ResultCard key={bet.id} bet={bet} /> })}
          </div>
        )}
      </main>

      <nav className="sticky bottom-0 bg-[#F3F1EA]/95 backdrop-blur-sm border-t border-black/15">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-3 flex justify-between text-xs">
          <a href="/" className="text-[#4B5563]">Inicio</a>
          <span className="font-semibold text-[#1F2937]">Resultados</span>
          <a href="/estadisticas" className="text-[#4B5563]">Estadisticas</a>
          <a href="/como-funciona" className="text-[#4B5563]">Como funciona</a>
          <a href="/perfil" className="text-[#4B5563]">Perfil</a>
        </div>
      </nav>
    </div>
  )
}