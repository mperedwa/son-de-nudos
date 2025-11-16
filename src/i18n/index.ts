/**
 * Configuración de i18n (Internacionalización)
 * Fase 8: Sistema bilingüe con detección automática de idioma
 *
 * Soporta:
 * - Español (es)
 * - Inglés (en) - idioma por defecto
 *
 * Features:
 * - Detección automática del idioma del navegador
 * - Persistencia en localStorage
 * - Fallback a inglés si el idioma no está soportado
 * - Namespaces organizados por categoría
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Importar traducciones en español
import esCommon from './locales/es/common.json'
import esNavigation from './locales/es/navigation.json'
import esProduct from './locales/es/product.json'
import esCart from './locales/es/cart.json'
import esCheckout from './locales/es/checkout.json'
import esMessages from './locales/es/messages.json'
import esAnnouncements from './locales/es/announcements.json'
import esFilters from './locales/es/filters.json'

// Importar traducciones en inglés
import enCommon from './locales/en/common.json'
import enNavigation from './locales/en/navigation.json'
import enProduct from './locales/en/product.json'
import enCart from './locales/en/cart.json'
import enCheckout from './locales/en/checkout.json'
import enMessages from './locales/en/messages.json'
import enAnnouncements from './locales/en/announcements.json'
import enFilters from './locales/en/filters.json'

// Recursos de traducción organizados por idioma y namespace
const resources = {
  es: {
    common: esCommon,
    navigation: esNavigation,
    product: esProduct,
    cart: esCart,
    checkout: esCheckout,
    messages: esMessages,
    announcements: esAnnouncements,
    filters: esFilters,
  },
  en: {
    common: enCommon,
    navigation: enNavigation,
    product: enProduct,
    cart: enCart,
    checkout: enCheckout,
    messages: enMessages,
    announcements: enAnnouncements,
    filters: enFilters,
  },
} as const

// Configuración de i18next
i18n
  // Detector de idioma del navegador
  .use(LanguageDetector)
  // Plugin de React
  .use(initReactI18next)
  // Inicializar con configuración
  .init({
    resources,

    // Idioma por defecto: inglés (como solicitado)
    fallbackLng: 'en',

    // Idiomas soportados
    supportedLngs: ['es', 'en'],

    // Namespace por defecto
    defaultNS: 'common',

    // Namespaces disponibles
    ns: ['common', 'navigation', 'product', 'cart', 'checkout', 'messages', 'announcements', 'filters'],

    // Opciones del detector de idioma
    detection: {
      // Orden de detección:
      // 1. localStorage (para recordar preferencia del usuario)
      // 2. navigator (idioma del navegador)
      // 3. htmlTag (atributo lang del HTML)
      order: ['localStorage', 'navigator', 'htmlTag'],

      // Guardar en localStorage con esta clave
      lookupLocalStorage: 'i18nextLng',

      // Guardar idioma seleccionado en localStorage
      caches: ['localStorage'],

      // Excluir idiomas con región (ej: en-US → en)
      convertDetectedLanguage: (lng: string) => lng.split('-')[0],
    },

    // Interpolación
    interpolation: {
      // React ya escapa por defecto
      escapeValue: false,
    },

    // Modo de desarrollo
    debug: import.meta.env.DEV,

    // Cargar recursos de forma síncrona
    initImmediate: false,

    // React options
    react: {
      // Usar Suspense para cargar traducciones
      useSuspense: true,
    },
  })

export default i18n
