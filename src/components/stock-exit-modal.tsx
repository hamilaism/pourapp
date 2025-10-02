"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, ChevronDown, Check, Loader2, PackageMinus, AlertCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// Types
interface Ingredient {
  id: string
  name: string
  category: string
  currentStock: number
  unit: string
  minimumStock?: number
}

interface Recipe {
  id: string
  name: string
  category: string
}

interface StockExitData {
  ingredientId: string
  quantity: number
  reason: "Production" | "Périmé/Perte" | "Ajustement d'inventaire" | "Autre"
  recipeId?: string
  notes?: string
  date: string
  removedBy: string
}

interface StockExitModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: StockExitData) => Promise<void>
  ingredients: Ingredient[]
  recipes?: Recipe[]
  selectedIngredientId?: string // Add optional prop for pre-selected ingredient
}

// Validation schema
const stockExitSchema = z
  .object({
    ingredientId: z.string().min(1, "Veuillez sélectionner un ingrédient"),
    quantity: z.number().int("La quantité doit être un nombre entier").min(0, "La quantité ne peut pas être négative"),
    reason: z.enum(["Production", "Périmé/Perte", "Ajustement d'inventaire", "Autre"], {
      required_error: "Veuillez sélectionner une raison",
    }),
    recipeId: z.string().optional(),
    notes: z.string().optional(),
    date: z.string().min(1, "La date est requise"),
    removedBy: z.string().min(1, "Le responsable est requis"),
  })
  .refine(
    (data) => {
      if (data.reason === "Production" && !data.recipeId) {
        return false
      }
      if ((data.reason === "Autre" || data.reason === "Périmé/Perte") && !data.notes?.trim()) {
        return false
      }
      return true
    },
    {
      message: "Champs requis manquants selon la raison sélectionnée",
      path: ["reason"],
    },
  )

type FormData = z.infer<typeof stockExitSchema>

export default function StockExitModal({
  isOpen,
  onClose,
  onSubmit,
  ingredients,
  recipes = [],
  selectedIngredientId,
}: StockExitModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null)
  const [ingredientSearchOpen, setIngredientSearchOpen] = useState(false)
  const [ingredientSearch, setIngredientSearch] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  const quantityInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(stockExitSchema),
    defaultValues: {
      ingredientId: selectedIngredientId || "",
      date: new Date().toISOString().split("T")[0],
      removedBy: "Utilisateur actuel",
      quantity: 0,
    },
  })

  const watchedValues = watch()
  const selectedReason = watchedValues.reason
  const selectedQuantity = watchedValues.quantity || 0

  useEffect(() => {
    if (isOpen && selectedIngredientId) {
      const preSelectedIngredient = ingredients.find((ing) => ing.id === selectedIngredientId)
      if (preSelectedIngredient) {
        setSelectedIngredient(preSelectedIngredient)
        setValue("ingredientId", preSelectedIngredient.id)
        // Auto-focus on quantity field after a short delay
        setTimeout(() => {
          quantityInputRef.current?.focus()
        }, 100)
      }
    }
  }, [isOpen, selectedIngredientId, ingredients, setValue])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      reset()
      setSelectedIngredient(null)
      setShowSuccess(false)
    }
  }, [isOpen, reset])

  // Filter ingredients based on search
  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(ingredientSearch.toLowerCase()),
  )

  // Calculate remaining stock
  const remainingStock = selectedIngredient ? selectedIngredient.currentStock - selectedQuantity : 0
  const willBeZero = remainingStock === 0 && selectedQuantity > 0
  const willBeBelowMinimum = selectedIngredient?.minimumStock && remainingStock < selectedIngredient.minimumStock
  const exceedsStock = selectedIngredient && selectedQuantity > selectedIngredient.currentStock

  // Handle ingredient selection
  const handleIngredientSelect = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient)
    setValue("ingredientId", ingredient.id)
    setIngredientSearchOpen(false)
    setIngredientSearch("")
  }

  // Handle form submission
  const onFormSubmit = async (data: FormData) => {
    if (!selectedIngredient) return

    // Validate quantity doesn't exceed available stock (but can reach zero)
    if (data.quantity > selectedIngredient.currentStock) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(data)
      setShowSuccess(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error("Error submitting stock exit:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Sortie enregistrée</h3>
            <p className="text-muted-foreground mb-4">
              {selectedQuantity} {selectedIngredient?.unit} de {selectedIngredient?.name} ont été retirés du stock.
            </p>
            <p className="text-sm text-muted-foreground">
              Stock restant: {remainingStock} {selectedIngredient?.unit}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <PackageMinus className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            Sortie de stock
          </DialogTitle>
          <DialogDescription>Enregistrer une sortie d'ingrédient de l'inventaire</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Ingredient Selection */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-medium text-sm">Sélection de l'ingrédient</h3>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Ingrédient <span className="text-red-500">*</span>
              </Label>
              <Popover open={ingredientSearchOpen} onOpenChange={setIngredientSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={ingredientSearchOpen}
                    className={`w-full justify-between ${errors.ingredientId ? "border-red-500" : ""} ${selectedIngredient && selectedIngredientId ? "bg-muted/50" : ""}`}
                  >
                    {selectedIngredient ? selectedIngredient.name : "Sélectionner un ingrédient..."}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <div className="sticky top-0 bg-background z-10 border-b">
                      <CommandInput
                        placeholder="Rechercher un ingrédient..."
                        value={ingredientSearch}
                        onValueChange={setIngredientSearch}
                      />
                    </div>
                    <ScrollArea className="h-[200px]">
                      <CommandList>
                        <CommandGroup>
                          {filteredIngredients.map((ingredient) => (
                            <CommandItem
                              key={ingredient.id}
                              onSelect={() => handleIngredientSelect(ingredient)}
                              className="flex items-center justify-between hover:bg-accent cursor-pointer"
                            >
                              <div>
                                <div className="font-medium">{ingredient.name}</div>
                                <div className="text-sm text-muted-foreground">{ingredient.category}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">
                                  {ingredient.currentStock} {ingredient.unit}
                                </div>
                                {ingredient.currentStock <= (ingredient.minimumStock || 0) && (
                                  <Badge variant="destructive" className="text-xs">
                                    Stock bas
                                  </Badge>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        {filteredIngredients.length === 0 && <CommandEmpty>Aucun ingrédient trouvé.</CommandEmpty>}
                      </CommandList>
                    </ScrollArea>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.ingredientId && <p className="text-sm text-red-500">{errors.ingredientId.message}</p>}
            </div>

            {selectedIngredient && (
              <div className="p-3 bg-background rounded-md border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedIngredient.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedIngredient.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      {Math.floor(selectedIngredient.currentStock)} {selectedIngredient.unit}
                    </p>
                    <p className="text-xs text-muted-foreground">Stock disponible</p>
                  </div>
                </div>
                {selectedIngredient.minimumStock &&
                  selectedIngredient.currentStock <= selectedIngredient.minimumStock && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-amber-100 dark:bg-amber-900/20 rounded-md">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm text-amber-800 dark:text-amber-200">
                        Stock actuellement bas (minimum: {selectedIngredient.minimumStock} {selectedIngredient.unit})
                      </span>
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Removal Details */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-medium text-sm">Détails de la sortie</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-medium">
                  Quantité à retirer <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="quantity"
                    type="number"
                    step="1"
                    min="0"
                    pattern="[0-9]*"
                    max={selectedIngredient?.currentStock || 999999}
                    {...register("quantity", { valueAsNumber: true })}
                    ref={quantityInputRef}
                    className={errors.quantity || exceedsStock ? "border-red-500" : ""}
                    placeholder="0"
                    onKeyDown={(e) => {
                      if (e.key === "." || e.key === ",") {
                        e.preventDefault()
                      }
                    }}
                  />
                  {selectedIngredient && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                      {selectedIngredient.unit}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Nombre entier uniquement</p>
                {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
                {exceedsStock && (
                  <p className="text-sm text-red-500">
                    Quantité insuffisante en stock (disponible: {Math.floor(selectedIngredient?.currentStock || 0)}{" "}
                    {selectedIngredient?.unit})
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Raison de la sortie <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(value) => setValue("reason", value as any)}>
                  <SelectTrigger className={errors.reason ? "border-red-500" : ""}>
                    <SelectValue placeholder="Sélectionner une raison" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Production">Production (lié à une recette)</SelectItem>
                    <SelectItem value="Périmé/Perte">Périmé/Perte</SelectItem>
                    <SelectItem value="Ajustement d'inventaire">Ajustement d'inventaire</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
                {errors.reason && <p className="text-sm text-red-500">{errors.reason.message}</p>}
              </div>
            </div>

            {/* Recipe Selection for Production */}
            {selectedReason === "Production" && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Recette associée <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(value) => setValue("recipeId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une recette" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipes.map((recipe) => (
                      <SelectItem key={recipe.id} value={recipe.id}>
                        <div>
                          <div className="font-medium">{recipe.name}</div>
                          <div className="text-xs text-muted-foreground">{recipe.category}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Notes for Autre/Perte */}
            {(selectedReason === "Autre" || selectedReason === "Périmé/Perte") && (
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Explication <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  placeholder={
                    selectedReason === "Périmé/Perte"
                      ? "Détails sur la perte (date de péremption, état du produit, etc.)"
                      : "Précisez la raison de cette sortie..."
                  }
                  rows={3}
                  className={errors.notes ? "border-red-500" : ""}
                />
                {errors.notes && <p className="text-sm text-red-500">Ce champ est requis pour cette raison</p>}
              </div>
            )}

            {/* Stock Preview */}
            {selectedIngredient && selectedQuantity > 0 && (
              <div className="p-3 bg-background rounded-md border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Stock après sortie:</span>
                  <span
                    className={`font-semibold ${willBeBelowMinimum || willBeZero ? "text-red-600" : "text-foreground"}`}
                  >
                    {Math.floor(remainingStock)} {selectedIngredient.unit}
                  </span>
                </div>
                {willBeZero && !exceedsStock && (
                  <div className="flex items-center gap-2 mt-2 text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Attention: le stock sera épuisé</span>
                  </div>
                )}
                {willBeBelowMinimum && !willBeZero && (
                  <div className="flex items-center gap-2 mt-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">
                      Attention: le stock sera en dessous du minimum ({selectedIngredient.minimumStock}{" "}
                      {selectedIngredient.unit})
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Validation Section */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-medium text-sm">Validation</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium">
                  Date <span className="text-red-500">*</span>
                </Label>
                <Input id="date" type="date" {...register("date")} className={errors.date ? "border-red-500" : ""} />
                {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="removedBy" className="text-sm font-medium">
                  Retiré par <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="removedBy"
                  {...register("removedBy")}
                  className={errors.removedBy ? "border-red-500" : ""}
                  placeholder="Nom du responsable"
                />
                {errors.removedBy && <p className="text-sm text-red-500">{errors.removedBy.message}</p>}
              </div>
            </div>

            {/* Optional notes for all types */}
            {selectedReason && selectedReason !== "Autre" && selectedReason !== "Périmé/Perte" && (
              <div className="space-y-2">
                <Label htmlFor="generalNotes" className="text-sm font-medium">
                  Notes (optionnel)
                </Label>
                <Textarea
                  id="generalNotes"
                  {...register("notes")}
                  placeholder="Commentaires additionnels..."
                  rows={2}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={isSubmitting || exceedsStock || !selectedIngredient || selectedQuantity < 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <PackageMinus className="mr-2 h-4 w-4" />
                  Enregistrer la sortie
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
