# Fase 1 — Supabase y autorización segura

- **Fecha de inicio:** 2 de septiembre de 2026
- **Rama:** `codex/fase-1-supabase-seguro`
- **Estado:** completada
- **Proyecto remoto:** `icqbyybjhdaxvobfcnia` (`son-de-nudos`, `us-east-2`)

## Objetivo

Restaurar el esquema de Son de Nudos en el proyecto nuevo, impedir que un usuario autenticado normal obtenga permisos administrativos y dejar catálogo, panel, Storage y keepalive sobre una base reproducible.

## Línea base remota

- El proyecto está `ACTIVE_HEALTHY`.
- Auth responde correctamente.
- Las once migraciones están aplicadas y el historial local/remoto coincide.
- El lint remoto de los esquemas `extensions`, `private` y `public` no reporta errores.
- La prueba remota pasa 22 controles de Auth, RLS, inventario y Storage.
- Las variables nuevas están sincronizadas en Development, Preview y Production de Vercel, pero solo entrarán en vigor en deployments nuevos.

## Hallazgos corregidos localmente

- Las políticas históricas comprobaban `auth.role() = 'authenticated'`, que no distingue un administrador de cualquier usuario con sesión.
- Cupones activos podían enumerarse públicamente.
- Productos en borrador eran legibles públicamente.
- Cualquier usuario autenticado podía modificar productos, variantes, colecciones, configuración e imágenes.
- Cualquier usuario autenticado podía leer y modificar pedidos.
- La actualización del administrador permitía modificar toda su fila, no únicamente `last_login_at`.
- `admins.password_hash` seguía existiendo aunque Supabase Auth administra las contraseñas.
- El historial de inventario podía duplicarse porque el trigger y el cliente insertaban el mismo cambio por separado.
- La configuración pública se consultaba con `select('*')`, exponiendo campos internos como `notification_email`.
- El registro público de usuarios estaba habilitado y la política mínima de contraseña era débil.

## Diseño aplicado

- Función `private.is_admin()` con `SECURITY DEFINER`, `search_path` vacío y acceso limitado a usuarios autenticados.
- Privilegios SQL revocados y concedidos explícitamente por tabla y operación.
- Políticas separadas para lectura pública y administración.
- Productos públicos limitados a `available_for_sale = true` y variantes públicas limitadas a productos publicados.
- Cupones, pedidos e historial restringidos a administradores; el futuro checkout usará `service_role` exclusivamente desde servidor.
- Administradores pueden leer su propia fila activa y actualizar solamente `last_login_at`.
- Storage público para lectura y restringido a administradores activos para escritura.
- Actualización atómica de stock mediante `admin_set_variant_stock`, con un único registro de historial.
- Variantes con modo `ready_to_ship` o `made_to_order` y plazo de preparación validado.
- Registro público deshabilitado, contraseña mínima de 12 caracteres, requisitos de complejidad, TOTP disponible y códigos OTP de correo de 8 dígitos.
- Pruebas pgTAP para visitante, usuario autenticado sin privilegios y administrador.
- Prueba de integración remota reproducible que crea datos y usuarios efímeros y los elimina al finalizar.
- Script seguro para vincular una cuenta de Supabase Auth ya creada sin recibir ni imprimir su contraseña.
- Sincronización reproducible de las variables Supabase de Vercel mediante su API autenticada, sin imprimir valores.
- Exclusión explícita de archivos locales, documentación operativa, scripts y migraciones del paquete enviado a Vercel.

## Validación

- [x] `npm run build` después de actualizar los tipos y consumidores.
- [x] `supabase db push --dry-run --linked` detecta las once migraciones pendientes sin aplicar cambios.
- [x] Aplicar las once migraciones al proyecto vacío y comprobar que no quedan pendientes.
- [x] Ejecutar `npm run db:test:remote`: 22/22 comprobaciones pasan.
- [x] Ejecutar `supabase db lint --linked --fail-on error`: sin errores.
- [x] Aplicar configuración Auth: altas públicas bloqueadas, email/password administrativo operativo, contraseña robusta, confirmación de correo, TOTP y OTP de 8 dígitos.
- [x] Crear y vincular el primer administrador mediante Supabase Auth sin conocer ni guardar su contraseña.
- [x] Configurar las cinco variables Supabase nuevas en Development, Preview y Production de Vercel.
- [x] Crear un deployment Preview y comprobar portada, catálogo, panel, robots y sitemap antes de promover cambios.
- [x] Verificar que `/api/keepalive` rechaza una llamada pública con `401` y responde `200` con el secreto de Vercel.
- [x] Crear un deployment Production con rollback identificado y dominios asignados.
- [x] Confirmar el cron en Vercel y disparar una ejecución desde su propio sistema: respuesta `200`.

## Evidencia del Preview

- **Deployment:** `dpl_8uKL14PsLjYMmeJRfjepP94d5b9H`
- **Estado:** `Ready`
- **Región de build:** `iad1` (Washington, D. C.)
- El bundle contiene únicamente `icqbyybjhdaxvobfcnia.supabase.co` como host de Supabase.
- Portada, `/tienda`, `/admin/login`, `/robots.txt` y `/sitemap.xml` responden `200` mediante el bypass autenticado de Preview.
- El catálogo muestra cero productos porque la base nueva todavía no contiene el catálogo real; no cae en datos simulados.
- El keepalive autenticado devolvió `success: true` y realizó una consulta real con cero filas.
- La revisión del navegador en portada, tienda y login no produjo errores propios del sitio.

## Evidencia de producción

- **Deployment:** `dpl_2VYW6XunaTw1qdwELWcPSjdh9eTU`
- **Estado:** `Ready`
- **Dominios:** `https://www.sondenudos.com` y `https://sondenudos.com`.
- **Rollback verificado:** `dpl_5QSiVpn5KpsHmgpbkHN2LsevF4XC`.
- Portada, tienda, login, robots y sitemap responden `200`; el dominio raíz llega a `www`.
- El keepalive público responde `401`; con autorización responde `200` y consulta el proyecto nuevo.
- Vercel registró `/api/keepalive` con `17 13 * * *` y su ejecución manual desde el sistema produjo `200` en los logs de producción.
- Próxima ejecución automática ordinaria: diariamente a las 13:17 UTC (09:17 en horario de verano del este).

## Riesgos asignados a fases posteriores

- La tienda muestra cero productos hasta cargar el catálogo real en la Fase 3; no presenta productos simulados.
- El build de Vercel advierte que el tipo `shipping_details` del webhook no coincide con la versión actual de Stripe. Stripe continúa deshabilitado y el endpoint se sustituirá en la Fase 2 antes de aceptar pagos.
- El bundle inicial supera 500 kB; la división por rutas está asignada a la Fase 4.

## Limitación del entorno local

Esta Mac no tiene Docker Desktop, OrbStack, Podman, Colima ni otro runtime compatible disponible. El comando `supabase test db --linked` también intenta iniciar Docker en esta versión del CLI. Por eso, la misma matriz se cubre con pgTAP para un futuro entorno local y con `npm run db:test:remote` para el proyecto aprobado; esta última usa las API públicas reales y limpia todos sus fixtures. Las variables de Vercel apuntan al proyecto nuevo, pero el deployment público existente conserva su configuración anterior hasta que se genere uno nuevo.
