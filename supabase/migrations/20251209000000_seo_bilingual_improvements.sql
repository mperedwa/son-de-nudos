-- ============================================================================
-- Migration: SEO Bilingüe + Mejoras en Configuración
-- Fecha: 2025-12-09
-- Descripción: Agrega campos SEO bilingües (título y descripción ES/EN)
--              para permitir meta tags específicos por idioma
-- ============================================================================

-- ==============================================================================
-- 1. AGREGAR COLUMNAS SEO BILINGÜES
-- ==============================================================================

ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS meta_title_es TEXT,
ADD COLUMN IF NOT EXISTS meta_title_en TEXT,
ADD COLUMN IF NOT EXISTS meta_description_es TEXT,
ADD COLUMN IF NOT EXISTS meta_description_en TEXT;

COMMENT ON COLUMN store_settings.meta_title_es IS 'Meta título SEO en español (máx 70 caracteres)';
COMMENT ON COLUMN store_settings.meta_title_en IS 'Meta título SEO en inglés (máx 70 caracteres)';
COMMENT ON COLUMN store_settings.meta_description_es IS 'Meta descripción SEO en español (máx 160 caracteres)';
COMMENT ON COLUMN store_settings.meta_description_en IS 'Meta descripción SEO en inglés (máx 160 caracteres)';

-- ==============================================================================
-- 2. MIGRAR DATOS EXISTENTES (MANTENER COMPATIBILIDAD)
-- ==============================================================================

-- Copiar valores actuales de meta_title y meta_description a ambas versiones bilingües
-- Solo si las columnas bilingües están vacías (primera vez ejecutando la migración)
UPDATE store_settings
SET
  meta_title_es = COALESCE(meta_title_es, meta_title),
  meta_title_en = COALESCE(meta_title_en, meta_title),
  meta_description_es = COALESCE(meta_description_es, meta_description),
  meta_description_en = COALESCE(meta_description_en, meta_description)
WHERE id IS NOT NULL;

-- ==============================================================================
-- 3. BACKWARD COMPATIBILITY
-- ==============================================================================

-- IMPORTANTE: NO eliminamos las columnas antiguas (meta_title, meta_description)
-- Razón: Sirven como fallback si los campos bilingües están vacíos
-- El código TypeScript usará la siguiente lógica:
--   - Si meta_title_es/en existe → usarlo
--   - Si no existe → usar meta_title (fallback)

-- ==============================================================================
-- 4. VALORES POR DEFECTO PARA CAMPOS BILINGÜES
-- ==============================================================================

-- Si el registro principal no tiene valores bilingües, establecer defaults
UPDATE store_settings
SET
  meta_title_es = COALESCE(meta_title_es, 'Son de Nudos by Priscilla - Artesanías Exclusivas'),
  meta_title_en = COALESCE(meta_title_en, 'Son de Nudos by Priscilla - Handmade Artisan Jewelry'),
  meta_description_es = COALESCE(
    meta_description_es,
    'Collares y accesorios de macramé hechos a mano con amor. Cada pieza es única y especial.'
  ),
  meta_description_en = COALESCE(
    meta_description_en,
    'Handmade macramé necklaces and accessories crafted with love. Each piece is unique and special.'
  )
WHERE id IS NOT NULL;

-- ==============================================================================
-- 5. ÍNDICES (OPCIONAL - MEJORAR PERFORMANCE EN QUERIES)
-- ==============================================================================

-- No necesarios para esta tabla pequeña (un solo registro)
-- Pero se pueden agregar si en el futuro hay múltiples configuraciones

-- ==============================================================================
-- NOTAS FINALES
-- ==============================================================================

-- Esta migración es completamente backward compatible:
-- - Las columnas antiguas (meta_title, meta_description) se mantienen
-- - El código TypeScript implementará fallback automático
-- - No se rompe ninguna funcionalidad existente
-- - Los valores bilingües son opcionales (nullable)

-- Para verificar que la migración funcionó:
-- SELECT meta_title, meta_title_es, meta_title_en FROM store_settings;
