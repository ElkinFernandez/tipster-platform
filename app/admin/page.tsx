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

  const handleSignOut = async () => {
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
    <div className="min-h-screen bg-[#F9F7F1]">
      {/* HEADER */}
      <header className="sticky top-0 z-10 bg-[#F9F7F1]/95 backdrop-blur-sm border-b border-black/10">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-4 flex justify-between items-center">
          <div>
            <p className="font-display text-lg sm:text-xl font-extrabold text-[#1F2937] leading-none">
              Tipster Platform
            </p>
            <p className="text-xs text-[#9CA3AF] mt-1">Panel de administración</p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="text-sm font-semibold text-[#FF7A8C] px-4 py-2 rounded-full border border-[#FF7A8C]/30 hover:bg-[#FF7A8C]/10 active:scale-95 transition disabled:opacity-50"
          >
            {isSigningOut ? 'Saliendo…' : 'Salir'}
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-8 sm:py-12 space-y-6">

        {/* WELCOME CARD */}
        <section className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-[#FFA94D] mb-2">
            Sesión activa
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1F2937] mb-3">
            Bienvenido, admin
          </h1>
          <p className="text-sm text-[#6B7280] mb-1">
            Conectado como
          </p>
          <p className="text-base font-semibold text-[#1F2937] mb-4">
            {user?.email}
          </p>
          <p className="text-sm text-[#9CA3AF] leading-relaxed">
            Desde aquí gestionarás cada apuesta publicada: crearlas, registrar resultados
            y mantener el historial siempre transparente.
          </p>
        </section>

        {/* STATUS GRID — stacks on mobile, side by side on larger screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <section className="rounded-3xl border border-black/10 bg-white p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#10B981]/10 text-[#10B981] font-bold text-sm">
                ✓
              </span>
              <div>
                <h2 className="font-display text-sm font-bold text-[#1F2937]">
                  Autenticación
                </h2>
                <p className="text-xs text-[#9CA3AF]">Fase 1 · Completa</p>
              </div>
            </div>
            <ul className="text-sm text-[#6B7280] space-y-1 pl-1">
              <li>Inicio de sesión funcional</li>
              <li>Rutas protegidas</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-black/10 bg-white p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3FA9B7]/10 text-[#3FA9B7] font-bold text-sm">
                ···
              </span>
              <div>
                <h2 className="font-display text-sm font-bold text-[#1F2937]">
                  Próximo
                </h2>
                <p className="text-xs text-[#9CA3AF]">Fase 2-3</p>
              </div>
            </div>
            <ul className="text-sm text-[#6B7280] space-y-1 pl-1">
              <li>Crear apuestas</li>
              <li>Registrar resultados</li>
            </ul>
          </section>
        </div>

        {/* QUICK ACTIONS */}
        <section className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8">
          <h2 className="font-display text-sm font-bold text-[#1F2937] mb-4">
            Atajos rápidos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              disabled
              className="rounded-2xl border border-black/10 bg-[#FDFBF8] p-4 text-left opacity-60 cursor-not-allowed"
            >
              <p className="text-sm font-semibold text-[#1F2937]">+ Crear apuesta</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Disponible en Fase 2</p>
            </button>
            <button
              disabled
              className="rounded-2xl border border-black/10 bg-[#FDFBF8] p-4 text-left opacity-60 cursor-not-allowed"
            >
              <p className="text-sm font-semibold text-[#1F2937]">Apuestas pendientes</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Disponible en Fase 3</p>
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