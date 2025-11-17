import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

// ============================================================================
// TYPES
// ============================================================================

type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const productSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  handle: z.string().min(1, 'El handle es requerido').regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  description_html: z.string().nullable(),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  compare_at_price: z.number().nullable(),
  tags: z.array(z.string()),
  images: z.array(z.string().url('Debe ser una URL válida')),
  available_for_sale: z.boolean(),
})

type ProductFormData = z.infer<typeof productSchema>

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterAvailable, setFilterAvailable] = useState<'all' | 'available' | 'unavailable'>('all')

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  // Fetch products
  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtered products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.handle.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      filterAvailable === 'all' ||
      (filterAvailable === 'available' && product.available_for_sale) ||
      (filterAvailable === 'unavailable' && !product.available_for_sale)

    return matchesSearch && matchesFilter
  })

  // Handlers
  function handleCreateClick() {
    setIsCreateModalOpen(true)
  }

  function handleEditClick(product: Product) {
    setEditingProduct(product)
  }

  function handleDeleteClick(product: Product) {
    setDeletingProduct(product)
  }

  function handleCloseModals() {
    setIsCreateModalOpen(false)
    setEditingProduct(null)
    setDeletingProduct(null)
  }

  async function handleProductSaved() {
    await fetchProducts()
    handleCloseModals()
  }

  async function handleProductDeleted() {
    await fetchProducts()
    handleCloseModals()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#8B6F47]">Productos</h1>
          <p className="text-[#6B5844] mt-1">
            Gestiona el catálogo de productos
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="
            px-4 py-2 rounded-lg font-medium text-white
            bg-gradient-to-r from-[#8B6F47] to-[#D4A574]
            hover:from-[#6B5844] hover:to-[#8B6F47]
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:ring-offset-2
          "
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-[#D4A574]/20">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por título o handle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full px-4 py-2 rounded-lg border-2 border-[#D4A574]/30
                focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent
              "
            />
          </div>

          {/* Filter */}
          <select
            value={filterAvailable}
            onChange={(e) => setFilterAvailable(e.target.value as typeof filterAvailable)}
            className="
              px-4 py-2 rounded-lg border-2 border-[#D4A574]/30
              focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent
            "
          >
            <option value="all">Todos</option>
            <option value="available">Disponibles</option>
            <option value="unavailable">No disponibles</option>
          </select>
        </div>
      </div>

      {/* Products Table/List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-[#8B6F47] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-[#D4A574]/20">
          <p className="text-[#6B5844] text-lg">
            {searchQuery || filterAvailable !== 'all'
              ? 'No se encontraron productos con los filtros aplicados'
              : 'No hay productos. ¡Crea el primero!'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-[#D4A574]/20 overflow-hidden">
          <ProductsTable
            products={filteredProducts}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <ProductFormModal
          mode="create"
          onClose={handleCloseModals}
          onSave={handleProductSaved}
        />
      )}

      {editingProduct && (
        <ProductFormModal
          mode="edit"
          product={editingProduct}
          onClose={handleCloseModals}
          onSave={handleProductSaved}
        />
      )}

      {deletingProduct && (
        <DeleteConfirmModal
          product={deletingProduct}
          onClose={handleCloseModals}
          onDelete={handleProductDeleted}
        />
      )}
    </div>
  )
}

// ============================================================================
// PRODUCTS TABLE
// ============================================================================

interface ProductsTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

function ProductsTable({ products, onEdit, onDelete }: ProductsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-[#F5E6D3]">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B6F47] uppercase tracking-wider">
              Producto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B6F47] uppercase tracking-wider">
              Handle
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B6F47] uppercase tracking-wider">
              Precio
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B6F47] uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-[#8B6F47] uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D4A574]/20">
          {products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              onEdit={() => onEdit(product)}
              onDelete={() => onDelete(product)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============================================================================
// PRODUCT ROW
// ============================================================================

interface ProductRowProps {
  product: Product
  onEdit: () => void
  onDelete: () => void
}

function ProductRow({ product, onEdit, onDelete }: ProductRowProps) {
  const firstImage = product.images?.[0]

  return (
    <tr className="hover:bg-[#F5E6D3]/30 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {firstImage ? (
            <img
              src={firstImage}
              alt={product.title}
              className="w-12 h-12 object-cover rounded-lg border border-[#D4A574]/30"
            />
          ) : (
            <div className="w-12 h-12 bg-[#F5E6D3] rounded-lg flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
          )}
          <div>
            <p className="font-medium text-[#8B6F47]">{product.title}</p>
            <p className="text-sm text-[#6B5844]/60">
              {product.tags.slice(0, 2).join(', ')}
              {product.tags.length > 2 && '...'}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <code className="text-sm text-[#6B5844] bg-[#F5E6D3] px-2 py-1 rounded">
          {product.handle}
        </code>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="font-medium text-[#8B6F47]">
            ${product.price.toFixed(2)}
          </span>
          {product.compare_at_price && (
            <span className="text-sm text-[#6B5844]/60 line-through">
              ${product.compare_at_price.toFixed(2)}
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`
            inline-flex px-2 py-1 rounded-full text-xs font-medium
            ${
              product.available_for_sale
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }
          `}
        >
          {product.available_for_sale ? 'Disponible' : 'No disponible'}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-[#8B6F47] hover:bg-[#F5E6D3] rounded-lg transition-colors"
            title="Editar"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            🗑️
          </button>
        </div>
      </td>
    </tr>
  )
}

// ============================================================================
// PRODUCT FORM MODAL
// ============================================================================

interface ProductFormModalProps {
  mode: 'create' | 'edit'
  product?: Product
  onClose: () => void
  onSave: () => void
}

function ProductFormModal({ mode, product, onClose, onSave }: ProductFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          title: product.title,
          handle: product.handle,
          description_html: product.description_html,
          price: product.price,
          compare_at_price: product.compare_at_price,
          tags: product.tags,
          images: product.images,
          available_for_sale: product.available_for_sale,
        }
      : {
          title: '',
          handle: '',
          description_html: '',
          price: 0,
          compare_at_price: null,
          tags: [],
          images: [],
          available_for_sale: true,
        },
  })

  const title = watch('title')

  // Auto-generate handle from title
  useEffect(() => {
    if (mode === 'create' && title) {
      const handle = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setValue('handle', handle)
    }
  }, [title, mode, setValue])

  async function onSubmit(data: ProductFormData) {
    setIsSubmitting(true)
    setError(null)

    try {
      if (mode === 'create') {
        const { error: insertError } = await supabase.from('products').insert(data as ProductInsert)
        if (insertError) throw insertError
      } else {
        const { error: updateError } = await supabase
          .from('products')
          .update(data as ProductUpdate)
          .eq('id', product!.id)
        if (updateError) throw updateError
      }

      onSave()
    } catch (err) {
      console.error('Error saving product:', err)
      setError(err instanceof Error ? err.message : 'Error al guardar el producto')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#D4A574]/20">
          <h2 className="text-2xl font-semibold text-[#8B6F47]">
            {mode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[#6B5844] mb-2">
              Título *
            </label>
            <input
              {...register('title')}
              type="text"
              className={`
                w-full px-4 py-2 rounded-lg border-2
                focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent
                ${errors.title ? 'border-red-300 bg-red-50' : 'border-[#D4A574]/30'}
              `}
              placeholder="Ej: Collar Macramé Azul"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Handle */}
          <div>
            <label className="block text-sm font-medium text-[#6B5844] mb-2">
              Handle (URL) *
            </label>
            <input
              {...register('handle')}
              type="text"
              className={`
                w-full px-4 py-2 rounded-lg border-2
                focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent
                ${errors.handle ? 'border-red-300 bg-red-50' : 'border-[#D4A574]/30'}
              `}
              placeholder="collar-macrame-azul"
            />
            {errors.handle && (
              <p className="mt-1 text-sm text-red-600">{errors.handle.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#6B5844] mb-2">
              Descripción
            </label>
            <textarea
              {...register('description_html')}
              rows={4}
              className="
                w-full px-4 py-2 rounded-lg border-2 border-[#D4A574]/30
                focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent
              "
              placeholder="Descripción del producto..."
            />
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#6B5844] mb-2">
                Precio *
              </label>
              <input
                {...register('price', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className={`
                  w-full px-4 py-2 rounded-lg border-2
                  focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent
                  ${errors.price ? 'border-red-300 bg-red-50' : 'border-[#D4A574]/30'}
                `}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B5844] mb-2">
                Precio de comparación
              </label>
              <input
                {...register('compare_at_price', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="
                  w-full px-4 py-2 rounded-lg border-2 border-[#D4A574]/30
                  focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent
                "
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Available for sale */}
          <div className="flex items-center gap-2">
            <input
              {...register('available_for_sale')}
              type="checkbox"
              id="available"
              className="w-4 h-4 rounded text-[#8B6F47] focus:ring-[#D4A574]"
            />
            <label htmlFor="available" className="text-sm font-medium text-[#6B5844]">
              Disponible para venta
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="
                px-4 py-2 rounded-lg font-medium text-[#6B5844]
                bg-white border-2 border-[#D4A574]/30
                hover:bg-[#F5E6D3]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
              "
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                px-4 py-2 rounded-lg font-medium text-white
                bg-gradient-to-r from-[#8B6F47] to-[#D4A574]
                hover:from-[#6B5844] hover:to-[#8B6F47]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
              "
            >
              {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear Producto' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================================================
// DELETE CONFIRM MODAL
// ============================================================================

interface DeleteConfirmModalProps {
  product: Product
  onClose: () => void
  onDelete: () => void
}

function DeleteConfirmModal({ product, onClose, onDelete }: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirmDelete() {
    setIsDeleting(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)

      if (deleteError) throw deleteError

      onDelete()
    } catch (err) {
      console.error('Error deleting product:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar el producto')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-[#8B6F47] mb-4">
          ¿Eliminar producto?
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <p className="text-[#6B5844] mb-6">
          Estás a punto de eliminar el producto <strong>{product.title}</strong>.
          Esta acción no se puede deshacer.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="
              px-4 py-2 rounded-lg font-medium text-[#6B5844]
              bg-white border-2 border-[#D4A574]/30
              hover:bg-[#F5E6D3]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="
              px-4 py-2 rounded-lg font-medium text-white
              bg-gradient-to-r from-red-600 to-red-500
              hover:from-red-700 hover:to-red-600
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
