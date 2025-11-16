import { useState } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Footer del sitio con links, newsletter y redes sociales
 * Fase 8: Integrado con i18n para soporte bilingüe
 */
export default function Footer() {
  const { t } = useTranslation(['common', 'navigation'])
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Integrar con servicio de email marketing en futuro
    setIsSubscribed(true)
    setEmail('')
    setTimeout(() => setIsSubscribed(false), 3000)
  }

  return (
    <footer className="bg-primary-brown text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Columna 1: About */}
          <div>
            <h3 className="font-serif text-xl mb-4">Son de Nudos</h3>
            <p className="text-sm text-white/80 leading-relaxed">
              {t('navigation:aboutDescription')}
            </p>
          </div>

          {/* Columna 2: Enlaces */}
          <div>
            <h4 className="font-semibold mb-4">{t('navigation:links')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="hover:text-accent-gold transition-colors">
                  {t('common:shop')}
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-accent-gold transition-colors">
                  {t('common:aboutMe')}
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-accent-gold transition-colors">
                  {t('common:contact')}
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-accent-gold transition-colors">
                  {t('common:faq')}
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Legal */}
          <div>
            <h4 className="font-semibold mb-4">{t('navigation:legal')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#privacy" className="hover:text-accent-gold transition-colors">
                  {t('common:privacyPolicy')}
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-accent-gold transition-colors">
                  {t('common:termsAndConditions')}
                </a>
              </li>
              <li>
                <a href="#shipping" className="hover:text-accent-gold transition-colors">
                  {t('common:shippingAndReturns')}
                </a>
              </li>
              <li>
                <a href="#care" className="hover:text-accent-gold transition-colors">
                  {t('common:productCare')}
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 4: Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">{t('navigation:newsletter')}</h4>
            <p className="text-sm text-white/80 mb-4">
              {t('navigation:newsletterDescription')}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('navigation:emailPlaceholder')}
                required
                className="w-full px-3 py-2 rounded-md text-text-dark focus:outline-none focus:ring-2 focus:ring-accent-gold"
                aria-label={t('navigation:newsletterPlaceholder')}
              />
              <button
                type="submit"
                className="w-full bg-accent-gold hover:bg-white hover:text-primary-brown text-white font-medium px-4 py-2 rounded-md transition-colors"
              >
                {t('navigation:newsletterButton')}
              </button>
              {isSubscribed && (
                <p className="text-sm text-accent-gold animate-fade-in">
                  {t('navigation:newsletterSuccess')}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Redes sociales y copyright */}
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/80">
            {t('navigation:copyright')}
          </p>

          {/* Redes sociales */}
          <div className="flex gap-4">
            <a
              href="https://instagram.com/sondenudos"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-accent-gold hover:bg-white hover:text-primary-brown rounded-full flex items-center justify-center transition-all hover:scale-110"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://facebook.com/sondenudos"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-accent-gold hover:bg-white hover:text-primary-brown rounded-full flex items-center justify-center transition-all hover:scale-110"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a
              href="https://www.etsy.com/shop/SondeNudos"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-accent-gold hover:bg-white hover:text-primary-brown rounded-full flex items-center justify-center transition-all hover:scale-110"
              aria-label="Etsy"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
            </a>
            <a
              href="mailto:hello@sondenudos.com"
              className="w-10 h-10 bg-accent-gold hover:bg-white hover:text-primary-brown rounded-full flex items-center justify-center transition-all hover:scale-110"
              aria-label="Email"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
