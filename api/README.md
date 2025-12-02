# Vercel Serverless Functions

Endpoints API serverless para Son de Nudos.

## `/api/keepalive`

**Supabase Keepalive** - Evita que el proyecto de Supabase se pause por inactividad en el tier gratuito.

### ¿Por qué es necesario?

Supabase pausa los proyectos del tier gratuito después de **7 días de inactividad** (sin conexiones a la base de datos). Este endpoint hace un ping cada 5 días para mantener el proyecto activo.

### ¿Cómo funciona?

1. **Vercel Cron Job** ejecuta automáticamente el endpoint cada 5 días (`0 0 */5 * *`)
2. El endpoint hace una query simple `SELECT id FROM products LIMIT 1`
3. Si la query es exitosa, retorna `200 OK`
4. Esto cuenta como actividad en Supabase y reinicia el contador de inactividad

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
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Probar manualmente

```bash
# Desarrollo local
curl http://localhost:3000/api/keepalive

# Producción (requiere CRON_SECRET)
curl -H "Authorization: Bearer TU_CRON_SECRET" https://tudominio.com/api/keepalive
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Supabase keepalive ping successful",
  "timestamp": "2025-12-01T12:00:00.000Z",
  "recordsFound": 1
}
```

### Monitoreo

Puedes ver las ejecuciones del cron job en:
**Vercel Dashboard → Tu Proyecto → Logs → Filter by "keepalive"**

### Cron Schedule

- **Schedule:** `0 0 */5 * *` (cada 5 días a medianoche UTC)
- **Configurado en:** `vercel.json`
- **Documentación:** https://vercel.com/docs/cron-jobs
