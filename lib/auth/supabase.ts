import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export interface AuthError {
  message: string
  status?: number
}

export async function signInAdmin(
  email: string,
  password: string
): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        user: null,
        error: { message: error.message, status: error.status },
      }
    }

    return { user: data.user, error: null }
  } catch (err) {
    return {
      user: null,
      error: { message: err instanceof Error ? err.message : 'Unknown error' },
    }
  }
}

export async function signOutAdmin(): Promise<{ error: AuthError | null }> {
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { error: { message: error.message, status: error.status } }
    }

    return { error: null }
  } catch (err) {
    return {
      error: { message: err instanceof Error ? err.message : 'Unknown error' },
    }
  }
}

export async function getCurrentUser() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      return { user: null, error: { message: error.message } }
    }

    return { user: data.user, error: null }
  } catch (err) {
    return {
      user: null,
      error: { message: err instanceof Error ? err.message : 'Unknown error' },
    }
  }
}