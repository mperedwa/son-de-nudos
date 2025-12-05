/**
 * Hook para cargar la configuración de la tienda desde Supabase
 *
 * Usado por:
 * - Footer.tsx (redes sociales)
 * - AnnouncementBar.tsx (mensajes del banner)
 * - Meta tags (SEO)
 * - Admin settings (edición)
 */

import { useState, useEffect } from 'react'
import { supabase, type Database, type AnnouncementMessage } from '@/lib/supabase'

// Type alias para facilitar el uso
export type StoreSettings = Database['public']['Tables']['store_settings']['Row']

// Valores por defecto cuando la DB no tiene datos
const DEFAULT_SETTINGS: StoreSettings = {
  id: '',
  // SEO
  meta_title: 'Son de Nudos by Priscilla - Artesanías Exclusivas',
  meta_description: 'Collares artesanales hechos a mano con amor y dedicación. Cada pieza es única.',
  meta_keywords: ['macramé', 'collares artesanales', 'joyería hecha a mano'],
  og_image: null,
  // Redes Sociales
  instagram_url: 'https://www.instagram.com/son_de_nudos/',
  facebook_url: 'https://www.facebook.com/share/1CwiWSxH5L/?mibextid=wwXIfr',
  pinterest_url: 'https://pinterest.com/sondenudos',
  tiktok_url: null,
  whatsapp_number: null,
  contact_email: 'hello@sondenudos.com',
  // Info Tienda
  store_name: 'Son de Nudos',
  store_description: 'Artesanías exclusivas hechas a mano por Priscilla',
  notification_email: null,
  contact_phone: null,
  // Banner
  announcement_messages: [
    { text_es: '✨ ENVÍO GRATIS en compras +$150', text_en: '✨ FREE SHIPPING on orders +$150', active: true },
    { text_es: '🎁 Usa código WELCOME10 para 10% de descuento', text_en: '🎁 Use code WELCOME10 for 10% off', active: true },
    { text_es: '🌿 100% Hecho a mano con amor', text_en: '🌿 100% Handmade with love', active: true },
    { text_es: '📦 Envíos a USA, Canadá y México', text_en: '📦 Shipping to USA, Canada and Mexico', active: true },
  ],
  // Analytics
  google_analytics_id: null,
  // Metadata
  created_at: '',
  updated_at: '',
}

// Cache global para evitar múltiples requests
let cachedSettings: StoreSettings | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

/**
 * Hook principal para obtener store settings
 */
export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings>(cachedSettings || DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(!cachedSettings)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSettings() {
      // Si hay cache válido, usar eso
      const now = Date.now()
      if (cachedSettings && (now - cacheTimestamp) < CACHE_DURATION) {
        setSettings(cachedSettings)
        setLoading(false)
        return
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('store_settings')
          .select('*')
          .limit(1)
          .single()

        if (fetchError) {
          // Si no hay registros, usar defaults
          if (fetchError.code === 'PGRST116') {
            console.warn('[useStoreSettings] No settings found, using defaults')
            setSettings(DEFAULT_SETTINGS)
          } else {
            throw fetchError
          }
        } else if (data) {
          // Actualizar cache
          cachedSettings = data as StoreSettings
          cacheTimestamp = Date.now()
          setSettings(data as StoreSettings)
        }
      } catch (err) {
        console.error('[useStoreSettings] Error fetching settings:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar configuración')
        // Usar defaults en caso de error
        setSettings(DEFAULT_SETTINGS)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return { settings, loading, error }
}

/**
 * Función para invalidar cache (llamar después de guardar cambios en admin)
 */
export function invalidateStoreSettingsCache() {
  cachedSettings = null
  cacheTimestamp = 0
}

/**
 * Hook específico para obtener solo los mensajes del banner
 * Filtra solo los mensajes activos
 */
export function useAnnouncementMessages(language: 'es' | 'en' = 'es') {
  const { settings, loading, error } = useStoreSettings()

  const messages: string[] = (settings.announcement_messages || [])
    .filter((msg: AnnouncementMessage) => msg.active)
    .map((msg: AnnouncementMessage) => language === 'en' ? msg.text_en : msg.text_es)

  return { messages, loading, error }
}

/**
 * Hook específico para obtener solo las redes sociales
 */
export function useSocialLinks() {
  const { settings, loading, error } = useStoreSettings()

  const socialLinks = {
    instagram: settings.instagram_url,
    facebook: settings.facebook_url,
    pinterest: settings.pinterest_url,
    tiktok: settings.tiktok_url,
    whatsapp: settings.whatsapp_number ? `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}` : null,
    email: settings.contact_email,
  }

  return { socialLinks, loading, error }
}

/**
 * Hook específico para obtener SEO meta tags
 */
export function useSeoMeta() {
  const { settings, loading, error } = useStoreSettings()

  const seoMeta = {
    title: settings.meta_title || DEFAULT_SETTINGS.meta_title,
    description: settings.meta_description || DEFAULT_SETTINGS.meta_description,
    keywords: settings.meta_keywords || DEFAULT_SETTINGS.meta_keywords,
    ogImage: settings.og_image,
    analyticsId: settings.google_analytics_id,
  }

  return { seoMeta, loading, error }
}

export default useStoreSettings
