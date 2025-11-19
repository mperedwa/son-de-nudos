/**
 * FeaturedPieceSection Component
 *
 * Pieza destacada del mes con fondo oscuro para contraste
 * Diseño inspirado en Gemini
 */

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function FeaturedPieceSection() {
  const { t } = useTranslation('landing')

  return (
    <section className="bg-brand-dark text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
        {/* Imagen */}
        <div className="w-full md:w-1/2 mb-10 md:mb-0">
          <img
            src="https://images.unsplash.com/photo-1628149455676-71221c6928d7?q=80&w=1936&auto=format&fit=crop"
            alt={t('featured.title')}
            className="w-full md:w-4/5 shadow-2xl border border-white/10"
          />
        </div>

        {/* Contenido */}
        <div className="w-full md:w-1/2 md:pl-10">
          <span className="text-brand-terra text-sm uppercase tracking-widest font-bold mb-2 block">
            {t('featured.tagline')}
          </span>
          <h2 className="font-serif text-4xl mb-6">
            {t('featured.title')}
          </h2>
          <p className="text-gray-300 font-light mb-8 leading-relaxed">
            {t('featured.description')}
          </p>
          <Link
            to="/tienda"
            className="inline-block border border-white px-8 py-3 hover:bg-white hover:text-brand-dark
                       transition duration-300 uppercase tracking-widest text-sm"
          >
            {t('featured.cta')}
          </Link>
        </div>
      </div>
    </section>
  )
}
