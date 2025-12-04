import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCartStore } from '@/store/cart'
import { formatMoney } from '@/lib/money'
import Breadcrumbs from '@/components/Breadcrumbs'
import { AddressAutocomplete, type AddressData } from '@/components/AddressAutocomplete'
import { mockServer } from '@/server/mockServer'
import { config } from '@/lib/config'
import { supabase } from '@/lib/supabase'
import {
  type ShippingZone,
  type ShippingConfig,
  getShippingZone,
  getShippingCost,
  isCountrySupported,
  getZoneLabel,
  DEFAULT_SHIPPING_CONFIG
} from '@/lib/shipping'

/**
 * Página de checkout
 * - Formulario de contacto y envío
 * - Google Places Autocomplete para direcciones
 * - Sistema de zonas de envío (USA, Canadá/México, Internacional)
 * - Resumen del carrito con totales dinámicos
 * - Opción de pickup local
 * - Integración con cupones
 * - Integración con Stripe Checkout
 */

type ShippingMethod = 'shipping' | 'pickup'

export default function CheckoutPage() {
  const { t, i18n } = useTranslation(['checkout', 'cart', 'navigation', 'messages'])

  // Datos del carrito
  const items = useCartStore((state) => state.items)
  const subtotalFn = useCartStore((state) => state.subtotal)
  const couponCode = useCartStore((state) => state.couponCode)
  const discountAmount = useCartStore((state) => state.discountAmount)

  // Calcular totales
  const subtotal = subtotalFn()
  // Note: Using calculatedTotal instead of store's total() because we need dynamic shipping

  // Estado del formulario
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('shipping')
  const [isProcessing, setIsProcessing] = useState(false)

  // Estado de dirección y zona de envío
  const [addressData, setAddressData] = useState<AddressData | null>(null)
  const [shippingZone, setShippingZone] = useState<ShippingZone | null>(null)
  const [shippingConfig, setShippingConfig] = useState<ShippingConfig>(DEFAULT_SHIPPING_CONFIG)
  const [addressError, setAddressError] = useState<string | null>(null)

  // Cargar configuración de envío desde Supabase
  useEffect(() => {
    async function loadShippingConfig() {
      try {
        const { data, error } = await supabase
          .from('shipping_config')
          .select('*')
          .limit(1)
          .single()

        if (error) throw error
        if (data) setShippingConfig(data as ShippingConfig)
      } catch (error) {
        console.warn('Using default shipping config:', error)
      }
    }
    loadShippingConfig()
  }, [])

  // Calcular costo de envío según zona
  const calculatedShippingCost =
    shippingMethod === 'pickup' || !shippingZone
      ? 0
      : getShippingCost(shippingZone, shippingConfig, subtotal.amount)

  const shipping = { amount: calculatedShippingCost, currency: 'USD' as const }

  // Calcular total con envío dinámico
  const calculatedTotal = {
    amount:
      subtotal.amount - (discountAmount?.amount || 0) + (shippingMethod === 'pickup' ? 0 : calculatedShippingCost),
    currency: 'USD' as const
  }

  // Redirect si el carrito está vacío
  if (items.length === 0) {
    return <Navigate to="/" replace />
  }

  // Handler cuando se selecciona una dirección
  const handleAddressSelect = (data: AddressData) => {
    setAddressData(data)
    setAddressError(null)

    const zone = getShippingZone(data.countryCode)
    setShippingZone(zone)

    if (zone === 'ZONE_3') {
      setAddressError(
        t('checkout:internationalNotSupported', 'Actualmente solo enviamos a USA, Canadá y México.')
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación básica
    if (!email || !firstName || !lastName) {
      alert(t('checkout:requiredFieldsAlert'))
      return
    }

    // Validar dirección para envío
    if (shippingMethod === 'shipping') {
      if (!addressData) {
        alert(t('checkout:addressRequired', 'Por favor ingresa una dirección de envío'))
        return
      }

      if (!isCountrySupported(addressData.countryCode)) {
        alert(
          t('checkout:countryNotSupported', 'Lo sentimos, no enviamos a este país. Contáctanos para más información.')
        )
        return
      }
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
        shippingCost: calculatedShippingCost,
        shippingZone: shippingZone || undefined,
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/cancel`
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

  // Check if form is valid for submission
  const isFormValid =
    email &&
    firstName &&
    lastName &&
    (shippingMethod === 'pickup' || (addressData && isCountrySupported(addressData.countryCode)))

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Breadcrumbs
        items={[
          { label: t('navigation:home'), href: '/' },
          { label: t('checkout:checkout'), href: '/checkout' }
        ]}
      />

      <h1 className="text-3xl md:text-4xl font-serif text-brand-terra mb-8 mt-6">{t('checkout:checkout')}</h1>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
        {/* Columna izquierda: Formulario */}
        <div className="space-y-6">
          {/* Información de contacto */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="text-xl font-semibold text-brand-dark mb-4">{t('checkout:contactInformation')}</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-brand-dark mb-2">
                  {t('checkout:email')} <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terra focus:border-transparent"
                  placeholder={t('checkout:emailPlaceholder')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-brand-dark mb-2">
                    {t('checkout:firstName')} <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terra focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-brand-dark mb-2">
                    {t('checkout:lastName')} <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terra focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-brand-dark mb-2">
                  {t('checkout:phone')}
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terra focus:border-transparent"
                  placeholder={t('checkout:phonePlaceholder')}
                />
              </div>
            </div>
          </div>

          {/* Método de envío */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="text-xl font-semibold text-brand-dark mb-4">{t('checkout:shippingMethod')}</h2>

            <div className="space-y-3">
              <label
                className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  shippingMethod === 'shipping'
                    ? 'border-brand-terra bg-stone-200/30'
                    : 'border-stone-200 hover:border-brand-gold'
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
                  <p className="font-medium text-brand-dark">{t('checkout:homeDelivery')}</p>
                  <p className="text-sm text-gray-500 mt-1">{t('checkout:homeDeliveryDescription')}</p>
                  {shippingZone && shippingZone !== 'ZONE_3' && (
                    <p className="text-xs text-brand-terra mt-1">
                      {getZoneLabel(shippingZone, i18n.language === 'es' ? 'es' : 'en')}
                    </p>
                  )}
                </div>
                <span className="font-medium text-brand-dark">
                  {shippingZone && calculatedShippingCost === 0
                    ? t('cart:free')
                    : shippingZone
                      ? formatMoney(shipping)
                      : `$${shippingConfig.zone_1_cost.toFixed(2)}+`}
                </span>
              </label>

              <label
                className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  shippingMethod === 'pickup'
                    ? 'border-brand-terra bg-stone-200/30'
                    : 'border-stone-200 hover:border-brand-gold'
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
                  <p className="font-medium text-brand-dark">{t('checkout:pickupInStore')}</p>
                  <p className="text-sm text-gray-500 mt-1">{t('checkout:pickupInStoreDescription')}</p>
                </div>
                <span className="font-medium text-green-600">{t('cart:free')}</span>
              </label>
            </div>
          </div>

          {/* Dirección de envío con Google Places (solo si shipping) */}
          {shippingMethod === 'shipping' && (
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h2 className="text-xl font-semibold text-brand-dark mb-4">{t('checkout:shippingAddress')}</h2>

              <div className="space-y-4">
                {/* Google Places Autocomplete */}
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">
                    {t('checkout:address')} <span className="text-red-600">*</span>
                  </label>
                  <AddressAutocomplete
                    onAddressSelect={handleAddressSelect}
                    placeholder={t('checkout:addressAutocompletePlaceholder', 'Empieza a escribir tu dirección...')}
                    error={!!addressError}
                    required
                  />
                </div>

                {/* Error de país no soportado */}
                {addressError && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🌍</span>
                      <div>
                        <p className="font-medium text-amber-800">{addressError}</p>
                        <p className="text-sm text-amber-700 mt-1">
                          {t(
                            'checkout:contactForInternational',
                            'Para envíos internacionales, contáctanos en hello@sondenudos.com'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Detalles de la dirección seleccionada */}
                {addressData && !addressError && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="font-medium text-green-800">{addressData.formattedAddress}</p>
                        <p className="text-sm text-green-700 mt-1">
                          {addressData.city}, {addressData.state} {addressData.zipCode}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {addressData.country} ({addressData.countryCode})
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nota sobre zonas de envío */}
                <div className="text-sm text-gray-500 flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    {t(
                      'checkout:shippingZonesNote',
                      `Envío: USA $${shippingConfig.zone_1_cost.toFixed(2)}, Canadá/México $${shippingConfig.zone_2_cost.toFixed(2)}. Gratis en compras +$${shippingConfig.free_shipping_threshold.toFixed(0)}.`
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha: Resumen del pedido */}
        <div>
          <div className="bg-white rounded-2xl shadow-soft p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-brand-dark mb-4">{t('checkout:orderSummary')}</h2>

            {/* Items */}
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="flex gap-3 pb-3 border-b border-stone-200 last:border-b-0"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-stone-200 flex-shrink-0">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-brand-dark text-sm truncate">{item.title}</h3>
                    <p className="text-xs text-gray-500">{item.variantTitle}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('checkout:quantity')} {item.quantity}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium text-brand-dark text-sm">
                      {formatMoney({
                        amount: item.unitPrice.amount * item.quantity,
                        currency: item.unitPrice.currency
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div className="space-y-3 pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-dark">{t('cart:subtotal')}</span>
                <span className="font-medium text-brand-dark">{formatMoney(subtotal)}</span>
              </div>

              {discountAmount && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600">
                    {couponCode ? t('cart:discountWithCode', { code: couponCode }) : t('cart:discount')}
                  </span>
                  <span className="font-medium text-green-600">-{formatMoney(discountAmount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-dark">{t('cart:shipping')}</span>
                {shippingMethod === 'pickup' ? (
                  <span className="font-medium text-green-600">{t('cart:free')}</span>
                ) : calculatedShippingCost === 0 && shippingZone ? (
                  <span className="font-medium text-green-600">{t('cart:free')}</span>
                ) : (
                  <span className="font-medium text-brand-dark">
                    {shippingZone ? formatMoney(shipping) : '—'}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-lg font-semibold pt-3 border-t border-stone-200">
                <span className="text-brand-dark">{t('cart:total')}</span>
                <span className="text-brand-terra">{formatMoney(calculatedTotal)}</span>
              </div>
            </div>

            {/* Botón de pago */}
            <button
              type="submit"
              disabled={isProcessing || !isFormValid}
              className="w-full mt-6 py-4 bg-brand-terra text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? t('checkout:processing') : t('checkout:completeOrder')}
            </button>

            {!isFormValid && shippingMethod === 'shipping' && !addressData && (
              <p className="text-xs text-amber-600 text-center mt-2">
                {t('checkout:selectAddressToContinue', 'Selecciona una dirección de envío para continuar')}
              </p>
            )}

            <p className="text-xs text-gray-500 text-center mt-4">{t('checkout:termsAcceptance')}</p>
          </div>
        </div>
      </form>
    </div>
  )
}
