/**
 * CategoriesSection Component
 *
 * Grid elegante de categorías principales:
 * - Bolsos
 * - Collares
 * - Vestibles
 *
 * Efectos hover sutiles que dan sensación de suavidad
 */

import { Link } from 'react-router-dom'

interface Category {
  id: string
  title: string
  subtitle: string
  image?: string
  href: string
  bgGradient: string
}

const categories: Category[] = [
  {
    id: 'bolsos',
    title: 'Bolsos',
    subtitle: 'Elegancia que llevas contigo',
    href: '/tienda?category=bolsos',
    bgGradient: 'from-terracotta-light/60 to-sand',
  },
  {
    id: 'collares',
    title: 'Collares',
    subtitle: 'Armonía en cada detalle',
    href: '/tienda?category=collares',
    bgGradient: 'from-olive-light/60 to-sand',
  },
  {
    id: 'vestibles',
    title: 'Vestibles',
    subtitle: 'Arte que se adapta a ti',
    href: '/tienda?category=vestibles',
    bgGradient: 'from-accent-gold/40 to-sand',
  },
]

export default function CategoriesSection() {
  return (
    <section className="py-20 lg:py-32 bg-sand-light">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm tracking-[0.2em] uppercase text-accent-gold mb-4 font-sans">
            Colecciones
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-primary-brown mb-6">
            Encuentra tu pieza perfecta
          </h2>
          <p className="text-text-light font-sans leading-relaxed">
            Cada categoría representa una forma única de expresar el arte del macramé.
            Descubre cuál resuena contigo.
          </p>
        </div>

        {/* Grid de categorías */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.href}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-soft
                         hover:shadow-soft-hover transition-all duration-500 transform hover:-translate-y-1"
            >
              {/* Background */}
              <div className={`absolute inset-0 bg-gradient-to-b ${category.bgGradient}`}>
                {/* Placeholder para imagen */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-white/30 flex items-center justify-center
                                  group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-10 h-10 text-primary-brown/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Overlay gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-brown/80 via-primary-brown/20 to-transparent
                              opacity-60 group-hover:opacity-70 transition-opacity duration-500" />

              {/* Contenido */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                <h3 className="text-2xl lg:text-3xl font-serif text-white mb-2
                               transform group-hover:translate-y-0 translate-y-2 transition-transform duration-500">
                  {category.title}
                </h3>
                <p className="text-white/80 text-sm font-sans
                              transform group-hover:translate-y-0 translate-y-4 opacity-0 group-hover:opacity-100
                              transition-all duration-500 delay-100">
                  {category.subtitle}
                </p>

                {/* Flecha */}
                <div className="mt-4 flex items-center gap-2 text-white/80 text-sm
                                transform group-hover:translate-x-2 transition-transform duration-500">
                  <span>Explorar</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
