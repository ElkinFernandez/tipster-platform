'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { usePendingBets } from '@/hooks/usePendingBets'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function PendientesContent() {
  const { bets, loading } = usePendingBets()

  return (
    <div className="min-h-screen bg-[#F3F1EA]">
      <header className="sticky top-0 z-10 bg-[#F3F1EA]/95 backdrop-blur-sm border-b border-black/15">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center gap-3">
          <a href="/admin" className="text-sm text-[#4B5563] font-medium">Volver</a>
          <span className="font-display font-bold text-[#1F2937] text-sm sm:text-base">Apuestas pendientes</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 sm:px-8 py-6">

        {loading && <p className="text-sm text-[#4B5563]">Cargando...</p>}

        {!loading && bets.length === 0 && (
          <div className="rounded-3xl border border-black/15 bg-white p-8 text-center">
            <p className="text-sm text-[#4B5563]">No hay apuestas pendientes de resultado.</p>
          </div>
        )}

        {!loading && bets.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-[#4B5563] mb-4">{bets.length} apuestas esperando resultado</p>
            <div className="space-y-3">
              {bets.map(function (bet) {
                const url = '/admin/registrar/' + bet.id
                return (
                  <a key={bet.id} href={url} className="block rounded-2xl border border-black/15 bg-white p-4 hover:bg-[#F3F1EA] transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wide text-[#3FA9B7] bg-[#3FA9B7]/15 rounded-full px-2.5 py-1">{bet.type}</span>
                        <p className="text-sm font-semibold text-[#1F2937] mt-2">{formatDate(bet.created_at)}</p>
                        <p className="text-xs text-[#4B5563]">Cuota {Number(bet.odds_combined).toFixed(2)} - Stake {Number(bet.stake).toFixed(1)}u</p>
                      </div>
                      <span className="text-sm font-bold text-[#FFA94D]">Registrar</span>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default function PendientesPage() {
  return (
    <ProtectedRoute>
      <PendientesContent />
    </ProtectedRoute>
  )
}