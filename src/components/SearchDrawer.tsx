import { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useUIStore } from '@/store/ui'
import { searchProducts } from '@/lib/filters'
import { formatMoney } from '@/lib/money'
import { mockServer } from '@/server/mockServer'
import type { Product } from '@/types/models'

/**
 * Modal de búsqueda de productos
 * - Aparece desde arriba con overlay
 * - Input con autofocus y debounce
 * - Resultados en tiempo real
 * - Cierra con ESC o click fuera
 */
export default function SearchDrawer() {
  const { t } = useTranslation('navigation')
  const isOpen = useUIStore((state) => state.isSearchOpen)
  const closeSearch = useUIStore((state) => state.closeSearch)

  const [query, setQuery] = useState('')
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Cargar productos al abrir
  useEffect(() => {
    if (isOpen && allProducts.length === 0) {
      const loadProducts = async () => {
        setIsLoading(true)
        const response = await mockServer.getCollectionNecklaces()
        if (response.success && response.data) {
          setAllProducts(response.data)
        }
        setIsLoading(false)
      }
      loadProducts()
    }
  }, [isOpen, allProducts.length])

  // Autofocus al abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeSearch()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, closeSearch])

  // Limpiar búsqueda al cerrar
  useEffect(() => {
    if (!isOpen) {
      setQuery('')
    }
  }, [isOpen])

  // Resultados de búsqueda con debounce implícito (useMemo)
  const results = useMemo(() => {
    if (query.length < 2) return []
    return searchProducts(allProducts, query).slice(0, 8) // Limitar a 8 resultados
  }, [allProducts, query])

  const handleResultClick = () => {
    closeSearch()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={closeSearch}
        aria-hidden="true"
      />

      {/* Modal de búsqueda */}
      <div className="fixed inset-x-0 top-0 z-50 bg-white shadow-2xl transform transition-transform duration-300 animate-slide-down">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Header con input y botón cerrar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full px-4 py-3 pl-12 border border-stone-200 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-terra focus:border-transparent"
                aria-label={t('search')}
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <button
              onClick={closeSearch}
              className="p-2 text-gray-500 hover:text-brand-terra transition-colors"
              aria-label={t('closeSearch')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Resultados */}
          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-terra mx-auto"></div>
              </div>
            ) : query.length >= 2 && results.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p>{t('noResults')}</p>
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.handle}`}
                    onClick={handleResultClick}
                    className="flex gap-4 p-3 rounded-lg hover:bg-stone-50 transition-colors group"
                  >
                    <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-stone-100">
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-brand-dark truncate group-hover:text-brand-terra transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-sm text-brand-terra font-medium mt-1">
                        {formatMoney(product.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : query.length > 0 && query.length < 2 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Escribe al menos 2 caracteres para buscar
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}
