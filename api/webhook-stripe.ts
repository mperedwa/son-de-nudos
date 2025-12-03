/**
 * Webhook de Stripe para guardar pedidos en Supabase
 *
 * Este endpoint recibe eventos de Stripe (checkout.session.completed)
 * y crea automáticamente el registro del pedido en la tabla orders.
 *
 * Configuración requerida:
 * - STRIPE_SECRET_KEY: Clave secreta de Stripe
 * - STRIPE_WEBHOOK_SECRET: Secret del webhook (whsec_xxx)
 * - VITE_SUPABASE_URL: URL de Supabase
 * - SUPABASE_SERVICE_ROLE_KEY: Clave de servicio (bypass RLS)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Configuración para recibir el body raw (necesario para verificar firma)
export const config = {
  api: {
    bodyParser: false,
  },
}

// Tipos para los items del pedido
interface OrderItem {
  productId: string
  variantId: string
  title: string
  variantTitle: string
  price: number
  quantity: number
  image: string
}

// Tipo para la dirección de envío
interface ShippingAddress {
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

/**
 * Helper para leer el body raw del request
 */
async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

/**
 * Handler principal del webhook
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse> {
  // Solo aceptar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verificar que las variables de entorno están configuradas
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!stripeSecretKey || !webhookSecret) {
    console.error('[Webhook] Missing Stripe configuration')
    return res.status(500).json({ error: 'Stripe not configured' })
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[Webhook] Missing Supabase configuration')
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  // Inicializar clientes
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-10-29.clover',
  })

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    // Obtener el body raw y la firma
    const rawBody = await getRawBody(req)
    const signature = req.headers['stripe-signature'] as string

    if (!signature) {
      console.error('[Webhook] Missing stripe-signature header')
      return res.status(400).json({ error: 'Missing signature' })
    }

    // Verificar la firma del evento
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[Webhook] Signature verification failed:', message)
      return res.status(400).json({ error: `Webhook signature verification failed: ${message}` })
    }

    console.log(`[Webhook] Received event: ${event.type}`)

    // Manejar el evento checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Verificar que no exista ya esta orden (evitar duplicados)
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('stripe_session_id', session.id)
        .single()

      if (existingOrder) {
        console.log(`[Webhook] Order already exists for session ${session.id}`)
        return res.status(200).json({ received: true, message: 'Order already exists' })
      }

      // Extraer datos de la sesión
      const metadata = session.metadata || {}
      const customerDetails = session.customer_details
      const shippingDetails = session.shipping_details

      // Parsear items desde metadata
      let items: OrderItem[] = []
      try {
        items = metadata.items ? JSON.parse(metadata.items) : []
      } catch (e) {
        console.error('[Webhook] Error parsing items:', e)
      }

      // Construir dirección de envío
      let shippingAddress: ShippingAddress | null = null
      if (shippingDetails?.address) {
        shippingAddress = {
          address: shippingDetails.address.line1 || '',
          city: shippingDetails.address.city || '',
          state: shippingDetails.address.state || '',
          zipCode: shippingDetails.address.postal_code || '',
          country: shippingDetails.address.country || '',
        }
      }

      // Calcular totales
      const subtotal = parseFloat(metadata.subtotal || '0')
      const discount = parseFloat(metadata.discount || '0')
      const shipping = parseFloat(metadata.shipping || '0')
      const total = (session.amount_total || 0) / 100 // Stripe usa centavos

      // Crear el registro del pedido
      const orderData = {
        stripe_session_id: session.id,
        customer_email: customerDetails?.email || session.customer_email || '',
        customer_name: customerDetails?.name || '',
        shipping_address: shippingAddress,
        items: items,
        subtotal: subtotal,
        discount: discount,
        shipping: shipping,
        total: total,
        status: 'paid' as const, // Automáticamente marcado como pagado
      }

      console.log('[Webhook] Creating order:', {
        session_id: session.id,
        email: orderData.customer_email,
        total: orderData.total,
        items_count: items.length,
      })

      // Insertar en Supabase
      const { data: order, error: insertError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (insertError) {
        console.error('[Webhook] Error inserting order:', insertError)
        return res.status(500).json({ error: 'Failed to create order', details: insertError.message })
      }

      console.log(`[Webhook] Order created successfully: ${order.id}`)

      return res.status(200).json({
        received: true,
        order_id: order.id,
        message: 'Order created successfully',
      })
    }

    // Otros eventos - simplemente confirmar recepción
    console.log(`[Webhook] Unhandled event type: ${event.type}`)
    return res.status(200).json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Webhook] Unexpected error:', message)
    return res.status(500).json({ error: message })
  }
}
