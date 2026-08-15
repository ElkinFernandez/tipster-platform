import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useFixResultDate() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fixDate = async function (betId: string, newDate: string) {
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const isoDate = new Date(newDate).toISOString()

      const betUpdate = await supabase.from('bets').update({ result_at: isoDate }).eq('id', betId)
      if (betUpdate.error) throw new Error(betUpdate.error.message)

      setSaving(false)
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      setSaving(false)
      return { success: false }
    }
  }

  return { fixDate, saving, error }
}