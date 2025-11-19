/**
 * HeroSection Component
 *
 * Sección principal de impacto visual con:
 * - Imagen de fondo real con overlay oscuro
 * - Texto blanco centrado
 * - CTA hacia la colección
 *
 * Diseño fusionado: Gemini (visual) + Original (i18n)
 * Mobile-First design
 */

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function HeroSection() {
  const { t } = useTranslation('landing')

  return (
    <header className="relative h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1613539246066-78db6ec4ff0f?q=80&w=1886&auto=format&fit=crop"
          alt="Macrame Detail"
          className="w-full h-full object-cover"
        />
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto animate-fade-in-up">
        {/* Subtítulo decorativo */}
        <p className="text-sm md:text-base tracking-[0.4em] uppercase mb-4 font-light">
          {t('hero.tagline')}
        </p>

        {/* Headline principal */}
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl mb-6 leading-tight">
          {t('hero.headline')} <br/>
          <span className="italic text-brand-sand">
            {t('hero.headlineAccent')}
          </span>
        </h1>

        {/* CTA */}
        <div className="mt-8">
          <Link
            to="/tienda"
            className="inline-block bg-white text-brand-dark px-8 py-4 uppercase tracking-widest text-xs md:text-sm
                       hover:bg-brand-terra hover:text-white transition duration-300 ease-in-out
                       font-medium"
          >
            {t('hero.ctaExplore')}
          </Link>
        </div>
      </div>
    </header>
  )
}
