/**
 * Modelos de dominio para Son de Nudos
 * Define tipos TypeScript para productos, variantes, carrito y más
 */

export type Money = {
  amount: number
  currency: 'USD'
}

export type Variant = {
  id: string
  title: string
  sku?: string
  price: Money
  compareAtPrice?: Money
  available: boolean
  options: Record<string, string> // { Largo: "16 in", Material: "Acero", Color: "Dorado" }
  stock?: number
  image?: string
}

export type Product = {
  id: string
  handle: string
  title: string
  descriptionHtml: string
  images: string[]
  price: Money
  compareAtPrice?: Money
  options: string[] // ["Largo", "Material", "Color"]
  variants: Variant[]
  tags: string[]
  availableForSale: boolean
  createdAt: string
  collectionId?: string | null
}

export type CartItem = {
  productId: string
  variantId: string
  title: string
  variantTitle: string
  quantity: number
  unitPrice: Money
  image?: string
}

/**
 * Opciones de filtrado para la colección
 */
export type FilterOptions = {
  inStockOnly?: boolean
  priceMin?: number
  priceMax?: number
  materials?: string[]
  colors?: string[]
  lengths?: string[]
  collectionIds?: string[]
}

/**
 * Opciones de ordenamiento para la colección
 */
export type SortOption =
  | 'featured'
  | 'best'
  | 'az'
  | 'za'
  | 'priceAsc'
  | 'priceDesc'
  | 'dateAsc'
  | 'dateDesc'

/**
 * Configuración de paginación
 */
export type PaginationOptions = {
  page: number
  pageSize: number
}
