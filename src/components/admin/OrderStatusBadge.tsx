/**
 * OrderStatusBadge Component
 *
 * Visual badge para mostrar el estado de un pedido
 * Estados: pending, paid, processing, shipped, delivered, cancelled
 */

// ============================================================================
// TYPES
// ============================================================================

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

interface OrderStatusBadgeProps {
  status: OrderStatus
  size?: 'sm' | 'md' | 'lg'
}

// ============================================================================
// STATUS CONFIG
// ============================================================================

const STATUS_CONFIG: Record<OrderStatus, {
  label: string
  emoji: string
  bgColor: string
  textColor: string
  borderColor: string
}> = {
  pending: {
    label: 'Pendiente',
    emoji: '⏳',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
  },
  paid: {
    label: 'Pagado',
    emoji: '💳',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  processing: {
    label: 'Procesando',
    emoji: '📦',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
  },
  shipped: {
    label: 'Enviado',
    emoji: '🚚',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
  },
  delivered: {
    label: 'Entregado',
    emoji: '✅',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  cancelled: {
    label: 'Cancelado',
    emoji: '❌',
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
// COMPONENT
// ============================================================================

export function OrderStatusBadge({
  status,
  size = 'md',
}: OrderStatusBadgeProps) {
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

// ============================================================================
// HELPER FUNCTION - Get available next statuses
// ============================================================================

export function getNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
  const transitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['paid', 'cancelled'],
    paid: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
  }

  return transitions[currentStatus]
}

// ============================================================================
// HELPER FUNCTION - Get status label
// ============================================================================

export function getStatusLabel(status: OrderStatus): string {
  return STATUS_CONFIG[status].label
}
