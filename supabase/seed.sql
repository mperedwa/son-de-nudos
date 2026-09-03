-- ==============================================================================
-- Son de Nudos - Seed Data
-- ==============================================================================
-- Description: Datos iniciales para desarrollo y testing
-- Date: 2025-11-16
-- ==============================================================================

-- ==============================================================================
-- CUPONES INICIALES
-- ==============================================================================
-- Migrar cupones actuales desde src/store/cart.ts

INSERT INTO coupons (code, percent, min_amount, max_uses, valid_from, valid_until, active)
VALUES
  -- Cupón de bienvenida (10% sin mínimo)
  ('WELCOME10', 0.10, NULL, NULL, NOW(), NULL, true),

  -- Cupón especial Priscilla (15% sin mínimo)
  ('PRISCILLA15', 0.15, NULL, NULL, NOW(), NULL, true),

  -- Cupón de verano (20% con mínimo $50)
  ('VERANO20', 0.20, 50.00, NULL, NOW(), '2026-09-30'::timestamp, true),

  -- Cupón navideño (25% con mínimo $100)
  ('NAVIDAD25', 0.25, 100.00, NULL, NOW(), '2025-12-31'::timestamp, true)
ON CONFLICT (code) DO NOTHING;

-- ==============================================================================
-- ADMIN INICIAL
-- ==============================================================================
-- ⚠️ IMPORTANTE: NO crear admins con seed.sql
--
-- Los usuarios admin deben sincronizarse con Supabase Auth para que las
-- políticas RLS funcionen correctamente (auth.uid() debe coincidir con admins.id)
--
-- Para crear usuarios admin, usar el script TypeScript:
--
--   npm run create:admin -- --email owner@example.com --name "Store Owner" --role superadmin
--
-- Este script:
-- 1. Crea el usuario en Supabase Auth (o usa existente)
-- 2. Obtiene el ID de Auth
-- 3. Crea registro en tabla admins con el MISMO ID
-- 4. Garantiza que las políticas RLS funcionen correctamente
--
-- Para más detalles, ver: scripts/create-admin.ts
-- ==============================================================================

-- No incluir emails, hashes ni contraseñas de administradores en seeds.

-- ==============================================================================
-- NOTA: Los productos se migrarán desde products.json usando el script
-- TypeScript migrate-to-supabase.ts para mantener la integridad de datos
-- ==============================================================================
