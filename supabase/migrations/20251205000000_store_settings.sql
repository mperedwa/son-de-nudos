-- ============================================================================
-- STORE SETTINGS - Configuración general de la tienda
-- ============================================================================
-- Esta tabla almacena configuraciones editables desde el panel de admin:
-- - SEO (meta tags, Open Graph)
-- - Redes sociales
-- - Info de la tienda
-- - Mensajes del banner
-- - Analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ========================================
  -- SEO
  -- ========================================
  meta_title TEXT DEFAULT 'Son de Nudos by Priscilla - Artesanías Exclusivas',
  meta_description TEXT DEFAULT 'Collares artesanales hechos a mano con amor y dedicación. Cada pieza es única.',
  meta_keywords TEXT[] DEFAULT ARRAY['macramé', 'collares artesanales', 'joyería hecha a mano', 'accesorios únicos'],
  og_image TEXT, -- URL de imagen para compartir en redes

  -- ========================================
  -- REDES SOCIALES
  -- ========================================
  instagram_url TEXT DEFAULT 'https://www.instagram.com/son_de_nudos/',
  facebook_url TEXT DEFAULT 'https://www.facebook.com/share/1CwiWSxH5L/?mibextid=wwXIfr',
  pinterest_url TEXT DEFAULT 'https://pinterest.com/sondenudos',
  tiktok_url TEXT,
  whatsapp_number TEXT, -- Formato internacional: +1234567890
  contact_email TEXT DEFAULT 'hello@sondenudos.com',

  -- ========================================
  -- INFO DE LA TIENDA
  -- ========================================
  store_name TEXT DEFAULT 'Son de Nudos',
  store_description TEXT DEFAULT 'Artesanías exclusivas hechas a mano por Priscilla',
  notification_email TEXT, -- Email donde llegan alertas de pedidos
  contact_phone TEXT,

  -- ========================================
  -- MENSAJES DEL BANNER (AnnouncementBar)
  -- ========================================
  -- JSONB array con estructura:
  -- [{"text_es": "...", "text_en": "...", "active": true}, ...]
  announcement_messages JSONB DEFAULT '[
    {"text_es": "✨ ENVÍO GRATIS en compras +$150", "text_en": "✨ FREE SHIPPING on orders +$150", "active": true},
    {"text_es": "🎁 Usa código WELCOME10 para 10% de descuento", "text_en": "🎁 Use code WELCOME10 for 10% off", "active": true},
    {"text_es": "🌿 100% Hecho a mano con amor", "text_en": "🌿 100% Handmade with love", "active": true},
    {"text_es": "📦 Envíos a USA, Canadá y México", "text_en": "📦 Shipping to USA, Canada and Mexico", "active": true}
  ]'::JSONB,

  -- ========================================
  -- ANALYTICS
  -- ========================================
  google_analytics_id TEXT, -- Ej: G-XXXXXXXXXX

  -- ========================================
  -- METADATA
  -- ========================================
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TRIGGER para updated_at automático
-- ============================================================================
CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON store_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Lectura pública (para que el frontend cargue la config)
CREATE POLICY "store_settings_public_read"
  ON store_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Solo admins autenticados pueden modificar
CREATE POLICY "store_settings_admin_write"
  ON store_settings
  FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- SEED: Insertar configuración inicial
-- ============================================================================
INSERT INTO store_settings (
  meta_title,
  meta_description,
  store_name,
  contact_email
) VALUES (
  'Son de Nudos by Priscilla - Artesanías Exclusivas',
  'Collares y accesorios de macramé hechos a mano con amor. Cada pieza es única y especial.',
  'Son de Nudos',
  'hello@sondenudos.com'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMENTARIOS
-- ============================================================================
COMMENT ON TABLE store_settings IS 'Configuración general de la tienda editable desde /admin/settings';
COMMENT ON COLUMN store_settings.announcement_messages IS 'Array JSONB con mensajes del banner. Estructura: [{text_es, text_en, active}]';
COMMENT ON COLUMN store_settings.whatsapp_number IS 'Número de WhatsApp en formato internacional (+1234567890)';
