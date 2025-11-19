import type { Money } from '@/types/models'
import { formatMoney, getDiscountPercentage } from '@/lib/money'

/**
 * Componente para mostrar precios con formato consistente
 * Soporta precio regular y precio comparativo (tachado)
 */

type PriceProps = {
  price: Money
  compareAtPrice?: Money
  className?: string
  showDiscount?: boolean
}

export default function Price({
  price,
  compareAtPrice,
  className = '',
  showDiscount = false
}: PriceProps) {
  const hasDiscount = compareAtPrice && compareAtPrice.amount > price.amount
  const discountPercent = hasDiscount
    ? getDiscountPercentage(compareAtPrice, price)
    : 0

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Precio actual */}
      <span className="text-brand-terra font-semibold text-lg">
        {formatMoney(price)}
      </span>

      {/* Precio comparativo tachado */}
      {hasDiscount && (
        <span className="text-gray-500 text-sm line-through">
          {formatMoney(compareAtPrice)}
        </span>
      )}

      {/* Badge de descuento */}
      {hasDiscount && showDiscount && discountPercent > 0 && (
        <span className="bg-brand-gold text-white text-xs px-2 py-1 rounded-full font-medium">
          -{discountPercent}%
        </span>
      )}
    </div>
  )
}
