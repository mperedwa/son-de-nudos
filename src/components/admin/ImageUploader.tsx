/**
 * ImageUploader Component
 *
 * Componente reutilizable para subir una sola imagen con preview, drag & drop y validación
 */

import { useState, useRef } from 'react'
import { uploadImage, deleteImage, validateImageFile, type StorageFolder } from '@/lib/storage'

// ============================================================================
// TYPES
// ============================================================================

interface ImageUploaderProps {
  currentImageUrl?: string | null
  onImageChange: (url: string | null) => void
  folder: StorageFolder
  subfolder: string
  label: string
  disabled?: boolean
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error'

// ============================================================================
// COMPONENT
// ============================================================================

export function ImageUploader({
  currentImageUrl,
  onImageChange,
  folder,
  subfolder,
  label,
  disabled = false,
}: ImageUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  /**
   * Maneja la selección de archivo desde el input
   */
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    await handleFileUpload(file)

    // Limpiar input para permitir re-selección del mismo archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  /**
   * Maneja el upload del archivo
   */
  async function handleFileUpload(file: File) {
    // 1. Validar archivo
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Archivo inválido')
      setUploadState('error')
      return
    }

    // 2. Reset estados
    setUploadState('uploading')
    setErrorMessage(null)

    try {
      // 3. Upload a Storage
      const url = await uploadImage(file, folder, subfolder)

      // 4. Eliminar imagen anterior si existe
      if (currentImageUrl) {
        try {
          await deleteImage(currentImageUrl)
        } catch (err) {
          console.warn('Failed to delete old image:', err)
          // No bloqueamos el upload si falla el delete
        }
      }

      // 5. Notificar cambio
      onImageChange(url)
      setUploadState('success')
    } catch (error) {
      console.error('Upload error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Error al subir la imagen')
      setUploadState('error')
    }
  }

  /**
   * Maneja eliminar la imagen actual
   */
  async function handleRemove() {
    if (!currentImageUrl) return

    if (!confirm('¿Estás seguro de eliminar esta imagen?')) {
      return
    }

    try {
      await deleteImage(currentImageUrl)
      onImageChange(null)
      setUploadState('idle')
      setErrorMessage(null)
    } catch (error) {
      console.error('Delete error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Error al eliminar la imagen')
      setUploadState('error')
    }
  }

  /**
   * Maneja click en el área de drop
   */
  function handleClick() {
    if (disabled || uploadState === 'uploading') return
    fileInputRef.current?.click()
  }

  // ==========================================================================
  // DRAG & DROP HANDLERS
  // ==========================================================================

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && uploadState !== 'uploading') {
      setIsDragging(true)
    }
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled || uploadState === 'uploading') return

    const file = e.dataTransfer.files[0]
    if (file) {
      await handleFileUpload(file)
    }
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  const hasImage = !!currentImageUrl
  const isUploading = uploadState === 'uploading'
  const isDisabled = disabled || isUploading

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-medium text-[#6B5844]">{label}</label>

      {/* Preview o Drop Zone */}
      {hasImage ? (
        // Preview de imagen actual
        <div className="relative group">
          <img
            src={currentImageUrl}
            alt={label}
            className="w-full h-48 object-cover rounded-lg border-2 border-[#D4A574]/30"
          />

          {/* Overlay con botones */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleClick}
              disabled={isDisabled}
              className="
                px-3 py-1.5 rounded-lg text-sm font-medium text-white
                bg-[#8B6F47] hover:bg-[#6B5844]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
              "
            >
              Cambiar
            </button>
            <button
              type="button"
              onClick={handleRemove}
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
      ) : (
        // Drop Zone
        <div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative w-full h-48 rounded-lg border-2 border-dashed
            flex flex-col items-center justify-center gap-2
            cursor-pointer transition-all
            ${
              isDragging
                ? 'border-[#8B6F47] bg-[#F5E6D3]'
                : 'border-[#D4A574]/50 hover:border-[#D4A574] hover:bg-[#F5E6D3]/30'
            }
            ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isUploading ? (
            // Loading state
            <>
              <div className="w-12 h-12 border-4 border-[#8B6F47] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-[#6B5844] font-medium">Subiendo imagen...</p>
            </>
          ) : (
            // Empty state
            <>
              <div className="text-4xl">📷</div>
              <p className="text-sm font-medium text-[#8B6F47]">
                {isDragging ? 'Suelta la imagen aquí' : 'Arrastra una imagen o haz click'}
              </p>
              <p className="text-xs text-[#6B5844]/60">PNG, JPG o WebP (máx. 5MB)</p>
            </>
          )}
        </div>
      )}

      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={isDisabled}
        className="hidden"
      />

      {/* Error message */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      {/* Success message */}
      {uploadState === 'success' && hasImage && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 flex items-center gap-2">
            <span>✓</span>
            Imagen subida exitosamente
          </p>
        </div>
      )}
    </div>
  )
}
