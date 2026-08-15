'use client'

import { useState } from 'react'
import { useMarketsCatalog } from '@/hooks/useMarketsCatalog'
import { useSelectionsCatalog } from '@/hooks/useSelectionsCatalog'
import { useKnownEntities } from '@/hooks/useKnownEntities'
import { useSharedEvents, SharedEvent } from '@/hooks/useSharedEvents'
import { SmartSelect } from '@/components/SmartSelect'
import { SmartCreateSelect } from '@/components/SmartCreateSelect'
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

function isTournamentLevelMarket(marketName: string): boolean {
  const clean = marketName.toLowerCase()
  return clean.indexOf('ganador del torneo') !== -1 || clean.indexOf('goleador del torneo') !== -1
}

export function LegEditor(props: LegEditorProps) {
  const { index, leg, onChange, onChangeMultiple, onRemove, canRemove } = props

  const { markets, loading: loadingMarkets, createMarket } = useMarketsCatalog(leg.sport)
  const { selections, loading: loadingSelections, createSelection } = useSelectionsCatalog(leg.sport_market_id)
  const { entities: leagues, loading: loadingLeagues } = useKnownEntities('LEAGUE', leg.sport)
  const { entities: competitors, loading: loadingCompetitors } = useKnownEntities('COMPETITOR', leg.sport)
  const { events: sharedEvents, loading: loadingSharedEvents } = useSharedEvents(leg.sport)

  const [showReuseSearch, setShowReuseSearch] = useState(false)
  const [reuseSearch, setReuseSearch] = useState('')

  const marketNameLower = leg.market_name_text.toLowerCase()
  const hasMarketChosen = leg.market_name_text.trim().length > 0
  const isFreeTextSelectionMarket = marketNameLower.indexOf('anotador') !== -1 && marketNameLower.indexOf('goleador del torneo') === -1
  const isTournamentMarket = isTournamentLevelMarket(leg.market_name_text)
  const hasDynamicNames = selections.some(function (s) { return isDynamicNamePair(s.name) })

  const leagueLabel = leg.sport === 'TENNIS' ? 'Torneo' : 'Liga'
  const leaguePlaceholder = leg.sport === 'TENNIS' ? 'Ej: ATP Madrid' : 'Ej: LaLiga'
  const leagueNewLabel = leg.sport === 'TENNIS' ? '+ Nuevo torneo' : '+ Nueva liga'

  const competitor1Label = leg.sport === 'TENNIS' ? 'Jugador A' : 'Local'
  const competitor2Label = leg.sport === 'TENNIS' ? 'Jugador B' : 'Visitante'
  const competitor1Placeholder = leg.sport === 'TENNIS' ? 'Nombre jugador A' : 'Equipo local'
  const competitor2Placeholder = leg.sport === 'TENNIS' ? 'Nombre jugador B' : 'Equipo visitante'

  function handleSportChange(value: string) {
    onChangeMultiple(index, {
      sport: value,
      league: '',
      competitor_1: '',
      competitor_2: '',
      sport_market_id: '',
      market_selection_id: '',
      market_name_text: '',
      selection_name_text: '',
      market_custom: '',
      selection_custom: '',
      selection_free_text: '',
      reused_event_id: '',
    })
  }

  function handleMarketPick(id: string, name: string) {
    const changes: Partial<NewLeg> = {
      sport_market_id: id,
      market_name_text: name,
      market_selection_id: '',
      selection_name_text: '',
      selection_free_text: '',
    }
    if (isTournamentLevelMarket(name)) {
      changes.competitor_1 = 'N/A'
      changes.competitor_2 = 'N/A'
    }
    onChangeMultiple(index, changes)
  }

  function handleSelectionPick(id: string, name: string) {
    onChangeMultiple(index, {
      market_selection_id: id,
      selection_name_text: name,
    })
  }

  function handleFreeTextSelectionChange(value: string) {
    onChangeMultiple(index, {
      market_selection_id: 'FREE_TEXT',
      selection_free_text: value,
      selection_name_text: value,
    })
  }

  function pickSharedEvent(ev: SharedEvent) {
    onChangeMultiple(index, {
      reused_event_id: ev.id,
      league: ev.league,
      competitor_1: ev.competitor_1,
      competitor_2: ev.competitor_2,
      sport_market_id: ev.sport_market_id || '',
      market_selection_id: ev.market_selection_id || '',
      market_name_text: ev.market,
      selection_name_text: ev.selection,
    })
    setShowReuseSearch(false)
    setReuseSearch('')
  }

  function clearReuse() {
    onChangeMultiple(index, { reused_event_id: '' })
  }

  const filteredSharedEvents = reuseSearch.trim().length >= 2
    ? sharedEvents.filter(function (ev) {
        const term = reuseSearch.trim().toLowerCase()
        return (ev.competitor_1 + ' ' + ev.competitor_2 + ' ' + ev.league).toLowerCase().indexOf(term) !== -1
      })
    : sharedEvents.slice(0, 8)

  const displaySelections = selections.map(function (s) {
    if (isDynamicNamePair(s.name) && hasDynamicNames) {
      const clean = s.name.trim().toLowerCase()
      const label = clean === 'jugador a'
        ? (leg.competitor_1 ? leg.competitor_1 : 'Jugador A')
        : (leg.competitor_2 ? leg.competitor_2 : 'Jugador B')
      return { id: s.id, name: label }
    }
    return s
  })

  return (
    <section className="rounded-3xl border border-black/15 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <p className={labelClass + ' mb-0'}>Evento {index + 1}</p>
        {canRemove && (
          <button onClick={function () { onRemove(index) }} className="text-xs text-[#E23A52] font-bold">Quitar</button>
        )}
      </div>

      {leg.reused_event_id && (
        <div className="rounded-2xl border-2 border-[#3FA9B7]/40 bg-[#3FA9B7]/10 p-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-[#3FA9B7]">Evento reutilizado</span>
            <button onClick={clearReuse} className="text-xs font-bold text-[#4B5563]">Cambiar</button>
          </div>
          <p className="text-sm font-semibold text-[#1F2937]">
            {isTournamentLevelMarket(leg.market_name_text) ? leg.league : leg.competitor_1 + ' vs ' + leg.competitor_2}
          </p>
          <p className="text-xs text-[#4B5563] mt-0.5">{leg.market_name_text}: {leg.selection_name_text}</p>
          <p className="text-xs text-[#4B5563] mt-2">Este evento se resolvera automaticamente en todas las apuestas donde lo uses.</p>
        </div>
      )}

      {!leg.reused_event_id && (
        <div className="mb-3">
          {!showReuseSearch && (
            <button onClick={function () { setShowReuseSearch(true) }} className="text-xs font-bold text-[#3FA9B7]">
              Reutilizar un evento pendiente que ya tengas
            </button>
          )}
          {showReuseSearch && (
            <div className="rounded-2xl border border-black/15 bg-[#F3F1EA] p-3">
              <input
                value={reuseSearch}
                onChange={function (e) { setReuseSearch(e.target.value) }}
                placeholder="Busca por equipo/liga (2+ letras)"
                className={inputClass + ' mb-2'}
                autoFocus
              />
              {loadingSharedEvents && <p className="text-xs text-[#4B5563]">Cargando...</p>}
              {!loadingSharedEvents && filteredSharedEvents.length === 0 && (
                <p className="text-xs text-[#4B5563]">No hay eventos pendientes que coincidan.</p>
              )}
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {filteredSharedEvents.map(function (ev) {
                  const isTournament = isTournamentLevelMarket(ev.market)
                  return (
                    <button
                      key={ev.id}
                      onClick={function () { pickSharedEvent(ev) }}
                      className="block w-full text-left rounded-xl bg-white border border-black/10 px-3 py-2 text-xs"
                    >
                      <span className="font-semibold text-[#1F2937]">{isTournament ? ev.league : ev.competitor_1 + ' vs ' + ev.competitor_2}</span>
                      <span className="text-[#4B5563]"> - {ev.market}: {ev.selection}</span>
                    </button>
                  )
                })}
              </div>
              <button onClick={function () { setShowReuseSearch(false) }} className="text-xs font-semibold text-[#4B5563] mt-2">Cancelar</button>
            </div>
          )}
        </div>
      )}

      {!leg.reused_event_id && (
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Deporte</label>
            <select value={leg.sport} onChange={function (e) { handleSportChange(e.target.value) }} className={inputClass}>
              {sports.map(function (s) { return <option key={s.value} value={s.value}>{s.label}</option> })}
            </select>
          </div>

          <SmartSelect
            label={leagueLabel}
            value={leg.league}
            onChange={function (v) { onChange(index, 'league', v) }}
            entities={leagues}
            loading={loadingLeagues}
            placeholder={leaguePlaceholder}
            newLabel={leagueNewLabel}
          />

          {!isTournamentMarket && (
            <div className="grid grid-cols-2 gap-3">
              <SmartSelect
                label={competitor1Label}
                value={leg.competitor_1}
                onChange={function (v) { onChange(index, 'competitor_1', v) }}
                entities={competitors}
                loading={loadingCompetitors}
                placeholder={competitor1Placeholder}
                newLabel="+ Nuevo equipo/jugador"
              />
              <SmartSelect
                label={competitor2Label}
                value={leg.competitor_2}
                onChange={function (v) { onChange(index, 'competitor_2', v) }}
                entities={competitors}
                loading={loadingCompetitors}
                placeholder={competitor2Placeholder}
                newLabel="+ Nuevo equipo/jugador"
              />
            </div>
          )}

          <SmartCreateSelect
            label="Mercado"
            selectedId={leg.sport_market_id}
            selectedName={leg.market_name_text}
            onPick={handleMarketPick}
            onCreate={createMarket}
            items={markets}
            loading={loadingMarkets}
            placeholder="Busca o escribe un mercado"
          />

          {hasMarketChosen && isFreeTextSelectionMarket && (
            <div>
              <label className={labelClass}>Jugador que anota</label>
              <input value={leg.selection_free_text} onChange={function (e) { handleFreeTextSelectionChange(e.target.value) }} placeholder="Nombre del jugador" className={inputClass} />
            </div>
          )}

          {hasMarketChosen && isTournamentMarket && (
            <SmartSelect
              label="Equipo/Jugador"
              value={leg.selection_free_text || leg.selection_name_text}
              onChange={function (v) { handleFreeTextSelectionChange(v) }}
              entities={competitors}
              loading={loadingCompetitors}
              placeholder="Busca o escribe el nombre"
              newLabel="+ Nuevo equipo/jugador"
            />
          )}

          {hasMarketChosen && !isFreeTextSelectionMarket && !isTournamentMarket && (
            <SmartCreateSelect
              label="Seleccion"
              selectedId={leg.market_selection_id}
              selectedName={leg.selection_name_text}
              onPick={handleSelectionPick}
              onCreate={createSelection}
              items={displaySelections}
              loading={loadingSelections}
              placeholder="Busca o escribe una seleccion"
            />
          )}
        </div>
      )}

      <div className="mt-3">
        <label className={labelClass}>Cuota</label>
        <input value={leg.odds} onChange={function (e) { onChange(index, 'odds', e.target.value) }} placeholder="Ej: 1.85" type="number" step="0.01" className={inputClass} />
      </div>
    </section>
  )
}