/**
 * MultiImageUploader Component
 *
 * Componente para gestionar múltiples imágenes con reordenamiento y límite máximo
 */

import { useState } from 'react'
import { uploadImage, deleteImage, validateImageFile, type StorageFolder } from '@/lib/storage'

// ============================================================================
// TYPES
// ============================================================================

interface MultiImageUploaderProps {
  images: string[]
  onImagesChange: (urls: string[]) => void
  folder: StorageFolder
  subfolder: string
  maxImages?: number
  disabled?: boolean
}

interface UploadProgress {
  total: number
  completed: number
  uploading: boolean
}

// ============================================================================
// COMPONENT
// ============================================================================

export function MultiImageUploader({
  images,
  onImagesChange,
  folder,
  subfolder,
  maxImages = 4,
  disabled = false,
}: MultiImageUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    total: 0,
    completed: 0,
    uploading: false,
  })
  const [error, setError] = useState<string | null>(null)

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  /**
   * Maneja agregar nuevas imágenes
   */
  async function handleAddImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Verificar límite
    const remainingSlots = maxImages - images.length
    if (remainingSlots <= 0) {
      setError(`Máximo ${maxImages} imágenes permitidas`)
      return
    }

    const filesToUpload = files.slice(0, remainingSlots)

    // Validar archivos
    for (const file of filesToUpload) {
      const validation = validateImageFile(file)
      if (!validation.valid) {
        setError(validation.error || 'Archivo inválido')
        return
      }
    }

    // Reset error y comenzar upload
    setError(null)
    setUploadProgress({
      total: filesToUpload.length,
      completed: 0,
      uploading: true,
    })

    const newUrls: string[] = []

    try {
      // Upload de forma secuencial
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i]
        const url = await uploadImage(file, folder, subfolder)
        newUrls.push(url)

        setUploadProgress((prev) => ({
          ...prev,
          completed: i + 1,
        }))
      }

      // Actualizar lista de imágenes
      onImagesChange([...images, ...newUrls])
      setUploadProgress({ total: 0, completed: 0, uploading: false })
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Error al subir imágenes')
      setUploadProgress({ total: 0, completed: 0, uploading: false })

      // Cleanup de imágenes parcialmente subidas
      for (const url of newUrls) {
        try {
          await deleteImage(url)
        } catch (cleanupErr) {
          console.warn('Failed to cleanup uploaded image:', cleanupErr)
        }
      }
    }

    // Limpiar input
    e.target.value = ''
  }

  /**
   * Maneja eliminar una imagen
   */
  async function handleRemove(index: number) {
    const imageUrl = images[index]

    if (!confirm('¿Estás seguro de eliminar esta imagen?')) {
      return
    }

    try {
      // Eliminar de Storage
      await deleteImage(imageUrl)

      // Actualizar lista
      const newImages = images.filter((_, i) => i !== index)
      onImagesChange(newImages)
      setError(null)
    } catch (err) {
      console.error('Delete error:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar la imagen')
    }
  }

  /**
   * Mueve una imagen hacia arriba en el orden
   */
  function handleMoveUp(index: number) {
    if (index === 0) return

    const newImages = [...images]
    ;[newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]]
    onImagesChange(newImages)
  }

  /**
   * Mueve una imagen hacia abajo en el orden
   */
  function handleMoveDown(index: number) {
    if (index === images.length - 1) return

    const newImages = [...images]
    ;[newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]]
    onImagesChange(newImages)
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  const canAddMore = images.length < maxImages && !uploadProgress.uploading
  const isDisabled = disabled || uploadProgress.uploading

  return (
    <div className="space-y-4">
      {/* Header con contador */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-[#6B5844]">
          Imágenes del Producto
          <span className="ml-2 text-xs text-[#6B5844]/60">
            ({images.length}/{maxImages})
          </span>
        </label>

        {/* Botón agregar */}
        {canAddMore && (
          <label
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium text-white cursor-pointer
              bg-gradient-to-r from-[#8B6F47] to-[#D4A574]
              hover:from-[#6B5844] hover:to-[#8B6F47]
              transition-all duration-200
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            + Agregar Imagen
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleAddImages}
              disabled={isDisabled}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Progress bar durante upload */}
      {uploadProgress.uploading && (
        <div className="p-4 bg-[#F5E6D3] rounded-lg border border-[#D4A574]/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#8B6F47] border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#8B6F47]">
                Subiendo imágenes... ({uploadProgress.completed}/{uploadProgress.total})
              </p>
              <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#8B6F47] to-[#D4A574] transition-all duration-300"
                  style={{
                    width: `${(uploadProgress.completed / uploadProgress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Grid de imágenes */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {images.map((url, index) => (
            <div
              key={url}
              className="relative group bg-white rounded-lg border-2 border-[#D4A574]/30 overflow-hidden"
            >
              {/* Badge de imagen principal */}
              {index === 0 && (
                <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-gradient-to-r from-[#8B6F47] to-[#D4A574] text-white text-xs font-medium rounded-full shadow-md">
                  Principal
                </div>
              )}

              {/* Imagen */}
              <img src={url} alt={`Imagen ${index + 1}`} className="w-full h-40 object-cover" />

              {/* Overlay con controles */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                {/* Botones de orden */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0 || isDisabled}
                    className="
                      p-2 rounded-lg text-white bg-[#8B6F47]
                      hover:bg-[#6B5844]
                      disabled:opacity-30 disabled:cursor-not-allowed
                      transition-colors
                    "
                    title="Mover arriba"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === images.length - 1 || isDisabled}
                    className="
                      p-2 rounded-lg text-white bg-[#8B6F47]
                      hover:bg-[#6B5844]
                      disabled:opacity-30 disabled:cursor-not-allowed
                      transition-colors
                    "
                    title="Mover abajo"
                  >
                    ▼
                  </button>
                </div>

                {/* Botón eliminar */}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  disabled={isDisabled}
                  className="
                    px-3 py-1.5 rounded-lg text-sm font-medium text-white
                    bg-red-600 hover:bg-red-700
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                  "
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty state
        <div className="p-8 border-2 border-dashed border-[#D4A574]/50 rounded-lg text-center">
          <div className="text-4xl mb-2">🖼️</div>
          <p className="text-sm text-[#6B5844]">
            No hay imágenes. Agrega al menos una imagen del producto.
          </p>
        </div>
      )}

      {/* Ayuda */}
      <p className="text-xs text-[#6B5844]/60">
        La primera imagen será la imagen principal del producto. Usa las flechas para reordenar.
      </p>
    </div>
  )
}
