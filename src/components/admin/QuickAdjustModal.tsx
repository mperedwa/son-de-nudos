/**
 * QuickAdjustModal Component
 *
 * Modal para ajustes rápidos de stock con operaciones +, -, =
 */

import { useState } from 'react'
import { updateStockWithHistory, type StockChangeReason, type VariantWithProduct } from '@/lib/supabase'

// ============================================================================
// TYPES
// ============================================================================

interface QuickAdjustModalProps {
  variant: VariantWithProduct
  isOpen: boolean
  onClose: () => void
  onStockUpdated: (newStock: number) => void
}

type AdjustMode = 'add' | 'subtract' | 'set'

// ============================================================================
// REASON OPTIONS
// ============================================================================

const REASON_OPTIONS: { value: StockChangeReason; label: string }[] = [
  { value: 'restock', label: 'Reabastecimiento' },
  { value: 'sale', label: 'Venta' },
  { value: 'adjustment', label: 'Ajuste' },
  { value: 'return', label: 'Devolución' },
  { value: 'damage', label: 'Daño/Pérdida' },
]

// ============================================================================
// COMPONENT
// ============================================================================

export function QuickAdjustModal({ variant, isOpen, onClose, onStockUpdated }: QuickAdjustModalProps) {
  const [mode, setMode] = useState<AdjustMode>('set')
  const [value, setValue] = useState('0')
  const [reason, setReason] = useState<StockChangeReason>('adjustment')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ==========================================================================
  // COMPUTED VALUES
  // ==========================================================================

  function calculateNewStock(): number {
    const numValue = parseInt(value, 10)
    if (isNaN(numValue)) return variant.stock

    switch (mode) {
      case 'add':
        return variant.stock + numValue
      case 'subtract':
        return Math.max(0, variant.stock - numValue)
      case 'set':
        return numValue
      default:
        return variant.stock
    }
  }

  const newStock = calculateNewStock()
  const stockChange = newStock - variant.stock

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  function handleClose() {
    if (isSaving) return
    setMode('set')
    setValue('0')
    setReason('adjustment')
    setError(null)
    onClose()
  }

  async function handleSave() {
    const stockValue = calculateNewStock()

    // Validation
    if (isNaN(stockValue) || stockValue < 0) {
      setError('Stock debe ser un número mayor o igual a 0')
      return
    }

    if (stockValue === variant.stock) {
      setError('El stock no ha cambiado')
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      await updateStockWithHistory(variant.id, stockValue, reason)

      onStockUpdated(stockValue)
      handleClose()
    } catch (err) {
      console.error('Error updating stock:', err)
      setError(err instanceof Error ? err.message : 'Error al actualizar el stock')
    } finally {
      setIsSaving(false)
    }
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl border-2 border-[#D4A574]/30">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#D4A574]/20">
          <h2 className="text-xl font-bold text-[#8B6F47]">Ajuste Rápido de Stock</h2>
          <p className="text-sm text-[#6B5844]/70 mt-1">
            {variant.product.title} - {variant.title}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Current Stock */}
          <div className="p-3 bg-[#F5E6D3] rounded-lg border border-[#D4A574]/30">
            <p className="text-sm text-[#6B5844]/70">Stock Actual</p>
            <p className="text-2xl font-bold text-[#8B6F47]">{variant.stock} unidades</p>
          </div>

          {/* Mode Buttons */}
          <div>
            <label className="block text-sm font-medium text-[#6B5844] mb-2">Operación</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMode('add')}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-colors
                  ${
                    mode === 'add'
                      ? 'bg-gradient-to-r from-[#8B6F47] to-[#D4A574] text-white'
                      : 'bg-[#F5E6D3] text-[#6B5844] hover:bg-[#D4A574]/30'
                  }
                `}
              >
                + Sumar
              </button>
              <button
                type="button"
                onClick={() => setMode('subtract')}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-colors
                  ${
                    mode === 'subtract'
                      ? 'bg-gradient-to-r from-[#8B6F47] to-[#D4A574] text-white'
                      : 'bg-[#F5E6D3] text-[#6B5844] hover:bg-[#D4A574]/30'
                  }
                `}
              >
                − Restar
              </button>
              <button
                type="button"
                onClick={() => setMode('set')}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-colors
                  ${
                    mode === 'set'
                      ? 'bg-gradient-to-r from-[#8B6F47] to-[#D4A574] text-white'
                      : 'bg-[#F5E6D3] text-[#6B5844] hover:bg-[#D4A574]/30'
                  }
                `}
              >
                = Establecer
              </button>
            </div>
          </div>

          {/* Value Input */}
          <div>
            <label htmlFor="adjust-value" className="block text-sm font-medium text-[#6B5844] mb-1">
              {mode === 'add' && 'Cantidad a sumar'}
              {mode === 'subtract' && 'Cantidad a restar'}
              {mode === 'set' && 'Nuevo stock total'}
            </label>
            <input
              type="number"
              id="adjust-value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              min="0"
              step="1"
              disabled={isSaving}
              className="w-full px-3 py-2 border border-[#D4A574]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] disabled:opacity-50"
              placeholder="Ingresa una cantidad"
            />
          </div>

          {/* Reason Select */}
          <div>
            <label htmlFor="adjust-reason" className="block text-sm font-medium text-[#6B5844] mb-1">
              Razón del ajuste
            </label>
            <select
              id="adjust-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value as StockChangeReason)}
              disabled={isSaving}
              className="w-full px-3 py-2 border border-[#D4A574]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] disabled:opacity-50"
            >
              {REASON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Preview */}
          <div className="p-3 bg-[#F5E6D3] rounded-lg border border-[#D4A574]/30">
            <p className="text-sm text-[#6B5844]/70">Nuevo Stock</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-[#8B6F47]">{newStock} unidades</p>
              {stockChange !== 0 && (
                <p
                  className={`text-sm font-medium ${stockChange > 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  ({stockChange > 0 ? '+' : ''}
                  {stockChange})
                </p>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#D4A574]/20 flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="flex-1 px-4 py-2 text-sm font-medium text-[#6B5844] bg-[#F5E6D3] rounded-lg hover:bg-[#D4A574]/30 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || stockChange === 0}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#8B6F47] to-[#D4A574] rounded-lg hover:from-[#6B5844] hover:to-[#8B6F47] disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}
