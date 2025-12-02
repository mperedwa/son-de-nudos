# Guía de Importación Masiva de Productos

Esta guía explica cómo importar múltiples productos a tu tienda Son de Nudos de forma masiva usando un archivo Excel.

## Requisitos Previos

1. Tener Node.js instalado
2. Tener el proyecto configurado con las variables de entorno de Supabase
3. Generar la plantilla Excel

## Paso 1: Generar la Plantilla Excel

Ejecuta este comando para crear la plantilla:

```bash
npm run generate:template
```

Esto creará el archivo `templates/plantilla-productos.xlsx` con:
- **Hoja "Productos"**: Para los datos de cada producto
- **Hoja "Variantes"**: Para las variantes de cada producto
- **Hoja "Instrucciones"**: Guía de llenado

## Paso 2: Llenar la Plantilla

### Hoja "Productos"

| Campo | Descripción | Requerido | Ejemplo |
|-------|-------------|-----------|---------|
| `handle` | ID único para URL (solo minúsculas, números y guiones) | Sí | `collar-macrame-azul` |
| `title` | Nombre en español | Sí | `Collar Macramé Azul` |
| `title_en` | Nombre en inglés | No | `Blue Macramé Necklace` |
| `description_html` | Descripción en español (puede incluir HTML) | No | `<p>Hermoso collar...</p>` |
| `description_html_en` | Descripción en inglés | No | `<p>Beautiful necklace...</p>` |
| `price` | Precio en USD | Sí | `45.00` |
| `compare_at_price` | Precio original (para mostrar descuento) | No | `55.00` |
| `tags` | Etiquetas separadas por coma | No | `nuevo,collar,azul` |
| `available_for_sale` | Disponible para venta | Sí | `TRUE` o `FALSE` |
| `images` | URLs de imágenes separadas por `\|` | No | `url1\|url2\|url3` |

### Hoja "Variantes"

| Campo | Descripción | Requerido | Opciones Válidas |
|-------|-------------|-----------|------------------|
| `product_handle` | Handle del producto padre | Sí | Debe existir en hoja Productos |
| `largo` | Longitud del collar | No | `16 in`, `18 in`, `20 in`, `22 in`, `24 in` |
| `grosor` | Grosor del cordón | No | `1.5mm`, `3mm`, `5mm`, `9mm` |
| `material_cordon` | Material del cordón | No | `Algodón`, `Algodón encerado`, `Algodón reciclado`, `Nylon`, `Poliéster` |
| `material_accesorios` | Material de accesorios | No | `Plata 925`, `Latón`, `Cobre`, `Bronce`, `Piedra natural`, `Cristal`, `Madera`, `Cerámica` |
| `color_primario` | Color principal | No | Ver lista de colores abajo |
| `color_secundario` | Color secundario | No | Ver lista de colores abajo |
| `price` | Precio de esta variante | Sí | `45.00` |
| `compare_at_price` | Precio original | No | `55.00` |
| `stock` | Cantidad disponible | Sí | `5` |
| `available` | Disponible | Sí | `TRUE` o `FALSE` |
| `image` | URL de imagen de variante | No | URL completa |

### Colores Válidos

`Natural`, `Blanco`, `Negro`, `Gris`, `Beige`, `Marrón`, `Coral`, `Rosa`, `Rojo`, `Naranja`, `Amarillo`, `Mostaza`, `Verde`, `Verde musgo`, `Azul`, `Celeste`, `Azul marino`, `Turquesa`, `Morado`, `Dorado`, `Plateado`

## Paso 3: Subir Imágenes

Tienes dos opciones:

### Opción A: Subir desde el Panel Admin
1. Ve a `www.sondenudos.com/admin/products`
2. Crea un producto temporal
3. Sube las imágenes
4. Copia las URLs generadas
5. Pégalas en el Excel

### Opción B: Dejar las imágenes para después
1. Deja el campo `images` vacío en el Excel
2. Importa los productos
3. Después edita cada producto en el admin para agregar imágenes

## Paso 4: Verificar Datos (Dry Run)

Antes de importar, verifica que todo esté correcto:

```bash
npm run import:dry ./templates/plantilla-productos.xlsx
```

Este comando:
- Lee el archivo Excel
- Valida todos los datos
- Muestra qué se importaría
- **NO hace cambios** en la base de datos

Si hay errores, te indicará la fila y columna exacta para corregir.

## Paso 5: Importar

Cuando estés seguro de que todo está correcto:

```bash
npm run import:products ./templates/plantilla-productos.xlsx
```

Este comando:
- Importa todos los productos a Supabase
- Crea las variantes asociadas
- Genera SKUs automáticamente
- Muestra un resumen al final

## Ejemplo de Flujo Completo

```bash
# 1. Generar plantilla
npm run generate:template

# 2. Abrir y llenar en Excel/Google Sheets
open templates/plantilla-productos.xlsx

# 3. Verificar (sin importar)
npm run import:dry ./templates/plantilla-productos.xlsx

# 4. Si hay errores, corregir en Excel y volver al paso 3

# 5. Importar
npm run import:products ./templates/plantilla-productos.xlsx
```

## Solución de Problemas

### "Handle duplicado"
Cada producto debe tener un handle único. Revisa que no haya dos productos con el mismo handle.

### "Producto no existe" en variantes
El `product_handle` de la variante debe coincidir exactamente con un `handle` de la hoja Productos.

### "Valor inválido" en campos de variantes
Los campos como `largo`, `grosor`, `material_cordon`, etc. solo aceptan valores específicos. Revisa la lista de opciones válidas arriba.

### "Variables de entorno no configuradas"
Asegúrate de tener en tu archivo `.env`:
```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

## Tips

1. **Empieza con pocos productos** - Importa 2-3 productos primero para verificar que todo funcione
2. **Usa el dry run siempre** - Antes de importar, ejecuta `--dry` para detectar errores
3. **Backup** - Los datos se insertan, no se actualizan. Si necesitas corregir, elimina y reimporta
4. **Imágenes después** - Es más fácil importar productos sin imágenes y agregarlas después desde el admin
