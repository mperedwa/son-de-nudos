-- ============================================================================
-- Migración: Sistema de Colecciones Musicales
-- Fecha: 2025-12-10
-- Descripción: Implementa tabla collections y relación con products
-- ============================================================================

-- ==============================================================================
-- TABLA: collections
-- ==============================================================================
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT UNIQUE NOT NULL,
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_es TEXT,
  description_en TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  visible BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT collections_handle_valid CHECK (handle ~ '^[a-z0-9-]+$'),
  CONSTRAINT collections_sort_order_non_negative CHECK (sort_order >= 0)
);

-- Comentario de documentación
COMMENT ON TABLE collections IS 'Colecciones temáticas de productos (ej: Verano Forte, Invierno Pianissimo) con nombres musicales';
COMMENT ON COLUMN collections.handle IS 'Slug único para URLs (ej: verano-forte, invierno-pianissimo)';
COMMENT ON COLUMN collections.name_es IS 'Nombre de la colección en español';
COMMENT ON COLUMN collections.name_en IS 'Nombre de la colección en inglés';
COMMENT ON COLUMN collections.sort_order IS 'Orden de aparición en landing page y listados (menor = primero)';
COMMENT ON COLUMN collections.visible IS 'Si es false, la colección no aparece en el frontend (para preparar lanzamientos)';

-- ==============================================================================
-- ÍNDICES para performance
-- ==============================================================================
CREATE INDEX idx_collections_handle ON collections(handle);
CREATE INDEX idx_collections_visible ON collections(visible);
CREATE INDEX idx_collections_sort_order ON collections(sort_order ASC);

-- ==============================================================================
-- TRIGGER: updated_at automático
-- ==============================================================================
CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- ACTUALIZAR TABLA: products
-- ==============================================================================

-- Agregar columna collection_id (opcional, puede ser NULL)
ALTER TABLE products
  ADD COLUMN collection_id UUID REFERENCES collections(id) ON DELETE SET NULL;

-- Comentario de documentación
COMMENT ON COLUMN products.collection_id IS 'Colección a la que pertenece el producto (opcional). Si es NULL, el producto no pertenece a ninguna colección.';

-- Índice para mejorar JOIN performance
CREATE INDEX idx_products_collection_id ON products(collection_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Lectura pública: solo colecciones visibles
CREATE POLICY "Collections are viewable by everyone"
  ON collections FOR SELECT
  USING (visible = true);

-- Solo usuarios autenticados (admins) pueden crear
CREATE POLICY "Only authenticated users can insert collections"
  ON collections FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Solo usuarios autenticados (admins) pueden actualizar
CREATE POLICY "Only authenticated users can update collections"
  ON collections FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Solo usuarios autenticados (admins) pueden eliminar
CREATE POLICY "Only authenticated users can delete collections"
  ON collections FOR DELETE
  USING (auth.role() = 'authenticated');

-- ==============================================================================
-- DATOS INICIALES: 3 colecciones de ejemplo
-- ==============================================================================

INSERT INTO collections (handle, name_es, name_en, description_es, description_en, sort_order, visible) VALUES
(
  'verano-forte',
  'Verano Forte',
  'Summer Forte',
  'Colección vibrante con colores cálidos y diseños energéticos perfectos para el verano. Piezas que expresan fuerza y vitalidad.',
  'Vibrant collection with warm colors and energetic designs perfect for summer. Pieces that express strength and vitality.',
  1,
  true
),
(
  'invierno-pianissimo',
  'Invierno Pianissimo',
  'Winter Pianissimo',
  'Diseños sutiles y elegantes en tonos fríos que evocan la serenidad del invierno. Delicadeza en cada nudo.',
  'Subtle and elegant designs in cool tones that evoke the serenity of winter. Delicacy in every knot.',
  2,
  true
),
(
  'primavera-allegro',
  'Primavera Allegro',
  'Spring Allegro',
  'Piezas alegres y coloridas que celebran la renovación de la primavera. Movimiento y alegría en macramé.',
  'Cheerful and colorful pieces that celebrate the renewal of spring. Movement and joy in macramé.',
  3,
  true
);

-- ==============================================================================
-- VERIFICACIÓN FINAL
-- ==============================================================================

-- Verificar que la migración se aplicó correctamente
DO $$
BEGIN
  -- Verificar existencia de tabla collections
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'collections') THEN
    RAISE EXCEPTION 'Error: Tabla collections no fue creada';
  END IF;

  -- Verificar existencia de columna collection_id en products
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'collection_id'
  ) THEN
    RAISE EXCEPTION 'Error: Columna collection_id no fue agregada a products';
  END IF;

  -- Verificar que se insertaron las 3 colecciones iniciales
  IF (SELECT COUNT(*) FROM collections) < 3 THEN
    RAISE WARNING 'Advertencia: Se esperaban 3 colecciones iniciales pero se encontraron menos';
  END IF;

  RAISE NOTICE 'Migración de colecciones aplicada correctamente ✓';
END $$;
