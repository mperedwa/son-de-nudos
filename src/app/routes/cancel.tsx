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
          <h1 className="text-4xl font-serif text-brand-terra mb-4">
            {t('paymentCancelledTitle')}
          </h1>
          <p className="text-gray-500 mb-8">
            {t('paymentCancelledMessage')}
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/checkout"
              className="inline-block bg-brand-terra hover:bg-brand-gold text-white font-medium px-8 py-3 rounded-lg transition-colors"
            >
              {t('backToCheckout')}
            </a>
            <a
              href="/"
              className="inline-block bg-white hover:bg-stone-200 text-brand-terra border-2 border-brand-terra font-medium px-8 py-3 rounded-lg transition-colors"
            >
              {t('backToStore')}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
