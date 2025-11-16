import { useTranslation } from 'react-i18next'
import type { SortOption } from '@/types/models'

/**
 * Toolbar de colección con botón de filtros y selector de orden
 * - Botón Filtros visible solo en móvil/tablet
 * - Selector de orden siempre visible
 * - Contador de productos
 * Fase 8: Integrado con i18n para soporte bilingüe
 */

type CollectionToolbarProps = {
  productCount: number
  currentSort: SortOption
  onSortChange: (sort: SortOption) => void
  onFiltersClick: () => void
}

export default function CollectionToolbar({
  productCount,
  currentSort,
  onSortChange,
  onFiltersClick,
}: CollectionToolbarProps) {
  const { t } = useTranslation(['product', 'filters'])

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'featured', label: t('product:featured') },
    { value: 'best', label: t('product:bestSellers') },
    { value: 'dateDesc', label: t('product:newest') },
    { value: 'priceAsc', label: t('product:priceLowToHigh') },
    { value: 'priceDesc', label: t('product:priceHighToLow') },
    { value: 'az', label: t('product:nameAZ') },
    { value: 'za', label: t('product:nameZA') },
  ]

  return (
    <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-secondary-beige">
      {/* Botón de filtros (móvil/tablet) y contador */}
      <div className="flex items-center gap-4">
        <button
          onClick={onFiltersClick}
          className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-primary-brown text-primary-brown rounded-lg hover:bg-secondary-beige transition-colors"
          aria-label={t('filters:openFilters')}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="font-medium">{t('filters:filters')}</span>
        </button>

        <p className="text-text-light text-sm">
          {productCount} {productCount === 1 ? t('product:product') : t('product:products')}
        </p>
      </div>

      {/* Selector de orden */}
      <div className="flex items-center gap-2">
        <label htmlFor="sort-select" className="text-sm text-text-dark font-medium hidden sm:block">
          {t('filters:sortBy')}
        </label>
        <select
          id="sort-select"
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="px-4 py-2 bg-white border border-secondary-beige rounded-lg text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-brown focus:border-transparent cursor-pointer"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
