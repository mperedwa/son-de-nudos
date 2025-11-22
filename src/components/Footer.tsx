import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/**
 * Footer del sitio - Estilo Gemini
 * Fondo claro, texto oscuro, títulos terracota
 */
export default function Footer() {
  const { t } = useTranslation('navigation')
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubscribed(true)
    setEmail('')
    setTimeout(() => setIsSubscribed(false), 3000)
  }

  return (
    <footer className="bg-[#F5F0EB] border-t border-stone-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Columna 1: Son de Nudos */}
          <div>
            <h3 className="font-serif text-2xl font-bold text-brand-dark mb-4">
              SON DE NUDOS
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t('aboutDescription')}
            </p>
          </div>

          {/* Columna 2: Explorar */}
          <div>
            <h4 className="text-brand-terra uppercase tracking-[0.3em] text-xs font-semibold mb-6">
              {t('explore')}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="text-gray-600 hover:text-brand-terra transition-colors">
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link to="/tienda?category=bolsos" className="text-gray-600 hover:text-brand-terra transition-colors">
                  {t('bagsCollection')}
                </Link>
              </li>
              <li>
                <Link to="/tienda?category=vestibles" className="text-gray-600 hover:text-brand-terra transition-colors">
                  {t('wearablesCollection')}
                </Link>
              </li>
              <li>
                <Link to="/#artista" className="text-gray-600 hover:text-brand-terra transition-colors">
                  {t('theArtist')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Atención */}
          <div>
            <h4 className="text-brand-terra uppercase tracking-[0.3em] text-xs font-semibold mb-6">
              {t('attention')}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#shipping" className="text-gray-600 hover:text-brand-terra transition-colors">
                  {t('shippingReturns')}
                </a>
              </li>
              <li>
                <a href="#care" className="text-gray-600 hover:text-brand-terra transition-colors">
                  {t('macrameCare')}
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-600 hover:text-brand-terra transition-colors">
                  {t('contact')}
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 4: Novedades */}
          <div>
            <h4 className="text-brand-terra uppercase tracking-[0.3em] text-xs font-semibold mb-6">
              {t('news')}
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              {t('newsletterDescription')}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('newsletterPlaceholder')}
                required
                className="w-full px-4 py-3 border border-stone-300 rounded-none text-sm text-brand-dark placeholder-gray-400 focus:outline-none focus:border-brand-terra"
                aria-label={t('newsletterPlaceholder')}
              />
              <button
                type="submit"
                className="w-full bg-brand-dark hover:bg-brand-terra text-white font-bold text-sm uppercase tracking-wider px-4 py-3 transition-colors"
              >
                {t('newsletterButton')}
              </button>
              {isSubscribed && (
                <p className="text-sm text-brand-terra animate-fade-in">
                  {t('newsletterSuccess')}
                </p>
              )}
            </form>
            <p className="mt-3 text-xs text-gray-500">
              {t('privacy')}
            </p>
          </div>
        </div>

        {/* Línea divisora y copyright */}
        <div className="border-t border-stone-300 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            {t('copyright')}
          </p>

          {/* Redes sociales - Iconos simples */}
          <div className="flex gap-6">
            <a
              href="https://www.facebook.com/share/1CwiWSxH5L/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-brand-terra transition-colors"
              aria-label="Facebook"
            >
              <i className="fab fa-facebook-f text-lg"></i>
            </a>
            <a
              href="https://www.instagram.com/son_de_nudos/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-brand-terra transition-colors"
              aria-label="Instagram"
            >
              <i className="fab fa-instagram text-lg"></i>
            </a>
            <a
              href="https://pinterest.com/sondenudos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-brand-terra transition-colors"
              aria-label="Pinterest"
            >
              <i className="fab fa-pinterest-p text-lg"></i>
            </a>
            <a
              href="mailto:hello@sondenudos.com"
              className="text-gray-400 hover:text-brand-terra transition-colors"
              aria-label="Email"
            >
              <i className="fas fa-envelope text-lg"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
