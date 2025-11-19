/**
 * CategoriesSection Component
 *
 * Grid elegante de categorías principales con imágenes reales
 * Diseño fusionado: Gemini (imágenes, hover) + Original (i18n)
 */

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface Category {
  id: string
  titleKey: string
  subtitleKey: string
  image: string
  href: string
  offset?: boolean // Para efecto visual de altura diferente
}

const categories: Category[] = [
  {
    id: 'bolsos',
    titleKey: 'categories.bags.title',
    subtitleKey: 'categories.bags.subtitle',
    href: '/tienda?category=bolsos',
    image: 'https://images.unsplash.com/photo-1598532163257-52017d714743?q=80&w=1930&auto=format&fit=crop',
  },
  {
    id: 'vestibles',
    titleKey: 'categories.wearables.title',
    subtitleKey: 'categories.wearables.subtitle',
    href: '/tienda?category=vestibles',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop',
    offset: true, // Efecto visual de altura diferente
  },
  {
    id: 'collares',
    titleKey: 'categories.necklaces.title',
    subtitleKey: 'categories.necklaces.subtitle',
    href: '/tienda?category=collares',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070&auto=format&fit=crop',
  },
]

export default function CategoriesSection() {
  const { t } = useTranslation('landing')

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl text-brand-dark mb-4">
            {t('categories.headline')}
          </h2>
          <div className="w-24 h-1 bg-brand-terra mx-auto" />
        </div>

        {/* Grid de categorías */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.href}
              className={`group relative cursor-pointer overflow-hidden ${
                category.offset ? 'mt-0 md:-mt-8' : ''
              }`}
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={category.image}
                  alt={t(category.titleKey)}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />

              {/* Contenido */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <h3 className="text-white font-serif text-3xl mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  {t(category.titleKey)}
                </h3>
                <span className="text-white text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  {t(category.subtitleKey)} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
