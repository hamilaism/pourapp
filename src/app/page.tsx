'use client'

import { useIngredients } from '@/hooks/useSupabase'

export default function Home() {
  const { data: ingredients, isLoading, error } = useIngredients()

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl">Chargement des ingrédients...</p>
    </div>
  )
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl text-red-500">Erreur: {error.message}</p>
    </div>
  )

  return (
    <main className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🍹 PourApp</h1>
        <p className="text-gray-600">Gestion des ingrédients - {ingredients?.length || 0} éléments</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ingredients?.map((ing) => (
          <div key={ing.id} className="border border-gray-200 p-4 rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="font-bold text-lg mb-2">{ing.name}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>📏 Unité: <span className="font-medium">{ing.unit_base}</span></p>
              {ing.abv && <p>🍺 ABV: <span className="font-medium">{ing.abv}%</span></p>}
              {ing.density && <p>⚖️ Densité: <span className="font-medium">{ing.density}</span></p>}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
