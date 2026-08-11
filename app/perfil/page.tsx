'use client'

import { useTipster } from '@/hooks/useTipster'
import { useHomeStats } from '@/hooks/useStats'

export default function PerfilPage() {
  const { tipster, loading: loadingTipster } = useTipster()
  const { stats, loading: loadingStats } = useHomeStats()

  const displayName = tipster?.name || 'Tipster'
  const bio = tipster?.bio || 'Este tipster aun no ha escrito su metodologia.'
  const telegramUrl = tipster?.telegram_url
  const instagramUrl = tipster?.instagram_url

  return (
    <div className="min-h-screen bg-[#F9F7F1]">
      <header className="bg-[#1F2937] text-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <a href="/" className="font-display font-bold tracking-wide text-sm sm:text-base">TIPSTER PLATFORM</a>
          <span className="text-xs text-white/50">EST. 2025</span>
        </div>
      </header>

      <section className="bg-[#1F2937] text-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-8 pb-12 text-center">
          <div className="h-20 w-20 rounded-full border-2 border-white/20 mx-auto mb-4"></div>
          <h1 className="font-display text-2xl font-extrabold">
            {loadingTipster ? '...' : displayName}
          </h1>
          <p className="text-sm text-white/50 mt-1">
            {loadingStats ? '' : stats.total_bets + ' pronosticos publicados'}
          </p>
        </div>
      </section>

      <main className="max-w-2xl mx-auto px-5 sm:px-8 py-8">
        <p className="text-xs font-bold uppercase tracking-wider text-[#FFA94D] mb-2">Metodologia</p>
        <p className="text-sm text-[#6B7280] leading-relaxed mb-8">
          {bio}
        </p>

        <p className="text-xs font-bold uppercase tracking-wider text-[#FFA94D] mb-2">Gestion de riesgo</p>
        <p className="text-sm text-[#6B7280] leading-relaxed mb-8">
          Las apuestas deportivas implican riesgo real. Los resultados pasados no garantizan resultados futuros.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          {telegramUrl && (
            <a href={telegramUrl} className="rounded-2xl bg-[#FFA94D] text-white font-bold text-sm py-3 px-6 text-center">Telegram</a>
          )}
          {instagramUrl && (
            <a href={instagramUrl} className="rounded-2xl border border-black/15 text-[#1F2937] font-bold text-sm py-3 px-6 text-center">Instagram</a>
          )}
          {!telegramUrl && !instagramUrl && (
            <p className="text-xs text-[#9CA3AF] italic">Este tipster aun no agrego sus redes sociales.</p>
          )}
        </div>
      </main>

      <nav className="sticky bottom-0 bg-[#F9F7F1]/95 backdrop-blur-sm border-t border-black/10">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-3 flex justify-between text-xs">
          <a href="/" className="text-[#9CA3AF]">Inicio</a>
          <a href="/resultados" className="text-[#9CA3AF]">Resultados</a>
          <a href="/estadisticas" className="text-[#9CA3AF]">Estadisticas</a>
          <span className="font-semibold text-[#1F2937]">Perfil</span>
        </div>
      </nav>
    </div>
  )
}