'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { signOutAdmin } from '@/lib/auth/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

function AdminDashboardContent() {
  const router = useRouter()
  const { user } = useAuth()
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
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1F2937] mb-3">Bienvenido, admin</h1>
          <p className="text-sm text-[#4B5563] mb-1">Conectado como</p>
          <p className="text-base font-semibold text-[#1F2937]">{user?.email}</p>
        </section>

        <section className="rounded-3xl border border-black/15 bg-white p-6 sm:p-8">
          <h2 className="font-display text-sm font-bold text-[#1F2937] mb-4">Atajos rapidos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href="/admin/crear" className="rounded-2xl bg-[#FFA94D] p-4 text-left block hover:bg-[#FF9933] transition">
              <p className="text-sm font-bold text-white">+ Crear apuesta</p>
              <p className="text-xs text-white/80 mt-0.5">Publicar un nuevo pronostico</p>
            </a>
            <button disabled className="rounded-2xl border border-black/15 bg-[#F3F1EA] p-4 text-left opacity-50 cursor-not-allowed">
              <p className="text-sm font-bold text-[#1F2937]">Apuestas pendientes</p>
              <p className="text-xs text-[#4B5563] mt-0.5">Disponible en Fase 3</p>
            </button>
          </div>
        </section>

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