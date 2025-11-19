import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Product, Variant } from '@/types/models'
import { useCartStore } from '@/store/cart'
import { useUIStore } from '@/store/ui'

/**
 * Botón para agregar producto al carrito
 * - Se integra con Zustand para agregar items
 * - Muestra feedback visual al agregar
 * - Abre el CartDrawer después de agregar
 * - Se deshabilita si no hay variante seleccionada o no está disponible
 * Fase 8: Integrado con i18n para soporte bilingüe
 */

type AddToCartButtonProps = {
  product: Product
  selectedVariant: Variant | undefined
  disabled?: boolean
}

export default function AddToCartButton({
  product,
  selectedVariant,
  disabled = false,
}: AddToCartButtonProps) {
  const { t } = useTranslation(['messages', 'product'])
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const addItem = useCartStore((state) => state.addItem)
  const openCartDrawer = useUIStore((state) => state.openCartDrawer)

  const canAddToCart = !disabled && selectedVariant && selectedVariant.available

  const handleAddToCart = async () => {
    if (!canAddToCart || !selectedVariant) return

    setIsAdding(true)

    // Simular pequeño delay para feedback visual
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Agregar al carrito
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      title: product.title,
      variantTitle: selectedVariant.title,
      unitPrice: selectedVariant.price,
      image: selectedVariant.image || product.images[0],
    })

    setIsAdding(false)
    setShowSuccess(true)

    // Mostrar mensaje de éxito
    setTimeout(() => {
      setShowSuccess(false)
      // Abrir drawer del carrito
      openCartDrawer()
    }, 800)
  }

  // Determinar texto del botón
  let buttonText = t('messages:addToCart')
  if (isAdding) buttonText = t('messages:adding')
  if (showSuccess) buttonText = t('messages:added')
  if (!selectedVariant) buttonText = t('product:selectOptions')
  if (selectedVariant && !selectedVariant.available) buttonText = t('product:outOfStock')

  return (
    <button
      onClick={handleAddToCart}
      disabled={!canAddToCart || isAdding || showSuccess}
      className={`
        w-full py-4 px-6 rounded-lg font-medium text-lg transition-all transform
        ${
          canAddToCart && !isAdding && !showSuccess
            ? 'bg-brand-terra text-white hover:bg-opacity-90 hover:shadow-soft-hover active:scale-95'
            : !selectedVariant
            ? 'bg-stone-200 text-gray-500 cursor-not-allowed'
            : selectedVariant && !selectedVariant.available
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : showSuccess
            ? 'bg-green-600 text-white'
            : 'bg-brand-terra text-white opacity-70 cursor-wait'
        }
      `}
      aria-label={buttonText}
    >
      <span className="flex items-center justify-center gap-2">
        {isAdding && (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {buttonText}
      </span>
    </button>
  )
}
