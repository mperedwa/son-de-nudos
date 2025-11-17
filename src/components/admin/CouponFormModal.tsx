/**
 * CouponFormModal Component
 *
 * Modal para crear y editar cupones con validación
 * Usa React Hook Form + Zod para validación robusta
 */

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase, type Database } from '@/lib/supabase'

// ============================================================================
// TYPES
// ============================================================================

type Coupon = Database['public']['Tables']['coupons']['Row']

interface CouponFormModalProps {
  coupon: Coupon | null // null = create mode, Coupon = edit mode
  isOpen: boolean
  onClose: () => void
  onSuccess: (coupon: Coupon) => void
}

// ============================================================================
// ZOD SCHEMA
// ============================================================================

const couponSchema = z
  .object({
    code: z
      .string()
      .min(3, 'Código debe tener al menos 3 caracteres')
      .max(20, 'Código debe tener máximo 20 caracteres')
      .regex(/^[A-Z0-9_-]+$/, 'Código solo puede contener letras mayúsculas, números, guiones y guiones bajos')
      .transform((val) => val.toUpperCase()),
    percent: z
      .number()
      .min(1, 'Descuento mínimo es 1%')
      .max(100, 'Descuento máximo es 100%'),
    min_amount: z
      .number()
      .min(0, 'Monto mínimo debe ser mayor o igual a 0')
      .optional()
      .nullable(),
    max_uses: z
      .number()
      .int('Usos debe ser un número entero')
      .min(1, 'Usos mínimo es 1')
      .optional()
      .nullable(),
    valid_from: z.string().optional().nullable(),
    valid_until: z.string().optional().nullable(),
    active: z.boolean(),
  })
  .refine(
    (data) => {
      // If both dates are provided, valid_from must be before valid_until
      if (data.valid_from && data.valid_until) {
        return new Date(data.valid_from) < new Date(data.valid_until)
      }
      return true
    },
    {
      message: 'Fecha de inicio debe ser anterior a la fecha de fin',
      path: ['valid_until'],
    }
  )

type CouponFormData = z.infer<typeof couponSchema>

// ============================================================================
// COMPONENT
// ============================================================================

export function CouponFormModal({ coupon, isOpen, onClose, onSuccess }: CouponFormModalProps) {
  const isEditMode = coupon !== null

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '',
      percent: 10,
      min_amount: null,
      max_uses: null,
      valid_from: null,
      valid_until: null,
      active: true,
    },
  })

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  // Reset form when modal opens/closes or coupon changes
  useEffect(() => {
    if (isOpen && coupon) {
      // Edit mode - populate form with coupon data
      setValue('code', coupon.code)
      setValue('percent', Number(coupon.percent))
      setValue('min_amount', coupon.min_amount ? Number(coupon.min_amount) : null)
      setValue('max_uses', coupon.max_uses)
      setValue(
        'valid_from',
        coupon.valid_from ? new Date(coupon.valid_from).toISOString().slice(0, 16) : null
      )
      setValue(
        'valid_until',
        coupon.valid_until ? new Date(coupon.valid_until).toISOString().slice(0, 16) : null
      )
      setValue('active', coupon.active)
    } else if (isOpen && !coupon) {
      // Create mode - reset to defaults
      reset()
    }
  }, [isOpen, coupon, setValue, reset])

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  function handleClose() {
    if (isSubmitting) return
    reset()
    onClose()
  }

  async function onSubmit(data: CouponFormData) {
    try {
      if (isEditMode) {
        // UPDATE existing coupon
        const { data: updatedCoupon, error } = await supabase
          .from('coupons')
          // @ts-expect-error - Supabase types don't properly infer Update type
          .update({
            code: data.code,
            percent: data.percent,
            min_amount: data.min_amount,
            max_uses: data.max_uses,
            valid_from: data.valid_from || null,
            valid_until: data.valid_until || null,
            active: data.active,
          })
          .eq('id', coupon.id)
          .select()
          .single()

        if (error) {
          if (error.code === '23505') {
            // Unique constraint violation
            throw new Error('Ya existe un cupón con ese código')
          }
          throw error
        }

        onSuccess(updatedCoupon as Coupon)
        handleClose()
      } else {
        // CREATE new coupon
        const { data: newCoupon, error } = await supabase
          .from('coupons')
          // @ts-expect-error - Supabase types don't properly infer Insert type
          .insert({
            code: data.code,
            percent: data.percent,
            min_amount: data.min_amount,
            max_uses: data.max_uses,
            valid_from: data.valid_from || null,
            valid_until: data.valid_until || null,
            active: data.active,
            current_uses: 0,
          })
          .select()
          .single()

        if (error) {
          if (error.code === '23505') {
            // Unique constraint violation
            throw new Error('Ya existe un cupón con ese código')
          }
          throw error
        }

        onSuccess(newCoupon as Coupon)
        handleClose()
      }
    } catch (err) {
      console.error('Error saving coupon:', err)
      alert(err instanceof Error ? err.message : 'Error al guardar el cupón')
    }
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl border-2 border-[#D4A574]/30 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#D4A574]/20">
          <h2 className="text-xl font-bold text-[#8B6F47]">
            {isEditMode ? 'Editar Cupón' : 'Crear Nuevo Cupón'}
          </h2>
          <p className="text-sm text-[#6B5844]/70 mt-1">
            {isEditMode
              ? 'Modifica los detalles del cupón existente'
              : 'Completa los datos para crear un nuevo cupón de descuento'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {/* Code */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-[#6B5844] mb-1">
                Código del Cupón <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="code"
                {...register('code')}
                disabled={isSubmitting}
                placeholder="VERANO2024"
                className="w-full px-3 py-2 border border-[#D4A574]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] disabled:opacity-50 uppercase"
              />
              {errors.code && <p className="text-sm text-red-600 mt-1">{errors.code.message}</p>}
              <p className="text-xs text-[#6B5844]/60 mt-1">
                Solo letras mayúsculas, números, guiones y guiones bajos
              </p>
            </div>

            {/* Percent */}
            <div>
              <label htmlFor="percent" className="block text-sm font-medium text-[#6B5844] mb-1">
                Porcentaje de Descuento (%) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                id="percent"
                {...register('percent', { valueAsNumber: true })}
                disabled={isSubmitting}
                min="1"
                max="100"
                step="1"
                placeholder="10"
                className="w-full px-3 py-2 border border-[#D4A574]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] disabled:opacity-50"
              />
              {errors.percent && <p className="text-sm text-red-600 mt-1">{errors.percent.message}</p>}
            </div>

            {/* Min Amount (Optional) */}
            <div>
              <label htmlFor="min_amount" className="block text-sm font-medium text-[#6B5844] mb-1">
                Monto Mínimo de Compra (Opcional)
              </label>
              <input
                type="number"
                id="min_amount"
                {...register('min_amount', { valueAsNumber: true })}
                disabled={isSubmitting}
                min="0"
                step="0.01"
                placeholder="50.00"
                className="w-full px-3 py-2 border border-[#D4A574]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] disabled:opacity-50"
              />
              {errors.min_amount && (
                <p className="text-sm text-red-600 mt-1">{errors.min_amount.message}</p>
              )}
              <p className="text-xs text-[#6B5844]/60 mt-1">
                Deja vacío si no requiere monto mínimo
              </p>
            </div>

            {/* Max Uses (Optional) */}
            <div>
              <label htmlFor="max_uses" className="block text-sm font-medium text-[#6B5844] mb-1">
                Usos Máximos (Opcional)
              </label>
              <input
                type="number"
                id="max_uses"
                {...register('max_uses', { valueAsNumber: true })}
                disabled={isSubmitting}
                min="1"
                step="1"
                placeholder="100"
                className="w-full px-3 py-2 border border-[#D4A574]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] disabled:opacity-50"
              />
              {errors.max_uses && (
                <p className="text-sm text-red-600 mt-1">{errors.max_uses.message}</p>
              )}
              <p className="text-xs text-[#6B5844]/60 mt-1">Deja vacío para usos ilimitados</p>
            </div>

            {/* Valid From (Optional) */}
            <div>
              <label htmlFor="valid_from" className="block text-sm font-medium text-[#6B5844] mb-1">
                Válido Desde (Opcional)
              </label>
              <input
                type="datetime-local"
                id="valid_from"
                {...register('valid_from')}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-[#D4A574]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] disabled:opacity-50"
              />
              {errors.valid_from && (
                <p className="text-sm text-red-600 mt-1">{errors.valid_from.message}</p>
              )}
              <p className="text-xs text-[#6B5844]/60 mt-1">Deja vacío para validez inmediata</p>
            </div>

            {/* Valid Until (Optional) */}
            <div>
              <label htmlFor="valid_until" className="block text-sm font-medium text-[#6B5844] mb-1">
                Válido Hasta (Opcional)
              </label>
              <input
                type="datetime-local"
                id="valid_until"
                {...register('valid_until')}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-[#D4A574]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] disabled:opacity-50"
              />
              {errors.valid_until && (
                <p className="text-sm text-red-600 mt-1">{errors.valid_until.message}</p>
              )}
              <p className="text-xs text-[#6B5844]/60 mt-1">Deja vacío para validez sin límite</p>
            </div>

            {/* Active */}
            <div className="flex items-center gap-3 p-3 bg-[#F5E6D3]/50 rounded-lg">
              <input
                type="checkbox"
                id="active"
                {...register('active')}
                disabled={isSubmitting}
                className="w-5 h-5 text-[#8B6F47] border-[#D4A574]/30 rounded focus:ring-2 focus:ring-[#8B6F47] disabled:opacity-50"
              />
              <label htmlFor="active" className="text-sm font-medium text-[#6B5844] cursor-pointer">
                Cupón activo (puede ser usado inmediatamente)
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#D4A574]/20 flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 text-sm font-medium text-[#6B5844] bg-[#F5E6D3] rounded-lg hover:bg-[#D4A574]/30 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#8B6F47] to-[#D4A574] rounded-lg hover:from-[#6B5844] hover:to-[#8B6F47] disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Guardando...' : isEditMode ? 'Actualizar Cupón' : 'Crear Cupón'}
          </button>
        </div>
      </div>
    </div>
  )
}
