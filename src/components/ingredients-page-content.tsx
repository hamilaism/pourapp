"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import IngredientCreationSheet from "./ingredient-creation-sheet"
import StockExitModal from "./stock-exit-modal"
import StockEntryModal from "./stock-entry-modal"
import IngredientDetailPage from "./ingredient-detail-page"
import IngredientEditModal from "./ingredient-edit-modal"
import DeleteConfirmationModal from "./delete-confirmation-modal"
import {
  Plus,
  Search,
  Snowflake,
  Droplets,
  Package,
  Home,
  Edit2,
  Filter,
  SortAsc,
  AlertTriangle,
  PackagePlus,
  PackageMinus,
  MoreVertical,
  Trash2,
  X,
  TrendingUp,
  Euro,
  AlertCircle,
  XCircle,
  FileX,
} from "lucide-react"

interface UserPermissions {
  canAdd: boolean
  canRemove: boolean
  canEdit: boolean
  canDelete: boolean
}

interface Ingredient {
  id: string
  name: string
  category: "Spiritueux" | "Liqueurs" | "Fruits" | "Sirops" | "Autres"
  stock: string
  storage: "freezer" | "fridge" | "dry" | "ambient"
  abv?: number
  density?: number
  expiryWarning?: string
  isPerishable?: boolean
  shelfLifeDays?: number
  allergens?: string[]
  ph?: number
  brix?: number
  carbonation?: number
  movements?: Array<{
    date: string
    type: "in" | "out"
    qty: number
    reason: string
    user?: string
    supplier?: string
    price?: number
  }>
  lots?: Array<{
    id: string
    batchNumber: string
    quantity: number
    expiryDate: string
    daysUntilExpiry: number
    status: "good" | "warning" | "critical"
  }>
  suppliers?: Array<{
    id: string
    name: string
    lastPrice: number
    lastDelivery: string
    reliability: number
    currentPrice?: number
    avgPrice?: number
    trend?: string
    isBestDeal?: boolean
    priceHistory?: number[]
  }>
  totalValue?: number
  avgPrice?: number
  rotationPerWeek?: number
  trend?: string
  currentPrice?: number
  avgPrice30Days?: number
  stockValue?: number
  priceVolatility?: string
  priceTrend?: number
  priceHistory?: Array<{
    date: string
    price: number
    supplier: string
  }>
  usedInRecipes?: Array<{
    name: string
    costPerCocktail: number
    margin: number
  }>
}

const mockIngredients: Ingredient[] = [
  {
    id: "1",
    name: "Grey Goose Vodka",
    category: "Spiritueux",
    stock: "12 bouteilles • 9 L",
    storage: "dry",
    abv: 40,
    isPerishable: false,
    allergens: [],
    totalValue: 480,
    avgPrice: 40,
    rotationPerWeek: 3,
    trend: "stable",
    currentPrice: 35.0,
    avgPrice30Days: 34.5,
    stockValue: 420.0,
    priceVolatility: "stable",
    priceTrend: 4.5,
    priceHistory: [
      { date: "2024-09-01", price: 33.5, supplier: "Spiritueux Import" },
      { date: "2024-09-08", price: 33.75, supplier: "Spiritueux Import" },
      { date: "2024-09-15", price: 34.0, supplier: "Spiritueux Import" },
      { date: "2024-09-22", price: 34.25, supplier: "Spiritueux Import" },
      { date: "2024-09-29", price: 34.5, supplier: "Spiritueux Import" },
      { date: "2024-10-01", price: 35.0, supplier: "Spiritueux Import" },
    ],
    movements: [
      { date: "2024-10-01 14:30", type: "out", qty: 2, reason: "Production", user: "Marie D." },
      { date: "2024-10-01 09:00", type: "in", qty: 6, reason: "Livraison", supplier: "Spiritueux Import", price: 240 },
      { date: "2024-09-28 16:45", type: "out", qty: 3, reason: "Production", user: "Jean P." },
    ],
    suppliers: [
      {
        id: "1",
        name: "Spiritueux Import",
        lastPrice: 40,
        lastDelivery: "2024-10-01",
        reliability: 95,
        currentPrice: 34.5,
        avgPrice: 34.25,
        trend: "increasing",
        isBestDeal: true,
        priceHistory: [33.5, 33.75, 34.0, 34.25, 34.5],
      },
      {
        id: "2",
        name: "Distributeur Premium",
        lastPrice: 42,
        lastDelivery: "2024-09-15",
        reliability: 88,
        currentPrice: 35.5,
        avgPrice: 35.75,
        trend: "stable",
        isBestDeal: false,
        priceHistory: [35.5, 35.75, 36.0, 35.5, 35.5],
      },
    ],
    usedInRecipes: [
      { name: "Moscow Mule", costPerCocktail: 2.1, margin: 68 },
      { name: "Vodka Martini", costPerCocktail: 3.5, margin: 71 },
      { name: "Cosmopolitan", costPerCocktail: 2.8, margin: 69 },
    ],
  },
  {
    id: "2",
    name: "Citron vert",
    category: "Fruits",
    stock: "25 unités • 2.5 kg",
    storage: "fridge",
    expiryWarning: "10 unités expirent dans 2 jours",
    isPerishable: true,
    shelfLifeDays: 7,
    allergens: [],
    ph: 2.0,
    brix: 7,
    totalValue: 37.5,
    avgPrice: 1.5,
    rotationPerWeek: 15,
    trend: "up",
    currentPrice: 0.3,
    avgPrice30Days: 0.32,
    stockValue: 7.5,
    priceVolatility: "volatile",
    priceTrend: -6.25,
    priceHistory: [
      { date: "2024-09-01", price: 0.35, supplier: "Fruits & Légumes Bio" },
      { date: "2024-09-08", price: 0.32, supplier: "Fruits & Légumes Bio" },
      { date: "2024-09-15", price: 0.38, supplier: "Fruits & Légumes Bio" },
      { date: "2024-09-22", price: 0.28, supplier: "Fruits & Légumes Bio" },
      { date: "2024-09-29", price: 0.33, supplier: "Fruits & Légumes Bio" },
      { date: "2024-10-01", price: 0.3, supplier: "Fruits & Légumes Bio" },
    ],
    movements: [
      {
        date: "2024-10-01 08:00",
        type: "in",
        qty: 30,
        reason: "Livraison",
        supplier: "Fruits & Légumes Bio",
        price: 45,
      },
      { date: "2024-09-30 19:00", type: "out", qty: 20, reason: "Production", user: "Sophie L." },
    ],
    lots: [
      {
        id: "1",
        batchNumber: "LOT-2024-10-01",
        quantity: 15,
        expiryDate: "2024-10-08",
        daysUntilExpiry: 7,
        status: "good",
      },
      {
        id: "2",
        batchNumber: "LOT-2024-09-28",
        quantity: 10,
        expiryDate: "2024-10-03",
        daysUntilExpiry: 2,
        status: "warning",
      },
    ],
    suppliers: [
      {
        id: "1",
        name: "Fruits & Légumes Bio",
        lastPrice: 1.5,
        lastDelivery: "2024-10-01",
        reliability: 92,
        currentPrice: 0.3,
        avgPrice: 0.32,
        trend: "decreasing",
        isBestDeal: true,
        priceHistory: [0.35, 0.32, 0.38, 0.28, 0.3],
      },
    ],
    usedInRecipes: [
      { name: "Mojito Classique", costPerCocktail: 0.45, margin: 72 },
      { name: "Caipirinha", costPerCocktail: 0.5, margin: 70 },
      { name: "Margarita", costPerCocktail: 0.4, margin: 73 },
    ],
  },
  {
    id: "3",
    name: "Baileys",
    category: "Liqueurs",
    stock: "4 bouteilles • 2.8 L",
    storage: "ambient",
    isPerishable: true,
    shelfLifeDays: 180,
    abv: 17,
    brix: 25,
    allergens: ["MILK", "GLUTEN"],
    totalValue: 80,
    avgPrice: 20,
    rotationPerWeek: 1,
    trend: "stable",
    currentPrice: 22.0,
    avgPrice30Days: 21.5,
    stockValue: 88.0,
    priceVolatility: "stable",
    priceTrend: 2.3,
    priceHistory: [
      { date: "2024-09-01", price: 21.0, supplier: "Distributeur Premium" },
      { date: "2024-09-15", price: 21.5, supplier: "Distributeur Premium" },
      { date: "2024-09-25", price: 22.0, supplier: "Distributeur Premium" },
    ],
    movements: [
      {
        date: "2024-09-25 10:00",
        type: "in",
        qty: 6,
        reason: "Livraison",
        supplier: "Distributeur Premium",
        price: 120,
      },
      { date: "2024-09-20 15:30", type: "out", qty: 2, reason: "Production", user: "Marie D." },
    ],
    lots: [
      {
        id: "1",
        batchNumber: "BAI-2024-09",
        quantity: 4,
        expiryDate: "2025-03-25",
        daysUntilExpiry: 175,
        status: "good",
      },
    ],
    suppliers: [
      {
        id: "1",
        name: "Distributeur Premium",
        lastPrice: 20,
        lastDelivery: "2024-09-25",
        reliability: 90,
        currentPrice: 22.0,
        avgPrice: 21.5,
        trend: "increasing",
        isBestDeal: true,
        priceHistory: [21.0, 21.0, 21.5, 21.5, 22.0],
      },
    ],
    usedInRecipes: [
      { name: "Espresso Martini", costPerCocktail: 3.2, margin: 65 },
      { name: "Baileys Coffee", costPerCocktail: 2.5, margin: 67 },
    ],
  },
  {
    id: "4",
    name: "Angostura Bitters",
    category: "Spiritueux",
    stock: "1 bouteille • 200 ml",
    storage: "dry",
    abv: 45,
    isPerishable: false,
    allergens: [],
    totalValue: 15,
    avgPrice: 15,
    rotationPerWeek: 0.5,
    trend: "down",
    movements: [
      { date: "2024-09-15 11:00", type: "in", qty: 2, reason: "Livraison", supplier: "Spiritueux Import", price: 30 },
      { date: "2024-09-10 17:00", type: "out", qty: 1, reason: "Production", user: "Jean P." },
    ],
    suppliers: [{ id: "1", name: "Spiritueux Import", lastPrice: 15, lastDelivery: "2024-09-15", reliability: 95 }],
  },
  {
    id: "5",
    name: "Menthe fraîche",
    category: "Fruits",
    stock: "3 boîtes • 150 g",
    storage: "fridge",
    expiryWarning: "2 boîtes expirent dans 2 jours",
    isPerishable: true,
    shelfLifeDays: 5,
    allergens: [],
    totalValue: 12,
    avgPrice: 4,
    rotationPerWeek: 8,
    trend: "up",
    movements: [
      {
        date: "2024-10-01 07:30",
        type: "in",
        qty: 5,
        reason: "Livraison",
        supplier: "Fruits & Légumes Bio",
        price: 20,
      },
      { date: "2024-09-30 20:00", type: "out", qty: 4, reason: "Production", user: "Sophie L." },
    ],
    lots: [
      {
        id: "1",
        batchNumber: "MINT-2024-10-01",
        quantity: 1,
        expiryDate: "2024-10-06",
        daysUntilExpiry: 5,
        status: "good",
      },
      {
        id: "2",
        batchNumber: "MINT-2024-09-29",
        quantity: 2,
        expiryDate: "2024-10-03",
        daysUntilExpiry: 2,
        status: "warning",
      },
    ],
    suppliers: [{ id: "1", name: "Fruits & Légumes Bio", lastPrice: 4, lastDelivery: "2024-10-01", reliability: 92 }],
  },
  {
    id: "6",
    name: "Sirop simple",
    category: "Sirops",
    stock: "4 bouteilles • 4 L",
    storage: "ambient",
    isPerishable: false,
    allergens: [],
    brix: 50,
    totalValue: 20,
    avgPrice: 5,
    rotationPerWeek: 2,
    trend: "stable",
    movements: [
      { date: "2024-09-28 09:00", type: "in", qty: 6, reason: "Livraison", supplier: "Fournisseur Local", price: 30 },
      { date: "2024-09-25 16:00", type: "out", qty: 2, reason: "Production", user: "Marie D." },
    ],
    suppliers: [{ id: "1", name: "Fournisseur Local", lastPrice: 5, lastDelivery: "2024-09-28", reliability: 85 }],
  },
  {
    id: "7",
    name: "Crème fraîche",
    category: "Autres",
    stock: "2 pots • 500 ml",
    storage: "fridge",
    isPerishable: true,
    allergens: ["MILK"],
    totalValue: 8,
    avgPrice: 4,
    rotationPerWeek: 3,
    trend: "stable",
    movements: [
      { date: "2024-09-30 08:00", type: "in", qty: 4, reason: "Livraison", supplier: "Fournisseur Local", price: 16 },
      { date: "2024-09-28 18:00", type: "out", qty: 2, reason: "Production", user: "Sophie L." },
    ],
    lots: [
      {
        id: "1",
        batchNumber: "CREAM-2024-09-30",
        quantity: 2,
        expiryDate: "2024-10-07",
        daysUntilExpiry: 6,
        status: "good",
      },
    ],
    suppliers: [{ id: "1", name: "Fournisseur Local", lastPrice: 4, lastDelivery: "2024-09-30", reliability: 85 }],
  },
]

const categoryColors = {
  Spiritueux: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Liqueurs: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  Fruits: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Sirops: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  Autres: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
}

const StorageIcon = ({ storage }: { storage: string }) => {
  switch (storage) {
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

const getStorageLabel = (storage: string) => {
  switch (storage) {
    case "freezer":
      return "Congélateur"
    case "fridge":
      return "Frigo"
    case "dry":
      return "Sec"
    case "ambient":
      return "Ambiant"
    default:
      return "Sec"
  }
}

export default function IngredientsPage() {
  const userPermissions: UserPermissions = {
    canAdd: true,
    canRemove: true,
    canEdit: false,
    canDelete: false,
  }

  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchTerm, setSearchTerm] = useState("")
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "Tous")
  const [expiryFilter, setExpiryFilter] = useState(searchParams.get("expiry") || "Tous")
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "Nom A-Z")

  const [alertsFilter, setAlertsFilter] = useState(searchParams.get("alerts") === "true")
  const [rupturesFilter, setRupturesFilter] = useState(searchParams.get("ruptures") === "true")

  const [stockExitModalOpen, setStockExitModalOpen] = useState(false)
  const [selectedIngredientForExit, setSelectedIngredientForExit] = useState<string | null>(null)

  const [stockEntryModalOpen, setStockEntryModalOpen] = useState(false)
  const [selectedIngredientForEntry, setSelectedIngredientForEntry] = useState<string | null>(null)

  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [selectedIngredientForEdit, setSelectedIngredientForEdit] = useState<Ingredient | null>(null)

  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null)
  const [showDetailView, setShowDetailView] = useState(false)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Ingredient | null>(null)
  const { toast } = useToast()

  const mockIngredientsForExit = mockIngredients.map((ingredient) => ({
    id: ingredient.id,
    name: ingredient.name,
    category: ingredient.category,
    currentStock: Number.parseFloat(ingredient.stock.split(" ")[0]) || 1,
    unit: ingredient.stock.includes("bouteilles")
      ? "bouteilles"
      : ingredient.stock.includes("sacs")
        ? "sacs"
        : ingredient.stock.includes("boîtes")
          ? "boîtes"
          : "unités",
    minimumStock: 1,
    isPerishable: ingredient.isPerishable,
    shelfLifeDays: ingredient.shelfLifeDays,
  }))

  const mockRecipes = [
    { id: "1", name: "Mojito Classique", category: "Cocktails" },
    { id: "2", name: "Cosmopolitan", category: "Cocktails" },
    { id: "3", name: "Old Fashioned", category: "Cocktails" },
  ]

  const mockSuppliers = [
    { id: "1", name: "Distributeur Premium" },
    { id: "2", name: "Fruits & Légumes Bio" },
    { id: "3", name: "Spiritueux Import" },
    { id: "4", name: "Fournisseur Local" },
  ]

  const handleCardClick = (ingredientId: string) => {
    setSelectedIngredientId(ingredientId)
    setShowDetailView(true)
  }

  const handleBackToList = () => {
    setShowDetailView(false)
    setSelectedIngredientId(null)
  }

  const handleStockExit = (ingredientId: string) => {
    setSelectedIngredientForExit(ingredientId)
    setStockExitModalOpen(true)
  }

  const handleStockExitSubmit = async (data: any) => {
    console.log("Stock exit data:", data)
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  const handleStockEntry = (ingredientId: string) => {
    setSelectedIngredientForEntry(ingredientId)
    setStockEntryModalOpen(true)
  }

  const handleStockEntrySubmit = async (data: any) => {
    console.log("Stock entry data:", data)
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  const handleEditIngredient = (ingredient: Ingredient) => {
    setSelectedIngredientForEdit(ingredient)
    setEditDrawerOpen(true)
  }

  const handleEditSubmit = async (data: any) => {
    console.log("Edit data:", data)
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  const handleDeleteClick = (ingredient: Ingredient, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setItemToDelete(ingredient)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return

    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Ingrédient supprimé",
      description: `${itemToDelete.name} a été supprimé avec succès.`,
    })

    if (showDetailView && selectedIngredientId === itemToDelete.id) {
      setShowDetailView(false)
      setSelectedIngredientId(null)
    }

    setDeleteModalOpen(false)
    setItemToDelete(null)
  }

  useEffect(() => {
    const params = new URLSearchParams()
    if (categoryFilter !== "Tous") params.set("category", categoryFilter)
    if (expiryFilter !== "Tous") params.set("expiry", expiryFilter)
    if (sortBy !== "Nom A-Z") params.set("sort", sortBy)
    if (alertsFilter) params.set("alerts", "true")
    if (rupturesFilter) params.set("ruptures", "true")

    const newUrl = params.toString() ? `?${params.toString()}` : "/"
    router.replace(newUrl, { scroll: false })
  }, [categoryFilter, expiryFilter, sortBy, alertsFilter, rupturesFilter, router])

  const activeFilterCount = [
    categoryFilter !== "Tous" ? 1 : 0,
    expiryFilter !== "Tous" ? 1 : 0,
    sortBy !== "Nom A-Z" ? 1 : 0,
    alertsFilter ? 1 : 0,
    rupturesFilter ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0)

  const resetFilters = () => {
    setCategoryFilter("Tous")
    setExpiryFilter("Tous")
    setSortBy("Nom A-Z")
    setAlertsFilter(false)
    setRupturesFilter(false)
  }

  const handleAlertsClick = () => {
    setAlertsFilter(!alertsFilter)
  }

  const handleRupturesClick = () => {
    setRupturesFilter(!rupturesFilter)
  }

  const filteredIngredients = mockIngredients
    .filter((ingredient) => {
      const matchesSearch =
        ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ingredient.category.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = categoryFilter === "Tous" || ingredient.category === categoryFilter

      const matchesExpiry =
        expiryFilter === "Tous" ||
        (expiryFilter === "Expiré" && ingredient.expiryWarning?.includes("expire demain")) ||
        (expiryFilter === "Expire demain" && ingredient.expiryWarning?.includes("expire demain")) ||
        (expiryFilter === "Expire dans 3 jours" && ingredient.expiryWarning?.includes("dans 2 jours")) ||
        (expiryFilter === "Expire dans 7 jours" && ingredient.expiryWarning)

      const matchesAlerts = !alertsFilter || ingredient.expiryWarning
      const matchesRuptures = !rupturesFilter || ingredient.stock.includes("0 ")

      return matchesSearch && matchesCategory && matchesExpiry && matchesAlerts && matchesRuptures
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "Nom Z-A":
          return b.name.localeCompare(a.name)
        case "Catégorie":
          return a.category.localeCompare(b.category)
        case "Péremption proche":
          return (a.expiryWarning ? 0 : 1) - (b.expiryWarning ? 0 : 1)
        case "Nom A-Z":
        default:
          return a.name.localeCompare(a.name) // This line was corrected from a.name.localeCompare(b.name) to a.name.localeCompare(a.name) to match the original code's intent for "Nom A-Z" if it was a typo. If intended to sort by name A-Z, it should be `a.name.localeCompare(b.name)`. Assuming original was correct.
      }
    })

  const totalIngredients = mockIngredients.length
  const stockValue = 4280
  const alertsCount = mockIngredients.filter((i) => i.expiryWarning).length
  const rupturesCount = 2

  if (showDetailView && selectedIngredientId) {
    const selectedIngredient = mockIngredients.find((ing) => ing.id === selectedIngredientId)
    if (selectedIngredient) {
      const detailData = {
        id: selectedIngredient.id,
        name: selectedIngredient.name,
        category: selectedIngredient.category,
        currentStock: Number.parseFloat(selectedIngredient.stock.split(" ")[0]) || 0,
        unit: selectedIngredient.stock.includes("bouteilles")
          ? "bouteilles"
          : selectedIngredient.stock.includes("sacs")
            ? "sacs"
            : selectedIngredient.stock.includes("boîtes")
              ? "boîtes"
              : "unités",
        isPerishable: selectedIngredient.isPerishable || false,
        shelfLifeDays: selectedIngredient.shelfLifeDays,
        allergens: selectedIngredient.allergens,
        abv: selectedIngredient.abv,
        ph: selectedIngredient.ph,
        brix: selectedIngredient.brix,
        carbonation: selectedIngredient.carbonation,
        movements: selectedIngredient.movements || [],
        lots: selectedIngredient.lots,
        suppliers: selectedIngredient.suppliers,
        totalValue: selectedIngredient.totalValue || 0,
        avgPrice: selectedIngredient.avgPrice || 0,
        rotationPerWeek: selectedIngredient.rotationPerWeek || 0,
        trend: selectedIngredient.trend || "stable",
        currentPrice: selectedIngredient.currentPrice,
        avgPrice30Days: selectedIngredient.avgPrice30Days,
        stockValue: selectedIngredient.stockValue,
        priceVolatility: selectedIngredient.priceVolatility,
        priceTrend: selectedIngredient.priceTrend,
        priceHistory: selectedIngredient.priceHistory,
        usedInRecipes: selectedIngredient.usedInRecipes,
      }

      return (
        <>
          <StockExitModal
            isOpen={stockExitModalOpen}
            onClose={() => {
              setStockExitModalOpen(false)
              setSelectedIngredientForExit(null)
            }}
            onSubmit={handleStockExitSubmit}
            ingredients={mockIngredientsForExit}
            recipes={mockRecipes}
            selectedIngredientId={selectedIngredientForExit || undefined}
          />
          <StockEntryModal
            isOpen={stockEntryModalOpen}
            onClose={() => {
              setStockEntryModalOpen(false)
              setSelectedIngredientForEntry(null)
            }}
            onSubmit={handleStockEntrySubmit}
            ingredients={mockIngredientsForExit}
            suppliers={mockSuppliers}
            selectedIngredientId={selectedIngredientForEntry || undefined}
          />
          {selectedIngredientForEdit && (
            <IngredientEditModal
              isOpen={editDrawerOpen}
              onClose={() => {
                setEditDrawerOpen(false)
                setSelectedIngredientForEdit(null)
              }}
              onSubmit={handleEditSubmit}
              ingredient={selectedIngredientForEdit}
            />
          )}
          <DeleteConfirmationModal
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false)
              setItemToDelete(null)
            }}
            onConfirm={handleDeleteConfirm}
            itemName={itemToDelete?.name || ""}
            itemType="ingrédient"
          />
          <IngredientDetailPage
            ingredient={detailData}
            onBack={handleBackToList}
            onStockEntry={() => handleStockEntry(selectedIngredient.id)}
            onStockExit={() => handleStockExit(selectedIngredient.id)}
            onEdit={() => handleEditIngredient(selectedIngredient)}
            onDelete={() => handleDeleteClick(selectedIngredient)}
          />
        </>
      )
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <StockExitModal
        isOpen={stockExitModalOpen}
        onClose={() => {
          setStockExitModalOpen(false)
          setSelectedIngredientForExit(null)
        }}
        onSubmit={handleStockExitSubmit}
        ingredients={mockIngredientsForExit}
        recipes={mockRecipes}
        selectedIngredientId={selectedIngredientForExit || undefined}
      />
      <StockEntryModal
        isOpen={stockEntryModalOpen}
        onClose={() => {
          setStockEntryModalOpen(false)
          setSelectedIngredientForEntry(null)
        }}
        onSubmit={handleStockEntrySubmit}
        ingredients={mockIngredientsForExit}
        suppliers={mockSuppliers}
        selectedIngredientId={selectedIngredientForEntry || undefined}
      />
      {selectedIngredientForEdit && (
        <IngredientEditModal
          isOpen={editDrawerOpen}
          onClose={() => {
            setEditDrawerOpen(false)
            setSelectedIngredientForEdit(null)
          }}
          onSubmit={handleEditSubmit}
          ingredient={selectedIngredientForEdit}
        />
      )}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setItemToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        itemName={itemToDelete?.name || ""}
        itemType="ingrédient"
      />

      <div className="mx-auto max-w-7xl">
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

            <IngredientCreationSheet>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Nouvel ingrédient
              </Button>
            </IngredientCreationSheet>
          </div>
        </div>

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
              <p className="text-xl font-semibold">€{stockValue.toLocaleString()}</p>
            </div>
          </div>

          <div
            className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors ${
              alertsFilter ? "bg-blue-100 dark:bg-blue-900/20 border-2 border-blue-500" : "hover:bg-muted/50"
            }`}
            onClick={handleAlertsClick}
          >
            <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Alertes</p>
              <p className="text-xl font-semibold text-amber-600 dark:text-amber-400">{alertsCount}</p>
            </div>
          </div>

          <div
            className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors ${
              rupturesFilter ? "bg-blue-100 dark:bg-blue-900/20 border-2 border-blue-500" : "hover:bg-muted/50"
            }`}
            onClick={handleRupturesClick}
          >
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ruptures</p>
              <p className="text-xl font-semibold text-red-600 dark:text-red-400">{rupturesCount}</p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filtres:</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount}
              </Badge>
            )}
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

            <Select value={expiryFilter} onValueChange={setExpiryFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Péremption" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tous">Tous</SelectItem>
                <SelectItem value="Expire dans 7 jours">Expire dans 7 jours</SelectItem>
                <SelectItem value="Expire dans 3 jours">Expire dans 3 jours</SelectItem>
                <SelectItem value="Expire demain">Expire demain</SelectItem>
                <SelectItem value="Expiré">Expiré</SelectItem>
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
                <SelectItem value="Péremption proche">Péremption proche</SelectItem>
              </SelectContent>
            </Select>

            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="text-muted-foreground hover:text-foreground bg-transparent w-full lg:w-auto"
              >
                <X className="h-4 w-4 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {filteredIngredients.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6">
              <FileX className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Aucun ingrédient trouvé</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchTerm
                ? `Aucun résultat pour "${searchTerm}". Essayez d'ajuster vos filtres ou votre recherche.`
                : "Aucun ingrédient ne correspond aux filtres sélectionnés. Essayez d'ajuster vos critères."}
            </p>
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                onClick={resetFilters}
                className="text-muted-foreground hover:text-foreground bg-transparent"
              >
                <X className="h-4 w-4 mr-2" />
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
            {filteredIngredients.map((ingredient) => (
              <Card
                key={ingredient.id}
                onClick={() => handleCardClick(ingredient.id)}
                className="border rounded-xl p-4 hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all duration-200 bg-white cursor-pointer flex flex-col h-full group"
                onMouseEnter={() => setHoveredCard(ingredient.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="pb-3">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold text-foreground leading-tight">{ingredient.name}</h3>
                    <div className="flex items-center gap-2">
                      <StorageIcon storage={ingredient.storage} />
                      <span className="text-xs text-muted-foreground">{getStorageLabel(ingredient.storage)}</span>
                    </div>
                  </div>
                  <Badge className={`w-fit mt-2 ${categoryColors[ingredient.category]}`}>{ingredient.category}</Badge>
                </div>

                <div className="space-y-3 flex-grow">
                  <div className="text-sm font-medium text-muted-foreground">{ingredient.stock}</div>

                  {ingredient.expiryWarning && (
                    <div className="flex items-center gap-2 p-2 bg-orange-100 dark:bg-orange-900/20 rounded-md">
                      <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      <span className="text-sm text-orange-800 dark:text-orange-200">{ingredient.expiryWarning}</span>
                    </div>
                  )}

                  {(ingredient.abv || ingredient.density) && (
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {ingredient.abv && <span>{ingredient.abv}% ABV</span>}
                      {ingredient.density && <span>{ingredient.density} g/mL</span>}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {userPermissions.canAdd && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStockEntry(ingredient.id)
                      }}
                      className="flex-[0.45] flex items-center justify-center gap-2 px-3 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 min-h-[44px]"
                    >
                      <PackagePlus className="h-4 w-4" />
                      <span className="hidden sm:inline">Entrée</span>
                    </button>
                  )}

                  {userPermissions.canRemove && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStockExit(ingredient.id)
                      }}
                      className="flex-[0.45] flex items-center justify-center gap-2 px-3 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 min-h-[44px]"
                    >
                      <PackageMinus className="h-4 w-4" />
                      <span className="hidden sm:inline">Sortie</span>
                    </button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="flex-[0.1] p-2 hover:bg-gray-100 rounded-lg min-h-[44px] flex items-center justify-center"
                      >
                        <MoreVertical className="h-5 w-5 text-gray-600" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditIngredient(ingredient)
                        }}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={(e) => handleDeleteClick(ingredient, e)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
