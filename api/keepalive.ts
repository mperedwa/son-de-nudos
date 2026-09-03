import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Supabase Keepalive Endpoint
 *
 * Genera actividad diaria de base de datos para reducir el riesgo de que
 * Supabase pause un proyecto gratuito por inactividad.
 *
 * Hace una consulta SELECT de solo lectura a la tabla de productos.
 */

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  res.setHeader('Cache-Control', 'no-store')

  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET')
      return res.status(405).json({ error: 'Method not allowed' })
    }

    // Solo permitir llamadas desde Vercel Cron o desarrollo local
    const authHeader = req.headers.authorization
    const isDev = process.env.NODE_ENV === 'development'
    const cronSecret = process.env.CRON_SECRET
    const isVercelCron = Boolean(cronSecret) && authHeader === `Bearer ${cronSecret}`

    if (!isDev && !cronSecret) {
      console.error('Keepalive error: CRON_SECRET is not configured')
      return res.status(500).json({ error: 'Keepalive is not configured' })
    }

    if (!isDev && !isVercelCron) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Preferir variables exclusivas del servidor y mantener compatibilidad temporal.
    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({
        error: 'Missing Supabase configuration',
      })
    }

    // Hacer ping simple a la base de datos
    // Solo lectura, no requiere autenticación especial
    const response = await fetch(`${supabaseUrl}/rest/v1/products?select=id&limit=1`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      signal: AbortSignal.timeout(8_000),
    })

    if (!response.ok) {
      throw new Error(`Supabase query failed with status ${response.status}`)
    }

    const data = await response.json()

    return res.status(200).json({
      success: true,
      message: 'Supabase keepalive ping successful',
      checkedAt: new Date().toISOString(),
      recordsFound: data.length,
    })
  } catch (error) {
    console.error('Keepalive error:', error)
    return res.status(502).json({
      success: false,
      error: 'Supabase keepalive failed',
      checkedAt: new Date().toISOString(),
    })
  }
}
