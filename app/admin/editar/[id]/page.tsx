'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useBetDetail } from '@/hooks/useBetDetail'
import { useUpdateBet } from '@/hooks/useUpdateBet'
import { LegEditor } from '@/components/LegEditor'
import { NewLeg } from '@/hooks/useCreateBet'
import { betTypeLabel } from '@/lib/utils'

const stakes = ['0.1','0.25','0.5', '1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0', '9.5', '10.0']

const typeByCount: Record<number, string> = {
  1: 'SINGLE', 2: 'DOUBLE', 3: 'TRIPLE', 4: '4X', 5: '5X', 6: '6X', 7: '7X', 8: '8X', 9: '9X', 10: '10X',
}

function toDatetimeLocal(isoString: string): string {
  const date = new Date(isoString)
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

function EditarApuestaContent() {
  const params = useParams()
  const router = useRouter()
  const betId = String(params.id)
  const { bet, legs: existingLegs, loading } = useBetDetail(betId)
  const { updateBet, saving, error } = useUpdateBet()

  const [timing, setTiming] = useState('PRE_MATCH')
  const [analysisType, setAnalysisType] = useState('MANUAL')
  const [stake, setStake] = useState('1.0')
  const [explanationUrl, setExplanationUrl] = useState('')
  const [evidenceUrl, setEvidenceUrl] = useState('')
  const [legs, setLegs] = useState<NewLeg[]>([])
  const [createdAt, setCreatedAt] = useState('')
  const [successMsg, setSuccessMsg] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(function () {
    if (bet && existingLegs.length > 0 && !initialized) {
      setTiming(bet.timing)
      setAnalysisType(bet.analysis_type)
      setStake(String(Number(bet.stake).toFixed(1)))
      setExplanationUrl(bet.explanation_url || '')
      setEvidenceUrl(bet.evidence_url || '')
      setCreatedAt(toDatetimeLocal(bet.created_at))

      const loadedLegs: NewLeg[] = existingLegs.map(function (leg) {
        return {
          sport: leg.sport,
          league: leg.league,
          competitor_1: leg.competitor_1,
          competitor_2: leg.competitor_2,
          sport_market_id: '',
          market_selection_id: '',
          market_custom: '',
          selection_custom: '',
          selection_free_text: leg.market.toLowerCase().indexOf('anotador') !== -1 ? leg.selection : '',
          market_name_text: leg.market,
          selection_name_text: leg.selection,
          odds: String(leg.odds),
        }
      })
      setLegs(loadedLegs)
      setInitialized(true)
    }
  }, [bet, existingLegs, initialized])

  const calculatedType = typeByCount[legs.length] || (legs.length + 'X')

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
        if (i === index) return Object.assign({}, leg, changes)
        return leg
      })
    })
  }

  function addLeg() {
    if (legs.length >= 10) return
    setLegs(function (prevLegs) {
      return prevLegs.concat([{
        sport: 'FOOTBALL', league: '', competitor_1: '', competitor_2: '',
        sport_market_id: '', market_selection_id: '', market_custom: '', selection_custom: '',
        selection_free_text: '', market_name_text: '', selection_name_text: '', odds: '',
      }])
    })
  }

  function removeLeg(index: number) {
    if (legs.length === 1) return
    setLegs(function (prevLegs) { return prevLegs.filter(function (_, i) { return i !== index }) })
  }

  let combinedOdds = 1
  legs.forEach(function (leg) {
    const n = parseFloat(leg.odds)
    if (!isNaN(n)) combinedOdds = combinedOdds * n
  })

  async function handleSubmit() {
    setSuccessMsg(false)

    const result = await updateBet(betId, {
      type: calculatedType, timing: timing, analysis_type: analysisType, stake: stake,
      explanation_url: explanationUrl, evidence_url: evidenceUrl, legs: legs, created_at: createdAt,
    })

    if (result.success) {
      setSuccessMsg(true)
      setTimeout(function () { router.push('/admin/pendientes') }, 1500)
    }
  }

  const isValid = legs.length > 0 && legs.every(function (leg) {
    const hasBasics = leg.league && leg.competitor_1 && leg.competitor_2 && leg.odds
    const hasMarketText = leg.market_name_text || leg.sport_market_id
    const hasSelectionText = leg.selection_name_text || leg.selection_free_text || leg.market_selection_id
    return hasBasics && hasMarketText && hasSelectionText
  })

  const labelClass = 'text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-2'
  const inputClass = 'w-full rounded-xl border border-black/20 bg-white p-3 text-sm text-[#1F2937] placeholder-[#6B7280]'

  if (bet && bet.status !== 'PENDING') {
    return (
      <div className="min-h-screen bg-[#F3F1EA]">
        <header className="sticky top-0 z-10 bg-[#F3F1EA]/95 backdrop-blur-sm border-b border-black/15">
          <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center gap-3">
            <a href="/admin/apuestas" className="text-sm text-[#4B5563] font-medium">Volver</a>
            <span className="font-display font-bold text-[#1F2937] text-sm sm:text-base">Editar apuesta</span>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-5 sm:px-8 py-6">
          <div className="rounded-3xl border border-black/15 bg-white p-8 text-center">
            <p className="text-sm text-[#4B5563]">Esta apuesta ya tiene un resultado registrado. Para corregirla, usa Registrar resultado en su lugar.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F3F1EA]">
      <header className="sticky top-0 z-10 bg-[#F3F1EA]/95 backdrop-blur-sm border-b border-black/15">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center gap-3">
          <a href="/admin/pendientes" className="text-sm text-[#4B5563] font-medium">Volver</a>
          <span className="font-display font-bold text-[#1F2937] text-sm sm:text-base">Editar apuesta</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 sm:px-8 py-6 space-y-6">

        {loading && <p className="text-sm text-[#4B5563]">Cargando...</p>}

        {successMsg && (
          <div className="rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30 p-4">
            <p className="text-sm text-[#0D9668] font-bold">Apuesta actualizada correctamente</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-[#FF7A8C]/15 border border-[#FF7A8C]/30 p-4">
            <p className="text-sm text-[#E23A52] font-bold">{error}</p>
          </div>
        )}

        {!loading && initialized && (
          <div className="space-y-6">
            <section className="rounded-3xl border border-black/15 bg-white p-5 flex items-center justify-between">
              <div>
                <p className={labelClass + ' mb-1'}>Tipo de apuesta</p>
                <p className="font-display text-lg font-extrabold text-[#1F2937]">{betTypeLabel[calculatedType] || calculatedType}</p>
              </div>
              <p className="text-xs text-[#4B5563]">Se calcula segun cuantos eventos agregues</p>
            </section>

            <section className="rounded-3xl border border-black/15 bg-white p-5">
              <p className={labelClass}>Fecha y hora de publicacion en Telegram</p>
              <input
                type="datetime-local"
                value={createdAt}
                onChange={function (e) { setCreatedAt(e.target.value) }}
                className={inputClass}
              />
              <p className="text-xs text-[#4B5563] mt-2">
                Escribe la hora exacta que ves en tu propio reloj/Telegram, sin convertir nada.
              </p>
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

            {legs.length < 10 && (
              <button onClick={addLeg} className="w-full rounded-2xl border-2 border-dashed border-black/25 text-sm font-bold text-[#4B5563] py-3">+ Agregar evento</button>
            )}

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
            </section>

            <section className="rounded-3xl border border-black/15 bg-white p-5">
              <p className={labelClass}>Enlace explicacion (Telegram)</p>
              <input
                value={explanationUrl}
                onChange={function (e) { setExplanationUrl(e.target.value) }}
                placeholder="https://t.me/tu_canal/123"
                type="url"
                className={inputClass}
              />
              <p className="text-xs text-[#4B5563] mt-2 mb-4">Mensaje donde explicas el analisis de esta apuesta.</p>

              <p className={labelClass}>Enlace evidencia de cuota (Telegram)</p>
              <input
                value={evidenceUrl}
                onChange={function (e) { setEvidenceUrl(e.target.value) }}
                placeholder="https://t.me/tu_canal/124"
                type="url"
                className={inputClass}
              />
              <p className="text-xs text-[#4B5563] mt-2">Mensaje con la captura de pantalla de la cuota real apostada.</p>
            </section>

            <button onClick={handleSubmit} disabled={!isValid || saving} className="w-full rounded-2xl bg-[#FFA94D] text-white font-bold text-sm py-4 disabled:opacity-40 disabled:cursor-not-allowed">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        )}

      </main>
    </div>
  )
}

export default function EditarApuestaPage() {
  return (
    <ProtectedRoute>
      <EditarApuestaContent />
    </ProtectedRoute>
  )
}