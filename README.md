# Son de Nudos by Priscilla

E-commerce moderno y minimalista para venta de collares artesanales, construido con React, TypeScript y TailwindCSS.

## 🎯 Características Principales

### Funcionalidades Implementadas

- **Catálogo de productos** con grid responsivo (2/3/4 columnas)
- **Sistema de colecciones** temáticas musicales con páginas dedicadas
- **Filtros avanzados** por disponibilidad, precio, material, color, largo y colección
- **Ordenamiento múltiple** (destacados, precio, nombre, fecha)
- **Selector de variantes inteligente** con validación de disponibilidad en tiempo real
- **Carrito de compras** con drawer lateral y atajo de teclado (Cmd/Ctrl + K)
- **Sistema de cupones** con 4 códigos de descuento configurados
- **Envío calculado** con barra de progreso hacia envío gratis ($150+)
- **Checkout completo** con formularios de contacto y envío
- **Integración con Stripe Checkout** (modo opcional)
- **Mock server** para desarrollo sin backend
- **Galería de imágenes** con miniaturas y hover effects
- **Accesibilidad** con navegación por teclado y aria labels
- **Panel de Administración** con Supabase (Auth, Storage, Real-time)
- **Contenido bilingüe** para productos y colecciones (título y descripción ES/EN)
- **Búsqueda de productos** con SearchDrawer
- **Landing page** con diseño modular y colecciones dinámicas

### Experiencia de Usuario

- Diseño minimalista con paleta de colores tierra (#8B6F47, #F5E6D3, #D4A574)
- Animaciones suaves y transiciones profesionales
- Estados de carga con skeletons
- Feedback visual en todas las acciones
- Responsive design mobile-first
- Breadcrumbs de navegación
- Announcement bar rotativo
- Footer completo con newsletter

## 🛠 Tecnologías Utilizadas

### Core

- **React 18** - Librería UI con functional components
- **TypeScript 5** - Tipado estático
- **Vite 5** - Build tool y dev server
- **React Router v7** - Enrutamiento SPA

### Estilos

- **TailwindCSS 3** - Utility-first CSS framework
- Paleta personalizada de colores tierra
- Sistema de diseño consistente

### Estado y Datos

- **Zustand** - Estado global ligero (carrito, UI)
- **JSON local** - 20 productos con variantes
- **Mock Server** - Simulación de API REST

### Pagos y Backend

- **Stripe** - Procesamiento de pagos (opcional)
- **@stripe/stripe-js** - Cliente de Stripe
- Soporte para 3 modos: mock, stripe, shopify

### Base de Datos y Admin

- **Supabase** - Backend as a Service (PostgreSQL)
- **@supabase/supabase-js** - Cliente de Supabase
- **PostgreSQL** - Base de datos relacional
- **Row Level Security (RLS)** - Políticas de seguridad
- **Supabase Auth** - Autenticación de administradores
- **Supabase Storage** - Almacenamiento de imágenes

### Validación y Forms

- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas
- Validación en tiempo real

### Dev Tools

- **ESLint** - Linting de código
- **TypeScript ESLint** - Reglas específicas para TS
- **Vite HMR** - Hot Module Replacement

### DevOps y Automatización

- **Vercel** - Hosting y deployment automático
- **Vercel Cron Jobs** - Tareas programadas serverless
- **Supabase Keepalive** - Endpoint `/api/keepalive` que ejecuta cada 5 días para evitar pausa del proyecto
- **GitHub Actions** - CI/CD integrado con Vercel
- **@vercel/node** - Runtime para funciones serverless

### Internacionalización

- **react-i18next** - Sistema de traducciones
- **i18next** - Core de internacionalización
- **i18next-browser-languagedetector** - Detección automática de idioma

## 🌍 Internacionalización (i18n)

El proyecto soporta **Español** e **Inglés** con detección automática del idioma del navegador.

### Características

- **Detección automática** del idioma del navegador (español/inglés)
- **Selector manual** de idioma en el header
- **Persistencia** del idioma seleccionado en localStorage
- **9 espacios de nombres** organizados por funcionalidad
- **Traducciones completas** de toda la interfaz
- **Traducciones predefinidas** para colores, materiales y grosores

### Idiomas Disponibles

| Idioma | Código | Estado |
|--------|--------|--------|
| Español | `es` | ✅ Completo |
| Inglés | `en` | ✅ Completo |

### Estructura de Traducciones

```
src/i18n/
├── index.ts                    # Configuración de i18next
├── locales/
│   ├── es/                     # Traducciones en español
│   │   ├── common.json         # Textos comunes
│   │   ├── navigation.json     # Navegación y menús
│   │   ├── product.json        # Páginas de producto (+ colores, materiales)
│   │   ├── cart.json           # Carrito de compras
│   │   ├── checkout.json       # Proceso de pago
│   │   ├── messages.json       # Mensajes del sistema
│   │   ├── announcements.json  # Anuncios y promociones
│   │   ├── filters.json        # Filtros y ordenamiento
│   │   └── landing.json        # Landing page
│   └── en/                     # Traducciones en inglés
│       └── [mismos archivos]
```

### Uso en Componentes

```typescript
import { useTranslation } from 'react-i18next'

function MiComponente() {
  const { t } = useTranslation(['common', 'navigation'])

  return (
    <div>
      <h1>{t('common:shop')}</h1>
      <p>{t('navigation:necklaces')}</p>
    </div>
  )
}
```

### Agregar Nuevas Traducciones

1. **Editar archivo de idioma:**
```json
// src/i18n/locales/es/common.json
{
  "newKey": "Nuevo texto en español"
}

// src/i18n/locales/en/common.json
{
  "newKey": "New text in English"
}
```

2. **Usar en componente:**
```typescript
const { t } = useTranslation('common')
<p>{t('newKey')}</p>
```

### Cambiar Idioma Programáticamente

```typescript
import { useLanguageStore } from '@/store/language'

function LanguageSelector() {
  const setLanguage = useLanguageStore((state) => state.setLanguage)

  return (
    <button onClick={() => setLanguage('en')}>
      Switch to English
    </button>
  )
}
```

### Configuración

La configuración de i18next está en `src/i18n/index.ts`:

```typescript
i18n
  .use(LanguageDetector)  // Detecta idioma del navegador
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',    // Idioma por defecto: inglés
    supportedLngs: ['es', 'en'],
    // ... más configuración
  })
```

## 🔐 Panel de Administración

El proyecto incluye un **panel de administración completo** para gestionar productos, pedidos, cupones e inventario.

### Acceso

| URL | Descripción |
|-----|-------------|
| **Producción** | https://www.sondenudos.com/admin/login |
| **Local** | http://localhost:5174/admin/login |

### Creación y acceso seguro

No existen credenciales administrativas por defecto. Crea el primer usuario con
`npm run create:admin`, guarda la contraseña generada en un gestor de contraseñas
y configura los secretos únicamente en `.env` local o en el proveedor correspondiente.

Nunca publiques emails administrativos, contraseñas, IDs de usuario o llaves en Git.

### Funcionalidades Disponibles

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| **Dashboard** | `/admin/dashboard` | Métricas: productos, pedidos, ingresos, alertas de stock bajo |
| **Productos** | `/admin/products` | CRUD completo de productos y variantes |
| **Colecciones** | `/admin/collections` | Gestión de colecciones temáticas con imágenes y nombres bilingües |
| **Pedidos** | `/admin/orders` | Ver y gestionar pedidos, cambiar estados |
| **Cupones** | `/admin/coupons` | Crear, editar y desactivar cupones |
| **Inventario** | `/admin/inventory` | Control de stock con edición en línea |
| **Configuración** | `/admin/settings` | Zonas de envío, SEO, redes sociales y banner |
| **Mi Perfil** | `/admin/profile` | Cambiar contraseña, ver info de cuenta |

### Guía de Uso

#### Productos (`/admin/products`)

**Crear un producto:**
1. Click en **"Nuevo Producto"**
2. Llenar campos obligatorios:
   - Título (ES) y Título (EN) para contenido bilingüe
   - Handle (URL amigable, ej: `collar-luna-plata`)
   - Descripción (ES/EN) con HTML permitido
   - Colección (opcional): asignar a una colección temática
3. Subir imágenes (máx. 4, primera es la principal)
4. Click en **"Crear"**

**Agregar variantes:**
1. En la tabla de productos, expandir el producto (click en fila)
2. Click en **"Nueva Variante"**
3. Configurar:
   - SKU único (ej: `COL-LUNA-S-PLATA`)
   - Precio en USD
   - Stock disponible
   - Opciones: Largo, Material, Color, etc.
4. Subir imagen de la variante (opcional)

**Clonar productos:** Usa el botón 📋 para duplicar productos con todas sus variantes.

#### Pedidos (`/admin/orders`)

**Estados disponibles:**
| Estado | Significado | Color |
|--------|-------------|-------|
| `pending` | Esperando pago | Amarillo |
| `paid` | Pagado (automático desde Stripe) | Azul |
| `processing` | En preparación | Morado |
| `shipped` | Enviado | Cian |
| `delivered` | Entregado | Verde |
| `cancelled` | Cancelado | Rojo |

**Cambiar estado:**
1. Click en un pedido para abrir el detalle
2. Seleccionar nuevo estado en el dropdown
3. Confirmar el cambio

**Filtros disponibles:**
- Por estado (pending, paid, etc.)
- Por fecha (hoy, semana, mes)
- Búsqueda por email, nombre o ID

#### Cupones (`/admin/coupons`)

**Crear cupón:**
1. Click en **"Nuevo Cupón"**
2. Configurar:
   - Código (ej: `VERANO2025`)
   - Porcentaje de descuento (0-100)
   - Monto mínimo de compra (opcional)
   - Usos máximos (opcional)
   - Fechas de validez (opcional)
3. Activar/desactivar con el toggle

**Cupones preconfigurados:**
| Código | Descuento | Mínimo |
|--------|-----------|--------|
| `WELCOME10` | 10% | - |
| `PRISCILLA15` | 15% | - |
| `VERANO20` | 20% | $50 |
| `NAVIDAD25` | 25% | $100 |

#### Inventario (`/admin/inventory`)

**Edición rápida de stock:**
- Click en el número de stock → editar en línea
- Usar botones +/- para ajustes rápidos
- Ver historial de cambios por variante

**Filtros:**
- Stock bajo (≤5 unidades)
- Sin stock
- Búsqueda por producto o SKU

### Crear Usuario Admin Adicional

Para crear nuevos administradores, ejecuta el script incluido:

```bash
# Desde la raíz del proyecto
npm run create:admin

# O directamente con tsx
npx tsx scripts/create-admin.ts
```

El script te pedirá:
1. Email del nuevo admin
2. Contraseña (mín. 6 caracteres)
3. Nombre del admin
4. Rol (admin/editor)

**Requisitos:**
- Variables de entorno configuradas (`VITE_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
- El email debe ser único en el sistema

### Arquitectura del Admin

```
Panel Admin (React + TypeScript)
         ↓
    Supabase Auth (autenticación)
         ↓
    Supabase PostgreSQL (datos)
         ↓
    Supabase Storage (imágenes)
         ↓
    Row Level Security (RLS)
```

**Seguridad implementada:**
- Autenticación obligatoria para todas las rutas `/admin/*`
- RLS: admins solo pueden modificar datos, no pueden ver datos de otros admins
- Imágenes públicas pero upload solo autenticado
- Tokens con expiración automática

### Webhook de Stripe

Los pedidos se guardan automáticamente cuando un cliente completa el pago:

```
Cliente paga → Stripe → /api/webhook-stripe → Supabase (orders)
```

El webhook está configurado en:
- **Endpoint:** `https://www.sondenudos.com/api/webhook-stripe`
- **Evento:** `checkout.session.completed`

Ver documentación completa en `api/README.md`.

## 🚚 Sistema de Zonas de Envío

El proyecto incluye un sistema completo de envío por zonas con detección automática de país usando Google Places API.

### Zonas de Envío

| Zona | Países | Costo Default | Comportamiento |
|------|--------|---------------|----------------|
| **Zona 1** | 🇺🇸 Estados Unidos | $8.99 | Checkout normal |
| **Zona 2** | 🇨🇦🇲🇽 Canadá, México | $18.99 | Checkout normal |
| **Zona 3** | 🌍 Internacional | N/A | Mensaje "Contáctanos" |

### Características

- **Detección automática de país** mediante Google Places Autocomplete en checkout
- **Costos configurables** desde el panel admin (`/admin/settings`)
- **Umbral de envío gratis** configurable (default: $150)
- **Integración con Stripe** - el costo de envío se calcula dinámicamente

### Configuración de Costos (Admin)

1. Ir a `/admin/settings`
2. Configurar costos por zona:
   - **Zona 1 (USA):** Costo estándar para Estados Unidos
   - **Zona 2 (CA/MX):** Costo para Canadá y México
   - **Umbral Envío Gratis:** Monto mínimo para envío sin cargo
3. Guardar cambios

### Google Places API

Para que el autocompletado de direcciones funcione en producción:

1. **Crear proyecto** en [Google Cloud Console](https://console.cloud.google.com/)
2. **Habilitar APIs:**
   - Places API
   - Maps JavaScript API
3. **Crear API Key:**
   - Ir a Credentials → Create Credentials → API Key
   - Agregar restricciones HTTP referrer:
     - `https://www.sondenudos.com/*`
     - `http://localhost:5174/*` (para desarrollo)
4. **Configurar variable de entorno:**
   ```bash
   VITE_GOOGLE_PLACES_API_KEY=tu_api_key
   ```

> **Nota:** Si la API Key no está configurada, el checkout funciona normalmente pero el usuario debe ingresar su dirección manualmente sin autocompletado.

### Archivos Clave

| Archivo | Descripción |
|---------|-------------|
| `src/lib/shipping.ts` | Helpers para zonas y cálculo de costos |
| `src/components/AddressAutocomplete.tsx` | Componente Google Places |
| `src/app/routes/admin/settings.tsx` | Página de configuración |

## ⚙️ Panel de Configuración

El panel de administración incluye una página completa de configuración (`/admin/settings`) con 8 secciones:

| Sección | Descripción |
|---------|-------------|
| 📦 **Envío** | Costos por zona (USA $8.99, CA/MX $18.99), umbral envío gratis |
| 🔍 **SEO** | Meta título, descripción, keywords, imagen Open Graph, Google Analytics |
| 📱 **Redes** | URLs de Instagram, Facebook, Pinterest, TikTok, WhatsApp, email |
| 🏪 **Tienda** | Nombre, descripción, email de notificaciones, teléfono |
| 📢 **Banner** | Hasta 4 mensajes rotativos bilingües con toggle activo/inactivo |
| 🎨 **Marca** | Logo personalizado y favicon (subir desde admin) |
| ⚖️ **Legal** | Política de devoluciones bilingüe (ES/EN) |
| 🚀 **SEO+** | robots.txt, sitemap automático, Schema markup, URL canónica |

### SEO y Rich Snippets

El proyecto incluye SEO avanzado completamente funcional:

- **Sitemap automático**: `/sitemap.xml` genera XML con todos los productos disponibles
- **robots.txt configurable**: `/robots.txt` se puede editar desde el admin
- **Schema markup (JSON-LD)**: Rich snippets para productos (precio, disponibilidad)
- **OrganizationSchema**: Información de la tienda para Google
- **Canonical URLs**: Evita contenido duplicado
- **Open Graph**: Imágenes optimizadas para compartir en redes sociales

### Página de Política de Devoluciones

Ruta pública: `/politicas/devoluciones`

- Contenido editable desde admin (sección Legal)
- Soporte bilingüe automático según idioma del usuario
- Se recomienda incluir: plazos, condiciones, proceso, reembolsos

## 📦 Instalación

### Requisitos Previos

- Node.js 18+
- npm 9+

### Pasos de Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd SonDeNudos

# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

El servidor estará disponible en `http://localhost:5174`

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```bash
# ==================================
# STRIPE (Modo Stripe Checkout)
# ==================================
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx

# ==================================
# SHOPIFY (Modo Shopify Storefront)
# ==================================
VITE_SHOPIFY_STORE_DOMAIN=tu-tienda.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=shpat_xxx

# ==================================
# CONFIGURACIÓN GENERAL
# ==================================
VITE_DATA_MODE=mock              # mock | stripe | shopify
VITE_CURRENCY=USD
VITE_SHIPPING_COST=10            # Costo de envío estándar en USD
VITE_FREE_SHIPPING_THRESHOLD=150 # Umbral para envío gratis

# ==================================
# DESARROLLO
# ==================================
VITE_PORT=5174
```

### Modos de Operación

#### 1. Modo Mock (Por Defecto)

Simula toda la funcionalidad localmente sin servicios externos:

```bash
VITE_DATA_MODE=mock
```

- Productos desde `src/data/products.json`
- Checkout simulado con redirección a `/success`
- Perfecto para desarrollo y testing

#### 2. Modo Stripe

Integración completa con Stripe Checkout:

```bash
VITE_DATA_MODE=stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
```

**Obtener claves de Stripe:**
1. Crear cuenta en [stripe.com](https://stripe.com)
2. Ir a [Dashboard → API keys](https://dashboard.stripe.com/test/apikeys)
3. Copiar las claves de prueba (test mode)

**Flujo de pago:**
1. Usuario completa checkout
2. Redirección a Stripe Checkout
3. Pago procesado por Stripe
4. Retorno a `/success` o `/cancel`

#### 3. Modo Shopify (Opcional)

Para usar Shopify como backend:

```bash
VITE_DATA_MODE=shopify
VITE_SHOPIFY_STORE_DOMAIN=tu-tienda.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=shpat_xxx
```

**Obtener token de Shopify:**
1. Admin → Apps → Develop apps
2. Create an app
3. Configure Storefront API access
4. Copiar Storefront API access token

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo con HMR

# Producción
npm run build        # Compila para producción (TypeScript + Vite)
npm run preview      # Preview del build de producción

# Linting
npm run lint         # Ejecuta ESLint en todo el proyecto
```

## 📁 Estructura del Proyecto

```
SonDeNudos/
├── src/
│   ├── app/
│   │   ├── layout/
│   │   │   └── RootLayout.tsx      # Layout global con header/footer
│   │   └── routes/
│   │       ├── index.tsx            # Página de colección (grid de productos)
│   │       ├── landing.tsx          # Landing page principal
│   │       ├── product/
│   │       │   └── [handle].tsx     # Página de detalle de producto
│   │       ├── checkout.tsx         # Página de checkout
│   │       ├── success.tsx          # Confirmación de pago
│   │       ├── cancel.tsx           # Cancelación de pago
│   │       └── admin/
│   │           ├── login.tsx        # Login del panel admin
│   │           ├── dashboard.tsx    # Dashboard con métricas
│   │           ├── products.tsx     # CRUD de productos y variantes
│   │           ├── orders.tsx       # Gestión de pedidos
│   │           └── profile.tsx      # Perfil del administrador
│   │
│   ├── components/
│   │   ├── AddToCartButton.tsx      # Botón agregar al carrito con estados
│   │   ├── AnnouncementBar.tsx      # Barra de anuncios rotativos
│   │   ├── Breadcrumbs.tsx          # Navegación breadcrumb
│   │   ├── CartButton.tsx           # Botón del carrito en header
│   │   ├── CartDrawer.tsx           # Drawer lateral del carrito
│   │   ├── CollectionToolbar.tsx    # Barra de filtros y orden
│   │   ├── FiltersDrawer.tsx        # Panel de filtros (drawer/sidebar)
│   │   ├── Footer.tsx               # Footer con newsletter
│   │   ├── Header.tsx               # Header con navegación
│   │   ├── ImageGallery.tsx         # Galería con miniaturas
│   │   ├── Price.tsx                # Componente de precio formateado
│   │   ├── ProductCard.tsx          # Tarjeta de producto con hover
│   │   ├── ProductGrid.tsx          # Grid responsivo de productos
│   │   ├── SearchDrawer.tsx         # Modal de búsqueda de productos
│   │   └── VariantSelector.tsx      # Selector de variantes inteligente
│   │
│   ├── lib/
│   │   ├── config.ts                # Configuración global desde .env
│   │   ├── filters.ts               # Lógica de filtrado y ordenamiento
│   │   ├── money.ts                 # Utilidades para formateo de moneda
│   │   ├── stripe.ts                # Cliente de Stripe (navegador)
│   │   ├── supabase.ts              # Cliente de Supabase + tipos
│   │   └── storage.ts               # Helpers para Supabase Storage
│   │
│   ├── server/
│   │   ├── mockServer.ts            # API mock para desarrollo
│   │   └── stripe.ts                # Servidor de Stripe (backend)
│   │
│   ├── store/
│   │   ├── cart.ts                  # Store Zustand del carrito
│   │   ├── ui.ts                    # Store Zustand de UI (drawers)
│   │   └── language.ts              # Store Zustand de idioma
│   │
│   ├── i18n/
│   │   ├── index.ts                 # Configuración de i18next
│   │   └── locales/
│   │       ├── es/                  # Traducciones en español
│   │       └── en/                  # Traducciones en inglés
│   │
│   ├── types/
│   │   └── models.ts                # Tipos TypeScript del dominio
│   │
│   ├── data/
│   │   └── products.json            # Catálogo de 20 collares
│   │
│   ├── App.tsx                      # Componente raíz
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Estilos globales + Tailwind
│
├── .env.example                     # Template de variables de entorno
├── package.json                     # Dependencias y scripts
├── tailwind.config.js              # Configuración de Tailwind
├── tsconfig.json                    # Configuración de TypeScript
├── vite.config.ts                   # Configuración de Vite
├── PLAN_MAESTRO.md                  # Roadmap completo del proyecto
├── PLANNING.md                      # Arquitectura y decisiones técnicas
├── TASKS.md                         # Lista de tareas por hito
└── Claude.md                        # Guía para Claude Code
```

## 💰 Sistema de Cupones

Cupones preconfigurados para testing:

| Código | Descuento | Mínimo | Descripción |
|--------|-----------|--------|-------------|
| `WELCOME10` | 10% | - | Cupón de bienvenida |
| `PRISCILLA15` | 15% | - | Cupón especial |
| `VERANO20` | 20% | $50 | Cupón de verano |
| `NAVIDAD25` | 25% | $100 | Cupón navideño |

**Usar cupones:**
1. Agregar productos al carrito
2. Abrir carrito (click en icono o Cmd/Ctrl + K)
3. Ingresar código en el campo "Código de descuento"
4. Click en "Aplicar"

## 🚀 Deployment

### 🌐 Sitio en Producción

- **Sitio Web:** https://www.sondenudos.com
- **Dominio Principal:** sondenudos.com (redirige a www)
- **GitHub:** https://github.com/mperedwa/son-de-nudos
- **Vercel:** Configurado con dominio personalizado
- **Panel Admin:** https://www.sondenudos.com/admin/login
- **Estado:** ✅ Desplegado y funcionando

> **Dominio Personalizado:** El sitio está configurado con el dominio sondenudos.com comprado en Namecheap. El dominio apex redirige automáticamente a www para mejor rendimiento (CNAME).

### Build de Producción

```bash
npm run build
```

Esto genera la carpeta `dist/` lista para deployment.

### CI/CD Configurado

El proyecto tiene **deployment automático** configurado:

1. **Push a GitHub** → Trigger automático de build en Vercel
2. **Pull Request** → Preview deployment automático
3. **Merge a main** → Deploy a producción

### Deployment Manual en Vercel

Si necesitas hacer un deployment manual:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy a producción
vercel --prod
```

### Variables de Entorno en Producción

Configurar en Vercel Dashboard → Settings → Environment Variables:

- `VITE_DATA_MODE` = `stripe` (para pagos reales)
- `VITE_STRIPE_PUBLISHABLE_KEY` = tu clave pública de producción
- `STRIPE_SECRET_KEY` = tu clave secreta de producción (solo backend)

**⚠️ Importante:** Usar claves de producción de Stripe, no de test.

### Configuración de Vercel

El proyecto está configurado automáticamente con:

- **Build Command:** `vite build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Framework:** Vite detectado automáticamente

### Otras Plataformas

- **Netlify**: Similar a Vercel, deployment automático desde Git
- **CloudFlare Pages**: Excelente performance global
- **AWS Amplify**: Para proyectos enterprise

## 🧪 Testing

### Pruebas Manuales

1. **Navegación:**
   - ✅ Grid de productos carga correctamente
   - ✅ Filtros funcionan y se reflejan en URL
   - ✅ Click en producto navega a detalle

2. **Carrito:**
   - ✅ Agregar al carrito desde página de producto
   - ✅ Abrir carrito con Cmd/Ctrl + K
   - ✅ Modificar cantidades
   - ✅ Aplicar cupones
   - ✅ Ver barra de progreso de envío gratis

3. **Checkout:**
   - ✅ Formulario de contacto valida campos requeridos
   - ✅ Seleccionar método de envío (envío/pickup)
   - ✅ Completar checkout y redirigir a success

4. **Stripe (si está configurado):**
   - ✅ Redirección a Stripe Checkout
   - ✅ Pago con tarjeta de prueba: `4242 4242 4242 4242`
   - ✅ Retorno a página de success

### Pruebas Unitarias

```bash
# TODO: Implementar tests con Vitest
npm run test
```

## 🎨 Personalización

### Colores

Editar `tailwind.config.js`:

```javascript
colors: {
  'primary-brown': '#8B6F47',    // Color primario
  'secondary-beige': '#F5E6D3',  // Color secundario
  'accent-gold': '#D4A574',      // Color de acento
  // ...
}
```

### Productos

Editar `src/data/products.json`:

```json
{
  "id": "prod-xxx",
  "handle": "nombre-producto",
  "title": "Nombre del Producto",
  "price": { "amount": 100, "currency": "USD" },
  "images": ["/images/producto.jpg"],
  "variants": [...]
}
```

### Cupones

Editar `src/store/cart.ts` en la función `applyCoupon`:

```typescript
const validCoupons = {
  MICUPON: { percent: 0.1 },      // 10% descuento
  OTRO: { percent: 0.2, minAmount: 50 }  // 20% con mínimo $50
}
```

## 🐛 Troubleshooting

### El servidor no inicia

```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Errores de TypeScript

```bash
# Limpiar caché de TypeScript
rm -rf node_modules/.vite
npm run dev
```

### Stripe no funciona

1. Verificar que `VITE_DATA_MODE=stripe`
2. Verificar claves en `.env`
3. Revisar consola del navegador para errores
4. Verificar que las claves sean de test (empiezan con `pk_test_` y `sk_test_`)

### Productos no cargan

1. Verificar que `src/data/products.json` existe
2. Revisar consola del navegador
3. Verificar formato JSON válido

## 📚 Recursos

- [Documentación de React](https://react.dev)
- [Documentación de Vite](https://vitejs.dev)
- [Documentación de TailwindCSS](https://tailwindcss.com)
- [Documentación de Stripe](https://stripe.com/docs)
- [Documentación de Zustand](https://github.com/pmndrs/zustand)

## 📝 Roadmap

### Completado ✅

- [x] Setup del proyecto con Vite + React + TypeScript
- [x] Configuración de TailwindCSS con paleta personalizada
- [x] Sistema de rutas con React Router
- [x] Layout completo (Header, Footer, Announcement Bar)
- [x] Grid de productos con filtros y ordenamiento
- [x] Página de detalle de producto con selector de variantes
- [x] Carrito de compras con drawer lateral
- [x] Sistema de cupones y descuentos
- [x] Cálculo de envío con umbral de envío gratis
- [x] Página de checkout completa
- [x] Integración con mockServer
- [x] Integración con Stripe Checkout
- [x] Internacionalización (i18n) - Español/Inglés
- [x] Panel de Administración con Supabase
- [x] CRUD de productos y variantes
- [x] Gestión de pedidos
- [x] Upload de imágenes con Storage
- [x] Contenido bilingüe (título/descripción ES/EN)
- [x] Búsqueda de productos
- [x] Landing page con diseño moderno
- [x] Webhook de Stripe para guardar pedidos automáticamente
- [x] CRUD de cupones desde el admin
- [x] Vista de inventario consolidado
- [x] Documentación del panel de administración
- [x] Sistema de zonas de envío con Google Places API
- [x] Configuración de envío desde admin
- [x] Panel de configuración completo (8 secciones)
- [x] SEO básico (meta tags, Open Graph, keywords)
- [x] SEO avanzado (sitemap.xml, robots.txt, canonical URLs)
- [x] Schema markup JSON-LD (Product, Organization)
- [x] Redes sociales dinámicas desde admin
- [x] Banner de anuncios configurable (bilingüe)
- [x] Branding dinámico (logo y favicon desde admin)
- [x] Política de devoluciones (página pública bilingüe)

### Pendiente ⏳

- [ ] Integración con Shopify Storefront API (opcional)
- [ ] Pruebas unitarias con Vitest
- [ ] Tests E2E con Playwright
- [ ] Blog de contenido
- [ ] Sistema de reviews y ratings
- [ ] Wishlist / Lista de deseos
- [ ] Comparador de productos
- [ ] Filtros avanzados (rango de precio con slider)
- [ ] Ordenamiento por popularidad real
- [ ] PWA (Progressive Web App)
- [ ] Dark mode
- [ ] Histórico de cambios de stock

## 👥 Contribuir

Este es un proyecto personal, pero las sugerencias son bienvenidas.

## 📄 Licencia

Todos los derechos reservados - Son de Nudos by Priscilla

---

**Desarrollado con ❤️ usando React, TypeScript y TailwindCSS**
