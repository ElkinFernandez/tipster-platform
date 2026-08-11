'use client'

import { useParams } from 'next/navigation'
import { useBetDetail } from '@/hooks/useBetDetail'

function formatUnits(value: number): string {
  const sign = value > 0 ? '+' : ''
  return sign + value.toFixed(2) + 'u'
}

function formatDateFull(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const statusColor: Record<string, string> = {
  WIN: '#10B981',
  PARTIAL_WIN: '#10B981',
  LOSS: '#FF7A8C',
  VOID: '#9CA3AF',
  PENDING: '#3FA9B7',
}

const statusLabel: Record<string, string> = {
  WIN: 'GANADO',
  PARTIAL_WIN: 'GANANCIA PARCIAL',
  LOSS: 'PERDIDO',
  VOID: 'ANULADO',
  PENDING: 'PENDIENTE',
}

const legStatusLabel: Record<string, string> = {
  WIN: 'Gano',
  LOSS: 'Perdio',
  VOID: 'Anulado',
}

const sportLabel: Record<string, string> = {
  FOOTBALL: 'Futbol',
  TENNIS: 'Tenis',
  BASKETBALL: 'Basquet',
}

export default function DetalleApuestaPage() {
  const params = useParams()
  const betId = String(params.id)
  const { bet, legs, loading } = useBetDetail(betId)

  return (
    <div className="min-h-screen bg-[#F9F7F1]">
      <header className="bg-[#1F2937] text-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center gap-3">
          <a href="/resultados" className="text-white/70 text-sm">Volver</a>
          <span className="font-display font-bold tracking-wide text-sm sm:text-base">Detalle del pronostico</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 sm:px-8 py-8">
        {loading && <p className="text-sm text-[#9CA3AF]">Cargando...</p>}

        {!loading && !bet && (
          <div className="rounded-3xl border border-black/10 bg-white p-8 text-center">
            <p className="text-sm text-[#9CA3AF]">No se encontro este pronostico.</p>
          </div>
        )}

        {!loading && bet && (
          <div>
            <div className="rounded-3xl overflow-hidden border border-black/10 mb-6">
              <div className="p-6" style={{ backgroundColor: '#1F2937' }}>
                <p className="text-xs uppercase tracking-wider text-white/50 mb-2">
                  {bet.type} - Cuota {Number(bet.odds_combined).toFixed(2)} - Stake {Number(bet.stake).toFixed(1)}u
                </p>
                <p className="font-display text-3xl sm:text-4xl font-extrabold" style={{ color: statusColor[bet.status] }}>
                  {statusLabel[bet.status]} {formatUnits(Number(bet.profit))}
                </p>
              </div>
            </div>

            <p className="text-xs font-bold uppercase tracking-wider text-[#FFA94D] mb-1">Trazabilidad</p>
            <h2 className="font-display text-lg font-bold text-[#1F2937] mb-4">Linea de tiempo</h2>

            <div className="space-y-3 mb-8 text-sm">
              <div className="flex justify-between border-b border-black/10 pb-2">
                <span className="text-[#9CA3AF]">Publicado</span>
                <span className="text-[#1F2937] font-medium">{formatDateFull(bet.created_at)}</span>
              </div>
              {bet.result_at && (
                <div className="flex justify-between border-b border-black/10 pb-2">
                  <span className="text-[#9CA3AF]">Resultado registrado</span>
                  <span className="text-[#1F2937] font-medium">{formatDateFull(bet.result_at)}</span>
                </div>
              )}
            </div>

            <p className="text-xs font-bold uppercase tracking-wider text-[#FFA94D] mb-1">Eventos</p>
            <h2 className="font-display text-lg font-bold text-[#1F2937] mb-4">
              {legs.length} {legs.length === 1 ? 'evento' : 'eventos'} en esta apuesta
            </h2>

            <div className="space-y-3 mb-8">
              {legs.map(function (leg) {
                const color = statusColor[leg.status] || '#1F2937'
                const label = legStatusLabel[leg.status] || leg.status
                const sport = sportLabel[leg.sport] || leg.sport
                return (
                  <div key={leg.id} className="rounded-2xl border border-black/10 bg-white p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-[#3FA9B7] bg-[#3FA9B7]/10 rounded-full px-2.5 py-1">{sport} - {leg.league}</span>
                      <span className="text-xs font-bold" style={{ color: color }}>{label}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1F2937] mb-1">{leg.competitor_1} vs {leg.competitor_2}</p>
                    <p className="text-xs text-[#9CA3AF]">{leg.market}: {leg.selection} - Cuota {Number(leg.odds).toFixed(2)}</p>
                  </div>
                )
              })}
            </div>

            {bet.notes && (
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-wider text-[#FFA94D] mb-1">Notas</p>
                <p className="text-sm text-[#6B7280] leading-relaxed">{bet.notes}</p>
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="sticky bottom-0 bg-[#F9F7F1]/95 backdrop-blur-sm border-t border-black/10">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-3 flex justify-between text-xs">
          <a href="/" className="text-[#9CA3AF]">Inicio</a>
          <a href="/resultados" className="text-[#9CA3AF]">Resultados</a>
          <a href="/estadisticas" className="text-[#9CA3AF]">Estadisticas</a>
          <a href="/perfil" className="text-[#9CA3AF]">Perfil</a>
        </div>
      </nav>
    </div>
  )
}