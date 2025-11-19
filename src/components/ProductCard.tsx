import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Product } from '@/types/models'
import Price from '@/components/Price'

/**
 * Tarjeta de producto para el grid de colección
 * - Imagen principal con hover image (segunda imagen si existe)
 * - Título del producto
 * - Precio con compareAtPrice opcional
 * - Link a página de detalle
 * - Efecto lifting en hover
 * Fase 8: Integrado con i18n para soporte bilingüe
 */

type ProductCardProps = {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation('product')
  const [isHovered, setIsHovered] = useState(false)

  const mainImage = product.images[0] || '/images/placeholder.jpg'
  const hoverImage = product.images[1] || mainImage
  const hasMultipleVariants = product.variants.length > 1

  return (
    <Link
      to={`/product/${product.handle}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <article className="bg-white rounded-2xl shadow-soft hover:shadow-soft-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        {/* Imagen del producto */}
        <div className="relative aspect-square overflow-hidden bg-brand-sand">
          <img
            src={isHovered ? hoverImage : mainImage}
            alt={product.title}
            className="w-full h-full object-cover transition-opacity duration-300"
            loading="lazy"
          />

          {/* Badge de descuento */}
          {product.compareAtPrice && product.compareAtPrice.amount > product.price.amount && (
            <div className="absolute top-3 right-3 bg-brand-gold text-white text-xs px-3 py-1 rounded-full font-medium shadow-md">
              {t('sale')}
            </div>
          )}

          {/* Badge de nuevo */}
          {product.tags.includes('nuevo') && (
            <div className="absolute top-3 left-3 bg-brand-terra text-white text-xs px-3 py-1 rounded-full font-medium shadow-md">
              {t('new')}
            </div>
          )}

          {/* Badge de agotado */}
          {!product.availableForSale && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <span className="bg-white text-brand-dark text-sm px-4 py-2 rounded-lg font-semibold">
                {t('outOfStock')}
              </span>
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="p-4">
          {/* Título */}
          <h3 className="text-brand-dark font-medium mb-2 line-clamp-2 group-hover:text-brand-terra transition-colors">
            {product.title}
          </h3>

          {/* Precio */}
          <Price
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            showDiscount={true}
          />

          {/* Indicador de variantes */}
          {hasMultipleVariants && (
            <p className="text-gray-500 text-xs mt-2">
              {product.variants.length} {t('optionsAvailable')}
            </p>
          )}
        </div>
      </article>
    </Link>
  )
}
