import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toTitleCase } from '@/lib/utils'

export interface KnownEntity {
  id: string
  name: string
  usage_count: number
}

export function useKnownEntities(entityType: 'COMPETITOR' | 'LEAGUE', sport: string) {
  const [entities, setEntities] = useState<KnownEntity[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEntities = useCallback(async function () {
    try {
      setLoading(true)
      const supabase = createClient()

      const result = await supabase
        .from('known_entities')
        .select('id, name, usage_count')
        .eq('entity_type', entityType)
        .eq('sport', sport)
        .order('usage_count', { ascending: false })
        .order('name', { ascending: true })

      if (result.error) throw result.error

      setEntities(result.data || [])
    } catch (err) {
      console.error('Error cargando entidades conocidas:', err)
    } finally {
      setLoading(false)
    }
  }, [entityType, sport])

  useEffect(function () {
    if (sport) {
      fetchEntities()
    }
  }, [fetchEntities, sport])

  const registerEntity = async function (name: string) {
    const clean = toTitleCase(name)
    if (!clean) return

    try {
      const supabase = createClient()

      const existing = entities.find(function (e) { return e.name === clean })

      if (existing) {
        await supabase
          .from('known_entities')
          .update({ usage_count: existing.usage_count + 1 })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('known_entities')
          .insert({ entity_type: entityType, sport: sport, name: clean, usage_count: 1 })
      }
    } catch (err) {
      console.error('Error registrando entidad:', err)
    }
  }

  return { entities, loading, registerEntity, refetch: fetchEntities }
}