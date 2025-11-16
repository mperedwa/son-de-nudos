1. Visión

Crear una tienda web enfocada en collares, moderna y minimalista, en español, que permita explorar una colección cuidada de productos, filtrar y ordenar con facilidad, ver el detalle de cada pieza, gestionar un carrito lateral ágil y completar el checkout mediante Stripe Checkout o Shopify Storefront API. La fotografía del producto será protagonista, con una interfaz limpia, rápida y accesible.

2. Objetivos
	•	Permitir a usuarios navegar la colección de collares con una experiencia fluida en móvil, tablet y desktop.
	•	Ofrecer filtros y ordenamientos claros para ayudar a descubrir productos relevantes.
	•	Facilitar la selección de variantes de producto y gestión de inventario básico.
	•	Integrar un carrito lateral accesible, con soporte de cupones, envío y pickup local.
	•	Dar soporte a dos caminos de pago configurables: Stripe Checkout y Shopify Storefront.
	•	Diseñar una arquitectura extensible, con datos mockeados al inicio y fácil integración posterior con APIs reales.
	•	Cumplir buenas prácticas de accesibilidad, seguridad básica y rendimiento.

3. Historias de usuario

3.1 Visitante anónimo
	•	Como visitante, quiero ver una cuadrícula de collares con sus fotos y precios, para decidir cuáles me interesan.
	•	Como visitante, quiero poder filtrar por disponibilidad, rango de precio, material, color y largo, para acotar la selección a lo que busco.
	•	Como visitante, quiero ordenar los productos por precio, nombre o fecha, para encontrar más rápido lo que necesito.
	•	Como visitante, quiero ver el detalle completo de un collar, con varias imágenes y descripción, para entender mejor el producto antes de comprar.
	•	Como visitante, quiero ver claramente si un producto tiene descuento y el precio anterior, para percibir el valor de la oferta.
	•	Como visitante, quiero agregar productos al carrito sin salir de la página de colección, para construir mi selección de forma rápida.
	•	Como visitante, quiero abrir y cerrar el carrito lateral fácilmente, incluso con un atajo de teclado, para revisar mi selección sin perder contexto.

3.2 Comprador potencial
	•	Como comprador, quiero seleccionar variantes de producto (largo, material, color), para asegurar que el producto coincide con mis preferencias.
	•	Como comprador, quiero ver si hay stock disponible para una variante concreta, para evitar intentar comprar algo agotado.
	•	Como comprador, quiero aplicar un cupón de descuento (por ejemplo WELCOME10), para aprovechar promociones.
	•	Como comprador, quiero ver la estimación de envío y saber si tengo envío gratis por superar cierto monto, para tomar mejores decisiones de compra.
	•	Como comprador, quiero elegir entre envío a domicilio o retiro en tienda (pickup local), para usar la opción más conveniente.
	•	Como comprador, quiero completar el pago mediante Stripe Checkout o ser redirigido al checkout de Shopify, para finalizar la compra con un proveedor de pagos confiable.
	•	Como comprador, quiero recibir un resumen claro del pedido en la pantalla de éxito, para confirmar que todo se procesó correctamente.

3.3 Operador de la tienda o administrador técnico
	•	Como operador, quiero poder cambiar fácilmente los datos mock (products.json) y añadir más productos, para mantener el catálogo actualizado en modo demo.
	•	Como operador técnico, quiero configurar flags en un archivo de config para activar o desactivar Stripe y Shopify, para adaptar la integración a cada entorno.
	•	Como operador técnico, quiero disponer de endpoints mock simples para productos, colecciones y cupones, para poder desarrollar y probar sin depender de servicios externos.
	•	Como operador técnico, quiero que el proyecto tenga un README claro con pasos de instalación y configuración, para ponerlo en marcha rápidamente.

4. Requisitos técnicos clave
	•	Frontend
	•	Vite, React, TypeScript, TailwindCSS.
	•	Ruteo con React Router.
	•	Estado global con Zustand para carrito y UI del drawer.
	•	Componentes accesibles, con aria labels y gestión de foco en el CartDrawer.
	•	Arquitectura de páginas
	•	Ruta de colección de collares con filtros y orden.
	•	Ruta de detalle de producto con selección de variantes.
	•	Ruta de checkout con resumen, datos de envío o pickup y cupón.
	•	Rutas de éxito y cancelación para Stripe.
	•	RootLayout con AnnouncementBar, Header, Footer.
	•	Datos y lógica
	•	Catálogo mock en data/products.json con 20 collares, cada uno con 2 imágenes.
	•	Tipos Money, Variant y Product definidos en TypeScript.
	•	Filtros en memoria derivados de URLSearchParams: inStockOnly, priceMin, priceMax, materials, colors, lengths.
	•	Orden soportado: featured, best, az, za, priceAsc, priceDesc, dateAsc, dateDesc.
	•	Paginación en cliente (page y pageSize) con opción de InfiniteScroll.
	•	Carrito y cupones
	•	Estado de carrito con items, couponCode, discountAmount y acciones addItem, removeItem, updateQty, applyCoupon, clear.
	•	Estimación de envío simple con umbral de envío gratis configurable.
	•	Lógica de pickup local que anula costo de envío.
	•	Pagos
	•	Integración opcional con Stripe Checkout, usando env STRIPE_SECRET_KEY y configuración de success_url y cancel_url.
	•	Integración opcional con Shopify Storefront API, usando env SHOPIFY_STORE_DOMAIN y SHOPIFY_STOREFRONT_TOKEN.
	•	Configurables mediante flags en config.ts.
	•	Accesibilidad y rendimiento
	•	Imágenes con alt descriptivo, loading=“lazy”.
	•	Labels visibles en inputs de filtros, checkout y cupón.
	•	CartDrawer con role=“dialog” y foco controlado.
	•	Grid responsiva con breakpoints claros y tamaños de imagen consistentes.

5. Alcance y no alcance

Alcance MVP
	•	Estructura de layout completa:
	•	AnnouncementBar con mensajes rotativos.
	•	Header con logo, navegación básica y botón de carrito.
	•	Footer con políticas, newsletter, redes y nota de plataforma.
	•	Colección de collares
	•	Breadcrumb Home, Tienda, Collares.
	•	H1 con título “Collares” y contador de productos.
	•	Toolbar con botón Filtros en móvil y select de Orden.
	•	Panel de filtros con disponibilidad, precio mínimo y máximo, material, color y largo.
	•	Grid de productos con hover image, título, precio, compareAtPrice y CTA.
	•	Página de producto
	•	Galería principal con miniaturas.
	•	Selector de variantes con validación.
	•	Price y compareAtPrice.
	•	Descripción y tags.
	•	Carrito lateral
	•	Drawer con listado de productos, selector de cantidad, botón borrar, aplicación de cupón, subtotal y estimación de envío.
	•	Atajo de teclado para abrir y cerrar.
	•	Checkout
	•	Resumen del carrito.
	•	Campos básicos de contacto y envío.
	•	Opción de pickup local.
	•	Botón Pagar con Stripe o Continuar a Shopify según flags.
	•	Backend mock
	•	Mock server con endpoints GET /api/products, GET /api/collection/necklaces, validación de cupones simples y estimación de envío.
	•	Calidad
	•	Pruebas unitarias mínimas para filters.ts y money.ts.
	•	Linter y formateo.
	•	README con instrucciones de uso, Stripe y Shopify.

Fuera de alcance inicial
	•	Panel de administración completo para gestionar productos y órdenes.
	•	Usuarios autenticados, cuentas de cliente, historial de pedidos y wishlist.
	•	Gestión avanzada de impuestos, múltiples monedas reales y zonas de envío complejas.
	•	Emails transaccionales reales y notificaciones avanzadas.
	•	Panel analítico avanzado, solo se definirán eventos básicos para futura instrumentación.
	•	CMS visual para el contenido de marketing.

6. Métricas de éxito
	•	Tiempo de carga inicial (LCP) aceptable en conexiones típicas, con especial foco en la primera fila de productos.
	•	Capacidad de filtrar y ordenar sin bloqueos, manteniendo una experiencia fluida.
	•	Baja tasa de errores de consola en producción.
	•	Usuarios de prueba completan un flujo de navegación colección → detalle → carrito → checkout sin fricciones graves.
	•	Configuración simple de Stripe o Shopify mediante .env y flags, verificada en entorno de pruebas.
	•	Cobertura de pruebas unitarias mínima en lógica de filtros y formateo de moneda.
