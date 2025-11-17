#!/usr/bin/env tsx

/**
 * Son de Nudos - Migration Script
 *
 * Migra los 20 productos de src/data/products.json a Supabase
 *
 * Uso:
 *   npm run migrate           # Ejecuta migración real
 *   npm run migrate:dry       # Modo dry-run (solo preview)
 *
 * Requisitos:
 *   - Tener .env configurado con SUPABASE_SERVICE_ROLE_KEY
 *   - Haber ejecutado las migraciones de schema previamente
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { Database } from '../src/lib/supabase'

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DRY_RUN = process.argv.includes('--dry-run')
const VERBOSE = process.argv.includes('--verbose') || DRY_RUN

// Variables de entorno
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Variables de entorno faltantes')
  console.error('   VITE_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✓' : '✗')
  console.error('\n💡 Asegúrate de tener un archivo .env con estas variables')
  process.exit(1)
}

// Cliente Supabase con SERVICE_ROLE_KEY para bypasear RLS
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

// ============================================================================
// TIPOS
// ============================================================================

interface Money {
  amount: number
  currency: string
}

interface ProductJSON {
  id: string
  handle: string
  title: string
  descriptionHtml: string
  images: string[]
  price: Money
  compareAtPrice?: Money
  options: string[]
  variants: VariantJSON[]
  tags: string[]
  availableForSale: boolean
  createdAt: string
}

interface VariantJSON {
  id: string
  title: string
  sku: string
  price: Money
  compareAtPrice?: Money
  available: boolean
  options: Record<string, string>
  stock: number
  image?: string
}

// ============================================================================
// UTILIDADES
// ============================================================================

function log(message: string, level: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const icons = {
    info: '📝',
    success: '✅',
    error: '❌',
    warn: '⚠️',
  }
  console.log(`${icons[level]} ${message}`)
}

function verboseLog(message: string) {
  if (VERBOSE) {
    console.log(`   ${message}`)
  }
}

// ============================================================================
// TRANSFORMACIÓN DE DATOS
// ============================================================================

function transformProduct(productJSON: ProductJSON) {
  return {
    handle: productJSON.handle,
    title: productJSON.title,
    description_html: productJSON.descriptionHtml,
    images: productJSON.images,
    price: productJSON.price.amount,
    compare_at_price: productJSON.compareAtPrice?.amount || null,
    tags: productJSON.tags,
    available_for_sale: productJSON.availableForSale,
    created_at: productJSON.createdAt,
  }
}

function transformVariant(variantJSON: VariantJSON, productId: string) {
  return {
    product_id: productId,
    title: variantJSON.title,
    sku: variantJSON.sku,
    price: variantJSON.price.amount,
    compare_at_price: variantJSON.compareAtPrice?.amount || null,
    available: variantJSON.available,
    stock: variantJSON.stock,
    options: variantJSON.options,
    image: variantJSON.image || null,
  }
}

// ============================================================================
// MIGRACIÓN
// ============================================================================

async function migrateProducts() {
  log('Iniciando migración de productos a Supabase', 'info')

  if (DRY_RUN) {
    log('Modo DRY RUN activado - No se realizarán cambios en la base de datos', 'warn')
  }

  // 1. Leer products.json
  log('Leyendo productos desde src/data/products.json...')
  const productsPath = join(__dirname, '../src/data/products.json')
  const productsJSON: ProductJSON[] = JSON.parse(readFileSync(productsPath, 'utf-8'))
  log(`${productsJSON.length} productos encontrados`, 'success')

  // Estadísticas
  let productsInserted = 0
  let variantsInserted = 0
  const errors: string[] = []

  // 2. Procesar cada producto
  for (const productJSON of productsJSON) {
    verboseLog(`\nProcesando: ${productJSON.title}`)

    try {
      // Transformar datos del producto
      const productData = transformProduct(productJSON)
      verboseLog(`  - Handle: ${productData.handle}`)
      verboseLog(`  - Precio: $${productData.price}`)
      verboseLog(`  - Variantes: ${productJSON.variants.length}`)
      verboseLog(`  - Tags: ${productData.tags.join(', ')}`)

      if (DRY_RUN) {
        verboseLog('  - [DRY RUN] Se insertaría el producto')
        productsInserted++
        variantsInserted += productJSON.variants.length
        continue
      }

      // Insertar producto en Supabase
      const { data: insertedProduct, error: productError } = await supabase
        .from('products')
        .insert(productData)
        .select('id')
        .single()

      if (productError) {
        throw new Error(`Error insertando producto: ${productError.message}`)
      }

      if (!insertedProduct) {
        throw new Error('No se recibió ID del producto insertado')
      }

      verboseLog(`  - ✓ Producto insertado con ID: ${insertedProduct.id}`)
      productsInserted++

      // 3. Insertar variantes
      for (const variantJSON of productJSON.variants) {
        const variantData = transformVariant(variantJSON, insertedProduct.id)

        verboseLog(`    → Variante: ${variantData.title} (Stock: ${variantData.stock})`)

        const { error: variantError } = await supabase
          .from('variants')
          .insert(variantData)

        if (variantError) {
          throw new Error(`Error insertando variante ${variantJSON.sku}: ${variantError.message}`)
        }

        verboseLog(`      ✓ Variante insertada`)
        variantsInserted++
      }

      verboseLog(`  - ✓ ${productJSON.variants.length} variantes insertadas`)

    } catch (error) {
      const errorMsg = `Error en producto ${productJSON.handle}: ${error instanceof Error ? error.message : String(error)}`
      log(errorMsg, 'error')
      errors.push(errorMsg)
    }
  }

  // ============================================================================
  // RESUMEN
  // ============================================================================

  console.log('\n' + '='.repeat(70))
  log('RESUMEN DE MIGRACIÓN', 'info')
  console.log('='.repeat(70))

  if (DRY_RUN) {
    log('Modo: DRY RUN (simulación)', 'warn')
  } else {
    log('Modo: PRODUCCIÓN (cambios aplicados)', 'success')
  }

  console.log(`\n📦 Productos: ${productsInserted}/${productsJSON.length}`)
  console.log(`🔧 Variantes: ${variantsInserted}`)

  if (errors.length > 0) {
    console.log(`\n⚠️  Errores encontrados: ${errors.length}`)
    errors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`))
    process.exit(1)
  } else {
    log('\n🎉 Migración completada exitosamente', 'success')

    if (!DRY_RUN) {
      console.log('\n💡 Próximos pasos:')
      console.log('   1. Verifica los datos en Supabase Dashboard')
      console.log('   2. Prueba que la app cargue productos desde Supabase')
      console.log('   3. Verifica que el stock y variantes sean correctos')
    }
  }

  console.log('\n' + '='.repeat(70) + '\n')
}

// ============================================================================
// EJECUCIÓN
// ============================================================================

migrateProducts()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    log(`Error fatal: ${error}`, 'error')
    process.exit(1)
  })
