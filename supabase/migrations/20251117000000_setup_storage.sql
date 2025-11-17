-- ============================================================================
-- STORAGE SETUP FOR PRODUCT IMAGES
-- ============================================================================
-- Migración para configurar Supabase Storage para imágenes de productos y variantes
-- Fecha: 2025-11-17

-- ============================================================================
-- 1. CREAR BUCKET PÚBLICO
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true, -- Público para que las imágenes sean accesibles directamente
  5242880, -- 5MB en bytes (5 * 1024 * 1024)
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. RLS POLICIES PARA STORAGE
-- ============================================================================

-- Policy 1: Lectura pública (todos pueden ver las imágenes de productos)
CREATE POLICY "Public read access on product images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

-- Policy 2: Upload solo para usuarios autenticados (admins)
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

-- Policy 3: Update solo para usuarios autenticados (admins)
CREATE POLICY "Authenticated users can update product images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

-- Policy 4: Delete solo para usuarios autenticados (admins)
CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');

-- ============================================================================
-- NOTAS DE IMPLEMENTACIÓN
-- ============================================================================
--
-- Estructura de carpetas sugerida:
-- product-images/
-- ├── products/{product-handle}/
-- │   ├── main-{uuid}.jpg
-- │   ├── gallery-1-{uuid}.jpg
-- │   └── gallery-2-{uuid}.jpg
-- └── variants/{variant-sku}/
--     └── {uuid}.jpg
--
-- Las URLs públicas tendrán el formato:
-- https://{project-ref}.supabase.co/storage/v1/object/public/product-images/{path}
--
-- Límites del tier gratuito:
-- - 1 GB de Storage total
-- - Suficiente para ~1000 imágenes de producto (asumiendo 1MB promedio)
-- ============================================================================
