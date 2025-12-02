import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Product, FilterOptions, SortOption, Variant } from '@/types/models'
import Breadcrumbs from '@/components/Breadcrumbs'
import CollectionToolbar from '@/components/CollectionToolbar'
import FiltersDrawer from '@/components/FiltersDrawer'
import ProductGrid from '@/components/ProductGrid'
import { processProducts } from '@/lib/filters'
import { getPublicProducts, type PublicProduct } from '@/lib/supabase-public'

/**
 * Transforma un PublicProduct de Supabase al formato Product usado por los componentes
 * Usa el idioma actual para seleccionar título y descripción
 */
function transformToProduct(p: PublicProduct, lang: string): Product {
  const isEnglish = lang === 'en'
  return {
    id: p.id,
    handle: p.handle,
    title: isEnglish && p.title_en ? p.title_en : p.title,
    descriptionHtml: isEnglish && p.descriptionHtml_en ? p.descriptionHtml_en : (p.descriptionHtml || ''),
    images: p.images,
    price: { amount: p.price.amount, currency: 'USD' as const },
    compareAtPrice: p.compareAtPrice ? { amount: p.compareAtPrice.amount, currency: 'USD' as const } : undefined,
    options: p.options,
    variants: p.variants.map((v): Variant => ({
      id: v.id,
      title: v.title,
      sku: v.sku,
      price: { amount: v.price.amount, currency: 'USD' as const },
      compareAtPrice: v.compareAtPrice ? { amount: v.compareAtPrice.amount, currency: 'USD' as const } : undefined,
      available: v.available,
      stock: v.stock,
      image: v.image || undefined,
      options: Object.fromEntries(
        Object.entries(v.options).filter(([, val]) => val !== null)
      ) as Record<string, string>,
    })),
    tags: p.tags,
    availableForSale: p.availableForSale,
    createdAt: p.createdAt,
  }
}

/**
 * Página principal: Colección de collares
 * - Carga productos desde Supabase API pública
 * - Gestiona filtros y orden con URLSearchParams
 * - Grid responsivo de productos
 * - Drawer de filtros (móvil) y sidebar (desktop)
 *
 * Fase 11: Integrado con Supabase (lectura pública)
 * Fase 8: Integrado con i18n para soporte bilingüe
 */
export default function CollectionPage() {
  const { t, i18n } = useTranslation(['navigation', 'messages', 'common'])
  const [searchParams, setSearchParams] = useSearchParams()
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)

  // Cargar productos desde Supabase API pública
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const publicProducts = await getPublicProducts()
        const products = publicProducts.map((p) => transformToProduct(p, i18n.language))
        setAllProducts(products)
      } catch (err) {
        const message = err instanceof Error ? err.message : t('messages:errorLoadingProducts')
        setError(message)
        console.error('[CollectionPage] Error:', err)
      }

      setIsLoading(false)
    }

    loadProducts()
  }, [i18n.language, t])

  // Leer filtros de URL
  const filters = useMemo<FilterOptions>(() => {
    return {
      inStockOnly: searchParams.get('inStock') === 'true' || undefined,
      priceMin: searchParams.get('priceMin')
        ? Number(searchParams.get('priceMin'))
        : undefined,
      priceMax: searchParams.get('priceMax')
        ? Number(searchParams.get('priceMax'))
        : undefined,
      materials: searchParams.get('materials')?.split(',').filter(Boolean) || undefined,
      colors: searchParams.get('colors')?.split(',').filter(Boolean) || undefined,
      lengths: searchParams.get('lengths')?.split(',').filter(Boolean) || undefined,
    }
  }, [searchParams])

  // Leer orden de URL
  const sortOption: SortOption = (searchParams.get('sort') as SortOption) || 'featured'

  // Aplicar filtros y orden
  const filteredProducts = useMemo(() => {
    return processProducts(allProducts, filters, sortOption)
  }, [allProducts, filters, sortOption])

  // Actualizar filtros en URL
  const handleApplyFilters = (newFilters: FilterOptions) => {
    const params = new URLSearchParams(searchParams)

    // Limpiar filtros existentes
    params.delete('inStock')
    params.delete('priceMin')
    params.delete('priceMax')
    params.delete('materials')
    params.delete('colors')
    params.delete('lengths')

    // Agregar nuevos filtros
    if (newFilters.inStockOnly) params.set('inStock', 'true')
    if (newFilters.priceMin) params.set('priceMin', String(newFilters.priceMin))
    if (newFilters.priceMax) params.set('priceMax', String(newFilters.priceMax))
    if (newFilters.materials && newFilters.materials.length > 0) {
      params.set('materials', newFilters.materials.join(','))
    }
    if (newFilters.colors && newFilters.colors.length > 0) {
      params.set('colors', newFilters.colors.join(','))
    }
    if (newFilters.lengths && newFilters.lengths.length > 0) {
      params.set('lengths', newFilters.lengths.join(','))
    }

    setSearchParams(params)
  }

  // Actualizar orden en URL
  const handleSortChange = (newSort: SortOption) => {
    const params = new URLSearchParams(searchParams)
    params.set('sort', newSort)
    setSearchParams(params)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: t('navigation:home'), href: '/' },
          { label: t('common:shop'), href: '/' },
          { label: t('navigation:necklaces'), href: '/' },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-4xl font-serif text-brand-terra mb-2">{t('navigation:necklaces')}</h1>
        <p className="text-gray-500">{t('navigation:necklacesDescription')}</p>
      </div>

      {/* Mensaje de error si falla la carga */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Layout con filtros y productos */}
      <div className="flex gap-8">
        {/* Filtros sidebar (desktop) */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <FiltersDrawer
            isOpen={true}
            onClose={() => {}}
            filters={filters}
            onApplyFilters={handleApplyFilters}
            allProducts={allProducts}
          />
        </div>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          <CollectionToolbar
            productCount={filteredProducts.length}
            currentSort={sortOption}
            onSortChange={handleSortChange}
            onFiltersClick={() => setIsFiltersOpen(true)}
          />

          <ProductGrid products={filteredProducts} isLoading={isLoading} />
        </div>
      </div>

      {/* Filtros drawer (móvil) */}
      <div className="lg:hidden">
        <FiltersDrawer
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          filters={filters}
          onApplyFilters={handleApplyFilters}
          allProducts={allProducts}
        />
      </div>
    </div>
  )
}
