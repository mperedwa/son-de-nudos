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

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          handle: string
          title: string
          description_html: string | null
          images: string[]
          price: number
          compare_at_price: number | null
          tags: string[]
          available_for_sale: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
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
          options: Record<string, string>
          image: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['variants']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['variants']['Insert']>
      }
      coupons: {
        Row: {
          id: string
          code: string
          percent: number
          min_amount: number | null
          max_uses: number | null
          current_uses: number
          valid_from: string
          valid_until: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['coupons']['Row'], 'id' | 'current_uses' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['coupons']['Insert']>
      }
      orders: {
        Row: {
          id: string
          stripe_session_id: string | null
          customer_email: string
          customer_name: string | null
          shipping_address: Record<string, any> | null
          items: Record<string, any>
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
      }
      admins: {
        Row: {
          id: string
          email: string
          password_hash: string
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
          password_hash?: string | null
          name: string
          role: 'admin' | 'superadmin'
          active?: boolean
        }
        Update: {
          email?: string
          password_hash?: string | null
          name?: string
          role?: 'admin' | 'superadmin'
          active?: boolean
          last_login_at?: string | null
        }
      }
      shipping_config: {
        Row: {
          id: string
          standard_cost: number
          free_shipping_threshold: number
          currency: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['shipping_config']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['shipping_config']['Insert']>
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
      }
    }
  }
}

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
  const errorMsg = '[Supabase] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env'
  console.error(errorMsg)

  // En producción, fallar inmediatamente si faltan variables críticas
  if (import.meta.env.PROD) {
    throw new Error(errorMsg + ' - Cannot initialize Supabase client in production without credentials')
  }

  // En desarrollo, solo advertir
  console.warn('[Supabase] Running in development mode without proper credentials. Features may not work.')
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

  // 1. Get current variant to calculate change
  const { data: currentVariant, error: fetchError } = await supabase
    .from('variants')
    .select('stock')
    .eq('id', variantId)
    .single<{ stock: number }>()

  if (fetchError || !currentVariant) {
    throw new Error('Variante no encontrada')
  }

  const previousStock = currentVariant.stock
  const change = newStock - previousStock

  // If no change, just return current variant
  if (change === 0) {
    const { data } = await supabase
      .from('variants')
      .select('*')
      .eq('id', variantId)
      .single<Database['public']['Tables']['variants']['Row']>()
    return data!
  }

  // 2. Update variant stock
  const { data: updatedVariant, error: updateError } = (await supabase
    .from('variants')
    // @ts-expect-error - Supabase types don't properly infer Update type for variants table
    .update({ stock: newStock })
    .eq('id', variantId)
    .select()
    .single()) as { data: Database['public']['Tables']['variants']['Row'] | null; error: any }

  if (updateError || !updatedVariant) {
    throw new Error(`Error al actualizar stock: ${updateError?.message || 'Unknown error'}`)
  }

  // 3. Get current admin user ID
  const { data: userData } = await supabase.auth.getUser()
  const adminId = userData?.user?.id || null

  // 4. Register in stock_history
  const { error: historyError } = (await supabase
    .from('stock_history')
    // @ts-expect-error - Supabase types don't properly infer Insert type for stock_history table
    .insert({
      variant_id: variantId,
      change,
      reason,
      previous_stock: previousStock,
      new_stock: newStock,
      admin_id: adminId,
    })) as { error: any }

  if (historyError) {
    console.error('[updateStockWithHistory] Failed to log history:', historyError)
    // No throw - we don't want to fail the whole operation if logging fails
  }

  return updatedVariant
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
