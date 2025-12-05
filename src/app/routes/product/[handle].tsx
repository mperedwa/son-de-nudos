import { useState, useEffect, useMemo } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Product, Variant } from '@/types/models'
import Breadcrumbs from '@/components/Breadcrumbs'
import ImageGallery from '@/components/ImageGallery'
import Price from '@/components/Price'
import VariantSelector from '@/components/VariantSelector'
import AddToCartButton from '@/components/AddToCartButton'
import ProductSchema from '@/components/ProductSchema'
import { getPublicProductByHandle, type PublicProduct } from '@/lib/supabase-public'

/**
 * Transforma un PublicProduct de Supabase al formato Product usado por los componentes
 * Usa el idioma actual para seleccionar título y descripción
 */
function transformToProduct(p: PublicProduct, lang: string): Product {
  const isEnglish = lang === 'en'
  return {
    id: p.id,
    handle: p.handle,
    title: isEnglish && p.title_en ? p.title_en : p.title,
    descriptionHtml: isEnglish && p.descriptionHtml_en ? p.descriptionHtml_en : (p.descriptionHtml || ''),
    images: p.images,
    price: { amount: p.price.amount, currency: 'USD' as const },
    compareAtPrice: p.compareAtPrice ? { amount: p.compareAtPrice.amount, currency: 'USD' as const } : undefined,
    options: p.options,
    variants: p.variants.map((v): Variant => ({
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
  }
}

/**
 * Página de detalle de producto
 * - Carga producto por handle desde Supabase API pública
 * - Galería de imágenes con miniaturas
 * - Selector de variantes con disponibilidad
 * - Botón agregar al carrito integrado con Zustand
 * - Manejo de errores para handles no encontrados
 *
 * Fase 11: Integrado con Supabase (lectura pública)
 */
export default function ProductPage() {
  const { handle } = useParams<{ handle: string }>()
  const { t, i18n } = useTranslation(['navigation', 'messages', 'product'])

  // Estados
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  // Cargar producto desde Supabase API pública
  useEffect(() => {
    const loadProduct = async () => {
      if (!handle) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const publicProduct = await getPublicProductByHandle(handle)
        if (publicProduct) {
          setProduct(transformToProduct(publicProduct, i18n.language))
        } else {
          setError(t('messages:productNotFound', 'Producto no encontrado'))
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : t('messages:errorLoadingProduct', 'Error al cargar producto')
        setError(message)
        console.error('[ProductPage] Error:', err)
      }

      setIsLoading(false)
    }

    loadProduct()
  }, [handle, i18n.language, t])

  // Encontrar la variante que coincide con las opciones seleccionadas
  const selectedVariant = useMemo<Variant | undefined>(() => {
    if (!product) return undefined

    // Si no hay todas las opciones seleccionadas, no hay variante
    const allOptionsSelected = product.options.every((opt) => selectedOptions[opt])
    if (!allOptionsSelected) return undefined

    // Buscar variante que coincida con todas las opciones
    return product.variants.find((variant) =>
      product.options.every((opt) => variant.options[opt] === selectedOptions[opt])
    )
  }, [product, selectedOptions])

  // Manejar cambio de opción
  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }))
  }

  // Si no se encuentra el producto después de cargar, redirigir a la colección
  if (!isLoading && (!handle || !product)) {
    return <Navigate to="/" replace />
  }

  // Mostrar loading mientras carga
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-terra mx-auto mb-4"></div>
            <p className="text-gray-500">{t('messages:loading', 'Cargando...')}</p>
          </div>
        </div>
      </div>
    )
  }

  // Si hay error, mostrar mensaje (pero esto debería redirigir)
  if (error || !product) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* JSON-LD Schema para rich snippets en Google */}
      <ProductSchema product={product} />

      <Breadcrumbs
        items={[
          { label: t('navigation:home'), href: '/' },
          { label: t('navigation:shop'), href: '/' },
          { label: t('navigation:necklaces'), href: '/' },
          { label: product.title, href: `/product/${handle}` },
        ]}
      />

      {/* Layout principal: Imagen | Información */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
        {/* Galería de imágenes */}
        <div>
          <ImageGallery images={product.images} productTitle={product.title} />
        </div>

        {/* Información del producto */}
        <div className="space-y-6">
          {/* Título y precio */}
          <div>
            <h1 className="text-4xl font-serif text-brand-terra mb-4">
              {product.title}
            </h1>

            <Price
              price={selectedVariant?.price || product.price}
              compareAtPrice={selectedVariant?.compareAtPrice || product.compareAtPrice}
              showDiscount={true}
              className="text-2xl"
            />
          </div>

          {/* Descripción */}
          <div
            className="prose prose-sm text-brand-dark"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />

          {/* Selector de variantes */}
          <div className="border-t border-stone-200 pt-6">
            <VariantSelector
              product={product}
              selectedOptions={selectedOptions}
              onOptionChange={handleOptionChange}
              selectedVariant={selectedVariant}
            />
          </div>

          {/* Botón agregar al carrito */}
          <div className="border-t border-stone-200 pt-6">
            <AddToCartButton product={product} selectedVariant={selectedVariant} />

            {/* Información adicional */}
            <div className="mt-6 space-y-3 text-sm text-gray-500">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Envío gratis en compras superiores a $150</span>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>Pago en 4 cuotas sin intereses</span>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Pickup local disponible en CDMX</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-stone-200 text-brand-dark text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sección adicional: Detalles del producto */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-brand-terra" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <h3 className="font-semibold text-brand-terra mb-2">Diseño artesanal</h3>
          <p className="text-sm text-gray-500">
            Cada pieza es única y hecha a mano con materiales seleccionados
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6">
          <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-brand-terra" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="font-semibold text-brand-terra mb-2">Materiales de calidad</h3>
          <p className="text-sm text-gray-500">
            Trabajamos con materiales duraderos y acabados de alta calidad
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6">
          <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-brand-terra" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-brand-terra mb-2">Perfecto para regalar</h3>
          <p className="text-sm text-gray-500">
            Ideal para ocasiones especiales y regalos memorables
          </p>
        </div>
      </div>
    </div>
  )
}
