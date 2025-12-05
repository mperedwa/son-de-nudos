/**
 * Supabase Storage Helper Functions
 *
 * Utilidades para gestionar imágenes de productos y variantes en Supabase Storage
 */

import { supabase } from './supabase'

// ============================================================================
// CONSTANTS
// ============================================================================

const BUCKET_PRODUCT_IMAGES = 'product-images'
const BUCKET_BRANDING = 'branding'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB en bytes
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

/**
 * Retorna el nombre del bucket según el tipo de carpeta
 */
function getBucketName(folder: StorageFolder): string {
  return folder === 'branding' ? BUCKET_BRANDING : BUCKET_PRODUCT_IMAGES
}

// ============================================================================
// TYPES
// ============================================================================

export interface ValidationResult {
  valid: boolean
  error?: string
}

export type StorageFolder = 'products' | 'variants' | 'branding'

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Valida que un archivo sea una imagen válida
 * @param file - Archivo a validar
 * @returns Resultado de la validación con mensaje de error si aplica
 */
export function validateImageFile(file: File): ValidationResult {
  // Validar tipo MIME
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido. Solo se permiten: ${ALLOWED_TYPES.join(', ')}`,
    }
  }

  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024)
    return {
      valid: false,
      error: `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`,
    }
  }

  return { valid: true }
}

// ============================================================================
// UPLOAD
// ============================================================================

/**
 * Sube una imagen a Supabase Storage
 * @param file - Archivo a subir
 * @param folder - Carpeta destino ('products' o 'variants')
 * @param subfolder - Subcarpeta (handle del producto o SKU de variante)
 * @returns URL pública de la imagen subida
 * @throws Error si el upload falla
 */
export async function uploadImage(
  file: File,
  folder: StorageFolder,
  subfolder: string
): Promise<string> {
  // 1. Validar archivo
  const validation = validateImageFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // 2. Generar nombre único con UUID
  const fileExt = file.name.split('.').pop()
  const fileName = `${crypto.randomUUID()}.${fileExt}`
  // Para branding, usamos subfolder directamente sin folder prefix
  const filePath = folder === 'branding' ? `${subfolder}/${fileName}` : `${folder}/${subfolder}/${fileName}`
  const bucketName = getBucketName(folder)

  console.log(`📤 Uploading image to: ${bucketName}/${filePath}`)

  // 3. Upload a Storage
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false, // No sobrescribir archivos existentes
    })

  if (error) {
    console.error('❌ Upload error:', error)
    throw new Error(`Error al subir la imagen: ${error.message}`)
  }

  console.log('✅ Upload successful:', data.path)

  // 4. Obtener URL pública
  const publicUrl = getPublicUrl(data.path, bucketName)
  return publicUrl
}

// ============================================================================
// DELETE
// ============================================================================

/**
 * Elimina una imagen de Storage dado su URL pública
 * @param url - URL pública de la imagen (ej: https://xxx.supabase.co/storage/v1/object/public/product-images/products/...)
 * @throws Error si el delete falla
 */
export async function deleteImage(url: string): Promise<void> {
  // 1. Extraer el path y bucket desde la URL
  const extracted = extractPathFromUrl(url)
  if (!extracted) {
    console.warn('⚠️ Invalid URL format, skipping delete:', url)
    return
  }

  const { path, bucket } = extracted
  console.log(`🗑️  Deleting image: ${bucket}/${path}`)

  // 2. Eliminar de Storage
  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    console.error('❌ Delete error:', error)
    throw new Error(`Error al eliminar la imagen: ${error.message}`)
  }

  console.log('✅ Image deleted successfully')
}

/**
 * Elimina todos los archivos dentro de una carpeta
 * @param folderPath - Path de la carpeta (ej: 'products/collar-dorado')
 * @param folder - Tipo de folder para determinar el bucket (default: 'products')
 */
export async function deleteFolder(folderPath: string, folder: StorageFolder = 'products'): Promise<void> {
  const bucketName = getBucketName(folder)
  console.log(`🗑️  Deleting folder: ${bucketName}/${folderPath}`)

  try {
    // 1. Listar todos los archivos en la carpeta
    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list(folderPath)

    if (listError) {
      console.error('❌ Error listing files:', listError)
      throw new Error(`Error al listar archivos: ${listError.message}`)
    }

    if (!files || files.length === 0) {
      console.log('📁 Folder is empty or does not exist')
      return
    }

    // 2. Construir paths completos
    const filePaths = files.map((file) => `${folderPath}/${file.name}`)

    // 3. Eliminar todos los archivos
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove(filePaths)

    if (deleteError) {
      console.error('❌ Error deleting files:', deleteError)
      throw new Error(`Error al eliminar archivos: ${deleteError.message}`)
    }

    console.log(`✅ Deleted ${files.length} files from ${folderPath}`)
  } catch (error) {
    // Fallos silenciosos en cleanup para no bloquear operaciones críticas
    console.error('⚠️ Failed to delete folder, continuing anyway:', error)
  }
}

// ============================================================================
// URL HELPERS
// ============================================================================

/**
 * Obtiene la URL pública de un archivo en Storage
 * @param path - Path del archivo (ej: 'products/collar-dorado/main-uuid.jpg')
 * @param bucketName - Nombre del bucket (default: product-images)
 * @returns URL pública completa
 */
export function getPublicUrl(path: string, bucketName: string = BUCKET_PRODUCT_IMAGES): string {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Extrae el path relativo y el bucket desde una URL pública de Storage
 * @param url - URL pública completa
 * @returns Objeto con path y bucket, o null si el formato es inválido
 *
 * @example
 * extractPathFromUrl('https://xxx.supabase.co/storage/v1/object/public/product-images/products/collar/main.jpg')
 * // Returns: { path: 'products/collar/main.jpg', bucket: 'product-images' }
 */
function extractPathFromUrl(url: string): { path: string; bucket: string } | null {
  try {
    // Formato esperado: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
    const publicPrefix = '/storage/v1/object/public/'
    const publicIndex = url.indexOf(publicPrefix)

    if (publicIndex === -1) {
      return null
    }

    const afterPublic = url.substring(publicIndex + publicPrefix.length)
    const slashIndex = afterPublic.indexOf('/')

    if (slashIndex === -1) {
      return null
    }

    const bucket = afterPublic.substring(0, slashIndex)
    const path = afterPublic.substring(slashIndex + 1)

    return { path, bucket }
  } catch (error) {
    console.error('Error extracting path from URL:', error)
    return null
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { BUCKET_PRODUCT_IMAGES, BUCKET_BRANDING, MAX_FILE_SIZE, ALLOWED_TYPES }
