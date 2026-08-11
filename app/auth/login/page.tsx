'use client'

import { FormEvent, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signInAdmin } from '@/lib/auth/supabase'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted && !loading && isAuthenticated) {
      router.push('/admin')
    }
  }, [isMounted, loading, isAuthenticated, router])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos')
      }

      const { user, error: authError } = await signInAdmin(email, password)

      if (authError) {
        throw new Error(authError.message)
      }

      if (!user) {
        throw new Error('Error desconocido en autenticación')
      }

      router.push('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en login')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isMounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F9F7F1]">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-4 border-[#FFA94D]/20 border-t-[#FFA94D] animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#9CA3AF]">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F9F7F1]">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-[#1F2937] mb-2">
            Tipster Platform
          </h1>
          <p className="text-sm text-[#9CA3AF]">
            Admin Panel • Gestión de apuestas
          </p>
        </div>

        <div className="border border-[rgba(31,46,55,0.12)] rounded-3xl p-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#1F2937] mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 border border-[rgba(31,46,55,0.12)] rounded-2xl 
                           bg-[#FDFBF8] text-[#1F2937] placeholder-[#9CA3AF]
                           focus:outline-none focus:border-[#FFA94D] focus:ring-1 focus:ring-[#FFA94D]
                           transition-colors"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#1F2937] mb-2"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-[rgba(31,46,55,0.12)] rounded-2xl 
                           bg-[#FDFBF8] text-[#1F2937] placeholder-[#9CA3AF]
                           focus:outline-none focus:border-[#FFA94D] focus:ring-1 focus:ring-[#FFA94D]
                           transition-colors"
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-[#FF7A8C]/10 border border-[#FF7A8C]/20">
                <p className="text-sm text-[#FF7A8C] font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !email || !password}
              className="w-full py-3 px-4 rounded-2xl font-bold text-white
                         bg-[#FFA94D] hover:bg-[#FF9933] disabled:bg-[#9CA3AF] disabled:cursor-not-allowed
                         transition-colors duration-200"
            >
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[rgba(31,46,55,0.12)]">
            <p className="text-xs text-[#9CA3AF] text-center">
              Solo administradores pueden acceder a este panel
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}