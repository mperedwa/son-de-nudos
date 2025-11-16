import { useMemo } from 'react'
import type { Product, Variant } from '@/types/models'

/**
 * Selector de variantes de producto
 * - Muestra opciones disponibles (Largo, Material, Color)
 * - Calcula automáticamente variantes disponibles según combinación
 * - Notifica variante seleccionada al componente padre
 * - Muestra mensajes de error cuando combinación no está disponible
 */

type VariantSelectorProps = {
  product: Product
  selectedOptions: Record<string, string>
  onOptionChange: (optionName: string, value: string) => void
  selectedVariant: Variant | undefined
}

export default function VariantSelector({
  product,
  selectedOptions,
  onOptionChange,
  selectedVariant,
}: VariantSelectorProps) {
  // Extraer valores únicos para cada opción
  const optionValues = useMemo(() => {
    const values: Record<string, string[]> = {}

    product.options.forEach((optionName) => {
      const uniqueValues = new Set<string>()
      product.variants.forEach((variant) => {
        const value = variant.options[optionName]
        if (value) {
          uniqueValues.add(value)
        }
      })
      values[optionName] = Array.from(uniqueValues).sort()
    })

    return values
  }, [product])

  // Verificar qué valores están disponibles para cada opción dado el contexto actual
  const getAvailableValues = (optionName: string): Set<string> => {
    const availableValues = new Set<string>()

    product.variants.forEach((variant) => {
      if (!variant.available) return

      // Verificar si esta variante coincide con las opciones seleccionadas (excepto la actual)
      const matches = product.options.every((opt) => {
        if (opt === optionName) return true // Skip the current option
        return !selectedOptions[opt] || variant.options[opt] === selectedOptions[opt]
      })

      if (matches) {
        availableValues.add(variant.options[optionName])
      }
    })

    return availableValues
  }

  return (
    <div className="space-y-6">
      {product.options.map((optionName) => {
        const values = optionValues[optionName] || []
        const availableValues = getAvailableValues(optionName)
        const selectedValue = selectedOptions[optionName]

        return (
          <div key={optionName}>
            <label className="block text-sm font-medium text-text-dark mb-3">
              {optionName}
              {selectedValue && (
                <span className="ml-2 text-primary-brown">- {selectedValue}</span>
              )}
            </label>

            <div className="grid grid-cols-3 gap-3">
              {values.map((value) => {
                const isAvailable = availableValues.has(value)
                const isSelected = selectedValue === value

                return (
                  <button
                    key={value}
                    onClick={() => isAvailable && onOptionChange(optionName, value)}
                    disabled={!isAvailable}
                    className={`
                      relative px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all
                      ${
                        isSelected
                          ? 'border-primary-brown bg-primary-brown text-white'
                          : isAvailable
                          ? 'border-secondary-beige bg-white text-text-dark hover:border-accent-gold hover:bg-secondary-beige'
                          : 'border-secondary-beige bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {value}
                    {!isAvailable && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-gray-400 rotate-45" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Mensaje de error si la combinación no está disponible */}
      {!selectedVariant &&
        product.options.every((opt) => selectedOptions[opt]) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              Esta combinación no está disponible. Por favor selecciona otras opciones.
            </p>
          </div>
        )}

      {/* Mensaje de stock */}
      {selectedVariant && (
        <div className="bg-secondary-beige rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-dark">
              {selectedVariant.available ? (
                <>
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  En stock
                  {selectedVariant.stock && (
                    <span className="ml-2 text-text-light">
                      ({selectedVariant.stock} disponibles)
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Agotado
                </>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
