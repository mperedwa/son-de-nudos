/**
 * Script de importación masiva de productos desde Excel a Supabase
 *
 * Uso:
 *   npm run import:products ./productos.xlsx        # Importar
 *   npm run import:products ./productos.xlsx --dry  # Solo verificar (sin importar)
 *
 * Requiere las variables de entorno:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import * as XLSX from 'xlsx'
import * as path from 'path'
import * as fs from 'fs'
import { createClient } from '@supabase/supabase-js'

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Tipos
interface ProductRow {
  handle: string
  title: string
  title_en?: string
  description_html?: string
  description_html_en?: string
  price: number
  compare_at_price?: number
  tags?: string
  available_for_sale: string | boolean
  images?: string
}

interface VariantRow {
  product_handle: string
  largo?: string
  grosor?: string
  material_cordon?: string
  material_accesorios?: string
  color_primario?: string
  color_secundario?: string
  price: number
  compare_at_price?: number
  stock: number
  available: string | boolean
  image?: string
}

interface ValidationError {
  sheet: string
  row: number
  field: string
  message: string
}

// Valores válidos para campos de variantes
const VALID_VALUES = {
  largo: ['16 in', '18 in', '20 in', '22 in', '24 in'],
  grosor: ['1.5mm', '3mm', '5mm', '9mm'],
  material_cordon: ['Algodón', 'Algodón encerado', 'Algodón reciclado', 'Nylon', 'Poliéster'],
  material_accesorios: ['Plata 925', 'Latón', 'Cobre', 'Bronce', 'Piedra natural', 'Cristal', 'Madera', 'Cerámica'],
  color: ['Natural', 'Blanco', 'Negro', 'Gris', 'Beige', 'Marrón', 'Coral', 'Rosa', 'Rojo', 'Naranja', 'Amarillo', 'Mostaza', 'Verde', 'Verde musgo', 'Azul', 'Celeste', 'Azul marino', 'Turquesa', 'Morado', 'Dorado', 'Plateado'],
}

// Validar configuración
function validateConfig() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    log('❌ Error: Variables de entorno no configuradas', 'red')
    log('   Asegúrate de tener en tu archivo .env:', 'yellow')
    log('   - VITE_SUPABASE_URL', 'yellow')
    log('   - SUPABASE_SERVICE_ROLE_KEY', 'yellow')
    process.exit(1)
  }

  return { supabaseUrl, supabaseKey }
}

// Leer archivo Excel
function readExcelFile(filePath: string): { productos: ProductRow[], variantes: VariantRow[] } {
  if (!fs.existsSync(filePath)) {
    log(`❌ Error: Archivo no encontrado: ${filePath}`, 'red')
    process.exit(1)
  }

  const workbook = XLSX.readFile(filePath)

  // Leer hoja de Productos
  const productosSheet = workbook.Sheets['Productos']
  if (!productosSheet) {
    log('❌ Error: No se encontró la hoja "Productos" en el Excel', 'red')
    process.exit(1)
  }
  const productos = XLSX.utils.sheet_to_json<ProductRow>(productosSheet)

  // Leer hoja de Variantes
  const variantesSheet = workbook.Sheets['Variantes']
  if (!variantesSheet) {
    log('❌ Error: No se encontró la hoja "Variantes" en el Excel', 'red')
    process.exit(1)
  }
  const variantes = XLSX.utils.sheet_to_json<VariantRow>(variantesSheet)

  return { productos, variantes }
}

// Validar datos
function validateData(productos: ProductRow[], variantes: VariantRow[]): ValidationError[] {
  const errors: ValidationError[] = []
  const handles = new Set<string>()

  // Validar productos
  productos.forEach((p, index) => {
    const row = index + 2 // +2 porque Excel empieza en 1 y tiene header

    // Handle requerido y único
    if (!p.handle || typeof p.handle !== 'string') {
      errors.push({ sheet: 'Productos', row, field: 'handle', message: 'Handle es requerido' })
    } else if (!/^[a-z0-9-]+$/.test(p.handle)) {
      errors.push({ sheet: 'Productos', row, field: 'handle', message: 'Handle solo puede contener letras minúsculas, números y guiones' })
    } else if (handles.has(p.handle)) {
      errors.push({ sheet: 'Productos', row, field: 'handle', message: `Handle duplicado: ${p.handle}` })
    } else {
      handles.add(p.handle)
    }

    // Title requerido
    if (!p.title || typeof p.title !== 'string') {
      errors.push({ sheet: 'Productos', row, field: 'title', message: 'Título es requerido' })
    }

    // Price requerido y positivo
    if (p.price === undefined || p.price === null || isNaN(Number(p.price))) {
      errors.push({ sheet: 'Productos', row, field: 'price', message: 'Precio es requerido y debe ser un número' })
    } else if (Number(p.price) < 0) {
      errors.push({ sheet: 'Productos', row, field: 'price', message: 'Precio no puede ser negativo' })
    }

    // Compare at price debe ser mayor que price si existe
    if (p.compare_at_price && Number(p.compare_at_price) <= Number(p.price)) {
      errors.push({ sheet: 'Productos', row, field: 'compare_at_price', message: 'Precio de comparación debe ser mayor que el precio' })
    }
  })

  // Validar variantes
  variantes.forEach((v, index) => {
    const row = index + 2

    // Product handle requerido y debe existir
    if (!v.product_handle) {
      errors.push({ sheet: 'Variantes', row, field: 'product_handle', message: 'Handle de producto es requerido' })
    } else if (!handles.has(v.product_handle)) {
      errors.push({ sheet: 'Variantes', row, field: 'product_handle', message: `Producto no existe: ${v.product_handle}` })
    }

    // Validar valores de campos específicos
    if (v.largo && !VALID_VALUES.largo.includes(v.largo)) {
      errors.push({ sheet: 'Variantes', row, field: 'largo', message: `Valor inválido. Opciones: ${VALID_VALUES.largo.join(', ')}` })
    }
    if (v.grosor && !VALID_VALUES.grosor.includes(v.grosor)) {
      errors.push({ sheet: 'Variantes', row, field: 'grosor', message: `Valor inválido. Opciones: ${VALID_VALUES.grosor.join(', ')}` })
    }
    if (v.material_cordon && !VALID_VALUES.material_cordon.includes(v.material_cordon)) {
      errors.push({ sheet: 'Variantes', row, field: 'material_cordon', message: `Valor inválido. Opciones: ${VALID_VALUES.material_cordon.join(', ')}` })
    }
    if (v.material_accesorios && !VALID_VALUES.material_accesorios.includes(v.material_accesorios)) {
      errors.push({ sheet: 'Variantes', row, field: 'material_accesorios', message: `Valor inválido. Opciones: ${VALID_VALUES.material_accesorios.join(', ')}` })
    }
    if (v.color_primario && !VALID_VALUES.color.includes(v.color_primario)) {
      errors.push({ sheet: 'Variantes', row, field: 'color_primario', message: `Valor inválido. Opciones: ${VALID_VALUES.color.join(', ')}` })
    }
    if (v.color_secundario && !VALID_VALUES.color.includes(v.color_secundario)) {
      errors.push({ sheet: 'Variantes', row, field: 'color_secundario', message: `Valor inválido. Opciones: ${VALID_VALUES.color.join(', ')}` })
    }

    // Price requerido
    if (v.price === undefined || v.price === null || isNaN(Number(v.price))) {
      errors.push({ sheet: 'Variantes', row, field: 'price', message: 'Precio es requerido' })
    }

    // Stock requerido y no negativo
    if (v.stock === undefined || v.stock === null || isNaN(Number(v.stock))) {
      errors.push({ sheet: 'Variantes', row, field: 'stock', message: 'Stock es requerido' })
    } else if (Number(v.stock) < 0) {
      errors.push({ sheet: 'Variantes', row, field: 'stock', message: 'Stock no puede ser negativo' })
    }
  })

  // Verificar que cada producto tenga al menos una variante
  handles.forEach(handle => {
    const hasVariant = variantes.some(v => v.product_handle === handle)
    if (!hasVariant) {
      errors.push({ sheet: 'Productos', row: 0, field: 'handle', message: `Producto "${handle}" no tiene variantes definidas` })
    }
  })

  return errors
}

// Generar título de variante
function generateVariantTitle(v: VariantRow): string {
  const parts: string[] = []
  if (v.largo) parts.push(v.largo)
  if (v.grosor) parts.push(v.grosor)
  if (v.material_cordon) parts.push(v.material_cordon)
  if (v.material_accesorios) parts.push(v.material_accesorios)
  if (v.color_primario) parts.push(v.color_primario)
  if (v.color_secundario) parts.push(v.color_secundario)
  return parts.join(', ') || 'Default'
}

// Generar SKU
function generateSKU(handle: string, index: number): string {
  const prefix = handle.toUpperCase().replace(/-/g, '').slice(0, 10)
  return `${prefix}-V${String(index + 1).padStart(2, '0')}`
}

// Parsear booleano
function parseBoolean(value: string | boolean | undefined): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value.toUpperCase() === 'TRUE'
  return true // default
}

// Importar a Supabase
async function importToSupabase(
  supabaseUrl: string,
  supabaseKey: string,
  productos: ProductRow[],
  variantes: VariantRow[],
  dryRun: boolean
) {
  const supabase = createClient(supabaseUrl, supabaseKey)

  const results = {
    productsCreated: 0,
    variantsCreated: 0,
    errors: [] as string[]
  }

  // Mapa de handle -> id para las variantes
  const productIdMap = new Map<string, string>()

  log('\n📦 Importando productos...', 'cyan')

  for (const p of productos) {
    const productData = {
      handle: p.handle,
      title: p.title,
      title_en: p.title_en || null,
      description_html: p.description_html || null,
      description_html_en: p.description_html_en || null,
      price: Number(p.price),
      compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
      tags: p.tags ? p.tags.split(',').map(t => t.trim()) : [],
      available_for_sale: parseBoolean(p.available_for_sale),
      images: p.images ? p.images.split('|').map(url => url.trim()).filter(Boolean) : [],
    }

    if (dryRun) {
      log(`  [DRY RUN] Producto: ${p.handle} - ${p.title}`, 'yellow')
      productIdMap.set(p.handle, 'dry-run-id')
      results.productsCreated++
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select('id')
        .single()

      if (error) {
        results.errors.push(`Producto ${p.handle}: ${error.message}`)
        log(`  ❌ Error en ${p.handle}: ${error.message}`, 'red')
      } else {
        productIdMap.set(p.handle, data.id)
        results.productsCreated++
        log(`  ✅ ${p.handle} - ${p.title}`, 'green')
      }
    }
  }

  log('\n📋 Importando variantes...', 'cyan')

  // Agrupar variantes por producto para generar SKUs secuenciales
  const variantsByProduct = new Map<string, VariantRow[]>()
  variantes.forEach(v => {
    const list = variantsByProduct.get(v.product_handle) || []
    list.push(v)
    variantsByProduct.set(v.product_handle, list)
  })

  for (const [handle, variants] of variantsByProduct) {
    const productId = productIdMap.get(handle)
    if (!productId) continue

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i]
      const variantTitle = generateVariantTitle(v)
      const sku = generateSKU(handle, i)

      const variantData = {
        product_id: productId,
        title: variantTitle,
        sku: sku,
        price: Number(v.price),
        compare_at_price: v.compare_at_price ? Number(v.compare_at_price) : null,
        stock: Number(v.stock),
        available: parseBoolean(v.available),
        image: v.image || null,
        options: {
          Largo: v.largo || null,
          Grosor: v.grosor || null,
          MaterialCordon: v.material_cordon || null,
          MaterialAccesorios: v.material_accesorios || null,
          ColorPrimario: v.color_primario || null,
          ColorSecundario: v.color_secundario || null,
        }
      }

      if (dryRun) {
        log(`  [DRY RUN] Variante: ${sku} - ${variantTitle}`, 'yellow')
        results.variantsCreated++
      } else {
        const { error } = await supabase
          .from('variants')
          .insert(variantData)

        if (error) {
          results.errors.push(`Variante ${sku}: ${error.message}`)
          log(`  ❌ Error en ${sku}: ${error.message}`, 'red')
        } else {
          results.variantsCreated++
          log(`  ✅ ${sku} - ${variantTitle}`, 'green')
        }
      }
    }
  }

  return results
}

// Main
async function main() {
  const args = process.argv.slice(2)
  const filePath = args.find(arg => !arg.startsWith('--'))
  const dryRun = args.includes('--dry') || args.includes('--dry-run')

  log('\n🚀 IMPORTADOR DE PRODUCTOS - Son de Nudos', 'cyan')
  log('═'.repeat(50), 'cyan')

  if (!filePath) {
    log('\n❌ Error: Debes especificar el archivo Excel', 'red')
    log('\nUso:', 'yellow')
    log('  npm run import:products ./productos.xlsx', 'yellow')
    log('  npm run import:products ./productos.xlsx --dry', 'yellow')
    process.exit(1)
  }

  if (dryRun) {
    log('\n⚠️  MODO DRY RUN - No se realizarán cambios en la base de datos', 'yellow')
  }

  // Validar configuración
  const { supabaseUrl, supabaseKey } = validateConfig()

  // Leer archivo
  log(`\n📖 Leyendo archivo: ${filePath}`, 'blue')
  const fullPath = path.resolve(filePath)
  const { productos, variantes } = readExcelFile(fullPath)
  log(`   Encontrados: ${productos.length} productos, ${variantes.length} variantes`, 'blue')

  // Validar datos
  log('\n🔍 Validando datos...', 'blue')
  const errors = validateData(productos, variantes)

  if (errors.length > 0) {
    log(`\n❌ Se encontraron ${errors.length} errores de validación:\n`, 'red')
    errors.forEach(e => {
      log(`   [${e.sheet}:${e.row}] ${e.field}: ${e.message}`, 'red')
    })
    log('\n⚠️  Corrige los errores en el Excel y vuelve a intentar', 'yellow')
    process.exit(1)
  }

  log('   ✅ Todos los datos son válidos', 'green')

  // Importar
  const results = await importToSupabase(supabaseUrl, supabaseKey, productos, variantes, dryRun)

  // Resumen
  log('\n' + '═'.repeat(50), 'cyan')
  log('📊 RESUMEN DE IMPORTACIÓN', 'cyan')
  log('═'.repeat(50), 'cyan')
  log(`   Productos creados: ${results.productsCreated}`, 'green')
  log(`   Variantes creadas: ${results.variantsCreated}`, 'green')

  if (results.errors.length > 0) {
    log(`   Errores: ${results.errors.length}`, 'red')
    results.errors.forEach(e => log(`     - ${e}`, 'red'))
  }

  if (dryRun) {
    log('\n⚠️  Este fue un DRY RUN. Para importar realmente, ejecuta sin --dry', 'yellow')
  } else {
    log('\n✅ ¡Importación completada exitosamente!', 'green')
  }
}

main().catch(error => {
  log(`\n❌ Error fatal: ${error.message}`, 'red')
  process.exit(1)
})
