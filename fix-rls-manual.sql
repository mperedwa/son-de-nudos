-- ==============================================================================
-- FIX: Aplicar políticas RLS para tabla admins
-- ==============================================================================
-- Ejecuta este archivo en Supabase Dashboard → SQL Editor
-- https://supabase.com/dashboard/project/mxpmbzdenlelrlcwmjmg/sql/new

-- 1. Verificar que RLS está habilitado
SELECT
  relname AS table_name,
  relrowsecurity AS rls_enabled
FROM pg_class
WHERE relname = 'admins' AND relkind = 'r';

-- 2. Listar políticas actuales (si existen)
SELECT
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'admins';

-- 3. Eliminar políticas existentes (si existen)
DROP POLICY IF EXISTS "Admins can view their own record" ON admins;
DROP POLICY IF EXISTS "Admins can update their own record" ON admins;

-- 4. Crear política SELECT
CREATE POLICY "Admins can view their own record"
  ON admins FOR SELECT
  USING (auth.uid() = id);

-- 5. Crear política UPDATE
CREATE POLICY "Admins can update their own record"
  ON admins FOR UPDATE
  USING (auth.uid() = id);

-- 6. Agregar comentarios
COMMENT ON POLICY "Admins can view their own record" ON admins IS
  'Permite a usuarios autenticados leer su propio registro en la tabla admins';

COMMENT ON POLICY "Admins can update their own record" ON admins IS
  'Permite a admins actualizar su propio registro (ej: last_login_at)';

-- 7. Verificar que se crearon correctamente
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'admins'
ORDER BY policyname;

-- ==============================================================================
-- RESULTADO ESPERADO:
-- ==============================================================================
-- Deberías ver 2 políticas:
--   1. "Admins can view their own record" (SELECT)
--   2. "Admins can update their own record" (UPDATE)
--
-- Ambas con qual = '(auth.uid() = id)'
-- ==============================================================================
