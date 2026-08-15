'use client'

import { useTipster } from '@/hooks/useTipster'
import { useBetsFullData } from '@/hooks/useBetsFullData'

export default function PerfilPage() {
  const { tipster, loading: loadingTipster } = useTipster()
  const { bets, loading: loadingBets } = useBetsFullData()

  const displayName = tipster?.name || 'Ragux'
  const bio = tipster?.bio || 'Analisis centrado en tenis ATP y WTA, combinando estadisticas de rendimiento reciente con lectura de forma fisica de cada jugador.'
  const telegramUrl = tipster?.telegram_url || 'https://t.me/PredictorRM'

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F1EA]">
      <header className="bg-[#1F2937] text-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <a href="/" className="font-display font-bold tracking-wide text-sm">RAGUX</a>
          <span className="text-xs text-white/50">EST. 2025</span>
        </div>
      </header>

      <section className="bg-[#1F2937] text-center pt-2 pb-8">
        <div className="w-20 h-20 rounded-full mx-auto mb-3.5 border-2 border-white/20 bg-cover bg-center" style={{ backgroundImage: 'url(/avatar-ragux.png)' }}></div>
        <h1 className="font-display text-xl font-extrabold text-white">{loadingTipster ? '...' : displayName}</h1>
        <p className="text-xs text-white/45 mt-1">{loadingBets ? '' : bets.length + ' pronosticos publicados'}</p>
      </section>

      <main className="flex-1 max-w-2xl w-full mx-auto px-5 sm:px-8 py-6">
        <p className="text-xs font-bold uppercase tracking-wider text-[#FF9933] mb-2">Metodologia</p>
        <p className="text-sm text-[#4B5563] leading-relaxed mb-6">{bio}</p>

        <p className="text-xs font-bold uppercase tracking-wider text-[#FF9933] mb-2">Gestion de riesgo</p>
        <p className="text-sm text-[#4B5563] leading-relaxed mb-7">Las apuestas deportivas implican riesgo real. Los resultados pasados no garantizan resultados futuros.</p>

        <div className="space-y-2.5">
          <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="block text-center rounded-2xl bg-[#3FA9B7] text-white font-display font-bold text-sm py-3.5">Telegram &middot; @PredictorRM</a>
          <a href="https://x.com/predictorRM" target="_blank" rel="noopener noreferrer" className="block text-center rounded-2xl bg-[#1F2937] text-white font-display font-bold text-sm py-3.5">X &middot; @predictorRM</a>
        </div>
      </main>

      <nav className="sticky bottom-0 bg-[#F3F1EA]/95 backdrop-blur-sm border-t border-black/15">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-3 flex justify-between text-xs">
          <a href="/" className="text-[#4B5563]">Inicio</a>
          <a href="/resultados" className="text-[#4B5563]">Resultados</a>
          <a href="/estadisticas" className="text-[#4B5563]">Estadisticas</a>
          <a href="/como-funciona" className="text-[#4B5563]">Como funciona</a>
          <span className="font-semibold text-[#1F2937]">Perfil</span>
        </div>
      </nav>
    </div>
  )
}