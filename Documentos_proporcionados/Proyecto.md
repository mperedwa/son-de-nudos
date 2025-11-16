
Prompt 1

Estructura UX, UI y layout
	1.	Encabezado

	•	Barra de anuncios en carrusel, 1 sola línea por slide, altura baja, tipografía pequeña. Ejemplos de mensajes: envío gratis sobre $150, 10 por ciento de descuento con WELCOME10, Shop Pay en 4 cuotas, pickup local.  ￼
	•	Navbar con logo centrado o alineado a la izquierda, mega menú por categorías [Shop, About], subcategorías para Apparel, Jewelry [Necklaces, Earrings, Bracelets, Rings], Accessories. Selector de moneda o país a la derecha.  ￼

	2.	Breadcrumb y título de colección

	•	Breadcrumb Home, Shop, Necklaces. Título H1: Necklaces. Contador de productos a la vista, por ejemplo 104 products.  ￼

	3.	Filtros y orden

	•	Panel de filtros colapsable en móviles y sticky en desktop o arriba del grid.
	•	Filtros mínimos: Availability [In stock only], Price [min, max].
	•	Orden: Featured, Best selling, A–Z, Z–A, Price low to high, Price high to low, Date old to new, Date new to old.  ￼

	4.	Grid de productos

	•	Tarjetas en 2 columnas en móvil, 3 en tablet, 4 en desktop.
	•	Cada tarjeta: imagen principal, opcional hover para mostrar la segunda imagen, título del producto, precio, botón Add to cart o Choose options si tiene variantes.  ￼
	•	Precios en el rango visto, por ejemplo 129 a 598, útil para setear ejemplos y tests.  ￼

	5.	Pie de página

	•	Info de políticas, suscripción a newsletter, redes, y notas de plataforma [ejemplo Shopify].  ￼

Componentes sugeridos [React + Tailwind]
	•	<AnnouncementBar slides=[...]> carrusel auto-play, pausa on hover.
	•	<SiteHeader> con <Logo>, <MegaMenu>, <CurrencySelector>, <CartIcon>.
	•	<Breadcrumb items=[{label, href}] />
	•	<CollectionHeader title="Necklaces" count={104} />
	•	<CollectionToolbar> con <FilterDrawer> y <SortSelect>.
	•	<ProductGrid products={[...]}>
	•	<ProductCard> con imagen hover, título, precio, CTA.
	•	<Pagination> o <InfiniteScroll>
	•	<SiteFooter>

Esquema de datos mínimo

type Money = { amount: number, currency: 'USD' }
type Variant = { id: string, title: string, price: Money, available: boolean }
type Product = {
  id: string
  handle: string
  title: string
  images: string[]   // [principal, secundaria para hover]
  price: Money
  compareAtPrice?: Money
  inStock: boolean
  hasOptions: boolean
  variants?: Variant[]
  tags?: string[]
}

Lógica de filtros y orden
	•	State: filters = { inStockOnly: boolean, priceMin?: number, priceMax?: number }
	•	Orden: sort = 'featured' | 'best' | 'az' | 'za' | 'priceAsc' | 'priceDesc' | 'dateAsc' | 'dateDesc'
	•	Derivación: filtra en memoria o via API query params, por ejemplo ?sort=priceAsc&inStock=1&min=100&max=300.
	•	Accesibilidad: inputs de precio con labels visibles, botón View results para aplicar.  ￼

UI details clave para el “look”
	•	Tipografía limpia tipo sans, contraste medio, mucho espacio en blanco.
	•	Títulos de producto en una o dos líneas, corte con ellipsis.
	•	Botón Add to cart visible bajo el precio, cambia a Choose options cuando hay variantes.  ￼
	•	Hover en tarjeta: cambia a segunda imagen, eleva con sombra suave, cursor pointer.
	•	Grid responsivo con grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6.
	•	Toolbar con justify-between y filtros colapsables en móvil.

JSX de referencia

export default function CollectionPage({ products, total }) {
  return (
    <div>
      <AnnouncementBar slides={slides} />
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Shop', href: '/collections' },
          { label: 'Necklaces', href: '/collections/necklaces' }
        ]} />
        <header className="mb-6">
          <h1 className="text-3xl font-semibold">Necklaces</h1>
          <p className="text-sm text-neutral-600">{total} products</p>
        </header>

        <CollectionToolbar
          onOpenFilters={() => setOpen(true)}
          sort={sort}
          onSortChange={setSort}
        />

        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </section>

        <Pagination currentPage={page} totalPages={pages} />
      </main>
      <Footer />
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  return (
    <a href={`/products/${product.handle}`} className="group block">
      <div className="aspect-square overflow-hidden rounded-md border">
        <img
          src={product.images[0]}
          alt={product.title}
          className="h-full w-full object-cover transition group-hover:opacity-0"
          loading="lazy"
        />
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt={product.title}
            className="h-full w-full object-cover absolute inset-0 opacity-0 transition group-hover:opacity-100"
            loading="lazy"
          />
        )}
      </div>
      <h3 className="mt-3 text-sm">{product.title}</h3>
      <div className="mt-1 text-sm font-medium">
        ${product.price.amount.toFixed(2)}
        {product.compareAtPrice && (
          <span className="ml-2 line-through text-neutral-500">
            ${product.compareAtPrice.amount.toFixed(2)}
          </span>
        )}
      </div>
      <button
        className="mt-2 w-full border rounded-md py-2 text-sm hover:bg-black hover:text-white transition"
        aria-label={product.hasOptions ? 'Choose options' : 'Add to cart'}
      >
        {product.hasOptions ? 'Choose options' : 'Add to cart'}
      </button>
    </a>
  )
}

Filtros y sort, referencia rápida

function CollectionToolbar({ sort, onSortChange, onOpenFilters }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <button className="md:hidden border rounded-md px-4 py-2" onClick={onOpenFilters}>
        Filter
      </button>
      <div className="ml-auto">
        <label className="sr-only">Sort by</label>
        <select
          value={sort}
          onChange={e => onSortChange(e.target.value)}
          className="border rounded-md px-3 py-2"
        >
          <option value="featured">Featured</option>
          <option value="best">Best selling</option>
          <option value="az">Alphabetically, A to Z</option>
          <option value="za">Alphabetically, Z to A</option>
          <option value="priceAsc">Price, low to high</option>
          <option value="priceDesc">Price, high to low</option>
          <option value="dateAsc">Date, old to new</option>
          <option value="dateDesc">Date, new to old</option>
        </select>
      </div>
    </div>
  )
}

Accesibilidad y rendimiento
	•	Imágenes loading="lazy", atributos alt descriptivos.
	•	Botones y selects con label o aria-label.
	•	Tamaños de imagen cuadrados para consistencia, object-fit: cover.
	•	LCP: prioriza la primera fila con imágenes precargadas en desktop si es necesario.

Estilos que evocan el sitio
	•	Tonos neutros, blanco y negro, acentos dorados opcionales en hover o contornos, espacios generosos.
	•	Títulos con peso medio, copy reducido, foco en fotografía del producto.
	•	Llamados de acción claros: Add to cart, Choose options.  ￼

Siguiente paso con Claude Code
	•	Pide a Claude que te genere los componentes de arriba con Tailwind y un mock de 12 productos usando el esquema Product.
	•	Luego integra tu backend [por ejemplo, JSON local o API], mapea filtros a query params y agrega InfiniteScroll o Pagination.
	•	Si usarás Shopify, puedes consumir Storefront API y mapear availableForSale, priceRange.minVariantPrice, collections, y sortKey a tus estados de filters y sort.

Segunda parte:
Prompt 2
⸻

Prompt para Claude Code

Quiero que generes un proyecto web tipo ecommerce para collares, con interfaz moderna y minimalista, en español, listo para mostrar y comprar. Pila técnica: Vite + React + TypeScript + TailwindCSS. Estado: Zustand. Ruteo: React Router. Pagos: integración opcional con Stripe Checkout y alternativa con Shopify Storefront API. Soporte de variantes, inventario, carrito, cupones, envío y pickup local. No uses librerías UI pesadas. Componentes accesibles con aria labels y atajos de teclado en el carrito.

Estructura general del proyecto
	•	src
	•	app
	•	routes
	•	index.tsx, colección de collares con filtros y orden
	•	product, [handle].tsx, detalle de producto con selección de variantes
	•	checkout.tsx, flujo de checkout
	•	success.tsx y cancel.tsx, pantallas de Stripe
	•	layout
	•	RootLayout.tsx, header, anuncio superior con mensajes rotativos, footer
	•	components
	•	AnnouncementBar.tsx
	•	Header.tsx, Logo, Nav, CurrencySelector simulado, CartButton
	•	Breadcrumbs.tsx
	•	CollectionToolbar.tsx, botones para Filtros y selector de Orden
	•	FiltersDrawer.tsx, filtros de Disponibilidad, Precio min y max, Material, Color, Largo
	•	ProductGrid.tsx
	•	ProductCard.tsx, imagen hover, título, precio, CTA
	•	Price.tsx, maneja precio y compareAtPrice
	•	AddToCartButton.tsx
	•	CartDrawer.tsx, slide over con listado, cantidades, borrar, código de cupón, subtotal, envío estimado, botón Ir al pago
	•	VariantSelector.tsx, selects o botones para largo, material, piedras, color
	•	QuantityInput.tsx
	•	Seo.tsx, título y meta
	•	store
	•	cart.ts, estado del carrito con Zustand
	•	ui.ts, apertura de drawer
	•	lib
	•	money.ts, formateo de moneda
	•	filters.ts, aplica filtros y orden
	•	api.ts, adaptadores para datos: modo mock, modo Stripe products, modo Shopify
	•	data
	•	products.json, catálogo mock de 20 collares con campos típicos
	•	server
	•	mockServer.ts, endpoints locales tipo REST para productos, colección, validación de cupones, estimación de envío
	•	funciones opcionales para Stripe, en un directorio functions o server, según plantilla de Vite con express o vite-express

Estilo y UX
	•	Tipografía sans, mucho espacio en blanco, foco en fotografía de producto
	•	Grid responsivo, 2 columnas móvil, 3 tablet, 4 desktop, con gap amplio
	•	Card con imagen 1 y en hover mostrar imagen 2
	•	Toolbar superior con Filtros y Ordenar
	•	Breadcrumbs, título H1, contador de productos tipo 104 productos
	•	Botón Agregar al carrito o Elegir opciones si hay variantes
	•	Carrito lateral con atajo de teclado, por ejemplo tecla c, resumen y botón Ir al pago
	•	Mensajes de promoción en AnnouncementBar, por ejemplo Envío gratis en compras superiores a 150, 10 por ciento OFF con WELCOME10, Pickup local disponible

Modelo de datos

type Money = { amount: number, currency: 'USD' }
type Variant = {
  id: string
  title: string
  sku?: string
  price: Money
  compareAtPrice?: Money
  available: boolean
  options: Record<string, string>  // { Largo: '16 in', Material: 'Acero', Color: 'Dorado' }
  stock?: number
  image?: string
}
type Product = {
  id: string
  handle: string
  title: string
  descriptionHtml: string
  images: string[]  // principal, secundaria para hover
  price: Money
  compareAtPrice?: Money
  options: string[] // ['Largo', 'Material', 'Color']
  variants: Variant[]
  tags: string[]    // ['perlas', 'coral', 'statement']
  availableForSale: boolean
  createdAt: string
}

Estados, filtros y orden
	•	store.cart
	•	items: { productId, variantId, title, variantTitle, qty, unitPrice, image }
	•	couponCode opcional y discountAmount
	•	actions: addItem, removeItem, updateQty, applyCoupon, clear
	•	Filtros en memoria a partir de query params, por ejemplo
	•	inStockOnly, priceMin, priceMax, materials, colors, lengths
	•	Orden
	•	featured, best, az, za, priceAsc, priceDesc, dateAsc, dateDesc
	•	Paginación
	•	client side con page y pageSize, agrega también InfiniteScroll opcional

Accesibilidad
	•	Todos los inputs con label
	•	Imágenes con alt útil
	•	CartDrawer con role dialog y foco gestionado
	•	Botones con aria labels

Integración de pagos, dos caminos, deja ambos implementados detrás de un flag
	1.	Stripe Checkout
	•	.env con STRIPE_SECRET_KEY y PRICE_IDS opcionales
	•	Botón Ir al pago crea una sesión de checkout con line_items a partir del carrito
	•	success_url y cancel_url a rutas del front
	•	Webhook opcional para completar pedido, se puede simular
	2.	Shopify Storefront API
	•	.env con SHOPIFY_STORE_DOMAIN y SHOPIFY_STOREFRONT_TOKEN
	•	Usa Storefront para listar productos de la colección Necklaces, mapear a Product, usar sortKey, reverse y filtros simples
	•	AddToCart crea un Cart remoto y añade lines, Ir al pago redirige a checkoutUrl

Descuentos y envío
	•	applyCoupon local con mapa de cupones, por ejemplo WELCOME10 con 10 por ciento
	•	Estimación de envío simple, por ejemplo gratis si subtotal mayor o igual a 150
	•	Pickup local, checkbox en checkout, si marcado, costo cero y omite dirección de envío

Páginas y comportamiento esperado
	•	Colección
	•	Breadcrumbs Home, Tienda, Collares
	•	H1 Collares, contador de productos
	•	Toolbar con botón Filtros en móvil y selector Orden
	•	Grid de tarjetas con hover image, título en dos líneas con ellipsis, Price, CTA
	•	Producto
	•	Galería principal con miniaturas
	•	VariantSelector con validación, solo permite agregar si available
	•	Price y compareAtPrice
	•	Detalle con descripción y tags
	•	Compartir opcional
	•	Checkout
	•	Resumen del carrito
	•	Campos para correo, envío, pickup local, cupón
	•	Botón Pagar con Stripe o Continuar a Shopify, según flag
	•	Carrito
	•	Drawer con listado, qty stepper, borrar, aplicar cupón, subtotal, estimación de envío, CTA Ir al pago

Archivo de configuración
	•	src/lib/config.ts

export const config = {
  currency: 'USD',
  freeShippingThreshold: 150,
  enableStripe: true,
  enableShopify: false,
}

Comandos y scaffolding
	•	Crear proyecto con Vite, React y TS
	•	Instalar dependencias, react router, zustand, stripe js, tailwind
	•	Configurar Tailwind, content y base de estilos
	•	Añadir scripts para iniciar mock server con vite y endpoints locales
	•	Añadir archivo seed para products.json con 20 collares variados y 2 imágenes por producto

Entrega
	•	Proyecto ejecutable con npm run dev
	•	Linter básico y formateo
	•	README con instrucciones para modo Stripe y modo Shopify
	•	Ejemplos de .env para ambos modos

Implementa el código completo de
	•	RootLayout con AnnouncementBar, Header con logo y navegación simple, Footer
	•	Collection page con filtros y orden conectados a URLSearchParams
	•	ProductCard con hover image
	•	Product detail con VariantSelector
	•	CartDrawer con Zustand
	•	Checkout con Stripe Checkout y alternativa Shopify
	•	Mock server con endpoints GET, por ejemplo GET, api, products y GET, api, collection, necklaces con soporte de filtros

Diseño visual
	•	Blanco y negro, acentos sutiles, border, rounded, sombras suaves
	•	Imágenes cuadradas con object cover
	•	Botones con estados hover, focus visible

Asegúrate de
	•	No copiar ningún código de sitios externos, solo replicate el estilo general
	•	Escribir pruebas unitarias mínimas para filters.ts y money.ts
	•	Comentar el código clave con explicaciones breves
	•	Mantener todo en español en la UI

Al final, imprime los pasos de uso
	1.	npm i
	2.	npm run dev
	3.	Para Stripe, completar .env y ejecutar npm run dev:server si hace falta
	4.	Para Shopify, completar .env y cambiar flags en config

La pagina esta inspirada en esta: https://elsieinnaples.com/collections/necklaces
⸻
