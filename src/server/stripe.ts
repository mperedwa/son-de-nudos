/**
 * Stripe Server - Funciones backend para Stripe Checkout
 * Fase 6: Integración de pagos con Stripe
 *
 * IMPORTANTE: En producción, estas funciones deben ejecutarse en un servidor backend
 * (Node.js/Express, Vercel Serverless Functions, etc.) para proteger la SECRET_KEY.
 *
 * Este archivo es una implementación de referencia para desarrollo.
 */

import Stripe from 'stripe'
import { config } from '@/lib/config'
import type { CartItem } from '@/types/models'

/**
 * Inicializar cliente de Stripe (solo en backend)
 * NUNCA exponer STRIPE_SECRET_KEY en el cliente
 */
const getStripeClient = (): Stripe | null => {
  const secretKey = config.stripe.secretKey

  if (!secretKey || !secretKey.startsWith('sk_')) {
    console.warn('[Stripe] SECRET_KEY no configurada o inválida')
    return null
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-10-29.clover', // Versión actual de la API
  })
}

/**
 * Tipos de parámetros para crear sesión de checkout
 */
export type CreateCheckoutSessionParams = {
  items: CartItem[]
  couponCode?: string
  discountAmount?: number
  customerEmail: string
  shippingMethod?: 'shipping' | 'pickup'
  shippingCost?: number
  shippingZone?: string
  successUrl?: string
  cancelUrl?: string
}

/**
 * Crear sesión de Stripe Checkout
 *
 * En producción, esta función debe ejecutarse en un endpoint backend seguro
 * Ejemplo: POST /api/checkout/create-session
 */
export async function createStripeCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<{ sessionId: string; url: string; error?: string }> {
  try {
    const stripe = getStripeClient()

    if (!stripe) {
      return {
        sessionId: '',
        url: '',
        error: 'Stripe no está configurado correctamente. Verifica STRIPE_SECRET_KEY en .env',
      }
    }

    // Preparar line_items para Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = params.items.map(
      (item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${item.title} - ${item.variantTitle}`,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(item.unitPrice.amount * 100), // Stripe usa centavos
        },
        quantity: item.quantity,
      })
    )

    // Agregar envío si aplica (usar shippingCost del parámetro o fallback a config)
    if (params.shippingMethod === 'shipping') {
      const shippingCost = params.shippingCost ?? config.shippingCost
      // Solo agregar si hay costo de envío (no agregar si es envío gratis)
      if (shippingCost > 0) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: params.shippingZone === 'ZONE_2' ? 'Envío internacional (Canadá/México)' : 'Envío estándar',
            },
            unit_amount: Math.round(shippingCost * 100),
          },
          quantity: 1,
        })
      }
    }

    // URLs de redirección
    const baseUrl = window.location.origin
    const successUrl = params.successUrl || `${baseUrl}/success`
    const cancelUrl = params.cancelUrl || `${baseUrl}/cancel`

    // Crear sesión de checkout
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: params.customerEmail,
      billing_address_collection: 'required',
      shipping_address_collection:
        params.shippingMethod === 'shipping'
          ? {
              allowed_countries: ['US', 'MX', 'CA'], // Ajustar según necesidad
            }
          : undefined,
      metadata: {
        couponCode: params.couponCode || '',
        shippingMethod: params.shippingMethod || 'shipping',
        shippingZone: params.shippingZone || 'ZONE_1',
        // Datos completos para el webhook (guardar orden en Supabase)
        items: JSON.stringify(
          params.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            title: item.title,
            variantTitle: item.variantTitle,
            price: item.unitPrice.amount,
            quantity: item.quantity,
            image: item.image || '',
          }))
        ),
        subtotal: String(
          params.items.reduce((sum, item) => sum + item.unitPrice.amount * item.quantity, 0)
        ),
        discount: String(params.discountAmount || 0),
        shipping: String(params.shippingMethod === 'shipping' ? (params.shippingCost ?? config.shippingCost) : 0),
      },
    }

    // Aplicar descuento si hay cupón
    if (params.discountAmount && params.discountAmount > 0) {
      sessionParams.discounts = [
        {
          coupon: await createStripeCoupon(stripe, params.discountAmount, params.couponCode),
        },
      ]
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    if (!session.id || !session.url) {
      throw new Error('No se pudo crear la sesión de checkout')
    }

    return {
      sessionId: session.id,
      url: session.url,
    }
  } catch (error) {
    console.error('[Stripe] Error al crear sesión:', error)
    return {
      sessionId: '',
      url: '',
      error: error instanceof Error ? error.message : 'Error desconocido al crear sesión de pago',
    }
  }
}

/**
 * Crear cupón temporal en Stripe
 * (En producción, los cupones deberían crearse manualmente en el dashboard)
 */
async function createStripeCoupon(
  stripe: Stripe,
  discountAmount: number,
  couponCode?: string
): Promise<string> {
  try {
    // Crear cupón temporal con el monto de descuento
    const coupon = await stripe.coupons.create({
      name: couponCode || 'Descuento',
      amount_off: Math.round(discountAmount * 100), // Stripe usa centavos
      currency: 'usd',
      duration: 'once',
    })

    return coupon.id
  } catch (error) {
    console.error('[Stripe] Error al crear cupón:', error)
    throw error
  }
}

/**
 * Verificar estado de una sesión de checkout
 * Útil para confirmar pagos en la página de éxito
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session | null> {
  try {
    const stripe = getStripeClient()

    if (!stripe) {
      console.error('[Stripe] Cliente no inicializado')
      return null
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return session
  } catch (error) {
    console.error('[Stripe] Error al obtener sesión:', error)
    return null
  }
}

export const stripeServer = {
  createCheckoutSession: createStripeCheckoutSession,
  getCheckoutSession,
}

export default stripeServer
