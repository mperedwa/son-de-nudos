import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSocialLinks } from '@/hooks/useStoreSettings'

/**
 * Footer del sitio - Estilo Gemini
 * Fondo claro, texto oscuro, títulos terracota
 * Newsletter integrado con MailerLite
 * Redes sociales cargadas desde Supabase (store_settings)
 */
export default function Footer() {
  const { t } = useTranslation('navigation')
  const { socialLinks } = useSocialLinks()

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
            {/* MailerLite Embedded Form */}
            <div className="ml-embedded" data-form="76EGwp"></div>
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

          {/* Redes sociales - Cargadas desde store_settings */}
          <div className="flex gap-6">
            {socialLinks.facebook && (
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-terra transition-colors"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook-f text-lg"></i>
              </a>
            )}
            {socialLinks.instagram && (
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-terra transition-colors"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram text-lg"></i>
              </a>
            )}
            {socialLinks.pinterest && (
              <a
                href={socialLinks.pinterest}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-terra transition-colors"
                aria-label="Pinterest"
              >
                <i className="fab fa-pinterest-p text-lg"></i>
              </a>
            )}
            {socialLinks.tiktok && (
              <a
                href={socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-terra transition-colors"
                aria-label="TikTok"
              >
                <i className="fab fa-tiktok text-lg"></i>
              </a>
            )}
            {socialLinks.whatsapp && (
              <a
                href={socialLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-terra transition-colors"
                aria-label="WhatsApp"
              >
                <i className="fab fa-whatsapp text-lg"></i>
              </a>
            )}
            {socialLinks.email && (
              <a
                href={`mailto:${socialLinks.email}`}
                className="text-gray-400 hover:text-brand-terra transition-colors"
                aria-label="Email"
              >
                <i className="fas fa-envelope text-lg"></i>
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
