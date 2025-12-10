/**
 * CategoriesSection Component
 *
 * Grid elegante de colecciones desde Supabase
 * Actualizado para cargar dinámicamente desde la base de datos
 * Fase 11: Integración con sistema de colecciones
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase, type Collection } from '@/lib/supabase'

export default function CategoriesSection() {
  const { t, i18n } = useTranslation('landing')
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar colecciones visibles desde Supabase
  useEffect(() => {
    async function loadCollections() {
      try {
        const { data } = await supabase
          .from('collections')
          .select('*')
          .eq('visible', true)
          .order('sort_order', { ascending: true })
          .limit(3) // Mostrar solo las primeras 3 colecciones
          .returns<Collection[]>()

        if (data) {
          setCollections(data)
        }
      } catch (error) {
        console.error('[CategoriesSection] Error loading collections:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCollections()
  }, [])

  // Si está cargando, mostrar skeleton o null
  if (loading) {
    return null
  }

  // Si no hay colecciones, no mostrar la sección
  if (collections.length === 0) {
    return null
  }

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

        {/* Grid de colecciones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((collection, index) => {
            const collectionName = i18n.language === 'en' ? collection.name_en : collection.name_es
            const collectionDescription = i18n.language === 'en'
              ? (collection.description_en || collection.description_es)
              : (collection.description_es || collection.description_en)

            return (
              <Link
                key={collection.id}
                to={`/colecciones/${collection.handle}`}
                className={`group relative cursor-pointer overflow-hidden ${
                  index === 1 ? 'mt-0 md:-mt-8' : ''
                }`}
              >
                <div className="aspect-[3/4] overflow-hidden">
                  {collection.image_url ? (
                    <img
                      src={collection.image_url}
                      alt={collectionName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-stone-200 flex items-center justify-center">
                      <span className="text-6xl">📚</span>
                    </div>
                  )}
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />

                {/* Contenido */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <h3 className="text-white font-serif text-3xl mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    {collectionName}
                  </h3>
                  <span className="text-white text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {collectionDescription || t('categories.explore')} →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
