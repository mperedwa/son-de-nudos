/**
 * Supabase Public API
 * Funciones para lectura pública de productos (sin autenticación)
 *
 * Estas funciones son usadas por la página pública para mostrar productos a los clientes.
 * Usan la anon key que tiene permisos de lectura via RLS policies.
 */

import { supabase, type Database } from './supabase'

// ==============================================================================
// TYPES FOR PUBLIC API
// ==============================================================================

type ProductRow = Database['public']['Tables']['products']['Row']
type VariantRow = Database['public']['Tables']['variants']['Row']

/**
 * Producto con variantes - formato para la página pública
 */
export interface PublicProduct {
  id: string
  handle: string
  title: string
  title_en: string | null
  descriptionHtml: string | null
  descriptionHtml_en: string | null
  images: string[]
  price: {
    amount: number
    currency: string
  }
  compareAtPrice: {
    amount: number
    currency: string
  } | null
  tags: string[]
  availableForSale: boolean
  variants: PublicVariant[]
  // Opciones únicas disponibles (para el VariantSelector)
  options: string[]
  createdAt: string
}

/**
 * Variante - formato para la página pública
 */
export interface PublicVariant {
  id: string
  title: string
  sku: string
  price: {
    amount: number
    currency: string
  }
  compareAtPrice: {
    amount: number
    currency: string
  } | null
  available: boolean
  stock: number
  image: string | null
  options: Record<string, string | null>
}

// ==============================================================================
// HELPER FUNCTIONS
// ==============================================================================

/**
 * Convierte un precio numérico al formato Money
 */
function toMoney(amount: number | null, currency = 'USD'): { amount: number; currency: string } | null {
  if (amount === null || amount === undefined) return null
  return { amount, currency }
}

/**
 * Extrae las opciones únicas de las variantes de un producto
 */
function extractUniqueOptions(variants: VariantRow[]): string[] {
  const optionKeys = new Set<string>()

  variants.forEach((v) => {
    if (v.options && typeof v.options === 'object') {
      Object.entries(v.options).forEach(([key, value]) => {
        // Solo agregar si tiene un valor no nulo
        if (value !== null && value !== undefined && value !== '') {
          optionKeys.add(key)
        }
      })
    }
  })

  // Ordenar las opciones en un orden lógico
  const order = ['Largo', 'Grosor', 'MaterialCordon', 'MaterialAccesorios', 'ColorPrimario', 'ColorSecundario']
  return Array.from(optionKeys).sort((a, b) => {
    const indexA = order.indexOf(a)
    const indexB = order.indexOf(b)
    if (indexA === -1 && indexB === -1) return a.localeCompare(b)
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })
}

/**
 * Transforma un producto de Supabase al formato público
 */
function transformProduct(product: ProductRow, variants: VariantRow[]): PublicProduct {
  const transformedVariants: PublicVariant[] = variants.map((v) => ({
    id: v.id,
    title: v.title,
    sku: v.sku,
    price: toMoney(v.price)!,
    compareAtPrice: toMoney(v.compare_at_price),
    available: v.available && v.stock > 0,
    stock: v.stock,
    image: v.image,
    options: v.options || {},
  }))

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    title_en: product.title_en,
    descriptionHtml: product.description_html,
    descriptionHtml_en: product.description_html_en,
    images: product.images || [],
    price: toMoney(product.price)!,
    compareAtPrice: toMoney(product.compare_at_price),
    tags: product.tags || [],
    availableForSale: product.available_for_sale,
    variants: transformedVariants,
    options: extractUniqueOptions(variants),
    createdAt: product.created_at,
  }
}

// ==============================================================================
// PUBLIC API FUNCTIONS
// ==============================================================================

/**
 * Obtiene todos los productos disponibles con sus variantes
 * Solo retorna productos con available_for_sale = true
 */
export async function getPublicProducts(): Promise<PublicProduct[]> {
  // 1. Obtener productos disponibles
  const { data: products, error: productsError } = (await supabase
    .from('products')
    .select('*')
    .eq('available_for_sale', true)
    .order('created_at', { ascending: false })) as { data: ProductRow[] | null; error: any }

  if (productsError) {
    console.error('[getPublicProducts] Error fetching products:', productsError)
    throw new Error(`Error al cargar productos: ${productsError.message}`)
  }

  if (!products || products.length === 0) {
    return []
  }

  // 2. Obtener todas las variantes de los productos
  const productIds = products.map((p) => p.id)
  const { data: variants, error: variantsError } = (await supabase
    .from('variants')
    .select('*')
    .in('product_id', productIds)
    .eq('available', true)) as { data: VariantRow[] | null; error: any }

  if (variantsError) {
    console.error('[getPublicProducts] Error fetching variants:', variantsError)
    throw new Error(`Error al cargar variantes: ${variantsError.message}`)
  }

  // 3. Agrupar variantes por producto
  const variantsByProduct = new Map<string, VariantRow[]>()
  variants?.forEach((v) => {
    const list = variantsByProduct.get(v.product_id) || []
    list.push(v)
    variantsByProduct.set(v.product_id, list)
  })

  // 4. Transformar al formato público
  return products.map((p) => transformProduct(p, variantsByProduct.get(p.id) || []))
}

/**
 * Obtiene un producto específico por su handle
 * Retorna null si no existe o no está disponible
 */
export async function getPublicProductByHandle(handle: string): Promise<PublicProduct | null> {
  // 1. Obtener el producto
  const { data: product, error: productError } = (await supabase
    .from('products')
    .select('*')
    .eq('handle', handle)
    .single()) as { data: ProductRow | null; error: any }

  if (productError) {
    if (productError.code === 'PGRST116') {
      // No encontrado
      return null
    }
    console.error('[getPublicProductByHandle] Error fetching product:', productError)
    throw new Error(`Error al cargar producto: ${productError.message}`)
  }

  if (!product) {
    return null
  }

  // 2. Obtener las variantes del producto
  const { data: variants, error: variantsError } = (await supabase
    .from('variants')
    .select('*')
    .eq('product_id', product.id)
    .order('created_at', { ascending: true })) as { data: VariantRow[] | null; error: any }

  if (variantsError) {
    console.error('[getPublicProductByHandle] Error fetching variants:', variantsError)
    throw new Error(`Error al cargar variantes: ${variantsError.message}`)
  }

  // 3. Transformar al formato público
  return transformProduct(product, variants || [])
}

/**
 * Obtiene productos por categoría (tag)
 */
export async function getPublicProductsByCategory(category: string): Promise<PublicProduct[]> {
  // Supabase soporta búsqueda en arrays con contains
  const { data: products, error: productsError } = (await supabase
    .from('products')
    .select('*')
    .eq('available_for_sale', true)
    .contains('tags', [category])
    .order('created_at', { ascending: false })) as { data: ProductRow[] | null; error: any }

  if (productsError) {
    console.error('[getPublicProductsByCategory] Error:', productsError)
    throw new Error(`Error al cargar productos: ${productsError.message}`)
  }

  if (!products || products.length === 0) {
    return []
  }

  // Obtener variantes
  const productIds = products.map((p) => p.id)
  const { data: variants } = (await supabase
    .from('variants')
    .select('*')
    .in('product_id', productIds)
    .eq('available', true)) as { data: VariantRow[] | null; error: any }

  // Agrupar variantes por producto
  const variantsByProduct = new Map<string, VariantRow[]>()
  variants?.forEach((v) => {
    const list = variantsByProduct.get(v.product_id) || []
    list.push(v)
    variantsByProduct.set(v.product_id, list)
  })

  return products.map((p) => transformProduct(p, variantsByProduct.get(p.id) || []))
}

/**
 * Busca productos por texto (título o descripción)
 */
export async function searchPublicProducts(query: string): Promise<PublicProduct[]> {
  const searchTerm = `%${query}%`

  const { data: products, error: productsError } = (await supabase
    .from('products')
    .select('*')
    .eq('available_for_sale', true)
    .or(`title.ilike.${searchTerm},title_en.ilike.${searchTerm},description_html.ilike.${searchTerm}`)
    .order('created_at', { ascending: false })) as { data: ProductRow[] | null; error: any }

  if (productsError) {
    console.error('[searchPublicProducts] Error:', productsError)
    throw new Error(`Error al buscar productos: ${productsError.message}`)
  }

  if (!products || products.length === 0) {
    return []
  }

  // Obtener variantes
  const productIds = products.map((p) => p.id)
  const { data: variants } = (await supabase
    .from('variants')
    .select('*')
    .in('product_id', productIds)
    .eq('available', true)) as { data: VariantRow[] | null; error: any }

  // Agrupar variantes por producto
  const variantsByProduct = new Map<string, VariantRow[]>()
  variants?.forEach((v) => {
    const list = variantsByProduct.get(v.product_id) || []
    list.push(v)
    variantsByProduct.set(v.product_id, list)
  })

  return products.map((p) => transformProduct(p, variantsByProduct.get(p.id) || []))
}
