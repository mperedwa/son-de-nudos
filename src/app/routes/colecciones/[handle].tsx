/**
 * Página de Detalle de Colección
 *
 * Muestra todos los productos de una colección específica.
 * Similar a la página de tienda pero pre-filtrada por colección.
 */

import { useState, useEffect } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase, type Collection } from '@/lib/supabase'
import { getPublicProducts } from '@/lib/supabase-public'
import type { Product } from '@/types/models'
import ProductGrid from '@/components/ProductGrid'

export default function CollectionDetailPage() {
  const { handle } = useParams<{ handle: string }>()
  const { t, i18n } = useTranslation()

  const [collection, setCollection] = useState<Collection | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (handle) {
      loadCollectionAndProducts()
    }
  }, [handle, i18n.language])

  async function loadCollectionAndProducts() {
    if (!handle) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // 1. Cargar colección
      const { data: collectionData, error: collectionError } = await supabase
        .from('collections')
        .select('*')
        .eq('handle', handle)
        .eq('visible', true)
        .single<Collection>()

      if (collectionError || !collectionData) {
        setError('Colección no encontrada')
        return
      }

      setCollection(collectionData)

      // 2. Cargar productos de esta colección
      const allPublicProducts = await getPublicProducts()
      const filteredProducts = allPublicProducts
        .filter((p) => p.collectionId === collectionData.id && p.availableForSale)
        .map((p) => ({
          id: p.id,
          handle: p.handle,
          title: i18n.language === 'en' && p.title_en ? p.title_en : p.title,
          descriptionHtml: i18n.language === 'en' && p.descriptionHtml_en ? p.descriptionHtml_en : (p.descriptionHtml || ''),
          images: p.images,
          price: { amount: p.price.amount, currency: 'USD' as const },
          compareAtPrice: p.compareAtPrice ? { amount: p.compareAtPrice.amount, currency: 'USD' as const } : undefined,
          options: p.options,
          variants: p.variants.map((v) => ({
            id: v.id,
            title: v.title,
            sku: v.sku,
            price: { amount: v.price.amount, currency: 'USD' as const },
            compareAtPrice: v.compareAtPrice ? { amount: v.compareAtPrice.amount, currency: 'USD' as const } : undefined,
            available: v.available,
            stock: v.stock,
            image: v.image || undefined,
            options: Object.fromEntries(
              Object.entries(v.options).filter(([, val]) => val !== null)
            ) as Record<string, string>,
          })),
          tags: p.tags,
          availableForSale: p.availableForSale,
          createdAt: p.createdAt,
          collectionId: p.collectionId,
        }))

      setProducts(filteredProducts)
    } catch (err) {
      console.error('Error loading collection:', err)
      setError('Error al cargar la colección')
    } finally {
      setLoading(false)
    }
  }

  // Estados de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6F47]"></div>
      </div>
    )
  }

  // Colección no encontrada
  if (error || !collection) {
    return <Navigate to="/colecciones" replace />
  }

  const collectionName = i18n.language === 'en' ? collection.name_en : collection.name_es
  const collectionDescription =
    i18n.language === 'en'
      ? collection.description_en || collection.description_es
      : collection.description_es || collection.description_en

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-[#6B5844]">
          <li>
            <Link to="/" className="hover:text-[#8B6F47] transition-colors">
              {t('common:home')}
            </Link>
          </li>
          <li>→</li>
          <li>
            <Link to="/colecciones" className="hover:text-[#8B6F47] transition-colors">
              {i18n.language === 'en' ? 'Collections' : 'Colecciones'}
            </Link>
          </li>
          <li>→</li>
          <li className="text-[#3C2F2F] font-medium" aria-current="page">
            {collectionName}
          </li>
        </ol>
      </nav>

      {/* Collection Header */}
      <div className="mb-8">
        {collection.image_url && (
          <div className="w-full h-48 md:h-64 rounded-lg overflow-hidden mb-6">
            <img
              src={collection.image_url}
              alt={collectionName}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h1 className="text-4xl font-bold text-[#3C2F2F] mb-4">{collectionName}</h1>

        {collectionDescription && (
          <p className="text-lg text-[#6B5844] max-w-3xl">{collectionDescription}</p>
        )}

        <div className="mt-4 text-sm text-[#8B6F47]">
          {products.length}{' '}
          {i18n.language === 'en'
            ? products.length === 1
              ? 'product'
              : 'products'
            : products.length === 1
            ? 'producto'
            : 'productos'}
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎵</div>
          <h2 className="text-2xl font-semibold text-[#3C2F2F] mb-2">
            {i18n.language === 'en' ? 'Coming Soon' : 'Próximamente'}
          </h2>
          <p className="text-[#6B5844] mb-6">
            {i18n.language === 'en'
              ? 'This collection is being prepared. Check back soon!'
              : 'Esta colección está en preparación. ¡Vuelve pronto!'}
          </p>
          <Link
            to="/colecciones"
            className="inline-block px-6 py-3 bg-[#8B6F47] text-white rounded-lg hover:bg-[#A0845A] transition-colors"
          >
            {i18n.language === 'en' ? 'View All Collections' : 'Ver Todas las Colecciones'}
          </Link>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  )
}
