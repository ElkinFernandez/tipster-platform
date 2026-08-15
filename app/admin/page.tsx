'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { useDashboardSummary } from '@/hooks/useDashboardSummary'
import { signOutAdmin } from '@/lib/auth/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

function AdminDashboardContent() {
  const router = useRouter()
  const { user } = useAuth()
  const { todayCount, pendingCount, weekCount, loading } = useDashboardSummary()
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
          <a href="/admin/eventos-pendientes" className="rounded-2xl border border-black/15 bg-white p-5 block hover:bg-[#F3F1EA] transition">
            <p className="text-sm font-bold text-[#1F2937]">Eventos pendientes</p>
            <p className="text-xs text-[#4B5563] mt-0.5">Resolver eventos compartidos</p>
          </a>
        </section>

        <a href="/admin/apuestas" className="rounded-2xl border border-black/15 bg-white p-5 block hover:bg-[#F3F1EA] transition">
          <p className="text-sm font-bold text-[#1F2937]">Ver todas las apuestas {loading ? '' : '(' + pendingCount + ' sin resultado)'}</p>
          <p className="text-xs text-[#4B5563] mt-0.5">Crear, editar, registrar resultados o eliminar</p>
        </a>

        <section className="rounded-3xl border border-black/15 bg-white p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-4">Actividad</p>

          {loading && <p className="text-sm text-[#4B5563]">Cargando...</p>}

          {!loading && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="font-display text-2xl font-extrabold text-[#1F2937]">{todayCount}</p>
                <p className="text-xs text-[#4B5563] mt-1">Publicadas hoy</p>
              </div>
              <div>
                <p className="font-display text-2xl font-extrabold text-[#3FA9B7]">{pendingCount}</p>
                <p className="text-xs text-[#4B5563] mt-1">Sin resultado</p>
              </div>
              <div>
                <p className="font-display text-2xl font-extrabold text-[#1F2937]">{weekCount}</p>
                <p className="text-xs text-[#4B5563] mt-1">Ultimos 7 dias</p>
              </div>
            </div>
          )}
        </section>

        <a href="/estadisticas" className="text-xs text-[#4B5563] text-center block">Ver rendimiento y estadisticas completas &rarr;</a>

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