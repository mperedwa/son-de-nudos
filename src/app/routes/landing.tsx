/**
 * LandingPage - Página principal de Son de Nudos
 *
 * Diseño fusionado:
 * - Gemini: Tipografía Playfair/Lato, paleta vibrante, imágenes reales
 * - Original: i18n bilingüe, componentes React modulares
 *
 * Secciones:
 * 1. Hero - Imagen de fondo con overlay
 * 2. Value Props - Propuestas de valor con iconos
 * 3. Artista - Storytelling de Priscilla con cita flotante
 * 4. Categorías - Grid con imágenes reales
 * 5. Featured - Pieza destacada con fondo oscuro
 * 6. Instagram - Feed con imágenes reales
 * 7. Newsletter - Suscripción estilo Gemini
 *
 * Mobile-First design
 */

import HeroSection from '@/components/landing/HeroSection'
import ValuePropsSection from '@/components/landing/ValuePropsSection'
import ArtistSection from '@/components/landing/ArtistSection'
import CategoriesSection from '@/components/landing/CategoriesSection'
import FeaturedPieceSection from '@/components/landing/FeaturedPieceSection'
import InstagramSection from '@/components/landing/InstagramSection'

export default function LandingPage() {
  return (
    <main className="overflow-hidden">
      {/* Hero - Impacto visual con imagen de fondo */}
      <HeroSection />

      {/* Value Props - Propuestas de valor */}
      <ValuePropsSection />

      {/* La Artista - Corazón de la marca */}
      <ArtistSection />

      {/* Categorías - Escaparate con imágenes */}
      <CategoriesSection />

      {/* Featured - Pieza destacada */}
      <FeaturedPieceSection />

      {/* Instagram - Social proof */}
      <InstagramSection />
    </main>
  )
}
