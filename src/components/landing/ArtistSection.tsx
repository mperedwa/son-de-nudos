/**
 * ArtistSection Component
 *
 * El corazón de la marca - Storytelling sobre Priscilla Torres
 * Inspirado en Patricia Nash: herencia artesanal y historia del creador
 *
 * - Foto de Priscilla trabajando o con instrumento musical
 * - Narrativa sobre la transición de música a macramé
 * - Transmite que cada pieza tiene "musicalidad"
 */

export default function ArtistSection() {
  return (
    <section id="artista" className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Imagen - Placeholder */}
          <div className="relative order-2 lg:order-1">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-soft-hover">
              {/* Placeholder con gradiente - Reemplazar con foto real de Priscilla */}
              <div className="w-full h-full bg-gradient-to-br from-terracotta-light via-sand to-olive-light flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white/50 flex items-center justify-center">
                    <svg className="w-16 h-16 text-primary-brown/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <p className="text-primary-brown/70 text-sm font-sans">
                    Foto de Priscilla Torres
                  </p>
                </div>
              </div>
            </div>

            {/* Elemento decorativo */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 border-2 border-accent-gold/30 rounded-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-secondary-beige rounded-full -z-10" />
          </div>

          {/* Contenido */}
          <div className="order-1 lg:order-2">
            {/* Etiqueta */}
            <p className="text-sm tracking-[0.2em] uppercase text-accent-gold mb-4 font-sans">
              La Artista
            </p>

            {/* Título */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-primary-brown leading-tight mb-8">
              De las notas musicales
              <span className="block text-terracotta mt-2">
                a los nudos de macramé
              </span>
            </h2>

            {/* Historia */}
            <div className="space-y-6 text-text-light font-sans leading-relaxed">
              <p className="text-lg">
                <span className="font-medium text-primary-brown">Priscilla Torres</span> es una artista nata.
                Como flautista traversa, pianista y percusionista, su vida siempre ha estado marcada
                por el ritmo, la precisión y la disciplina que exige la música.
              </p>

              <p>
                Cuando buscaba nuevos horizontes creativos, descubrió en el macramé el lienzo perfecto
                para expresar su visión artística. Cada nudo que ata es como una nota en una partitura:
                preciso, intencional, parte de algo más grande.
              </p>

              <p>
                Su perfeccionismo musical se traduce en piezas que no solo se ven hermosas,
                sino que <span className="italic text-terracotta">fluyen con armonía</span>.
                Bolsos con movimiento, collares con cadencia, vestibles que danzan contigo.
              </p>

              {/* Quote destacado */}
              <blockquote className="border-l-4 border-accent-gold pl-6 py-2 my-8">
                <p className="text-xl font-serif text-primary-brown italic">
                  "En la música aprendí que cada detalle importa. En el macramé,
                  cada nudo cuenta la misma historia de dedicación."
                </p>
                <footer className="mt-3 text-sm text-text-light">
                  — Priscilla Torres, Fundadora
                </footer>
              </blockquote>
            </div>

            {/* Valores/Filosofía */}
            <div className="grid grid-cols-3 gap-4 mt-10 pt-10 border-t border-sand-dark">
              <div className="text-center">
                <p className="text-2xl lg:text-3xl font-serif text-accent-gold">100%</p>
                <p className="text-xs uppercase tracking-wider text-text-light mt-1">Hecho a Mano</p>
              </div>
              <div className="text-center">
                <p className="text-2xl lg:text-3xl font-serif text-accent-gold">+200</p>
                <p className="text-xs uppercase tracking-wider text-text-light mt-1">Piezas Creadas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl lg:text-3xl font-serif text-accent-gold">5+</p>
                <p className="text-xs uppercase tracking-wider text-text-light mt-1">Años de Arte</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
