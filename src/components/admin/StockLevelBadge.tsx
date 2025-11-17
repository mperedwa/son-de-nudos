/**
 * StockLevelBadge Component
 *
 * Badge visual para indicar el nivel de stock de una variante
 */

import { getStockLevel, type StockLevel } from '@/lib/supabase'

// ============================================================================
// TYPES
// ============================================================================

interface StockLevelBadgeProps {
  stock: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

// ============================================================================
// STYLING CONFIG
// ============================================================================

const STOCK_LEVEL_CONFIG: Record<
  StockLevel,
  {
    label: string
    emoji: string
    bgColor: string
    textColor: string
    borderColor: string
  }
> = {
  out: {
    label: 'Agotado',
    emoji: '🚨',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
  critical: {
    label: 'Crítico',
    emoji: '⚠️',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
  },
  low: {
    label: 'Bajo',
    emoji: '⚡',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
  },
  normal: {
    label: 'Normal',
    emoji: '✅',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
}

const SIZE_CONFIG = {
  sm: {
    padding: 'px-2 py-0.5',
    text: 'text-xs',
    emoji: 'text-sm',
  },
  md: {
    padding: 'px-3 py-1',
    text: 'text-sm',
    emoji: 'text-base',
  },
  lg: {
    padding: 'px-4 py-1.5',
    text: 'text-base',
    emoji: 'text-lg',
  },
}

// ============================================================================
// COMPONENT
// ============================================================================

export function StockLevelBadge({ stock, showLabel = true, size = 'md' }: StockLevelBadgeProps) {
  const level = getStockLevel(stock)
  const config = STOCK_LEVEL_CONFIG[level]
  const sizeConfig = SIZE_CONFIG[size]

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        border
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeConfig.padding} ${sizeConfig.text}
      `}
      title={`Stock: ${stock} unidades - Nivel: ${config.label}`}
    >
      <span className={sizeConfig.emoji}>{config.emoji}</span>
      {showLabel && (
        <>
          <span>{config.label}</span>
          <span className="font-semibold">({stock})</span>
        </>
      )}
      {!showLabel && <span className="font-semibold">{stock}</span>}
    </span>
  )
}
