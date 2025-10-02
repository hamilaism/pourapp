"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  MoreVertical,
  PackagePlus,
  PackageMinus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Euro,
  Package,
  Activity,
  Droplets,
  Gauge,
  Sparkles,
  DollarSign,
  AlertCircle,
  CheckCircle,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface PriceHistoryEntry {
  date: string
  price: number
  supplier: string
}

interface EnhancedSupplier {
  id: string
  name: string
  currentPrice: number
  avgPrice: number
  lastDelivery: string
  reliability: number
  trend: "increasing" | "decreasing" | "stable"
  isBestDeal: boolean
  priceHistory?: number[]
}

interface Movement {
  date: string
  type: "in" | "out"
  qty: number
  reason: string
  user?: string
  supplier?: string
  price?: number
}

interface Lot {
  id: string
  batchNumber: string
  quantity: number
  expiryDate: string
  daysUntilExpiry: number
  status: "good" | "warning" | "critical"
}

interface UsedInRecipe {
  name: string
  costPerCocktail: number
  margin: number
}

interface IngredientDetail {
  id: string
  name: string
  category: string
  currentStock: number
  unit: string
  isPerishable: boolean
  shelfLifeDays?: number
  allergens?: string[]
  abv?: number
  ph?: number
  brix?: number
  carbonation?: number
  movements: Movement[]
  lots?: Lot[]
  suppliers?: EnhancedSupplier[]
  totalValue: number
  avgPrice: number
  rotationPerWeek: number
  trend: "up" | "down" | "stable"
  currentPrice?: number
  avgPrice30Days?: number
  stockValue?: number
  priceVolatility?: "stable" | "variable" | "volatile"
  priceTrend?: number
  priceHistory?: PriceHistoryEntry[]
  usedInRecipes?: UsedInRecipe[]
}

interface IngredientDetailPageProps {
  ingredient: IngredientDetail
  onBack: () => void
  onStockEntry: () => void
  onStockExit: () => void
  onEdit?: () => void
  onDelete?: () => void // Added onDelete prop
}

const allergenIcons: Record<string, string> = {
  MILK: "🥛",
  GLUTEN: "🌾",
  NUTS: "🥜",
  EGGS: "🥚",
  SOY: "🫘",
  FISH: "🐟",
  SHELLFISH: "🦐",
}

const allergenLabels: Record<string, string> = {
  MILK: "Lait",
  GLUTEN: "Gluten",
  NUTS: "Fruits à coque",
  EGGS: "Œufs",
  SOY: "Soja",
  FISH: "Poisson",
  SHELLFISH: "Crustacés",
}

function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length === 0) return <span className="text-xs text-muted-foreground">-</span>

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((value, index) => {
        const height = ((value - min) / range) * 100
        const isLast = index === data.length - 1
        return (
          <div
            key={index}
            className={`w-1 rounded-t ${isLast ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`}
            style={{ height: `${height}%` }}
          />
        )
      })}
    </div>
  )
}

export default function IngredientDetailPage({
  ingredient,
  onBack,
  onStockEntry,
  onStockExit,
  onEdit,
  onDelete, // Added onDelete prop
}: IngredientDetailPageProps) {
  const nextExpiry = ingredient.lots?.[0]
  const hasCharacteristics = ingredient.abv || ingredient.ph || ingredient.brix || ingredient.carbonation

  const bestSupplier = ingredient.suppliers?.find((s) => s.isBestDeal)
  const priceIncreaseAlert = ingredient.priceTrend && ingredient.priceTrend > 10
  const priceDecreaseOpportunity = ingredient.priceTrend && ingredient.priceTrend < -5

  const chartData = ingredient.priceHistory?.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString("fr-FR", { month: "short", day: "numeric" }),
    price: entry.price,
    supplier: entry.supplier,
  }))

  const avgPriceForChart = ingredient.avgPrice30Days || ingredient.avgPrice

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4 -ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-3">{ingredient.name}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {ingredient.category}
                </Badge>
                {ingredient.isPerishable && (
                  <Badge variant="outline" className="border-amber-500 text-amber-700 dark:text-amber-400">
                    <Clock className="mr-1 h-3 w-3" />
                    Périssable
                  </Badge>
                )}
                {ingredient.shelfLifeDays && (
                  <span className="text-sm text-muted-foreground">Conservation: {ingredient.shelfLifeDays} jours</span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={onStockEntry} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <PackagePlus className="mr-2 h-4 w-4" />
                Entrée
              </Button>
              <Button
                onClick={onStockExit}
                size="sm"
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 bg-transparent"
              >
                <PackageMinus className="mr-2 h-4 w-4" />
                Sortie
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Allergen Banner */}
        {ingredient.allergens && ingredient.allergens.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <span className="font-semibold text-amber-900 dark:text-amber-200">Allergènes présents</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {ingredient.allergens.map((allergen) => (
                <Badge
                  key={allergen}
                  variant="outline"
                  className="border-amber-400 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200"
                >
                  <span className="mr-1">{allergenIcons[allergen]}</span>
                  {allergenLabels[allergen]}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Metrics Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Stock actuel</span>
              <Package className="h-4 w-4 text-blue-500" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold">
                {ingredient.currentStock} {ingredient.unit}
              </span>
              {ingredient.trend === "up" && <TrendingUp className="h-5 w-5 text-green-500 mb-1" />}
              {ingredient.trend === "down" && <TrendingDown className="h-5 w-5 text-red-500 mb-1" />}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Valeur totale</span>
              <Euro className="h-4 w-4 text-green-500" />
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-bold">€{ingredient.totalValue.toFixed(2)}</span>
              <p className="text-xs text-muted-foreground">
                Moy: €{ingredient.avgPrice.toFixed(2)}/{ingredient.unit}
              </p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Rotation</span>
              <Activity className="h-4 w-4 text-purple-500" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold">{ingredient.rotationPerWeek}/sem</span>
              {ingredient.trend === "up" && <TrendingUp className="h-5 w-5 text-green-500 mb-1" />}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Prochaine expiration</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            {nextExpiry ? (
              <div className="space-y-1">
                <span
                  className={`text-2xl font-bold ${
                    nextExpiry.status === "critical"
                      ? "text-red-600"
                      : nextExpiry.status === "warning"
                        ? "text-amber-600"
                        : "text-green-600"
                  }`}
                >
                  {nextExpiry.daysUntilExpiry}j
                </span>
                <p className="text-xs text-muted-foreground">
                  {nextExpiry.quantity} {ingredient.unit}
                </p>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Non périssable</span>
            )}
          </Card>
        </div>

        {/* Characteristics */}
        {hasCharacteristics && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Caractéristiques</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {ingredient.abv !== undefined && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Teneur en alcool</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-2xl font-bold">{ingredient.abv}%</span>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${ingredient.abv}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {ingredient.ph !== undefined && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Gauge className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">pH</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-2xl font-bold">{ingredient.ph.toFixed(1)}</span>
                    <div className="w-full h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500">
                      <div
                        className="h-2 w-1 bg-black rounded-full"
                        style={{ marginLeft: `${(ingredient.ph / 14) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {ingredient.ph < 4 ? "Acide" : ingredient.ph < 7 ? "Légèrement acide" : "Neutre"}
                    </p>
                  </div>
                </div>
              )}

              {ingredient.brix !== undefined && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">Brix (Sucre)</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-2xl font-bold">{ingredient.brix}°</span>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full transition-all"
                        style={{ width: `${(ingredient.brix / 50) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {ingredient.brix < 10 ? "Peu sucré" : ingredient.brix < 25 ? "Moyennement sucré" : "Très sucré"}
                    </p>
                  </div>
                </div>
              )}

              {ingredient.carbonation !== undefined && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-cyan-500" />
                    <span className="text-sm font-medium">Carbonatation</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-2xl font-bold">{ingredient.carbonation}/5</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-8 w-full rounded ${
                            level <= ingredient.carbonation! ? "bg-cyan-500" : "bg-gray-200 dark:bg-gray-700"
                          }`}
                          style={{ height: `${level * 6}px` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        <Tabs defaultValue="movements" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="movements">Mouvements</TabsTrigger>
            <TabsTrigger value="lots">Lots</TabsTrigger>
            <TabsTrigger value="finances">Finances</TabsTrigger>
            <TabsTrigger value="statistics">Statistiques</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="movements" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Historique des mouvements</h3>
              <div className="space-y-4">
                {ingredient.movements.map((movement, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div
                      className={`p-2 rounded-full ${
                        movement.type === "in" ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"
                      }`}
                    >
                      {movement.type === "in" ? (
                        <PackagePlus className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <PackageMinus className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {movement.type === "in" ? "Entrée" : "Sortie"}: {movement.qty} {ingredient.unit}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {movement.reason}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {movement.date}
                        {movement.supplier && ` • ${movement.supplier}`}
                        {movement.user && ` • ${movement.user}`}
                      </p>
                    </div>
                    {movement.price && (
                      <span className="text-sm font-medium text-green-600">€{movement.price.toFixed(2)}</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="lots" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Lots en stock</h3>
              {ingredient.lots && ingredient.lots.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Lot</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Date d'expiration</TableHead>
                      <TableHead>Jours restants</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ingredient.lots.map((lot) => (
                      <TableRow key={lot.id}>
                        <TableCell className="font-medium">{lot.batchNumber}</TableCell>
                        <TableCell>
                          {lot.quantity} {ingredient.unit}
                        </TableCell>
                        <TableCell>{lot.expiryDate}</TableCell>
                        <TableCell>{lot.daysUntilExpiry} jours</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              lot.status === "critical"
                                ? "border-red-500 text-red-600"
                                : lot.status === "warning"
                                  ? "border-amber-500 text-amber-600"
                                  : "border-green-500 text-green-600"
                            }
                          >
                            {lot.status === "critical" ? "Critique" : lot.status === "warning" ? "Attention" : "Bon"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">Produit non périssable - Pas de lots à gérer</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="finances" className="mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Analyse financière</h3>
                <Badge
                  variant="outline"
                  className={
                    ingredient.priceVolatility === "stable"
                      ? "border-green-500 text-green-600"
                      : ingredient.priceVolatility === "volatile"
                        ? "border-red-500 text-red-600"
                        : "border-amber-500 text-amber-600"
                  }
                >
                  {ingredient.priceVolatility === "stable"
                    ? "Prix stable"
                    : ingredient.priceVolatility === "volatile"
                      ? "Prix volatile"
                      : "Prix variable"}
                </Badge>
              </div>

              {/* Financial Alerts */}
              {(priceIncreaseAlert || priceDecreaseOpportunity || bestSupplier) && (
                <div className="space-y-2 mb-6">
                  {priceIncreaseAlert && (
                    <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-red-900 dark:text-red-200">Augmentation de prix détectée</p>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          Le prix a augmenté de {ingredient.priceTrend?.toFixed(1)}% depuis le dernier achat
                        </p>
                      </div>
                    </div>
                  )}

                  {priceDecreaseOpportunity && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-green-900 dark:text-green-200">Opportunité d'achat</p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Le prix a baissé de {Math.abs(ingredient.priceTrend || 0).toFixed(1)}% - Bon moment pour
                          commander
                        </p>
                      </div>
                    </div>
                  )}

                  {bestSupplier && (
                    <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-blue-900 dark:text-blue-200">Meilleure offre disponible</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {bestSupplier.name} propose le meilleur prix: €{bestSupplier.currentPrice?.toFixed(2)}/
                          {ingredient.unit}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Financial Metrics Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Prix actuel moyen</span>
                    <Euro className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold">
                      €{(ingredient.currentPrice || ingredient.avgPrice).toFixed(2)}
                    </span>
                    {ingredient.priceTrend !== undefined && (
                      <div className="flex items-center gap-1 mb-1">
                        {ingredient.priceTrend > 0 ? (
                          <>
                            <TrendingUp className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-red-600">+{ingredient.priceTrend.toFixed(1)}%</span>
                          </>
                        ) : ingredient.priceTrend < 0 ? (
                          <>
                            <TrendingDown className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600">{ingredient.priceTrend.toFixed(1)}%</span>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">stable</span>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">par {ingredient.unit}</p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Prix moyen 30j</span>
                    <Activity className="h-4 w-4 text-purple-500" />
                  </div>
                  <span className="text-2xl font-bold">
                    €{(ingredient.avgPrice30Days || ingredient.avgPrice).toFixed(2)}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">par {ingredient.unit}</p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Valeur du stock</span>
                    <Package className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="text-2xl font-bold">
                    €{(ingredient.stockValue || ingredient.totalValue).toFixed(2)}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {ingredient.currentStock} {ingredient.unit}
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Coût par cocktail</span>
                    <Sparkles className="h-4 w-4 text-amber-500" />
                  </div>
                  <span className="text-2xl font-bold">
                    €{((ingredient.currentPrice || ingredient.avgPrice) * 0.05).toFixed(2)}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">estimation moyenne</p>
                </div>
              </div>

              {/* Price Evolution Chart */}
              {chartData && chartData.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-4">Évolution des prix (90 derniers jours)</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`€${value.toFixed(2)}`, "Prix"]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: "#10b981", r: 4 }}
                        name="Prix"
                      />
                      <Line
                        type="monotone"
                        dataKey={() => avgPriceForChart}
                        stroke="#6b7280"
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Prix moyen"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Supplier Comparison Table */}
              {ingredient.suppliers && ingredient.suppliers.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-4">Comparaison des fournisseurs</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fournisseur</TableHead>
                        <TableHead>Prix actuel</TableHead>
                        <TableHead>Prix moyen</TableHead>
                        <TableHead>Dernière commande</TableHead>
                        <TableHead>Tendance</TableHead>
                        <TableHead>Évolution</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ingredient.suppliers.map((supplier) => (
                        <TableRow
                          key={supplier.id}
                          className={supplier.isBestDeal ? "bg-green-50 dark:bg-green-900/10" : ""}
                        >
                          <TableCell className="font-medium">{supplier.name}</TableCell>
                          <TableCell>
                            <span
                              className={supplier.isBestDeal ? "text-green-600 dark:text-green-400 font-semibold" : ""}
                            >
                              €{supplier.currentPrice?.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>€{supplier.avgPrice?.toFixed(2)}</TableCell>
                          <TableCell>{supplier.lastDelivery}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {supplier.trend === "increasing" && (
                                <>
                                  <TrendingUp className="h-4 w-4 text-red-500" />
                                  <span className="text-xs text-red-600">Hausse</span>
                                </>
                              )}
                              {supplier.trend === "decreasing" && (
                                <>
                                  <TrendingDown className="h-4 w-4 text-green-500" />
                                  <span className="text-xs text-green-600">Baisse</span>
                                </>
                              )}
                              {supplier.trend === "stable" && (
                                <span className="text-xs text-muted-foreground">Stable</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{supplier.priceHistory && <Sparkline data={supplier.priceHistory} />}</TableCell>
                          <TableCell>
                            {supplier.isBestDeal && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Meilleur prix
                              </Badge>
                            )}
                            {supplier.currentPrice &&
                              supplier.avgPrice &&
                              supplier.currentPrice > supplier.avgPrice * 1.1 && (
                                <Badge variant="outline" className="border-red-500 text-red-600">
                                  Prix élevé
                                </Badge>
                              )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {ingredient.usedInRecipes && ingredient.usedInRecipes.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-4">Analyse ROI - Impact sur les cocktails</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cocktail</TableHead>
                        <TableHead>Coût par cocktail</TableHead>
                        <TableHead>Marge</TableHead>
                        <TableHead>Impact prix</TableHead>
                        <TableHead>Recommandation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ingredient.usedInRecipes.map((recipe, index) => {
                        const priceImpact = ingredient.priceTrend
                          ? (recipe.costPerCocktail * ingredient.priceTrend) / 100
                          : 0
                        const newMargin = recipe.margin - (priceImpact / recipe.costPerCocktail) * 100

                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{recipe.name}</TableCell>
                            <TableCell>€{recipe.costPerCocktail.toFixed(2)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span
                                  className={
                                    recipe.margin >= 70
                                      ? "text-green-600 dark:text-green-400"
                                      : recipe.margin >= 60
                                        ? "text-amber-600 dark:text-amber-400"
                                        : "text-red-600 dark:text-red-400"
                                  }
                                >
                                  {recipe.margin.toFixed(0)}%
                                </span>
                                <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      recipe.margin >= 70
                                        ? "bg-green-500"
                                        : recipe.margin >= 60
                                          ? "bg-amber-500"
                                          : "bg-red-500"
                                    }`}
                                    style={{ width: `${recipe.margin}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {priceImpact !== 0 && (
                                <div className="flex items-center gap-1">
                                  {priceImpact > 0 ? (
                                    <>
                                      <TrendingUp className="h-4 w-4 text-red-500" />
                                      <span className="text-sm text-red-600">+€{priceImpact.toFixed(2)}</span>
                                    </>
                                  ) : (
                                    <>
                                      <TrendingDown className="h-4 w-4 text-green-500" />
                                      <span className="text-sm text-green-600">€{priceImpact.toFixed(2)}</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {priceImpact > 0 && newMargin < 65 ? (
                                <Badge variant="outline" className="border-amber-500 text-amber-600">
                                  Ajuster prix menu
                                </Badge>
                              ) : priceImpact < 0 ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  Marge améliorée
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-gray-300 text-gray-600">
                                  Stable
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="statistics" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Statistiques de consommation</h3>
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Graphiques et statistiques à venir</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Documents techniques</h3>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Fiches techniques, certificats et documents à venir</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
