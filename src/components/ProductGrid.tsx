import { useTranslation } from 'react-i18next'
import type { Product } from '@/types/models'
import ProductCard from '@/components/ProductCard'

/**
 * Grid responsivo de productos
 * - 2 columnas en móvil
 * - 3 columnas en tablet (md)
 * - 4 columnas en desktop (lg)
 * - Gap de 6 (1.5rem / 24px)
 * - Maneja estados vacío y carga
 * Fase 8: Integrado con i18n para soporte bilingüe
 */

type ProductGridProps = {
  products: Product[]
  isLoading?: boolean
}

export default function ProductGrid({ products, isLoading = false }: ProductGridProps) {
  const { t } = useTranslation(['product', 'filters'])

  // Estado de carga
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-soft overflow-hidden animate-pulse"
          >
            <div className="aspect-square bg-secondary-beige" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-secondary-beige rounded w-3/4" />
              <div className="h-4 bg-secondary-beige rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Estado vacío
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <svg
            className="w-24 h-24 mx-auto text-text-light mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="text-xl font-serif text-primary-brown mb-2">
            {t('noProductsFound')}
          </h3>
          <p className="text-text-light">
            {t('tryAdjustingFilters')}
          </p>
        </div>
      </div>
    )
  }

  // Grid de productos
  return (
    <div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      role="list"
      aria-label={t('filters:productsAvailable')}
    >
      {products.map((product) => (
        <div key={product.id} role="listitem">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  )
}
