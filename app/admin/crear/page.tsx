'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useTipster } from '@/hooks/useTipster'
import { useCreateBet, NewLeg } from '@/hooks/useCreateBet'
import { LegEditor } from '@/components/LegEditor'

const betTypes = ['SINGLE', 'DOUBLE', 'TRIPLE', '4X', '5X', '6X', '7X', '8X', '9X', '10X']
const stakes = ['0.5', '1.0', '1.5', '2.0']

function emptyLeg(): NewLeg {
  return {
    sport: 'FOOTBALL',
    league: '',
    competitor_1: '',
    competitor_2: '',
    sport_market_id: '',
    market_selection_id: '',
    market_custom: '',
    selection_custom: '',
    selection_free_text: '',
    market_name_text: '',
    selection_name_text: '',
    odds: '',
  }
}

function CrearApuestaContent() {
  const router = useRouter()
  const { tipster } = useTipster()
  const { createBet, saving, error } = useCreateBet()

  const [type, setType] = useState('SINGLE')
  const [timing, setTiming] = useState('PRE_MATCH')
  const [analysisType, setAnalysisType] = useState('MANUAL')
  const [stake, setStake] = useState('1.0')
  const [notes, setNotes] = useState('')
  const [legs, setLegs] = useState<NewLeg[]>([emptyLeg()])
  const [successMsg, setSuccessMsg] = useState(false)

  function updateLeg(index: number, field: keyof NewLeg, value: string) {
    setLegs(function (prevLegs) {
      return prevLegs.map(function (leg, i) {
        if (i === index) {
          const copy = Object.assign({}, leg)
          copy[field] = value
          return copy
        }
        return leg
      })
    })
  }

  function updateLegMultiple(index: number, changes: Partial<NewLeg>) {
    setLegs(function (prevLegs) {
      return prevLegs.map(function (leg, i) {
        if (i === index) {
          return Object.assign({}, leg, changes)
        }
        return leg
      })
    })
  }

  function addLeg() {
    setLegs(function (prevLegs) {
      return prevLegs.concat([emptyLeg()])
    })
  }

  function removeLeg(index: number) {
    if (legs.length === 1) return
    setLegs(function (prevLegs) {
      return prevLegs.filter(function (_, i) { return i !== index })
    })
  }

  let combinedOdds = 1
  legs.forEach(function (leg) {
    const n = parseFloat(leg.odds)
    if (!isNaN(n)) combinedOdds = combinedOdds * n
  })

  async function handleSubmit() {
    if (!tipster) return
    setSuccessMsg(false)

    const result = await createBet(
      { type: type, timing: timing, analysis_type: analysisType, stake: stake, notes: notes, legs: legs },
      tipster.id
    )

    if (result.success) {
      setSuccessMsg(true)
      setType('SINGLE')
      setTiming('PRE_MATCH')
      setAnalysisType('MANUAL')
      setStake('1.0')
      setNotes('')
      setLegs([emptyLeg()])
      setTimeout(function () { router.push('/admin') }, 1500)
    }
  }

  const isValid = legs.every(function (leg) {
    const hasBasics = leg.league && leg.competitor_1 && leg.competitor_2 && leg.odds

    if (leg.sport_market_id === 'CUSTOM') {
      return hasBasics && leg.market_custom && leg.selection_custom
    }

    if (leg.market_selection_id === 'FREE_TEXT') {
      return hasBasics && leg.sport_market_id && leg.selection_free_text
    }

    return hasBasics && leg.sport_market_id && leg.market_selection_id
  })

  const labelClass = 'text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-2'
  const inputClass = 'w-full rounded-xl border border-black/20 bg-white p-3 text-sm text-[#1F2937] placeholder-[#6B7280]'

  return (
    <div className="min-h-screen bg-[#F3F1EA]">
      <header className="sticky top-0 z-10 bg-[#F3F1EA]/95 backdrop-blur-sm border-b border-black/15">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center gap-3">
          <a href="/admin" className="text-sm text-[#4B5563] font-medium">Volver</a>
          <span className="font-display font-bold text-[#1F2937] text-sm sm:text-base">Crear apuesta</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 sm:px-8 py-6 space-y-6">

        {successMsg && (
          <div className="rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30 p-4">
            <p className="text-sm text-[#0D9668] font-bold">Apuesta guardada correctamente</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-[#FF7A8C]/15 border border-[#FF7A8C]/30 p-4">
            <p className="text-sm text-[#E23A52] font-bold">{error}</p>
          </div>
        )}

        <section className="rounded-3xl border border-black/15 bg-white p-5">
          <p className={labelClass}>Tipo de apuesta</p>
          <div className="flex flex-wrap gap-2">
            {betTypes.map(function (t) {
              const active = type === t
              const cls = active ? 'bg-[#1F2937] text-white' : 'bg-white text-[#1F2937] border border-black/25'
              return (
                <button key={t} onClick={function () { setType(t) }} className={'rounded-full text-xs font-bold px-3 py-2 ' + cls}>{t}</button>
              )
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-black/15 bg-white p-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={labelClass}>Timing</p>
              <select value={timing} onChange={function (e) { setTiming(e.target.value) }} className={inputClass}>
                <option value="PRE_MATCH">Pre-partido</option>
                <option value="LIVE">En vivo</option>
              </select>
            </div>
            <div>
              <p className={labelClass}>Analisis</p>
              <select value={analysisType} onChange={function (e) { setAnalysisType(e.target.value) }} className={inputClass}>
                <option value="MANUAL">Manual</option>
                <option value="SOFTWARE">Software</option>
              </select>
            </div>
          </div>
        </section>

        {legs.map(function (leg, index) {
          return (
            <LegEditor
              key={index}
              index={index}
              leg={leg}
              onChange={updateLeg}
              onChangeMultiple={updateLegMultiple}
              onRemove={removeLeg}
              canRemove={legs.length > 1}
            />
          )
        })}

        <button onClick={addLeg} className="w-full rounded-2xl border-2 border-dashed border-black/25 text-sm font-bold text-[#4B5563] py-3">+ Agregar evento</button>

        <section className="rounded-3xl border border-black/15 bg-white p-5">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className={labelClass}>Stake (unidades)</p>
              <select value={stake} onChange={function (e) { setStake(e.target.value) }} className={inputClass}>
                {stakes.map(function (s) { return <option key={s} value={s}>{s}u</option> })}
              </select>
            </div>
            <div>
              <p className={labelClass}>Cuota combinada</p>
              <div className="w-full rounded-xl border border-black/20 bg-[#F3F1EA] p-3 text-sm font-extrabold text-[#1F2937]">{combinedOdds.toFixed(2)}</div>
            </div>
          </div>

          <p className={labelClass}>Notas (opcional)</p>
          <textarea value={notes} onChange={function (e) { setNotes(e.target.value) }} placeholder="Razonamiento, analisis personal..." rows={3} className={inputClass}></textarea>
        </section>

        <button onClick={handleSubmit} disabled={!isValid || saving} className="w-full rounded-2xl bg-[#FFA94D] text-white font-bold text-sm py-4 disabled:opacity-40 disabled:cursor-not-allowed">
          {saving ? 'Guardando...' : 'Guardar apuesta'}
        </button>

      </main>
    </div>
  )
}

export default function CrearApuestaPage() {
  return (
    <ProtectedRoute>
      <CrearApuestaContent />
    </ProtectedRoute>
  )
}