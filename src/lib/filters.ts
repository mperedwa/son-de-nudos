/**
 * Funciones puras para filtrado, ordenamiento y paginación de productos
 * Todas las funciones son inmutables y no modifican los arrays originales
 */

import type { Product, FilterOptions, SortOption, PaginationOptions } from '@/types/models'

/**
 * Aplica filtros a una lista de productos
 * @param products - Lista de productos a filtrar
 * @param filters - Opciones de filtrado
 * @returns Nueva lista de productos filtrados
 */
export function filterProducts(products: Product[], filters: FilterOptions): Product[] {
  let filtered = [...products]

  // Filtro: Solo en stock
  if (filters.inStockOnly) {
    filtered = filtered.filter((p) => p.availableForSale)
  }

  // Filtro: Rango de precio
  if (filters.priceMin !== undefined) {
    filtered = filtered.filter((p) => p.price.amount >= filters.priceMin!)
  }
  if (filters.priceMax !== undefined) {
    filtered = filtered.filter((p) => p.price.amount <= filters.priceMax!)
  }

  // Filtro: Materiales
  if (filters.materials && filters.materials.length > 0) {
    filtered = filtered.filter((p) =>
      p.variants.some((v) =>
        filters.materials!.some(
          (material) =>
            v.options.Material?.toLowerCase().includes(material.toLowerCase())
        )
      )
    )
  }

  // Filtro: Colores
  if (filters.colors && filters.colors.length > 0) {
    filtered = filtered.filter((p) =>
      p.variants.some((v) =>
        filters.colors!.some(
          (color) => v.options.Color?.toLowerCase() === color.toLowerCase()
        )
      )
    )
  }

  // Filtro: Largos
  if (filters.lengths && filters.lengths.length > 0) {
    filtered = filtered.filter((p) =>
      p.variants.some((v) =>
        filters.lengths!.some(
          (length) => v.options.Largo?.toLowerCase() === length.toLowerCase()
        )
      )
    )
  }

  return filtered
}

/**
 * Ordena una lista de productos según la opción especificada
 * @param products - Lista de productos a ordenar
 * @param sortOption - Opción de ordenamiento
 * @returns Nueva lista de productos ordenados
 */
export function sortProducts(products: Product[], sortOption: SortOption): Product[] {
  const sorted = [...products]

  switch (sortOption) {
    case 'featured':
      // Mantener orden original (asumiendo que viene ordenado por featured)
      return sorted

    case 'best':
      // Ordenar por ventas (simulado: por tags 'bestseller')
      return sorted.sort((a, b) => {
        const aIsBest = a.tags.includes('bestseller') ? 1 : 0
        const bIsBest = b.tags.includes('bestseller') ? 1 : 0
        return bIsBest - aIsBest
      })

    case 'az':
      // Ordenar alfabéticamente A-Z
      return sorted.sort((a, b) => a.title.localeCompare(b.title))

    case 'za':
      // Ordenar alfabéticamente Z-A
      return sorted.sort((a, b) => b.title.localeCompare(a.title))

    case 'priceAsc':
      // Ordenar por precio ascendente
      return sorted.sort((a, b) => a.price.amount - b.price.amount)

    case 'priceDesc':
      // Ordenar por precio descendente
      return sorted.sort((a, b) => b.price.amount - a.price.amount)

    case 'dateAsc':
      // Ordenar por fecha ascendente (más antiguo primero)
      return sorted.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )

    case 'dateDesc':
      // Ordenar por fecha descendente (más reciente primero)
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

    default:
      return sorted
  }
}

/**
 * Aplica paginación a una lista de productos
 * @param products - Lista de productos
 * @param pagination - Opciones de paginación
 * @returns Nueva lista de productos paginados
 */
export function paginateProducts(
  products: Product[],
  pagination: PaginationOptions
): Product[] {
  const { page, pageSize } = pagination
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize

  return products.slice(startIndex, endIndex)
}

/**
 * Calcula el número total de páginas
 * @param totalProducts - Número total de productos
 * @param pageSize - Tamaño de página
 * @returns Número de páginas
 */
export function getTotalPages(totalProducts: number, pageSize: number): number {
  return Math.ceil(totalProducts / pageSize)
}

/**
 * Extrae todos los valores únicos de un campo de opciones de variantes
 * @param products - Lista de productos
 * @param optionName - Nombre de la opción (ej: "Material", "Color", "Largo")
 * @returns Array de valores únicos
 */
export function getUniqueOptionValues(
  products: Product[],
  optionName: string
): string[] {
  const values = new Set<string>()

  products.forEach((product) => {
    product.variants.forEach((variant) => {
      const value = variant.options[optionName]
      if (value) {
        values.add(value)
      }
    })
  })

  return Array.from(values).sort()
}

/**
 * Extrae el rango de precios de una lista de productos
 * @param products - Lista de productos
 * @returns Objeto con precio mínimo y máximo
 */
export function getPriceRange(products: Product[]): { min: number; max: number } {
  if (products.length === 0) {
    return { min: 0, max: 0 }
  }

  const prices = products.map((p) => p.price.amount)
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  }
}

/**
 * Aplica todos los filtros, orden y paginación en una sola función
 * @param products - Lista de productos original
 * @param filters - Opciones de filtrado
 * @param sortOption - Opción de ordenamiento
 * @param pagination - Opciones de paginación (opcional)
 * @returns Lista de productos procesados
 */
export function processProducts(
  products: Product[],
  filters: FilterOptions,
  sortOption: SortOption,
  pagination?: PaginationOptions
): Product[] {
  let processed = filterProducts(products, filters)
  processed = sortProducts(processed, sortOption)

  if (pagination) {
    processed = paginateProducts(processed, pagination)
  }

  return processed
}

/**
 * Busca productos por texto en título, descripción y tags
 * @param products - Lista de productos
 * @param query - Texto de búsqueda
 * @returns Lista de productos que coinciden con la búsqueda
 */
export function searchProducts(products: Product[], query: string): Product[] {
  if (!query || query.trim() === '') {
    return []
  }

  const q = query.toLowerCase().trim()

  return products.filter((product) => {
    // Buscar en título
    if (product.title.toLowerCase().includes(q)) {
      return true
    }

    // Buscar en descripción
    if (product.descriptionHtml && product.descriptionHtml.toLowerCase().includes(q)) {
      return true
    }

    // Buscar en tags
    if (product.tags && product.tags.some((tag) => tag.toLowerCase().includes(q))) {
      return true
    }

    // Buscar en opciones de variantes (material, color, etc.)
    if (product.variants.some((variant) =>
      Object.values(variant.options).some(
        (value) => value && value.toLowerCase().includes(q)
      )
    )) {
      return true
    }

    return false
  })
}
