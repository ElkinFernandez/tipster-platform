import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useDeleteBet() {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteBet = async function (betId: string) {
    setDeleting(true)
    setError(null)

    try {
      const supabase = createClient()

      const legsDelete = await supabase.from('bet_legs').delete().eq('bet_id', betId)
      if (legsDelete.error) throw new Error(legsDelete.error.message)

      const betDelete = await supabase.from('bets').delete().eq('id', betId)
      if (betDelete.error) throw new Error(betDelete.error.message)

      setDeleting(false)
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      setDeleting(false)
      return { success: false }
    }
  }

  return { deleteBet, deleting, error }
}