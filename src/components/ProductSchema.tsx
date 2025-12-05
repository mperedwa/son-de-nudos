import { useSeoMeta } from '@/hooks/useStoreSettings'
import type { Product } from '@/types/models'

/**
 * Schema.org Product Markup (JSON-LD)
 *
 * Genera datos estructurados para que Google muestre rich snippets
 * en los resultados de búsqueda:
 * - Imagen del producto
 * - Precio
 * - Disponibilidad
 * - Marca
 * - Descripción
 *
 * @see https://schema.org/Product
 * @see https://developers.google.com/search/docs/appearance/structured-data/product
 */

interface ProductSchemaProps {
  product: Product
}

export default function ProductSchema({ product }: ProductSchemaProps) {
  const { seoMeta } = useSeoMeta()

  // No renderizar si schema está deshabilitado
  if (!seoMeta.schemaEnabled) {
    return null
  }

  const baseUrl = seoMeta.canonicalBaseUrl || 'https://www.sondenudos.com'

  // Limpiar HTML de la descripción
  const cleanDescription = product.descriptionHtml
    ? product.descriptionHtml.replace(/<[^>]*>/g, '').trim()
    : `${product.title} - Artesanía exclusiva hecha a mano por Son de Nudos`

  // Construir el schema JSON-LD
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: cleanDescription.substring(0, 500), // Limitar a 500 chars
    image: product.images.length > 0 ? product.images : [`${baseUrl}/og-image.jpg`],
    sku: product.variants[0]?.sku || product.handle,
    brand: {
      '@type': 'Brand',
      name: 'Son de Nudos',
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'Son de Nudos by Priscilla',
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/producto/${product.handle}`,
      priceCurrency: product.price.currency,
      price: product.price.amount.toFixed(2),
      availability: product.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Son de Nudos',
      },
      // Si hay precio de comparación, mostrar como precio anterior
      ...(product.compareAtPrice && {
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días
      }),
    },
    // Categoría basada en tags
    category: product.tags.length > 0 ? product.tags[0] : 'Artesanías',
    // Material si está en las opciones
    ...(product.options.includes('MaterialCordon') && {
      material: 'Macramé',
    }),
    // URL de la página
    url: `${baseUrl}/producto/${product.handle}`,
  }

  // Agregar variantes como ofertas múltiples si hay más de una
  if (product.variants.length > 1) {
    const aggregateOffer = {
      '@type': 'AggregateOffer',
      lowPrice: Math.min(...product.variants.map(v => v.price.amount)).toFixed(2),
      highPrice: Math.max(...product.variants.map(v => v.price.amount)).toFixed(2),
      priceCurrency: product.price.currency,
      offerCount: product.variants.length,
      availability: product.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    }

    // Reemplazar offers con aggregateOffer
    ;(schema as any).offers = aggregateOffer
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 0) }}
    />
  )
}

/**
 * Schema para la página de la tienda (CollectionPage)
 */
export function StoreSchema() {
  const { seoMeta } = useSeoMeta()

  if (!seoMeta.schemaEnabled) {
    return null
  }

  const baseUrl = seoMeta.canonicalBaseUrl || 'https://www.sondenudos.com'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Son de Nudos',
    description: seoMeta.description || 'Artesanías exclusivas hechas a mano con macramé',
    url: baseUrl,
    logo: `${baseUrl}/favicon-512.png`,
    image: seoMeta.ogImage || `${baseUrl}/og-image.jpg`,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
    sameAs: [
      'https://www.instagram.com/son_de_nudos/',
      'https://www.facebook.com/share/1CwiWSxH5L/',
      'https://pinterest.com/sondenudos',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 0) }}
    />
  )
}

/**
 * Schema de organización para el sitio
 */
export function OrganizationSchema() {
  const { seoMeta } = useSeoMeta()

  if (!seoMeta.schemaEnabled) {
    return null
  }

  const baseUrl = seoMeta.canonicalBaseUrl || 'https://www.sondenudos.com'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Son de Nudos',
    alternateName: 'Son de Nudos by Priscilla',
    url: baseUrl,
    logo: `${baseUrl}/favicon-512.png`,
    description: 'Artesanías exclusivas de macramé hechas a mano',
    foundingDate: '2020',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'hello@sondenudos.com',
      availableLanguage: ['Spanish', 'English'],
    },
    sameAs: [
      'https://www.instagram.com/son_de_nudos/',
      'https://www.facebook.com/share/1CwiWSxH5L/',
      'https://pinterest.com/sondenudos',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 0) }}
    />
  )
}
