'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { useDashboardSummary } from '@/hooks/useDashboardSummary'
import { signOutAdmin } from '@/lib/auth/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

function formatUnits(value: number): string {
  const sign = value > 0 ? '+' : ''
  return sign + value.toFixed(2) + 'u'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function AdminDashboardContent() {
  const router = useRouter()
  const { user } = useAuth()
  const { todayCount, todayWon, todayProfit, pendingCount, weekCount, nextPending, loading } = useDashboardSummary()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignOut() {
    try {
      setIsSigningOut(true)
      await signOutAdmin()
      router.push('/auth/login')
    } catch (err) {
      console.error('Error signing out:', err)
      setIsSigningOut(false)
    }
  }

  const profitColor = todayProfit >= 0 ? '#10B981' : '#FF7A8C'

  return (
    <div className="min-h-screen bg-[#F3F1EA]">
      <header className="sticky top-0 z-10 bg-[#F3F1EA]/95 backdrop-blur-sm border-b border-black/15">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-4 flex justify-between items-center">
          <div>
            <p className="font-display text-lg sm:text-xl font-extrabold text-[#1F2937] leading-none">Tipster Platform</p>
            <p className="text-xs text-[#4B5563] mt-1">Panel de administracion</p>
          </div>
          <button onClick={handleSignOut} disabled={isSigningOut} className="text-sm font-bold text-[#E23A52] px-4 py-2 rounded-full border border-[#E23A52]/40 hover:bg-[#E23A52]/10 active:scale-95 transition disabled:opacity-50">
            {isSigningOut ? 'Saliendo...' : 'Salir'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-8 sm:py-12 space-y-6">

        <section className="rounded-3xl border border-black/15 bg-white p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-[#FFA94D] mb-2">Sesion activa</p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1F2937] mb-3">Gestion de apuestas</h1>
          <p className="text-sm text-[#4B5563]">Conectado como <span className="font-semibold text-[#1F2937]">{user?.email}</span></p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a href="/admin/crear" className="rounded-2xl bg-[#FFA94D] p-5 block hover:bg-[#FF9933] transition">
            <p className="text-sm font-bold text-white">+ Crear apuesta</p>
            <p className="text-xs text-white/80 mt-0.5">Publicar un nuevo pronostico</p>
          </a>
          <a href="/admin/pendientes" className="rounded-2xl border border-black/15 bg-white p-5 block hover:bg-[#F3F1EA] transition">
            <p className="text-sm font-bold text-[#1F2937]">Registrar resultados {loading ? '' : '(' + pendingCount + ')'}</p>
            <p className="text-xs text-[#4B5563] mt-0.5">Ver lista completa de pendientes</p>
          </a>
        </section>

        <a href="/admin/apuestas" className="rounded-2xl border border-black/15 bg-white p-5 block hover:bg-[#F3F1EA] transition">
          <p className="text-sm font-bold text-[#1F2937]">Ver todas las apuestas</p>
          <p className="text-xs text-[#4B5563] mt-0.5">Historial completo: editar resultados o eliminar</p>
        </a>

        <section className="rounded-3xl border border-black/15 bg-white p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-4">Resumen de hoy</p>

          {loading && <p className="text-sm text-[#4B5563]">Cargando...</p>}

          {!loading && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="font-display text-2xl font-extrabold text-[#1F2937]">{todayCount}</p>
                <p className="text-xs text-[#4B5563] mt-1">Apuestas hoy</p>
              </div>
              <div>
                <p className="font-display text-2xl font-extrabold text-[#10B981]">{todayWon}</p>
                <p className="text-xs text-[#4B5563] mt-1">Ganadas</p>
              </div>
              <div>
                <p className="font-display text-2xl font-extrabold" style={{ color: profitColor }}>{formatUnits(todayProfit)}</p>
                <p className="text-xs text-[#4B5563] mt-1">Profit</p>
              </div>
              <div>
                <p className="font-display text-2xl font-extrabold text-[#3FA9B7]">{pendingCount}</p>
                <p className="text-xs text-[#4B5563] mt-1">Pendientes</p>
              </div>
            </div>
          )}
        </section>

        {!loading && nextPending && (
          <section className="rounded-3xl border border-black/15 bg-white p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-3">Acceso rapido: la mas antigua sin registrar</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#1F2937]">{nextPending.type} - {formatDate(nextPending.created_at)}</p>
                <p className="text-xs text-[#4B5563] mt-0.5">Cuota {Number(nextPending.odds_combined).toFixed(2)} - Stake {Number(nextPending.stake).toFixed(1)}u</p>
              </div>
              <a href={'/admin/registrar/' + nextPending.id} className="rounded-xl bg-[#1F2937] text-white text-xs font-bold px-4 py-2.5 whitespace-nowrap">Registrar</a>
            </div>
          </section>
        )}

        {!loading && (
          <p className="text-xs text-[#4B5563] text-center">Ultimos 7 dias: {weekCount} {weekCount === 1 ? 'apuesta' : 'apuestas'}</p>
        )}

      </main>
    </div>
  )
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}