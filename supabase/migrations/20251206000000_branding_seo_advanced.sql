-- ============================================================================
-- Migration: Branding y SEO Avanzado
-- Fecha: 2025-12-06
-- Descripción: Agrega campos para logo, favicon, política de devoluciones,
--              robots.txt, sitemap y canonical URLs
-- ============================================================================

-- ==============================================================================
-- 1. NUEVOS CAMPOS EN store_settings
-- ==============================================================================

-- Branding: Logo y Favicon
ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS favicon_url TEXT;

COMMENT ON COLUMN store_settings.logo_url IS 'URL del logo de la tienda en Supabase Storage';
COMMENT ON COLUMN store_settings.favicon_url IS 'URL del favicon en Supabase Storage';

-- Legal: Política de devoluciones bilingüe
ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS return_policy_es TEXT,
ADD COLUMN IF NOT EXISTS return_policy_en TEXT;

COMMENT ON COLUMN store_settings.return_policy_es IS 'Política de devoluciones en español';
COMMENT ON COLUMN store_settings.return_policy_en IS 'Política de devoluciones en inglés';

-- SEO Avanzado
ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS robots_txt TEXT DEFAULT 'User-agent: *
Allow: /
Disallow: /admin/',
ADD COLUMN IF NOT EXISTS sitemap_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS schema_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS canonical_base_url TEXT DEFAULT 'https://www.sondenudos.com';

COMMENT ON COLUMN store_settings.robots_txt IS 'Contenido del archivo robots.txt';
COMMENT ON COLUMN store_settings.sitemap_enabled IS 'Si está habilitado el sitemap.xml automático';
COMMENT ON COLUMN store_settings.schema_enabled IS 'Si está habilitado el Schema markup JSON-LD';
COMMENT ON COLUMN store_settings.canonical_base_url IS 'URL base para canonical tags (ej: https://www.sondenudos.com)';

-- ==============================================================================
-- 2. BUCKET PARA BRANDING
-- ==============================================================================

-- Crear bucket público para logo y favicon
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'branding',
  'branding',
  true,
  2097152, -- 2MB límite
  ARRAY['image/png', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon']
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 3. RLS POLICIES PARA BUCKET BRANDING
-- ==============================================================================

-- Política de lectura pública (cualquiera puede ver logo/favicon)
CREATE POLICY "Public read branding" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'branding');

-- Política de inserción solo para usuarios autenticados
CREATE POLICY "Authenticated users can upload branding" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'branding'
    AND auth.role() = 'authenticated'
  );

-- Política de actualización solo para usuarios autenticados
CREATE POLICY "Authenticated users can update branding" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'branding'
    AND auth.role() = 'authenticated'
  );

-- Política de eliminación solo para usuarios autenticados
CREATE POLICY "Authenticated users can delete branding" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'branding'
    AND auth.role() = 'authenticated'
  );

-- ==============================================================================
-- 4. ACTUALIZAR REGISTRO EXISTENTE CON DEFAULTS
-- ==============================================================================

-- Asegurar que el registro existente tenga los valores por defecto
UPDATE store_settings
SET
  robots_txt = COALESCE(robots_txt, 'User-agent: *
Allow: /
Disallow: /admin/'),
  sitemap_enabled = COALESCE(sitemap_enabled, true),
  schema_enabled = COALESCE(schema_enabled, true),
  canonical_base_url = COALESCE(canonical_base_url, 'https://www.sondenudos.com')
WHERE id IS NOT NULL;
