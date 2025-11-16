import { useTranslation } from 'react-i18next'

/**
 * Página de pago cancelado (Stripe)
 * Permite al usuario volver al carrito
 */
export default function CancelPage() {
  const { t } = useTranslation('messages')

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#FAF7F3] flex items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        <div className="bg-white rounded-2xl shadow-soft p-12 max-w-2xl mx-auto">
          <div className="text-6xl mb-6">✕</div>
          <h1 className="text-4xl font-serif text-primary-brown mb-4">
            {t('paymentCancelledTitle')}
          </h1>
          <p className="text-text-light mb-8">
            {t('paymentCancelledMessage')}
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/checkout"
              className="inline-block bg-primary-brown hover:bg-accent-gold text-white font-medium px-8 py-3 rounded-lg transition-colors"
            >
              {t('backToCheckout')}
            </a>
            <a
              href="/"
              className="inline-block bg-white hover:bg-secondary-beige text-primary-brown border-2 border-primary-brown font-medium px-8 py-3 rounded-lg transition-colors"
            >
              {t('backToStore')}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
