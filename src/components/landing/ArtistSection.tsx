/**
 * ArtistSection Component
 *
 * El corazón de la marca - Storytelling sobre Priscilla Torres
 * Diseño fusionado: Gemini (layout con cita flotante) + Original (i18n)
 *
 * - Foto de Priscilla con cuadro decorativo
 * - Cita flotante sobre la imagen
 * - Narrativa elegante con firma
 */

import { useTranslation } from 'react-i18next'

export default function ArtistSection() {
  const { t } = useTranslation('landing')

  return (
    <section id="artista" className="py-20 md:py-32 bg-brand-sand relative overflow-hidden">
      {/* Elemento decorativo de fondo */}
      <div className="absolute top-0 right-0 text-[20rem] text-brand-terra opacity-5 font-serif leading-none select-none pointer-events-none -mr-20 -mt-20 hidden lg:block">
        &amp;
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* Imagen de la Artista */}
          <div className="w-full lg:w-1/2 relative">
            <div className="relative z-10">
              {/* Placeholder para foto de Priscilla */}
              <img
                src="https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?q=80&w=1887&auto=format&fit=crop"
                alt="Priscilla Torres Artista"
                className="w-full h-[500px] md:h-[600px] object-cover shadow-xl"
              />
            </div>

            {/* Cuadro decorativo detrás */}
            <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-brand-terra z-0 hidden md:block" />

            {/* Cita flotante */}
            <div className="absolute bottom-10 -left-4 md:-left-10 bg-white p-6 shadow-lg max-w-xs z-20 hidden md:block">
              <p className="font-serif italic text-brand-dark text-lg">
                "{t('artist.quote')}"
              </p>
            </div>
          </div>

          {/* Texto Narrativo */}
          <div className="w-full lg:w-1/2 lg:pl-12">
            {/* Etiqueta */}
            <span className="text-brand-terra uppercase tracking-[0.2em] text-sm font-bold mb-4 block">
              {t('artist.tagline')}
            </span>

            {/* Título */}
            <h2 className="font-serif text-4xl md:text-5xl text-brand-dark mb-4 leading-tight">
              {t('artist.headline')} <br/>
              <span className="italic text-brand-terra">
                {t('artist.headlineAccent')}
              </span>
            </h2>

            {/* Subtítulo */}
            <p className="text-lg text-gray-600 mb-8">
              {t('artist.subtitle')}
            </p>

            {/* Historia */}
            <div className="prose text-gray-600 font-light leading-relaxed space-y-6 text-lg">
              <p>
                {t('artist.intro', { name: 'Priscilla Torres' })}
              </p>

              <p>
                {t('artist.story')}
              </p>

              <p>
                {t('artist.philosophy')}
              </p>
            </div>

            {/* Firma */}
            <div className="mt-10">
              <span className="font-serif italic text-3xl text-brand-terra">
                Priscilla
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
