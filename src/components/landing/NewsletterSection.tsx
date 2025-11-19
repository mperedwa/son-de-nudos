/**
 * NewsletterSection Component
 *
 * Invitación a unirse a la comunidad
 * Diseño fusionado: Gemini (estilo rectangular) + Original (i18n)
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function NewsletterSection() {
  const { t } = useTranslation('landing')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) return

    setStatus('loading')

    // Simular envío - Integrar con servicio real
    await new Promise(resolve => setTimeout(resolve, 1000))

    setStatus('success')
    setEmail('')

    // Reset después de 3 segundos
    setTimeout(() => setStatus('idle'), 3000)
  }

  return (
    <section className="py-16 bg-brand-sand border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Texto */}
          <div>
            <h3 className="font-serif text-2xl md:text-3xl text-brand-dark mb-4">
              {t('newsletter.headline')}
            </h3>
            <p className="text-gray-600 font-light">
              {t('newsletter.description')}
            </p>
          </div>

          {/* Formulario */}
          <div>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('newsletter.placeholder')}
                className="flex-1 bg-white border border-stone-300 px-4 py-3 text-sm
                           focus:outline-none focus:border-brand-terra
                           disabled:opacity-70"
                required
                disabled={status === 'loading' || status === 'success'}
              />
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="bg-brand-dark text-white text-xs uppercase tracking-widest px-6 py-3
                           hover:bg-brand-terra transition duration-300
                           disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {status === 'loading' && t('newsletter.sending')}
                {status === 'success' && t('newsletter.success')}
                {(status === 'idle' || status === 'error') && t('newsletter.submit')}
              </button>
            </form>

            {/* Mensaje de éxito */}
            {status === 'success' && (
              <p className="mt-3 text-brand-terra text-sm">
                {t('newsletter.successMessage')}
              </p>
            )}

            {/* Garantía */}
            <p className="mt-3 text-gray-500 text-xs">
              {t('newsletter.privacy')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
