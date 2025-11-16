import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCartStore } from '@/store/cart'
import { formatMoney } from '@/lib/money'
import Breadcrumbs from '@/components/Breadcrumbs'
import { mockServer } from '@/server/mockServer'
import { config } from '@/lib/config'

/**
 * Página de checkout
 * - Formulario de contacto y envío
 * - Resumen del carrito con totales
 * - Opción de pickup local
 * - Integración con cupones
 * - Integración con Stripe Checkout (Fase 6)
 *
 * Fase 6: Checkout integrado con mockServer y Stripe
 */

type ShippingMethod = 'shipping' | 'pickup'

export default function CheckoutPage() {
  const { t } = useTranslation(['checkout', 'cart', 'navigation', 'messages'])

  // Datos del carrito
  const items = useCartStore((state) => state.items)
  const subtotalFn = useCartStore((state) => state.subtotal)
  const shippingFn = useCartStore((state) => state.shipping)
  const totalFn = useCartStore((state) => state.total)
  const couponCode = useCartStore((state) => state.couponCode)
  const discountAmount = useCartStore((state) => state.discountAmount)

  // Calcular totales
  const subtotal = subtotalFn()
  const shipping = shippingFn()
  const total = totalFn()

  // Estado del formulario
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [phone, setPhone] = useState('')
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('shipping')
  const [isProcessing, setIsProcessing] = useState(false)

  // Redirect si el carrito está vacío
  if (items.length === 0) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación básica
    if (!email || !firstName || !lastName) {
      alert(t('checkout:requiredFieldsAlert'))
      return
    }

    if (shippingMethod === 'shipping' && (!address || !city || !state || !zipCode)) {
      alert(t('checkout:shippingInfoAlert'))
      return
    }

    setIsProcessing(true)

    try {
      // Crear sesión de checkout (mock o Stripe según configuración)
      const response = await mockServer.createCheckoutSession({
        items,
        couponCode,
        discountAmount: discountAmount?.amount,
        customerEmail: email,
        shippingMethod,
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/cancel`,
      })

      if (!response.success || !response.data) {
        throw new Error(response.error || t('messages:errorCreatingSession'))
      }

      const { sessionId, checkoutUrl } = response.data

      console.log('[Checkout] Sesión creada:', { sessionId, mode: config.dataMode })

      // Si es Stripe y la URL es externa, redirigir a Stripe Checkout
      if (config.enableStripe && checkoutUrl.startsWith('http')) {
        window.location.href = checkoutUrl
      } else {
        // Modo mock: redirigir localmente
        window.location.href = checkoutUrl
      }
    } catch (error) {
      console.error('[Checkout] Error:', error)
      alert(error instanceof Error ? error.message : t('messages:errorProcessingPayment'))
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Breadcrumbs items={[{ label: t('navigation:home'), href: '/' }, { label: t('checkout:checkout'), href: '/checkout' }]} />

      <h1 className="text-3xl md:text-4xl font-serif text-primary-brown mb-8 mt-6">
        {t('checkout:checkout')}
      </h1>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
        {/* Columna izquierda: Formulario */}
        <div className="space-y-6">
          {/* Información de contacto */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="text-xl font-semibold text-text-dark mb-4">
              {t('checkout:contactInformation')}
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-dark mb-2">
                  {t('checkout:email')} <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-secondary-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown focus:border-transparent"
                  placeholder={t('checkout:emailPlaceholder')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-text-dark mb-2">
                    {t('checkout:firstName')} <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 border border-secondary-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-text-dark mb-2">
                    {t('checkout:lastName')} <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 border border-secondary-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-text-dark mb-2">
                  {t('checkout:phone')}
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-secondary-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown focus:border-transparent"
                  placeholder={t('checkout:phonePlaceholder')}
                />
              </div>
            </div>
          </div>

          {/* Método de envío */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="text-xl font-semibold text-text-dark mb-4">{t('checkout:shippingMethod')}</h2>

            <div className="space-y-3">
              <label
                className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  shippingMethod === 'shipping'
                    ? 'border-primary-brown bg-secondary-beige/30'
                    : 'border-secondary-beige hover:border-accent-gold'
                }`}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  value="shipping"
                  checked={shippingMethod === 'shipping'}
                  onChange={(e) => setShippingMethod(e.target.value as ShippingMethod)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-medium text-text-dark">{t('checkout:homeDelivery')}</p>
                  <p className="text-sm text-text-light mt-1">
                    {t('checkout:homeDeliveryDescription')}
                  </p>
                </div>
                <span className="font-medium text-text-dark">
                  {formatMoney(shipping)}
                </span>
              </label>

              <label
                className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  shippingMethod === 'pickup'
                    ? 'border-primary-brown bg-secondary-beige/30'
                    : 'border-secondary-beige hover:border-accent-gold'
                }`}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  value="pickup"
                  checked={shippingMethod === 'pickup'}
                  onChange={(e) => setShippingMethod(e.target.value as ShippingMethod)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-medium text-text-dark">{t('checkout:pickupInStore')}</p>
                  <p className="text-sm text-text-light mt-1">
                    {t('checkout:pickupInStoreDescription')}
                  </p>
                </div>
                <span className="font-medium text-green-600">{t('cart:free')}</span>
              </label>
            </div>
          </div>

          {/* Dirección de envío (solo si shipping) */}
          {shippingMethod === 'shipping' && (
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h2 className="text-xl font-semibold text-text-dark mb-4">
                {t('checkout:shippingAddress')}
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-text-dark mb-2">
                    {t('checkout:address')} <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 border border-secondary-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown focus:border-transparent"
                    placeholder={t('checkout:streetPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-text-dark mb-2">
                      {t('checkout:city')} <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 border border-secondary-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-text-dark mb-2">
                      {t('checkout:state')} <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="state"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-3 border border-secondary-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-text-dark mb-2">
                    {t('checkout:zipCode')} <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    required
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full px-4 py-3 border border-secondary-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown focus:border-transparent"
                    placeholder={t('checkout:zipCodePlaceholder')}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha: Resumen del pedido */}
        <div>
          <div className="bg-white rounded-2xl shadow-soft p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-text-dark mb-4">{t('checkout:orderSummary')}</h2>

            {/* Items */}
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="flex gap-3 pb-3 border-b border-secondary-beige last:border-b-0"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary-beige flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text-dark text-sm truncate">
                      {item.title}
                    </h3>
                    <p className="text-xs text-text-light">{item.variantTitle}</p>
                    <p className="text-xs text-text-light mt-1">{t('checkout:quantity')} {item.quantity}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium text-text-dark text-sm">
                      {formatMoney({
                        amount: item.unitPrice.amount * item.quantity,
                        currency: item.unitPrice.currency,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div className="space-y-3 pt-4 border-t border-secondary-beige">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-dark">{t('cart:subtotal')}</span>
                <span className="font-medium text-text-dark">{formatMoney(subtotal)}</span>
              </div>

              {discountAmount && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600">
                    {couponCode ? t('cart:discountWithCode', { code: couponCode }) : t('cart:discount')}
                  </span>
                  <span className="font-medium text-green-600">
                    -{formatMoney(discountAmount)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-text-dark">{t('cart:shipping')}</span>
                {shippingMethod === 'pickup' ? (
                  <span className="font-medium text-green-600">{t('cart:free')}</span>
                ) : (
                  <span className="font-medium text-text-dark">{formatMoney(shipping)}</span>
                )}
              </div>

              <div className="flex items-center justify-between text-lg font-semibold pt-3 border-t border-secondary-beige">
                <span className="text-text-dark">{t('cart:total')}</span>
                <span className="text-primary-brown">
                  {formatMoney(
                    shippingMethod === 'pickup'
                      ? {
                          amount: subtotal.amount - (discountAmount?.amount || 0),
                          currency: 'USD',
                        }
                      : total
                  )}
                </span>
              </div>
            </div>

            {/* Botón de pago */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full mt-6 py-4 bg-primary-brown text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? t('checkout:processing') : t('checkout:completeOrder')}
            </button>

            <p className="text-xs text-text-light text-center mt-4">
              {t('checkout:termsAcceptance')}
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
