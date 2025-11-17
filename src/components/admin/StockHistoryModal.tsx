/**
 * StockHistoryModal Component
 *
 * Modal para visualizar el historial de cambios de stock de una variante
 */

import { useEffect, useState } from 'react'
import { fetchStockHistory, type VariantWithProduct, type Database } from '@/lib/supabase'

// ============================================================================
// TYPES
// ============================================================================

interface StockHistoryModalProps {
  variant: VariantWithProduct | null
  isOpen: boolean
  onClose: () => void
}

type StockHistoryEntry = Database['public']['Tables']['stock_history']['Row']

// ============================================================================
// REASON LABELS
// ============================================================================

const REASON_LABELS: Record<string, string> = {
  restock: 'Reabastecimiento',
  sale: 'Venta',
  adjustment: 'Ajuste',
  return: 'Devolución',
  damage: 'Daño/Pérdida',
}

// ============================================================================
// COMPONENT
// ============================================================================

export function StockHistoryModal({ variant, isOpen, onClose }: StockHistoryModalProps) {
  const [history, setHistory] = useState<StockHistoryEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ==========================================================================
  // DATA FETCHING
  // ==========================================================================

  useEffect(() => {
    if (isOpen && variant) {
      loadHistory()
    }
  }, [isOpen, variant])

  async function loadHistory() {
    if (!variant) return

    try {
      setLoading(true)
      setError(null)
      const data = await fetchStockHistory(variant.id)
      setHistory(data)
    } catch (err) {
      console.error('Error loading stock history:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar el historial')
    } finally {
      setLoading(false)
    }
  }

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  function handleClose() {
    setHistory([])
    setError(null)
    onClose()
  }

  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  function formatChange(change: number): JSX.Element {
    const isPositive = change > 0
    const isNegative = change < 0

    return (
      <span
        className={`
          font-semibold
          ${isPositive ? 'text-green-600' : ''}
          ${isNegative ? 'text-red-600' : ''}
        `}
      >
        {isPositive && '+'}
        {change}
      </span>
    )
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  if (!isOpen || !variant) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl border-2 border-[#D4A574]/30 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#D4A574]/20">
          <h2 className="text-xl font-bold text-[#8B6F47]">Historial de Stock</h2>
          <p className="text-sm text-[#6B5844]/70 mt-1">
            {variant.product.title} - {variant.title}
          </p>
          <p className="text-xs text-[#6B5844]/50 mt-1">SKU: {variant.sku}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#8B6F47] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
              <button
                type="button"
                onClick={loadHistory}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && history.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#6B5844]/50">No hay cambios registrados para esta variante</p>
            </div>
          )}

          {/* History Table */}
          {!loading && !error && history.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F5E6D3] sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#6B5844]">Fecha</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#6B5844]">Razón</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-[#6B5844]">Stock Anterior</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-[#6B5844]">Cambio</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-[#6B5844]">Stock Nuevo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4A574]/20">
                  {history.map((entry) => (
                    <tr key={entry.id} className="hover:bg-[#F5E6D3]/30 transition-colors">
                      {/* Date */}
                      <td className="px-3 py-2 text-xs text-[#6B5844]">
                        {formatDate(entry.created_at)}
                      </td>

                      {/* Reason */}
                      <td className="px-3 py-2">
                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-[#F5E6D3] text-[#6B5844] rounded">
                          {REASON_LABELS[entry.reason] || entry.reason}
                        </span>
                      </td>

                      {/* Previous Stock */}
                      <td className="px-3 py-2 text-right text-sm font-medium text-[#6B5844]">
                        {entry.previous_stock}
                      </td>

                      {/* Change */}
                      <td className="px-3 py-2 text-center text-sm">
                        {formatChange(entry.change)}
                      </td>

                      {/* New Stock */}
                      <td className="px-3 py-2 text-right text-sm font-bold text-[#8B6F47]">
                        {entry.new_stock}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Results Count */}
          {!loading && !error && history.length > 0 && (
            <div className="mt-4 text-center text-sm text-[#6B5844]/70">
              Mostrando {history.length} cambio{history.length !== 1 ? 's' : ''} más reciente
              {history.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#D4A574]/20">
          <button
            type="button"
            onClick={handleClose}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#8B6F47] to-[#D4A574] rounded-lg hover:from-[#6B5844] hover:to-[#8B6F47] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
