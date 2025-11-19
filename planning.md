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
	•	✅ Panel básico de administración (Fase 11 - EN DESARROLLO).
	•	Analítica avanzada con panel de métricas.

5.1 Fase 11: Panel de Administración con Supabase ✅ PARCIALMENTE COMPLETADO (54%)

**Estado de Implementación:**

✅ **Backend Completo:**
	•	Supabase PostgreSQL: 7 tablas + triggers + RLS configurados
	•	Supabase Auth: Sistema de autenticación de admins funcional
	•	Supabase Storage: Bucket `product-images` con RLS policies activas
	•	Migraciones aplicadas: 20 productos + 67 variantes migrados exitosamente

✅ **Autenticación y Seguridad:**
	•	Login de administradores (/admin/login)
	•	Protección de rutas con ProtectedRoute
	•	Hook useAuth() con verificación de rol admin
	•	RLS activo en todas las tablas
	•	Persistencia de sesión

✅ **Panel de Administración Base:**
	•	AdminLayout con sidebar responsive (7 secciones navegables)
	•	Dashboard con métricas en tiempo real (productos, pedidos, ingresos)
	•	Página de perfil (/admin/profile) con cambio de contraseña seguro

✅ **CRUD de Productos COMPLETO:**
	•	Listar productos: búsqueda por título/handle, filtro por disponibilidad
	•	Crear productos con validación completa (React Hook Form + Zod)
	•	Editar productos existentes con prellenado
	•	Clonar productos (duplicar con sufijo)
	•	Eliminar productos con confirmación y cleanup de Storage
	•	MultiImageUploader integrado (hasta 4 imágenes por producto):
		- Drag & drop de archivos
		- Reordenamiento visual con botones ▲/▼
		- Preview en tiempo real
		- Badge "Principal" en primera imagen
		- Validación de tipo (JPG/PNG/WebP) y tamaño (max 5MB)
		- Progress bar durante upload múltiple
		- Cleanup en errores

✅ **CRUD de Variantes COMPLETO:**
	•	Gestión anidada dentro de productos (tabla expandible)
	•	Crear, editar, clonar y eliminar variantes
	•	Campos completos: title, sku (único), price, compare_at_price, stock, available
	•	Opciones dinámicas en JSONB (Largo, Material, Color)
	•	ImageUploader individual por variante (opcional):
		- Drag & drop single file
		- Preview de imagen actual
		- Estados de loading y error
		- Reemplazo con cleanup automático
	•	Validación: SKU único (regex: A-Z0-9-), stock numérico entero

✅ **Sistema de Storage (Supabase):**
	•	Bucket público `product-images` configurado
	•	Estructura: products/{handle}/ y variants/{sku}/
	•	Helpers en lib/storage.ts:
		- uploadImage(): upload con nombres UUID
		- deleteImage(): eliminación por URL
		- deleteFolder(): batch delete de carpetas
		- validateImageFile(): validación client-side
	•	RLS Policies:
		- Lectura pública (todos pueden ver imágenes)
		- Escritura solo para usuarios autenticados (admins)
	•	Cleanup automático: al eliminar productos/variantes se eliminan sus imágenes
	•	URLs públicas con CDN de Supabase

✅ **Completados del Hito 11:**
	•	Gestión de Inventario (/admin/inventory) - 520 líneas
	•	Real-time updates de stock con subscripciones
	•	CRUD de Cupones (crear, editar, listar, activar/desactivar) - 537 líneas
	•	Vista de Pedidos (tabla con filtros, detalle individual) - 580 líneas
	•	Detalle de pedido con timeline de estados - 320 líneas

⏳ **Pendientes del Hito 11:**
	•	Configuración de envío (/admin/settings)
	•	Webhook de Stripe para guardar pedidos en orders
	•	Histórico de cambios de stock (stock_history)
	•	Tests E2E del admin panel

**Componentes Implementados:**
	•	src/app/routes/admin/products.tsx (1053 líneas) - CRUD completo
	•	src/app/routes/admin/orders.tsx (580 líneas) - Gestión de pedidos
	•	src/app/routes/admin/coupons.tsx (537 líneas) - CRUD de cupones
	•	src/app/routes/admin/inventory.tsx (520 líneas) - Control de inventario
	•	src/app/routes/admin/profile.tsx (321 líneas) - Perfil y contraseña
	•	src/components/admin/OrderDetailModal.tsx (320 líneas) - Detalle de pedido
	•	src/components/admin/MultiImageUploader.tsx (326 líneas) - Gallery uploader
	•	src/components/admin/ImageUploader.tsx (288 líneas) - Single image uploader
	•	src/components/admin/OrderStatusBadge.tsx (110 líneas) - Badge de estado
	•	src/lib/storage.ts (227 líneas) - Storage helpers

**Migraciones SQL:**
	•	supabase/migrations/20251116000000_initial_schema.sql - Schema completo
	•	supabase/migrations/20251117000000_setup_storage.sql - Storage bucket + policies

**Arquitectura de Base de Datos:**

7 tablas principales:
	1.	products: Productos (collares) con datos base
	•	id, handle, title, description_html, images[], price, compare_at_price
	•	tags[], available_for_sale, created_at, updated_at
	2.	variants: Variantes con opciones (Largo, Material, Color)
	•	id, product_id, title, sku, price, compare_at_price
	•	available, stock, options (JSONB), image
	3.	coupons: Cupones dinámicos con validación
	•	id, code, percent, min_amount, max_uses, current_uses
	•	valid_from, valid_until, active
	4.	orders: Pedidos guardados desde Stripe webhook
	•	id, stripe_session_id, customer_email, customer_name
	•	shipping_address (JSONB), items (JSONB)
	•	subtotal, discount, shipping, total, status
	5.	admins: Usuarios administradores
	•	id, email, password_hash, name, role
	•	active, last_login_at
	6.	shipping_config: Configuración de envío editable
	•	id, standard_cost, free_shipping_threshold, currency
	7.	stock_history: Histórico de movimientos de inventario
	•	id, variant_id, change, reason, previous_stock, new_stock
	•	admin_id, created_at

**Funcionalidades Triggers:**
	•	updated_at automático en todas las tablas
	•	Log automático de cambios de stock

**Row Level Security (RLS):**
	•	Productos y variantes: Lectura pública, escritura solo admins
	•	Cupones: Lectura pública (solo activos), escritura solo admins
	•	Pedidos: Solo admins
	•	Shipping config: Lectura pública, escritura solo admins
	•	Storage: Lectura pública, upload/update/delete solo admins

**Cliente Supabase (src/lib/supabase.ts):**
	•	Cliente TypeScript con tipos auto-generados
	•	Helpers: isAuthenticated(), getCurrentUser(), signOut()
	•	Real-time subscriptions (preparados):
		- subscribeToStockChanges(variantId, callback)
		- subscribeToNewOrders(callback)

**Migración de Datos:**
	•	Script TypeScript (scripts/migrate-to-supabase.ts)
	•	Lee products.json actual
	•	Transforma a formato Supabase
	•	Insertados: 20 productos + 67 variantes con stock inicial

**Rutas Admin Implementadas:**
	•	/admin/login - Autenticación con Supabase Auth ✅
	•	/admin/dashboard - Dashboard con métricas ✅
	•	/admin/profile - Perfil y cambio de contraseña ✅
	•	/admin/products - CRUD de productos y variantes ✅
	•	/admin/orders - Gestión de pedidos (580 líneas) ✅
	•	/admin/coupons - Gestión de cupones (537 líneas) ✅
	•	/admin/inventory - Control de inventario (520 líneas) ✅
	•	/admin/settings - Configuración de envío ⏳

**Costo:** $0/mes (tier gratuito Supabase: 500MB database, 1GB storage, 2GB bandwidth)

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

