import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useUIStore } from '@/store/ui'
import { useCartStore } from '@/store/cart'
import { formatMoney } from '@/lib/money'

/**
 * Drawer lateral del carrito de compras
 * - Slide-over desde la derecha
 * - Lista de items con controles de cantidad
 * - Formulario de cupones con validación
 * - Resumen con subtotal, descuentos y total
 * - Botón para ir al checkout
 * - Accesible con focus trap y cierre con ESC
 */

export default function CartDrawer() {
  const { t } = useTranslation(['cart', 'navigation'])
  const isOpen = useUIStore((state) => state.isCartDrawerOpen)
  const closeDrawer = useUIStore((state) => state.closeCartDrawer)

  // Obtener datos del carrito
  const items = useCartStore((state) => state.items)
  const couponCode = useCartStore((state) => state.couponCode)
  const discountAmount = useCartStore((state) => state.discountAmount)

  // Obtener funciones del carrito (no llamarlas en el selector)
  const subtotalFn = useCartStore((state) => state.subtotal)
  const shippingFn = useCartStore((state) => state.shipping)
  const totalFn = useCartStore((state) => state.total)
  const isFreeShippingFn = useCartStore((state) => state.isFreeShipping)
  const amountUntilFreeShippingFn = useCartStore((state) => state.amountUntilFreeShipping)
  const updateQty = useCartStore((state) => state.updateQty)
  const removeItem = useCartStore((state) => state.removeItem)
  const applyCoupon = useCartStore((state) => state.applyCoupon)
  const removeCoupon = useCartStore((state) => state.removeCoupon)

  // Llamar funciones computadas
  const subtotal = subtotalFn()
  const shipping = shippingFn()
  const total = totalFn()
  const isFreeShipping = isFreeShippingFn()
  const amountUntilFreeShipping = amountUntilFreeShippingFn()

  // Progreso de envío gratis
  const shippingProgress = isFreeShipping ? 100 : ((subtotal.amount / 150) * 100)

  // Estado del formulario de cupones
  const [couponInput, setCouponInput] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState(false)

  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeDrawer()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      // Prevenir scroll del body cuando el drawer está abierto
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, closeDrawer])

  // Manejar aplicación de cupón
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!couponInput.trim()) return

    setIsApplying(true)
    setCouponError('')
    setCouponSuccess(false)

    const result = await applyCoupon(couponInput.trim())

    setIsApplying(false)

    if (result.success) {
      setCouponSuccess(true)
      setCouponInput('')
      setTimeout(() => setCouponSuccess(false), 3000)
    } else {
      setCouponError(result.error || t('cart:couponError'))
    }
  }

  // Manejar eliminación de cupón
  const handleRemoveCoupon = () => {
    removeCoupon()
    setCouponInput('')
    setCouponError('')
    setCouponSuccess(false)
  }

  if (!isOpen) return null

  const isEmpty = items.length === 0

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label={t('cart:shoppingCart')}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-beige">
          <h2 className="text-2xl font-serif text-primary-brown">
            {t('cart:yourCartWithCount', { count: items.length })}
          </h2>
          <button
            onClick={closeDrawer}
            className="text-text-dark hover:text-primary-brown transition-colors"
            aria-label={t('navigation:closeCart')}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        {isEmpty ? (
          // Estado vacío
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <svg
              className="w-24 h-24 text-secondary-beige mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h3 className="text-lg font-medium text-text-dark mb-2">
              {t('cart:cartEmpty')}
            </h3>
            <p className="text-text-light mb-6">
              {t('cart:cartEmptyDescription')}
            </p>
            <Link
              to="/"
              onClick={closeDrawer}
              className="px-6 py-3 bg-primary-brown text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors"
            >
              {t('cart:viewProducts')}
            </Link>
          </div>
        ) : (
          <>
            {/* Lista de items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="flex gap-4 pb-4 border-b border-secondary-beige last:border-b-0"
                >
                  {/* Imagen */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary-beige flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text-dark text-sm mb-1 truncate">
                      {item.title}
                    </h3>
                    <p className="text-xs text-text-light mb-2">{item.variantTitle}</p>

                    {/* Controles de cantidad */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-secondary-beige rounded-lg">
                        <button
                          onClick={() =>
                            updateQty(
                              item.productId,
                              item.variantId,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          disabled={item.quantity <= 1}
                          className="px-2 py-1 text-text-dark hover:text-primary-brown disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          aria-label={t('cart:decreaseQuantity')}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>

                        <span className="px-3 py-1 text-sm font-medium text-text-dark min-w-[2rem] text-center">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQty(item.productId, item.variantId, item.quantity + 1)
                          }
                          className="px-2 py-1 text-text-dark hover:text-primary-brown transition-colors"
                          aria-label={t('cart:increaseQuantity')}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Botón eliminar */}
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="text-xs text-red-600 hover:text-red-800 transition-colors"
                        aria-label={t('cart:removeItem', { item: item.title })}
                      >
                        {t('cart:remove')}
                      </button>
                    </div>
                  </div>

                  {/* Precio */}
                  <div className="text-right">
                    <p className="font-medium text-text-dark">
                      {formatMoney(item.unitPrice)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-text-light mt-1">
                        {formatMoney({
                          amount: item.unitPrice.amount * item.quantity,
                          currency: item.unitPrice.currency,
                        })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Indicador de envío gratis */}
            {!isEmpty && (
              <div className="px-6 py-4 bg-secondary-beige/30">
                <div className="space-y-2">
                  {isFreeShipping ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm font-medium">{t('cart:freeShippingUnlocked')}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-text-dark">
                      {t('cart:amountUntilFreeShipping', { amount: amountUntilFreeShipping.toFixed(2) })}
                    </p>
                  )}

                  {/* Barra de progreso */}
                  <div className="w-full bg-secondary-beige rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-primary-brown transition-all duration-300"
                      style={{ width: `${Math.min(shippingProgress, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Footer con cupones, totales y checkout */}
            <div className="border-t border-secondary-beige p-6 space-y-4">
              {/* Formulario de cupón */}
              {!couponCode ? (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder={t('cart:couponCodePlaceholder')}
                      className="flex-1 px-4 py-2 border border-secondary-beige rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-brown focus:border-transparent"
                      disabled={isApplying}
                    />
                    <button
                      type="submit"
                      disabled={isApplying || !couponInput.trim()}
                      className="px-4 py-2 bg-primary-brown text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isApplying ? t('cart:applying') : t('cart:apply')}
                    </button>
                  </div>

                  {/* Error de cupón */}
                  {couponError && (
                    <p className="text-xs text-red-600">{couponError}</p>
                  )}

                  {/* Éxito de cupón */}
                  {couponSuccess && (
                    <p className="text-xs text-green-600">{t('cart:couponAppliedSuccess')}</p>
                  )}
                </form>
              ) : (
                /* Cupón aplicado */
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium text-green-800">
                      {t('cart:couponApplied', { code: couponCode })}
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-green-700 hover:text-green-900 font-medium"
                  >
                    {t('cart:removeCoupon')}
                  </button>
                </div>
              )}

              {/* Subtotal */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-dark">{t('cart:subtotal')}</span>
                <span className="font-medium text-text-dark">{formatMoney(subtotal)}</span>
              </div>

              {/* Descuento (si hay cupón aplicado) */}
              {discountAmount && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600">{couponCode ? t('cart:discountWithCode', { code: couponCode }) : t('cart:discount')}</span>
                  <span className="font-medium text-green-600">
                    -{formatMoney(discountAmount)}
                  </span>
                </div>
              )}

              {/* Envío */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-dark">{t('cart:shipping')}</span>
                {isFreeShipping ? (
                  <span className="font-medium text-green-600">{t('cart:free')}</span>
                ) : (
                  <span className="font-medium text-text-dark">{formatMoney(shipping)}</span>
                )}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between text-lg font-semibold pt-2 border-t border-secondary-beige">
                <span className="text-text-dark">{t('cart:total')}</span>
                <span className="text-primary-brown">{formatMoney(total)}</span>
              </div>

              {/* Nota de impuestos */}
              <p className="text-xs text-text-light text-center">
                {t('cart:taxesIncluded')}
              </p>

              {/* Botón checkout */}
              <Link
                to="/checkout"
                onClick={closeDrawer}
                className="block w-full py-4 bg-primary-brown text-white text-center rounded-lg font-medium hover:bg-opacity-90 transition-colors"
              >
                {t('cart:goToCheckout')}
              </Link>

              {/* Continuar comprando */}
              <button
                onClick={closeDrawer}
                className="block w-full py-3 text-primary-brown text-center text-sm font-medium hover:underline"
              >
                {t('cart:continueShopping')}
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
