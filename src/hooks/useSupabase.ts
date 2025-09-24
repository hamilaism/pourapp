import { supabase } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const WORKSPACE_ID = '6f1c0ad8-02f8-4b04-97dd-8de0c63e6202'

export const useIngredients = () => {
  return useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredient')
        .select('*')
        .eq('workspace_id', WORKSPACE_ID)
        .order('name')
      
      if (error) throw error
      return data || []
    }
  })
}

export const useCreateIngredient = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (ingredient: any) => {
      const { data, error } = await supabase
        .from('ingredient')
        .insert({
          ...ingredient,
          workspace_id: WORKSPACE_ID
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
    }
  })
}

// Hook pour calculer les taxes
export const useCalculateExcise = (volume_ml: number, abv: number) => {
  return useQuery({
    queryKey: ['excise', volume_ml, abv],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('calculate_bottle_excise', {
          volume_ml,
          abv_pct: abv
        })
      
      if (error) throw error
      return data?.[0]
    },
    enabled: volume_ml > 0 && abv > 0
  })
}

// Hook pour récupérer les recettes
export const useRecipes = () => {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cookbook_item')
        .select(`
          *,
          recipe_version(*)
        `)
        .eq('workspace_id', WORKSPACE_ID)
        .order('name')
      
      if (error) throw error
      return data || []
    }
  })
}
