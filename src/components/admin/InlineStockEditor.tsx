/**
 * InlineStockEditor Component
 *
 * Editor inline para actualizar el stock de una variante con razón
 */

import { useState } from 'react'
import { updateStockWithHistory, type StockChangeReason } from '@/lib/supabase'

// ============================================================================
// TYPES
// ============================================================================

interface InlineStockEditorProps {
  variantId: string
  currentStock: number
  onStockUpdated: (newStock: number) => void
}

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

export function InlineStockEditor({ variantId, currentStock, onStockUpdated }: InlineStockEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newStock, setNewStock] = useState(currentStock.toString())
  const [reason, setReason] = useState<StockChangeReason>('adjustment')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  function handleEdit() {
    setIsEditing(true)
    setNewStock(currentStock.toString())
    setReason('adjustment')
    setError(null)
  }

  function handleCancel() {
    setIsEditing(false)
    setNewStock(currentStock.toString())
    setError(null)
  }

  async function handleSave() {
    const stockValue = parseInt(newStock, 10)

    // Validation
    if (isNaN(stockValue) || stockValue < 0) {
      setError('Stock debe ser un número mayor o igual a 0')
      return
    }

    if (stockValue === currentStock) {
      setIsEditing(false)
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      await updateStockWithHistory(variantId, stockValue, reason)

      onStockUpdated(stockValue)
      setIsEditing(false)
    } catch (err) {
      console.error('Error updating stock:', err)
      setError(err instanceof Error ? err.message : 'Error al actualizar el stock')
    } finally {
      setIsSaving(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={handleEdit}
        className="text-[#8B6F47] hover:text-[#6B5844] underline decoration-dotted"
        title="Click para editar"
      >
        Editar
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-2 p-2 bg-[#F5E6D3]/50 rounded-lg border border-[#D4A574]/30">
      {/* Stock Input */}
      <div>
        <label htmlFor={`stock-${variantId}`} className="block text-xs font-medium text-[#6B5844] mb-1">
          Nuevo Stock
        </label>
        <input
          type="number"
          id={`stock-${variantId}`}
          value={newStock}
          onChange={(e) => setNewStock(e.target.value)}
          onKeyDown={handleKeyDown}
          min="0"
          step="1"
          disabled={isSaving}
          className="w-20 px-2 py-1 text-sm border border-[#D4A574]/30 rounded focus:outline-none focus:ring-2 focus:ring-[#8B6F47] disabled:opacity-50"
          autoFocus
        />
      </div>

      {/* Reason Select */}
      <div>
        <label htmlFor={`reason-${variantId}`} className="block text-xs font-medium text-[#6B5844] mb-1">
          Razón
        </label>
        <select
          id={`reason-${variantId}`}
          value={reason}
          onChange={(e) => setReason(e.target.value as StockChangeReason)}
          disabled={isSaving}
          className="w-full px-2 py-1 text-sm border border-[#D4A574]/30 rounded focus:outline-none focus:ring-2 focus:ring-[#8B6F47] disabled:opacity-50"
        >
          {REASON_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 px-3 py-1 text-sm font-medium text-white bg-gradient-to-r from-[#8B6F47] to-[#D4A574] rounded hover:from-[#6B5844] hover:to-[#8B6F47] disabled:opacity-50 transition-colors"
        >
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSaving}
          className="px-3 py-1 text-sm font-medium text-[#6B5844] bg-white rounded border border-[#D4A574]/30 hover:bg-[#F5E6D3] disabled:opacity-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
