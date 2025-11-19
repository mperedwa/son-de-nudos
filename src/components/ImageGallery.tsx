import { useState } from 'react'

/**
 * Galería de imágenes de producto con miniaturas
 * - Imagen principal grande
 * - Lista de miniaturas debajo
 * - Click en miniatura actualiza imagen principal
 * - Soporte para zoom (opcional)
 */

type ImageGalleryProps = {
  images: string[]
  productTitle: string
}

export default function ImageGallery({ images, productTitle }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-stone-200 rounded-2xl flex items-center justify-center">
        <p className="text-gray-500">Sin imagen disponible</p>
      </div>
    )
  }

  const currentImage = images[currentIndex] || images[0]

  return (
    <div className="space-y-4">
      {/* Imagen principal */}
      <div className="relative aspect-square bg-stone-200 rounded-2xl overflow-hidden group">
        <img
          src={currentImage}
          alt={`${productTitle} - Imagen ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Indicador de zoom (hover) */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <svg
            className="w-8 h-8 text-white drop-shadow-lg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
            />
          </svg>
        </div>
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              onClick={() => setCurrentIndex(index)}
              className={`
                aspect-square rounded-lg overflow-hidden border-2 transition-all
                ${
                  index === currentIndex
                    ? 'border-brand-terra shadow-md'
                    : 'border-stone-200 hover:border-brand-gold'
                }
              `}
              aria-label={`Ver imagen ${index + 1}`}
            >
              <img
                src={image}
                alt={`${productTitle} - Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
