import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase, type Database, type AnnouncementMessage } from '@/lib/supabase'
import { type ShippingConfig, DEFAULT_SHIPPING_CONFIG } from '@/lib/shipping'
import { invalidateStoreSettingsCache } from '@/hooks/useStoreSettings'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { deleteImage } from '@/lib/storage'

type ShippingConfigRow = Database['public']['Tables']['shipping_config']['Row']
type StoreSettingsRow = Database['public']['Tables']['store_settings']['Row']

// ============================================================================
// SECCIÓN ACTIVA
// ============================================================================
type SettingsSection = 'shipping' | 'seo' | 'social' | 'store' | 'banner' | 'branding' | 'legal' | 'seo-advanced'

// ============================================================================
// VALIDACIÓN CON ZOD - ENVÍO
// ============================================================================
const shippingConfigSchema = z.object({
  zone_1_cost: z.number({ message: 'Debe ser un número' }).min(0).max(100),
  zone_2_cost: z.number({ message: 'Debe ser un número' }).min(0).max(200),
  free_shipping_threshold: z.number({ message: 'Debe ser un número' }).min(0).max(1000),
})
type ShippingConfigFormData = z.infer<typeof shippingConfigSchema>

// ============================================================================
// VALIDACIÓN CON ZOD - SEO
// ============================================================================
const seoSchema = z.object({
  // Campos bilingües
  meta_title_es: z.string().max(70, 'Máximo 70 caracteres').optional().nullable(),
  meta_title_en: z.string().max(70, 'Máximo 70 caracteres').optional().nullable(),
  meta_description_es: z.string().max(160, 'Máximo 160 caracteres').optional().nullable(),
  meta_description_en: z.string().max(160, 'Máximo 160 caracteres').optional().nullable(),
  // Campos comunes
  meta_keywords: z.string().optional().nullable(), // Comma separated
  google_analytics_id: z.string().optional().nullable(),
})
type SeoFormData = z.infer<typeof seoSchema>

// ============================================================================
// VALIDACIÓN CON ZOD - REDES SOCIALES
// ============================================================================
const socialSchema = z.object({
  instagram_url: z.string().url('URL inválida').optional().nullable().or(z.literal('')),
  facebook_url: z.string().url('URL inválida').optional().nullable().or(z.literal('')),
  pinterest_url: z.string().url('URL inválida').optional().nullable().or(z.literal('')),
  tiktok_url: z.string().url('URL inválida').optional().nullable().or(z.literal('')),
  whatsapp_number: z.string().optional().nullable(),
  contact_email: z.string().email('Email inválido').optional().nullable().or(z.literal('')),
})
type SocialFormData = z.infer<typeof socialSchema>

// ============================================================================
// VALIDACIÓN CON ZOD - INFO TIENDA
// ============================================================================
const storeSchema = z.object({
  store_name: z.string().min(1, 'Requerido').max(100),
  store_description: z.string().max(500).optional().nullable(),
  notification_email: z.string().email('Email inválido').optional().nullable().or(z.literal('')),
  contact_phone: z.string().optional().nullable(),
})
type StoreFormData = z.infer<typeof storeSchema>

// ============================================================================
// VALIDACIÓN CON ZOD - LEGAL (POLÍTICA DE DEVOLUCIONES)
// ============================================================================
const legalSchema = z.object({
  return_policy_es: z.string().max(10000, 'Máximo 10,000 caracteres').optional().nullable(),
  return_policy_en: z.string().max(10000, 'Máximo 10,000 caracteres').optional().nullable(),
})
type LegalFormData = z.infer<typeof legalSchema>

// ============================================================================
// VALIDACIÓN CON ZOD - SEO AVANZADO
// ============================================================================
const seoAdvancedSchema = z.object({
  robots_txt: z.string().max(5000, 'Máximo 5,000 caracteres').optional().nullable(),
  sitemap_enabled: z.boolean(),
  schema_enabled: z.boolean(),
  canonical_base_url: z.string().url('Debe ser una URL válida').optional().nullable().or(z.literal('')),
})
type SeoAdvancedFormData = z.infer<typeof seoAdvancedSchema>

// ============================================================================
// COMPONENTE SETTINGS
// ============================================================================
export default function AdminSettings() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('shipping')
  const [shippingConfig, setShippingConfig] = useState<ShippingConfig | null>(null)
  const [storeSettings, setStoreSettings] = useState<StoreSettingsRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Forms
  const shippingForm = useForm<ShippingConfigFormData>({
    resolver: zodResolver(shippingConfigSchema),
    defaultValues: {
      zone_1_cost: DEFAULT_SHIPPING_CONFIG.zone_1_cost,
      zone_2_cost: DEFAULT_SHIPPING_CONFIG.zone_2_cost,
      free_shipping_threshold: DEFAULT_SHIPPING_CONFIG.free_shipping_threshold,
    },
  })

  const seoForm = useForm<SeoFormData>({
    resolver: zodResolver(seoSchema),
  })

  const socialForm = useForm<SocialFormData>({
    resolver: zodResolver(socialSchema),
  })

  const storeForm = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
  })

  const legalForm = useForm<LegalFormData>({
    resolver: zodResolver(legalSchema),
  })

  const seoAdvancedForm = useForm<SeoAdvancedFormData>({
    resolver: zodResolver(seoAdvancedSchema),
    defaultValues: {
      sitemap_enabled: true,
      schema_enabled: true,
    },
  })

  // Banner messages state (manejado separado por su complejidad)
  const [bannerMessages, setBannerMessages] = useState<AnnouncementMessage[]>([])

  // Branding states (logo y favicon)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null)
  const [savingBranding, setSavingBranding] = useState(false)

  // SEO state (imagen Open Graph)
  const [ogImageUrl, setOgImageUrl] = useState<string | null>(null)

  // ============================================================================
  // CARGAR DATOS
  // ============================================================================
  useEffect(() => {
    async function loadAllSettings() {
      try {
        // Cargar en paralelo
        const [shippingResult, storeResult] = await Promise.all([
          supabase.from('shipping_config').select('*').limit(1).single<ShippingConfigRow>(),
          supabase.from('store_settings').select('*').limit(1).single<StoreSettingsRow>(),
        ])

        // Shipping
        if (!shippingResult.error && shippingResult.data) {
          const cfg: ShippingConfig = {
            id: shippingResult.data.id,
            zone_1_cost: shippingResult.data.zone_1_cost,
            zone_2_cost: shippingResult.data.zone_2_cost,
            free_shipping_threshold: shippingResult.data.free_shipping_threshold,
            currency: shippingResult.data.currency,
            updated_at: shippingResult.data.updated_at,
          }
          setShippingConfig(cfg)
          shippingForm.reset({
            zone_1_cost: cfg.zone_1_cost,
            zone_2_cost: cfg.zone_2_cost,
            free_shipping_threshold: cfg.free_shipping_threshold,
          })
        }

        // Store settings
        if (!storeResult.error && storeResult.data) {
          setStoreSettings(storeResult.data)
          // Reset all forms with data
          seoForm.reset({
            meta_title_es: storeResult.data.meta_title_es || storeResult.data.meta_title || '',
            meta_title_en: storeResult.data.meta_title_en || storeResult.data.meta_title || '',
            meta_description_es: storeResult.data.meta_description_es || storeResult.data.meta_description || '',
            meta_description_en: storeResult.data.meta_description_en || storeResult.data.meta_description || '',
            meta_keywords: storeResult.data.meta_keywords?.join(', ') || '',
            google_analytics_id: storeResult.data.google_analytics_id || '',
          })

          // Cargar imagen Open Graph
          setOgImageUrl(storeResult.data.og_image || null)
          socialForm.reset({
            instagram_url: storeResult.data.instagram_url || '',
            facebook_url: storeResult.data.facebook_url || '',
            pinterest_url: storeResult.data.pinterest_url || '',
            tiktok_url: storeResult.data.tiktok_url || '',
            whatsapp_number: storeResult.data.whatsapp_number || '',
            contact_email: storeResult.data.contact_email || '',
          })
          storeForm.reset({
            store_name: storeResult.data.store_name || 'Son de Nudos',
            store_description: storeResult.data.store_description || '',
            notification_email: storeResult.data.notification_email || '',
            contact_phone: storeResult.data.contact_phone || '',
          })
          setBannerMessages(storeResult.data.announcement_messages || [])

          // Branding
          setLogoUrl(storeResult.data.logo_url || null)
          setFaviconUrl(storeResult.data.favicon_url || null)

          // Legal
          legalForm.reset({
            return_policy_es: storeResult.data.return_policy_es || '',
            return_policy_en: storeResult.data.return_policy_en || '',
          })

          // SEO Avanzado
          seoAdvancedForm.reset({
            robots_txt: storeResult.data.robots_txt || 'User-agent: *\nAllow: /\nDisallow: /admin/',
            sitemap_enabled: storeResult.data.sitemap_enabled ?? true,
            schema_enabled: storeResult.data.schema_enabled ?? true,
            canonical_base_url: storeResult.data.canonical_base_url || 'https://www.sondenudos.com',
          })
        }
      } catch (error) {
        console.error('Error loading settings:', error)
        setErrorMessage('Error al cargar configuración')
      } finally {
        setLoading(false)
      }
    }

    loadAllSettings()
  }, [])

  // ============================================================================
  // GUARDAR FUNCIONES
  // ============================================================================
  const showSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const showError = (msg: string) => {
    setErrorMessage(msg)
    setTimeout(() => setErrorMessage(null), 5000)
  }

  // Guardar Envío
  const onSaveShipping = async (data: ShippingConfigFormData) => {
    if (!shippingConfig?.id) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('shipping_config')
        .update({
          zone_1_cost: data.zone_1_cost,
          zone_2_cost: data.zone_2_cost,
          free_shipping_threshold: data.free_shipping_threshold,
        } as unknown as never)
        .eq('id', shippingConfig.id)
      if (error) throw error
      setShippingConfig({ ...shippingConfig, ...data })
      showSuccess('Configuración de envío guardada')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  // Guardar SEO
  const onSaveSeo = async (data: SeoFormData) => {
    if (!storeSettings?.id) return
    setSaving(true)
    try {
      const keywords = data.meta_keywords
        ? data.meta_keywords.split(',').map((k) => k.trim()).filter(Boolean)
        : null
      const { error } = await supabase
        .from('store_settings')
        .update({
          // Campos bilingües
          meta_title_es: data.meta_title_es || null,
          meta_title_en: data.meta_title_en || null,
          meta_description_es: data.meta_description_es || null,
          meta_description_en: data.meta_description_en || null,
          // Campos comunes
          meta_keywords: keywords,
          og_image: ogImageUrl || null,
          google_analytics_id: data.google_analytics_id || null,
        } as unknown as never)
        .eq('id', storeSettings.id)
      if (error) throw error
      invalidateStoreSettingsCache()
      showSuccess('Configuración SEO guardada')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  // Guardar campo individual de SEO (para imagen OG que se sube directamente)
  const onSaveSeoField = async (field: 'og_image', value: string | null) => {
    if (!storeSettings?.id) return
    setSavingBranding(true) // Reutilizamos este estado
    try {
      const { error } = await supabase
        .from('store_settings')
        .update({ [field]: value } as unknown as never)
        .eq('id', storeSettings.id)
      if (error) throw error
      invalidateStoreSettingsCache()
      showSuccess('Imagen Open Graph actualizada')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSavingBranding(false)
    }
  }

  // Guardar Redes Sociales
  const onSaveSocial = async (data: SocialFormData) => {
    if (!storeSettings?.id) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('store_settings')
        .update({
          instagram_url: data.instagram_url || null,
          facebook_url: data.facebook_url || null,
          pinterest_url: data.pinterest_url || null,
          tiktok_url: data.tiktok_url || null,
          whatsapp_number: data.whatsapp_number || null,
          contact_email: data.contact_email || null,
        } as unknown as never)
        .eq('id', storeSettings.id)
      if (error) throw error
      invalidateStoreSettingsCache()
      showSuccess('Redes sociales guardadas')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  // Guardar Info Tienda
  const onSaveStore = async (data: StoreFormData) => {
    if (!storeSettings?.id) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('store_settings')
        .update({
          store_name: data.store_name,
          store_description: data.store_description || null,
          notification_email: data.notification_email || null,
          contact_phone: data.contact_phone || null,
        } as unknown as never)
        .eq('id', storeSettings.id)
      if (error) throw error
      invalidateStoreSettingsCache()
      showSuccess('Info de tienda guardada')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  // Guardar Banner Messages
  const onSaveBanner = async () => {
    if (!storeSettings?.id) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('store_settings')
        .update({
          announcement_messages: bannerMessages,
        } as unknown as never)
        .eq('id', storeSettings.id)
      if (error) throw error
      invalidateStoreSettingsCache()
      showSuccess('Mensajes del banner guardados')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  // Guardar Branding (Logo o Favicon individualmente)
  const onSaveBrandingField = async (field: 'logo_url' | 'favicon_url', value: string | null) => {
    if (!storeSettings?.id) return
    setSavingBranding(true)
    try {
      const { error } = await supabase
        .from('store_settings')
        .update({ [field]: value } as unknown as never)
        .eq('id', storeSettings.id)
      if (error) throw error
      invalidateStoreSettingsCache()
      showSuccess(field === 'logo_url' ? 'Logo actualizado' : 'Favicon actualizado')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSavingBranding(false)
    }
  }

  // Guardar Legal (Política de devoluciones)
  const onSaveLegal = async (data: LegalFormData) => {
    if (!storeSettings?.id) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('store_settings')
        .update({
          return_policy_es: data.return_policy_es || null,
          return_policy_en: data.return_policy_en || null,
        } as unknown as never)
        .eq('id', storeSettings.id)
      if (error) throw error
      invalidateStoreSettingsCache()
      showSuccess('Política de devoluciones guardada')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  // Guardar SEO Avanzado
  const onSaveSeoAdvanced = async (data: SeoAdvancedFormData) => {
    if (!storeSettings?.id) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('store_settings')
        .update({
          robots_txt: data.robots_txt || null,
          sitemap_enabled: data.sitemap_enabled,
          schema_enabled: data.schema_enabled,
          canonical_base_url: data.canonical_base_url || null,
        } as unknown as never)
        .eq('id', storeSettings.id)
      if (error) throw error
      invalidateStoreSettingsCache()
      showSuccess('SEO avanzado guardado')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#8B6F47] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const sections = [
    { id: 'shipping' as const, icon: '📦', label: 'Envío' },
    { id: 'seo' as const, icon: '🔍', label: 'SEO' },
    { id: 'social' as const, icon: '📱', label: 'Redes' },
    { id: 'store' as const, icon: '🏪', label: 'Tienda' },
    { id: 'banner' as const, icon: '📢', label: 'Banner' },
    { id: 'branding' as const, icon: '🎨', label: 'Marca' },
    { id: 'legal' as const, icon: '⚖️', label: 'Legal' },
    { id: 'seo-advanced' as const, icon: '🚀', label: 'SEO+' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-3xl font-semibold text-[#8B6F47] mb-2">Configuración</h1>
        <p className="text-[#6B5844]">Gestiona los ajustes de tu tienda</p>
      </div>

      {/* Mensajes */}
      {successMessage && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-2">
          <span>✓</span> {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2">
          <span>✗</span> {errorMessage}
        </div>
      )}

      {/* Tabs de navegación */}
      <div className="bg-white rounded-2xl shadow-lg border border-[#D4A574]/20 overflow-hidden">
        <div className="flex border-b border-[#D4A574]/20 overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`
                flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap
                ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-[#8B6F47] to-[#D4A574] text-white'
                    : 'text-[#6B5844] hover:bg-[#F5E6D3]'
                }
              `}
            >
              <span>{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ============================================ */}
          {/* SECCIÓN: ENVÍO */}
          {/* ============================================ */}
          {activeSection === 'shipping' && (
            <form onSubmit={shippingForm.handleSubmit(onSaveShipping)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Zona 1 */}
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🇺🇸</span>
                    <div>
                      <h3 className="font-medium text-[#3C2F2F]">Zona 1: Estados Unidos</h3>
                      <p className="text-xs text-[#6B5844]">Envío estándar dentro de USA</p>
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B5844]">$</span>
                    <input
                      type="number"
                      step="0.01"
                      {...shippingForm.register('zone_1_cost', { valueAsNumber: true })}
                      className="w-full pl-7 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] border-[#d6ccc2]"
                    />
                  </div>
                  {shippingForm.formState.errors.zone_1_cost && (
                    <p className="mt-1 text-sm text-red-600">
                      {shippingForm.formState.errors.zone_1_cost.message}
                    </p>
                  )}
                </div>

                {/* Zona 2 */}
                <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🇨🇦🇲🇽</span>
                    <div>
                      <h3 className="font-medium text-[#3C2F2F]">Zona 2: Canadá / México</h3>
                      <p className="text-xs text-[#6B5844]">Envío internacional cercano</p>
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B5844]">$</span>
                    <input
                      type="number"
                      step="0.01"
                      {...shippingForm.register('zone_2_cost', { valueAsNumber: true })}
                      className="w-full pl-7 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] border-[#d6ccc2]"
                    />
                  </div>
                  {shippingForm.formState.errors.zone_2_cost && (
                    <p className="mt-1 text-sm text-red-600">
                      {shippingForm.formState.errors.zone_2_cost.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Umbral envío gratis */}
              <div className="border-t border-[#d6ccc2] pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">✓</div>
                  <div>
                    <h3 className="font-medium text-[#3C2F2F]">Umbral de Envío Gratis</h3>
                    <p className="text-sm text-[#6B5844]">Monto mínimo para envío gratis</p>
                  </div>
                </div>
                <div className="max-w-xs relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B5844]">$</span>
                  <input
                    type="number"
                    step="0.01"
                    {...shippingForm.register('free_shipping_threshold', { valueAsNumber: true })}
                    className="w-full pl-7 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] border-[#d6ccc2]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#d6ccc2]">
                <button
                  type="submit"
                  disabled={saving || !shippingForm.formState.isDirty}
                  className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-[#8B6F47] to-[#D4A574] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          )}

          {/* ============================================ */}
          {/* SECCIÓN: SEO */}
          {/* ============================================ */}
          {activeSection === 'seo' && (
            <form onSubmit={seoForm.handleSubmit(onSaveSeo)} className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
                <strong>Importante para publicidad:</strong> Estos datos aparecen en Google y cuando
                compartes tu tienda en redes sociales. Configura meta tags específicos por idioma.
              </div>

              <div className="space-y-6">
                {/* Título SEO Bilingüe */}
                <div>
                  <h3 className="font-medium text-[#3C2F2F] mb-3">Título de la página (máx. 70 caracteres)</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#6B5844] mb-2">
                        <span className="mr-2">🇪🇸</span>Español
                      </label>
                      <input
                        {...seoForm.register('meta_title_es')}
                        placeholder="Son de Nudos by Priscilla - Artesanías Exclusivas"
                        maxLength={70}
                        className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] border-[#d6ccc2]"
                      />
                      <p className="mt-1 text-xs text-[#6B5844]">
                        {(seoForm.watch('meta_title_es') || '').length}/70 caracteres
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm text-[#6B5844] mb-2">
                        <span className="mr-2">🇺🇸</span>English
                      </label>
                      <input
                        {...seoForm.register('meta_title_en')}
                        placeholder="Son de Nudos by Priscilla - Handmade Artisan Jewelry"
                        maxLength={70}
                        className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] border-[#d6ccc2]"
                      />
                      <p className="mt-1 text-xs text-[#6B5844]">
                        {(seoForm.watch('meta_title_en') || '').length}/70 caracteres
                      </p>
                    </div>
                  </div>
                </div>

                {/* Descripción SEO Bilingüe */}
                <div>
                  <h3 className="font-medium text-[#3C2F2F] mb-3">Meta descripción (máx. 160 caracteres)</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#6B5844] mb-2">
                        <span className="mr-2">🇪🇸</span>Español
                      </label>
                      <textarea
                        {...seoForm.register('meta_description_es')}
                        rows={3}
                        placeholder="Collares y accesorios de macramé hechos a mano con amor..."
                        maxLength={160}
                        className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] border-[#d6ccc2]"
                      />
                      <p className="mt-1 text-xs text-[#6B5844]">
                        {(seoForm.watch('meta_description_es') || '').length}/160 caracteres
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm text-[#6B5844] mb-2">
                        <span className="mr-2">🇺🇸</span>English
                      </label>
                      <textarea
                        {...seoForm.register('meta_description_en')}
                        rows={3}
                        placeholder="Handmade macramé necklaces and accessories crafted with love..."
                        maxLength={160}
                        className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] border-[#d6ccc2]"
                      />
                      <p className="mt-1 text-xs text-[#6B5844]">
                        {(seoForm.watch('meta_description_en') || '').length}/160 caracteres
                      </p>
                    </div>
                  </div>
                </div>

                {/* Palabras clave */}
                <div className="border-t border-[#d6ccc2] pt-6">
                  <label className="block text-sm font-medium text-[#3C2F2F] mb-2">
                    Palabras clave (separadas por coma)
                  </label>
                  <input
                    {...seoForm.register('meta_keywords')}
                    placeholder="macramé, collares artesanales, joyería hecha a mano"
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] border-[#d6ccc2]"
                  />
                  <p className="mt-1 text-xs text-[#6B5844]">
                    Palabras clave para SEO (opcional)
                  </p>
                </div>

                {/* Imagen Open Graph */}
                <div className="border-t border-[#d6ccc2] pt-6">
                  <h3 className="font-medium text-[#3C2F2F] mb-2">Imagen Open Graph</h3>
                  <p className="text-sm text-[#6B5844] mb-4">
                    Imagen que aparece al compartir en Facebook/Twitter (1200x630px recomendado)
                  </p>
                  <ImageUploader
                    currentImageUrl={ogImageUrl}
                    onImageChange={async (url) => {
                      // Si hay imagen anterior, eliminarla
                      if (ogImageUrl && url !== ogImageUrl) {
                        try {
                          await deleteImage(ogImageUrl)
                        } catch (e) {
                          console.warn('No se pudo eliminar imagen OG anterior:', e)
                        }
                      }
                      setOgImageUrl(url)
                      await onSaveSeoField('og_image', url)
                    }}
                    folder="seo"
                    subfolder="og-images"
                    label="Imagen Open Graph"
                    disabled={savingBranding}
                  />
                </div>

                {/* Google Analytics */}
                <div className="border-t border-[#d6ccc2] pt-6">
                  <label className="block text-sm font-medium text-[#3C2F2F] mb-2">
                    Google Analytics ID
                  </label>
                  <input
                    {...seoForm.register('google_analytics_id')}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full max-w-xs px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] border-[#d6ccc2]"
                  />
                  <p className="mt-1 text-xs text-[#6B5844]">
                    Para rastrear visitas y conversiones
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#d6ccc2]">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-[#8B6F47] to-[#D4A574] text-white hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar SEO'}
                </button>
              </div>
            </form>
          )}

          {/* ============================================ */}
          {/* SECCIÓN: REDES SOCIALES */}
          {/* ============================================ */}
          {activeSection === 'social' && (
            <form onSubmit={socialForm.handleSubmit(onSaveSocial)} className="space-y-6">
              <p className="text-sm text-[#6B5844]">
                Estos links aparecen en el footer de tu tienda.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3C2F2F] mb-2">
                    <span className="mr-2">📸</span>Instagram
                  </label>
                  <input
                    {...socialForm.register('instagram_url')}
                    placeholder="https://instagram.com/tu_usuario"
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] border-[#d6ccc2]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3C2F2F] mb-2">
                    <span className="mr-2">📘</span>Facebook
                  </label>
                  <input
                    {...socialForm.register('facebook_url')}
                    placeholder="https://facebook.com/tu_pagina"
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] border-[#d6ccc2]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3C2F2F] mb-2">
                    <span className="mr-2">📌</span>Pinterest
                  </label>
                  <input
                    {...socialForm.register('pinterest_url')}
                    placeholder="https://pinterest.com/tu_usuario"
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] border-[#d6ccc2]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3C2F2F] mb-2">
                    <span className="mr-2">🎵</span>TikTok
                  </label>
                  <input
                    {...socialForm.register('tiktok_url')}
                    placeholder="https://tiktok.com/@tu_usuario"
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] border-[#d6ccc2]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3C2F2F] mb-2">
                    <span className="mr-2">💬</span>WhatsApp
                  </label>
                  <input
                    {...socialForm.register('whatsapp_number')}
                    placeholder="+1234567890"
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] border-[#d6ccc2]"
                  />
                  <p className="mt-1 text-xs text-[#6B5844]">Formato internacional con código de país</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3C2F2F] mb-2">
                    <span className="mr-2">✉️</span>Email de contacto
                  </label>
                  <input
                    {...socialForm.register('contact_email')}
                    placeholder="hello@sondenudos.com"
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] border-[#d6ccc2]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#d6ccc2]">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-[#8B6F47] to-[#D4A574] text-white hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Redes'}
                </button>
              </div>
            </form>
          )}

          {/* ============================================ */}
          {/* SECCIÓN: INFO TIENDA */}
          {/* ============================================ */}
          {activeSection === 'store' && (
            <form onSubmit={storeForm.handleSubmit(onSaveStore)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#3C2F2F] mb-2">
                    Nombre de la tienda *
                  </label>
                  <input
                    {...storeForm.register('store_name')}
                    className="w-full max-w-md px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] border-[#d6ccc2]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3C2F2F] mb-2">
                    Descripción corta
                  </label>
                  <textarea
                    {...storeForm.register('store_description')}
                    rows={3}
                    placeholder="Artesanías exclusivas hechas a mano..."
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] border-[#d6ccc2]"
                  />
                </div>

                <div className="border-t border-[#d6ccc2] pt-4">
                  <h3 className="font-medium text-[#3C2F2F] mb-4">Contacto y notificaciones</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#3C2F2F] mb-2">
                        Email para notificaciones de pedidos
                      </label>
                      <input
                        {...storeForm.register('notification_email')}
                        placeholder="ventas@sondenudos.com"
                        className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] border-[#d6ccc2]"
                      />
                      <p className="mt-1 text-xs text-[#6B5844]">
                        Donde recibirás alertas de nuevos pedidos
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#3C2F2F] mb-2">
                        Teléfono de contacto
                      </label>
                      <input
                        {...storeForm.register('contact_phone')}
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] border-[#d6ccc2]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#d6ccc2]">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-[#8B6F47] to-[#D4A574] text-white hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Info'}
                </button>
              </div>
            </form>
          )}

          {/* ============================================ */}
          {/* SECCIÓN: BANNER */}
          {/* ============================================ */}
          {activeSection === 'banner' && (
            <div className="space-y-6">
              <p className="text-sm text-[#6B5844]">
                Mensajes que rotan en la barra superior de tu tienda. Máximo 4 mensajes.
              </p>

              <div className="space-y-4">
                {bannerMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border ${
                      msg.active
                        ? 'bg-green-50/50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-[#3C2F2F]">Mensaje {index + 1}</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={msg.active}
                          onChange={(e) => {
                            const updated = [...bannerMessages]
                            updated[index] = { ...msg, active: e.target.checked }
                            setBannerMessages(updated)
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-[#8B6F47] focus:ring-[#8B6F47]"
                        />
                        <span className="text-sm text-[#6B5844]">Activo</span>
                      </label>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-[#6B5844] mb-1">Español</label>
                        <input
                          value={msg.text_es}
                          onChange={(e) => {
                            const updated = [...bannerMessages]
                            updated[index] = { ...msg, text_es: e.target.value }
                            setBannerMessages(updated)
                          }}
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] border-[#d6ccc2]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#6B5844] mb-1">English</label>
                        <input
                          value={msg.text_en}
                          onChange={(e) => {
                            const updated = [...bannerMessages]
                            updated[index] = { ...msg, text_en: e.target.value }
                            setBannerMessages(updated)
                          }}
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] border-[#d6ccc2]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {bannerMessages.length < 4 && (
                <button
                  type="button"
                  onClick={() => {
                    setBannerMessages([
                      ...bannerMessages,
                      { text_es: '', text_en: '', active: true },
                    ])
                  }}
                  className="text-[#8B6F47] hover:underline text-sm"
                >
                  + Agregar mensaje
                </button>
              )}

              <div className="flex justify-end pt-4 border-t border-[#d6ccc2]">
                <button
                  type="button"
                  onClick={onSaveBanner}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-[#8B6F47] to-[#D4A574] text-white hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Mensajes'}
                </button>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* SECCIÓN: BRANDING (Logo y Favicon) */}
          {/* ============================================ */}
          {activeSection === 'branding' && (
            <div className="space-y-8">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
                <strong>Nota:</strong> El logo aparece en el header de tu tienda. El favicon aparece en
                la pestaña del navegador.
              </div>

              {/* Logo */}
              <div className="p-6 bg-white rounded-xl border border-[#d6ccc2]">
                <h3 className="font-medium text-[#3C2F2F] mb-4 flex items-center gap-2">
                  <span>🖼️</span> Logo de la tienda
                </h3>
                <p className="text-sm text-[#6B5844] mb-4">
                  Recomendado: PNG o SVG con fondo transparente, 400x100px
                </p>
                <ImageUploader
                  currentImageUrl={logoUrl}
                  onImageChange={async (url) => {
                    // Si hay logo anterior, eliminarlo
                    if (logoUrl && url !== logoUrl) {
                      try {
                        await deleteImage(logoUrl)
                      } catch (e) {
                        console.warn('No se pudo eliminar logo anterior:', e)
                      }
                    }
                    setLogoUrl(url)
                    await onSaveBrandingField('logo_url', url)
                  }}
                  folder="branding"
                  subfolder="logo"
                  label="Logo"
                  disabled={savingBranding}
                />
              </div>

              {/* Favicon */}
              <div className="p-6 bg-white rounded-xl border border-[#d6ccc2]">
                <h3 className="font-medium text-[#3C2F2F] mb-4 flex items-center gap-2">
                  <span>⭐</span> Favicon
                </h3>
                <p className="text-sm text-[#6B5844] mb-4">
                  Recomendado: PNG cuadrado 512x512px o 32x32px
                </p>
                <ImageUploader
                  currentImageUrl={faviconUrl}
                  onImageChange={async (url) => {
                    // Si hay favicon anterior, eliminarlo
                    if (faviconUrl && url !== faviconUrl) {
                      try {
                        await deleteImage(faviconUrl)
                      } catch (e) {
                        console.warn('No se pudo eliminar favicon anterior:', e)
                      }
                    }
                    setFaviconUrl(url)
                    await onSaveBrandingField('favicon_url', url)
                  }}
                  folder="branding"
                  subfolder="favicon"
                  label="Favicon"
                  disabled={savingBranding}
                />
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* SECCIÓN: LEGAL (Política de devoluciones) */}
          {/* ============================================ */}
          {activeSection === 'legal' && (
            <form onSubmit={legalForm.handleSubmit(onSaveLegal)} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm">
                <strong>Importante:</strong> Esta política aparecerá en la página /politicas/devoluciones
                y debe cumplir con las regulaciones de tu país.
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#3C2F2F] mb-2">
                    <span className="mr-2">🇪🇸</span>Política de devoluciones (Español)
                  </label>
                  <textarea
                    {...legalForm.register('return_policy_es')}
                    rows={10}
                    placeholder="Escribe aquí tu política de devoluciones en español..."
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] border-[#d6ccc2] font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-[#6B5844]">
                    {(legalForm.watch('return_policy_es') || '').length}/10,000 caracteres
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3C2F2F] mb-2">
                    <span className="mr-2">🇺🇸</span>Return Policy (English)
                  </label>
                  <textarea
                    {...legalForm.register('return_policy_en')}
                    rows={10}
                    placeholder="Write your return policy in English here..."
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] border-[#d6ccc2] font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-[#6B5844]">
                    {(legalForm.watch('return_policy_en') || '').length}/10,000 caracteres
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#d6ccc2]">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-[#8B6F47] to-[#D4A574] text-white hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Política'}
                </button>
              </div>
            </form>
          )}

          {/* ============================================ */}
          {/* SECCIÓN: SEO AVANZADO */}
          {/* ============================================ */}
          {activeSection === 'seo-advanced' && (
            <form onSubmit={seoAdvancedForm.handleSubmit(onSaveSeoAdvanced)} className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
                <strong>SEO Técnico:</strong> Estas configuraciones afectan cómo Google indexa tu sitio.
                Los cambios se reflejan automáticamente en /sitemap.xml y /robots.txt
              </div>

              <div className="space-y-6">
                {/* URL Canónica Base */}
                <div>
                  <label className="block text-sm font-medium text-[#3C2F2F] mb-2">
                    URL Base Canónica
                  </label>
                  <input
                    {...seoAdvancedForm.register('canonical_base_url')}
                    placeholder="https://www.sondenudos.com"
                    className="w-full max-w-md px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] border-[#d6ccc2]"
                  />
                  <p className="mt-1 text-xs text-[#6B5844]">
                    Evita contenido duplicado indicando la URL principal de tu sitio
                  </p>
                </div>

                {/* Toggles */}
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#d6ccc2] cursor-pointer hover:bg-[#F5E6D3]/50 transition-colors">
                    <input
                      type="checkbox"
                      {...seoAdvancedForm.register('sitemap_enabled')}
                      className="w-5 h-5 rounded border-gray-300 text-[#8B6F47] focus:ring-[#8B6F47]"
                    />
                    <div>
                      <span className="font-medium text-[#3C2F2F]">Sitemap automático</span>
                      <p className="text-xs text-[#6B5844]">Genera /sitemap.xml con todos tus productos</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#d6ccc2] cursor-pointer hover:bg-[#F5E6D3]/50 transition-colors">
                    <input
                      type="checkbox"
                      {...seoAdvancedForm.register('schema_enabled')}
                      className="w-5 h-5 rounded border-gray-300 text-[#8B6F47] focus:ring-[#8B6F47]"
                    />
                    <div>
                      <span className="font-medium text-[#3C2F2F]">Schema Markup</span>
                      <p className="text-xs text-[#6B5844]">JSON-LD para rich snippets en Google</p>
                    </div>
                  </label>
                </div>

                {/* robots.txt */}
                <div>
                  <label className="block text-sm font-medium text-[#3C2F2F] mb-2">
                    Contenido de robots.txt
                  </label>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-xs mb-3">
                    <strong>⚠️ Cuidado:</strong> Una configuración incorrecta puede desindexar tu sitio de Google.
                    Si no estás seguro, no modifiques este campo.
                  </div>
                  <textarea
                    {...seoAdvancedForm.register('robots_txt')}
                    rows={8}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] border-[#d6ccc2] font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-[#6B5844]">
                    El Sitemap se agrega automáticamente al final si está habilitado
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#d6ccc2]">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-[#8B6F47] to-[#D4A574] text-white hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar SEO Avanzado'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
