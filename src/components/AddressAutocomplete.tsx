/**
 * AddressAutocomplete - Google Places Autocomplete component (NEW API)
 *
 * Uses the new PlaceAutocompleteElement Web Component (replacing deprecated Autocomplete).
 * Extracts structured address data including country code for zone detection.
 *
 * @see https://developers.google.com/maps/documentation/javascript/place-autocomplete-element
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

// Google Places API key from Vite env
const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string | undefined

// Track if script is loading to avoid multiple loads
let scriptLoadingPromise: Promise<void> | null = null

/**
 * Load Google Places script dynamically with the new async loading
 */
function loadGooglePlacesScript(): Promise<void> {
  // If already loaded, resolve immediately
  if (window.google?.maps?.places?.PlaceAutocompleteElement) {
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
    // Updated URL with loading=async for the new API
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places&loading=async`
    script.async = true
    script.defer = true

    script.onload = () => {
      console.log('[Google Places] Script loaded successfully (PlaceAutocompleteElement)')
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
 * Extract address data from the new Place object's addressComponents
 * Note: New API uses shortText/longText instead of short_name/long_name
 */
function extractAddressDataFromPlace(
  place: google.maps.places.Place
): AddressData {
  const components = place.addressComponents || []

  const getComponent = (type: string, useShortName = false): string => {
    const component = components.find((c) => c.types.includes(type))
    if (!component) return ''
    return useShortName ? (component.shortText || '') : (component.longText || '')
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
    formattedAddress: place.formattedAddress || '',
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

// Custom event interface for gmp-placeselect
interface PlaceSelectEvent extends Event {
  place: google.maps.places.Place
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
  required = false
}: AddressAutocompleteProps) {
  const { t } = useTranslation(['checkout'])
  // Separate ref for the web component container (outside React's control)
  const webComponentContainerRef = useRef<HTMLDivElement>(null)
  const autocompleteElementRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(null)
  const [inputValue, setInputValue] = useState(defaultValue)
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState(false)
  const [isReady, setIsReady] = useState(false)

  // Stable references for callbacks
  const onAddressSelectRef = useRef(onAddressSelect)
  const onAddressChangeRef = useRef(onAddressChange)

  useEffect(() => {
    onAddressSelectRef.current = onAddressSelect
    onAddressChangeRef.current = onAddressChange
  }, [onAddressSelect, onAddressChange])

  // Initialize Google Places Autocomplete with the new PlaceAutocompleteElement
  const initAutocomplete = useCallback(async () => {
    if (!webComponentContainerRef.current || !window.google?.maps?.places?.PlaceAutocompleteElement) {
      return false
    }

    // Prevent double initialization
    if (autocompleteElementRef.current) {
      return true
    }

    try {
      // Create the new PlaceAutocompleteElement
      const placeAutocomplete = new window.google.maps.places.PlaceAutocompleteElement({
        // Configure for address input
        componentRestrictions: undefined, // Allow all countries
      })

      // Set ID for styling
      placeAutocomplete.id = 'address-autocomplete-input'

      // Store reference
      autocompleteElementRef.current = placeAutocomplete

      // Append to the container (don't clear - it's empty by design)
      webComponentContainerRef.current.appendChild(placeAutocomplete)

      // Set default value if provided
      if (defaultValue) {
        // The input inside the web component needs to be accessed after it's rendered
        setTimeout(() => {
          const input = placeAutocomplete.querySelector('input')
          if (input) {
            input.value = defaultValue
          }
        }, 100)
      }

      // Listen for place selection with the new event
      placeAutocomplete.addEventListener('gmp-placeselect', async (event) => {
        const placeEvent = event as PlaceSelectEvent
        const place = placeEvent.place

        if (!place) {
          return
        }

        try {
          // Fetch the address components (new API requires explicit fetch)
          await place.fetchFields({ fields: ['addressComponents', 'formattedAddress'] })

          const addressData = extractAddressDataFromPlace(place)

          setInputValue(place.formattedAddress || '')
          onAddressSelectRef.current(addressData)
          onAddressChangeRef.current?.(place.formattedAddress || '')
        } catch (fetchError) {
          console.error('Error fetching place details:', fetchError)
        }
      })

      // Listen for input changes (if the event exists)
      const handleInput = () => {
        const input = placeAutocomplete.querySelector('input')
        if (input) {
          setInputValue(input.value)
          onAddressChangeRef.current?.(input.value)
        }
      }

      // Try both possible event names
      placeAutocomplete.addEventListener('gmp-input', handleInput)
      placeAutocomplete.addEventListener('input', handleInput)

      setIsLoading(false)
      setApiError(false)
      setIsReady(true)
      return true
    } catch (err) {
      console.error('Error initializing Google Places:', err)
      setApiError(true)
      setIsLoading(false)
      return false
    }
  }, [defaultValue]) // Only depend on defaultValue

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
      // Clean up the web component on unmount
      if (autocompleteElementRef.current && webComponentContainerRef.current) {
        try {
          webComponentContainerRef.current.removeChild(autocompleteElementRef.current)
        } catch {
          // Ignore if already removed
        }
        autocompleteElementRef.current = null
      }
    }
  }, [initAutocomplete])

  // Apply styles based on error state
  const containerStyles = `
    address-autocomplete-container
    ${error ? 'address-autocomplete-error' : ''}
    ${disabled ? 'address-autocomplete-disabled' : ''}
    ${className}
  `.trim()

  // Show fallback input only when API has error (not during loading if ready)
  const showFallback = apiError || (isLoading && !isReady)
  const showWebComponent = !apiError

  return (
    <div className="relative">
      {/* Container for the PlaceAutocompleteElement web component */}
      {/* This div is intentionally empty - React doesn't control its children */}
      <div
        ref={webComponentContainerRef}
        id={id}
        className={containerStyles}
        data-required={required}
        aria-label={placeholder || t('checkout:addressPlaceholder', 'Ingresa tu dirección')}
        style={{ display: showWebComponent ? 'block' : 'none' }}
      />

      {/* Fallback input shown only on error */}
      {showFallback && (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            onAddressChange?.(e.target.value)
          }}
          placeholder={placeholder || t('checkout:addressPlaceholder', 'Ingresa tu dirección')}
          disabled={disabled || (isLoading && !apiError)}
          required={required}
          className="address-autocomplete-fallback-input"
        />
      )}

      {/* Loading indicator */}
      {isLoading && !apiError && !isReady && (
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
