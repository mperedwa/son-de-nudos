import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RootLayout from './app/layout/RootLayout'
import CollectionPage from './app/routes/index'
import ProductPage from './app/routes/product/[handle]'
import CheckoutPage from './app/routes/checkout'
import SuccessPage from './app/routes/success'
import CancelPage from './app/routes/cancel'

/**
 * Configuración principal de rutas
 * Usa React Router v6 con layout compartido
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<CollectionPage />} />
          <Route path="product/:handle" element={<ProductPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="success" element={<SuccessPage />} />
          <Route path="cancel" element={<CancelPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
