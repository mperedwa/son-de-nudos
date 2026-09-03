/**
 * Supabase Client Configuration
 * Fase 11: Panel de Administración
 *
 * Este archivo configura el cliente de Supabase para acceder a la base de datos PostgreSQL.
 * Incluye helpers para autenticación y queries type-safe.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ==============================================================================
// TYPES
// ==============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          handle: string
          title: string
          title_en: string | null
          description_html: string | null
          description_html_en: string | null
          images: string[]
          price: number
          compare_at_price: number | null
          tags: string[]
          available_for_sale: boolean
          collection_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'products_collection_id_fkey'
            columns: ['collection_id']
            isOneToOne: false
            referencedRelation: 'collections'
            referencedColumns: ['id']
          },
        ]
      }
      collections: {
        Row: {
          id: string
          handle: string
          name_es: string
          name_en: string
          description_es: string | null
          description_en: string | null
          image_url: string | null
          sort_order: number
          visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['collections']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['collections']['Insert']>
        Relationships: []
      }
      variants: {
        Row: {
          id: string
          product_id: string
          title: string
          sku: string
          price: number
          compare_at_price: number | null
          available: boolean
          stock: number
          fulfillment_mode: 'ready_to_ship' | 'made_to_order'
          preparation_days_min: number
          preparation_days_max: number
          options: Record<string, string>
          image: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['variants']['Row'],
          | 'id'
          | 'created_at'
          | 'updated_at'
          | 'fulfillment_mode'
          | 'preparation_days_min'
          | 'preparation_days_max'
        > & {
          fulfillment_mode?: 'ready_to_ship' | 'made_to_order'
          preparation_days_min?: number
          preparation_days_max?: number
        }
        Update: Partial<Database['public']['Tables']['variants']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'variants_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      coupons: {
        Row: {
          id: string
          code: string
          percent: number
          min_amount: number | null
          max_uses: number | null
          current_uses: number
          valid_from: string | null
          valid_until: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          percent: number
          min_amount?: number | null
          max_uses?: number | null
          current_uses?: number
          valid_from?: string | null
          valid_until?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['coupons']['Insert']>
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          stripe_session_id: string | null
          customer_email: string
          customer_name: string | null
          shipping_address: Json | null
          items: Json
          subtotal: number
          discount: number
          shipping: number
          total: number
          status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
        Relationships: []
      }
      admins: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'superadmin'
          active: boolean
          created_at: string
          updated_at: string
          last_login_at: string | null
        }
        Insert: {
          id?: string
          email: string
          name: string
          role: 'admin' | 'superadmin'
          active?: boolean
        }
        Update: {
          email?: string
          name?: string
          role?: 'admin' | 'superadmin'
          active?: boolean
          last_login_at?: string | null
        }
        Relationships: []
      }
      shipping_config: {
        Row: {
          id: string
          zone_1_cost: number // USA
          zone_2_cost: number // Canadá, México
          free_shipping_threshold: number
          currency: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['shipping_config']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['shipping_config']['Insert']>
        Relationships: []
      }
      stock_history: {
        Row: {
          id: string
          variant_id: string
          change: number
          reason: 'restock' | 'sale' | 'adjustment' | 'return' | 'damage'
          previous_stock: number
          new_stock: number
          admin_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['stock_history']['Row'], 'id' | 'created_at'>
        Update: never
        Relationships: [
          {
            foreignKeyName: 'stock_history_variant_id_fkey'
            columns: ['variant_id']
            isOneToOne: false
            referencedRelation: 'variants'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'stock_history_admin_id_fkey'
            columns: ['admin_id']
            isOneToOne: false
            referencedRelation: 'admins'
            referencedColumns: ['id']
          },
        ]
      }
      store_settings: {
        Row: {
          id: string
          // SEO Básico (LEGACY - mantener por backward compatibility)
          meta_title: string | null
          meta_description: string | null
          // SEO Bilingüe (NUEVO)
          meta_title_es: string | null
          meta_title_en: string | null
          meta_description_es: string | null
          meta_description_en: string | null
          // SEO Común
          meta_keywords: string[] | null
          og_image: string | null
          // Redes Sociales
          instagram_url: string | null
          facebook_url: string | null
          pinterest_url: string | null
          tiktok_url: string | null
          whatsapp_number: string | null
          contact_email: string | null
          // Info Tienda
          store_name: string | null
          store_description: string | null
          notification_email: string | null
          contact_phone: string | null
          // Banner Messages
          announcement_messages: AnnouncementMessage[] | null
          // Analytics
          google_analytics_id: string | null
          // Branding
          logo_url: string | null
          favicon_url: string | null
          // Legal
          return_policy_es: string | null
          return_policy_en: string | null
          // SEO Avanzado
          robots_txt: string | null
          sitemap_enabled: boolean | null
          schema_enabled: boolean | null
          canonical_base_url: string | null
          // Metadata
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['store_settings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['store_settings']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      admin_set_variant_stock: {
        Args: {
          target_variant_id: string
          target_stock: number
          change_reason: StockChangeReason
        }
        Returns: Database['public']['Tables']['variants']['Row']
      }
    }
  }
}

// Type for announcement messages stored in JSONB
export type AnnouncementMessage = {
  text_es: string
  text_en: string
  active: boolean
}

// Type helper for Collections
export type Collection = Database['public']['Tables']['collections']['Row']

// ==============================================================================
// CUSTOM TYPES FOR INVENTORY MANAGEMENT
// ==============================================================================

/**
 * Stock change reasons - mirrors database enum
 */
export type StockChangeReason = 'restock' | 'sale' | 'adjustment' | 'return' | 'damage'

/**
 * Variant with Product information (for inventory management)
 * Resultado de JOIN entre variants y products
 */
export type VariantWithProduct = Database['public']['Tables']['variants']['Row'] & {
  product: {
    id: string
    handle: string
    title: string
    images: string[]
    available_for_sale: boolean
  }
}

/**
 * Stock level for visual alerts
 */
export type StockLevel = 'out' | 'critical' | 'low' | 'normal'

/**
 * Get stock level based on quantity
 */
export function getStockLevel(stock: number): StockLevel {
  if (stock === 0) return 'out'
  if (stock <= 3) return 'critical'
  if (stock <= 5) return 'low'
  return 'normal'
}

// ==============================================================================
// ENVIRONMENT VARIABLES
// ==============================================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = `[Supabase] Missing environment variables:
  - VITE_SUPABASE_URL: ${supabaseUrl ? 'SET' : 'MISSING'}
  - VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'SET' : 'MISSING'}

  ⚠️ Asegúrate de que el archivo .env existe y contiene las credenciales correctas.
  ⚠️ Si acabas de crear/modificar .env, reinicia el servidor de desarrollo.`

  console.error(errorMsg)

  // Fallar en TODOS los ambientes - no permitir crear cliente con credenciales vacías
  throw new Error(errorMsg + '\n\nCannot initialize Supabase client without credentials.')
}

// ==============================================================================
// CLIENT INSTANCE
// ==============================================================================

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

// ==============================================================================
// HELPER FUNCTIONS
// ==============================================================================

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data } = await supabase.auth.getSession()
  return !!data.session
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser()
  return data.user
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('[Supabase] Error signing out:', error)
    throw error
  }
}

// ==============================================================================
// INVENTORY MANAGEMENT HELPERS
// ==============================================================================

/**
 * Update variant stock with automatic history logging
 * @param variantId - ID of the variant to update
 * @param newStock - New stock value (must be >= 0)
 * @param reason - Reason for the change
 * @returns Updated variant row
 */
export async function updateStockWithHistory(
  variantId: string,
  newStock: number,
  reason: StockChangeReason
): Promise<Database['public']['Tables']['variants']['Row']> {
  // Validate stock
  if (newStock < 0) {
    throw new Error('Stock no puede ser negativo')
  }

  const { data, error } = await supabase.rpc('admin_set_variant_stock', {
    target_variant_id: variantId,
    target_stock: newStock,
    change_reason: reason,
  })

  if (error || !data) {
    throw new Error(`Error al actualizar stock: ${error?.message || 'Variante no encontrada'}`)
  }

  return data as Database['public']['Tables']['variants']['Row']
}

/**
 * Fetch all variants with their product info (for inventory page)
 * @returns Array of variants with product data
 */
export async function fetchVariantsWithProducts(): Promise<VariantWithProduct[]> {
  const { data, error } = await supabase
    .from('variants')
    .select(
      `
      *,
      product:products!variants_product_id_fkey (
        id,
        handle,
        title,
        images,
        available_for_sale
      )
    `
    )
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error al cargar variantes: ${error.message}`)
  }

  return data as unknown as VariantWithProduct[]
}

/**
 * Fetch stock history for a specific variant
 * @param variantId - ID of the variant
 * @param limit - Max number of records to fetch (default: 50)
 * @returns Array of stock history entries
 */
export async function fetchStockHistory(
  variantId: string,
  limit = 50
): Promise<Database['public']['Tables']['stock_history']['Row'][]> {
  const { data, error } = await supabase
    .from('stock_history')
    .select('*')
    .eq('variant_id', variantId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Error al cargar historial: ${error.message}`)
  }

  return data
}

// ==============================================================================
// REAL-TIME SUBSCRIPTIONS
// ==============================================================================

/**
 * Subscribe to stock changes for a specific variant
 */
export function subscribeToStockChanges(
  variantId: string,
  callback: (newStock: number) => void
) {
  return supabase
    .channel(`variant:${variantId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'variants',
        filter: `id=eq.${variantId}`,
      },
      (payload) => {
        const newData = payload.new as Database['public']['Tables']['variants']['Row']
        callback(newData.stock)
      }
    )
    .subscribe()
}

/**
 * Subscribe to new orders
 */
export function subscribeToNewOrders(
  callback: (order: Database['public']['Tables']['orders']['Row']) => void
) {
  return supabase
    .channel('new-orders')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
      },
      (payload) => {
        const newOrder = payload.new as Database['public']['Tables']['orders']['Row']
        callback(newOrder)
      }
    )
    .subscribe()
}

// ==============================================================================
// EXPORT DEFAULT
// ==============================================================================

export default supabase
