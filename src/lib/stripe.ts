/**
 * Stripe Client - Funciones del lado del cliente para Stripe Checkout
 * Fase 6: Integración de pagos con Stripe
 *
 * Este archivo maneja la interacción con Stripe desde el navegador
 */

import { loadStripe, Stripe } from '@stripe/stripe-js'
import { config } from '@/lib/config'

/**
 * Cliente de Stripe (singleton)
 */
let stripePromise: Promise<Stripe | null> | null = null

/**
 * Obtener instancia del cliente de Stripe
 * Solo usa la publishable key (segura para el cliente)
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = config.stripe.publishableKey

    if (!publishableKey || !publishableKey.startsWith('pk_')) {
      console.warn('[Stripe Client] PUBLISHABLE_KEY no configurada o inválida')
      return Promise.resolve(null)
    }

    stripePromise = loadStripe(publishableKey)
  }

  return stripePromise
}

/**
 * Redirigir a Stripe Checkout
 * Usa la URL de la sesión para redirigir al usuario
 */
export async function redirectToCheckout(sessionUrl: string): Promise<{ error?: string }> {
  try {
    // Redirigir directamente usando la URL de la sesión de Stripe
    window.location.href = sessionUrl
    return {}
  } catch (error) {
    console.error('[Stripe] Error inesperado:', error)
    return {
      error: error instanceof Error ? error.message : 'Error desconocido al procesar el pago',
    }
  }
}

export const stripeClient = {
  getStripe,
  redirectToCheckout,
}

export default stripeClient
