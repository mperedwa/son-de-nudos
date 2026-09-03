# Fase 0 — Línea base segura y decisiones

- **Fecha de comprobación:** 2 de septiembre de 2026
- **Rama:** `codex/fase-0-linea-base`
- **Estado:** completada

## Inventario de servicios

| Servicio | Estado verificado | Acceso administrativo | Acción de esta fase |
|---|---|---|---|
| GitHub | Repositorio `mperedwa/son-de-nudos` público; `main` es la rama por defecto y su historial fue redactado | CLI autenticada como `mperedwa` | Mantener `npm run security:scan` como puerta previa a commits |
| Vercel | Proyecto `son-de-nudos` activo, conectado al dominio y a GitHub; cron de keepalive definido | CLI autenticada | Conservar hosting; activar el cron diario contra el Supabase nuevo después de aplicar el esquema seguro |
| Dominio | Namecheap; vence el 31 de mayo de 2027; raíz redirige a `www` y DNS apunta a Vercel | Propietario confirma acceso, renovación automática y notificaciones | Revisar nuevamente antes del lanzamiento |
| Supabase | Proyecto nuevo `son-de-nudos` activo y saludable en `us-east-2` | CLI autenticada, repositorio enlazado y llaves locales configuradas | Mantener la base vacía hasta corregir RLS en la Fase 1; después aplicar migraciones y actualizar Vercel |
| Etsy | Existe una tienda histórica, pero no forma parte del checkout aprobado | No requerido para el MVP | Retirar enlaces o promesas de compra en Etsy del alcance activo |
| Instagram | El perfil público responde; el código usa `@son_de_nudos` | Acceso administrativo no verificado | Confirmar el handle canónico en la Fase 3 antes de publicar contenido |
| MailerLite | El sitio carga el script y un identificador de cuenta | Acceso administrativo no verificado | Mantener fuera del lanzamiento hasta verificar cuenta, consentimiento y lista en la Fase 5 |
| Google Cloud | Vercel contiene una variable para Places API | Acceso y restricciones no verificados | Verificar dominio permitido, cuotas y facturación en la Fase 2; conservar entrada manual como alternativa |
| Stripe | Checkout aprobado por el propietario; Vercel contiene webhook secret, pero no una secret key operativa | El propietario confirma que posee y usa la cuenta | Crear integración de servidor y probar primero en test mode |

No se usarán los proyectos Supabase visibles de otros sistemas para Son de Nudos.

GitHub no devolvió configuración de protección para `main` ni acceso a alertas de secret scanning. El nuevo escaneo local es, por tanto, una puerta obligatoria antes de cada commit hasta que esas protecciones puedan habilitarse.

## Trabajo local completado

- [x] Creada la rama `codex/fase-0-linea-base` desde el plan aprobado.
- [x] Retiradas las credenciales conocidas del árbol de trabajo actual.
- [x] Eliminada la URL PostgreSQL con contraseña incrustada.
- [x] Reemplazados emails, contraseñas e IDs fijos por variables locales en los scripts administrativos.
- [x] Endurecido `.gitignore` para variantes de `.env`, llaves y archivos comunes de credenciales.
- [x] Añadido `npm run security:scan`, que informa nombres de archivos sin imprimir secretos.
- [x] Verificado `npm run security:scan` sin hallazgos.
- [x] Verificado `npm run build` correctamente.
- [x] Verificado ESLint en todos los scripts modificados sin errores ni advertencias.
- [x] Verificado el nuevo Supabase `icqbyybjhdaxvobfcnia` como `ACTIVE_HEALTHY`.
- [x] Enlazado el repositorio local con el nuevo proyecto sin aplicar migraciones.
- [x] Configuradas las llaves nuevas únicamente en `.env` local con permisos `600`.
- [x] Verificado Auth con respuesta 200 y confirmado que el esquema remoto está vacío.
- [x] Cambiado el keepalive de cada cinco días a diario y corregida su autenticación para que falle cerrado si falta `CRON_SECRET`.
- [x] Añadidas variables Supabase exclusivas del backend con compatibilidad temporal para las variables actuales.
- [x] Creada una copia privada de recuperación antes de reescribir Git.
- [x] Reescritos los 78 commits locales para retirar los tres valores conocidos.
- [x] Publicado el historial limpio de `main` mediante `force-with-lease` autorizado.
- [x] Verificado que `main` remoto coincide con el commit local `0bb33b4ca458eb72400e019c65e8c4f74186de9e`.
- [x] Verificado públicamente el registrador, vencimiento, DNS, redirección HTTPS y disponibilidad del dominio.
- [x] Verificado que la URL pública configurada para Instagram responde; la titularidad requiere confirmación del propietario.
- [ ] Ejecutar cambios externos de cuentas y proveedores después de recibir las decisiones correspondientes.

## Variables por ambiente

### Navegador

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_URL`
- `VITE_DATA_MODE`
- `VITE_CURRENCY`
- `VITE_GOOGLE_PLACES_API_KEY`, únicamente si sigue siendo necesaria

Toda variable con prefijo `VITE_` puede terminar visible en el JavaScript del navegador. Nunca debe contener una llave privada.

### Funciones servidor

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- `STRIPE_SECRET_KEY`, únicamente para las funciones servidor
- `STRIPE_WEBHOOK_SECRET`, únicamente para verificar el webhook

### Herramientas locales; no configurar en Vercel

- `SUPABASE_DB_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`
- `ADMIN_USER_ID`
- `TEST_ADMIN_EMAIL`
- `TEST_ADMIN_PASSWORD`

## Hallazgos de credenciales

El árbol y el historial público contenían:

- Una contraseña administrativa débil y reutilizada en documentación y scripts.
- Una URL PostgreSQL con contraseña incrustada.
- Otra contraseña de base de datos registrada dentro de logs históricos.
- Un ID fijo de usuario administrativo.

El proyecto Supabase asociado ya no está disponible, por lo que esas credenciales no deben reutilizarse. La limpieza del árbol actual forma parte de esta rama. La reescritura del historial fue autorizada explícitamente, se ejecutó después de crear una copia privada de recuperación y se publicó con `force-with-lease`. Cualquier clon creado antes de esta operación debe volver a clonar o resincronizarse con el nuevo historial.

## Decisiones resueltas y trabajo asignado

- [x] Usar Stripe Checkout como procesador de pagos del MVP; Etsy queda fuera del camino de compra.
- [x] Sustituir el Supabase histórico por un proyecto exclusivo nuevo.
- [x] Proyecto nuevo creado por el propietario en `us-east-2`.
- [x] Confirmar acceso a Namecheap, renovación automática y notificaciones del dominio.
- [ ] Fase 3: confirmar el handle oficial de Instagram.
- [x] Confirmar Fort Myers, Florida como zona de operación y aprobar entrega local gratuita sin recogido residencial.
- [x] Limitar los envíos del lanzamiento a los 48 estados contiguos y Washington, D. C.; dejar Canadá, México y otros destinos para una etapa posterior.
- [ ] Fase 2: aprobar los códigos postales exactos, el plazo de entrega local y la tarifa continental.
- [x] Usar inventario disponible con reposición rápida y habilitación explícita de piezas bajo pedido.
- [x] Mostrar 1–3 días laborables como plazo estándar para piezas bajo pedido.
- [x] Detectar automáticamente ES/EN, conservar selector manual y usar inglés como respaldo.
- [ ] Fase 6: fijar la fecha pública después de aprobar el candidato de lanzamiento.
- [x] Aprobar y ejecutar la reescritura del historial Git.

## Acciones externas asignadas a fases posteriores

1. Reemplazar las variables Supabase de Vercel cuando la nueva instancia esté lista.
2. Configurar las credenciales Stripe de test y, después de la compra controlada, las de producción.
3. Publicar producción solamente después de que las fases dependientes pasen sus pruebas.

## Keepalive del proyecto gratuito

Vercel invocará `GET /api/keepalive` diariamente a las 13:17 UTC. El endpoint exige `CRON_SECRET`, ejecuta una consulta de solo lectura y no devuelve detalles internos cuando falla. La frecuencia diaria sustituye la programación anterior de una vez cada cinco días.

Esta medida reduce el riesgo de pausa, pero no garantiza que Supabase mantenga activo un proyecto gratuito. La documentación vigente indica que los proyectos con poca actividad durante siete días pueden pausarse y que, normalmente, unas pocas solicitudes diarias son suficientes. Para disponibilidad garantizada debe usarse un plan de pago. La Fase 1 incluye aplicar el esquema seguro, configurar las variables nuevas en Vercel, comprobar una respuesta `200` y revisar la primera ejecución programada antes de considerar el keepalive activo.

## Decisión y hallazgos iniciales de Stripe

El propietario eligió Stripe y confirmó que ya utiliza esa cuenta para otros productos. La interfaz actual de checkout y el umbral de envío gratis sirven como base, pero todavía no constituyen un checkout de producción. La opción existente de recogido local y las zonas Canadá/México no representan la operación aprobada y se retirarán del lanzamiento.

- `src/server/stripe.ts` se importa dinámicamente desde código del navegador; debe sustituirse por una función serverless.
- El navegador envía precio, descuento y costo de envío, por lo que hoy esos importes no son confiables.
- El formulario calcula la zona con la dirección seleccionada, pero Stripe vuelve a recoger una dirección que podría no coincidir.
- El webhook verifica la firma y evita el duplicado más sencillo, pero debe validar el estado de pago, consultar datos canónicos y actualizar orden/inventario de forma idempotente.
- La página `/success` muestra éxito sin comprobar una Checkout Session pagada.
- Vercel no tiene todavía toda la configuración necesaria para crear sesiones Stripe.

Estos puntos se resolverán en la Fase 2 después de asegurar el esquema y las políticas de Supabase en la Fase 1.

## Decisión de entrega local

Se ofrecerá **entrega local gratuita** dentro de códigos postales aprobados de Fort Myers, Naples, Cape Coral y Lehigh Acres. No se ofrecerá recogido en la residencia y la dirección privada no se usará como punto de recogido ni se mostrará al cliente.

El cliente introducirá su dirección antes de iniciar el pago. El servidor determinará la elegibilidad por código postal y aplicará automáticamente entrega local a costo cero o la tarifa de envío correspondiente. Después del pago, la confirmación indicará que Son de Nudos se comunicará con el cliente para coordinar día y horario.

Fuera del perímetro local, el lanzamiento solo admitirá direcciones de los 48 estados contiguos y Washington, D. C. Canadá, México, Alaska, Hawái y otros destinos se incorporarán únicamente después de comprobar tarifas y operación. Antes de implementar esta regla hacen falta la lista exacta de códigos postales, el plazo habitual de entrega local y la tarifa continental.

## Decisión de inventario y preparación

La operación será **inventario primero, con reposición rápida**. Los productos y variantes normalmente disponibles conservarán stock real. Cuando una pieza pueda confeccionarse rápidamente después de agotarse, podrá habilitarse de forma explícita como `made_to_order` con un plazo visible antes del pago.

Una variante con stock cero no podrá venderse por defecto. El panel deberá distinguir `ready_to_ship` de `made_to_order`, y el servidor de checkout validará esa condición antes de crear la sesión Stripe. El plazo estándar aprobado para confección bajo pedido es de **1–3 días laborables**; cualquier excepción deberá configurarse y mostrarse en la ficha antes del pago.

## Decisión de idioma

La tienda detectará el idioma del navegador y presentará español o inglés según corresponda. El selector ES/EN seguirá siempre visible y conservará la elección del visitante. Si no puede determinarse un idioma compatible, la experiencia utilizará inglés como respaldo por tratarse de una operación ubicada en Florida.

En la fase de SEO se crearán metadatos y señales `lang`/`hreflang` coherentes para ambos idiomas. La indexación no dependerá únicamente del cambio de textos ejecutado en el navegador.

## Evidencia requerida para cerrar la fase

- `npm run security:scan` sin hallazgos en archivos rastreados.
- `npm run build` exitoso.
- Matriz anterior actualizada con acceso confirmado o acción asignada.
- Decisiones del propietario registradas.
- Secretos activos rotados o declarados inactivos y no reutilizables.
- Commit único de cierre creado con el mensaje definido en `PLAN_EJECUCION_LANZAMIENTO.md`.
