-- =============================================================================
-- Son de Nudos - Secure authorization and fulfillment model
-- =============================================================================
-- Replaces policies that treated every authenticated user as an administrator.
-- Grants and policies are both explicit because RLS does not revoke privileges.

-- -----------------------------------------------------------------------------
-- Fulfillment model and legacy credential cleanup
-- -----------------------------------------------------------------------------

ALTER TABLE public.variants
  ADD COLUMN fulfillment_mode TEXT NOT NULL DEFAULT 'ready_to_ship',
  ADD COLUMN preparation_days_min INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN preparation_days_max INTEGER NOT NULL DEFAULT 0,
  ADD CONSTRAINT variants_fulfillment_mode_valid
    CHECK (fulfillment_mode IN ('ready_to_ship', 'made_to_order')),
  ADD CONSTRAINT variants_preparation_days_valid
    CHECK (
      preparation_days_min >= 0
      AND preparation_days_max >= preparation_days_min
      AND (
        fulfillment_mode = 'ready_to_ship'
        OR (preparation_days_min >= 1 AND preparation_days_max >= 1)
      )
    );

COMMENT ON COLUMN public.variants.fulfillment_mode IS
  'ready_to_ship for stocked pieces; made_to_order for explicitly enabled production after purchase';
COMMENT ON COLUMN public.variants.preparation_days_min IS
  'Minimum business days before dispatch; made-to-order default is configured by the admin';
COMMENT ON COLUMN public.variants.preparation_days_max IS
  'Maximum business days before dispatch; must be greater than or equal to the minimum';

ALTER TABLE public.admins DROP COLUMN IF EXISTS password_hash;

-- -----------------------------------------------------------------------------
-- Private authorization helper
-- -----------------------------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admins
    WHERE id = (SELECT auth.uid())
      AND active = TRUE
  );
$$;

REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

-- -----------------------------------------------------------------------------
-- Remove permissive legacy policies
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Only admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Only admins can update products" ON public.products;
DROP POLICY IF EXISTS "Only admins can delete products" ON public.products;

DROP POLICY IF EXISTS "Variants are viewable by everyone" ON public.variants;
DROP POLICY IF EXISTS "Only admins can insert variants" ON public.variants;
DROP POLICY IF EXISTS "Only admins can update variants" ON public.variants;
DROP POLICY IF EXISTS "Only admins can delete variants" ON public.variants;

DROP POLICY IF EXISTS "Coupons can be validated by everyone" ON public.coupons;
DROP POLICY IF EXISTS "Only admins can insert coupons" ON public.coupons;
DROP POLICY IF EXISTS "Only admins can update coupons" ON public.coupons;
DROP POLICY IF EXISTS "Only admins can delete coupons" ON public.coupons;

DROP POLICY IF EXISTS "Only admins can view orders" ON public.orders;
DROP POLICY IF EXISTS "Only admins can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Only admins can update orders" ON public.orders;

DROP POLICY IF EXISTS "Admins can view their own record" ON public.admins;
DROP POLICY IF EXISTS "Admins can update their own record" ON public.admins;

DROP POLICY IF EXISTS "Shipping config is viewable by everyone" ON public.shipping_config;
DROP POLICY IF EXISTS "Only admins can update shipping config" ON public.shipping_config;

DROP POLICY IF EXISTS "Only admins can view stock history" ON public.stock_history;

DROP POLICY IF EXISTS "store_settings_public_read" ON public.store_settings;
DROP POLICY IF EXISTS "store_settings_admin_write" ON public.store_settings;

DROP POLICY IF EXISTS "Collections are viewable by everyone" ON public.collections;
DROP POLICY IF EXISTS "Only authenticated users can insert collections" ON public.collections;
DROP POLICY IF EXISTS "Only authenticated users can update collections" ON public.collections;
DROP POLICY IF EXISTS "Only authenticated users can delete collections" ON public.collections;

DROP POLICY IF EXISTS "Public read access on product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

DROP POLICY IF EXISTS "Public read branding" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload branding" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update branding" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete branding" ON storage.objects;

-- -----------------------------------------------------------------------------
-- Least-privilege table grants
-- -----------------------------------------------------------------------------

REVOKE ALL ON TABLE
  public.products,
  public.variants,
  public.coupons,
  public.orders,
  public.admins,
  public.shipping_config,
  public.stock_history,
  public.store_settings,
  public.collections
FROM anon, authenticated;

GRANT SELECT ON public.products, public.variants, public.shipping_config, public.collections
  TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON public.products, public.variants, public.coupons, public.collections
  TO authenticated;
GRANT SELECT ON public.coupons, public.orders, public.admins, public.stock_history, public.store_settings
  TO authenticated;
GRANT UPDATE ON public.orders, public.shipping_config, public.store_settings
  TO authenticated;
GRANT UPDATE (last_login_at) ON public.admins TO authenticated;

GRANT SELECT (
  id,
  meta_title,
  meta_description,
  meta_title_es,
  meta_title_en,
  meta_description_es,
  meta_description_en,
  meta_keywords,
  og_image,
  instagram_url,
  facebook_url,
  pinterest_url,
  tiktok_url,
  whatsapp_number,
  contact_email,
  store_name,
  store_description,
  announcement_messages,
  google_analytics_id,
  logo_url,
  favicon_url,
  return_policy_es,
  return_policy_en,
  robots_txt,
  sitemap_enabled,
  schema_enabled,
  canonical_base_url,
  created_at,
  updated_at
) ON public.store_settings TO anon;

-- -----------------------------------------------------------------------------
-- Public catalog policies
-- -----------------------------------------------------------------------------

CREATE POLICY products_public_read
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (available_for_sale = TRUE);

CREATE POLICY products_admin_read
  ON public.products FOR SELECT
  TO authenticated
  USING ((SELECT private.is_admin()));

CREATE POLICY products_admin_insert
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY products_admin_update
  ON public.products FOR UPDATE
  TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY products_admin_delete
  ON public.products FOR DELETE
  TO authenticated
  USING ((SELECT private.is_admin()));

CREATE POLICY variants_public_read
  ON public.variants FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.products
      WHERE products.id = variants.product_id
        AND products.available_for_sale = TRUE
    )
  );

CREATE POLICY variants_admin_read
  ON public.variants FOR SELECT
  TO authenticated
  USING ((SELECT private.is_admin()));

CREATE POLICY variants_admin_insert
  ON public.variants FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY variants_admin_update
  ON public.variants FOR UPDATE
  TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY variants_admin_delete
  ON public.variants FOR DELETE
  TO authenticated
  USING ((SELECT private.is_admin()));

CREATE POLICY collections_public_read
  ON public.collections FOR SELECT
  TO anon, authenticated
  USING (visible = TRUE);

CREATE POLICY collections_admin_read
  ON public.collections FOR SELECT
  TO authenticated
  USING ((SELECT private.is_admin()));

CREATE POLICY collections_admin_insert
  ON public.collections FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY collections_admin_update
  ON public.collections FOR UPDATE
  TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY collections_admin_delete
  ON public.collections FOR DELETE
  TO authenticated
  USING ((SELECT private.is_admin()));

-- -----------------------------------------------------------------------------
-- Administrative data policies
-- -----------------------------------------------------------------------------

CREATE POLICY coupons_admin_read
  ON public.coupons FOR SELECT
  TO authenticated
  USING ((SELECT private.is_admin()));

CREATE POLICY coupons_admin_insert
  ON public.coupons FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY coupons_admin_update
  ON public.coupons FOR UPDATE
  TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY coupons_admin_delete
  ON public.coupons FOR DELETE
  TO authenticated
  USING ((SELECT private.is_admin()));

CREATE POLICY orders_admin_read
  ON public.orders FOR SELECT
  TO authenticated
  USING ((SELECT private.is_admin()));

CREATE POLICY orders_admin_update
  ON public.orders FOR UPDATE
  TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY admins_read_own_active_record
  ON public.admins FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id AND active = TRUE);

CREATE POLICY admins_update_own_last_login
  ON public.admins FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id AND active = TRUE)
  WITH CHECK ((SELECT auth.uid()) = id AND active = TRUE);

CREATE POLICY shipping_config_public_read
  ON public.shipping_config FOR SELECT
  TO anon, authenticated
  USING (TRUE);

CREATE POLICY shipping_config_admin_update
  ON public.shipping_config FOR UPDATE
  TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY stock_history_admin_read
  ON public.stock_history FOR SELECT
  TO authenticated
  USING ((SELECT private.is_admin()));

CREATE POLICY store_settings_public_read
  ON public.store_settings FOR SELECT
  TO anon
  USING (TRUE);

CREATE POLICY store_settings_admin_read
  ON public.store_settings FOR SELECT
  TO authenticated
  USING ((SELECT private.is_admin()));

CREATE POLICY store_settings_admin_update
  ON public.store_settings FOR UPDATE
  TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

-- -----------------------------------------------------------------------------
-- Storage policies
-- -----------------------------------------------------------------------------

CREATE POLICY product_images_public_read
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY product_images_admin_insert
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND (SELECT private.is_admin()));

CREATE POLICY product_images_admin_update
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images' AND (SELECT private.is_admin()))
  WITH CHECK (bucket_id = 'product-images' AND (SELECT private.is_admin()));

CREATE POLICY product_images_admin_delete
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND (SELECT private.is_admin()));

CREATE POLICY branding_public_read
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'branding');

CREATE POLICY branding_admin_insert
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'branding' AND (SELECT private.is_admin()));

CREATE POLICY branding_admin_update
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'branding' AND (SELECT private.is_admin()))
  WITH CHECK (bucket_id = 'branding' AND (SELECT private.is_admin()));

CREATE POLICY branding_admin_delete
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'branding' AND (SELECT private.is_admin()));

-- -----------------------------------------------------------------------------
-- Atomic stock updates and trustworthy history
-- -----------------------------------------------------------------------------

DROP TRIGGER IF EXISTS log_variant_stock_changes ON public.variants;
DROP FUNCTION IF EXISTS public.log_stock_change();

CREATE OR REPLACE FUNCTION private.log_stock_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  requested_reason TEXT;
BEGIN
  IF NEW.stock IS DISTINCT FROM OLD.stock THEN
    requested_reason := current_setting('son_de_nudos.stock_change_reason', TRUE);

    IF requested_reason IS NULL
       OR requested_reason NOT IN ('restock', 'sale', 'adjustment', 'return', 'damage') THEN
      requested_reason := CASE
        WHEN NEW.stock > OLD.stock THEN 'restock'
        ELSE 'adjustment'
      END;
    END IF;

    INSERT INTO public.stock_history (
      variant_id,
      change,
      reason,
      previous_stock,
      new_stock,
      admin_id
    ) VALUES (
      NEW.id,
      NEW.stock - OLD.stock,
      requested_reason,
      OLD.stock,
      NEW.stock,
      (SELECT auth.uid())
    );
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.log_stock_change() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER log_variant_stock_changes
  AFTER UPDATE OF stock ON public.variants
  FOR EACH ROW
  EXECUTE FUNCTION private.log_stock_change();

CREATE OR REPLACE FUNCTION public.admin_set_variant_stock(
  target_variant_id UUID,
  target_stock INTEGER,
  change_reason TEXT
)
RETURNS public.variants
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  updated_variant public.variants;
BEGIN
  IF NOT (SELECT private.is_admin()) THEN
    RAISE EXCEPTION 'administrator access required' USING ERRCODE = '42501';
  END IF;

  IF target_stock < 0 THEN
    RAISE EXCEPTION 'stock cannot be negative' USING ERRCODE = '22023';
  END IF;

  IF change_reason NOT IN ('restock', 'sale', 'adjustment', 'return', 'damage') THEN
    RAISE EXCEPTION 'invalid stock change reason' USING ERRCODE = '22023';
  END IF;

  PERFORM set_config('son_de_nudos.stock_change_reason', change_reason, TRUE);

  UPDATE public.variants
  SET stock = target_stock
  WHERE id = target_variant_id
  RETURNING * INTO updated_variant;

  IF updated_variant.id IS NULL THEN
    RAISE EXCEPTION 'variant not found' USING ERRCODE = 'P0002';
  END IF;

  RETURN updated_variant;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_variant_stock(UUID, INTEGER, TEXT)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_variant_stock(UUID, INTEGER, TEXT)
  TO authenticated;

-- -----------------------------------------------------------------------------
-- Correct public launch defaults
-- -----------------------------------------------------------------------------

UPDATE public.store_settings
SET announcement_messages = '[
  {"text_es": "✨ ENTREGA LOCAL GRATIS en el área aprobada", "text_en": "✨ FREE LOCAL DELIVERY in eligible areas", "active": true},
  {"text_es": "🌿 Hecho a mano con amor", "text_en": "🌿 Handmade with love", "active": true},
  {"text_es": "📦 Envíos a los Estados Unidos contiguos", "text_en": "📦 Shipping within the contiguous United States", "active": true}
]'::JSONB
WHERE id IS NOT NULL;

ALTER TABLE public.store_settings
  ALTER COLUMN announcement_messages SET DEFAULT '[
    {"text_es": "✨ ENTREGA LOCAL GRATIS en el área aprobada", "text_en": "✨ FREE LOCAL DELIVERY in eligible areas", "active": true},
    {"text_es": "🌿 Hecho a mano con amor", "text_en": "🌿 Handmade with love", "active": true},
    {"text_es": "📦 Envíos a los Estados Unidos contiguos", "text_en": "📦 Shipping within the contiguous United States", "active": true}
  ]'::JSONB;

-- Enable realtime only for the two tables consumed by admin subscriptions.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public'
         AND tablename = 'variants'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.variants;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public'
         AND tablename = 'orders'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END;
$$;
