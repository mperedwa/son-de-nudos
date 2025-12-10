/**
 * Página de Administración de Colecciones
 *
 * CRUD completo para gestionar colecciones temáticas musicales.
 * Las colecciones agrupan productos relacionados (ej: "Verano Forte", "Invierno Pianissimo")
 *
 * Funcionalidades:
 * - Listar colecciones con contador de productos
 * - Crear nueva colección con nombres bilingües ES/EN
 * - Editar colección existente
 * - Clonar colección
 * - Eliminar colección (productos quedan huérfanos con collection_id = NULL)
 * - Toggle de visibilidad
 * - Ordenamiento con sort_order
 * - Upload de imagen con ImageUploader
 */

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase, type Collection } from '@/lib/supabase'
import { deleteImage } from '@/lib/storage'
import { ImageUploader } from '@/components/admin/ImageUploader'

// ==============================================================================
// TYPES
// ==============================================================================

type FormMode = 'create' | 'edit' | 'clone'

interface CollectionFormData {
  name_es: string
  name_en: string
  handle: string
  description_es?: string
  description_en?: string
  image_url?: string
  sort_order: number
  visible: boolean
}

interface CollectionWithCount extends Collection {
  product_count: number
}

// ==============================================================================
// ZOD SCHEMA
// ==============================================================================

const collectionSchema = z.object({
  name_es: z.string().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
  name_en: z.string().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
  handle: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  description_es: z.string().max(500, 'Máximo 500 caracteres').default(''),
  description_en: z.string().max(500, 'Máximo 500 caracteres').default(''),
  image_url: z.string().url('URL inválida').or(z.literal('')).default(''),
  sort_order: z.number().int().min(0, 'Debe ser positivo'),
  visible: z.boolean(),
})

// ==============================================================================
// MAIN COMPONENT
// ==============================================================================

export default function AdminCollections() {
  const [collections, setCollections] = useState<CollectionWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [formMode, setFormMode] = useState<FormMode>('create')
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingCollection, setDeletingCollection] = useState<CollectionWithCount | null>(null)

  // Cargar colecciones con contador de productos
  async function loadCollections() {
    try {
      setLoading(true)
      setError(null)

      // 1. Cargar todas las colecciones
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('collections')
        .select('*')
        .order('sort_order', { ascending: true })
        .returns<Collection[]>()

      if (collectionsError) throw collectionsError

      // 2. Contar productos por colección con query separado
      const collectionsWithCount: CollectionWithCount[] = await Promise.all(
        (collectionsData || []).map(async (collection: Collection) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('collection_id', collection.id)

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

  useEffect(() => {
    loadCollections()
  }, [])

  // Handlers para abrir modales
  function handleCreate() {
    setFormMode('create')
    setEditingCollection(null)
    setIsFormModalOpen(true)
  }

  function handleEdit(collection: Collection) {
    setFormMode('edit')
    setEditingCollection(collection)
    setIsFormModalOpen(true)
  }

  function handleClone(collection: Collection) {
    setFormMode('clone')
    setEditingCollection(collection)
    setIsFormModalOpen(true)
  }

  function handleDelete(collection: CollectionWithCount) {
    setDeletingCollection(collection)
    setIsDeleteModalOpen(true)
  }

  // Toggle visibilidad
  async function toggleVisibility(collection: Collection) {
    try {
      const { error } = await supabase
        .from('collections')
        // @ts-ignore - Supabase client type inference issue with collections table
        .update({ visible: !collection.visible })
        .eq('id', collection.id)

      if (error) throw error

      // Actualizar estado local
      setCollections((prev) =>
        prev.map((c) => (c.id === collection.id ? { ...c, visible: !c.visible } : c))
      )
    } catch (err) {
      console.error('Error toggling visibility:', err)
      alert('Error al cambiar visibilidad')
    }
  }

  // ==============================================================================
  // RENDER
  // ==============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6F47]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#3C2F2F]">Colecciones</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona las colecciones temáticas de productos
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-[#8B6F47] text-white px-4 py-2 rounded-lg hover:bg-[#A0845A] transition-colors"
        >
          + Nueva Colección
        </button>
      </div>

      {/* Collections Table */}
      {collections.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No hay colecciones aún</p>
          <button
            onClick={handleCreate}
            className="text-[#8B6F47] hover:underline font-medium"
          >
            Crear primera colección
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Imagen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nombre ES
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nombre EN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Handle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Productos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Visible
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {collections.map((collection) => (
                <tr key={collection.id} className="hover:bg-gray-50">
                  {/* Imagen */}
                  <td className="px-6 py-4">
                    {collection.image_url ? (
                      <img
                        src={collection.image_url}
                        alt={collection.name_es}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        📁
                      </div>
                    )}
                  </td>

                  {/* Nombre ES */}
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {collection.name_es}
                  </td>

                  {/* Nombre EN */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {collection.name_en}
                  </td>

                  {/* Handle */}
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                    {collection.handle}
                  </td>

                  {/* Productos */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {collection.product_count}
                    </span>
                  </td>

                  {/* Orden */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {collection.sort_order}
                  </td>

                  {/* Visible Toggle */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleVisibility(collection)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        collection.visible ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          collection.visible ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>

                  {/* Acciones */}
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(collection)}
                      className="text-[#8B6F47] hover:underline"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleClone(collection)}
                      className="text-blue-600 hover:underline"
                    >
                      📋 Clonar
                    </button>
                    <button
                      onClick={() => handleDelete(collection)}
                      className="text-red-600 hover:underline"
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {isFormModalOpen && (
        <CollectionFormModal
          mode={formMode}
          collection={editingCollection}
          onClose={() => {
            setIsFormModalOpen(false)
            setEditingCollection(null)
          }}
          onSuccess={() => {
            setIsFormModalOpen(false)
            setEditingCollection(null)
            loadCollections()
          }}
        />
      )}

      {isDeleteModalOpen && deletingCollection && (
        <DeleteConfirmModal
          collection={deletingCollection}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setDeletingCollection(null)
          }}
          onSuccess={() => {
            setIsDeleteModalOpen(false)
            setDeletingCollection(null)
            loadCollections()
          }}
        />
      )}
    </div>
  )
}

// ==============================================================================
// FORM MODAL COMPONENT
// ==============================================================================

interface CollectionFormModalProps {
  mode: FormMode
  collection: Collection | null
  onClose: () => void
  onSuccess: () => void
}

function CollectionFormModal({ mode, collection, onClose, onSuccess }: CollectionFormModalProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Configurar valores por defecto según modo
  const defaultValues: CollectionFormData = {
    name_es: mode === 'create' ? '' : collection?.name_es || '',
    name_en: mode === 'create' ? '' : collection?.name_en || '',
    handle: mode === 'create' ? '' : mode === 'clone' ? '' : collection?.handle || '',
    description_es: collection?.description_es || '',
    description_en: collection?.description_en || '',
    image_url: collection?.image_url || '',
    sort_order: collection?.sort_order ?? 0,
    visible: collection?.visible ?? true,
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues,
  })

  const nameEs = watch('name_es')
  const imageUrl = watch('image_url')

  // Auto-generar handle desde name_es solo en modo CREATE
  useEffect(() => {
    if (mode === 'create' && nameEs) {
      const generatedHandle = nameEs
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
        .replace(/\s+/g, '-') // Espacios a guiones
        .replace(/-+/g, '-') // Múltiples guiones a uno solo
        .replace(/^-|-$/g, '') // Remover guiones al inicio/final

      setValue('handle', generatedHandle)
    }
  }, [nameEs, mode, setValue])

  // Submit handler
  async function onSubmit(data: CollectionFormData) {
    try {
      setSaving(true)
      setError(null)

      if (mode === 'create' || mode === 'clone') {
        // Crear nueva colección
        const { error: insertError } = await supabase
          .from('collections')
          // @ts-ignore - Supabase client type inference issue with collections table
          .insert({
            name_es: data.name_es,
            name_en: data.name_en,
            handle: data.handle,
            description_es: data.description_es || null,
            description_en: data.description_en || null,
            image_url: data.image_url || null,
            sort_order: data.sort_order,
            visible: data.visible,
          })

        if (insertError) throw insertError
      } else {
        // Actualizar colección existente
        if (!collection) throw new Error('No collection to update')

        const { error: updateError } = await supabase
          .from('collections')
          // @ts-ignore - Supabase client type inference issue with collections table
          .update({
            name_es: data.name_es,
            name_en: data.name_en,
            handle: data.handle,
            description_es: data.description_es || null,
            description_en: data.description_en || null,
            image_url: data.image_url || null,
            sort_order: data.sort_order,
            visible: data.visible,
          })
          .eq('id', collection.id)

        if (updateError) throw updateError
      }

      onSuccess()
    } catch (err: any) {
      console.error('Error saving collection:', err)
      setError(err.message || 'Error al guardar colección')
    } finally {
      setSaving(false)
    }
  }

  const modalTitle =
    mode === 'create'
      ? 'Nueva Colección'
      : mode === 'edit'
      ? 'Editar Colección'
      : 'Clonar Colección'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-[#3C2F2F]">{modalTitle}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={saving}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Nombres Bilingües */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre en Español *
              </label>
              <input
                {...register('name_es')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F47] focus:border-transparent"
                placeholder="Verano Forte"
              />
              {errors.name_es && (
                <p className="text-red-500 text-xs mt-1">{errors.name_es.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre en Inglés *
              </label>
              <input
                {...register('name_en')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F47] focus:border-transparent"
                placeholder="Summer Forte"
              />
              {errors.name_en && (
                <p className="text-red-500 text-xs mt-1">{errors.name_en.message}</p>
              )}
            </div>
          </div>

          {/* Handle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Handle (URL) *
            </label>
            <input
              {...register('handle')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F47] focus:border-transparent font-mono text-sm"
              placeholder="verano-forte"
              disabled={mode === 'create'} // Auto-generado en create
            />
            {errors.handle && (
              <p className="text-red-500 text-xs mt-1">{errors.handle.message}</p>
            )}
            {mode === 'create' && (
              <p className="text-xs text-gray-500 mt-1">
                Se genera automáticamente desde el nombre en español
              </p>
            )}
          </div>

          {/* Descripciones Bilingües */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción en Español
              </label>
              <textarea
                {...register('description_es')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F47] focus:border-transparent"
                placeholder="Colección vibrante con colores cálidos..."
              />
              {errors.description_es && (
                <p className="text-red-500 text-xs mt-1">{errors.description_es.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción en Inglés
              </label>
              <textarea
                {...register('description_en')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F47] focus:border-transparent"
                placeholder="Vibrant collection with warm colors..."
              />
              {errors.description_en && (
                <p className="text-red-500 text-xs mt-1">{errors.description_en.message}</p>
              )}
            </div>
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen de Colección
            </label>
            <ImageUploader
              currentImageUrl={imageUrl}
              onImageChange={(url: string | null) => setValue('image_url', url || '')}
              folder="collections"
              subfolder={watch('handle') || 'temp'}
              label=""
              disabled={saving}
            />
          </div>

          {/* Sort Order y Visible */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orden de Aparición *
              </label>
              <input
                {...register('sort_order', { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F47] focus:border-transparent"
              />
              {errors.sort_order && (
                <p className="text-red-500 text-xs mt-1">{errors.sort_order.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Menor número = aparece primero</p>
            </div>

            <div>
              <label className="flex items-center space-x-2 mt-7">
                <input
                  {...register('visible')}
                  type="checkbox"
                  className="w-4 h-4 text-[#8B6F47] border-gray-300 rounded focus:ring-[#8B6F47]"
                />
                <span className="text-sm font-medium text-gray-700">
                  Visible en el sitio público
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#8B6F47] text-white rounded-lg hover:bg-[#A0845A] disabled:opacity-50 flex items-center space-x-2"
            >
              {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <span>{saving ? 'Guardando...' : 'Guardar Colección'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ==============================================================================
// DELETE CONFIRM MODAL
// ==============================================================================

interface DeleteConfirmModalProps {
  collection: CollectionWithCount
  onClose: () => void
  onSuccess: () => void
}

function DeleteConfirmModal({ collection, onClose, onSuccess }: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    try {
      setDeleting(true)
      setError(null)

      // 1. Limpiar imagen si existe
      if (collection.image_url) {
        try {
          await deleteImage(collection.image_url)
        } catch (cleanupErr) {
          console.error('Error deleting image:', cleanupErr)
          // No throw - continuar con eliminación
        }
      }

      // 2. Eliminar colección (productos quedan con collection_id = NULL por ON DELETE SET NULL)
      const { error: deleteError } = await supabase
        .from('collections')
        .delete()
        .eq('id', collection.id)

      if (deleteError) throw deleteError

      onSuccess()
    } catch (err: any) {
      console.error('Error deleting collection:', err)
      setError(err.message || 'Error al eliminar colección')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {/* Header */}
        <h2 className="text-xl font-semibold text-[#3C2F2F] mb-4">Eliminar Colección</h2>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="space-y-3 mb-6">
          <p className="text-gray-700">
            ¿Estás seguro de eliminar la colección{' '}
            <strong className="text-[#3C2F2F]">{collection.name_es}</strong>?
          </p>

          {collection.product_count > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
              <p className="font-medium mb-1">⚠️ Esta colección tiene {collection.product_count} producto(s)</p>
              <p className="text-sm">
                Los productos NO se eliminarán, solo quedarán sin colección asignada.
              </p>
            </div>
          )}

          <p className="text-sm text-gray-600">Esta acción no se puede deshacer.</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {deleting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{deleting ? 'Eliminando...' : 'Eliminar Colección'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
