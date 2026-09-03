# Plan Maestro - Son de Nudos by Priscilla

> **Actualización 2 de septiembre de 2026:** este documento conserva el historial original del proyecto. Para la recuperación, seguridad y lanzamiento comercial vigente, usar [PLAN_EJECUCION_LANZAMIENTO.md](./PLAN_EJECUCION_LANZAMIENTO.md). Las marcas de “completado” incluidas aquí describen la implementación de 2025 y no sustituyen la validación actual de producción.

**Fecha de inicio**: 14 de Noviembre, 2025
**Proyecto**: Ecommerce de collares artesanales
**Stack**: Vite + React + TypeScript + TailwindCSS + Zustand + React Router

---

## 📊 Resumen Ejecutivo

**Son de Nudos by Priscilla** es una tienda web moderna y minimalista enfocada en piezas artesanales, con una estética cálida inspirada en tonos tierra. El proyecto implementa una experiencia de compra fluida con filtros, selección de variantes, carrito y Stripe Checkout. Para la ejecución vigente, consultar `PLAN_EJECUCION_LANZAMIENTO.md`.

### Documentos de Referencia
- **PRD.md**: Product Requirements Document (visión, objetivos, historias de usuario)
- **PLANNIG.md**: Arquitectura técnica detallada (modelos de datos, estructura, seguridad)
- **TASKS.md**: 7 hitos con tareas específicas y criterios de aceptación
- **Claude.md**: Estándares de código, flujo de trabajo y design system

---

## 🎨 Identidad Visual

### Paleta de Colores Tierra
- **Marrón primario**: `#8B6F47` - Títulos, bordes activos, elementos clave
- **Beige suave**: `#F5E6D3` - Fondos ligeros, zonas de descanso visual
- **Dorado apagado**: `#D4A574` - Acentos, botones destacados, hover premium
- **Texto oscuro**: `#3C2F2F` - Copy principal
- **Texto claro**: `#6B5D54` - Copy secundario

### Tipografía
- **Fuente serif** (Georgia o similar) para identidad artesanal elegante
- Jerarquía clara: títulos en marrón primario, cuerpo en café
- Espaciado amplio para composición limpia

### Principios de Diseño
- Superficies mayormente blancas/beige con acentos tierra
- Tarjetas con bordes redondeados y sombras suaves
- Estados hover marrón → dorado para efecto cálido
- Foco visual en fotografías de producto

---

## 🏗️ Arquitectura del Proyecto

### Estructura de Carpetas
```
son-de-nudos/
├── src/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── index.tsx              # Colección de collares
│   │   │   ├── product/
│   │   │   │   └── [handle].tsx       # Detalle de producto
│   │   │   ├── checkout.tsx           # Checkout
│   │   │   ├── success.tsx            # Pago exitoso (Stripe)
│   │   │   └── cancel.tsx             # Pago cancelado (Stripe)
│   │   └── layout/
│   │       └── RootLayout.tsx         # Layout global
│   ├── components/
│   │   ├── AnnouncementBar.tsx        # Carrusel de mensajes
│   │   ├── Header.tsx                 # Logo, nav, carrito
│   │   ├── Footer.tsx                 # Links, newsletter, redes
│   │   ├── Breadcrumbs.tsx            # Navegación de migas
│   │   ├── CollectionToolbar.tsx      # Filtros + Ordenar
│   │   ├── FiltersDrawer.tsx          # Panel de filtros
│   │   ├── ProductGrid.tsx            # Grid responsivo
│   │   ├── ProductCard.tsx            # Tarjeta de producto
│   │   ├── Price.tsx                  # Precio con descuento
│   │   ├── AddToCartButton.tsx        # Botón agregar
│   │   ├── CartDrawer.tsx             # Carrito lateral
│   │   ├── VariantSelector.tsx        # Selector de variantes
│   │   ├── QuantityInput.tsx          # Stepper numérico
│   │   └── Seo.tsx                    # Meta tags
│   ├── store/
│   │   ├── cart.ts                    # Zustand: estado del carrito
│   │   └── ui.ts                      # Zustand: estado UI (drawers)
│   ├── lib/
│   │   ├── money.ts                   # Formateo de moneda
│   │   ├── filters.ts                 # Lógica de filtros/orden
│   │   ├── api.ts                     # Abstracción de datos
│   │   └── config.ts                  # Flags y configuración
│   ├── data/
│   │   └── products.json              # Catálogo de 20 collares
│   └── server/
│       └── mockServer.ts              # Endpoints mock locales
├── Documentos_proporcionados/
│   ├── Proyecto.md                    # Prompts originales
│   ├── prototype-son-de-nudos-webapp.html  # Prototipo visual
│   └── products.json                  # Productos de referencia
├── PRD.md                             # Requirements Document
├── PLANNIG.md                         # Arquitectura técnica
├── TASKS.md                           # Hitos y tareas
├── Claude.md                          # Estándares de código
└── PLAN_MAESTRO.md                    # Este documento
```

### Stack Tecnológico
- **Build Tool**: Vite
- **Framework**: React 18+
- **Lenguaje**: TypeScript (strict mode)
- **Estilos**: TailwindCSS (sin librerías UI pesadas)
- **Ruteo**: React Router v6
- **Estado**: Zustand (carrito + UI)
- **Formularios**: React Hook Form + Zod
- **Pagos**: Stripe Checkout Y/O Shopify Storefront API
- **Testing**: Vitest + Testing Library

---

## 📋 Plan de Implementación - 8 Fases

### Fase 1: Fundación del Proyecto ✅ COMPLETADA
**Objetivo**: Setup técnico base funcional

**Tareas**:
1. ✅ Inicializar Vite con template react-ts
2. ✅ Instalar dependencias (react-router, zustand, tailwind, zod, etc.)
3. ✅ Configurar TailwindCSS con paleta tierra personalizada
4. ✅ Configurar React Router con rutas básicas
5. ✅ Crear estructura de carpetas completa
6. ✅ Configurar Zustand stores (cart.ts, ui.ts)
7. ✅ Configurar alias de imports (@/ → src/)
8. ✅ Crear .env.example con variables esperadas

**Fecha completada**: 14 de Noviembre, 2025

---

### Fase 2: Layout y Componentes Base ✅ COMPLETADA
**Objetivo**: Layout global con navegación y estética tierra

**Tareas**:
1. ✅ Implementar RootLayout.tsx (wrapper de todas las páginas)
2. ✅ Crear AnnouncementBar con carrusel de mensajes auto-rotativo
3. ✅ Crear Header con logo SVG, navegación, selector idioma, carrito
4. ✅ Crear Footer con links legales, newsletter, redes sociales
5. ✅ Crear componente Breadcrumbs reutilizable
6. ✅ Aplicar tipografía global serif y estilos base

**Fecha completada**: 14 de Noviembre, 2025

---

### Fase 3: Colección de Productos ✅ COMPLETADA
**Objetivo**: Grid de productos con filtros y orden funcionales

**Tareas**:
1. ✅ Crear data/products.json con 20 collares
2. ✅ Implementar ProductCard con hover image
3. ✅ Implementar ProductGrid responsivo (2/3/4 columnas)
4. ✅ Implementar CollectionToolbar y FiltersDrawer
5. ✅ Implementar lib/filters.ts con funciones puras
6. ✅ Sincronizar filtros con URLSearchParams

**Fecha completada**: 14 de Noviembre, 2025

---

### Fase 4: Detalle de Producto y Variantes ✅ COMPLETADA
**Objetivo**: Página de producto con selección de variantes

**Tareas**:
1. ✅ Crear ruta product/[handle].tsx dinámica
2. ✅ Implementar galería de imágenes con miniaturas
3. ✅ Implementar VariantSelector con validación de stock
4. ✅ Integrar AddToCartButton con Zustand
5. ✅ Implementar componente Price
6. ✅ Mostrar descriptionHtml y tags del producto

**Fecha completada**: 14 de Noviembre, 2025

---

### Fase 5: Carrito y Checkout ✅ COMPLETADA
**Objetivo**: Carrito lateral completo y checkout funcional

**Tareas**:
1. ✅ Implementar store/cart.ts con Zustand
2. ✅ Implementar CartDrawer con focus trap y accesibilidad
3. ✅ Implementar sistema de cupones (4 cupones)
4. ✅ Implementar estimación de envío con umbral gratis
5. ✅ Implementar página checkout.tsx completa

**Fecha completada**: 14 de Noviembre, 2025

---

### Fase 6: Integración de Pagos ✅ PARCIALMENTE COMPLETADA
**Objetivo**: Implementar Stripe y/o Shopify según flags

**Tareas**:
1. ✅ Implementar server/mockServer.ts
2. ✅ Integración Stripe Checkout
3. ⏳ Integración Shopify Storefront API (opcional)
4. ✅ Implementar lib/config.ts con flags

**Fecha completada**: 14 de Noviembre, 2025

---

### Fase 7: Calidad, Tests y Documentación ✅ PARCIALMENTE COMPLETADA
**Objetivo**: Pulir, probar y documentar el proyecto

**Tareas**:
1. ⏳ Implementar tests unitarios (pendiente)
2. ✅ Configurar linter y formateo (ESLint)
3. ✅ Crear README completo (350+ líneas)
4. ✅ Revisión de accesibilidad básica
5. ✅ Actualizar TASKS.md
6. ✅ Actualizar Claude.md

**Fecha completada**: 14 de Noviembre, 2025

---

### Fase 8: Internacionalización (i18n) ✅ COMPLETADA
**Objetivo**: Sistema bilingüe Español/Inglés con detección automática

**Tareas**:
1. ✅ Instalar dependencias i18n (react-i18next, i18next, detector)
2. ✅ Crear estructura de traducciones (16 archivos JSON: 8 namespaces × 2 idiomas)
3. ✅ Configurar i18n con detección de navegador (localStorage → navigator → htmlTag)
4. ✅ Crear store/language.ts con Zustand y sincronización bidireccional
5. ✅ Traducir todos los componentes de layout (Header, Footer, AnnouncementBar)
6. ✅ Traducir componentes de carrito (CartDrawer con interpolación)
7. ✅ Traducir componentes de productos (ProductCard, Grid, Filters, Toolbar)
8. ✅ Traducir páginas de checkout y resultados (checkout, success, cancel, Breadcrumbs)
9. ✅ Implementar selector de idioma en Header (botones ES/EN con estados activos)
10. ✅ Documentar sistema i18n en README
11. ✅ Configurar puerto permanente 5174 (vite.config.ts + .env + CLAUDE.md)

**Criterios de Aceptación**:
- ✅ Detección automática de idioma del navegador
- ✅ Selector manual ES/EN con persistencia en localStorage
- ✅ Todos los componentes y páginas traducidos
- ✅ Interpolación funcional para valores dinámicos (counts, amounts)
- ✅ Múltiples namespaces organizados por dominio
- ✅ Fallback a inglés cuando no hay traducción
- ✅ README documentado con ejemplos de uso
- ✅ Puerto 5174 configurado permanentemente

**Fecha completada**: 15 de Noviembre, 2025

---

## 🎯 Funcionalidades Principales

### Catálogo de Productos
- 20 collares artesanales con variantes (Largo, Material, Color)
- 2 imágenes por producto (principal + hover)
- Descripción HTML enriquecida
- Tags para categorización
- Stock y disponibilidad por variante

### Filtros Avanzados
- **Disponibilidad**: Solo en stock
- **Precio**: Rango mínimo y máximo
- **Material**: Perlas, Coral, Acero inoxidable, Latón, Ágata, etc.
- **Color**: Dorado, Marfil, Blanco, Negro, Turquesa, Rosa, Verde, etc.
- **Largo**: 14in, 16in, 18in, 20in

### Orden Flexible
- Featured (destacados)
- Best selling (más vendidos)
- A-Z / Z-A (alfabético)
- Precio: bajo a alto / alto a bajo
- Fecha: antiguo a nuevo / nuevo a antiguo

### Carrito Inteligente
- Carrito lateral (drawer) con atajo de teclado
- Agregar/quitar productos
- Ajustar cantidades con stepper
- Aplicar cupones de descuento
- Estimación de envío en tiempo real
- Envío gratis sobre $150
- Opción de pickup local

### Checkout Flexible
- Formulario con validación (React Hook Form + Zod)
- Contacto: email
- Envío: nombre, dirección completa
- Opción pickup local (anula envío)
- Resumen del carrito
- Integración dual: Stripe o Shopify

### Pagos Seguros
- **Stripe Checkout**: Redirección a pasarela segura
- **Shopify Storefront**: Checkout nativo de Shopify
- Configuración mediante flags en config.ts
- Variables de entorno para credenciales

---

## 🔒 Seguridad y Mejores Prácticas

### Secretos y Variables
- **NUNCA** exponer claves privadas en el cliente
- STRIPE_SECRET_KEY solo en backend
- SHOPIFY_STOREFRONT_TOKEN es público (solo lectura)
- .env en .gitignore
- .env.example sin valores reales

### Validación
- Validación cliente Y servidor para datos sensibles
- Zod schemas para formularios
- Sanitización de HTML en descriptionHtml
- Límites de cantidad en carrito

### Accesibilidad
- Todos los inputs con labels
- CartDrawer con role="dialog" y focus trap
- Navegación completa por teclado
- Alt descriptivo en imágenes
- Contraste de colores adecuado (WCAG AA)

### Rendimiento
- Imágenes con loading="lazy"
- Code splitting por ruta
- TailwindCSS purge en producción
- Bundle size optimizado

---

## 📊 Métricas de Éxito

### Técnicas
- LCP (Largest Contentful Paint) < 2.5s
- Sin errores de consola en producción
- Lighthouse Performance > 85
- Lighthouse Accessibility > 90
- Bundle size < 300KB (gzipped)

### UX
- Filtros responden en < 100ms
- Agregar al carrito feedback inmediato
- Checkout completable en < 2 minutos
- Navegación por teclado fluida

### Negocio
- Tasa de conversión visitante → checkout > 5%
- Tasa de abandono de carrito < 70%
- Tiempo promedio en página de producto > 1 minuto

---

## 🚀 Roadmap Futuro (Post-MVP)

### Fase 9: Optimizaciones (Enero 2026)
- Infinite scroll en colección
- Imágenes optimizadas con Next/Image o similar
- Caché de productos con React Query
- PWA (offline support básico)

### Fase 10: Cuentas de Usuario (Febrero 2026)
- Registro/login
- Historial de pedidos
- Wishlist (favoritos)
- Direcciones guardadas

### Fase 11: Panel Admin (Marzo 2026)
- CRUD de productos
- Gestión de inventario
- Dashboard de ventas
- Gestión de cupones

### Fase 12: Marketing (Abril 2026)
- Integración email marketing (Mailchimp/SendGrid)
- Newsletter funcional
- Reviews de productos
- Sistema de referidos

### Fase 13: Analítica (Mayo 2026)
- Google Analytics 4
- Facebook Pixel
- Dashboard de métricas
- A/B testing de precios

---

## 📝 Notas Importantes

### Estándares de Código (de Claude.md)
- TypeScript estricto, no usar `any`
- Funciones React con hooks (no clases)
- Props tipadas explícitamente
- Helpers reutilizables en src/lib
- Nombres descriptivos en inglés, UI en español
- Comentarios breves en lógica compleja

### Flujo de Trabajo
1. Leer contexto (PRD.md, PLANNIG.md, TASKS.md)
2. Planificación rápida
3. Implementación modular
4. Pruebas (unitarias + manuales)
5. Actualizar TASKS.md
6. Log de sesión en Claude.md

### Design System
- Componentes con paleta tierra consistente
- Grid responsivo: 2 móvil / 3 tablet / 4 desktop
- Hover sutil con elevación y cambio de color
- Sombras suaves (shadow-sm, shadow-md)
- Bordes redondeados (rounded-md, rounded-lg)
- Transiciones suaves (transition-all duration-300)

---

## 🎓 Lecciones Aprendidas

_Esta sección se actualizará al completar cada fase_

### Fase 1
- TBD

### Fase 2
- TBD

### Fase 3
- TBD

---

## 📞 Contacto y Recursos

**Cliente**: Priscilla (Son de Nudos)
**Desarrollador**: [Tu nombre]
**Fecha de inicio**: 14 de Noviembre, 2025
**Fecha estimada de entrega**: 10 de Diciembre, 2025

### Enlaces Útiles
- Prototipo visual: `Documentos_proporcionados/prototype-son-de-nudos-webapp.html`
- Inspiración: https://elsieinnaples.com/collections/necklaces
- Stripe Docs: https://stripe.com/docs/checkout
- Shopify Storefront API: https://shopify.dev/docs/api/storefront

---

**Última actualización**: 15 de Noviembre, 2025
**Versión**: 2.0
**Estado**: Fase 8 completada - Sistema bilingüe funcional (Fases 1-8: 100% completadas)
