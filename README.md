# Son de Nudos by Priscilla

E-commerce moderno y minimalista para venta de collares artesanales, construido con React, TypeScript y TailwindCSS.

## 🎯 Características Principales

### Funcionalidades Implementadas

- **Catálogo de productos** con grid responsivo (2/3/4 columnas)
- **Filtros avanzados** por disponibilidad, precio, material, color y largo
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
- **Contenido bilingüe** para productos (título y descripción ES/EN)
- **Búsqueda de productos** con SearchDrawer
- **Landing page** con diseño moderno y secciones modulares

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
- [ ] Integración con Google Analytics
- [ ] SEO optimization
- [ ] Sitemap XML
- [ ] PWA (Progressive Web App)
- [ ] Dark mode
- [ ] Webhook de Stripe para guardar pedidos
- [ ] CRUD de cupones desde el admin
- [ ] Vista de inventario consolidado

## 👥 Contribuir

Este es un proyecto personal, pero las sugerencias son bienvenidas.

## 📄 Licencia

Todos los derechos reservados - Son de Nudos by Priscilla

---

**Desarrollado con ❤️ usando React, TypeScript y TailwindCSS**
