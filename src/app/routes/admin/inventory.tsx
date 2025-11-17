/**
 * Admin Inventory Page
 * Fase 11: Panel de Administración - Gestión de Inventario
 *
 * Página consolidada para gestión de stock de todas las variantes
 */

import { useEffect, useState, useMemo } from 'react'
import { fetchVariantsWithProducts, type VariantWithProduct, type StockLevel } from '@/lib/supabase'
import { StockLevelBadge } from '@/components/admin/StockLevelBadge'
import { QuickAdjustModal } from '@/components/admin/QuickAdjustModal'
import { StockHistoryModal } from '@/components/admin/StockHistoryModal'

// ============================================================================
// TYPES
// ============================================================================

type SortField = 'product' | 'variant' | 'sku' | 'stock'
type SortDirection = 'asc' | 'desc'

interface Filters {
  search: string
  stockLevel: StockLevel | 'all'
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminInventory() {
  // State
  const [variants, setVariants] = useState<VariantWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters & Search
  const [filters, setFilters] = useState<Filters>({
    search: '',
    stockLevel: 'all',
  })

  // Sorting
  const [sortField, setSortField] = useState<SortField>('product')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Modals
  const [adjustModalVariant, setAdjustModalVariant] = useState<VariantWithProduct | null>(null)
  const [historyModalVariant, setHistoryModalVariant] = useState<VariantWithProduct | null>(null)

  // ==========================================================================
  // DATA FETCHING
  // ==========================================================================

  useEffect(() => {
    loadVariants()
  }, [])

  async function loadVariants() {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchVariantsWithProducts()
      setVariants(data)
    } catch (err) {
      console.error('Error loading variants:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar el inventario')
    } finally {
      setLoading(false)
    }
  }

  // ==========================================================================
  // FILTERING & SORTING
  // ==========================================================================

  const filteredAndSortedVariants = useMemo(() => {
    let result = [...variants]

    // Search filter (product title, variant title, SKU)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (v) =>
          v.product.title.toLowerCase().includes(searchLower) ||
          v.title.toLowerCase().includes(searchLower) ||
          v.sku.toLowerCase().includes(searchLower)
      )
    }

    // Stock level filter
    if (filters.stockLevel !== 'all') {
      result = result.filter((v) => {
        if (filters.stockLevel === 'out') return v.stock === 0
        if (filters.stockLevel === 'critical') return v.stock > 0 && v.stock <= 3
        if (filters.stockLevel === 'low') return v.stock > 3 && v.stock <= 5
        if (filters.stockLevel === 'normal') return v.stock > 5
        return true
      })
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'product':
          comparison = a.product.title.localeCompare(b.product.title)
          break
        case 'variant':
          comparison = a.title.localeCompare(b.title)
          break
        case 'sku':
          comparison = a.sku.localeCompare(b.sku)
          break
        case 'stock':
          comparison = a.stock - b.stock
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [variants, filters, sortField, sortDirection])

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFilters((prev) => ({ ...prev, search: e.target.value }))
  }

  function handleStockLevelChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFilters((prev) => ({ ...prev, stockLevel: e.target.value as StockLevel | 'all' }))
  }

  function clearFilters() {
    setFilters({ search: '', stockLevel: 'all' })
  }

  function handleStockUpdated(variantId: string, newStock: number) {
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, stock: newStock } : v))
    )
  }

  // ==========================================================================
  // STATS
  // ==========================================================================

  const stats = useMemo(() => {
    const totalVariants = variants.length
    const outOfStock = variants.filter((v) => v.stock === 0).length
    const critical = variants.filter((v) => v.stock > 0 && v.stock <= 3).length
    const low = variants.filter((v) => v.stock > 3 && v.stock <= 5).length
    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0)

    return { totalVariants, outOfStock, critical, low, totalStock }
  }, [variants])

  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================

  function renderSortIcon(field: SortField) {
    if (sortField !== field) {
      return <span className="text-[#6B5844]/30">⇅</span>
    }
    return sortDirection === 'asc' ? <span className="text-[#8B6F47]">↑</span> : <span className="text-[#8B6F47]">↓</span>
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#8B6F47]">Gestión de Inventario</h1>
        <p className="text-[#6B5844]/70 mt-1">Control consolidado de stock de todas las variantes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border-2 border-[#D4A574]/30 p-4">
          <p className="text-sm text-[#6B5844]/70">Total Variantes</p>
          <p className="text-2xl font-bold text-[#8B6F47] mt-1">{stats.totalVariants}</p>
        </div>
        <div className="bg-white rounded-lg border-2 border-[#D4A574]/30 p-4">
          <p className="text-sm text-[#6B5844]/70">Stock Total</p>
          <p className="text-2xl font-bold text-[#8B6F47] mt-1">{stats.totalStock}</p>
        </div>
        <div className="bg-red-50 rounded-lg border-2 border-red-200 p-4">
          <p className="text-sm text-red-700">Agotados</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{stats.outOfStock}</p>
        </div>
        <div className="bg-orange-50 rounded-lg border-2 border-orange-200 p-4">
          <p className="text-sm text-orange-700">Críticos (1-3)</p>
          <p className="text-2xl font-bold text-orange-700 mt-1">{stats.critical}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg border-2 border-yellow-200 p-4">
          <p className="text-sm text-yellow-700">Bajos (4-5)</p>
          <p className="text-2xl font-bold text-yellow-700 mt-1">{stats.low}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border-2 border-[#D4A574]/30 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-[#6B5844] mb-1">
              Buscar
            </label>
            <input
              type="text"
              id="search"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Producto, variante o SKU..."
              className="w-full px-3 py-2 border border-[#D4A574]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47]"
            />
          </div>

          {/* Stock Level Filter */}
          <div className="w-full md:w-64">
            <label htmlFor="stockLevel" className="block text-sm font-medium text-[#6B5844] mb-1">
              Nivel de Stock
            </label>
            <select
              id="stockLevel"
              value={filters.stockLevel}
              onChange={handleStockLevelChange}
              className="w-full px-3 py-2 border border-[#D4A574]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47]"
            >
              <option value="all">Todos</option>
              <option value="out">🚨 Agotados</option>
              <option value="critical">⚠️ Críticos (1-3)</option>
              <option value="low">⚡ Bajos (4-5)</option>
              <option value="normal">✅ Normales (&gt;5)</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(filters.search || filters.stockLevel !== 'all') && (
            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-[#6B5844] hover:text-[#8B6F47] transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-[#8B6F47] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <button
            type="button"
            onClick={loadVariants}
            className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg border-2 border-[#D4A574]/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#8B6F47] to-[#D4A574] text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Imagen</th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-[#6B5844]/20"
                    onClick={() => handleSort('product')}
                  >
                    <div className="flex items-center gap-2">
                      Producto {renderSortIcon('product')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-[#6B5844]/20"
                    onClick={() => handleSort('variant')}
                  >
                    <div className="flex items-center gap-2">
                      Variante {renderSortIcon('variant')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-[#6B5844]/20"
                    onClick={() => handleSort('sku')}
                  >
                    <div className="flex items-center gap-2">
                      SKU {renderSortIcon('sku')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-[#6B5844]/20"
                    onClick={() => handleSort('stock')}
                  >
                    <div className="flex items-center gap-2">
                      Stock {renderSortIcon('stock')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Precio</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Disponible</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4A574]/20">
                {filteredAndSortedVariants.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-[#6B5844]/50">
                      {filters.search || filters.stockLevel !== 'all'
                        ? 'No se encontraron variantes con los filtros aplicados'
                        : 'No hay variantes en el inventario'}
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedVariants.map((variant) => (
                    <tr key={variant.id} className="hover:bg-[#F5E6D3]/30 transition-colors">
                      {/* Image */}
                      <td className="px-4 py-3">
                        <img
                          src={variant.image || variant.product.images[0] || '/placeholder.png'}
                          alt={variant.title}
                          className="w-12 h-12 object-cover rounded-lg border border-[#D4A574]/30"
                        />
                      </td>

                      {/* Product */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#8B6F47]">{variant.product.title}</p>
                        <p className="text-xs text-[#6B5844]/60">{variant.product.handle}</p>
                      </td>

                      {/* Variant */}
                      <td className="px-4 py-3">
                        <p className="text-sm text-[#6B5844]">{variant.title}</p>
                        {variant.options && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(variant.options).map(([key, value]) => (
                              <span
                                key={key}
                                className="text-xs px-2 py-0.5 bg-[#F5E6D3] text-[#6B5844] rounded"
                              >
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* SKU */}
                      <td className="px-4 py-3">
                        <code className="text-sm font-mono text-[#6B5844]">{variant.sku}</code>
                      </td>

                      {/* Stock with Badge */}
                      <td className="px-4 py-3">
                        <StockLevelBadge stock={variant.stock} size="sm" />
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-[#8B6F47]">
                          ${(variant.price / 100).toFixed(2)}
                        </p>
                        {variant.compare_at_price && (
                          <p className="text-xs text-[#6B5844]/50 line-through">
                            ${(variant.compare_at_price / 100).toFixed(2)}
                          </p>
                        )}
                      </td>

                      {/* Available */}
                      <td className="px-4 py-3 text-center">
                        {variant.available ? (
                          <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                        ) : (
                          <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setAdjustModalVariant(variant)}
                            className="px-3 py-1 text-sm font-medium text-white bg-gradient-to-r from-[#8B6F47] to-[#D4A574] rounded-lg hover:from-[#6B5844] hover:to-[#8B6F47] transition-colors"
                            title="Ajuste rápido"
                          >
                            Ajustar
                          </button>
                          <button
                            type="button"
                            onClick={() => setHistoryModalVariant(variant)}
                            className="px-3 py-1 text-sm font-medium text-[#8B6F47] bg-[#F5E6D3] rounded-lg hover:bg-[#D4A574]/30 transition-colors"
                            title="Ver historial"
                          >
                            Historial
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Results Count */}
          {filteredAndSortedVariants.length > 0 && (
            <div className="px-4 py-3 bg-[#F5E6D3]/50 border-t border-[#D4A574]/20 text-sm text-[#6B5844]">
              Mostrando {filteredAndSortedVariants.length} de {variants.length} variante
              {variants.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {adjustModalVariant && (
        <QuickAdjustModal
          variant={adjustModalVariant}
          isOpen={true}
          onClose={() => setAdjustModalVariant(null)}
          onStockUpdated={(newStock) => handleStockUpdated(adjustModalVariant.id, newStock)}
        />
      )}

      {historyModalVariant && (
        <StockHistoryModal
          variant={historyModalVariant}
          isOpen={true}
          onClose={() => setHistoryModalVariant(null)}
        />
      )}
    </div>
  )
}
