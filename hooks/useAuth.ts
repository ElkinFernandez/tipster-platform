'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: Error | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  })

  const supabase = createClient()

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error

        setState(prev => ({
          ...prev,
          session: data.session,
          user: data.session?.user || null,
          loading: false,
        }))
      } catch (err) {
        setState(prev => ({
          ...prev,
          error: err instanceof Error ? err : new Error('Auth error'),
          loading: false,
        }))
      }
    }

    getInitialSession()
  }, [supabase])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user || null,
        loading: false,
        error: null,
      }))
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const isAuthenticated = useCallback(() => {
    return state.user !== null && state.session !== null
  }, [state])

  return {
    user: state.user,
    session: state.session,
    loading: state.loading,
    error: state.error,
    isAuthenticated: isAuthenticated(),
  }
}