/**
 * Script para generar la plantilla Excel de importación de productos
 * Ejecutar: npm run generate:template
 */

import * as XLSX from 'xlsx'
import * as path from 'path'

// Definir las columnas de la hoja de Productos
const productosHeaders = [
  'handle',
  'title',
  'title_en',
  'description_html',
  'description_html_en',
  'price',
  'compare_at_price',
  'tags',
  'available_for_sale',
  'images'
]

// Ejemplo de producto
const productosEjemplo = [
  {
    handle: 'collar-macrame-azul',
    title: 'Collar Macramé Azul Oceánico',
    title_en: 'Ocean Blue Macramé Necklace',
    description_html: '<p>Hermoso collar hecho a mano con técnica de macramé. Cordón de algodón 100% natural teñido en tonos azules que evocan el océano.</p>',
    description_html_en: '<p>Beautiful handmade necklace with macramé technique. 100% natural cotton cord dyed in ocean blue tones.</p>',
    price: 45.00,
    compare_at_price: 55.00,
    tags: 'nuevo,collar,azul',
    available_for_sale: 'TRUE',
    images: ''
  },
  {
    handle: 'bolso-macrame-natural',
    title: 'Bolso Macramé Natural',
    title_en: 'Natural Macramé Bag',
    description_html: '<p>Bolso artesanal de macramé en color natural. Perfecto para el día a día o la playa.</p>',
    description_html_en: '<p>Handmade macramé bag in natural color. Perfect for everyday use or the beach.</p>',
    price: 89.00,
    compare_at_price: '',
    tags: 'bolso,natural',
    available_for_sale: 'TRUE',
    images: ''
  }
]

// Definir las columnas de la hoja de Variantes
const variantesHeaders = [
  'product_handle',
  'largo',
  'grosor',
  'material_cordon',
  'material_accesorios',
  'color_primario',
  'color_secundario',
  'price',
  'compare_at_price',
  'stock',
  'available',
  'image'
]

// Ejemplos de variantes
const variantesEjemplo = [
  {
    product_handle: 'collar-macrame-azul',
    largo: '18 in',
    grosor: '3mm',
    material_cordon: 'Algodón',
    material_accesorios: 'Plata 925',
    color_primario: 'Azul',
    color_secundario: 'Blanco',
    price: 45.00,
    compare_at_price: 55.00,
    stock: 5,
    available: 'TRUE',
    image: ''
  },
  {
    product_handle: 'collar-macrame-azul',
    largo: '20 in',
    grosor: '3mm',
    material_cordon: 'Algodón',
    material_accesorios: 'Plata 925',
    color_primario: 'Azul',
    color_secundario: 'Blanco',
    price: 48.00,
    compare_at_price: 58.00,
    stock: 3,
    available: 'TRUE',
    image: ''
  },
  {
    product_handle: 'bolso-macrame-natural',
    largo: '',
    grosor: '5mm',
    material_cordon: 'Algodón reciclado',
    material_accesorios: 'Madera',
    color_primario: 'Natural',
    color_secundario: '',
    price: 89.00,
    compare_at_price: '',
    stock: 2,
    available: 'TRUE',
    image: ''
  }
]

// Hoja de instrucciones
const instrucciones = [
  ['INSTRUCCIONES PARA LLENAR LA PLANTILLA'],
  [''],
  ['HOJA "Productos":'],
  ['- handle: Identificador único para la URL (solo letras minúsculas, números y guiones). Ej: collar-macrame-azul'],
  ['- title: Nombre del producto en español (requerido)'],
  ['- title_en: Nombre del producto en inglés (opcional)'],
  ['- description_html: Descripción en español, puede incluir HTML básico como <p>, <b>, <ul>'],
  ['- description_html_en: Descripción en inglés (opcional)'],
  ['- price: Precio en USD (número decimal). Ej: 45.00'],
  ['- compare_at_price: Precio original si hay descuento (dejar vacío si no hay descuento)'],
  ['- tags: Etiquetas separadas por coma. Ej: nuevo,collar,azul'],
  ['- available_for_sale: TRUE si está disponible, FALSE si no'],
  ['- images: URLs de imágenes separadas por | (pipe). Ej: url1|url2|url3'],
  [''],
  ['HOJA "Variantes":'],
  ['- product_handle: Handle del producto padre (debe existir en hoja Productos)'],
  ['- largo: Opciones válidas: 16 in, 18 in, 20 in, 22 in, 24 in (dejar vacío si no aplica)'],
  ['- grosor: Opciones válidas: 1.5mm, 3mm, 5mm, 9mm'],
  ['- material_cordon: Algodón, Algodón encerado, Algodón reciclado, Nylon, Poliéster'],
  ['- material_accesorios: Plata 925, Latón, Cobre, Bronce, Piedra natural, Cristal, Madera, Cerámica'],
  ['- color_primario: Natural, Blanco, Negro, Gris, Beige, Marrón, Coral, Rosa, Rojo, Naranja, Amarillo, Mostaza, Verde, Verde musgo, Azul, Celeste, Azul marino, Turquesa, Morado, Dorado, Plateado'],
  ['- color_secundario: Mismo listado que color_primario (opcional)'],
  ['- price: Precio de esta variante en USD'],
  ['- compare_at_price: Precio original si hay descuento'],
  ['- stock: Cantidad disponible (número entero)'],
  ['- available: TRUE si está disponible, FALSE si no'],
  ['- image: URL de imagen específica de esta variante (opcional)'],
  [''],
  ['NOTAS IMPORTANTES:'],
  ['- Cada producto debe tener al menos una variante'],
  ['- El handle de producto debe ser único'],
  ['- Los campos marcados como requeridos no pueden estar vacíos'],
  ['- Para las imágenes, primero súbelas al panel admin y copia las URLs'],
]

// Crear el workbook
const workbook = XLSX.utils.book_new()

// Crear hoja de Productos
const wsProductos = XLSX.utils.json_to_sheet(productosEjemplo, { header: productosHeaders })
// Ajustar anchos de columna
wsProductos['!cols'] = [
  { wch: 25 }, // handle
  { wch: 35 }, // title
  { wch: 35 }, // title_en
  { wch: 50 }, // description_html
  { wch: 50 }, // description_html_en
  { wch: 10 }, // price
  { wch: 15 }, // compare_at_price
  { wch: 20 }, // tags
  { wch: 15 }, // available_for_sale
  { wch: 50 }, // images
]
XLSX.utils.book_append_sheet(workbook, wsProductos, 'Productos')

// Crear hoja de Variantes
const wsVariantes = XLSX.utils.json_to_sheet(variantesEjemplo, { header: variantesHeaders })
wsVariantes['!cols'] = [
  { wch: 25 }, // product_handle
  { wch: 10 }, // largo
  { wch: 10 }, // grosor
  { wch: 20 }, // material_cordon
  { wch: 20 }, // material_accesorios
  { wch: 15 }, // color_primario
  { wch: 15 }, // color_secundario
  { wch: 10 }, // price
  { wch: 15 }, // compare_at_price
  { wch: 8 },  // stock
  { wch: 10 }, // available
  { wch: 50 }, // image
]
XLSX.utils.book_append_sheet(workbook, wsVariantes, 'Variantes')

// Crear hoja de Instrucciones
const wsInstrucciones = XLSX.utils.aoa_to_sheet(instrucciones)
wsInstrucciones['!cols'] = [{ wch: 120 }]
XLSX.utils.book_append_sheet(workbook, wsInstrucciones, 'Instrucciones')

// Guardar el archivo
const outputPath = path.join(process.cwd(), 'templates', 'plantilla-productos.xlsx')
XLSX.writeFile(workbook, outputPath)

console.log('✅ Plantilla Excel generada exitosamente!')
console.log(`📁 Ubicación: ${outputPath}`)
console.log('')
console.log('La plantilla incluye:')
console.log('  - Hoja "Productos": con 2 ejemplos')
console.log('  - Hoja "Variantes": con 3 ejemplos')
console.log('  - Hoja "Instrucciones": guía de llenado')
