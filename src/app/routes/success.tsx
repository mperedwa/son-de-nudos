import { useTranslation } from 'react-i18next'

/**
 * Página de pago exitoso (Stripe)
 * Muestra confirmación del pedido
 */
export default function SuccessPage() {
  const { t } = useTranslation('messages')

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#FAF7F3] flex items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        <div className="bg-white rounded-2xl shadow-soft p-12 max-w-2xl mx-auto">
          <div className="text-6xl mb-6">✓</div>
          <h1 className="text-4xl font-serif text-brand-terra mb-4">
            {t('paymentSuccessTitle')}
          </h1>
          <p className="text-gray-500 mb-8">
            {t('paymentSuccessMessage')}
          </p>
          <a
            href="/"
            className="inline-block bg-brand-terra hover:bg-brand-gold text-white font-medium px-8 py-3 rounded-lg transition-colors"
          >
            {t('backToStore')}
          </a>
        </div>
      </div>
    </div>
  )
}
