# Plan de ejecución para el lanzamiento de Son de Nudos

- **Versión:** 1.0
- **Fecha base:** 2 de septiembre de 2026
- **Estado:** listo para ejecución
- **Estrategia recomendada:** catálogo propio en `sondenudos.com` con compra en Etsy para el MVP; Stripe propio queda como evolución posterior.

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
2. Etsy como checkout y sistema de órdenes.
3. Supabase como fuente del catálogo y del panel administrativo.
4. Vercel como hosting y despliegue continuo.

Este camino reduce el riesgo y permite vender antes. La integración Stripe actual no se habilitará parcialmente: permanecerá fuera de producción hasta que exista un backend seguro y pruebas de compra reales.

### Decisiones que requieren al propietario

Antes de cerrar la Fase 0 hay que confirmar:

- Si se conserva el proyecto Supabase anterior o se crea uno nuevo.
- Acceso vigente a Vercel, registrador del dominio, Supabase, Etsy, Instagram y MailerLite.
- Ciudad/estado real de operación y territorios de envío.
- Política de fabricación: inventario disponible, piezas únicas o fabricación bajo pedido.
- Idioma principal de entrada: español o inglés.
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

- Confirmar el camino Etsy para el MVP o documentar formalmente una decisión diferente.
- Inventariar accesos a Vercel, dominio, Supabase, Etsy, Instagram y MailerLite.
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
git grep -n -E '[REDACTED]|service_role|sk_live|sk_test'
npm run build
```

La búsqueda no debe encontrar credenciales reales. Los falsos positivos documentados se revisan manualmente.

#### Puerta de salida

- Todos los servicios tienen un propietario y acceso confirmado.
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
- Validar cupones mediante función segura o endpoint, sin exponer la tabla completa.
- Limitar la configuración pública a campos que realmente necesita la tienda.
- Corregir las políticas del bucket de imágenes.
- Configurar variables separadas para desarrollo, preview y producción.
- Incorporar una comprobación de salud que no exponga secretos.

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
- `npm run build` y la nueva prueba de autorización pasan.

---

### Fase 2 — Camino de compra vendible mediante Etsy

- **Duración estimada:** 2–3 días
- **Depende de:** Fase 1
- **Rama:** `codex/fase-2-checkout-etsy`
- **Commit de cierre:** `feat(commerce): connect product purchases to verified Etsy listings`

#### Alcance

- Añadir a cada producto un enlace verificado a su listing de Etsy.
- Mostrar “Comprar en Etsy” solamente cuando el producto esté disponible y tenga enlace válido.
- Preservar idioma, producto y colección en la experiencia previa al clic.
- Registrar eventos de producto visto, intención de compra y salida a Etsy.
- Retirar o bloquear el checkout simulado, `/success` engañoso y cualquier CTA que aparente cobrar dentro del sitio.
- Explicar claramente que el pago, envío y orden se completan en Etsy.
- Definir comportamiento para piezas agotadas o fabricadas bajo pedido.

#### Entregables

- Flujo colección → producto → Etsy funcional en móvil y escritorio.
- Catálogo sin caminos de pago simulados.
- Eventos de conversión documentados.

#### Pruebas mínimas

- Todos los enlaces apuntan al listing correcto y usan HTTPS.
- Un producto agotado no ofrece compra.
- Un producto sin listing muestra una alternativa clara de contacto o aviso.
- No existe una forma pública de llegar a una confirmación falsa de pago.
- Los eventos no contienen información personal.

#### Puerta de salida

- Se prueba manualmente una compra o checkout de Etsy hasta el último paso seguro.
- El propietario confirma que precios, stock y variantes coinciden con Etsy.
- No se muestra ninguna promesa de pago, envío o recogido no respaldada.

---

### Fase 3 — Catálogo, colecciones y contenido real

- **Duración estimada:** 3–7 días
- **Depende de:** Fases 1 y 2; disponibilidad de fotos y fichas
- **Rama:** `codex/fase-3-catalogo-real`
- **Commit de cierre:** `feat(catalog): publish the launch collection with final content`

#### Alcance

- Separar categorías de producto de colecciones narrativas o estacionales.
- Corregir filtros y navegación de collares, bolsos y vestibles.
- Completar por producto: nombre ES/EN, SKU, precio, stock, materiales, dimensiones, cuidados, variantes, tiempo de preparación y enlace Etsy.
- Publicar fotografías reales: portada, detalle, escala, reverso/interior, variante y empaque.
- Convertir imágenes a WebP/AVIF con tamaños responsivos.
- Sustituir Unsplash, imágenes rotas y placeholders.
- Publicar una historia real de Priscilla, su proceso y la relación entre música y macramé.
- Revisar traducciones y evitar mezclar inglés y español en la misma experiencia.

#### Entregables

- Colección inicial completa y aprobada.
- Biblioteca de imágenes optimizada.
- Taxonomía estable de categorías y colecciones.
- Lista de productos que permanecen en borrador y motivo.

#### Validación

- Ninguna imagen devuelve 404.
- No se publica un producto sin foto principal, precio, disponibilidad y enlace de compra.
- Los filtros solo muestran categorías relevantes.
- Todas las imágenes informativas tienen texto alternativo útil.
- La portada no contiene fotografías genéricas presentadas como obra o retrato de la artista.

#### Puerta de salida

- Priscilla aprueba fotografías, precios, nombres y descripciones.
- Catálogo web y Etsy coinciden.
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
- Añadir pruebas de integración del catálogo y navegación a Etsy.
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
- Se dispone de una línea base de visitas, vistas de producto y clics hacia Etsy.

---

### Fase 6 — Ensayo, lanzamiento y observación

- **Duración estimada:** 1–2 días más 7 días de observación
- **Depende de:** Fases 0–5
- **Rama:** `codex/fase-6-release-v1`
- **Commit de cierre:** `chore(release): prepare Son de Nudos v1.0.0`

#### Alcance

- Crear un despliegue preview desde el commit candidato.
- Ejecutar la matriz de pruebas completa.
- Verificar catálogo, enlaces Etsy, formularios, newsletter, Instagram y panel.
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
- [ ] Precios y stock coinciden con Etsy.
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

## 6. Evolución posterior — Checkout Stripe propio

Stripe se planifica después de estabilizar el MVP. No se habilita reutilizando el flujo cliente actual.

- **Rama sugerida:** `codex/fase-7-stripe-servidor`
- **Commit sugerido:** `feat(payments): add server-validated Stripe checkout`

Requisitos mínimos:

- Endpoint servidor para crear Checkout Sessions.
- Precios, variantes, descuentos y envío consultados y calculados en servidor.
- Webhook verificado e idempotente.
- Actualización atómica de orden, inventario y uso del cupón.
- Validación de `session_id` antes de mostrar una compra exitosa.
- Manejo de pago fallido, cancelación, reembolso y eventos asíncronos.
- Pruebas en Stripe test mode y una compra real controlada antes de habilitarlo.

## 7. Orden de trabajo y calendario

| Semana | Trabajo principal | Resultado |
|---|---|---|
| 1 | Fases 0 y 1 | Infraestructura recuperada y acceso seguro |
| 2 | Fases 2 y 3 | Catálogo real con compra en Etsy |
| 3 | Fases 4 y 5 | Calidad, rendimiento, accesibilidad y SEO |
| Cierre | Fase 6 | Publicación y observación |

Duración estimada del MVP: **8–14 días laborables**, condicionada por la entrega y aprobación de fotografías y fichas de producto.

## 8. Registro de ejecución

Esta tabla se actualiza al cerrar cada fase:

| Fase | Estado | Rama | Commit | Evidencia / notas |
|---|---|---|---|---|
| 0 | Pendiente | `codex/fase-0-linea-base` | — | — |
| 1 | Pendiente | `codex/fase-1-supabase-seguro` | — | — |
| 2 | Pendiente | `codex/fase-2-checkout-etsy` | — | — |
| 3 | Pendiente | `codex/fase-3-catalogo-real` | — | — |
| 4 | Pendiente | `codex/fase-4-calidad-web` | — | — |
| 5 | Pendiente | `codex/fase-5-seo-legal` | — | — |
| 6 | Pendiente | `codex/fase-6-release-v1` | — | — |

## 9. Definición global de terminado

Son de Nudos se considera listo para anunciar públicamente cuando:

- Una persona puede descubrir una colección, entender una pieza y llegar al listing correcto para comprarla.
- El sitio no muestra datos simulados como si fueran transacciones reales.
- Visitantes y usuarios no administradores no pueden modificar datos.
- Fotografías, precios, disponibilidad, descripción y políticas representan el negocio real.
- No hay errores críticos de código, consola, accesibilidad, seguridad o dependencias.
- Los buscadores pueden rastrear productos y colecciones mediante URLs, metadatos y sitemap válidos.
- El propietario sabe cómo actualizar productos, revisar el sitio y volver al deployment anterior.
