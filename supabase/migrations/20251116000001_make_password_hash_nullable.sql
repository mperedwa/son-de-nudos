-- ==============================================================================
-- Make password_hash nullable in admins table
-- ==============================================================================
-- Cuando usamos Supabase Auth, no necesitamos guardar password_hash en nuestra
-- tabla porque Supabase lo maneja internamente en auth.users.
-- Este campo se hace nullable para compatibilidad.

ALTER TABLE admins ALTER COLUMN password_hash DROP NOT NULL;

COMMENT ON COLUMN admins.password_hash IS 'Campo legacy, nullable porque Supabase Auth maneja las contraseñas internamente';
