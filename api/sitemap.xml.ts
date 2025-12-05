import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

/**
 * Sitemap.xml Dinámico
 *
 * Genera automáticamente un sitemap con todas las páginas de la tienda:
 * - Página principal
 * - Página de tienda
 * - Todas las páginas de productos disponibles
 * - Páginas estáticas (políticas, etc.)
 *
 * Se actualiza automáticamente cuando se agregan/eliminan productos
 */

const BASE_URL = 'https://www.sondenudos.com'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    // Solo GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    // Verificar si sitemap está habilitado (opcional - siempre generamos por defecto)
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[sitemap.xml] Missing Supabase credentials')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Obtener configuración del sitemap
    const { data: settings } = await supabase
      .from('store_settings')
      .select('sitemap_enabled, canonical_base_url')
      .single()

    // Si está deshabilitado, retornar 404
    if (settings && settings.sitemap_enabled === false) {
      return res.status(404).send('Sitemap not available')
    }

    const baseUrl = settings?.canonical_base_url || BASE_URL

    // Obtener todos los productos disponibles
    const { data: products, error } = await supabase
      .from('products')
      .select('handle, updated_at')
      .eq('available_for_sale', true)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('[sitemap.xml] Error fetching products:', error)
      return res.status(500).json({ error: 'Error fetching products' })
    }

    // Generar el XML del sitemap
    const now = new Date().toISOString().split('T')[0]

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Página Principal -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Tienda -->
  <url>
    <loc>${baseUrl}/tienda</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Páginas de Productos -->
${products?.map(p => `  <url>
    <loc>${baseUrl}/producto/${p.handle}</loc>
    <lastmod>${p.updated_at ? p.updated_at.split('T')[0] : now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n') || ''}

  <!-- Páginas Estáticas -->
  <url>
    <loc>${baseUrl}/politicas/devoluciones</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`

    // Configurar headers para XML
    res.setHeader('Content-Type', 'application/xml')
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate') // Cache 1 hora

    return res.status(200).send(sitemap)

  } catch (error) {
    console.error('[sitemap.xml] Unexpected error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
