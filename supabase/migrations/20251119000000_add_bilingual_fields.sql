-- ==============================================================================
-- Son de Nudos - Add Bilingual Fields to Products
-- ==============================================================================
-- Description: Agrega campos de título y descripción en inglés para soporte
--              bilingüe ES/EN en productos
-- Author: Claude Code + Mario Perez
-- Date: 2025-11-19
-- Version: 1.1
-- ==============================================================================

-- Agregar campo de título en inglés
ALTER TABLE products
ADD COLUMN IF NOT EXISTS title_en TEXT;

-- Agregar campo de descripción en inglés
ALTER TABLE products
ADD COLUMN IF NOT EXISTS description_html_en TEXT;

-- Comentarios de documentación
COMMENT ON COLUMN products.title IS 'Título del producto en español (requerido)';
COMMENT ON COLUMN products.title_en IS 'Título del producto en inglés (opcional)';
COMMENT ON COLUMN products.description_html IS 'Descripción HTML del producto en español';
COMMENT ON COLUMN products.description_html_en IS 'Descripción HTML del producto en inglés';
