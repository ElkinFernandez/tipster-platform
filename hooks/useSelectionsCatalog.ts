import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toTitleCase } from '@/lib/utils'
import { CatalogItem } from '@/hooks/useMarketsCatalog'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export function useSelectionsCatalog(marketId: string) {
  const [selections, setSelections] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSelections = useCallback(async function () {
    try {
      setLoading(true)
      const supabase = createClient()

      const result = await supabase
        .from('market_selections')
        .select('id, selection_name')
        .eq('sport_market_id', marketId)
        .order('display_order', { ascending: true })

      if (result.error) throw result.error

      setSelections((result.data || []).map(function (s) { return { id: s.id, name: s.selection_name } }))
    } catch (err) {
      console.error('Error cargando selecciones:', err)
    } finally {
      setLoading(false)
    }
  }, [marketId])

  useEffect(function () {
    if (marketId) {
      fetchSelections()
    } else {
      setSelections([])
      setLoading(false)
    }
  }, [fetchSelections, marketId])

  const createSelection = async function (name: string) {
    const clean = toTitleCase(name)
    if (!clean || !marketId) return null

    const existing = selections.find(function (s) { return s.name.toLowerCase() === clean.toLowerCase() })
    if (existing) return existing

    try {
      const supabase = createClient()
      const key = slugify(clean) + '_' + Date.now()

      const insertResult = await supabase
        .from('market_selections')
        .insert({ sport_market_id: marketId, selection_name: clean, selection_key: key, display_order: 999 })
        .select('id, selection_name')
        .single()

      if (insertResult.error) throw insertResult.error

      const newItem = { id: insertResult.data.id, name: insertResult.data.selection_name }
      await fetchSelections()
      return newItem
    } catch (err) {
      console.error('Error creando seleccion:', err)
      return null
    }
  }

  return { selections, loading, createSelection }
}