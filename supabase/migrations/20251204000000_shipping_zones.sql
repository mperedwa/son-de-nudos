-- Migración: Agregar zonas de envío a shipping_config
-- Fecha: 2025-12-04
-- Descripción: Actualiza la tabla shipping_config para soportar múltiples zonas de envío

-- Renombrar columna standard_cost a zone_1_cost (USA)
ALTER TABLE shipping_config
  RENAME COLUMN standard_cost TO zone_1_cost;

-- Agregar columna para Zona 2 (Canadá, México)
ALTER TABLE shipping_config
  ADD COLUMN zone_2_cost DECIMAL(10, 2) DEFAULT 18.99 NOT NULL;

-- Agregar constraint para zona 2
ALTER TABLE shipping_config
  ADD CONSTRAINT zone_2_cost_positive CHECK (zone_2_cost >= 0);

-- Actualizar registro existente con nuevos valores
UPDATE shipping_config
SET
  zone_1_cost = 8.99,
  zone_2_cost = 18.99
WHERE id IS NOT NULL;

-- Comentarios de documentación
COMMENT ON COLUMN shipping_config.zone_1_cost IS 'Costo de envío para Zona 1 (Estados Unidos)';
COMMENT ON COLUMN shipping_config.zone_2_cost IS 'Costo de envío para Zona 2 (Canadá, México)';
