'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useBetsFullData, FullBet } from '@/hooks/useBetsFullData'
import { formatBetType, getStatusColor } from '@/lib/utils'
import { BottomNav } from '@/components/BottomNav'

function formatUnits(value: number): string {
  const sign = value > 0 ? '+' : ''
  return sign + value.toFixed(2) + 'u'
}

function isTournamentLevelMarket(marketName: string): boolean {
  const clean = (marketName || '').toLowerCase()
  return clean.indexOf('ganador del torneo') !== -1 || clean.indexOf('goleador del torneo') !== -1
}

const dowShort = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB']
const monthShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function dayKey(d: Date) { return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate() }
function monthKey(y: number, m: number) { return y + '-' + m }
function truncate(d: Date) { const c = new Date(d); c.setHours(0, 0, 0, 0); return c }
function resultDate(b: FullBet) { return new Date(b.result_at as string) }

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
  const { bets: allBets, loading } = useBetsFullData()
  const today = truncate(new Date())

  const bets = useMemo(function () {
    return allBets.filter(function (b) { return !!b.result_at })
  }, [allBets])

  const minDate = useMemo(function () {
    if (bets.length === 0) return null
    const sorted = bets.slice().sort(function (a, b) { return resultDate(a).getTime() - resultDate(b).getTime() })
    return truncate(resultDate(sorted[0]))
  }, [bets])

  const profitByDay = useMemo(function () {
    const map: Record<string, number> = {}
    bets.forEach(function (b) {
      const k = dayKey(resultDate(b))
      map[k] = (map[k] || 0) + Number(b.profit || 0)
    })
    return map
  }, [bets])

  const availableMonths = useMemo(function () {
    if (!minDate) return []
    const list = []
    let y = minDate.getFullYear()
    let m = minDate.getMonth()
    while (y < today.getFullYear() || (y === today.getFullYear() && m <= today.getMonth())) {
      list.push({ key: monthKey(y, m), year: y, month: m, label: monthShort[m] + ' ' + y })
      m += 1
      if (m > 11) { m = 0; y += 1 }
    }
    return list
  }, [minDate, today])

  const availableYears = useMemo(function () {
    const set = new Set<number>()
    availableMonths.forEach(function (mo) { set.add(mo.year) })
    return Array.from(set).sort(function (a, b) { return a - b })
  }, [availableMonths])

  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const activeYear = selectedYear !== null && availableYears.indexOf(selectedYear) !== -1 ? selectedYear : availableYears[availableYears.length - 1]

  const monthsForYear = useMemo(function () {
    return availableMonths.filter(function (mo) { return mo.year === activeYear })
  }, [availableMonths, activeYear])

  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const activeMonth = monthsForYear.find(function (mo) { return mo.month === selectedMonth }) || monthsForYear[monthsForYear.length - 1]

  const days = useMemo(function () {
    if (!activeMonth || !minDate) return []
    const daysInMonth = new Date(activeMonth.year, activeMonth.month + 1, 0).getDate()
    const list = []
    for (let i = 1; i <= daysInMonth; i++) {
      const d = truncate(new Date(activeMonth.year, activeMonth.month, i))
      if (d.getTime() < minDate.getTime() || d.getTime() > today.getTime()) continue
      const key = dayKey(d)
      const hasData = profitByDay[key] !== undefined
      list.push({ key: key, dow: dowShort[d.getDay()], num: i, profit: profitByDay[key], disabled: !hasData })
    }
    return list
  }, [activeMonth, minDate, profitByDay, today])

  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null)

  const effectiveDayKey = useMemo(function () {
    if (selectedDayKey && days.some(function (d) { return d.key === selectedDayKey && !d.disabled })) return selectedDayKey
    const lastValid = days.slice().reverse().find(function (d) { return !d.disabled })
    return lastValid ? lastValid.key : null
  }, [selectedDayKey, days])

  const betsForDay = useMemo(function () {
    if (!effectiveDayKey) return []
    return bets.filter(function (b) { return dayKey(resultDate(b)) === effectiveDayKey })
  }, [bets, effectiveDayKey])

  const activeMonthKey = activeMonth ? activeMonth.key : ''
  const daysScrollRef = useRef<HTMLDivElement>(null)

  useEffect(function () {
    const container = daysScrollRef.current
    if (!container) return
    const activeButton = container.querySelector('[data-active="true"]') as HTMLElement | null
    if (activeButton) {
      activeButton.scrollIntoView({ block: 'nearest', inline: 'center' })
    } else {
      container.scrollLeft = container.scrollWidth
    }
  }, [activeMonthKey, effectiveDayKey])

  return (
    <div className="min-h-dvh flex flex-col bg-[#F3F1EA]">
      <header className="bg-[#1F2937] text-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <a href="/" className="font-display font-bold tracking-wide text-sm">RAGUX</a>
          <span className="text-xs text-white/50">EST. 2025</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-5 sm:px-8 py-5 pb-28">
        <h1 className="font-display text-xl font-extrabold text-[#1F2937] mb-3">Resultados</h1>

        {availableYears.length > 1 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#4B5563] mb-2">Año</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {availableYears.map(function (y) {
                const active = y === activeYear
                return (
                  <button key={y} onClick={function () { setSelectedYear(y); setSelectedMonth(null); setSelectedDayKey(null) }} className={'rounded-full text-[11.5px] font-bold px-3 py-1.5 border-2 ' + (active ? 'bg-[#1F2937] text-white border-[#1F2937]' : 'bg-white text-[#1F2937] border-black/15')}>{y}</button>
                )
              })}
            </div>
          </div>
        )}

        {monthsForYear.length > 1 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#4B5563] mb-2">Mes</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {monthsForYear.map(function (mo) {
                const active = mo.month === (activeMonth ? activeMonth.month : -1)
                return (
                  <button key={mo.key} onClick={function () { setSelectedMonth(mo.month); setSelectedDayKey(null) }} className={'rounded-full text-[11.5px] font-bold px-3 py-1.5 border-2 ' + (active ? 'bg-[#1F2937] text-white border-[#1F2937]' : 'bg-white text-[#1F2937] border-black/15')}>{monthShort[mo.month]}</button>
                )
              })}
            </div>
          </div>
        )}

        <div ref={daysScrollRef} className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-3 border-b border-black/10">
          {days.map(function (d) {
            const active = d.key === effectiveDayKey
            return (
              <button
                key={d.key}
                data-active={active}
                onClick={function () { if (!d.disabled) setSelectedDayKey(d.key) }}
                disabled={d.disabled}
                className={'shrink-0 w-[62px] text-center py-2.5 rounded-2xl border-2 ' + (d.disabled ? 'border-black/8 opacity-35' : active ? 'border-[#FF9933] bg-white' : 'border-black/12 bg-white')}
              >
                <p className={'text-[10.5px] font-bold ' + (active && !d.disabled ? 'text-[#FF9933]' : 'text-[#4B5563]')}>{d.dow}</p>
                <p className={'text-[16px] font-extrabold ' + (active && !d.disabled ? 'text-[#FF9933]' : 'text-[#1F2937]')}>{d.num}</p>
                <p className="text-[9.5px] font-bold mt-0.5" style={{ color: d.profit !== undefined ? (d.profit >= 0 ? '#17C971' : '#E23A52') : '#9CA3AF' }}>{d.profit !== undefined ? formatUnits(d.profit) : '-'}</p>
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

      <BottomNav active="resultados" />
    </div>
  )
}