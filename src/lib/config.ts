/**
 * Configuración global de la aplicación
 * Lee variables de entorno y expone configuración tipada
 */

export const config = {
  // Modo de datos
  dataMode: (import.meta.env.VITE_DATA_MODE || 'mock') as 'mock' | 'stripe' | 'shopify',

  // Moneda
  currency: (import.meta.env.VITE_CURRENCY || 'USD') as 'USD',

  // Envío
  shippingCost: Number(import.meta.env.VITE_SHIPPING_COST) || 10, // Costo de envío estándar en USD
  freeShippingThreshold: Number(import.meta.env.VITE_FREE_SHIPPING_THRESHOLD) || 150, // Umbral para envío gratis

  // Stripe
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    secretKey: import.meta.env.STRIPE_SECRET_KEY || '', // Solo backend
  },

  // Shopify
  shopify: {
    storeDomain: import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || '',
    storefrontToken: import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || '',
  },

  // Flags de features
  enableStripe: (import.meta.env.VITE_DATA_MODE || 'mock') === 'stripe',
  enableShopify: (import.meta.env.VITE_DATA_MODE || 'mock') === 'shopify',
} as const

export default config
