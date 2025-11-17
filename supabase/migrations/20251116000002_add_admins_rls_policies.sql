-- ==============================================================================
-- Add RLS policies for admins table
-- ==============================================================================
-- Permite a usuarios autenticados leer su propio registro de admin

-- Política: Los admins pueden ver su propio registro
CREATE POLICY "Admins can view their own record"
  ON admins FOR SELECT
  USING (auth.uid() = id);

-- Política: Los admins pueden actualizar su propio registro (para last_login_at)
CREATE POLICY "Admins can update their own record"
  ON admins FOR UPDATE
  USING (auth.uid() = id);

COMMENT ON POLICY "Admins can view their own record" ON admins IS
  'Permite a usuarios autenticados leer su propio registro en la tabla admins';

COMMENT ON POLICY "Admins can update their own record" ON admins IS
  'Permite a admins actualizar su propio registro (ej: last_login_at)';
