# Kanban Board

<!-- Config: Last Task ID: 009 -->

## ⚙️ Configuration

**Columns**: 📝 To Do | 🚀 In Progress | 👀 In Review | ✅ Done
**Categories**: Frontend, Backend, Admin Panel, Database, DevOps, Design, i18n, Tests, Documentation
**Users**: @mario, @claude
**Tags**: #feature, #bug, #refactor, #docs, #performance, #security, #ui, #api, #stripe, #supabase

---

## 📝 To Do

### TASK-001 | Integrar Shopify Storefront API

**Priority**: Low | **Category**: Backend | **Assigned**: @claude
**Created**: 2025-11-23 | **Due**: 2025-12-08
**Tags**: #api #feature

Modo alternativo de datos que usa Shopify para cargar productos. Mapping a modelo Product, checkout redirige a checkoutUrl de Shopify.

**Subtasks**:
- [ ] Crear cliente Shopify con Storefront API
- [ ] Implementar mapping de productos Shopify → modelo Product
- [ ] Configurar checkout redirect a Shopify
- [ ] Documentar configuración en README

**Notes**:
Tarea opcional, no prioritaria. Solo implementar si se requiere integración con Shopify.

---

### TASK-002 | Pruebas unitarias para money.ts y filters.ts

**Priority**: Medium | **Category**: Tests | **Assigned**: @claude
**Created**: 2025-11-23 | **Due**: 2025-12-09
**Tags**: #tests

Implementar cobertura de tests unitarios para las funciones de utilidad más críticas del proyecto.

**Subtasks**:
- [ ] Configurar Vitest en el proyecto
- [ ] Tests para formatMoney, addMoney, subtractMoney, multiplyMoney
- [ ] Tests para filterProducts, sortProducts, paginateProducts
- [ ] Tests para getUniqueOptionValues, getPriceRange
- [ ] Configurar script npm run test

**Notes**:
Pendiente para futura iteración. Asegurar cobertura de casos edge.

---

### TASK-003 | Configuración de envío en admin panel

**Priority**: High | **Category**: Admin Panel | **Assigned**: @claude
**Created**: 2025-11-23 | **Due**: 2025-11-29
**Tags**: #feature #admin #supabase

Página /admin/settings con formulario editable para configurar costos de envío.

**Subtasks**:
- [ ] Crear página /admin/settings
- [ ] Formulario para costo de envío estándar
- [ ] Campo para umbral de envío gratis
- [ ] Selector de moneda
- [ ] Guardar en tabla shipping_config de Supabase
- [ ] Cargar configuración actual al abrir

**Notes**:
Actualmente los valores están hardcodeados en config.ts. Esta tarea los hace editables desde el admin.

---

### TASK-005 | Histórico de cambios de stock

**Priority**: Medium | **Category**: Admin Panel | **Assigned**: @claude
**Created**: 2025-11-23 | **Due**: 2025-11-30
**Tags**: #feature #admin #supabase

Vista en /admin/inventory/history mostrando el registro de todos los cambios de stock.

**Subtasks**:
- [ ] Crear página /admin/inventory/history
- [ ] Tabla con columnas: variante, cambio (+/-), razón, stock anterior, stock nuevo, admin, fecha
- [ ] Filtros por variante, fecha, tipo de cambio
- [ ] Paginación
- [ ] Link desde página principal de inventario

**Notes**:
La tabla stock_history ya existe y se llena automáticamente con el trigger. Solo falta la UI para visualizarla.

---

### TASK-006 | Tests E2E del admin panel

**Priority**: Low | **Category**: Tests | **Assigned**: @claude
**Created**: 2025-11-23 | **Due**: 2025-12-01
**Tags**: #tests #admin

Tests end-to-end con Playwright para validar flujos críticos del panel de administración.

**Subtasks**:
- [ ] Instalar y configurar Playwright
- [ ] Test de login con credenciales válidas/inválidas
- [ ] Test de crear producto con imágenes
- [ ] Test de editar stock de variante
- [ ] Test de crear cupón
- [ ] Test de ver lista de pedidos
- [ ] Verificar que RLS funciona (no acceso sin auth)

**Notes**:
Baja prioridad. Implementar después de estabilizar funcionalidades del admin.

---

## 🚀 In Progress

## 👀 In Review

## ✅ Done

### TASK-008 | Implementar Supabase Keepalive con Vercel Cron Jobs

**Priority**: High | **Category**: DevOps | **Assigned**: @claude
**Created**: 2025-12-01 | **Completed**: 2025-12-01
**Tags**: #devops #supabase #vercel #backend

Sistema automático para evitar que Supabase pause el proyecto por inactividad en el tier gratuito.

**Implementación**:
- ✅ Endpoint serverless `/api/keepalive` creado
- ✅ Query simple `SELECT id FROM products LIMIT 1` para mantener DB activa
- ✅ Vercel Cron Job configurado en `vercel.json` (schedule: `0 0 */5 * *`)
- ✅ Autenticación con `CRON_SECRET` para seguridad
- ✅ Instalado `@vercel/node` para tipos TypeScript
- ✅ Documentado `CRON_SECRET` en `.env.example`
- ✅ Creado `api/README.md` con guía completa
- ✅ Variable de entorno configurada en Vercel Dashboard

**Resultado**:
El proyecto de Supabase se mantiene activo automáticamente. Cron job ejecuta cada 5 días, evitando los 7 días de inactividad que causan la pausa.

**Files**: `api/keepalive.ts`, `vercel.json`, `.env.example`, `api/README.md`

---

### TASK-009 | Conectar página pública a Supabase

**Priority**: Critical | **Category**: Backend, Frontend | **Assigned**: @claude
**Created**: 2025-12-02 | **Completed**: 2025-12-02
**Tags**: #feature #supabase #i18n

Conectar la página pública de la tienda para que muestre productos desde Supabase en lugar del JSON estático.

**Implementación**:
- ✅ Creado `supabase-public.ts` con API pública de solo lectura
- ✅ Funciones: `getPublicProducts()`, `getPublicProductByHandle()`, `searchPublicProducts()`
- ✅ Actualizado `index.tsx` para cargar desde Supabase con soporte bilingüe
- ✅ Actualizado `[handle].tsx` para cargar producto individual desde Supabase
- ✅ Actualizado `VariantSelector.tsx` con traducciones de opciones
- ✅ Corregido error de TypeScript que causaba fallo de deployment
- ✅ Handle automático desde título en sistema de importación Excel

**Resultado**:
Los productos creados en el panel admin (`/admin/products`) ahora aparecen automáticamente en la tienda pública. Soporte bilingüe completo: muestra `title_en`/`description_html_en` cuando el usuario está en inglés.

**Files**: `src/lib/supabase-public.ts`, `src/app/routes/index.tsx`, `src/app/routes/product/[handle].tsx`, `src/components/VariantSelector.tsx`, `src/i18n/locales/*/product.json`

---

### TASK-004 | Webhook de Stripe para guardar pedidos

**Priority**: Critical | **Category**: Backend | **Assigned**: @claude
**Created**: 2025-11-23 | **Completed**: 2025-12-03
**Tags**: #stripe #api #supabase

Endpoint que escucha eventos de Stripe y guarda pedidos automáticamente en Supabase.

**Implementación**:
- ✅ Creado endpoint `/api/webhook-stripe`
- ✅ Verificación de firma con `stripe.webhooks.constructEvent()`
- ✅ Evento soportado: `checkout.session.completed`
- ✅ Extracción de items, customer_email, shipping_address, amounts desde metadata
- ✅ Inserción en tabla `orders` con `SUPABASE_SERVICE_ROLE_KEY` (bypass RLS)
- ✅ Manejo de duplicados (verifica `stripe_session_id` único)
- ✅ Actualizado `src/server/stripe.ts` con metadata completa (items, subtotal, discount, shipping)
- ✅ Documentado en `api/README.md` con instrucciones de configuración
- ✅ Agregado `STRIPE_WEBHOOK_SECRET` a `.env.example`

**Resultado**:
Los pedidos de Stripe se guardan automáticamente en Supabase con status `paid`. Visibles inmediatamente en `/admin/orders`.

**Configuración requerida**:
1. Crear webhook en Stripe Dashboard → `https://www.sondenudos.com/api/webhook-stripe`
2. Agregar `STRIPE_WEBHOOK_SECRET` en Vercel

**Files**: `api/webhook-stripe.ts`, `src/server/stripe.ts`, `.env.example`, `api/README.md`

---

### TASK-007 | Documentar admin panel en README

**Priority**: Medium | **Category**: Documentation | **Assigned**: @claude
**Created**: 2025-11-23 | **Completed**: 2025-12-03
**Tags**: #docs

Agregar sección completa en README.md documentando el panel de administración.

**Implementación**:
- ✅ Documentado URL de acceso (producción y local)
- ✅ Credenciales por defecto con advertencia de seguridad
- ✅ Tabla de módulos con rutas y descripciones
- ✅ Guía de uso detallada para cada módulo:
  - Productos: crear, agregar variantes, clonar
  - Pedidos: estados, cambiar estado, filtros
  - Cupones: crear, configurar, cupones preconfigurados
  - Inventario: edición rápida, filtros
- ✅ Instrucciones para crear usuarios admin adicionales
- ✅ Diagrama de arquitectura del admin
- ✅ Documentación del webhook de Stripe
- ✅ Actualizado roadmap con tareas completadas

**Resultado**:
Documentación completa del panel admin en README.md. Cualquier usuario puede entender cómo usar el sistema sin ayuda externa.

**Files**: `README.md`
