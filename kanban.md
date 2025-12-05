# Kanban Board

<!-- Config: Last Task ID: 11 -->

## ⚙️ Configuration

**Columns**: 📝 To Do (todo) | 🚀 In Progress (in-progress) | 👀 In Review (in-review) | ✅ Done (done)

**Categories**: Frontend, Backend, Admin Panel, Database, DevOps, Design, i18n, Tests, Documentation, Backend, Frontend, Admin Panel, Frontend

**Users**: @mario, @claude

**Priorities**: 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

**Tags**: #feature, #bug, #refactor, #docs, #performance, #security, #ui, #api, #stripe, #supabase #api #feature #tests #admin #marketing #devops #vercel #backend #i18n #stripe #docs

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

### TASK-011 | Sistema de Carritos Abandonados
**Priority**: Medium | **Category**: Backend, Frontend | **Assigned**: @claude
**Created**: 2025-12-05 | **Due**: 2025-12-20
**Tags**: #feature #supabase #marketing

Sistema para recuperar ventas de carritos abandonados. Requiere captura de email temprana y envío de correos de recordatorio.

**Subtasks**:
- [ ] Crear tabla `abandoned_carts` en Supabase (email, items, created_at, recovered, reminder_sent_at)
- [ ] Capturar email del cliente al inicio del checkout (antes de completar)
- [ ] Guardar estado del carrito en Supabase cuando hay email capturado
- [ ] Endpoint para Vercel Cron Job que detecte carritos >24h sin comprar
- [ ] Integración con MailerLite para enviar email de recordatorio con items
- [ ] Página `/cart/recover?token=xxx` para restaurar carrito desde email
- [ ] Dashboard en admin mostrando carritos abandonados y tasa de recuperación

**Notes**:
Requiere que el cliente ingrese email antes de abandonar. El localStorage ya guarda el carrito localmente (TASK completada hoy). Este feature agrega la capacidad de enviar recordatorios por correo.

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
**Created**: 2025-12-01
**Tags**: #devops #supabase #vercel #backend

Sistema automático para evitar que Supabase pause el proyecto por inactividad en el tier gratuito. **Implementación**: - ✅ Endpoint serverless `/api/keepalive` creado - ✅ Query simple `SELECT id FROM 

### TASK-009 | Conectar página pública a Supabase
**Priority**: Critical | **Category**: Backend, Frontend | **Assigned**: @claude
**Created**: 2025-12-02
**Tags**: #feature #supabase #i18n

Conectar la página pública de la tienda para que muestre productos desde Supabase en lugar del JSON estático. **Implementación**: - ✅ Creado `supabase-public.ts` con API pública de solo lectura - ✅ Fu

### TASK-004 | Webhook de Stripe para guardar pedidos
**Priority**: Critical | **Category**: Backend | **Assigned**: @claude
**Created**: 2025-11-23
**Tags**: #stripe #api #supabase

Endpoint que escucha eventos de Stripe y guarda pedidos automáticamente en Supabase. **Implementación**: - ✅ Creado endpoint `/api/webhook-stripe` - ✅ Verificación de firma con `stripe.webhooks.constr

### TASK-003 | Sistema de zonas de envío + Google Places
**Priority**: High | **Category**: Admin Panel, Frontend | **Assigned**: @claude
**Created**: 2025-11-23
**Tags**: #feature #admin #supabase #api

Sistema de envío por zonas con autocompletado de direcciones usando Google Places API. **Implementación**: - ✅ Página `/admin/settings` para configurar costos de envío por zona - ✅ Sistema de 3 zonas:

### TASK-007 | Documentar admin panel en README
**Priority**: Medium | **Category**: Documentation | **Assigned**: @claude
**Created**: 2025-11-23
**Tags**: #docs

Agregar sección completa en README.md documentando el panel de administración. **Implementación**: - ✅ Documentado URL de acceso (producción y local) - ✅ Credenciales por defecto con advertencia de se

