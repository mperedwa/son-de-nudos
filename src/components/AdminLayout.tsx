import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

// ============================================================================
// TIPOS
// ============================================================================

interface NavItem {
  name: string
  path: string
  icon: string
}

// ============================================================================
// NAVEGACIÓN
// ============================================================================

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
  { name: 'Mi Perfil', path: '/admin/profile', icon: '👤' },
  { name: 'Productos', path: '/admin/products', icon: '📦' },
  { name: 'Pedidos', path: '/admin/orders', icon: '🛒' },
  { name: 'Cupones', path: '/admin/coupons', icon: '🎫' },
  { name: 'Inventario', path: '/admin/inventory', icon: '📋' },
  { name: 'Configuración', path: '/admin/settings', icon: '⚙️' },
]

// ============================================================================
// COMPONENTE ADMIN LAYOUT
// ============================================================================

export function AdminLayout() {
  const navigate = useNavigate()
  const { adminData, logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="min-h-screen bg-[#F5E6D3]">
      {/* Overlay para móvil cuando sidebar está abierto */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-30
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#D4A574]/20">
          <h1 className="text-xl font-semibold text-[#8B6F47]">
            Son de Nudos
          </h1>
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-[#8B6F47] hover:text-[#D4A574]"
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        {/* Navegación */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-[#8B6F47] to-[#D4A574] text-white shadow-md'
                      : 'text-[#6B5844] hover:bg-[#F5E6D3] hover:text-[#8B6F47]'
                  }
                `
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer del sidebar con versión */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#D4A574]/20">
          <p className="text-xs text-[#6B5844]/60 text-center">
            Panel Admin v1.0
          </p>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm border-b border-[#D4A574]/20 sticky top-0 z-10">
          <div className="h-full px-4 flex items-center justify-between">
            {/* Botón menú móvil */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg text-[#8B6F47] hover:bg-[#F5E6D3]"
              aria-label="Abrir menú"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Título en móvil */}
            <h2 className="lg:hidden text-lg font-semibold text-[#8B6F47]">
              Panel Admin
            </h2>

            {/* Espacio flex para empujar el perfil a la derecha */}
            <div className="flex-1 lg:block hidden" />

            {/* Usuario y logout */}
            <div className="flex items-center gap-4">
              {adminData && (
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-[#8B6F47]">
                    {adminData.name}
                  </p>
                  <p className="text-xs text-[#6B5844]/60 capitalize">
                    {adminData.role}
                  </p>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="
                  px-4 py-2 rounded-lg font-medium text-sm
                  bg-gradient-to-r from-[#8B6F47] to-[#D4A574]
                  text-white hover:from-[#6B5844] hover:to-[#8B6F47]
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:ring-offset-2
                "
              >
                Salir
              </button>
            </div>
          </div>
        </header>

        {/* Contenido de la página */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
