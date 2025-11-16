planning.md

1. Arquitectura general

1.1 Visión de alto nivel
	•	Aplicación SPA construida con Vite y React, escrita en TypeScript.
	•	Ruteo con React Router, estructura de rutas dentro de src/app/routes.
	•	Layout global en RootLayout.tsx con AnnouncementBar, Header y Footer.
	•	Estado global con Zustand para:
	•	Carrito (items, cupones, totales).
	•	UI (estado del CartDrawer, quizá otros drawers).

1.2 Módulos principales
	•	src/app/routes
	•	index.tsx: colección de collares con filtros, orden y paginación.
	•	product/[handle].tsx: detalle de producto con selección de variantes.
	•	checkout.tsx: flujo de checkout con resumen, datos de envío y opciones de pago.
	•	success.tsx, cancel.tsx: pantallas para resultados de Stripe.
	•	src/layout
	•	RootLayout.tsx: envuelve las rutas con AnnouncementBar, Header y Footer.
	•	src/components
	•	AnnouncementBar.tsx
	•	Header.tsx
	•	Breadcrumbs.tsx
	•	CollectionToolbar.tsx
	•	FiltersDrawer.tsx
	•	ProductGrid.tsx
	•	ProductCard.tsx
	•	Price.tsx
	•	AddToCartButton.tsx
	•	CartDrawer.tsx
	•	VariantSelector.tsx
	•	QuantityInput.tsx
	•	Seo.tsx
	•	src/store
	•	cart.ts: estado del carrito.
	•	ui.ts: estados de UI, por ejemplo si el CartDrawer está abierto.
	•	src/lib
	•	money.ts: formateo de moneda.
	•	filters.ts: aplicación de filtros y orden a la colección.
	•	api.ts: abstracción de acceso a datos, soporta modo mock, modo Stripe, modo Shopify.
	•	config.ts: flags de configuración (enableStripe, enableShopify, freeShippingThreshold, currency).
	•	data
	•	products.json: catálogo mock de 20 collares.
	•	server
	•	mockServer.ts: endpoints REST locales, por ejemplo /api/products, /api/collection/necklaces, /api/coupons, /api/shipping-estimate.
	•	funciones opcionales para Stripe, por ejemplo creación de sesiones de checkout y webhook simulado.

2. Modelo de datos y analítica

2.1 Modelos de dominio

type Money = { amount: number; currency: "USD" }

type Variant = {
  id: string
  title: string
  sku?: string
  price: Money
  compareAtPrice?: Money
  available: boolean
  options: Record<string, string>  // Por ejemplo { Largo: "16 in", Material: "Acero", Color: "Dorado" }
  stock?: number
  image?: string
}

type Product = {
  id: string
  handle: string
  title: string
  descriptionHtml: string
  images: string[]
  price: Money
  compareAtPrice?: Money
  options: string[]
  variants: Variant[]
  tags: string[]
  availableForSale: boolean
  createdAt: string
}

Carrito en Zustand:

type CartItem = {
  productId: string
  variantId: string
  title: string
  variantTitle: string
  qty: number
  unitPrice: Money
  image?: string
}

type CartState = {
  items: CartItem[]
  couponCode?: string
  discountAmount?: Money
  // acciones: addItem, removeItem, updateQty, applyCoupon, clear
}

2.2 Filtros, orden y paginación
	•	Filtros derivados de URLSearchParams:
	•	inStockOnly: boolean
	•	priceMin, priceMax: number
	•	materials: string[]
	•	colors: string[]
	•	lengths: string[]
	•	Orden:
	•	featured, best, az, za, priceAsc, priceDesc, dateAsc, dateDesc.
	•	Paginación:
	•	page y pageSize en query string, con lógica en cliente o en el mock server.

filters.ts será el módulo central para aplicar filtros, orden y paginación a un array de Product.

2.3 Analítica

En una primera fase, solo se preparan puntos de evento, para conectar después a una herramienta de analítica:
	•	view_collection: al mostrar la colección con filtros actuales.
	•	view_product: al abrir la página de detalle de producto.
	•	add_to_cart: al agregar un item al carrito.
	•	begin_checkout: al ir al checkout desde el carrito.
	•	complete_checkout: al recibir confirmación exitosa de pago (Stripe o Shopify).

Estos eventos se pueden implementar como llamadas a una función genérica logEvent en lib/analytics.ts.

3. Seguridad y permisos
	•	Roles:
	•	Usuario invitado: puede navegar, agregar al carrito y comprar.
	•	No se implementa panel de administración en MVP.
	•	Backend mock:
	•	Validar datos de cupones y cantidades.
	•	Limitar monto máximo por pedido si se considera necesario.
	•	Stripe:
	•	Use Stripe SDK solo en backend para creación de sesiones de checkout.
	•	Mantener STRIPE_SECRET_KEY en env del servidor.
	•	Shopify:
	•	Utilizar solamente Storefront API con token de acceso público.
	•	No exponer tokens de administración.
	•	General:
	•	Manejo cuidadoso de errores de red, mostrar mensajes amigables sin exponer información sensible.
	•	CORS configurado solo para el origen esperado en despliegues productivos.

4. UI, UX y Design System
	•	Layout
	•	AnnouncementBar fijo en la parte superior con carrusel de mensajes.
	•	Header bajo el anuncio, sticky en desktop cuando sea útil.
	•	Breadcrumbs sobre el título de la colección o producto.
	•	Contenido principal en un contenedor central max-w-7xl con padding horizontal.
	•	Footer con bloques de información organizados en columnas.
	•	Grid y tarjetas
	•	Grid responsiva: 2 columnas en móvil, 3 en md, 4 en lg, con gap-6.
	•	Tarjeta de producto con:
	•	Imagen cuadrada, object-cover.
	•	Hover image cuando exista segunda imagen.
	•	Título a 1 o 2 líneas con ellipsis.
	•	Precio y compareAtPrice si aplica.
	•	Botón “Agregar al carrito” o “Elegir opciones” según variantes.
	•	Filtros y toolbar
	•	CollectionToolbar con botón Filtros (solo visible en móvil) y select “Ordenar por”.
	•	FiltersDrawer como panel lateral en móvil, panel fijo o sidebar en desktop según diseño.
	•	Inputs de rango de precio con labels.
	•	Botón “Ver resultados” para aplicar filtros.
	•	Carrito
	•	Drawer lateral con role=“dialog”, atajo de teclado (por ejemplo tecla “c”).
	•	Listado de items, quantity steppers, eliminar elemento, aplicar cupón, subtotal, envío estimado y CTAs.
	•	Estilo visual
	•	Colores neutros, fondo blanco, texto negro o gris oscuro.
	•	Acentos discretos en botones y estados hover.
	•	Sombra suave y borde fino en tarjetas y drawers.
   
    ### Estilo visual aportado por el archivo de referencia

El proyecto debe adoptar un look cálido y artesanal basado en tonos tierra, siguiendo la estética transmitida por el archivo HTML de referencia.

**Paleta principal**  
- Marrón primario cercano a #8B6F47 para títulos y elementos clave.  
- Beige suave cercano a #F5E6D3 como base neutra y fondo.  
- Dorado apagado cercano a #D4A574 para detalles y acentos.  
- Texto en tonos café oscuro y café claro para una presentación cálida.  
- Fondos blancos o crema con degradados sutiles que aportan suavidad.

**Tipografía y atmósfera**  
- Jerarquía clara con estilo elegante y artesanal.  
- Uso de colores cálidos coherentes con la identidad de marca.  
- Espaciado generoso para un diseño limpio y respirado.

**Superficies y componentes**  
- Tarjetas con bordes suaves y sombras ligeras.  
- Botones tierra con estados hover dorados.  
- Iconos simples en colores neutros.  

Este estilo debe guiar el diseño de todos los componentes, desde tarjetas de producto hasta botones, modales y drawer del carrito.

5. Integraciones y roadmap
	•	Stripe Checkout
	•	Endpoint backend para crear sesión de checkout desde el contenido del carrito.
	•	Redirección desde frontend a url devuelta por Stripe.
	•	Rutas /success y /cancel para respuestas.
	•	Shopify Storefront API
	•	Modo alternativo donde los productos se cargan desde Storefront en lugar de products.json.
	•	Mapeo de datos de Shopify a modelo Product.
	•	Uso de cart remoto de Shopify con checkoutUrl.
	•	Roadmap futuro
	•	Integración con email marketing para newsletter.
	•	Sistema de cuentas de usuario y wishlist.
	•	Panel básico de administración.
	•	Analítica avanzada con panel de métricas.

6. Calidad, observabilidad y DevEx
	•	Pruebas
	•	Jest o Vitest con Testing Library para React.
	•	Pruebas unitarias obligatorias para:
	•	money.ts: formateo y operaciones simples.
	•	filters.ts: combinaciones de filtros y orden.
	•	CI/CD
	•	Pipeline de CI con:
	•	Instalación de dependencias.
	•	Lint y formateo.
	•	Pruebas.
	•	Despliegue automático a entorno estático (por ejemplo Netlify o Vercel) cuando la rama principal está verde.
	•	Convenciones
	•	Estructura clara de carpetas por dominio.
	•	Uso de alias de import para rutas comunes cuando sea útil.
	•	README con instrucciones para modo mock, Stripe y Shopify.

⸻

