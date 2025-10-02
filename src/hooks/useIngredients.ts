"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface Ingredient {
  id: string
  name: string
  category: string
  unit_base: 'g' | 'ml'
  unit_stock?: string
  unit_recipe?: string
  unit_type?: 'volume' | 'weight' | 'unit'
  density?: number
  abv?: number
  shelf_life_days?: number
  is_perishable?: boolean
  min_stock?: number
  max_stock?: number
  alert_threshold?: number
  ph?: number
  brix?: number
  carbonation_bar?: number
  created_at: string
  updated_at: string
}

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchIngredients() {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('ingredient')
          .select('*')
          .order('name', { ascending: true })

        if (error) throw error

        setIngredients(data || [])
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching ingredients:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchIngredients()
  }, [])

  return { ingredients, isLoading, error, refetch: () => {} }
}
