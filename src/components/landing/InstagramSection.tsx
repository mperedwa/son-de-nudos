/**
 * InstagramSection Component
 *
 * Feed real de Instagram via Behold API
 * Muestra los 6 posts más recientes de @son_de_nudos
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// Behold Feed ID
const BEHOLD_FEED_ID = 'OByNGg5f8nyz10DFlZ4a'
const BEHOLD_API_URL = `https://feeds.behold.so/${BEHOLD_FEED_ID}`

interface BeholdPost {
  id: string
  permalink: string
  mediaType: 'IMAGE' | 'VIDEO'
  thumbnailUrl?: string
  sizes: {
    medium: {
      mediaUrl: string
    }
  }
  prunedCaption?: string
}

interface BeholdFeed {
  posts: BeholdPost[]
}

// Fallback images (Unsplash) en caso de error
const fallbackPosts = [
  { id: '1', image: 'https://images.unsplash.com/photo-1605218427360-363933f30480?w=500&auto=format&fit=crop&q=60', permalink: 'https://www.instagram.com/son_de_nudos/' },
  { id: '2', image: 'https://images.unsplash.com/photo-1520013573795-38516d2661e4?w=500&auto=format&fit=crop&q=60', permalink: 'https://www.instagram.com/son_de_nudos/' },
  { id: '3', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60', permalink: 'https://www.instagram.com/son_de_nudos/' },
  { id: '4', image: 'https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?w=500&auto=format&fit=crop&q=60', permalink: 'https://www.instagram.com/son_de_nudos/' },
  { id: '5', image: 'https://images.unsplash.com/photo-1550614000-4b9519e00730?w=500&auto=format&fit=crop&q=60', permalink: 'https://www.instagram.com/son_de_nudos/' },
  { id: '6', image: 'https://images.unsplash.com/photo-1533561096933-73200d02636d?w=500&auto=format&fit=crop&q=60', permalink: 'https://www.instagram.com/son_de_nudos/' },
]

export default function InstagramSection() {
  const { t } = useTranslation('landing')
  const [posts, setPosts] = useState<{ id: string; image: string; permalink: string; caption?: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInstagramFeed = async () => {
      try {
        const response = await fetch(BEHOLD_API_URL)
        if (!response.ok) throw new Error('Failed to fetch')

        const data: BeholdFeed = await response.json()

        // Transformar posts de Behold al formato que necesitamos
        const transformedPosts = data.posts.slice(0, 6).map((post) => ({
          id: post.id,
          image: post.sizes.medium.mediaUrl,
          permalink: post.permalink,
          caption: post.prunedCaption,
        }))

        setPosts(transformedPosts)
      } catch (error) {
        console.error('Error fetching Instagram feed:', error)
        // Usar fallback en caso de error
        setPosts(fallbackPosts)
      } finally {
        setLoading(false)
      }
    }

    fetchInstagramFeed()
  }, [])

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
        {loading ? (
          // Skeleton loading
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-48 bg-gray-200 animate-pulse"
            />
          ))
        ) : (
          posts.map((post) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="block relative group"
            >
              <img
                src={post.image}
                alt={post.caption || 'Instagram post'}
                className="w-full h-48 object-cover group-hover:opacity-80 transition cursor-pointer"
                loading="lazy"
              />
              {/* Overlay con icono en hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                </svg>
              </div>
            </a>
          ))
        )}
      </div>
    </section>
  )
}
