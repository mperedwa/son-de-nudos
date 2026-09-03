/**
 * Hook para cargar la configuración de la tienda desde Supabase
 *
 * Usado por:
 * - Footer.tsx (redes sociales)
 * - AnnouncementBar.tsx (mensajes del banner)
 * - SeoHead.tsx (meta tags, favicon, canonical)
 * - Header.tsx (logo dinámico)
 * - ProductSchema.tsx (JSON-LD)
 * - Admin settings (edición)
 */

import { useState, useEffect } from 'react'
import { supabase, type Database, type AnnouncementMessage } from '@/lib/supabase'

// Type alias para facilitar el uso
export type StoreSettings = Database['public']['Tables']['store_settings']['Row']

// Valores por defecto cuando la DB no tiene datos
const DEFAULT_SETTINGS: StoreSettings = {
  id: '',
  // SEO Básico
  meta_title: 'Son de Nudos by Priscilla - Artesanías Exclusivas',
  meta_description: 'Collares artesanales hechos a mano con amor y dedicación. Cada pieza es única.',
  meta_keywords: ['macramé', 'collares artesanales', 'joyería hecha a mano'],
  og_image: null,
  // SEO Bilingüe
  meta_title_es: 'Son de Nudos by Priscilla - Artesanías Exclusivas',
  meta_title_en: 'Son de Nudos by Priscilla - Handmade Artisan Jewelry',
  meta_description_es: 'Collares y accesorios de macramé hechos a mano con amor. Cada pieza es única y especial.',
  meta_description_en: 'Handmade macramé necklaces and accessories crafted with love. Each piece is unique and special.',
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
    { text_es: '✨ ENTREGA LOCAL GRATIS en el área aprobada', text_en: '✨ FREE LOCAL DELIVERY in eligible areas', active: true },
    { text_es: '🌿 Hecho a mano con amor', text_en: '🌿 Handmade with love', active: true },
    { text_es: '📦 Envíos a los Estados Unidos contiguos', text_en: '📦 Shipping within the contiguous United States', active: true },
  ],
  // Analytics
  google_analytics_id: null,
  // Branding
  logo_url: null,
  favicon_url: null,
  // Legal
  return_policy_es: null,
  return_policy_en: null,
  // SEO Avanzado
  robots_txt: 'User-agent: *\nAllow: /\nDisallow: /admin/',
  sitemap_enabled: true,
  schema_enabled: true,
  canonical_base_url: 'https://www.sondenudos.com',
  // Metadata
  created_at: '',
  updated_at: '',
}

// Cache global para evitar múltiples requests
let cachedSettings: StoreSettings | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

const PUBLIC_SETTINGS_COLUMNS = [
  'id',
  'meta_title',
  'meta_description',
  'meta_title_es',
  'meta_title_en',
  'meta_description_es',
  'meta_description_en',
  'meta_keywords',
  'og_image',
  'instagram_url',
  'facebook_url',
  'pinterest_url',
  'tiktok_url',
  'whatsapp_number',
  'contact_email',
  'store_name',
  'store_description',
  'announcement_messages',
  'google_analytics_id',
  'logo_url',
  'favicon_url',
  'return_policy_es',
  'return_policy_en',
  'robots_txt',
  'sitemap_enabled',
  'schema_enabled',
  'canonical_base_url',
  'created_at',
  'updated_at',
].join(',')

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
          .select(PUBLIC_SETTINGS_COLUMNS)
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
          const publicSettings = {
            ...DEFAULT_SETTINGS,
            ...(data as Partial<StoreSettings>),
            notification_email: null,
            contact_phone: null,
          } as StoreSettings
          cachedSettings = publicSettings
          cacheTimestamp = Date.now()
          setSettings(publicSettings)
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
 * Soporta idiomas bilingües (ES/EN)
 *
 * @param lang - Idioma deseado ('es' | 'en')
 * @returns Configuración SEO según el idioma seleccionado
 */
export function useSeoMeta(lang: 'es' | 'en' = 'es') {
  const { settings, loading, error } = useStoreSettings()

  // Lógica de fallback: Si hay campos bilingües, usarlos; si no, usar los antiguos
  const title = lang === 'en'
    ? (settings.meta_title_en || settings.meta_title || DEFAULT_SETTINGS.meta_title_en)
    : (settings.meta_title_es || settings.meta_title || DEFAULT_SETTINGS.meta_title_es)

  const description = lang === 'en'
    ? (settings.meta_description_en || settings.meta_description || DEFAULT_SETTINGS.meta_description_en)
    : (settings.meta_description_es || settings.meta_description || DEFAULT_SETTINGS.meta_description_es)

  const seoMeta = {
    title,
    description,
    keywords: settings.meta_keywords || DEFAULT_SETTINGS.meta_keywords,
    ogImage: settings.og_image,
    analyticsId: settings.google_analytics_id,
    // Nuevos campos de branding
    faviconUrl: settings.favicon_url,
    // Nuevos campos de SEO avanzado
    canonicalBaseUrl: settings.canonical_base_url || DEFAULT_SETTINGS.canonical_base_url,
    schemaEnabled: settings.schema_enabled ?? true,
  }

  return { seoMeta, loading, error }
}

/**
 * Hook específico para obtener branding (logo y favicon)
 */
export function useBranding() {
  const { settings, loading, error } = useStoreSettings()

  const branding = {
    logoUrl: settings.logo_url,
    faviconUrl: settings.favicon_url,
    storeName: settings.store_name || DEFAULT_SETTINGS.store_name,
  }

  return { branding, loading, error }
}

/**
 * Hook específico para obtener política de devoluciones
 */
export function useReturnPolicy(language: 'es' | 'en' = 'es') {
  const { settings, loading, error } = useStoreSettings()

  const returnPolicy = language === 'en'
    ? settings.return_policy_en
    : settings.return_policy_es

  return { returnPolicy, loading, error }
}

/**
 * Hook específico para obtener configuración SEO avanzado
 */
export function useSeoAdvanced() {
  const { settings, loading, error } = useStoreSettings()

  const seoAdvanced = {
    robotsTxt: settings.robots_txt || DEFAULT_SETTINGS.robots_txt,
    sitemapEnabled: settings.sitemap_enabled ?? true,
    schemaEnabled: settings.schema_enabled ?? true,
    canonicalBaseUrl: settings.canonical_base_url || DEFAULT_SETTINGS.canonical_base_url,
  }

  return { seoAdvanced, loading, error }
}

export default useStoreSettings
