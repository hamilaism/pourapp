"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useIngredients } from "@/hooks/useIngredients"
import {
  Plus,
  Search,
  Snowflake,
  Droplets,
  Package,
  Home,
  Filter,
  SortAsc,
  AlertTriangle,
  X,
  TrendingUp,
  Euro,
  AlertCircle,
  XCircle,
  FileX,
  Loader2,
} from "lucide-react"

const categoryColors: Record<string, string> = {
  Spiritueux: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Liqueurs: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  Fruits: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Sirops: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  Autres: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
}

const StorageIcon = ({ type }: { type?: string }) => {
  switch (type) {
    case "freezer":
      return <Snowflake className="h-4 w-4 text-blue-500" />
    case "fridge":
      return <Droplets className="h-4 w-4 text-blue-400" />
    case "dry":
      return <Package className="h-4 w-4 text-gray-500" />
    case "ambient":
      return <Home className="h-4 w-4 text-gray-500" />
    default:
      return <Package className="h-4 w-4 text-gray-500" />
  }
}

export default function IngredientsPageSupabase() {
  const { ingredients, isLoading, error } = useIngredients()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("Tous")
  const [sortBy, setSortBy] = useState("Nom A-Z")

  // Filtrage et tri
  const filteredIngredients = ingredients
    .filter((ingredient) => {
      const matchesSearch =
        ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ingredient.category?.toLowerCase() || "").includes(searchTerm.toLowerCase())

      const matchesCategory = categoryFilter === "Tous" || ingredient.category === categoryFilter

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "Nom Z-A":
          return b.name.localeCompare(a.name)
        case "Catégorie":
          return (a.category || "").localeCompare(b.category || "")
        case "Nom A-Z":
        default:
          return a.name.localeCompare(b.name)
      }
    })

  // Statistiques
  const totalIngredients = ingredients.length
  const alertsCount = ingredients.filter((i) => i.is_perishable && i.shelf_life_days && i.shelf_life_days < 7).length
  const lowStockCount = ingredients.filter((i) => i.min_stock && i.min_stock > 0).length

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Chargement des ingrédients...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Erreur de chargement</h2>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-foreground">Ingrédients</h1>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un ingrédient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-80"
              />
            </div>

            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Nouvel ingrédient
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total ingrédients</p>
              <p className="text-xl font-semibold">{totalIngredients}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Euro className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valeur stock</p>
              <p className="text-xl font-semibold">-</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Alertes</p>
              <p className="text-xl font-semibold text-amber-600 dark:text-amber-400">{alertsCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stock faible</p>
              <p className="text-xl font-semibold text-red-600 dark:text-red-400">{lowStockCount}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filtres:</span>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:gap-4 flex-1">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tous">Tous</SelectItem>
                <SelectItem value="Spiritueux">Spiritueux</SelectItem>
                <SelectItem value="Liqueurs">Liqueurs</SelectItem>
                <SelectItem value="Fruits">Fruits</SelectItem>
                <SelectItem value="Sirops">Sirops</SelectItem>
                <SelectItem value="Autres">Autres</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SortAsc className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nom A-Z">Nom A-Z</SelectItem>
                <SelectItem value="Nom Z-A">Nom Z-A</SelectItem>
                <SelectItem value="Catégorie">Catégorie</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCategoryFilter("Tous")
                setSortBy("Nom A-Z")
                setSearchTerm("")
              }}
              className="text-muted-foreground hover:text-foreground bg-transparent w-full lg:w-auto"
            >
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* Liste des ingrédients */}
        {filteredIngredients.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6">
              <FileX className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Aucun ingrédient trouvé</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchTerm
                ? `Aucun résultat pour "${searchTerm}". Essayez d'ajuster vos filtres ou votre recherche.`
                : "Aucun ingrédient dans la base de données. Créez-en un pour commencer !"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
            {filteredIngredients.map((ingredient) => (
              <Card
                key={ingredient.id}
                className="border rounded-xl p-4 hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all duration-200 bg-white cursor-pointer flex flex-col h-full"
              >
                <div className="pb-3">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold text-foreground leading-tight">{ingredient.name}</h3>
                    <div className="flex items-center gap-2">
                      <StorageIcon type={ingredient.unit_type} />
                      <span className="text-xs text-muted-foreground">
                        {ingredient.unit_stock || ingredient.unit_base}
                      </span>
                    </div>
                  </div>
                  {ingredient.category && (
                    <Badge className={`w-fit mt-2 ${categoryColors[ingredient.category] || categoryColors.Autres}`}>
                      {ingredient.category}
                    </Badge>
                  )}
                </div>

                <div className="space-y-3 flex-grow">
                  <div className="text-sm font-medium text-muted-foreground">
                    Unité: {ingredient.unit_stock || ingredient.unit_base}
                  </div>

                  {ingredient.is_perishable && ingredient.shelf_life_days && ingredient.shelf_life_days < 7 && (
                    <div className="flex items-center gap-2 p-2 bg-orange-100 dark:bg-orange-900/20 rounded-md">
                      <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      <span className="text-sm text-orange-800 dark:text-orange-200">
                        Périssable ({ingredient.shelf_life_days}j)
                      </span>
                    </div>
                  )}

                  {(ingredient.abv || ingredient.density) && (
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {ingredient.abv && <span>{ingredient.abv}% ABV</span>}
                      {ingredient.density && <span>{ingredient.density} g/mL</span>}
                    </div>
                  )}

                  {(ingredient.ph || ingredient.brix) && (
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {ingredient.ph && <span>pH: {ingredient.ph}</span>}
                      {ingredient.brix && <span>{ingredient.brix}° Brix</span>}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
