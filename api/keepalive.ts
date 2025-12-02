import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Supabase Keepalive Endpoint
 *
 * Evita que Supabase pause el proyecto por inactividad (tier gratuito)
 * Se ejecuta automáticamente cada 5 días vía Vercel Cron Job
 *
 * Hace una query simple SELECT a la base de datos para mantenerla activa
 */

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    // Solo permitir llamadas desde Vercel Cron o desarrollo local
    const authHeader = req.headers.authorization
    const isDev = process.env.NODE_ENV === 'development'
    const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`

    if (!isDev && !isVercelCron) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Crear cliente Supabase con variables de entorno
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({
        error: 'Missing Supabase configuration',
        message: 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set'
      })
    }

    // Hacer ping simple a la base de datos
    // Solo lectura, no requiere autenticación especial
    const response = await fetch(`${supabaseUrl}/rest/v1/products?select=id&limit=1`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Supabase query failed: ${response.statusText}`)
    }

    const data = await response.json()

    return res.status(200).json({
      success: true,
      message: 'Supabase keepalive ping successful',
      timestamp: new Date().toISOString(),
      recordsFound: data.length,
    })
  } catch (error) {
    console.error('Keepalive error:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    })
  }
}
