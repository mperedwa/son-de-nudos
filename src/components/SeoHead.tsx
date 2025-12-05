import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useSeoMeta } from '@/hooks/useStoreSettings'

/**
 * Componente para gestionar meta tags SEO dinámicamente
 * Carga configuración desde store_settings en Supabase
 *
 * Actualiza:
 * - document.title
 * - meta description
 * - meta keywords
 * - Open Graph tags (og:title, og:description, og:image)
 * - Twitter Card tags
 * - Favicon dinámico (si está configurado)
 * - Canonical URL
 * - Google Analytics (si está configurado)
 */
export default function SeoHead() {
  const { seoMeta, loading } = useSeoMeta()
  const location = useLocation()

  // Actualizar meta tags básicos
  useEffect(() => {
    if (loading) return

    // Actualizar título
    if (seoMeta.title) {
      document.title = seoMeta.title
    }

    // Actualizar meta description
    updateMetaTag('description', seoMeta.description || '')

    // Actualizar meta keywords
    if (seoMeta.keywords && seoMeta.keywords.length > 0) {
      updateMetaTag('keywords', seoMeta.keywords.join(', '))
    }

    // Actualizar Open Graph tags
    updateMetaTag('og:title', seoMeta.title || '', 'property')
    updateMetaTag('og:description', seoMeta.description || '', 'property')
    updateMetaTag('og:type', 'website', 'property')
    if (seoMeta.ogImage) {
      updateMetaTag('og:image', seoMeta.ogImage, 'property')
    }

    // Twitter Card tags (usa los mismos valores)
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', seoMeta.title || '')
    updateMetaTag('twitter:description', seoMeta.description || '')
    if (seoMeta.ogImage) {
      updateMetaTag('twitter:image', seoMeta.ogImage)
    }

  }, [seoMeta, loading])

  // Actualizar canonical URL
  useEffect(() => {
    if (loading) return

    const canonicalUrl = `${seoMeta.canonicalBaseUrl}${location.pathname}`

    // Buscar o crear link canonical
    let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null

    if (link) {
      link.href = canonicalUrl
    } else {
      link = document.createElement('link')
      link.rel = 'canonical'
      link.href = canonicalUrl
      document.head.appendChild(link)
    }

    // También actualizar og:url
    updateMetaTag('og:url', canonicalUrl, 'property')

  }, [seoMeta.canonicalBaseUrl, location.pathname, loading])

  // Actualizar favicon dinámico
  useEffect(() => {
    if (loading || !seoMeta.faviconUrl) return

    // Actualizar todos los link de favicon
    const faviconLinks = document.querySelectorAll("link[rel*='icon']")

    faviconLinks.forEach((link) => {
      const linkEl = link as HTMLLinkElement
      // Solo actualizar si no es apple-touch-icon (esos necesitan formato específico)
      if (!linkEl.rel.includes('apple')) {
        linkEl.href = seoMeta.faviconUrl!
      }
    })

    console.log('[SeoHead] Favicon updated:', seoMeta.faviconUrl)
  }, [seoMeta.faviconUrl, loading])

  // Cargar Google Analytics si está configurado
  useEffect(() => {
    if (loading || !seoMeta.analyticsId) return

    // Verificar si ya está cargado
    if (document.querySelector(`script[src*="${seoMeta.analyticsId}"]`)) return

    // Cargar gtag.js
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${seoMeta.analyticsId}`
    document.head.appendChild(script)

    // Configurar gtag
    const inlineScript = document.createElement('script')
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${seoMeta.analyticsId}');
    `
    document.head.appendChild(inlineScript)

    console.log('[SeoHead] Google Analytics loaded:', seoMeta.analyticsId)
  }, [seoMeta.analyticsId, loading])

  // No renderiza nada visible
  return null
}

/**
 * Helper para actualizar o crear meta tags
 */
function updateMetaTag(
  name: string,
  content: string,
  attr: 'name' | 'property' = 'name'
) {
  if (!content) return

  let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null

  if (meta) {
    meta.content = content
  } else {
    meta = document.createElement('meta')
    meta.setAttribute(attr, name)
    meta.content = content
    document.head.appendChild(meta)
  }
}
