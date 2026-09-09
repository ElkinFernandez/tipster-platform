'use client'

import { useState, useMemo } from 'react'
import { useBetsFullData } from '@/hooks/useBetsFullData'
import { InfoTooltip } from '@/components/InfoTooltip'
import { BottomNav } from '@/components/BottomNav'

function formatUnits(value: number): string {
  const sign = value > 0 ? '+' : ''
  return sign + value.toFixed(2) + 'u'
}

function startOfWeek(d: Date) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

const sportOptions = [
  { key: 'TENNIS', label: 'Tenis' },
  { key: 'FOOTBALL', label: 'Futbol' },
  { key: 'BASKETBALL', label: 'Basquet' },
  { key: 'ALL', label: 'Todos' },
]

const periodOptions = [
  { key: 'TODAY', label: 'Hoy' },
  { key: 'YESTERDAY', label: 'Ayer' },
  { key: 'WEEK', label: 'Esta semana' },
  { key: 'MONTH', label: 'Este mes' },
  { key: 'LAST_MONTH', label: 'Mes pasado' },
  { key: 'YEAR', label: 'Este año' },
  { key: 'ALL', label: 'Todo' },
]

export default function EstadisticasPage() {
  const { bets, loading } = useBetsFullData()
  const [sport, setSport] = useState('TENNIS')
  const [period, setPeriod] = useState('WEEK')

  const filtered = useMemo(function () {
    let list = bets
    if (sport !== 'ALL') {
      list = list.filter(function (b) { return (b.bet_legs || []).some(function (l) { return l.sport === sport }) })
    }

    const now = new Date()
    if (period === 'TODAY') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      list = list.filter(function (b) { return b.result_at && new Date(b.result_at) >= start })
    } else if (period === 'YESTERDAY') {
      const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startYesterday = new Date(startToday.getTime() - 86400000)
      list = list.filter(function (b) { return b.result_at && new Date(b.result_at) >= startYesterday && new Date(b.result_at) < startToday })
    } else if (period === 'WEEK') {
      const start = startOfWeek(now)
      list = list.filter(function (b) { return b.result_at && new Date(b.result_at) >= start })
    } else if (period === 'MONTH') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      list = list.filter(function (b) { return b.result_at && new Date(b.result_at) >= start })
    } else if (period === 'LAST_MONTH') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 1)
      list = list.filter(function (b) { return b.result_at && new Date(b.result_at) >= start && new Date(b.result_at) < end })
    } else if (period === 'YEAR') {
      const start = new Date(now.getFullYear(), 0, 1)
      list = list.filter(function (b) { return b.result_at && new Date(b.result_at) >= start })
    }

    return list
  }, [bets, sport, period])

  const stats = useMemo(function () {
    const total = filtered.length
    const won = filtered.filter(function (b) { return b.status === 'WIN' || b.status === 'PARTIAL_WIN' }).length
    const winRate = total > 0 ? (won / total) * 100 : 0
    const totalProfit = filtered.reduce(function (s, b) { return s + Number(b.profit || 0) }, 0)
    const totalStake = filtered.reduce(function (s, b) { return s + Number(b.stake || 0) }, 0)
    const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0

    const sorted = filtered.slice().sort(function (a, b) { return new Date(a.result_at || a.created_at).getTime() - new Date(b.result_at || b.created_at).getTime() })
    let running = 0, peak = 0, maxDrawdown = 0
    sorted.forEach(function (b) {
      running += Number(b.profit || 0)
      if (running > peak) peak = running
      const dd = peak - running
      if (dd > maxDrawdown) maxDrawdown = dd
    })

    const totalWon = filtered.reduce(function (s, b) { return Number(b.profit || 0) > 0 ? s + Number(b.profit) : s }, 0)
    const totalLost = filtered.reduce(function (s, b) { return Number(b.profit || 0) < 0 ? s + Math.abs(Number(b.profit)) : s }, 0)
    const profitFactor = totalLost > 0 ? totalWon / totalLost : null

    return {
      total: total,
      winRate: Math.round(winRate * 10) / 10,
      roi: Math.round(roi * 10) / 10,
      profit: Math.round(totalProfit * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      profitFactor: profitFactor !== null ? Math.round(profitFactor * 100) / 100 : null,
    }
  }, [filtered])

  const historicProfit = useMemo(function () {
    let list = bets
    if (sport !== 'ALL') list = list.filter(function (b) { return (b.bet_legs || []).some(function (l) { return l.sport === sport }) })
    return list.reduce(function (s, b) { return s + Number(b.profit || 0) }, 0)
  }, [bets, sport])

  return (
    <div className="min-h-dvh flex flex-col bg-[#F3F1EA]">
      <header className="bg-[#1F2937] text-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <a href="/" className="font-display font-bold tracking-wide text-sm">RAGUX</a>
          <span className="text-xs text-white/50">EST. 2025</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-5 sm:px-8 py-5 pb-28">
        <h1 className="font-display text-xl font-extrabold text-[#1F2937] mb-4">Estadisticas</h1>

        <p className="text-[10px] font-bold uppercase tracking-wider text-[#4B5563] mb-2">Deporte</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {sportOptions.map(function (s) {
            const active = sport === s.key
            return <button key={s.key} onClick={function () { setSport(s.key) }} className={'rounded-full text-[11.5px] font-bold px-3 py-1.5 border-2 ' + (active ? 'bg-[#3FA9B7] text-white border-[#3FA9B7]' : 'bg-white text-[#1F2937] border-[#3FA9B7]/40')}>{s.label}</button>
          })}
        </div>

        <p className="text-[10px] font-bold uppercase tracking-wider text-[#4B5563] mb-2">Periodo</p>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {periodOptions.map(function (p) {
            const active = period === p.key
            return <button key={p.key} onClick={function () { setPeriod(p.key) }} className={'rounded-full text-[11.5px] font-bold px-3 py-1.5 border-2 ' + (active ? 'bg-[#1F2937] text-white border-[#1F2937]' : 'bg-white text-[#1F2937] border-black/15')}>{p.label}</button>
          })}
        </div>

        {loading && <p className="text-sm text-[#4B5563]">Cargando...</p>}

        {!loading && (
          <div>
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <div className="rounded-2xl border-1.5 border-black/15 bg-white p-3.5">
                <p className="font-display text-xl font-extrabold text-[#1F2937]">{stats.total}</p>
                <p className="text-[10px] text-[#4B5563] font-bold">Pronosticos</p>
              </div>
              <div className="rounded-2xl border-1.5 border-black/15 bg-white p-3.5">
                <p className="font-display text-xl font-extrabold text-[#17C971]">{stats.winRate}%</p>
                <p className="text-[10px] text-[#4B5563] font-bold flex items-center gap-1">Win Rate <InfoTooltip text="Porcentaje de pronosticos ganados o parcialmente ganados." /></p>
              </div>
              <div className="rounded-2xl border-1.5 border-black/15 bg-white p-3.5">
                <p className="font-display text-xl font-extrabold" style={{ color: stats.roi >= 0 ? '#17C971' : '#E23A52' }}>{stats.roi}%</p>
                <p className="text-[10px] text-[#4B5563] font-bold flex items-center gap-1">ROI <InfoTooltip text="Ganancia promedio por cada unidad apostada." /></p>
              </div>
              <div className="rounded-2xl border-1.5 border-black/15 bg-white p-3.5">
                <p className="font-display text-xl font-extrabold" style={{ color: stats.profit >= 0 ? '#17C971' : '#E23A52' }}>{formatUnits(stats.profit)}</p>
                <p className="text-[10px] text-[#4B5563] font-bold">Profit</p>
              </div>
              <div className="rounded-2xl border-1.5 border-black/15 bg-white p-3.5">
                <p className="font-display text-xl font-extrabold text-[#E23A52]">{stats.maxDrawdown > 0 ? '-' + stats.maxDrawdown.toFixed(2) + 'u' : '0.00u'}</p>
                <p className="text-[10px] text-[#4B5563] font-bold flex items-center gap-1">Max drawdown <InfoTooltip text="La peor caida de profit acumulado desde su punto mas alto." /></p>
              </div>
              <div className="rounded-2xl border-1.5 border-black/15 bg-white p-3.5">
                <p className="font-display text-xl font-extrabold text-[#1F2937]">{stats.profitFactor !== null ? stats.profitFactor.toFixed(2) : '-'}</p>
                <p className="text-[10px] text-[#4B5563] font-bold flex items-center gap-1">Profit factor <InfoTooltip text="Ganado sobre perdido. Mayor a 1 es rentable." /></p>
              </div>
            </div>

            <div className="rounded-2xl bg-[#1F2937] p-6 text-center">
              <p className="text-[10.5px] uppercase tracking-wider text-white/50 font-bold mb-2">Profit historico acumulado</p>
              <p className="font-display text-3xl font-extrabold" style={{ color: historicProfit >= 0 ? '#17C971' : '#E23A52' }}>{formatUnits(historicProfit)}</p>
            </div>
          </div>
        )}
      </main>

      <BottomNav active="estadisticas" />
    </div>
  )
}