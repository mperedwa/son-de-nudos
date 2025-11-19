import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'
import { MultiImageUploader } from '@/components/admin/MultiImageUploader'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { deleteFolder, deleteImage } from '@/lib/storage'

// ============================================================================
// TYPES
// ============================================================================

type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']

type Variant = Database['public']['Tables']['variants']['Row']

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const productSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  title_en: z.string().nullable(),
  handle: z.string().min(1, 'El handle es requerido').regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  description_html: z.string().nullable(),
  description_html_en: z.string().nullable(),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  compare_at_price: z.number().nullable(),
  tags: z.array(z.string()),
  images: z.array(z.string().url('Debe ser una URL válida')),
  available_for_sale: z.boolean(),
})

type ProductFormData = z.infer<typeof productSchema>

// Opciones predefinidas para variantes
const LARGO_OPTIONS = ['16 in', '18 in', '20 in', '22 in', '24 in']
const GROSOR_OPTIONS = ['1.5mm', '3mm', '5mm', '9mm']
const MATERIAL_CORDON_OPTIONS = ['Algodón', 'Algodón encerado', 'Algodón reciclado', 'Nylon', 'Poliéster']
const MATERIAL_ACCESORIOS_OPTIONS = ['Plata 925', 'Latón', 'Cobre', 'Bronce', 'Piedra natural', 'Cristal', 'Madera', 'Cerámica']
const COLOR_OPTIONS = [
  'Natural', 'Blanco', 'Negro', 'Gris', 'Beige', 'Marrón',
  'Coral', 'Rosa', 'Rojo', 'Naranja', 'Amarillo', 'Mostaza',
  'Verde', 'Verde musgo', 'Azul', 'Celeste', 'Azul marino', 'Turquesa',
  'Morado', 'Dorado', 'Plateado'
]

const variantSchema = z.object({
  largo: z.string().min(1, 'El largo es requerido'),
  grosor: z.string().optional(),
  materialCordon: z.string().optional(),
  materialAccesorios: z.string().optional(),
  colorPrimario: z.string().optional(),
  colorSecundario: z.string().optional(),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  compare_at_price: z.number().nullable(),
  available: z.boolean(),
  stock: z.number().int('Debe ser un número entero').min(0, 'El stock debe ser mayor o igual a 0'),
  image: z.string(),
})

type VariantFormData = z.infer<typeof variantSchema>

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
  const [cloningProduct, setCloningProduct] = useState<Product | null>(null)
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

  function handleCloneClick(product: Product) {
    setCloningProduct(product)
  }

  function handleDeleteClick(product: Product) {
    setDeletingProduct(product)
  }

  function handleCloseModals() {
    setIsCreateModalOpen(false)
    setEditingProduct(null)
    setCloningProduct(null)
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
            onClone={handleCloneClick}
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

      {cloningProduct && (
        <ProductFormModal
          mode="clone"
          product={cloningProduct}
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
  onClone: (product: Product) => void
  onDelete: (product: Product) => void
}

function ProductsTable({ products, onEdit, onClone, onDelete }: ProductsTableProps) {
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
              onClone={() => onClone(product)}
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
  onClone: () => void
  onDelete: () => void
}

function ProductRow({ product, onEdit, onClone, onDelete }: ProductRowProps) {
  const firstImage = product.images?.[0]
  const [isExpanded, setIsExpanded] = useState(false)
  const [variantsCount, setVariantsCount] = useState<number | null>(null)

  // Fetch variants count
  useEffect(() => {
    async function fetchVariantsCount() {
      const { count } = await supabase
        .from('variants')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', product.id)
      setVariantsCount(count)
    }
    fetchVariantsCount()
  }, [product.id])

  return (
    <>
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
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-[#8B6F47]">{product.title}</p>
              {variantsCount !== null && variantsCount > 0 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#D4A574]/20 text-[#8B6F47] hover:bg-[#D4A574]/30 transition-colors"
                  title={isExpanded ? 'Ocultar variantes' : 'Ver variantes'}
                >
                  <span>{variantsCount} {variantsCount === 1 ? 'variante' : 'variantes'}</span>
                  <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
                </button>
              )}
            </div>
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
            onClick={onClone}
            className="p-2 text-[#8B6F47] hover:bg-[#F5E6D3] rounded-lg transition-colors"
            title="Clonar"
          >
            📋
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

    {/* Fila expandible de variantes */}
    {isExpanded && (
      <tr>
        <td colSpan={5} className="p-0 bg-[#F5E6D3]/10">
          <VariantsSection
            productId={product.id}
            productTitle={product.title}
            productHandle={product.handle}
            productPrice={product.price}
            onVariantChange={() => {
              // Re-fetch variants count cuando cambien
              async function fetchVariantsCount() {
                const { count } = await supabase
                  .from('variants')
                  .select('*', { count: 'exact', head: true })
                  .eq('product_id', product.id)
                setVariantsCount(count)
              }
              fetchVariantsCount()
            }}
          />
        </td>
      </tr>
    )}
  </>
  )
}

// ============================================================================
// VARIANTS SECTION
// ============================================================================

interface VariantsSectionProps {
  productId: string
  productTitle: string
  productHandle: string
  productPrice: number
  onVariantChange: () => void
}

function VariantsSection({ productId, productTitle, productHandle, productPrice, onVariantChange }: VariantsSectionProps) {
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null)
  const [cloningVariant, setCloningVariant] = useState<Variant | null>(null)
  const [deletingVariant, setDeletingVariant] = useState<Variant | null>(null)

  // Fetch variants
  useEffect(() => {
    fetchVariants()
  }, [productId])

  async function fetchVariants() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('variants')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setVariants(data || [])
    } catch (error) {
      console.error('Error fetching variants:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleCloseModals() {
    setIsCreateModalOpen(false)
    setEditingVariant(null)
    setCloningVariant(null)
    setDeletingVariant(null)
  }

  async function handleVariantSaved() {
    await fetchVariants()
    onVariantChange()
    handleCloseModals()
  }

  async function handleVariantDeleted() {
    await fetchVariants()
    onVariantChange()
    handleCloseModals()
  }

  return (
    <div className="p-6 border-t border-[#D4A574]/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#8B6F47]">
          Variantes de {productTitle}
        </h3>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="
            px-3 py-1.5 rounded-lg text-sm font-medium text-white
            bg-gradient-to-r from-[#8B6F47] to-[#D4A574]
            hover:from-[#6B5844] hover:to-[#8B6F47]
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:ring-offset-2
          "
        >
          + Nueva Variante
        </button>
      </div>

      {/* Variants Table */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-[#8B6F47] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : variants.length === 0 ? (
        <div className="text-center py-8 text-[#6B5844]">
          No hay variantes. ¡Crea la primera!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F5E6D3]/50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-[#8B6F47] uppercase">Título</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-[#8B6F47] uppercase">SKU</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-[#8B6F47] uppercase">Precio</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-[#8B6F47] uppercase">Stock</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-[#8B6F47] uppercase">Estado</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-[#8B6F47] uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4A574]/20">
              {variants.map((variant) => (
                <tr key={variant.id} className="hover:bg-[#F5E6D3]/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-[#8B6F47]">{variant.title}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs text-[#6B5844] bg-[#F5E6D3] px-2 py-1 rounded">{variant.sku}</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#8B6F47]">
                    ${variant.price.toFixed(2)}
                    {variant.compare_at_price && (
                      <span className="ml-2 text-xs text-[#6B5844]/60 line-through">
                        ${variant.compare_at_price.toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${variant.stock === 0 ? 'text-red-600' : 'text-[#8B6F47]'}`}>
                      {variant.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      variant.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {variant.available ? 'Disponible' : 'No disponible'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditingVariant(variant)}
                        className="p-1.5 text-[#8B6F47] hover:bg-[#F5E6D3] rounded transition-colors"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setCloningVariant(variant)}
                        className="p-1.5 text-[#8B6F47] hover:bg-[#F5E6D3] rounded transition-colors"
                        title="Clonar"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => setDeletingVariant(variant)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <VariantFormModal
          mode="create"
          productId={productId}
          productHandle={productHandle}
          existingVariants={variants}
          defaultPrice={productPrice}
          onClose={handleCloseModals}
          onSave={handleVariantSaved}
        />
      )}

      {editingVariant && (
        <VariantFormModal
          mode="edit"
          productId={productId}
          productHandle={productHandle}
          existingVariants={variants}
          variant={editingVariant}
          defaultPrice={productPrice}
          onClose={handleCloseModals}
          onSave={handleVariantSaved}
        />
      )}

      {cloningVariant && (
        <VariantFormModal
          mode="clone"
          productId={productId}
          productHandle={productHandle}
          existingVariants={variants}
          variant={cloningVariant}
          defaultPrice={productPrice}
          onClose={handleCloseModals}
          onSave={handleVariantSaved}
        />
      )}

      {deletingVariant && (
        <VariantDeleteModal
          variant={deletingVariant}
          onClose={handleCloseModals}
          onDelete={handleVariantDeleted}
        />
      )}
    </div>
  )
}

// ============================================================================
// PRODUCT FORM MODAL
// ============================================================================

interface ProductFormModalProps {
  mode: 'create' | 'edit' | 'clone'
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
      ? mode === 'clone'
        ? {
            title: `${product.title} (Copia)`,
            title_en: product.title_en ? `${product.title_en} (Copy)` : null,
            handle: `${product.handle}-copy`,
            description_html: product.description_html,
            description_html_en: product.description_html_en,
            price: product.price,
            compare_at_price: product.compare_at_price,
            tags: product.tags,
            images: product.images,
            available_for_sale: product.available_for_sale,
          }
        : {
            title: product.title,
            title_en: product.title_en,
            handle: product.handle,
            description_html: product.description_html,
            description_html_en: product.description_html_en,
            price: product.price,
            compare_at_price: product.compare_at_price,
            tags: product.tags,
            images: product.images,
            available_for_sale: product.available_for_sale,
          }
      : {
          title: '',
          title_en: null,
          handle: '',
          description_html: '',
          description_html_en: null,
          price: 0,
          compare_at_price: null,
          tags: [],
          images: [],
          available_for_sale: true,
        },
  })

  const title = watch('title')

  // Auto-generate handle from title (only for create mode)
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
      if (mode === 'create' || mode === 'clone') {
        // @ts-expect-error - Supabase generated types have circular references
        const { error: insertError } = await supabase.from('products').insert(data as ProductInsert)
        if (insertError) throw insertError
      } else {
        const { error: updateError } = await supabase
          .from('products')
          // @ts-expect-error - Supabase generated types have circular references
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
            {mode === 'create' ? 'Nuevo Producto' : mode === 'clone' ? 'Clonar Producto' : 'Editar Producto'}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Title ES/EN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#6B5844] mb-2">
                Título (Español) *
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

            <div>
              <label className="block text-sm font-medium text-[#6B5844] mb-2">
                Título (Inglés)
              </label>
              <input
                {...register('title_en')}
                type="text"
                className="
                  w-full px-4 py-2 rounded-lg border-2 border-[#D4A574]/30
                  focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent
                "
                placeholder="Ej: Blue Macramé Necklace"
              />
            </div>
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

          {/* Description ES/EN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#6B5844] mb-2">
                Descripción (Español)
              </label>
              <textarea
                {...register('description_html')}
                rows={4}
                className="
                  w-full px-4 py-2 rounded-lg border-2 border-[#D4A574]/30
                  focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent
                "
                placeholder="Descripción del producto en español..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B5844] mb-2">
                Descripción (Inglés)
              </label>
              <textarea
                {...register('description_html_en')}
                rows={4}
                className="
                  w-full px-4 py-2 rounded-lg border-2 border-[#D4A574]/30
                  focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent
                "
                placeholder="Product description in English..."
              />
            </div>
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

          {/* Images */}
          <MultiImageUploader
            images={watch('images')}
            onImagesChange={(urls) => setValue('images', urls)}
            folder="products"
            subfolder={watch('handle') || 'temp'}
            disabled={isSubmitting}
          />

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
              {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear Producto' : mode === 'clone' ? 'Clonar Producto' : 'Guardar Cambios'}
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
      // 1. Eliminar carpeta de imágenes del producto en Storage
      await deleteFolder(`products/${product.handle}`)

      // 2. Eliminar producto de la base de datos
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

// ============================================================================
// VARIANT FORM MODAL
// ============================================================================

interface VariantFormModalProps {
  mode: 'create' | 'edit' | 'clone'
  productId: string
  productHandle: string
  existingVariants: Variant[]
  variant?: Variant
  defaultPrice: number
  onClose: () => void
  onSave: () => void
}

function VariantFormModal({ mode, productId, productHandle, existingVariants, variant, defaultPrice, onClose, onSave }: VariantFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Extraer opciones existentes de la variante (si existe)
  const existingLargo = variant?.options?.Largo || ''
  const existingGrosor = variant?.options?.Grosor || ''
  const existingMaterialCordon = variant?.options?.MaterialCordon || ''
  const existingMaterialAccesorios = variant?.options?.MaterialAccesorios || ''
  const existingColorPrimario = variant?.options?.ColorPrimario || ''
  const existingColorSecundario = variant?.options?.ColorSecundario || ''

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<VariantFormData>({
    resolver: zodResolver(variantSchema),
    defaultValues: variant
      ? {
          largo: existingLargo,
          grosor: existingGrosor,
          materialCordon: existingMaterialCordon,
          materialAccesorios: existingMaterialAccesorios,
          colorPrimario: existingColorPrimario,
          colorSecundario: existingColorSecundario,
          price: variant.price,
          compare_at_price: variant.compare_at_price,
          available: variant.available,
          stock: mode === 'clone' ? 0 : variant.stock,
          image: variant.image || '',
        }
      : {
          largo: '',
          grosor: '',
          materialCordon: '',
          materialAccesorios: '',
          colorPrimario: '',
          colorSecundario: '',
          price: defaultPrice,
          compare_at_price: null,
          available: true,
          stock: 0,
          image: '',
        },
  })

  // Watch los valores para auto-generar título y SKU
  const largo = watch('largo')
  const grosor = watch('grosor')
  const materialCordon = watch('materialCordon')
  const materialAccesorios = watch('materialAccesorios')
  const colorPrimario = watch('colorPrimario')
  const colorSecundario = watch('colorSecundario')

  // Auto-generar título
  const generatedTitle = [largo, grosor, materialCordon, materialAccesorios, colorPrimario, colorSecundario].filter(Boolean).join(', ') || 'Selecciona las opciones'

  // Auto-generar SKU
  const generateSKU = () => {
    const handleUpper = productHandle.toUpperCase().replace(/-/g, '')
    const nextNumber = existingVariants.length + 1
    return `${handleUpper}-V${String(nextNumber).padStart(2, '0')}`
  }

  const generatedSKU = mode === 'edit' ? variant!.sku : generateSKU()

  async function onSubmit(data: VariantFormData) {
    setIsSubmitting(true)
    setError(null)

    try {
      // Construir el objeto de variante con título y SKU auto-generados
      const title = [data.largo, data.grosor, data.materialCordon, data.materialAccesorios, data.colorPrimario, data.colorSecundario].filter(Boolean).join(', ')
      const sku = mode === 'edit' ? variant!.sku : generateSKU()

      const variantData = {
        title,
        sku,
        price: data.price,
        compare_at_price: data.compare_at_price,
        available: data.available,
        stock: data.stock,
        options: {
          Largo: data.largo,
          Grosor: data.grosor || '',
          MaterialCordon: data.materialCordon || '',
          MaterialAccesorios: data.materialAccesorios || '',
          ColorPrimario: data.colorPrimario || '',
          ColorSecundario: data.colorSecundario || '',
        },
        product_id: productId,
        image: data.image || null,
      }

      if (mode === 'create' || mode === 'clone') {
        // @ts-expect-error - Supabase generated types have circular references
        const { error: insertError } = await supabase.from('variants').insert(variantData)
        if (insertError) throw insertError
      } else {
        // En modo edit, no actualizar el SKU
        const { sku: _sku, ...updateData } = variantData
        const { error: updateError } = await supabase
          .from('variants')
          // @ts-expect-error - Supabase generated types have circular references
          .update(updateData)
          .eq('id', variant!.id)
        if (updateError) throw updateError
      }

      onSave()
    } catch (err) {
      console.error('Error saving variant:', err)
      setError(err instanceof Error ? err.message : 'Error al guardar la variante')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#D4A574]/20">
          <h2 className="text-2xl font-semibold text-[#8B6F47]">
            {mode === 'create' ? 'Nueva Variante' : mode === 'clone' ? 'Clonar Variante' : 'Editar Variante'}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Preview de Título y SKU auto-generados */}
          <div className="p-4 bg-[#F5E6D3]/50 rounded-lg border border-[#D4A574]/30">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-[#6B5844]/60 mb-1">Título (auto-generado)</p>
                <p className="text-sm font-medium text-[#8B6F47]">{generatedTitle}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#6B5844]/60 mb-1">SKU {mode === 'edit' ? '' : '(auto-generado)'}</p>
                <code className="text-sm font-medium text-[#8B6F47] bg-white px-2 py-0.5 rounded">{generatedSKU}</code>
              </div>
            </div>
          </div>

          {/* Opciones de variante - Fila 1 */}
          <div className="grid grid-cols-2 gap-4">
            {/* Largo */}
            <div>
              <label className="block text-sm font-medium text-[#6B5844] mb-2">
                Largo *
              </label>
              <select
                {...register('largo')}
                className={`
                  w-full px-4 py-2 rounded-lg border-2
                  focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent
                  ${errors.largo ? 'border-red-300 bg-red-50' : 'border-[#D4A574]/30'}
                `}
              >
                <option value="">Seleccionar</option>
                {LARGO_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {errors.largo && (
                <p className="mt-1 text-sm text-red-600">{errors.largo.message}</p>
              )}
            </div>

            {/* Grosor */}
            <div>
              <label className="block text-sm font-medium text-[#6B5844] mb-2">
                Grosor
              </label>
              <select
                {...register('grosor')}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#D4A574]/30 focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent"
              >
                <option value="">Seleccionar</option>
                {GROSOR_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Opciones de variante - Fila 2: Materiales */}
          <div className="grid grid-cols-2 gap-4">
            {/* Material del Cordón */}
            <div>
              <label className="block text-sm font-medium text-[#6B5844] mb-2">
                Material del Cordón
              </label>
              <select
                {...register('materialCordon')}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#D4A574]/30 focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent"
              >
                <option value="">Seleccionar</option>
                {MATERIAL_CORDON_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Material de Accesorios */}
            <div>
              <label className="block text-sm font-medium text-[#6B5844] mb-2">
                Material de Accesorios
              </label>
              <select
                {...register('materialAccesorios')}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#D4A574]/30 focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent"
              >
                <option value="">Seleccionar</option>
                {MATERIAL_ACCESORIOS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Opciones de variante - Fila 3: Colores */}
          <div className="grid grid-cols-2 gap-4">
            {/* Color Primario */}
            <div>
              <label className="block text-sm font-medium text-[#6B5844] mb-2">
                Color Primario
              </label>
              <select
                {...register('colorPrimario')}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#D4A574]/30 focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent"
              >
                <option value="">Seleccionar</option>
                {COLOR_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Color Secundario */}
            <div>
              <label className="block text-sm font-medium text-[#6B5844] mb-2">
                Color Secundario
              </label>
              <select
                {...register('colorSecundario')}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#D4A574]/30 focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent"
              >
                <option value="">Seleccionar</option>
                {COLOR_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
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

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-[#6B5844] mb-2">
              Stock *
            </label>
            <input
              {...register('stock', { valueAsNumber: true })}
              type="number"
              className={`
                w-full px-4 py-2 rounded-lg border-2
                focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent
                ${errors.stock ? 'border-red-300 bg-red-50' : 'border-[#D4A574]/30'}
              `}
              placeholder="0"
            />
            {errors.stock && (
              <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
            )}
          </div>

          {/* Image */}
          <ImageUploader
            currentImageUrl={watch('image') || null}
            onImageChange={(url) => setValue('image', url || '')}
            folder="variants"
            subfolder={generatedSKU || 'temp'}
            label="Imagen de la Variante"
            disabled={isSubmitting}
          />

          {/* Available */}
          <div className="flex items-center gap-2">
            <input
              {...register('available')}
              type="checkbox"
              id="variant-available"
              className="w-4 h-4 rounded text-[#8B6F47] focus:ring-[#D4A574]"
            />
            <label htmlFor="variant-available" className="text-sm font-medium text-[#6B5844]">
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
              {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear Variante' : mode === 'clone' ? 'Clonar Variante' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================================================
// VARIANT DELETE MODAL
// ============================================================================

interface VariantDeleteModalProps {
  variant: Variant
  onClose: () => void
  onDelete: () => void
}

function VariantDeleteModal({ variant, onClose, onDelete }: VariantDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirmDelete() {
    setIsDeleting(true)
    setError(null)

    try {
      // 1. Eliminar imagen de la variante en Storage si existe
      if (variant.image) {
        await deleteImage(variant.image)
      }

      // 2. Eliminar variante de la base de datos
      const { error: deleteError } = await supabase
        .from('variants')
        .delete()
        .eq('id', variant.id)

      if (deleteError) throw deleteError

      onDelete()
    } catch (err) {
      console.error('Error deleting variant:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar la variante')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-[#8B6F47] mb-4">
          ¿Eliminar variante?
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <p className="text-[#6B5844] mb-2">
          Estás a punto de eliminar la variante <strong>{variant.title}</strong> (SKU: {variant.sku}).
        </p>
        <p className="text-sm text-[#6B5844]/60 mb-6">
          Esta acción eliminará el historial de stock asociado y no se puede deshacer.
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
