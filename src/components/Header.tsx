import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '@/store/cart'
import { useUIStore } from '@/store/ui'
import { useLanguageStore } from '@/store/language'
import { useTranslation } from 'react-i18next'
import { useBranding } from '@/hooks/useStoreSettings'

/**
 * Header principal del sitio - Estilo Gemini
 * Incluye: Logo centrado en móvil, navegación, iconos
 */
export default function Header() {
  const { t } = useTranslation(['common', 'navigation'])
  const currentLang = useLanguageStore((state) => state.currentLanguage)
  const setLanguage = useLanguageStore((state) => state.setLanguage)
  const cartItems = useCartStore((state) => state.items)
  const openCartDrawer = useUIStore((state) => state.openCartDrawer)
  const openSearch = useUIStore((state) => state.openSearch)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Logo dinámico desde store_settings (con fallback al default)
  const { branding } = useBranding()
  const logoUrl = branding.logoUrl || '/isotipo.png'

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <nav className="sticky top-0 z-50 bg-brand-sand/95 backdrop-blur-sm border-b border-stone-200 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex justify-between items-center h-20">
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden z-10">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-brand-dark hover:text-brand-terra focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Logo - Centrado absoluto en móvil */}
          <div className="absolute left-1/2 -translate-x-1/2 md:relative md:left-auto md:translate-x-0 flex-shrink-0 flex items-center md:justify-start pointer-events-auto">
            <Link to="/" className="flex items-center gap-0">
              {/* Isotipo - clave de sol (dinámico desde admin) */}
              <img
                src={logoUrl}
                alt={branding.storeName || 'Son de Nudos'}
                className="h-12 md:h-14 w-auto"
              />
              <div className="md:text-left">
                <span className="font-serif text-xl md:text-2xl font-bold tracking-wider text-brand-dark block">
                  SON DE NUDOS
                </span>
                <span className="block text-xs font-serif italic font-semibold tracking-wide text-left text-brand-terra -mt-0.5">
                  by Priscilla
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link
              to="/"
              className="text-sm uppercase tracking-widest hover:text-brand-terra transition-colors text-brand-dark"
            >
              {t('navigation:home')}
            </Link>
            <Link
              to="/tienda?category=bolsos"
              className="text-sm uppercase tracking-widest hover:text-brand-terra transition-colors text-brand-dark"
            >
              {t('navigation:bags')}
            </Link>
            <Link
              to="/tienda?category=vestibles"
              className="text-sm uppercase tracking-widest hover:text-brand-terra transition-colors text-brand-dark"
            >
              {t('navigation:wearables')}
            </Link>
            <Link
              to="/#artista"
              className="text-sm uppercase tracking-widest hover:text-brand-terra transition-colors text-brand-dark"
              onClick={(e) => {
                if (window.location.pathname === '/') {
                  e.preventDefault()
                  document.getElementById('artista')?.scrollIntoView({ behavior: 'smooth' })
                }
              }}
            >
              {t('navigation:theArtist')}
            </Link>
          </div>

          {/* Icons */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Selector de idioma */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLanguage('es')}
                className={`text-sm ${
                  currentLang === 'es'
                    ? 'text-brand-terra font-bold'
                    : 'text-brand-dark hover:text-brand-terra'
                }`}
              >
                ES
              </button>
              <span className="text-brand-dark/30">|</span>
              <button
                onClick={() => setLanguage('en')}
                className={`text-sm ${
                  currentLang === 'en'
                    ? 'text-brand-terra font-bold'
                    : 'text-brand-dark hover:text-brand-terra'
                }`}
              >
                EN
              </button>
            </div>

            {/* Search */}
            <button
              onClick={openSearch}
              className="text-brand-dark hover:text-brand-terra"
              aria-label={t('navigation:search')}
            >
              <i className="fas fa-search"></i>
            </button>

            {/* Cart */}
            <button
              onClick={openCartDrawer}
              className="text-brand-dark hover:text-brand-terra relative"
            >
              <i className="fas fa-shopping-bag"></i>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-terra text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Cart Icon */}
          <div className="md:hidden z-10">
            <button
              onClick={openCartDrawer}
              className="text-brand-dark hover:text-brand-terra relative"
            >
              <i className="fas fa-shopping-bag"></i>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-terra text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 absolute w-full">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-center py-6">
            <Link
              to="/"
              className="block px-3 py-2 text-base font-medium hover:text-brand-terra uppercase"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('navigation:home')}
            </Link>
            <Link
              to="/tienda?category=bolsos"
              className="block px-3 py-2 text-base font-medium hover:text-brand-terra uppercase"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('navigation:bags')}
            </Link>
            <Link
              to="/tienda?category=vestibles"
              className="block px-3 py-2 text-base font-medium hover:text-brand-terra uppercase"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('navigation:wearables')}
            </Link>
            <Link
              to="/#artista"
              className="block px-3 py-2 text-base font-medium hover:text-brand-terra uppercase"
              onClick={(e) => {
                setMobileMenuOpen(false)
                if (window.location.pathname === '/') {
                  e.preventDefault()
                  document.getElementById('artista')?.scrollIntoView({ behavior: 'smooth' })
                }
              }}
            >
              {t('navigation:theArtist')}
            </Link>
            {/* Search mobile */}
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                openSearch()
              }}
              className="flex items-center gap-2 px-3 py-2 text-base font-medium hover:text-brand-terra"
            >
              <i className="fas fa-search"></i>
              {t('navigation:search')}
            </button>
            {/* Language selector mobile */}
            <div className="flex items-center space-x-4 pt-4 border-t border-stone-100 mt-4">
              <button
                onClick={() => {
                  setLanguage('es')
                  setMobileMenuOpen(false)
                }}
                className={`text-sm ${
                  currentLang === 'es'
                    ? 'text-brand-terra font-bold'
                    : 'text-brand-dark'
                }`}
              >
                Español
              </button>
              <button
                onClick={() => {
                  setLanguage('en')
                  setMobileMenuOpen(false)
                }}
                className={`text-sm ${
                  currentLang === 'en'
                    ? 'text-brand-terra font-bold'
                    : 'text-brand-dark'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
