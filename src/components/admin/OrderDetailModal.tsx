/**
 * OrderDetailModal Component
 *
 * Modal que muestra todos los detalles de un pedido
 * Incluye: cliente, items, dirección, totales, timeline y cambio de status
 */

import { useState } from 'react'
import { supabase, type Database } from '@/lib/supabase'
import { OrderStatusBadge, getNextStatuses, getStatusLabel, type OrderStatus } from './OrderStatusBadge'

// ============================================================================
// TYPES
// ============================================================================

type Order = Database['public']['Tables']['orders']['Row']

interface OrderDetailModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void
}

interface OrderItem {
  productId: string
  variantId: string
  title: string
  variantTitle: string
  price: number
  quantity: number
  image?: string
}

interface ShippingAddress {
  address: string
  city: string
  state: string
  zipCode: string
  country?: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatMoney(amount: number): string {
  return `$${Number(amount).toFixed(2)}`
}

// ============================================================================
// COMPONENT
// ============================================================================

export function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onStatusChange,
}: OrderDetailModalProps) {
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)

  if (!isOpen || !order) return null

  // Parse items from JSON
  const items: OrderItem[] = Array.isArray(order.items) ? order.items : []

  // Parse shipping address
  const shippingAddress: ShippingAddress | null = order.shipping_address as ShippingAddress | null

  // Get available next statuses
  const nextStatuses = getNextStatuses(order.status)

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  async function handleStatusChange(newStatus: OrderStatus) {
    if (!order) return

    try {
      setIsChangingStatus(true)
      setStatusError(null)

      const { error } = await supabase
        .from('orders')
        // @ts-expect-error - Supabase types don't properly infer Update type
        .update({ status: newStatus })
        .eq('id', order.id)

      if (error) throw error

      onStatusChange(order.id, newStatus)
    } catch (err) {
      console.error('Error changing status:', err)
      setStatusError(err instanceof Error ? err.message : 'Error al cambiar estado')
    } finally {
      setIsChangingStatus(false)
    }
  }

  function handleClose() {
    setStatusError(null)
    onClose()
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden m-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8B6F47] to-[#D4A574] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              Pedido #{order.id.slice(0, 8).toUpperCase()}
            </h2>
            <p className="text-white/80 text-sm">
              {formatDate(order.created_at)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-6">
          {/* Status & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-[#F5E6D3]/50 rounded-lg">
            <div>
              <p className="text-sm text-[#6B5844] mb-2">Estado actual</p>
              <OrderStatusBadge status={order.status} size="lg" />
            </div>

            {nextStatuses.length > 0 && (
              <div>
                <p className="text-sm text-[#6B5844] mb-2">Cambiar a</p>
                <div className="flex flex-wrap gap-2">
                  {nextStatuses.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleStatusChange(status)}
                      disabled={isChangingStatus}
                      className={`
                        px-4 py-2 text-sm font-medium rounded-lg transition-colors
                        ${status === 'cancelled'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-[#8B6F47] text-white hover:bg-[#6B5844]'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      {isChangingStatus ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Cambiando...
                        </span>
                      ) : (
                        getStatusLabel(status)
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {statusError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {statusError}
            </div>
          )}

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border-2 border-[#D4A574]/30 rounded-lg">
              <h3 className="font-semibold text-[#8B6F47] mb-3">Cliente</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-[#6B5844]/70">Nombre: </span>
                  <span className="font-medium text-[#6B5844]">
                    {order.customer_name || 'No especificado'}
                  </span>
                </p>
                <p>
                  <span className="text-[#6B5844]/70">Email: </span>
                  <a
                    href={`mailto:${order.customer_email}`}
                    className="font-medium text-[#8B6F47] hover:underline"
                  >
                    {order.customer_email}
                  </a>
                </p>
              </div>
            </div>

            {shippingAddress && (
              <div className="p-4 border-2 border-[#D4A574]/30 rounded-lg">
                <h3 className="font-semibold text-[#8B6F47] mb-3">Dirección de Envío</h3>
                <div className="text-sm text-[#6B5844]">
                  <p>{shippingAddress.address}</p>
                  <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                  {shippingAddress.country && <p>{shippingAddress.country}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="border-2 border-[#D4A574]/30 rounded-lg overflow-hidden">
            <h3 className="font-semibold text-[#8B6F47] px-4 py-3 bg-[#F5E6D3]/50 border-b border-[#D4A574]/30">
              Items del Pedido ({items.length})
            </h3>
            <div className="divide-y divide-[#D4A574]/20">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4">
                  {/* Image */}
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg border border-[#D4A574]/30"
                    />
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#8B6F47] truncate">{item.title}</p>
                    {item.variantTitle && (
                      <p className="text-sm text-[#6B5844]/70">{item.variantTitle}</p>
                    )}
                    <p className="text-sm text-[#6B5844]/70">
                      Cantidad: {item.quantity}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="font-semibold text-[#8B6F47]">
                      {formatMoney(item.price * item.quantity)}
                    </p>
                    <p className="text-xs text-[#6B5844]/70">
                      {formatMoney(item.price)} c/u
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-2 border-[#D4A574]/30 rounded-lg p-4">
            <h3 className="font-semibold text-[#8B6F47] mb-3">Resumen</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B5844]/70">Subtotal</span>
                <span className="text-[#6B5844]">{formatMoney(order.subtotal)}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento</span>
                  <span>-{formatMoney(order.discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-[#6B5844]/70">Envío</span>
                <span className="text-[#6B5844]">
                  {order.shipping > 0 ? formatMoney(order.shipping) : 'Gratis'}
                </span>
              </div>

              <div className="flex justify-between pt-2 border-t border-[#D4A574]/30 text-lg font-bold">
                <span className="text-[#8B6F47]">Total</span>
                <span className="text-[#8B6F47]">{formatMoney(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="border-2 border-[#D4A574]/30 rounded-lg p-4">
            <h3 className="font-semibold text-[#8B6F47] mb-3">Historial</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#8B6F47]" />
                <div>
                  <p className="text-sm font-medium text-[#6B5844]">Pedido creado</p>
                  <p className="text-xs text-[#6B5844]/70">{formatShortDate(order.created_at)}</p>
                </div>
              </div>

              {order.updated_at !== order.created_at && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#D4A574]" />
                  <div>
                    <p className="text-sm font-medium text-[#6B5844]">Última actualización</p>
                    <p className="text-xs text-[#6B5844]/70">{formatShortDate(order.updated_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stripe Session ID */}
          {order.stripe_session_id && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">
                <span className="font-medium">Stripe Session:</span>{' '}
                <code className="font-mono">{order.stripe_session_id}</code>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
