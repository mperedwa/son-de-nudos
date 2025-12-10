/**
 * Página de Índice de Colecciones
 *
 * Muestra todas las colecciones visibles en un grid responsivo.
 * Los usuarios pueden hacer clic en una colección para ver sus productos.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase, type Collection } from '@/lib/supabase'

interface CollectionWithCount extends Collection {
  product_count: number
}

export default function CollectionsIndexPage() {
  const { i18n } = useTranslation()
  const [collections, setCollections] = useState<CollectionWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCollections()
  }, [])

  async function loadCollections() {
    try {
      setLoading(true)
      setError(null)

      // 1. Cargar colecciones visibles
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('collections')
        .select('*')
        .eq('visible', true)
        .order('sort_order', { ascending: true })
        .returns<Collection[]>()

      if (collectionsError) throw collectionsError

      // 2. Contar productos por colección
      const collectionsWithCount: CollectionWithCount[] = await Promise.all(
        (collectionsData || []).map(async (collection: Collection) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('collection_id', collection.id)
            .eq('available_for_sale', true)

          return {
            ...collection,
            product_count: count || 0,
          }
        })
      )

      setCollections(collectionsWithCount)
    } catch (err) {
      console.error('Error loading collections:', err)
      setError('Error al cargar colecciones')
    } finally {
      setLoading(false)
    }
  }

  // Estados de carga y error
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6F47]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg max-w-md">
          <h2 className="font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#3C2F2F] mb-4">
          {i18n.language === 'en' ? 'Collections' : 'Colecciones'}
        </h1>
        <p className="text-lg text-[#6B5844] max-w-2xl mx-auto">
          {i18n.language === 'en'
            ? 'Explore our curated collections of handmade macramé jewelry, each with its own unique musical theme.'
            : 'Explora nuestras colecciones temáticas de joyería artesanal en macramé, cada una con su propio tema musical único.'}
        </p>
      </div>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-semibold text-[#3C2F2F] mb-2">
            {i18n.language === 'en' ? 'No Collections Yet' : 'Aún no hay colecciones'}
          </h2>
          <p className="text-[#6B5844]">
            {i18n.language === 'en'
              ? 'Check back soon for new collections!'
              : '¡Vuelve pronto para ver nuevas colecciones!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              to={`/colecciones/${collection.handle}`}
              className="group"
            >
              <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                {/* Imagen */}
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 overflow-hidden">
                  {collection.image_url ? (
                    <img
                      src={collection.image_url}
                      alt={i18n.language === 'en' ? collection.name_en : collection.name_es}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center text-6xl text-[#D4A574]">
                      📚
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-6">
                  <h2 className="text-2xl font-semibold text-[#3C2F2F] mb-2 group-hover:text-[#8B6F47] transition-colors">
                    {i18n.language === 'en' ? collection.name_en : collection.name_es}
                  </h2>

                  {(collection.description_es || collection.description_en) && (
                    <p className="text-[#6B5844] mb-4 line-clamp-2">
                      {i18n.language === 'en'
                        ? collection.description_en || collection.description_es
                        : collection.description_es || collection.description_en}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#8B6F47] font-medium">
                      {collection.product_count}{' '}
                      {i18n.language === 'en'
                        ? collection.product_count === 1
                          ? 'product'
                          : 'products'
                        : collection.product_count === 1
                        ? 'producto'
                        : 'productos'}
                    </span>
                    <span className="text-[#D4A574] group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
