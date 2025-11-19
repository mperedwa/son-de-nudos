/**
 * LandingPage - Página principal de Son de Nudos
 *
 * Fusión de estilos:
 * - Elsie in Naples: Limpieza visual, espacio en blanco, elegancia
 * - Patricia Nash: Herencia artesanal, historia del creador
 *
 * Secciones:
 * 1. Hero - Impacto visual con CTA
 * 2. Artista - Storytelling de Priscilla Torres
 * 3. Categorías - Grid elegante de productos
 * 4. Instagram - Social proof y lifestyle
 * 5. Newsletter - Invitación a la comunidad
 *
 * Mobile-First design
 */

import HeroSection from '@/components/landing/HeroSection'
import ArtistSection from '@/components/landing/ArtistSection'
import CategoriesSection from '@/components/landing/CategoriesSection'
import InstagramSection from '@/components/landing/InstagramSection'
import NewsletterSection from '@/components/landing/NewsletterSection'

export default function LandingPage() {
  return (
    <main className="overflow-hidden">
      {/* Hero - Impacto visual inicial */}
      <HeroSection />

      {/* La Artista - Corazón de la marca */}
      <ArtistSection />

      {/* Categorías - Escaparate de productos */}
      <CategoriesSection />

      {/* Instagram - Social proof */}
      <InstagramSection />

      {/* Newsletter - Comunidad */}
      <NewsletterSection />
    </main>
  )
}
