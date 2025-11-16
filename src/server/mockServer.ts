/**
 * Mock Server - Simula endpoints de API para modo desarrollo
 * Fase 6: Backend mock con validación de cupones y cálculo de envío
 *
 * Este módulo simula una API REST sin necesidad de un servidor real.
 * En producción, estas funciones se reemplazarían por llamadas fetch() reales.
 *
 * Soporta 3 modos:
 * - mock: Simula todo localmente
 * - stripe: Usa Stripe Checkout para pagos
 * - shopify: Usa Shopify Storefront API
 */

import productsData from '@/data/products.json'
import type { Product, Money, CartItem } from '@/types/models'
import { config } from '@/lib/config'

/**
 * Simula latencia de red (100-300ms)
 */
const simulateNetworkDelay = async () => {
  const delay = Math.random() * 200 + 100
  await new Promise((resolve) => setTimeout(resolve, delay))
}

/**
 * Tipos de respuesta de la API
 */
export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

export type CouponValidationResponse = {
  valid: boolean
  code?: string
  discountAmount?: Money
  error?: string
}

export type ShippingCalculationResponse = {
  cost: Money
  isFree: boolean
  threshold: Money
  amountUntilFree?: Money
}

/**
 * GET /api/products
 * Retorna todos los productos disponibles
 */
export async function getProducts(): Promise<ApiResponse<Product[]>> {
  await simulateNetworkDelay()

  try {
    // Parsear productos del JSON y asegurar tipado correcto
    const products = productsData as Product[]

    return {
      success: true,
      data: products,
    }
  } catch (error) {
    console.error('[mockServer] Error al cargar productos:', error)
    return {
      success: false,
      error: 'Error al cargar productos',
    }
  }
}

/**
 * GET /api/collection/necklaces
 * Retorna la colección de collares
 * (En este caso, todos los productos son collares)
 */
export async function getCollectionNecklaces(): Promise<ApiResponse<Product[]>> {
  await simulateNetworkDelay()

  try {
    const products = productsData as Product[]

    // Filtrar por tag "necklace" o "collar" si existiera
    // Por ahora, todos los productos son collares
    const necklaces = products.filter((p) => p.availableForSale)

    return {
      success: true,
      data: necklaces,
    }
  } catch (error) {
    console.error('[mockServer] Error al cargar colección:', error)
    return {
      success: false,
      error: 'Error al cargar colección',
    }
  }
}

/**
 * GET /api/product/:handle
 * Retorna un producto específico por su handle
 */
export async function getProductByHandle(handle: string): Promise<ApiResponse<Product>> {
  await simulateNetworkDelay()

  try {
    const products = productsData as Product[]
    const product = products.find((p) => p.handle === handle)

    if (!product) {
      return {
        success: false,
        error: 'Producto no encontrado',
      }
    }

    return {
      success: true,
      data: product,
    }
  } catch (error) {
    console.error('[mockServer] Error al cargar producto:', error)
    return {
      success: false,
      error: 'Error al cargar producto',
    }
  }
}

/**
 * POST /api/validate-coupon
 * Valida un cupón de descuento
 *
 * Cupones válidos (definidos también en cart.ts):
 * - WELCOME10: 10% de descuento
 * - PRISCILLA15: 15% de descuento
 * - VERANO20: 20% de descuento (mínimo $50)
 * - NAVIDAD25: 25% de descuento (mínimo $100)
 */
export async function validateCoupon(
  code: string,
  subtotal: Money
): Promise<CouponValidationResponse> {
  await simulateNetworkDelay()

  const validCoupons: Record<string, { percent: number; minAmount?: number }> = {
    WELCOME10: { percent: 0.1 },
    PRISCILLA15: { percent: 0.15 },
    VERANO20: { percent: 0.2, minAmount: 50 },
    NAVIDAD25: { percent: 0.25, minAmount: 100 },
  }

  const normalizedCode = code.toUpperCase().trim()
  const coupon = validCoupons[normalizedCode]

  if (!coupon) {
    return {
      valid: false,
      error: 'Cupón inválido o expirado',
    }
  }

  // Verificar monto mínimo si aplica
  if (coupon.minAmount && subtotal.amount < coupon.minAmount) {
    return {
      valid: false,
      error: `Este cupón requiere una compra mínima de $${coupon.minAmount}`,
    }
  }

  // Calcular descuento
  const discountAmount: Money = {
    amount: subtotal.amount * coupon.percent,
    currency: 'USD',
  }

  return {
    valid: true,
    code: normalizedCode,
    discountAmount,
  }
}

/**
 * POST /api/calculate-shipping
 * Calcula el costo de envío basado en el subtotal
 *
 * Reglas:
 * - Envío estándar: $10
 * - Envío gratis: si subtotal >= $150
 */
export async function calculateShipping(
  subtotal: Money
): Promise<ShippingCalculationResponse> {
  await simulateNetworkDelay()

  const shippingCost = config.shippingCost
  const threshold = config.freeShippingThreshold

  const isFree = subtotal.amount >= threshold

  const response: ShippingCalculationResponse = {
    cost: {
      amount: isFree ? 0 : shippingCost,
      currency: 'USD',
    },
    isFree,
    threshold: {
      amount: threshold,
      currency: 'USD',
    },
  }

  // Si no es envío gratis, calcular cuánto falta
  if (!isFree) {
    response.amountUntilFree = {
      amount: threshold - subtotal.amount,
      currency: 'USD',
    }
  }

  return response
}

/**
 * POST /api/checkout/create-session
 * Crea una sesión de checkout
 *
 * Si config.enableStripe = true, usa Stripe Checkout
 * Si config.enableStripe = false, simula checkout localmente
 */
export async function createCheckoutSession(params: {
  items: CartItem[]
  couponCode?: string
  discountAmount?: number
  customerEmail: string
  shippingMethod?: 'shipping' | 'pickup'
  successUrl?: string
  cancelUrl?: string
}): Promise<ApiResponse<{ sessionId: string; checkoutUrl: string }>> {
  // Si está en modo Stripe, delegar a stripeServer
  if (config.enableStripe) {
    try {
      // Importación dinámica para evitar errores si Stripe no está configurado
      const { stripeServer } = await import('./stripe')

      const result = await stripeServer.createCheckoutSession({
        items: params.items,
        couponCode: params.couponCode,
        discountAmount: params.discountAmount,
        customerEmail: params.customerEmail,
        shippingMethod: params.shippingMethod,
        successUrl: params.successUrl,
        cancelUrl: params.cancelUrl,
      })

      if (result.error) {
        return {
          success: false,
          error: result.error,
        }
      }

      return {
        success: true,
        data: {
          sessionId: result.sessionId,
          checkoutUrl: result.url,
        },
      }
    } catch (error) {
      console.error('[mockServer] Error al crear sesión con Stripe:', error)
      return {
        success: false,
        error: 'Error al procesar el pago con Stripe',
      }
    }
  }

  // Modo mock: simular creación exitosa
  await simulateNetworkDelay()

  const mockSessionId = `mock_session_${Date.now()}`

  console.log('[mockServer] Checkout session creada (mock):', {
    sessionId: mockSessionId,
    items: params.items.length,
    email: params.customerEmail,
    coupon: params.couponCode,
  })

  return {
    success: true,
    data: {
      sessionId: mockSessionId,
      checkoutUrl: '/success', // En mock, redirigir directamente a success
    },
  }
}

/**
 * Exportar todas las funciones del mock server
 */
export const mockServer = {
  getProducts,
  getCollectionNecklaces,
  getProductByHandle,
  validateCoupon,
  calculateShipping,
  createCheckoutSession,
}

export default mockServer
