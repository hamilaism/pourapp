"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronDown, Check, Loader2, PackagePlus, TrendingUp, Info, AlertTriangle } from "lucide-react"
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
  isPerishable?: boolean
  shelfLifeDays?: number
}

interface Supplier {
  id: string
  name: string
}

interface StockEntryData {
  ingredientId: string
  quantity: number
  supplierId: string
  supplierName?: string
  unitPrice: number
  invoiceNumber?: string
  batchNumber?: string
  notes?: string
  receptionDate: string
  receivedBy: string
  conservationDays?: number
}

interface StockEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: StockEntryData) => Promise<void>
  ingredients: Ingredient[]
  suppliers: Supplier[]
  selectedIngredientId?: string
}

// Validation schema
const stockEntrySchema = z
  .object({
    ingredientId: z.string().min(1, "Veuillez sélectionner un ingrédient"),
    quantity: z.number().int("La quantité doit être un nombre entier").min(1, "La quantité doit être supérieure à 0"),
    supplierId: z.string().min(1, "Veuillez sélectionner un fournisseur"),
    supplierName: z.string().optional(),
    unitPrice: z.number().min(0.01, "Le prix doit être supérieur à 0"),
    invoiceNumber: z.string().optional(),
    batchNumber: z.string().optional(),
    conservationDays: z.number().int().min(1, "La durée doit être supérieure à 0").optional(),
    notes: z.string().optional(),
    receptionDate: z.string().min(1, "La date est requise"),
    receivedBy: z.string().min(1, "Le responsable est requis"),
  })
  .refine(
    (data) => {
      // Validation will be handled in component
      return true
    },
    {
      message: "Validation des dates",
    },
  )

type FormData = z.infer<typeof stockEntrySchema>

export default function StockEntryModal({
  isOpen,
  onClose,
  onSubmit,
  ingredients,
  suppliers,
  selectedIngredientId,
}: StockEntryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null)
  const [ingredientSearchOpen, setIngredientSearchOpen] = useState(false)
  const [ingredientSearch, setIngredientSearch] = useState("")
  const [supplierSearchOpen, setSupplierSearchOpen] = useState(false)
  const [supplierSearch, setSupplierSearch] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isCreatingSupplier, setIsCreatingSupplier] = useState(false)
  const [calculatedExpiryDate, setCalculatedExpiryDate] = useState<string>("")

  const quantityInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(stockEntrySchema),
    defaultValues: {
      ingredientId: selectedIngredientId || "",
      receptionDate: new Date().toISOString().split("T")[0],
      receivedBy: "Utilisateur actuel",
      quantity: 0,
      unitPrice: 0,
    },
  })

  const watchedValues = watch()
  const selectedQuantity = watchedValues.quantity || 0
  const unitPrice = watchedValues.unitPrice || 0
  const totalCost = selectedQuantity * unitPrice
  const receptionDate = watchedValues.receptionDate
  const conservationDays = watchedValues.conservationDays

  useEffect(() => {
    if (!selectedIngredient?.isPerishable) {
      setCalculatedExpiryDate("")
      return
    }

    const shelfLife = conservationDays

    if (shelfLife && receptionDate) {
      const reception = new Date(receptionDate)
      const expiry = new Date(reception)
      expiry.setDate(reception.getDate() + shelfLife)
      setCalculatedExpiryDate(expiry.toISOString().split("T")[0])
    } else {
      setCalculatedExpiryDate("")
    }
  }, [selectedIngredient, receptionDate, conservationDays])

  useEffect(() => {
    if (selectedIngredient?.isPerishable && selectedIngredient.shelfLifeDays) {
      setValue("conservationDays", selectedIngredient.shelfLifeDays)
    } else if (selectedIngredient?.isPerishable && !selectedIngredient.shelfLifeDays) {
      setValue("conservationDays", undefined)
    }
  }, [selectedIngredient, setValue])

  useEffect(() => {
    if (isOpen && selectedIngredientId) {
      const preSelectedIngredient = ingredients.find((ing) => ing.id === selectedIngredientId)
      if (preSelectedIngredient) {
        setSelectedIngredient(preSelectedIngredient)
        setValue("ingredientId", preSelectedIngredient.id)
        setTimeout(() => {
          quantityInputRef.current?.focus()
        }, 100)
      }
    }
  }, [isOpen, selectedIngredientId, ingredients, setValue])

  useEffect(() => {
    if (!isOpen) {
      reset()
      setSelectedIngredient(null)
      setSelectedSupplier(null)
      setShowSuccess(false)
      setIsCreatingSupplier(false)
      setCalculatedExpiryDate("")
    }
  }, [isOpen, reset])

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(ingredientSearch.toLowerCase()),
  )

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(supplierSearch.toLowerCase()),
  )

  const newStock = selectedIngredient ? selectedIngredient.currentStock + selectedQuantity : 0

  const handleIngredientSelect = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient)
    setValue("ingredientId", ingredient.id)
    if (ingredient.isPerishable && ingredient.shelfLifeDays) {
      setValue("conservationDays", ingredient.shelfLifeDays)
    } else {
      setValue("conservationDays", undefined)
    }
    setIngredientSearchOpen(false)
    setIngredientSearch("")
  }

  const handleSupplierSelect = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setValue("supplierId", supplier.id)
    setSupplierSearchOpen(false)
    setSupplierSearch("")
    setIsCreatingSupplier(false)
  }

  const handleCreateSupplier = () => {
    if (supplierSearch.trim()) {
      const newSupplier: Supplier = {
        id: `new-${Date.now()}`,
        name: supplierSearch.trim(),
      }
      setSelectedSupplier(newSupplier)
      setValue("supplierId", newSupplier.id)
      setValue("supplierName", newSupplier.name)
      setSupplierSearchOpen(false)
      setIsCreatingSupplier(false)
    }
  }

  const onFormSubmit = async (data: FormData) => {
    if (!selectedIngredient) return

    if (selectedIngredient.isPerishable && !selectedIngredient.shelfLifeDays && !data.conservationDays) {
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
      console.error("Error submitting stock entry:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getShelfLifeIndicator = (days: number) => {
    if (days < 7) {
      return {
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800",
        label: "Courte durée",
      }
    } else if (days <= 14) {
      return {
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800",
        label: "Durée moyenne",
      }
    } else {
      return {
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800",
        label: "Longue durée",
      }
    }
  }

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Entrée enregistrée</h3>
            <p className="text-muted-foreground mb-4">
              {selectedQuantity} {selectedIngredient?.unit} de {selectedIngredient?.name} ont été ajoutés au stock.
            </p>
            <p className="text-sm text-muted-foreground">
              Nouveau stock: {newStock} {selectedIngredient?.unit}
            </p>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-2">
              Coût total: €{totalCost.toFixed(2)}
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
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
              <PackagePlus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            Nouvelle entrée de stock
          </DialogTitle>
          <DialogDescription>Enregistrer une réception d'ingrédient dans l'inventaire</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Ingredient Selection */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-medium text-sm">Sélection de l'ingrédient</h3>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Ingrédient <span className="text-emerald-600">*</span>
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
                    <p className="text-xs text-muted-foreground">Stock actuel</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reception Details */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-medium text-sm">Détails de la réception</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-medium">
                  Quantité reçue <span className="text-emerald-600">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="quantity"
                    type="number"
                    step="1"
                    min="1"
                    pattern="[0-9]*"
                    {...register("quantity", { valueAsNumber: true })}
                    ref={quantityInputRef}
                    className={errors.quantity ? "border-red-500" : ""}
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
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Fournisseur <span className="text-emerald-600">*</span>
                </Label>
                <Popover open={supplierSearchOpen} onOpenChange={setSupplierSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={supplierSearchOpen}
                      className={`w-full justify-between ${errors.supplierId ? "border-red-500" : ""}`}
                    >
                      {selectedSupplier ? selectedSupplier.name : "Sélectionner un fournisseur..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <div className="sticky top-0 bg-background z-10 border-b">
                        <CommandInput
                          placeholder="Rechercher ou créer un fournisseur..."
                          value={supplierSearch}
                          onValueChange={setSupplierSearch}
                        />
                      </div>
                      <ScrollArea className="h-[200px]">
                        <CommandList>
                          <CommandGroup>
                            {filteredSuppliers.map((supplier) => (
                              <CommandItem
                                key={supplier.id}
                                onSelect={() => handleSupplierSelect(supplier)}
                                className="hover:bg-accent cursor-pointer"
                              >
                                <div className="font-medium">{supplier.name}</div>
                              </CommandItem>
                            ))}
                            {supplierSearch.trim() &&
                              !filteredSuppliers.some((s) => s.name.toLowerCase() === supplierSearch.toLowerCase()) && (
                                <CommandItem
                                  onSelect={handleCreateSupplier}
                                  className="hover:bg-accent cursor-pointer text-emerald-600"
                                >
                                  <PackagePlus className="h-4 w-4 mr-2" />
                                  Créer "{supplierSearch}"
                                </CommandItem>
                              )}
                          </CommandGroup>
                          {filteredSuppliers.length === 0 && !supplierSearch.trim() && (
                            <CommandEmpty>Aucun fournisseur trouvé.</CommandEmpty>
                          )}
                        </CommandList>
                      </ScrollArea>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.supplierId && <p className="text-sm text-red-500">{errors.supplierId.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitPrice" className="text-sm font-medium">
                  Prix unitaire (€) <span className="text-emerald-600">*</span>
                </Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...register("unitPrice", { valueAsNumber: true })}
                  className={errors.unitPrice ? "border-red-500" : ""}
                  placeholder="0.00"
                />
                {errors.unitPrice && <p className="text-sm text-red-500">{errors.unitPrice.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceNumber" className="text-sm font-medium">
                  Numéro de facture
                </Label>
                <Input id="invoiceNumber" {...register("invoiceNumber")} placeholder="FAC-2024-001" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="batchNumber" className="text-sm font-medium">
                Numéro de lot/batch
              </Label>
              <Input id="batchNumber" {...register("batchNumber")} placeholder="LOT-2024-001" />
            </div>

            {selectedIngredient && (
              <div className="space-y-3 p-4 bg-background rounded-lg border">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  Conservation
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">
                          Ajustez la durée si le produit a déjà vécu ou pour conditions particulières
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h4>

                {selectedIngredient.isPerishable === false ? (
                  <Badge variant="secondary" className="w-fit">
                    Produit non périssable ✓
                  </Badge>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="conservationDays" className="text-sm font-medium">
                        Durée de conservation (jours) <span className="text-emerald-600">*</span>
                      </Label>
                      <Input
                        id="conservationDays"
                        type="number"
                        step="1"
                        min="1"
                        {...register("conservationDays", { valueAsNumber: true })}
                        placeholder="Entrez la durée"
                        className={errors.conservationDays ? "border-red-500" : ""}
                      />
                      {selectedIngredient.shelfLifeDays && (
                        <p className="text-xs text-muted-foreground">
                          Standard: {selectedIngredient.shelfLifeDays} jours
                        </p>
                      )}
                      {!selectedIngredient.shelfLifeDays && (
                        <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/10 rounded-md border border-amber-200 dark:border-amber-800">
                          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <span className="text-sm text-amber-800 dark:text-amber-200">
                            ⚠️ Durée standard non définie
                          </span>
                        </div>
                      )}
                      {errors.conservationDays && (
                        <p className="text-sm text-red-500">{errors.conservationDays.message}</p>
                      )}
                    </div>

                    {conservationDays && conservationDays > 0 && (
                      <>
                        {(() => {
                          const indicator = getShelfLifeIndicator(conservationDays)
                          const isReduced =
                            selectedIngredient.shelfLifeDays && conservationDays < selectedIngredient.shelfLifeDays
                          const isUnusuallyLong =
                            selectedIngredient.shelfLifeDays && conservationDays > selectedIngredient.shelfLifeDays * 2

                          return (
                            <div className="space-y-2">
                              <div className={`p-3 rounded-md border ${indicator.bgColor}`}>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Réception:</span>
                                    <span className="text-sm">
                                      {new Date(receptionDate).toLocaleDateString("fr-FR")}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">+ Conservation:</span>
                                    <span className={`text-sm font-semibold ${indicator.color}`}>
                                      {conservationDays} jours
                                    </span>
                                  </div>
                                  <div className="border-t pt-2 flex items-center justify-between">
                                    <span className="text-sm font-medium">= Péremption:</span>
                                    <span className={`text-sm font-semibold ${indicator.color}`}>
                                      {calculatedExpiryDate
                                        ? new Date(calculatedExpiryDate).toLocaleDateString("fr-FR")
                                        : "-"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {isReduced && (
                                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-md border border-blue-200 dark:border-blue-800">
                                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  <span className="text-sm text-blue-800 dark:text-blue-200">
                                    📌 Durée réduite (produit déjà entamé?)
                                  </span>
                                </div>
                              )}

                              {isUnusuallyLong && (
                                <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/10 rounded-md border border-amber-200 dark:border-amber-800">
                                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                  <span className="text-sm text-amber-800 dark:text-amber-200">
                                    Durée inhabituellement longue
                                  </span>
                                </div>
                              )}
                            </div>
                          )
                        })()}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {selectedQuantity > 0 && unitPrice > 0 && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-md border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Coût total:</span>
                  <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                    €{totalCost.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                  {selectedQuantity} × €{unitPrice.toFixed(2)}
                </p>
              </div>
            )}

            {selectedIngredient && selectedQuantity > 0 && (
              <div className="p-3 bg-background rounded-md border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Nouveau stock:</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span className="font-semibold text-emerald-600">
                      {Math.floor(newStock)} {selectedIngredient.unit}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.floor(selectedIngredient.currentStock)} + {selectedQuantity} = {Math.floor(newStock)}
                </p>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-medium text-sm">Informations complémentaires</h3>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes
              </Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Commentaires sur la réception, qualité du produit, etc."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receptionDate" className="text-sm font-medium">
                  Date de réception <span className="text-emerald-600">*</span>
                </Label>
                <Input
                  id="receptionDate"
                  type="date"
                  {...register("receptionDate")}
                  className={errors.receptionDate ? "border-red-500" : ""}
                />
                {errors.receptionDate && <p className="text-sm text-red-500">{errors.receptionDate.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="receivedBy" className="text-sm font-medium">
                  Reçu par <span className="text-emerald-600">*</span>
                </Label>
                <Input
                  id="receivedBy"
                  {...register("receivedBy")}
                  className={errors.receivedBy ? "border-red-500" : ""}
                  placeholder="Nom du responsable"
                />
                {errors.receivedBy && <p className="text-sm text-red-500">{errors.receivedBy.message}</p>}
              </div>
            </div>
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
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isSubmitting || !selectedIngredient || selectedQuantity <= 0 || unitPrice <= 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <PackagePlus className="mr-2 h-4 w-4" />
                  Enregistrer l'entrée
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
