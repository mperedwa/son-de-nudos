# Kanban Board

<!-- Config: Last Task ID: 007 -->

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

### TASK-004 | Webhook de Stripe para guardar pedidos

**Priority**: Critical | **Category**: Backend | **Assigned**: @claude
**Created**: 2025-11-23 | **Due**: 2025-11-30
**Tags**: #stripe #api #supabase

Endpoint que escucha eventos de Stripe y guarda pedidos automáticamente en Supabase.

**Subtasks**:
- [ ] Crear endpoint /api/webhooks/stripe
- [ ] Verificar firma del webhook con Stripe secret
- [ ] Escuchar evento checkout.session.completed
- [ ] Extraer items, customer_email, shipping_address, amounts
- [ ] Crear order en tabla orders de Supabase
- [ ] Manejar errores y reintentos
- [ ] Configurar webhook en Stripe Dashboard

**Notes**:
Crítico para que los pedidos de producción se guarden automáticamente. Sin esto, los pedidos de Stripe no aparecen en el admin.

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

### TASK-007 | Documentar admin panel en README

**Priority**: Medium | **Category**: Documentation | **Assigned**: @claude
**Created**: 2025-11-23 | **Due**: 2025-12-01
**Tags**: #docs

Agregar sección completa en README.md documentando el panel de administración.

**Subtasks**:
- [ ] Documentar URL de acceso (/admin/login)
- [ ] Explicar credenciales por defecto
- [ ] Listar funcionalidades disponibles (productos, pedidos, cupones, inventario)
- [ ] Instrucciones para crear usuarios admin adicionales
- [ ] Screenshots de las pantallas principales

**Notes**:
Importante para que otros desarrolladores o el cliente puedan usar el admin sin ayuda.

---

## 🚀 In Progress

## 👀 In Review

## ✅ Done
