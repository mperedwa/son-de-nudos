# Vercel Serverless Functions

Endpoints API serverless para Son de Nudos.

## `/api/keepalive`

**Supabase Keepalive** - Genera actividad de base de datos para reducir el riesgo de pausa por inactividad en el tier gratuito.

### ¿Por qué es necesario?

Supabase puede pausar proyectos gratuitos con poca actividad durante un periodo de siete días. Este endpoint realiza una consulta diaria como medida preventiva. No es una garantía contractual de disponibilidad; para una tienda que requiera disponibilidad garantizada debe evaluarse un plan de pago.

### ¿Cómo funciona?

1. **Vercel Cron Job** ejecuta automáticamente el endpoint una vez al día (`17 13 * * *`)
2. El endpoint hace una query simple `SELECT id FROM products LIMIT 1`
3. Si la query es exitosa, retorna `200 OK`
4. La consulta genera actividad real de base de datos

La ejecución se programa a las 13:17 UTC. En Vercel Hobby la hora exacta puede variar dentro de la hora programada.

### Configuración

#### 1. Agregar CRON_SECRET en Vercel

1. Ve a tu proyecto en Vercel → **Settings** → **Environment Variables**
2. Agrega una nueva variable:
   - **Name:** `CRON_SECRET`
   - **Value:** Genera un secret aleatorio con `openssl rand -base64 32`
   - **Environments:** Production, Preview, Development
3. Redeploy el proyecto para aplicar los cambios

#### 2. Verificar que las variables de Supabase estén configuradas

Asegúrate de que estas variables estén en Vercel:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Mientras se completa la migración, el endpoint también admite `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` como compatibilidad temporal.

### Probar manualmente

```bash
# Desarrollo local
curl http://localhost:5174/api/keepalive

# Producción (requiere CRON_SECRET)
curl -H "Authorization: Bearer TU_CRON_SECRET" https://tudominio.com/api/keepalive
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Supabase keepalive ping successful",
  "checkedAt": "2026-09-02T13:17:00.000Z",
  "recordsFound": 1
}
```

### Monitoreo

Puedes ver las ejecuciones del cron job en:
**Vercel Dashboard → Tu Proyecto → Logs → Filter by "keepalive"**

### Cron Schedule

- **Schedule:** `17 13 * * *` (diario a las 13:17 UTC; aproximado en Hobby)
- **Configurado en:** `vercel.json`
- **Documentación:** [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) y [Supabase: Free Project Pausing](https://supabase.com/docs/guides/platform/free-project-pausing)

---

## `/api/webhook-stripe`

**Webhook de Stripe** - Recibe eventos de Stripe y guarda los pedidos automáticamente en Supabase.

### ¿Qué hace?

Cuando un cliente completa un pago en Stripe Checkout, Stripe envía un evento `checkout.session.completed` a este endpoint. El webhook:

1. Verifica la firma del evento (seguridad)
2. Extrae los datos del pedido (cliente, items, totales)
3. Crea el registro en la tabla `orders` de Supabase
4. Responde 200 OK a Stripe

### Evento soportado

| Evento | Acción |
|--------|--------|
| `checkout.session.completed` | Crea orden con status `paid` |

### Configuración en Stripe Dashboard

1. Ve a [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Configura:
   - **Endpoint URL:** `https://www.sondenudos.com/api/webhook-stripe`
   - **Events to send:** `checkout.session.completed`
4. Click **Add endpoint**
5. Copia el **Signing secret** (empieza con `whsec_`)

### Variables de entorno requeridas

Agregar en Vercel Dashboard → Settings → Environment Variables:

| Variable | Descripción |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe (`sk_live_xxx` o `sk_test_xxx`) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret del webhook (`whsec_xxx`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio de Supabase (para bypass RLS) |

### Testing local con Stripe CLI

```bash
# 1. Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# 2. Login
stripe login

# 3. Redirigir eventos a tu localhost
stripe listen --forward-to localhost:3000/api/webhook-stripe

# 4. En otra terminal, crear un checkout de prueba
stripe trigger checkout.session.completed
```

### Respuesta exitosa

```json
{
  "received": true,
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Order created successfully"
}
```

### Datos guardados en `orders`

| Campo | Origen |
|-------|--------|
| `stripe_session_id` | `session.id` |
| `customer_email` | `session.customer_details.email` |
| `customer_name` | `session.customer_details.name` |
| `shipping_address` | `session.shipping_details.address` |
| `items` | `session.metadata.items` (JSON) |
| `subtotal` | `session.metadata.subtotal` |
| `discount` | `session.metadata.discount` |
| `shipping` | `session.metadata.shipping` |
| `total` | `session.amount_total / 100` |
| `status` | `'paid'` (automático) |

### Troubleshooting

| Error | Causa | Solución |
|-------|-------|----------|
| 400 Signature verification failed | Webhook secret incorrecto | Verificar `STRIPE_WEBHOOK_SECRET` |
| 500 Supabase not configured | Faltan variables | Agregar `SUPABASE_SERVICE_ROLE_KEY` |
| 200 Order already exists | Evento duplicado | Normal, Stripe reintenta |

### Logs

Ver eventos del webhook en:
- **Vercel:** Dashboard → Logs → Filter by "webhook"
- **Stripe:** Dashboard → Developers → Webhooks → tu endpoint → Logs
