'use client'

import { useMarkets } from '@/hooks/useMarkets'
import { useSelections } from '@/hooks/useSelections'
import { NewLeg } from '@/hooks/useCreateBet'

const sports = [
  { value: 'FOOTBALL', label: 'Futbol' },
  { value: 'TENNIS', label: 'Tenis' },
  { value: 'BASKETBALL', label: 'Basquet' },
]

const inputClass = 'w-full rounded-xl border border-black/20 bg-white p-3 text-sm text-[#1F2937] placeholder-[#6B7280]'
const labelClass = 'text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-1.5 block'

interface LegEditorProps {
  index: number
  leg: NewLeg
  onChange: (index: number, field: keyof NewLeg, value: string) => void
  onChangeMultiple: (index: number, changes: Partial<NewLeg>) => void
  onRemove: (index: number) => void
  canRemove: boolean
}

function isDynamicNamePair(name: string): boolean {
  const clean = name.trim().toLowerCase()
  return clean === 'jugador a' || clean === 'jugador b'
}

export function LegEditor(props: LegEditorProps) {
  const { index, leg, onChange, onChangeMultiple, onRemove, canRemove } = props
  const { markets: rawMarkets, loading: loadingMarkets } = useMarkets(leg.sport)
  const { selections, loading: loadingSelections } = useSelections(leg.sport_market_id === 'CUSTOM' ? '' : leg.sport_market_id)

  const markets = rawMarkets.filter(function (m) { return m.market_key.toLowerCase() !== 'otro' })

  const isCustomMarket = leg.sport_market_id === 'CUSTOM'
  const selectedMarket = markets.find(function (m) { return m.id === leg.sport_market_id })
  const isFreeTextSelectionMarket = selectedMarket ? selectedMarket.market_name.toLowerCase().indexOf('anotador') !== -1 : false
  const hasDynamicNames = selections.some(function (s) { return isDynamicNamePair(s.selection_name) })

  function handleSportChange(value: string) {
    onChangeMultiple(index, {
      sport: value,
      sport_market_id: '',
      market_selection_id: '',
      market_name_text: '',
      selection_name_text: '',
      market_custom: '',
      selection_custom: '',
      selection_free_text: '',
    })
  }

  function handleMarketChange(value: string) {
    if (value === 'CUSTOM') {
      onChangeMultiple(index, {
        sport_market_id: 'CUSTOM',
        market_selection_id: '',
        market_name_text: '',
        selection_name_text: '',
        selection_free_text: '',
      })
    } else {
      const found = markets.find(function (m) { return m.id === value })
      onChangeMultiple(index, {
        sport_market_id: value,
        market_selection_id: '',
        market_name_text: found ? found.market_name : '',
        selection_name_text: '',
        market_custom: '',
        selection_custom: '',
        selection_free_text: '',
      })
    }
  }

  function handleSelectionChange(value: string) {
    const found = selections.find(function (s) { return s.id === value })
    let label = found ? found.selection_name : ''

    if (found && isDynamicNamePair(found.selection_name)) {
      const clean = found.selection_name.trim().toLowerCase()
      if (clean === 'jugador a') {
        label = leg.competitor_1 ? leg.competitor_1 : 'Jugador A'
      } else {
        label = leg.competitor_2 ? leg.competitor_2 : 'Jugador B'
      }
    }

    onChangeMultiple(index, {
      market_selection_id: value,
      selection_name_text: label,
    })
  }

  function handleFreeTextSelectionChange(value: string) {
    onChangeMultiple(index, {
      market_selection_id: 'FREE_TEXT',
      selection_free_text: value,
      selection_name_text: value,
    })
  }

  return (
    <section className="rounded-3xl border border-black/15 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <p className={labelClass + ' mb-0'}>Evento {index + 1}</p>
        {canRemove && (
          <button onClick={function () { onRemove(index) }} className="text-xs text-[#E23A52] font-bold">Quitar</button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className={labelClass}>Deporte</label>
          <select value={leg.sport} onChange={function (e) { handleSportChange(e.target.value) }} className={inputClass}>
            {sports.map(function (s) { return <option key={s.value} value={s.value}>{s.label}</option> })}
          </select>
        </div>

        <div>
          <label className={labelClass}>Liga</label>
          <input value={leg.league} onChange={function (e) { onChange(index, 'league', e.target.value) }} placeholder="Ej: LaLiga" className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Competidor 1</label>
            <input value={leg.competitor_1} onChange={function (e) { onChange(index, 'competitor_1', e.target.value) }} placeholder="Equipo/jugador 1" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Competidor 2</label>
            <input value={leg.competitor_2} onChange={function (e) { onChange(index, 'competitor_2', e.target.value) }} placeholder="Equipo/jugador 2" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Mercado</label>
          <select value={leg.sport_market_id} onChange={function (e) { handleMarketChange(e.target.value) }} className={inputClass} disabled={loadingMarkets}>
            <option value="">-- Selecciona --</option>
            {markets.map(function (m) { return <option key={m.id} value={m.id}>{m.market_name}</option> })}
            <option value="CUSTOM">Otro (personalizado)</option>
          </select>
        </div>

        {isCustomMarket && (
          <div>
            <label className={labelClass}>Mercado personalizado</label>
            <input value={leg.market_custom} onChange={function (e) { onChange(index, 'market_custom', e.target.value) }} placeholder="Ej: Numero de tarjetas" className={inputClass} />
          </div>
        )}

        {!isCustomMarket && leg.sport_market_id && isFreeTextSelectionMarket && (
          <div>
            <label className={labelClass}>Jugador que anota</label>
            <input value={leg.selection_free_text} onChange={function (e) { handleFreeTextSelectionChange(e.target.value) }} placeholder="Nombre del jugador" className={inputClass} />
          </div>
        )}

        {!isCustomMarket && leg.sport_market_id && !isFreeTextSelectionMarket && (
          <div>
            <label className={labelClass}>Seleccion</label>
            <select value={leg.market_selection_id} onChange={function (e) { handleSelectionChange(e.target.value) }} className={inputClass} disabled={loadingSelections}>
              <option value="">-- Selecciona --</option>
              {selections.map(function (s) {
                let optionLabel = s.selection_name
                if (hasDynamicNames && isDynamicNamePair(s.selection_name)) {
                  const clean = s.selection_name.trim().toLowerCase()
                  if (clean === 'jugador a') {
                    optionLabel = leg.competitor_1 ? leg.competitor_1 : 'Jugador A'
                  } else {
                    optionLabel = leg.competitor_2 ? leg.competitor_2 : 'Jugador B'
                  }
                }
                return <option key={s.id} value={s.id}>{optionLabel}</option>
              })}
            </select>
          </div>
        )}

        {isCustomMarket && (
          <div>
            <label className={labelClass}>Seleccion personalizada</label>
            <input value={leg.selection_custom} onChange={function (e) { onChange(index, 'selection_custom', e.target.value) }} placeholder="Ej: Over 5" className={inputClass} />
          </div>
        )}

        <div>
          <label className={labelClass}>Cuota</label>
          <input value={leg.odds} onChange={function (e) { onChange(index, 'odds', e.target.value) }} placeholder="Ej: 1.85" type="number" step="0.01" className={inputClass} />
        </div>
      </div>
    </section>
  )
}