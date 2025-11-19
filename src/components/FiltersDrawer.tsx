import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { FilterOptions, Product } from '@/types/models'
import { getPriceRange, getUniqueOptionValues } from '@/lib/filters'

/**
 * Drawer lateral para filtros de colección
 * - Disponibilidad
 * - Rango de precio
 * - Material
 * - Color
 * - Largo
 * - Botones para aplicar y limpiar filtros
 * Fase 8: Integrado con i18n para soporte bilingüe
 */

type FiltersDrawerProps = {
  isOpen: boolean
  onClose: () => void
  filters: FilterOptions
  onApplyFilters: (filters: FilterOptions) => void
  allProducts: Product[]
}

export default function FiltersDrawer({
  isOpen,
  onClose,
  filters: initialFilters,
  onApplyFilters,
  allProducts,
}: FiltersDrawerProps) {
  const { t } = useTranslation('filters')
  const [filters, setFilters] = useState<FilterOptions>(initialFilters)

  // Sincronizar con filters externos cuando cambian
  useEffect(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  // Extraer opciones disponibles de todos los productos
  const priceRange = getPriceRange(allProducts)
  const materials = getUniqueOptionValues(allProducts, 'Material')
  const colors = getUniqueOptionValues(allProducts, 'Color')
  const lengths = getUniqueOptionValues(allProducts, 'Largo')

  const handleApply = () => {
    onApplyFilters(filters)
    onClose()
  }

  const handleClear = () => {
    const emptyFilters: FilterOptions = {}
    setFilters(emptyFilters)
    onApplyFilters(emptyFilters)
  }

  const toggleArrayFilter = (
    key: 'materials' | 'colors' | 'lengths',
    value: string
  ) => {
    const current = filters[key] || []
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]

    setFilters({ ...filters, [key]: updated.length > 0 ? updated : undefined })
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:translate-x-0 lg:shadow-soft lg:rounded-2xl overflow-y-auto`}
        role="dialog"
        aria-modal="true"
        aria-label={t('filterProducts')}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-200 p-6 flex items-center justify-between z-10">
          <h2 className="text-xl font-serif text-brand-terra">{t('filters')}</h2>
          <button
            onClick={onClose}
            className="lg:hidden text-brand-dark hover:text-brand-terra"
            aria-label={t('closeFilters')}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Filtros */}
        <div className="p-6 space-y-6">
          {/* Disponibilidad */}
          <div>
            <h3 className="font-medium text-brand-dark mb-3">{t('availability')}</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.inStockOnly || false}
                onChange={(e) =>
                  setFilters({ ...filters, inStockOnly: e.target.checked || undefined })
                }
                className="w-4 h-4 text-brand-terra focus:ring-brand-terra border-gray-300 rounded"
              />
              <span className="text-sm text-brand-dark">{t('inStockOnly')}</span>
            </label>
          </div>

          {/* Rango de precio */}
          <div>
            <h3 className="font-medium text-brand-dark mb-3">{t('price')}</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="price-min" className="text-xs text-gray-500">
                  {t('minPrice', { amount: filters.priceMin || priceRange.min })}
                </label>
                <input
                  id="price-min"
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={filters.priceMin || priceRange.min}
                  onChange={(e) =>
                    setFilters({ ...filters, priceMin: Number(e.target.value) })
                  }
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-brand-terra"
                />
              </div>
              <div>
                <label htmlFor="price-max" className="text-xs text-gray-500">
                  {t('maxPrice', { amount: filters.priceMax || priceRange.max })}
                </label>
                <input
                  id="price-max"
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={filters.priceMax || priceRange.max}
                  onChange={(e) =>
                    setFilters({ ...filters, priceMax: Number(e.target.value) })
                  }
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-brand-terra"
                />
              </div>
            </div>
          </div>

          {/* Material */}
          {materials.length > 0 && (
            <div>
              <h3 className="font-medium text-brand-dark mb-3">{t('material')}</h3>
              <div className="space-y-2">
                {materials.map((material) => (
                  <label key={material} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.materials?.includes(material) || false}
                      onChange={() => toggleArrayFilter('materials', material)}
                      className="w-4 h-4 text-brand-terra focus:ring-brand-terra border-gray-300 rounded"
                    />
                    <span className="text-sm text-brand-dark">{material}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Color */}
          {colors.length > 0 && (
            <div>
              <h3 className="font-medium text-brand-dark mb-3">{t('color')}</h3>
              <div className="space-y-2">
                {colors.map((color) => (
                  <label key={color} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.colors?.includes(color) || false}
                      onChange={() => toggleArrayFilter('colors', color)}
                      className="w-4 h-4 text-brand-terra focus:ring-brand-terra border-gray-300 rounded"
                    />
                    <span className="text-sm text-brand-dark">{color}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Largo */}
          {lengths.length > 0 && (
            <div>
              <h3 className="font-medium text-brand-dark mb-3">{t('length')}</h3>
              <div className="space-y-2">
                {lengths.map((length) => (
                  <label key={length} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.lengths?.includes(length) || false}
                      onChange={() => toggleArrayFilter('lengths', length)}
                      className="w-4 h-4 text-brand-terra focus:ring-brand-terra border-gray-300 rounded"
                    />
                    <span className="text-sm text-brand-dark">{length}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer con botones */}
        <div className="sticky bottom-0 bg-white border-t border-stone-200 p-6 space-y-3">
          <button
            onClick={handleApply}
            className="w-full py-3 bg-brand-terra text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors"
          >
            {t('viewResults')}
          </button>
          <button
            onClick={handleClear}
            className="w-full py-3 bg-white border border-brand-terra text-brand-terra rounded-lg font-medium hover:bg-stone-200 transition-colors"
          >
            {t('clearFilters')}
          </button>
        </div>
      </aside>
    </>
  )
}
