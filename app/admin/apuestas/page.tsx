'use client'

import { useState } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAllBetsAdmin } from '@/hooks/useAllBetsAdmin'
import { useDeleteBet } from '@/hooks/useDeleteBet'

function formatUnits(value: number): string {
  const sign = value > 0 ? '+' : ''
  return sign + value.toFixed(2) + 'u'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const statusColor: Record<string, string> = {
  WIN: '#10B981',
  PARTIAL_WIN: '#10B981',
  LOSS: '#FF7A8C',
  VOID: '#9CA3AF',
  PENDING: '#3FA9B7',
}

const statusLabel: Record<string, string> = {
  WIN: 'Gano',
  PARTIAL_WIN: 'Parcial',
  LOSS: 'Perdio',
  VOID: 'Anulado',
  PENDING: 'Pendiente',
}

function AllBetsContent() {
  const { bets, loading, refetch } = useAllBetsAdmin()
  const { deleteBet, deleting } = useDeleteBet()
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  async function handleDelete(betId: string) {
    const result = await deleteBet(betId)
    if (result.success) {
      setConfirmingId(null)
      refetch()
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F1EA]">
      <header className="sticky top-0 z-10 bg-[#F3F1EA]/95 backdrop-blur-sm border-b border-black/15">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center gap-3">
          <a href="/admin" className="text-sm text-[#4B5563] font-medium">Volver</a>
          <span className="font-display font-bold text-[#1F2937] text-sm sm:text-base">Todas las apuestas</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 sm:px-8 py-6">

        {loading && <p className="text-sm text-[#4B5563]">Cargando...</p>}

        {!loading && bets.length === 0 && (
          <div className="rounded-3xl border border-black/15 bg-white p-8 text-center">
            <p className="text-sm text-[#4B5563]">No hay apuestas registradas todavia.</p>
          </div>
        )}

        {!loading && bets.length > 0 && (
          <div className="space-y-3">
            {bets.map(function (bet) {
              const color = statusColor[bet.status] || '#1F2937'
              const label = statusLabel[bet.status] || bet.status
              const isConfirming = confirmingId === bet.id
              const canEdit = bet.status !== 'PENDING'

              return (
                <div key={bet.id} className="rounded-2xl border border-black/15 bg-white p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wide text-[#3FA9B7] bg-[#3FA9B7]/15 rounded-full px-2.5 py-1">{bet.type}</span>
                      <p className="text-sm font-semibold text-[#1F2937] mt-2">{formatDate(bet.created_at)}</p>
                      <p className="text-xs text-[#4B5563]">Cuota {Number(bet.odds_combined).toFixed(2)} - Stake {Number(bet.stake).toFixed(1)}u</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold" style={{ color: color }}>{label}</p>
                      {bet.status !== 'PENDING' && (
                        <p className="text-sm font-bold" style={{ color: color }}>{formatUnits(Number(bet.profit))}</p>
                      )}
                    </div>
                  </div>

                  {!isConfirming && (
                    <div className="flex gap-2 pt-3 border-t border-black/10">
                      <a href={'/admin/registrar/' + bet.id} className="flex-1 text-center rounded-xl border border-black/15 text-xs font-bold text-[#1F2937] py-2">
                        {canEdit ? 'Editar resultado' : 'Registrar resultado'}
                      </a>
                      <button onClick={function () { setConfirmingId(bet.id) }} className="flex-1 rounded-xl border border-[#E23A52]/40 text-xs font-bold text-[#E23A52] py-2">
                        Eliminar
                      </button>
                    </div>
                  )}

                  {isConfirming && (
                    <div className="pt-3 border-t border-black/10">
                      <p className="text-xs text-[#4B5563] mb-3">Esta accion no se puede deshacer. Se borrara la apuesta y todos sus eventos.</p>
                      <div className="flex gap-2">
                        <button onClick={function () { setConfirmingId(null) }} className="flex-1 rounded-xl border border-black/15 text-xs font-bold text-[#1F2937] py-2">
                          Cancelar
                        </button>
                        <button onClick={function () { handleDelete(bet.id) }} disabled={deleting} className="flex-1 rounded-xl bg-[#E23A52] text-xs font-bold text-white py-2 disabled:opacity-50">
                          {deleting ? 'Borrando...' : 'Si, eliminar'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </main>
    </div>
  )
}

export default function AllBetsPage() {
  return (
    <ProtectedRoute>
      <AllBetsContent />
    </ProtectedRoute>
  )
}