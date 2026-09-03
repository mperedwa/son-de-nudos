import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

/**
 * robots.txt Dinámico
 *
 * Genera el archivo robots.txt desde la configuración en Supabase.
 * Permite al admin configurar qué rutas indexar sin modificar código.
 *
 * Incluye automáticamente la referencia al sitemap si está habilitado.
 */

const DEFAULT_ROBOTS = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /checkout
Disallow: /success
Disallow: /cancel`

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    // Solo GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY

    let robotsContent = DEFAULT_ROBOTS
    let sitemapEnabled = true
    let canonicalBaseUrl = 'https://www.sondenudos.com'

    // Intentar obtener configuración personalizada
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      const { data: settings } = await supabase
        .from('store_settings')
        .select('robots_txt, sitemap_enabled, canonical_base_url')
        .single()

      if (settings) {
        if (settings.robots_txt) {
          robotsContent = settings.robots_txt
        }
        if (settings.sitemap_enabled !== null) {
          sitemapEnabled = settings.sitemap_enabled
        }
        if (settings.canonical_base_url) {
          canonicalBaseUrl = settings.canonical_base_url
        }
      }
    }

    // Agregar referencia al sitemap si está habilitado
    if (sitemapEnabled) {
      robotsContent += `\n\n# Sitemap\nSitemap: ${canonicalBaseUrl}/sitemap.xml`
    }

    // Configurar headers para texto plano
    res.setHeader('Content-Type', 'text/plain')
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate') // Cache 24 horas

    return res.status(200).send(robotsContent)

  } catch (error) {
    console.error('[robots.txt] Unexpected error:', error)
    // En caso de error, devolver default robots.txt
    res.setHeader('Content-Type', 'text/plain')
    return res.status(200).send(DEFAULT_ROBOTS)
  }
}
