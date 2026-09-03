# Plan de ejecución para el lanzamiento de Son de Nudos

- **Versión:** 1.1
- **Fecha base:** 2 de septiembre de 2026
- **Estado:** listo para ejecución
- **Estrategia aprobada:** catálogo y checkout propio en `sondenudos.com`, con Stripe Checkout como procesador de pagos.

## 1. Objetivo

Terminar Son de Nudos como una tienda pública segura, rápida y encontrable, con productos y fotografías reales, una experiencia coherente en español e inglés y un camino de compra que no pueda generar confirmaciones falsas.

Este documento sustituye el estado histórico de los planes de 2025 como fuente operativa. Esos documentos siguen siendo útiles como contexto, pero sus marcas de “completado” no garantizan que la función siga operativa en producción.

## 2. Estado de partida

La revisión de producción y del repositorio encontró la siguiente línea base:

- El dominio y el despliegue de Vercel están activos.
- La portada tiene una identidad visual sólida y adaptable a móvil.
- El proyecto compila, pero `npm run lint` no pasa y no existe una suite de pruebas del proyecto.
- Supabase no responde, por lo que catálogo, colecciones, configuración y administración están inoperantes.
- Producción cae en modo `mock`; el checkout puede mostrar éxito sin cobrar ni crear una orden real.
- Las políticas RLS confunden “usuario autenticado” con “administrador”.
- El repositorio público contiene credenciales administrativas históricas que deben rotarse y eliminarse.
- El sitemap devuelve error y publica rutas de producto distintas a las rutas reales de la aplicación.
- Faltan fotografías reales, fichas completas, contenido legal y configuración de indexación.
- El rendimiento móvil está limitado principalmente por imágenes sobredimensionadas y un bundle inicial grande.

## 3. Decisiones de alcance

### Camino de lanzamiento recomendado

La primera versión comercial utilizará:

1. Son de Nudos como sitio de marca, catálogo, colecciones y descubrimiento.
2. Stripe Checkout como procesador de pagos y Supabase como registro operativo de órdenes.
3. Supabase como fuente del catálogo y del panel administrativo.
4. Vercel como hosting y despliegue continuo.

El checkout existente se conservará como base visual, pero no se habilitará parcialmente. La sesión de Stripe, precios, variantes, descuentos y envío se validarán en el servidor antes de cobrar. El webhook será la fuente de verdad para confirmar la orden pagada.

### Decisiones que requieren al propietario

Antes de cerrar la Fase 0 hay que confirmar:

- Si se conserva el proyecto Supabase anterior o se crea uno nuevo.
- Acceso vigente a Vercel, registrador del dominio, Supabase, Stripe, Instagram y MailerLite.
- Códigos postales exactos de entrega local y tarifa final para los 48 estados contiguos y Washington, D. C.
- Cualquier excepción al plazo estándar aprobado de 1–3 días laborables para piezas bajo pedido.
- Excepciones de contenido que no puedan publicarse en ambos idiomas.
- Fecha objetivo de lanzamiento.

Las llaves y contraseñas se introducen directamente en los paneles de los proveedores. Nunca se escriben en el repositorio, tickets, commits ni documentación.

## 4. Reglas de ejecución y commits

### Un commit de cierre por fase

Cada fase termina con un único commit funcional y verificable. Durante el trabajo pueden existir commits locales de apoyo, pero antes de cerrar la fase se consolidarán en el commit indicado. No se mezclan cambios de dos fases.

Formato:

```text
<tipo>(<área>): <resultado observable>
```

Reglas:

- Crear una rama de trabajo con prefijo `codex/` para cada fase.
- Partir siempre del commit aprobado de la fase anterior.
- Ejecutar las validaciones de la fase antes de crear el commit.
- No incluir `.env`, secretos, exportaciones de clientes ni respaldos de base de datos.
- No desplegar producción desde una fase que no tenga su puerta de salida aprobada.
- Etiquetar el lanzamiento final como `v1.0.0` después de validar producción.
- Si aparecen arreglos urgentes fuera de alcance, documentarlos para la fase correcta; no esconderlos dentro del commit actual.

Cada cierre debe registrar:

- Commit y rama.
- Resultado de build, lint y pruebas.
- Evidencia visual de escritorio y móvil cuando aplique.
- Variables o acciones externas configuradas, sin revelar sus valores.
- Riesgos pendientes y decisión de continuar o detenerse.

## 5. Fases de ejecución

### Fase 0 — Línea base segura y decisiones

- **Duración estimada:** 0.5–1 día
- **Rama:** `codex/fase-0-linea-base`
- **Commit de cierre:** `chore(launch): establish secure production baseline`

#### Alcance

- Registrar Stripe como camino de compra aprobado para el MVP.
- Inventariar accesos a Vercel, dominio, Supabase, Stripe, Instagram y MailerLite.
- Rotar contraseñas y llaves potencialmente expuestas.
- Retirar credenciales de README, guías, scripts y datos de ejemplo.
- Evaluar si es necesario limpiar las credenciales del historial Git.
- Actualizar `.env.example` con nombres de variables, nunca con valores reales.
- Definir ubicación, moneda, regiones de envío, idioma principal y política de producción.
- Tomar un respaldo antes de modificar una base de datos recuperable.

#### Entregables

- Documentación pública sin credenciales.
- Registro privado de accesos verificados y llaves rotadas.
- Decisión escrita sobre Supabase y checkout.
- Lista de variables requeridas por ambiente.

#### Validación

```bash
npm run security:scan
npm run build
```

La búsqueda no debe encontrar credenciales reales. Los falsos positivos documentados se revisan manualmente.

#### Puerta de salida

- GitHub, Vercel, dominio, Supabase y Stripe tienen propietario y acceso confirmado.
- Cada servicio opcional no verificado queda deshabilitado o asignado explícitamente a una fase posterior.
- No queda una credencial operativa publicada.
- El camino de compra del MVP está decidido.
- Existe una decisión explícita de recuperar o reemplazar Supabase.

---

### Fase 1 — Restauración de datos y autorización

- **Duración estimada:** 2–4 días
- **Depende de:** Fase 0
- **Rama:** `codex/fase-1-supabase-seguro`
- **Commit de cierre:** `fix(security): restore Supabase and enforce admin authorization`

#### Alcance

- Recuperar el proyecto Supabase o crear el reemplazo.
- Aplicar el esquema mediante migraciones reproducibles.
- Crear una función o política común que valide la tabla de administradores activos.
- Reemplazar políticas que permiten escritura a cualquier usuario autenticado.
- Restringir productos públicos a los publicados y disponibles.
- Modelar por producto o variante `ready_to_ship` y `made_to_order`, con stock y plazo de preparación explícitos; usar 1–3 días laborables como plazo estándar bajo pedido.
- Validar cupones mediante función segura o endpoint, sin exponer la tabla completa.
- Limitar la configuración pública a campos que realmente necesita la tienda.
- Corregir las políticas del bucket de imágenes.
- Configurar variables separadas para desarrollo, preview y producción.
- Incorporar una comprobación de salud diaria, autenticada y sin secretos expuestos.
- Verificar en Vercel que el cron `/api/keepalive` obtiene `200` contra el proyecto nuevo y revisar sus logs durante al menos una ejecución programada.

#### Entregables

- Base de datos accesible y migrable desde cero.
- Panel administrativo protegido por autorización de base de datos.
- Catálogo público operativo aunque no tenga todavía el contenido final.
- Matriz de permisos para visitante, administrador y servicio servidor.

#### Pruebas mínimas

- Visitante puede leer únicamente productos publicados.
- Visitante no puede crear, modificar ni borrar registros.
- Usuario autenticado que no es administrador tampoco puede hacerlo.
- Administrador activo puede administrar catálogo e inventario.
- Las cargas y eliminaciones de imágenes respetan los mismos permisos.
- El sitio maneja una caída de Supabase con un mensaje controlado.

#### Puerta de salida

- No hay errores de conexión en portada, tienda ni panel.
- Las pruebas negativas de RLS fallan con acceso denegado.
- La URL de Supabase y sus llaves corresponden al ambiente correcto.
- El cron diario genera actividad real de base de datos y falla de forma visible si pierde acceso.
- `npm run build` y la nueva prueba de autorización pasan.

---

### Fase 2 — Checkout Stripe validado por servidor

- **Duración estimada:** 4–6 días
- **Depende de:** Fase 1
- **Rama:** `codex/fase-2-checkout-stripe`
- **Commit de cierre:** `feat(payments): add server-validated Stripe checkout`

#### Alcance

- Reemplazar la creación de sesiones en el navegador por `POST /api/checkout/create-session` en Vercel.
- Enviar al servidor solamente IDs de variante, cantidades, código de cupón y método/destino de entrega.
- Consultar en Supabase precios, stock, cupones y configuración de envío; nunca confiar en importes enviados por el navegador.
- Crear la Checkout Session mediante la clave secreta exclusiva del servidor y redirigir a la página alojada por Stripe.
- Eliminar el recogido en domicilio y ofrecer entrega local gratuita solo en códigos postales aprobados de Fort Myers, Naples, Cape Coral y Lehigh Acres.
- No publicar la dirección residencial; coordinar día y horario de entrega después de la compra.
- Limitar el lanzamiento a los 48 estados contiguos y Washington, D. C.; Canadá, México, Alaska, Hawái y otros destinos permanecerán deshabilitados.
- Hacer que Stripe recopile o verifique la dirección definitiva usada para calcular el envío.
- Convertir el webhook en un proceso idempotente que valide `payment_status`, persista la orden y descuente inventario de forma segura.
- Manejar `checkout.session.completed`, pagos asíncronos exitosos/fallidos y eventos duplicados.
- Incluir `{CHECKOUT_SESSION_ID}` en la URL de éxito y verificar la sesión antes de mostrar una confirmación.
- Retirar completamente el modo mock y cualquier confirmación falsa de pago de producción.

#### Entregables

- Flujo catálogo → carrito → Stripe → confirmación verificada, funcional en móvil y escritorio.
- Endpoint de creación de sesión protegido y validado.
- Webhook firmado, idempotente y conectado a órdenes e inventario.
- Matriz de precios, descuentos, entrega local, envío y stock probada en modo test.

#### Pruebas mínimas

- Alterar precio, descuento, envío o stock en el navegador no altera el importe cobrado.
- Una variante agotada no puede iniciar el cobro salvo que esté habilitada explícitamente como `made_to_order` y muestre el plazo estándar de 1–3 días laborables o una excepción específica.
- Una dirección fuera de los 48 estados contiguos y Washington, D. C. no puede completar el checkout.
- La entrega local gratuita solo aparece para códigos postales aprobados y el navegador no puede forzarla.
- El envío por zona produce el total correcto en Stripe y en Supabase.
- Un webhook repetido no duplica órdenes ni descuenta inventario dos veces.
- La página de éxito no confirma una compra impagada o inexistente.
- Los errores y eventos analíticos no contienen información personal ni secretos.

#### Puerta de salida

- Pasan las pruebas automatizadas del cálculo y las pruebas de integración del endpoint/webhook.
- Se completa una compra de extremo a extremo en Stripe test mode.
- Se completa una compra real controlada de importe mínimo antes de habilitar el CTA público.
- Precios, stock, impuestos, entrega local, envío, reembolsos y recibos reflejan la operación aprobada.

---

### Fase 3 — Catálogo, colecciones y contenido real

- **Duración estimada:** 3–7 días
- **Depende de:** Fases 1 y 2; disponibilidad de fotos y fichas
- **Rama:** `codex/fase-3-catalogo-real`
- **Commit de cierre:** `feat(catalog): publish the launch collection with final content`

#### Alcance

- Separar categorías de producto de colecciones narrativas o estacionales.
- Corregir filtros y navegación de collares, bolsos y vestibles.
- Completar por producto: nombre ES/EN, SKU, precio, stock, modo de preparación, materiales, dimensiones, cuidados, variantes y tiempo de preparación.
- Publicar fotografías reales: portada, detalle, escala, reverso/interior, variante y empaque.
- Convertir imágenes a WebP/AVIF con tamaños responsivos.
- Sustituir Unsplash, imágenes rotas y placeholders.
- Publicar una historia real de Priscilla, su proceso y la relación entre música y macramé.
- Revisar traducciones y evitar mezclar inglés y español en la misma experiencia.
- Detectar ES/EN desde el navegador, persistir la elección manual y usar inglés como respaldo.

#### Entregables

- Colección inicial completa y aprobada.
- Biblioteca de imágenes optimizada.
- Taxonomía estable de categorías y colecciones.
- Lista de productos que permanecen en borrador y motivo.

#### Validación

- Ninguna imagen devuelve 404.
- No se publica un producto sin foto principal, precio, disponibilidad y checkout operativo.
- Los filtros solo muestran categorías relevantes.
- Todas las imágenes informativas tienen texto alternativo útil.
- La portada no contiene fotografías genéricas presentadas como obra o retrato de la artista.

#### Puerta de salida

- Priscilla aprueba fotografías, precios, nombres y descripciones.
- Catálogo, Stripe y datos administrativos coinciden en precios, moneda y disponibilidad.
- La identidad se reconoce como “boho editorial contemporáneo / lujo artesanal orgánico”.

---

### Fase 4 — Calidad, accesibilidad, rendimiento y endurecimiento

- **Duración estimada:** 3–5 días
- **Depende de:** Fase 3
- **Rama:** `codex/fase-4-calidad-web`
- **Commit de cierre:** `fix(quality): meet launch accessibility and performance gates`

#### Alcance

- Resolver errores y advertencias relevantes de ESLint.
- Añadir pruebas unitarias para precios, filtros, carrito y permisos.
- Añadir pruebas de integración del catálogo, carrito y navegación a Stripe.
- Añadir un recorrido E2E del visitante y otro del administrador.
- Sanitizar o eliminar la inserción directa de HTML de producto.
- Añadir una página 404 real y estados de carga, vacío y error.
- Reparar enlaces del footer y actualizar el año automáticamente.
- Añadir nombres accesibles a menú, carrito y controles.
- Corregir contraste y jerarquía de encabezados.
- Dividir código por rutas y retirar dependencias innecesarias.
- Optimizar logo, favicon, fuentes e imágenes críticas.
- Añadir CSP, `X-Content-Type-Options`, Referrer Policy y Permissions Policy.
- Actualizar o sustituir dependencias vulnerables, especialmente las de producción.

#### Comandos de validación

```bash
npm run lint
npm run build
npm test
```

El script de pruebas deberá incorporarse al proyecto durante esta fase.

#### Objetivos medibles

- Cero errores de consola en portada, tienda, producto y administración.
- Cero errores de lint.
- Lighthouse móvil en portada y producto: rendimiento ≥ 85, accesibilidad ≥ 95 y buenas prácticas ≥ 95.
- LCP objetivo ≤ 2.5 s en las páginas críticas bajo la configuración de medición acordada.
- Ninguna vulnerabilidad crítica conocida en dependencias de producción.
- Todos los recorridos E2E críticos pasan.

#### Puerta de salida

- Las métricas anteriores quedan registradas.
- Se completa una revisión visual en iPhone/Safari, Android/Chrome y escritorio.
- No existen fallos abiertos de severidad crítica o alta.

---

### Fase 5 — SEO, contenido legal y medición

- **Duración estimada:** 2–4 días
- **Depende de:** Fases 3 y 4
- **Rama:** `codex/fase-5-seo-legal`
- **Commit de cierre:** `feat(discovery): add indexable catalog SEO and launch policies`

#### Alcance

- Corregir las URLs del sitemap y hacerlo tolerante a fallos controlados.
- Añadir productos, colecciones e imágenes al sitemap.
- Generar title, description, canonical, Open Graph y JSON-LD específicos por ruta.
- Sincronizar `<html lang>` con el idioma activo y añadir `hreflang` ES/EN.
- Publicar metadatos equivalentes en ambos idiomas y evitar que el contenido bilingüe dependa únicamente de JavaScript para su indexación.
- Prerenderizar o renderizar en servidor las páginas que deben indexarse.
- Evitar soft 404 y excluir administración, checkout y estados privados del índice.
- Publicar privacidad, cookies, términos, envíos, devoluciones y cuidados.
- Configurar analítica con consentimiento y eventos comerciales mínimos.
- Verificar el sitio en Google Search Console y enviar el sitemap.

#### Validación

- `/robots.txt` y `/sitemap.xml` responden 200 y contenido válido.
- Cada URL del sitemap resuelve a una página pública real.
- Un producto compartido muestra su propia imagen y descripción.
- Rich Results Test no reporta errores obligatorios de Product schema.
- Las páginas legales reflejan la operación real y están enlazadas desde el footer.
- Search Console reconoce el dominio y acepta el sitemap.

#### Puerta de salida

- No hay metadatos genéricos en productos o colecciones.
- No existen URLs indexables que muestren pantalla vacía.
- Se dispone de una línea base de visitas, vistas de producto, inicio de checkout y compras verificadas.

---

### Fase 6 — Ensayo, lanzamiento y observación

- **Duración estimada:** 1–2 días más 7 días de observación
- **Depende de:** Fases 0–5
- **Rama:** `codex/fase-6-release-v1`
- **Commit de cierre:** `chore(release): prepare Son de Nudos v1.0.0`

#### Alcance

- Crear un despliegue preview desde el commit candidato.
- Ejecutar la matriz de pruebas completa.
- Verificar catálogo, carrito, Stripe, webhook, formularios, newsletter, Instagram y panel.
- Probar redirecciones de dominio, HTTPS, 404, sitemap y robots.
- Confirmar backup y procedimiento de rollback.
- Corregir únicamente defectos de lanzamiento; cualquier mejora nueva vuelve al backlog.
- Fusionar la fase, desplegar producción y etiquetar `v1.0.0`.
- Observar errores, disponibilidad, clics de compra e indexación durante siete días.

#### Checklist de go/no-go

- [ ] Dominio y certificado correctos.
- [ ] Supabase saludable y con respaldo.
- [ ] Credenciales rotadas y fuera del repositorio.
- [ ] Catálogo aprobado y sin placeholders.
- [ ] Precios, stock, envío y totales coinciden entre sitio, Stripe y Supabase.
- [ ] No existe checkout simulado accesible.
- [ ] Build, lint y pruebas pasan.
- [ ] Accesibilidad y rendimiento cumplen la puerta acordada.
- [ ] Políticas legales publicadas.
- [ ] Sitemap aceptado por Search Console.
- [ ] Analytics y alertas de error funcionan.
- [ ] Existe un commit anterior conocido al cual volver.

#### Rollback

Si aparece un fallo que impida navegar, comprar o administrar:

1. Restaurar en Vercel el deployment estable anterior.
2. No revertir migraciones con pérdida de datos; aplicar una migración correctiva.
3. Desactivar el CTA afectado mediante configuración si el catálogo puede permanecer visible.
4. Registrar el incidente, alcance, hora y solución antes de volver a desplegar.

#### Puerta de salida

- Producción pasa una prueba de humo desde una red y dispositivo externos.
- No hay errores críticos durante las primeras 24 horas.
- Se completa la revisión de siete días y los problemas no críticos pasan al backlog.

## 6. Decisión técnica de Stripe

Se usará Stripe Checkout alojado por Stripe para el MVP. La página propia seguirá recopilando la información mínima necesaria para presentar opciones, pero el servidor recalculará todos los importes y Stripe recogerá o verificará la dirección definitiva. La entrega local gratuita se decidirá en el servidor mediante una lista de códigos postales aprobados; no habrá recogido en la residencia ni se publicará su dirección. La clave secreta permanecerá únicamente en variables cifradas de Vercel.

El código existente de `src/server/stripe.ts` es una referencia insegura porque se importa desde el cliente y acepta precios, descuentos y envío calculados por el navegador. Se sustituirá, no se activará. La confirmación depende del webhook y del estado real de la Checkout Session, nunca de una simple redirección del navegador.

## 7. Orden de trabajo y calendario

| Semana | Trabajo principal | Resultado |
|---|---|---|
| 1 | Fases 0 y 1 | Infraestructura recuperada y acceso seguro |
| 2 | Fases 2 y 3 | Checkout Stripe seguro y catálogo real |
| 3 | Fases 4 y 5 | Calidad, rendimiento, accesibilidad y SEO |
| Cierre | Fase 6 | Publicación y observación |

Duración estimada del MVP: **10–17 días laborables**, condicionada por la entrega y aprobación de fotografías, fichas de producto y reglas comerciales.

## 8. Registro de ejecución

Esta tabla se actualiza al cerrar cada fase:

| Fase | Estado | Rama | Commit | Evidencia / notas |
|---|---|---|---|---|
| 0 | Completada | `codex/fase-0-linea-base` | `chore(launch): establish secure production baseline` | Historial redactado, infraestructura crítica verificada y operación base aprobada |
| 1 | Completada | `codex/fase-1-supabase-seguro` | `fix(security): restore Supabase and enforce admin authorization` | Producción conectada al proyecto nuevo, 22/22 pruebas RLS, administrador activo y cron verificado con `200` |
| 2 | Pendiente | `codex/fase-2-checkout-stripe` | — | — |
| 3 | Pendiente | `codex/fase-3-catalogo-real` | — | — |
| 4 | Pendiente | `codex/fase-4-calidad-web` | — | — |
| 5 | Pendiente | `codex/fase-5-seo-legal` | — | — |
| 6 | Pendiente | `codex/fase-6-release-v1` | — | — |

## 9. Definición global de terminado

Son de Nudos se considera listo para anunciar públicamente cuando:

- Una persona puede descubrir una colección, entender una pieza, pagar mediante Stripe y recibir una confirmación verificable.
- El sitio no muestra datos simulados como si fueran transacciones reales.
- Visitantes y usuarios no administradores no pueden modificar datos.
- Fotografías, precios, disponibilidad, descripción y políticas representan el negocio real.
- No hay errores críticos de código, consola, accesibilidad, seguridad o dependencias.
- Los buscadores pueden rastrear productos y colecciones mediante URLs, metadatos y sitemap válidos.
- El propietario sabe cómo actualizar productos, revisar el sitio y volver al deployment anterior.
