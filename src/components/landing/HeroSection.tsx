/**
 * HeroSection Component
 *
 * Sección principal de impacto visual con:
 * - Imagen de fondo o split-screen
 * - Headline impactante sobre música → macramé
 * - CTA hacia la colección
 *
 * Mobile-First design
 */

import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background con overlay */}
      <div className="absolute inset-0 z-0">
        {/* Placeholder - Reemplazar con imagen real de producto lifestyle */}
        <div className="absolute inset-0 bg-gradient-to-br from-sand-light via-secondary-beige to-sand-dark" />

        {/* Patrón decorativo sutil */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B6F47' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Contenido */}
      <div className="relative z-10 container mx-auto px-6 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Subtítulo decorativo */}
          <p className="text-sm md:text-base tracking-[0.3em] uppercase text-primary-brown/70 mb-6 font-sans">
            Macramé de Alta Gama
          </p>

          {/* Headline principal */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-primary-brown leading-tight mb-8">
            Donde el ritmo
            <span className="block mt-2 text-accent-gold">
              se convierte en hilo
            </span>
          </h1>

          {/* Subtítulo descriptivo */}
          <p className="text-lg md:text-xl text-text-light max-w-2xl mx-auto mb-12 font-sans leading-relaxed">
            Cada pieza es una composición única, tejida con la precisión de una partitura
            y la pasión de una artista.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/tienda"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-primary-brown text-white font-medium rounded-full
                         hover:bg-primary-brown/90 transition-all duration-300 shadow-soft hover:shadow-soft-hover
                         transform hover:-translate-y-0.5"
            >
              Explorar Colección
              <svg
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            <Link
              to="#artista"
              className="inline-flex items-center gap-2 px-8 py-4 text-primary-brown font-medium
                         hover:text-accent-gold transition-colors duration-300"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('artista')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Conoce a la Artista
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-brown/30 rounded-full flex justify-center">
          <div className="w-1 h-2 bg-primary-brown/50 rounded-full mt-2" />
        </div>
      </div>
    </section>
  )
}
