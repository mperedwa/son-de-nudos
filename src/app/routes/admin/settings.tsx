import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase, type Database } from '@/lib/supabase'
import { type ShippingConfig, DEFAULT_SHIPPING_CONFIG } from '@/lib/shipping'

type ShippingConfigRow = Database['public']['Tables']['shipping_config']['Row']

// ============================================================================
// VALIDACIÓN CON ZOD
// ============================================================================

const shippingConfigSchema = z.object({
  zone_1_cost: z
    .number({ message: 'Debe ser un número' })
    .min(0, 'El costo no puede ser negativo')
    .max(100, 'El costo máximo es $100'),
  zone_2_cost: z
    .number({ message: 'Debe ser un número' })
    .min(0, 'El costo no puede ser negativo')
    .max(200, 'El costo máximo es $200'),
  free_shipping_threshold: z
    .number({ message: 'Debe ser un número' })
    .min(0, 'El umbral no puede ser negativo')
    .max(1000, 'El umbral máximo es $1000')
})

type ShippingConfigFormData = z.infer<typeof shippingConfigSchema>

// ============================================================================
// COMPONENTE SETTINGS
// ============================================================================

export default function AdminSettings() {
  const [config, setConfig] = useState<ShippingConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset
  } = useForm<ShippingConfigFormData>({
    resolver: zodResolver(shippingConfigSchema),
    defaultValues: {
      zone_1_cost: DEFAULT_SHIPPING_CONFIG.zone_1_cost,
      zone_2_cost: DEFAULT_SHIPPING_CONFIG.zone_2_cost,
      free_shipping_threshold: DEFAULT_SHIPPING_CONFIG.free_shipping_threshold
    }
  })

  // Cargar configuración actual
  useEffect(() => {
    async function loadConfig() {
      try {
        const { data, error } = await supabase
          .from('shipping_config')
          .select('*')
          .limit(1)
          .single<ShippingConfigRow>()

        if (error) throw error

        if (data) {
          const configData: ShippingConfig = {
            id: data.id,
            zone_1_cost: data.zone_1_cost,
            zone_2_cost: data.zone_2_cost,
            free_shipping_threshold: data.free_shipping_threshold,
            currency: data.currency,
            updated_at: data.updated_at
          }
          setConfig(configData)
          reset({
            zone_1_cost: data.zone_1_cost,
            zone_2_cost: data.zone_2_cost,
            free_shipping_threshold: data.free_shipping_threshold
          })
        }
      } catch (error) {
        console.error('Error loading shipping config:', error)
        setErrorMessage('Error al cargar la configuración')
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [reset])

  // Guardar configuración
  const onSubmit = async (data: ShippingConfigFormData) => {
    if (!config?.id) {
      setErrorMessage('No se encontró configuración para actualizar')
      return
    }

    setSaving(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const { error } = await supabase
        .from('shipping_config')
        .update({
          zone_1_cost: data.zone_1_cost,
          zone_2_cost: data.zone_2_cost,
          free_shipping_threshold: data.free_shipping_threshold
        } as unknown as never) // Type assertion needed due to Supabase client typing issues
        .eq('id', config.id)

      if (error) throw error

      // Actualizar estado local
      setConfig({
        ...config,
        zone_1_cost: data.zone_1_cost,
        zone_2_cost: data.zone_2_cost,
        free_shipping_threshold: data.free_shipping_threshold
      })

      setSuccessMessage('¡Configuración guardada exitosamente!')

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      console.error('Error saving config:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#8B6F47] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Título de la página */}
      <div>
        <h1 className="text-3xl font-semibold text-[#8B6F47] mb-2">Configuración</h1>
        <p className="text-[#6B5844]">Gestiona los costos de envío y otras opciones de la tienda</p>
      </div>

      {/* Card de configuración de envío */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#D4A574]/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-[#8B6F47] to-[#D4A574] rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#3C2F2F]">Costos de Envío</h2>
            <p className="text-sm text-[#6B5844]">Configura los costos por zona geográfica</p>
          </div>
        </div>

        {/* Mensajes de éxito/error */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Zonas de envío */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Zona 1: USA */}
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
                  {...register('zone_1_cost', { valueAsNumber: true })}
                  className={`w-full pl-7 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] ${
                    errors.zone_1_cost ? 'border-red-500' : 'border-[#d6ccc2]'
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B5844] text-sm">
                  USD
                </span>
              </div>
              {errors.zone_1_cost && (
                <p className="mt-1 text-sm text-red-600">{errors.zone_1_cost.message}</p>
              )}
            </div>

            {/* Zona 2: Canadá/México */}
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
                  {...register('zone_2_cost', { valueAsNumber: true })}
                  className={`w-full pl-7 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] ${
                    errors.zone_2_cost ? 'border-red-500' : 'border-[#d6ccc2]'
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B5844] text-sm">
                  USD
                </span>
              </div>
              {errors.zone_2_cost && (
                <p className="mt-1 text-sm text-red-600">{errors.zone_2_cost.message}</p>
              )}
            </div>
          </div>

          {/* Zona 3 informativa */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🌍</span>
              <div>
                <h3 className="font-medium text-[#3C2F2F]">Zona 3: Internacional</h3>
                <p className="text-sm text-[#6B5844]">
                  Los pedidos fuera de USA, Canadá y México mostrarán un mensaje para contactar
                  directamente. No se permite checkout automático.
                </p>
              </div>
            </div>
          </div>

          {/* Umbral de envío gratis */}
          <div className="border-t border-[#d6ccc2] pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-[#3C2F2F]">Umbral de Envío Gratis</h3>
                <p className="text-sm text-[#6B5844]">
                  Monto mínimo de compra para obtener envío gratis (Zonas 1 y 2)
                </p>
              </div>
            </div>
            <div className="max-w-xs">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B5844]">$</span>
                <input
                  type="number"
                  step="0.01"
                  {...register('free_shipping_threshold', { valueAsNumber: true })}
                  className={`w-full pl-7 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] ${
                    errors.free_shipping_threshold ? 'border-red-500' : 'border-[#d6ccc2]'
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B5844] text-sm">
                  USD
                </span>
              </div>
              {errors.free_shipping_threshold && (
                <p className="mt-1 text-sm text-red-600">{errors.free_shipping_threshold.message}</p>
              )}
            </div>
          </div>

          {/* Botón guardar */}
          <div className="flex items-center justify-between pt-4 border-t border-[#d6ccc2]">
            <div className="text-sm text-[#6B5844]">
              {config?.updated_at && (
                <>
                  Última actualización:{' '}
                  {new Date(config.updated_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </>
              )}
            </div>
            <button
              type="submit"
              disabled={saving || !isDirty}
              className={`
                px-6 py-2.5 rounded-lg font-medium transition-all duration-200
                ${
                  saving || !isDirty
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#8B6F47] to-[#D4A574] text-white hover:opacity-90 shadow-md hover:shadow-lg'
                }
              `}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </span>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Card informativa de zonas */}
      <div className="bg-gradient-to-br from-[#F5E6D3] to-white rounded-2xl shadow-lg p-6 border border-[#D4A574]/20">
        <h3 className="font-semibold text-[#3C2F2F] mb-4">Información de Zonas</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#6B5844]">
                <th className="pb-2">Zona</th>
                <th className="pb-2">Países</th>
                <th className="pb-2">Costo Actual</th>
                <th className="pb-2">Envío Gratis</th>
              </tr>
            </thead>
            <tbody className="text-[#3C2F2F]">
              <tr className="border-t border-[#d6ccc2]">
                <td className="py-2">Zona 1</td>
                <td className="py-2">Estados Unidos (US)</td>
                <td className="py-2 font-medium">${config?.zone_1_cost?.toFixed(2) || '8.99'}</td>
                <td className="py-2">
                  Compras +${config?.free_shipping_threshold?.toFixed(2) || '150.00'}
                </td>
              </tr>
              <tr className="border-t border-[#d6ccc2]">
                <td className="py-2">Zona 2</td>
                <td className="py-2">Canadá (CA), México (MX)</td>
                <td className="py-2 font-medium">${config?.zone_2_cost?.toFixed(2) || '18.99'}</td>
                <td className="py-2">
                  Compras +${config?.free_shipping_threshold?.toFixed(2) || '150.00'}
                </td>
              </tr>
              <tr className="border-t border-[#d6ccc2]">
                <td className="py-2">Zona 3</td>
                <td className="py-2">Resto del mundo</td>
                <td className="py-2 text-[#6B5844]">No disponible</td>
                <td className="py-2 text-[#6B5844]">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
