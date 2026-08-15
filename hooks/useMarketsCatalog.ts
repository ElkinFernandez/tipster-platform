import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toTitleCase } from '@/lib/utils'

export interface CatalogItem {
  id: string
  name: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as { message: unknown }).message
    if (msg) return String(msg)
  }
  return 'Error desconocido al crear mercado'
}

export function useMarketsCatalog(sport: string) {
  const [markets, setMarkets] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMarkets = useCallback(async function () {
    try {
      setLoading(true)
      const supabase = createClient()

      const result = await supabase
        .from('sport_markets')
        .select('id, market_name, market_key')
        .eq('sport', sport)
        .order('display_order', { ascending: true })

      if (result.error) throw result.error

      const filtered = (result.data || []).filter(function (m) {
        return m.market_key.toLowerCase() !== 'otro'
      })

      setMarkets(filtered.map(function (m) { return { id: m.id, name: m.market_name } }))
    } catch (err) {
      console.error('Error cargando mercados:', getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [sport])

  useEffect(function () {
    if (sport) fetchMarkets()
  }, [fetchMarkets, sport])

  const createMarket = async function (name: string) {
    const clean = toTitleCase(name)
    if (!clean) return null

    const existing = markets.find(function (m) { return m.name.toLowerCase() === clean.toLowerCase() })
    if (existing) return existing

    try {
      const supabase = createClient()
      const key = slugify(clean) + '_' + Date.now()

      const insertResult = await supabase
        .from('sport_markets')
        .insert({ sport: sport, market_name: clean, market_key: key, market_category: 'CUSTOM', display_order: 999 })
        .select('id, market_name')
        .single()

      if (insertResult.error) {
        console.error('Error de Supabase al crear mercado:', JSON.stringify(insertResult.error))
        throw new Error(getErrorMessage(insertResult.error))
      }

      const newItem = { id: insertResult.data.id, name: insertResult.data.market_name }
      await fetchMarkets()
      return newItem
    } catch (err) {
      console.error('Error creando mercado:', getErrorMessage(err))
      return null
    }
  }

  return { markets, loading, createMarket }
}