"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Euro, ChevronRight, AlertCircle } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface IngredientFormData {
  // General Information
  name: string
  category: string
  description: string
  colorCode: string

  // Technical Properties - Calculator fields
  weight: number | null
  volume: number | null
  density: number | null
  alcoholDegree: number
  shelfLifeValue: number
  shelfLifeUnit: "days" | "weeks" | "months"
  storageType: string

  // Supplier Information
  supplierName: string
  reference: string
  packagingType: string
  packagingQuantity: number
  packagingUnitType: string
  packagingSize: number
  packagingUnit: string
  unitPrice: number

  isPerishable: boolean
}

interface IngredientCreationSheetProps {
  children: React.ReactNode
}

export default function IngredientCreationSheet({ children }: IngredientCreationSheetProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [formData, setFormData] = useState<IngredientFormData>({
    name: "",
    category: "",
    description: "",
    colorCode: "#3b82f6",
    weight: null,
    volume: null,
    density: null,
    alcoholDegree: 0,
    shelfLifeValue: 30,
    shelfLifeUnit: "days",
    storageType: "",
    supplierName: "",
    reference: "",
    packagingType: "",
    packagingQuantity: 1,
    packagingUnitType: "Bouteilles",
    packagingSize: 700,
    packagingUnit: "mL",
    unitPrice: 0,
    isPerishable: false,
  })

  const [categories, setCategories] = useState(["Spiritueux", "Liqueurs", "Fruits", "Sirops", "Autres"])
  const [storageTypes, setStorageTypes] = useState(["Sec", "Frigo", "Congélateur", "Ambiant"])
  const [suppliers, setSuppliers] = useState(["Diageo", "Pernod Ricard", "Bacardi"])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [calculatedField, setCalculatedField] = useState<string | null>(null)

  const formRef = useRef<HTMLDivElement>(null)
  const fieldRefs = useRef<Record<string, HTMLElement>>({})

  useEffect(() => {
    const weight = formData.weight
    const volume = formData.volume
    const density = formData.density

    if (weight !== null && volume !== null && density === null) {
      const calculatedDensity = weight / volume
      setFormData((prev) => ({ ...prev, density: Number(calculatedDensity.toFixed(3)) }))
      setCalculatedField("density")
    } else if (weight !== null && density !== null && volume === null) {
      const calculatedVolume = weight / density
      setFormData((prev) => ({ ...prev, volume: Number(calculatedVolume.toFixed(1)) }))
      setCalculatedField("volume")
    } else if (volume !== null && density !== null && weight === null) {
      const calculatedWeight = volume * density
      setFormData((prev) => ({ ...prev, weight: Number(calculatedWeight.toFixed(1)) }))
      setCalculatedField("weight")
    } else {
      setCalculatedField(null)
    }
  }, [formData.weight, formData.volume, formData.density])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Le nom est requis"
    if (!formData.category) newErrors.category = "La catégorie est requise"
    if (!formData.storageType) newErrors.storageType = "Le type de stockage est requis"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleValidationError = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Le nom est requis"
    if (!formData.category) newErrors.category = "La catégorie est requise"
    if (!formData.storageType) newErrors.storageType = "Le type de stockage est requis"

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      // Find first error field and scroll to it
      const firstErrorField = Object.keys(newErrors)[0]
      const fieldElement = fieldRefs.current[firstErrorField]

      if (fieldElement) {
        fieldElement.scrollIntoView({ behavior: "smooth", block: "center" })
        fieldElement.focus()
      }

      // Switch to tab with errors if not current
      if (newErrors.name || newErrors.category) {
        setActiveTab("general")
      } else if (newErrors.storageType) {
        setActiveTab("technical")
      }
    }
  }

  const handleSubmit = () => {
    if (validateForm()) {
      console.log("Form submitted:", formData)
      setOpen(false)
      // Reset form
      setFormData({
        name: "",
        category: "",
        description: "",
        colorCode: "#3b82f6",
        weight: null,
        volume: null,
        density: null,
        alcoholDegree: 0,
        shelfLifeValue: 30,
        shelfLifeUnit: "days",
        storageType: "",
        supplierName: "",
        reference: "",
        packagingType: "",
        packagingQuantity: 1,
        packagingUnitType: "Bouteilles",
        packagingSize: 700,
        packagingUnit: "mL",
        unitPrice: 0,
        isPerishable: false,
      })
      setErrors({})
      setActiveTab("general")
    } else {
      handleValidationError()
    }
  }

  const handleNextOrSave = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Le nom est requis"
    if (!formData.category) newErrors.category = "La catégorie est requise"
    if (!formData.storageType) newErrors.storageType = "Le type de stockage est requis"

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      // Find first error field and scroll to it
      const firstErrorField = Object.keys(newErrors)[0]
      const fieldElement = fieldRefs.current[firstErrorField]

      if (fieldElement) {
        fieldElement.scrollIntoView({ behavior: "smooth", block: "center" })
        fieldElement.focus()
      }

      // Stay on current tab if there are errors
      return
    }

    // Only advance if no errors
    if (activeTab === "general") {
      setActiveTab("technical")
    } else if (activeTab === "technical") {
      setActiveTab("supplier")
    } else {
      handleSubmit()
    }
  }

  const isFormValid = formData.name.trim() && formData.category && formData.storageType

  const CreatableSelect = ({
    value,
    onValueChange,
    options,
    setOptions,
    placeholder,
    error,
  }: {
    value: string
    onValueChange: (value: string) => void
    options: string[]
    setOptions: (options: string[]) => void
    placeholder: string
    error?: string
  }) => {
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState("")

    const handleCreate = (newValue: string) => {
      if (newValue && !options.includes(newValue)) {
        setOptions([...options, newValue])
        onValueChange(newValue)
        setOpen(false)
        setInputValue("")
      }
    }

    const filteredOptions = options.filter((option) => option.toLowerCase().includes(inputValue.toLowerCase()))

    const showCreateOption = inputValue && !options.some((option) => option.toLowerCase() === inputValue.toLowerCase())

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`w-full justify-between ${error ? "border-red-500" : ""}`}
          >
            {value || placeholder}
            <ChevronRight className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              placeholder={`Rechercher ${placeholder.toLowerCase()}...`}
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              {showCreateOption && (
                <CommandGroup>
                  <CommandItem onSelect={() => handleCreate(inputValue)} className="text-blue-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer "{inputValue}"
                  </CommandItem>
                </CommandGroup>
              )}
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option}
                    onSelect={() => {
                      onValueChange(option)
                      setOpen(false)
                    }}
                  >
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
              {filteredOptions.length === 0 && !showCreateOption && <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }

  const calculatePricePerPackage = () => {
    if (formData.unitPrice && formData.packagingType) {
      return `${formData.unitPrice.toFixed(2)} € par ${formData.packagingType}`
    }
    return null
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto px-8">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-2xl">Nouvel ingrédient</SheetTitle>
          <SheetDescription>Ajouter un nouvel ingrédient à votre inventaire</SheetDescription>
        </SheetHeader>

        <div ref={formRef} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general" className="text-xs sm:text-sm relative">
                Informations générales
                {(errors.name || errors.category) && (
                  <AlertCircle className="absolute -top-1 -right-1 h-3 w-3 text-red-500" />
                )}
              </TabsTrigger>
              <TabsTrigger value="technical" className="text-xs sm:text-sm relative">
                Propriétés techniques
                {errors.storageType && <AlertCircle className="absolute -top-1 -right-1 h-3 w-3 text-red-500" />}
              </TabsTrigger>
              <TabsTrigger value="supplier" className="text-xs sm:text-sm">
                Fournisseur
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nom <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    ref={(el) => el && (fieldRefs.current.name = el)}
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Vodka Grey Goose"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Catégorie <span className="text-red-500">*</span>
                  </Label>
                  <div ref={(el) => el && (fieldRefs.current.category = el)}>
                    <CreatableSelect
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      options={categories}
                      setOptions={setCategories}
                      placeholder="Sélectionner une catégorie"
                      error={errors.category}
                    />
                  </div>
                  {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description de l'ingrédient..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colorCode" className="text-sm font-medium">
                    Code couleur
                  </Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      id="colorCode"
                      value={formData.colorCode}
                      onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                      className="w-12 h-10 rounded border border-input cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground">Identification visuelle dans les listes</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="technical" className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Calculateur de propriétés</Label>
                  <p className="text-sm text-muted-foreground">
                    Remplissez 2 champs pour calculer automatiquement le 3ème
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="weight" className="text-xs font-medium">
                        Poids (g)
                      </Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.weight || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            weight: e.target.value ? Number.parseFloat(e.target.value) : null,
                          })
                        }
                        className={calculatedField === "weight" ? "bg-gray-50" : ""}
                        placeholder="0.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="volume" className="text-xs font-medium">
                        Volume (mL)
                      </Label>
                      <Input
                        id="volume"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.volume || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            volume: e.target.value ? Number.parseFloat(e.target.value) : null,
                          })
                        }
                        className={calculatedField === "volume" ? "bg-gray-50" : ""}
                        placeholder="0.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="density" className="text-xs font-medium">
                        Densité (g/mL)
                      </Label>
                      <Input
                        id="density"
                        type="number"
                        step="0.001"
                        min="0"
                        max="5"
                        value={formData.density || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            density: e.target.value ? Number.parseFloat(e.target.value) : null,
                          })
                        }
                        className={calculatedField === "density" ? "bg-gray-50" : ""}
                        placeholder="0.000"
                      />
                    </div>
                  </div>
                  {calculatedField && (
                    <p className="text-xs text-blue-600">
                      {calculatedField === "weight" && "Poids calculé automatiquement"}
                      {calculatedField === "volume" && "Volume calculé automatiquement"}
                      {calculatedField === "density" && "Densité calculée automatiquement"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alcoholDegree" className="text-sm font-medium">
                    Degré d'alcool (%)
                  </Label>
                  <div className="relative">
                    <Input
                      id="alcoholDegree"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.alcoholDegree}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          alcoholDegree: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                  </div>
                </div>

                <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPerishable"
                      checked={formData.isPerishable}
                      onCheckedChange={(checked) => setFormData({ ...formData, isPerishable: checked as boolean })}
                    />
                    <Label htmlFor="isPerishable" className="text-sm font-medium cursor-pointer">
                      Produit périssable
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">Cochez si le produit a une date de péremption</p>

                  {formData.isPerishable && (
                    <div className="space-y-2 pt-2">
                      <Label className="text-sm font-medium">Durée de conservation</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={formData.shelfLifeValue}
                          onChange={(e) =>
                            setFormData({ ...formData, shelfLifeValue: Number.parseInt(e.target.value) || 1 })
                          }
                          className="flex-1"
                        />
                        <Select
                          value={formData.shelfLifeUnit}
                          onValueChange={(value: "days" | "weeks" | "months") =>
                            setFormData({ ...formData, shelfLifeUnit: value })
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="days">jours</SelectItem>
                            <SelectItem value="weeks">semaines</SelectItem>
                            <SelectItem value="months">mois</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Utilisé pour calculer automatiquement la date de péremption lors des entrées de stock
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Type de stockage <span className="text-red-500">*</span>
                  </Label>
                  <div ref={(el) => el && (fieldRefs.current.storageType = el)}>
                    <CreatableSelect
                      value={formData.storageType}
                      onValueChange={(value) => setFormData({ ...formData, storageType: value })}
                      options={storageTypes}
                      setOptions={setStorageTypes}
                      placeholder="Sélectionner un type"
                      error={errors.storageType}
                    />
                  </div>
                  {errors.storageType && <p className="text-sm text-red-500">{errors.storageType}</p>}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="supplier" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Nom du fournisseur</Label>
                  <CreatableSelect
                    value={formData.supplierName}
                    onValueChange={(value) => setFormData({ ...formData, supplierName: value })}
                    options={suppliers}
                    setOptions={setSuppliers}
                    placeholder="Sélectionner ou ajouter un fournisseur"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference" className="text-sm font-medium">
                    Référence/SKU
                  </Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="Ex: VGG-700-40"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-medium">Conditionnement</Label>

                  <div className="space-y-2">
                    <Label htmlFor="packagingType" className="text-xs font-medium">
                      Type de conditionnement
                    </Label>
                    <Select
                      value={formData.packagingType}
                      onValueChange={(value) => setFormData({ ...formData, packagingType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bouteille">Bouteille</SelectItem>
                        <SelectItem value="Carton">Carton</SelectItem>
                        <SelectItem value="Palette">Palette</SelectItem>
                        <SelectItem value="Sac">Sac</SelectItem>
                        <SelectItem value="Filet">Filet</SelectItem>
                        <SelectItem value="Cagette">Cagette</SelectItem>
                        <SelectItem value="Fût">Fût</SelectItem>
                        <SelectItem value="Bidon">Bidon</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Contient</Label>
                    <div className="flex items-center gap-2 text-sm">
                      <Input
                        type="number"
                        min="1"
                        value={formData.packagingQuantity}
                        onChange={(e) =>
                          setFormData({ ...formData, packagingQuantity: Number.parseInt(e.target.value) || 1 })
                        }
                        className="w-20"
                      />
                      <span className="text-muted-foreground">×</span>
                      <Select
                        value={formData.packagingUnitType}
                        onValueChange={(value) => setFormData({ ...formData, packagingUnitType: value })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bouteilles">Bouteilles</SelectItem>
                          <SelectItem value="Sachets">Sachets</SelectItem>
                          <SelectItem value="Boîtes">Boîtes</SelectItem>
                          <SelectItem value="Unités">Unités</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-muted-foreground">de</span>
                      <Input
                        type="number"
                        min="1"
                        value={formData.packagingSize}
                        onChange={(e) =>
                          setFormData({ ...formData, packagingSize: Number.parseInt(e.target.value) || 1 })
                        }
                        className="w-20"
                      />
                      <Select
                        value={formData.packagingUnit}
                        onValueChange={(value) => setFormData({ ...formData, packagingUnit: value })}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mL">mL</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="kg">kg</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Exemple: {formData.packagingQuantity} × {formData.packagingUnitType} de {formData.packagingSize}{" "}
                      {formData.packagingUnit}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unitPrice" className="text-xs font-medium">
                      Prix
                    </Label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Euro className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="unitPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.unitPrice}
                          onChange={(e) =>
                            setFormData({ ...formData, unitPrice: Number.parseFloat(e.target.value) || 0 })
                          }
                          className="pl-10"
                          placeholder="0.00"
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        par {formData.packagingType || "conditionnement"}
                      </span>
                    </div>
                    {calculatePricePerPackage() && (
                      <p className="text-xs text-muted-foreground">{calculatePricePerPackage()}</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="sticky bottom-0 left-0 right-0 bg-background border-t p-6 -mx-8 flex gap-3">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
            Annuler
          </Button>
          <Button onClick={handleNextOrSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
            {activeTab === "supplier" ? "Enregistrer" : "Suivant"}
            {activeTab !== "supplier" && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
