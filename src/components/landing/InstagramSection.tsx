/**
 * InstagramSection Component
 *
 * Social Proof con imágenes reales de Unsplash
 * Diseño fusionado: Gemini (imágenes, grid compacto) + Original (i18n)
 */

import { useTranslation } from 'react-i18next'

// Imágenes de Unsplash - Reemplazar con imágenes reales del feed
const instagramPosts = [
  { id: 1, image: 'https://images.unsplash.com/photo-1605218427360-363933f30480?w=500&auto=format&fit=crop&q=60' },
  { id: 2, image: 'https://images.unsplash.com/photo-1520013573795-38516d2661e4?w=500&auto=format&fit=crop&q=60' },
  { id: 3, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60' },
  { id: 4, image: 'https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?w=500&auto=format&fit=crop&q=60' },
  { id: 5, image: 'https://images.unsplash.com/photo-1550614000-4b9519e00730?w=500&auto=format&fit=crop&q=60' },
  { id: 6, image: 'https://images.unsplash.com/photo-1533561096933-73200d02636d?w=500&auto=format&fit=crop&q=60' },
]

export default function InstagramSection() {
  const { t } = useTranslation('landing')

  return (
    <section className="py-20 bg-white">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">
          {t('instagram.tagline')}
        </p>
        <h2 className="font-serif text-3xl text-brand-dark flex items-center justify-center gap-2">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          {t('instagram.handle')}
        </h2>
      </div>

      {/* Grid de Instagram */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
        {instagramPosts.map((post) => (
          <a
            key={post.id}
            href="https://www.instagram.com/son_de_nudos/"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src={post.image}
              alt="Instagram post"
              className="w-full h-48 object-cover hover:opacity-80 transition cursor-pointer"
            />
          </a>
        ))}
      </div>
    </section>
  )
}
