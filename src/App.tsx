import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RootLayout from './app/layout/RootLayout'
import LandingPage from './app/routes/landing'
import CollectionPage from './app/routes/index'
import ProductPage from './app/routes/product/[handle]'
import CheckoutPage from './app/routes/checkout'
import SuccessPage from './app/routes/success'
import CancelPage from './app/routes/cancel'
import ReturnPolicyPage from './app/routes/politicas/devoluciones'
import CollectionsIndexPage from './app/routes/colecciones/index'
import CollectionDetailPage from './app/routes/colecciones/[handle]'

// Admin imports
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLayout } from './components/AdminLayout'
import AdminLogin from './app/routes/admin/login'
import AdminDashboard from './app/routes/admin/dashboard'
import AdminProfile from './app/routes/admin/profile'
import AdminProducts from './app/routes/admin/products'
import AdminInventory from './app/routes/admin/inventory'
import AdminCoupons from './app/routes/admin/coupons'
import AdminOrders from './app/routes/admin/orders'
import AdminSettings from './app/routes/admin/settings'
import AdminCollections from './app/routes/admin/collections'

/**
 * Configuración principal de rutas
 * Usa React Router v6 con layout compartido
 *
 * Estructura:
 * - / → Landing Page (Home)
 * - /tienda → Colección de productos
 * - /admin/login → Login público
 * - /admin/* → Panel admin protegido (AdminLayout)
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas de la tienda */}
        <Route path="/" element={<RootLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="tienda" element={<CollectionPage />} />
          <Route path="product/:handle" element={<ProductPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="success" element={<SuccessPage />} />
          <Route path="cancel" element={<CancelPage />} />
          <Route path="politicas/devoluciones" element={<ReturnPolicyPage />} />
          <Route path="colecciones" element={<CollectionsIndexPage />} />
          <Route path="colecciones/:handle" element={<CollectionDetailPage />} />
        </Route>

        {/* Login del admin (público) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Panel de administración (protegido) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="collections" element={<AdminCollections />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
