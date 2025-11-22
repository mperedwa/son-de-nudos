import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AnnouncementBar from '@/components/AnnouncementBar'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CartDrawer from '@/components/CartDrawer'
import SearchDrawer from '@/components/SearchDrawer'
import { useUIStore } from '@/store/ui'

/**
 * Layout global del sitio
 * Envuelve todas las páginas con AnnouncementBar, Header, Footer y CartDrawer
 *
 * Fase 2 completada:
 * - AnnouncementBar con carrusel auto-rotativo
 * - Header con logo SVG, navegación, selector idioma y carrito
 * - Footer con links, newsletter y redes sociales
 *
 * Fase 5 en progreso:
 * - CartDrawer con atajo de teclado (Cmd/Ctrl + K)
 */
export default function RootLayout() {
  const { t, i18n } = useTranslation('common')
  const toggleCartDrawer = useUIStore((state) => state.toggleCartDrawer)

  // Actualizar título del documento según idioma
  useEffect(() => {
    document.title = t('siteTitle')
  }, [t, i18n.language])

  // Atajo de teclado para abrir carrito (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggleCartDrawer()
      }
    }

    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  }, [toggleCartDrawer])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Barra de anuncios rotativos */}
      <AnnouncementBar />

      {/* Header con navegación y carrito */}
      <Header />

      {/* Contenido principal de cada página */}
      <main className="flex-1 bg-gradient-to-br from-white to-[#FAF7F3]">
        <Outlet />
      </main>

      {/* Footer con links y redes */}
      <Footer />

      {/* Drawer del carrito (global) */}
      <CartDrawer />

      {/* Modal de búsqueda (global) */}
      <SearchDrawer />
    </div>
  )
}
