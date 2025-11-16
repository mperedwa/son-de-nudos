tasks.md

Formato: tabla por hito con columnas Estado, Tarea, Criterios de aceptación, Fecha objetivo.
Estados: ⏳ pendiente, ✅ completada, 🔄 en progreso, ❌ descartada.

Hito 1 - Setup del proyecto y base técnica ✅ COMPLETADO (14-Nov-2025)

Estado	Tarea	Criterios de aceptación	Fecha objetivo
✅	Crear proyecto Vite con React y TypeScript	Proyecto inicializado, scripts npm disponibles, compilación sin errores	2025-11-20
✅	Configurar TailwindCSS	Tailwind funcionando, clases aplicadas a un componente de prueba	2025-11-20
✅	Instalar y configurar React Router	Rutas básicas definidas (inicio, producto, checkout, success, cancel)	2025-11-21
✅	Configurar Zustand para estado global	store/cart.ts y store/ui.ts creados, estado accesible desde un componente demo	2025-11-21
✅	Añadir estructura de carpetas	Estructura src/app/routes, src/components, src/layout, src/lib, src/store, data y server creada	2025-11-21

Hito 2 - Layout, navegación y componentes base ✅ COMPLETADO (14-Nov-2025)

Estado	Tarea	Criterios de aceptación	Fecha objetivo
✅	Implementar RootLayout con AnnouncementBar, Header y Footer	Todas las páginas usan RootLayout, AnnouncementBar muestra mensajes rotativos, Header con logo, nav y CartButton, Footer con secciones básicas	2025-11-23
✅	Crear componente Breadcrumbs	Breadcrumbs reutilizable, se muestra en colección y producto, accesible para lectores de pantalla	2025-11-23
✅	Definir estilos base de tipografía y colores	Clases de Tailwind acordes al design system, tipografía aplicada globalmente	2025-11-23

Hito 3 - Colección de collares: grid, filtros y orden ✅ COMPLETADO (14-Nov-2025)

Estado	Tarea	Criterios de aceptación	Fecha objetivo
✅	Crear data/products.json con 20 collares	Archivo con productos, variantes y 2 imágenes por producto, formato valido TypeScript al parsearse	2025-11-25
✅	Implementar ProductCard con hover image	En desktop, al hacer hover cambia a segunda imagen si existe, muestra título, precio, compareAtPrice opcional y badges de descuento/nuevo/agotado	2025-11-25
✅	Implementar ProductGrid responsivo	Grid 2 columnas móvil, 3 tablet, 4 desktop, gap-6, se adapta a diferentes cantidades de productos, estados de carga y vacío	2025-11-25
✅	Implementar CollectionToolbar y FiltersDrawer	Toolbar con botón Filtros en móvil y select Ordenar, FiltersDrawer con filtros de disponibilidad, precio, material, color y largo, botón Ver resultados	2025-11-26
✅	Sincronizar filtros y orden con URLSearchParams	Cambios en filtros y orden se reflejan en la URL, recargas de página mantienen el estado	2025-11-26
✅	Implementar filters.ts	Funciones puras para filtrar, ordenar y paginar una lista de Product, con helpers getUniqueOptionValues y getPriceRange	2025-11-27

Hito 4 - Página de producto y selección de variantes ✅ COMPLETADO (14-Nov-2025)

Estado	Tarea	Criterios de aceptación	Fecha objetivo
✅	Crear ruta product/[handle].tsx	Navegar desde la colección a un producto muestra la página correspondiente, errores manejados para handles desconocidos con Navigate redirect	2025-11-28
✅	Implementar galería de imágenes con miniaturas	Imagen principal y lista de miniaturas (grid 4 columnas), clic en miniatura actualiza la imagen principal, indicador visual en hover	2025-11-28
✅	Implementar VariantSelector	Selección de opciones (largo, material, color), solo permite agregar si la combinación está disponible, botones deshabilitados con indicador visual, mensajes de error claros, indicador de stock	2025-11-29
✅	Integrar AddToCartButton con VariantSelector y Zustand	Agregar al carrito añade el item correcto con feedback visual (loading + success), abre CartDrawer automáticamente, cantidades se acumulan correctamente	2025-11-29

Hito 5 - Carrito lateral y checkout ✅ COMPLETADO (14-Nov-2025)

Estado	Tarea	Criterios de aceptación	Fecha objetivo
✅	Implementar CartDrawer con Zustand	Drawer se abre desde Header y vía atajo de teclado (Cmd/Ctrl+K), lista items con controles de cantidad +/-, eliminar productos, cierre con ESC, scroll interno, estados vacío y con items	2025-11-30
✅	Implementar cupones y descuentos locales	applyCoupon soporta 4 cupones (WELCOME10, PRISCILLA15, VERANO20, NAVIDAD25), validación con mensajes de error, formulario en CartDrawer, indicador visual, botón remover	2025-11-30
✅	Implementar estimación de envío y umbral de envío gratis	Envío $10, gratis si >= $150, barra de progreso en CartDrawer, mensaje dinámico, funciones isFreeShipping() y amountUntilFreeShipping() en store	2025-11-30
✅	Implementar página de checkout	Layout dos columnas, formulario contacto y envío, método entrega (shipping/pickup), resumen pedido sticky, validación, botón pago con loading, redirect a /success	2025-12-02

Hito 6 - Integración de pagos y backend mock ✅ PARCIALMENTE COMPLETADO (14-Nov-2025)

Estado	Tarea	Criterios de aceptación	Fecha objetivo
✅	Implementar mockServer.ts	Endpoints GET /api/products, /api/collection/necklaces y validación simple de cupones y envío, integrados con la app. Soporte para 3 modos: mock, stripe, shopify	2025-12-03
✅	Integrar Stripe Checkout	Módulos stripe.ts (servidor) y stripe.ts (cliente) creados, configuración en .env.example, integración con checkout.tsx, soporte para crear sesiones y redirigir a Stripe Checkout	2025-12-05
⏳	Integrar Shopify Storefront API (modo alternativo)	Modo de datos que usa Shopify para cargar productos, mapping a modelo Product, checkout redirige a checkoutUrl de Shopify (opcional, no prioritario)	2025-12-08

Hito 7 - Calidad, documentación y pulido ✅ PARCIALMENTE COMPLETADO (14-Nov-2025)

Estado	Tarea	Criterios de aceptación	Fecha objetivo
⏳	Implementar pruebas unitarias para money.ts y filters.ts	Cobertura de casos clave, tests pasan en CI (pendiente para futura iteración)	2025-12-09
✅	Configurar linter y formateo	Creado .eslintrc.cjs con reglas para React + TypeScript, scripts npm run lint funcional, pasa sin errores en todo el proyecto	2025-12-09
✅	Crear README con instrucciones de uso	README.md completo (350+ líneas) con instalación, configuración .env, 3 modos de operación (mock/stripe/shopify), estructura del proyecto, scripts, cupones, deployment, troubleshooting y roadmap	2025-12-10
✅	Revisión de accesibilidad básica	Componentes clave con aria-labels (CartDrawer: role="dialog" aria-modal, Breadcrumbs: aria-label/aria-current, FiltersDrawer: focus trap), navegación por teclado funcional (Cmd/Ctrl+K para carrito, ESC para cerrar drawers), inputs con labels apropiados	2025-12-10

Hito 8 - Internacionalización (i18n) ✅ COMPLETADO (15-Nov-2025)

Estado	Tarea	Criterios de aceptación	Fecha objetivo
✅	Instalar dependencias i18n	react-i18next, i18next, i18next-browser-languagedetector instalados exitosamente	2025-11-15
✅	Crear estructura de traducciones	16 archivos JSON creados (8 namespaces × 2 idiomas: ES/EN): common, navigation, product, cart, checkout, messages, announcements, filters en src/i18n/locales/	2025-11-15
✅	Configurar i18n con detección de navegador	src/i18n/index.ts configurado con detección automática (localStorage → navigator → htmlTag), fallback a inglés, conversión de regiones (en-US → en), debug mode en desarrollo	2025-11-15
✅	Crear store de idioma con Zustand	store/language.ts creado con currentLanguage, setLanguage(), toggleLanguage(), sincronización bidireccional con i18next vía event listeners	2025-11-15
✅	Traducir componentes de layout	Header.tsx con selector ES/EN estilizado, Footer.tsx, AnnouncementBar.tsx completamente traducidos con useTranslation	2025-11-15
✅	Traducir componentes de carrito	CartDrawer.tsx traducido con múltiples namespaces, interpolación para counts y amounts, todas las etiquetas y mensajes en ambos idiomas	2025-11-15
✅	Traducir componentes de productos	ProductCard.tsx, ProductGrid.tsx, FiltersDrawer.tsx, CollectionToolbar.tsx con traducciones completas	2025-11-15
✅	Traducir páginas de checkout y resultados	checkout.tsx, success.tsx, cancel.tsx, Breadcrumbs.tsx completamente traducidos con namespace apropiado	2025-11-15
✅	Implementar selector de idioma en Header	Botones ES/EN con estados activos (fondo marrón), persistencia en localStorage, cambio inmediato en toda la aplicación	2025-11-15
✅	Documentar sistema i18n en README	README.md actualizado con sección completa: características i18n, tabla de idiomas soportados, estructura de archivos, ejemplos de uso del hook, configuración del detector	2025-11-15
✅	Configurar puerto permanente 5174	vite.config.ts actualizado con puerto 5174 y strictPort: true, .env creado, .env.example documentado, CLAUDE.md con advertencia permanente para NUNCA usar puerto 5173	2025-11-15

Hito 9 - Deployment a Producción ✅ COMPLETADO (16-Nov-2025)

Estado	Tarea	Criterios de aceptación	Fecha objetivo
✅	Corregir errores de TypeScript en build	Estandarizado CartItem.quantity (eliminado qty), actualizada API de Stripe a versión correcta, corregido método redirectToCheckout, build exitoso sin errores	2025-11-16
✅	Crear/verificar .gitignore completo	.gitignore actualizado con entradas para: .vercel, *.tsbuildinfo, coverage, variables de entorno, archivos temporales, configuración de editores	2025-11-16
✅	Inicializar repositorio Git local	Repositorio Git inicializado, commit inicial creado con mensaje descriptivo, 71 archivos (16,860 líneas) añadidos exitosamente	2025-11-16
✅	Crear repositorio en GitHub	Repositorio público creado en https://github.com/mperedwa/son-de-nudos con descripción y tags apropiados	2025-11-16
✅	Push del código a GitHub	Código subido exitosamente a GitHub con historial completo, branch main configurado como default	2025-11-16
✅	Deployment a Vercel	Proyecto desplegado en https://son-de-nudos-9uxsc5fhj-mario-perez-edwards-projects.vercel.app, build exitoso (340KB bundle), CI/CD automático configurado	2025-11-16
✅	Verificar sitio en producción	Deployment verificado con estado "Ready", configuración automática de Vite detectada correctamente, protección de acceso activada por defecto	2025-11-16
✅	Actualizar documentación con URLs	README.md actualizado con URLs de GitHub y Vercel, sección de deployment expandida con CI/CD, instrucciones para desactivar protección	2025-11-16

⸻