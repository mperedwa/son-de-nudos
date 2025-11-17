/**
 * CouponStatusBadge Component
 *
 * Visual badge para mostrar el estado de un cupón
 * Estados: active, inactive, expired, exhausted
 */

// ============================================================================
// TYPES
// ============================================================================

export type CouponStatus = 'active' | 'inactive' | 'expired' | 'exhausted'

interface CouponStatusBadgeProps {
  active: boolean
  validUntil: string | null
  maxUses: number | null
  currentUses: number
  size?: 'sm' | 'md' | 'lg'
}

// ============================================================================
// STATUS CONFIG
// ============================================================================

const STATUS_CONFIG: Record<CouponStatus, {
  label: string
  emoji: string
  bgColor: string
  textColor: string
  borderColor: string
}> = {
  active: {
    label: 'Activo',
    emoji: '✅',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  inactive: {
    label: 'Inactivo',
    emoji: '⏸️',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
  },
  expired: {
    label: 'Expirado',
    emoji: '⏰',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
  },
  exhausted: {
    label: 'Agotado',
    emoji: '🚫',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
}

// ============================================================================
// SIZE CONFIG
// ============================================================================

const SIZE_CONFIG = {
  sm: {
    container: 'px-2 py-0.5 text-xs',
    emoji: 'text-sm',
  },
  md: {
    container: 'px-3 py-1 text-sm',
    emoji: 'text-base',
  },
  lg: {
    container: 'px-4 py-1.5 text-base',
    emoji: 'text-lg',
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getCouponStatus(
  active: boolean,
  validUntil: string | null,
  maxUses: number | null,
  currentUses: number
): CouponStatus {
  // Check if exhausted (max uses reached)
  if (maxUses !== null && currentUses >= maxUses) {
    return 'exhausted'
  }

  // Check if expired (past valid_until date)
  if (validUntil) {
    const now = new Date()
    const expiryDate = new Date(validUntil)
    if (now > expiryDate) {
      return 'expired'
    }
  }

  // Check active flag
  if (!active) {
    return 'inactive'
  }

  // Otherwise, it's active
  return 'active'
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CouponStatusBadge({
  active,
  validUntil,
  maxUses,
  currentUses,
  size = 'md',
}: CouponStatusBadgeProps) {
  const status = getCouponStatus(active, validUntil, maxUses, currentUses)
  const config = STATUS_CONFIG[status]
  const sizeConfig = SIZE_CONFIG[size]

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 rounded-full border-2 font-medium
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeConfig.container}
      `}
    >
      <span className={sizeConfig.emoji}>{config.emoji}</span>
      <span>{config.label}</span>
    </div>
  )
}
