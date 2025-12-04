/**
 * AddressAutocomplete - Google Places Autocomplete component
 *
 * Provides address autocomplete functionality using Google Places API.
 * Extracts structured address data including country code for zone detection.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google?: typeof google
    initGooglePlaces?: () => void
    __GOOGLE_PLACES_API_KEY__?: string
  }
}

// Google Places API key from Vite env
const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string | undefined

// Track if script is loading to avoid multiple loads
let scriptLoadingPromise: Promise<void> | null = null

/**
 * Load Google Places script dynamically
 */
function loadGooglePlacesScript(): Promise<void> {
  // If already loaded, resolve immediately
  if (window.google?.maps?.places) {
    return Promise.resolve()
  }

  // If already loading, return the existing promise
  if (scriptLoadingPromise) {
    return scriptLoadingPromise
  }

  // No API key configured
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('[Google Places] No API key configured. Set VITE_GOOGLE_PLACES_API_KEY in .env')
    return Promise.reject(new Error('Google Places API key not configured'))
  }

  // Create loading promise
  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places`
    script.async = true
    script.defer = true

    script.onload = () => {
      console.log('[Google Places] Script loaded successfully')
      resolve()
    }

    script.onerror = () => {
      scriptLoadingPromise = null
      reject(new Error('Failed to load Google Places script'))
    }

    document.head.appendChild(script)
  })

  return scriptLoadingPromise
}

export interface AddressData {
  formattedAddress: string
  streetNumber: string
  route: string
  address: string // streetNumber + route combined
  city: string
  state: string
  stateCode: string
  zipCode: string
  country: string
  countryCode: string // ISO 3166-1 alpha-2 (e.g., 'US', 'CA', 'MX')
}

interface AddressAutocompleteProps {
  onAddressSelect: (data: AddressData) => void
  onAddressChange?: (value: string) => void
  defaultValue?: string
  placeholder?: string
  disabled?: boolean
  error?: boolean
  className?: string
  id?: string
  name?: string
  required?: boolean
}

/**
 * Extract address data from Google Places address_components
 */
function extractAddressData(
  components: google.maps.GeocoderAddressComponent[],
  formattedAddress: string
): AddressData {
  const getComponent = (type: string, useShortName = false): string => {
    const component = components.find((c) => c.types.includes(type))
    return component ? (useShortName ? component.short_name : component.long_name) : ''
  }

  const streetNumber = getComponent('street_number')
  const route = getComponent('route')
  const city =
    getComponent('locality') ||
    getComponent('sublocality_level_1') ||
    getComponent('administrative_area_level_2')
  const state = getComponent('administrative_area_level_1')
  const stateCode = getComponent('administrative_area_level_1', true)
  const zipCode = getComponent('postal_code')
  const country = getComponent('country')
  const countryCode = getComponent('country', true)

  // Combine street number and route for full address
  const address = [streetNumber, route].filter(Boolean).join(' ')

  return {
    formattedAddress,
    streetNumber,
    route,
    address,
    city,
    state,
    stateCode,
    zipCode,
    country,
    countryCode
  }
}

export function AddressAutocomplete({
  onAddressSelect,
  onAddressChange,
  defaultValue = '',
  placeholder,
  disabled = false,
  error = false,
  className = '',
  id,
  name,
  required = false
}: AddressAutocompleteProps) {
  const { t } = useTranslation(['checkout'])
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [inputValue, setInputValue] = useState(defaultValue)
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState(false)

  // Initialize Google Places Autocomplete
  const initAutocomplete = useCallback(() => {
    if (!inputRef.current || !window.google?.maps?.places) {
      return false
    }

    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        fields: ['address_components', 'formatted_address', 'geometry'],
        // Prioritize USA, Canada, Mexico but allow all countries
        componentRestrictions: undefined
      })

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace()

        if (!place?.address_components || !place.formatted_address) {
          return
        }

        const addressData = extractAddressData(place.address_components, place.formatted_address)

        setInputValue(place.formatted_address)
        onAddressSelect(addressData)
      })

      setIsLoading(false)
      setApiError(false)
      return true
    } catch (err) {
      console.error('Error initializing Google Places:', err)
      setApiError(true)
      setIsLoading(false)
      return false
    }
  }, [onAddressSelect])

  // Load Google Places script and initialize
  useEffect(() => {
    let mounted = true

    loadGooglePlacesScript()
      .then(() => {
        if (mounted) {
          initAutocomplete()
        }
      })
      .catch((err) => {
        console.warn('Google Places not available:', err.message)
        if (mounted) {
          setApiError(true)
          setIsLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [initAutocomplete])

  // Cleanup
  useEffect(() => {
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    onAddressChange?.(value)
  }

  // Base styles
  const baseStyles = `
    w-full px-4 py-3 border rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-[#8B6F47] focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
  `

  const errorStyles = error ? 'border-red-500 focus:ring-red-500' : 'border-[#d6ccc2]'

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        id={id}
        name={name}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder || t('checkout:addressPlaceholder', 'Ingresa tu dirección')}
        disabled={disabled || isLoading}
        required={required}
        autoComplete="off"
        className={`${baseStyles} ${errorStyles} ${className}`}
      />

      {/* Loading indicator */}
      {isLoading && !apiError && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-5 h-5 border-2 border-[#8B6F47] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* API error fallback message */}
      {apiError && (
        <p className="mt-1 text-xs text-amber-600">
          {t(
            'checkout:addressAutocompleteUnavailable',
            'El autocompletado no está disponible. Ingresa la dirección manualmente.'
          )}
        </p>
      )}
    </div>
  )
}

export default AddressAutocomplete
