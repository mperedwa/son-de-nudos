import { Link } from 'react-router-dom'
import { useCartStore } from '@/store/cart'
import { useUIStore } from '@/store/ui'
import { useLanguageStore } from '@/store/language'
import { useTranslation } from 'react-i18next'

/**
 * Header principal del sitio
 * Incluye: Logo, navegación, selector de idioma y botón de carrito
 * Fase 8: Integrado con i18n para soporte bilingüe
 */
export default function Header() {
  const { t } = useTranslation(['common', 'navigation'])
  const currentLang = useLanguageStore((state) => state.currentLanguage)
  const setLanguage = useLanguageStore((state) => state.setLanguage)
  const cartItems = useCartStore((state) => state.items)
  const openCartDrawer = useUIStore((state) => state.openCartDrawer)

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <header className="bg-white shadow-soft sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo y Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 flex items-center justify-center">
              <svg
                viewBox="0 0 50 50"
                className="w-full h-full"
                aria-hidden="true"
              >
                <path
                  d="M25 5 Q20 15 20 25 T25 45 Q30 35 30 25 T25 5"
                  stroke="#8B6F47"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="20" cy="30" r="3" fill="#8B6F47" />
                <circle cx="30" cy="20" r="3" fill="#8B6F47" />
              </svg>
            </div>
            <div>
              <div className="font-serif text-2xl text-primary-brown group-hover:text-accent-gold transition-colors">
                Son de Nudos
              </div>
              <div className="text-xs text-text-light italic">by Priscilla</div>
            </div>
          </Link>

          {/* Navegación y acciones */}
          <div className="flex items-center gap-6">
            {/* Navegación principal */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className="text-text-dark hover:text-primary-brown font-medium transition-colors"
              >
                {t('common:shop')}
              </Link>
              <a
                href="#about"
                className="text-text-dark hover:text-primary-brown font-medium transition-colors"
              >
                {t('common:aboutMe')}
              </a>
            </nav>

            {/* Selector de idioma */}
            <div className="hidden sm:flex bg-secondary-beige rounded-full overflow-hidden">
              <button
                onClick={() => setLanguage('es')}
                className={`px-3 py-1 text-sm font-medium transition-colors ${
                  currentLang === 'es'
                    ? 'bg-primary-brown text-white'
                    : 'text-text-dark hover:bg-accent-gold hover:text-white'
                }`}
                aria-label={t('navigation:switchToSpanish')}
              >
                ES
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-sm font-medium transition-colors ${
                  currentLang === 'en'
                    ? 'bg-primary-brown text-white'
                    : 'text-text-dark hover:bg-accent-gold hover:text-white'
                }`}
                aria-label={t('navigation:switchToEnglish')}
              >
                EN
              </button>
            </div>

            {/* Botón de carrito */}
            <button
              onClick={openCartDrawer}
              className="relative bg-accent-gold hover:bg-primary-brown text-white px-4 py-2 rounded-full transition-all hover:shadow-soft-hover"
              aria-label={t('navigation:cartWithCount', { count: totalItems })}
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="hidden sm:inline">{t('navigation:cart')}</span>
              </span>

              {/* Contador de items */}
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-brown text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
