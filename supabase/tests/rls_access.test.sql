BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;

SELECT plan(19);

INSERT INTO public.products (id, handle, title, price, available_for_sale)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'public-product', 'Public product', 25, TRUE),
  ('10000000-0000-0000-0000-000000000002', 'draft-product', 'Draft product', 30, FALSE);

INSERT INTO public.variants (
  id, product_id, title, sku, price, available, stock,
  fulfillment_mode, preparation_days_min, preparation_days_max
)
VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Public variant', 'TEST-PUBLIC', 25, TRUE, 1,
    'ready_to_ship', 0, 0
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    'Draft variant', 'TEST-DRAFT', 30, TRUE, 1,
    'ready_to_ship', 0, 0
  );

INSERT INTO public.coupons (code, percent, active)
VALUES ('TEST10', 0.10, TRUE);

INSERT INTO public.orders (
  stripe_session_id, customer_email, items, subtotal, shipping, total, status
)
VALUES ('cs_test_rls', 'customer@example.com', '[]'::JSONB, 25, 0, 25, 'paid');

INSERT INTO public.admins (id, email, name, role, active)
VALUES ('30000000-0000-0000-0000-000000000001', 'admin@example.com', 'Admin', 'admin', TRUE);

SET LOCAL ROLE anon;

SELECT results_eq(
  $$ SELECT handle FROM public.products ORDER BY handle $$,
  ARRAY['public-product']::TEXT[],
  'anonymous visitors only see published products'
);

SELECT results_eq(
  $$ SELECT sku FROM public.variants ORDER BY sku $$,
  ARRAY['TEST-PUBLIC']::TEXT[],
  'anonymous visitors only see variants of published products'
);

SELECT throws_ok(
  $$ SELECT code FROM public.coupons $$,
  '42501',
  'permission denied for table coupons',
  'anonymous visitors cannot enumerate coupons'
);

SELECT throws_ok(
  $$ INSERT INTO public.products (handle, title, price) VALUES ('anon-write', 'No', 1) $$,
  '42501',
  'permission denied for table products',
  'anonymous visitors cannot create products'
);

SELECT results_eq(
  $$ SELECT count(*) FROM public.shipping_config $$,
  ARRAY[1::BIGINT],
  'anonymous visitors can read shipping configuration'
);

RESET ROLE;
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '30000000-0000-0000-0000-000000000099';

SELECT is(
  (SELECT private.is_admin()),
  FALSE,
  'an authenticated non-admin is not an administrator'
);

SELECT results_eq(
  $$ SELECT handle FROM public.products ORDER BY handle $$,
  ARRAY['public-product']::TEXT[],
  'authenticated non-admins only see published products'
);

SELECT throws_ok(
  $$ INSERT INTO public.products (handle, title, price) VALUES ('non-admin-write', 'No', 1) $$,
  '42501',
  'new row violates row-level security policy for table "products"',
  'authenticated non-admins cannot create products'
);

SELECT throws_ok(
  $$ SELECT public.admin_set_variant_stock(
    '20000000-0000-0000-0000-000000000001'::UUID,
    2,
    'adjustment'
  ) $$,
  '42501',
  'administrator access required',
  'authenticated non-admins cannot use the stock mutation function'
);

SELECT results_eq(
  $$ SELECT count(*) FROM public.orders $$,
  ARRAY[0::BIGINT],
  'authenticated non-admins cannot read orders'
);

SELECT results_eq(
  $$ SELECT count(*) FROM public.admins $$,
  ARRAY[0::BIGINT],
  'authenticated non-admins cannot read administrator records'
);

RESET ROLE;
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '30000000-0000-0000-0000-000000000001';

SELECT is(
  (SELECT private.is_admin()),
  TRUE,
  'an active administrator is recognized'
);

SELECT results_eq(
  $$ SELECT count(*) FROM public.products $$,
  ARRAY[2::BIGINT],
  'administrators can read published and draft products'
);

SELECT lives_ok(
  $$ INSERT INTO public.products (handle, title, price) VALUES ('admin-write', 'Allowed', 40) $$,
  'administrators can create products'
);

SELECT results_eq(
  $$ SELECT count(*) FROM public.orders $$,
  ARRAY[1::BIGINT],
  'administrators can read orders'
);

SELECT lives_ok(
  $$ SELECT public.admin_set_variant_stock(
    '20000000-0000-0000-0000-000000000001'::UUID,
    3,
    'restock'
  ) $$,
  'administrators can update stock atomically'
);

SELECT results_eq(
  $$ SELECT reason FROM public.stock_history
     WHERE variant_id = '20000000-0000-0000-0000-000000000001'::UUID $$,
  ARRAY['restock']::TEXT[],
  'atomic stock updates record the requested reason once'
);

SELECT throws_ok(
  $$ UPDATE public.admins SET role = 'superadmin'
     WHERE id = '30000000-0000-0000-0000-000000000001'::UUID $$,
  '42501',
  'permission denied for table admins',
  'administrators cannot promote themselves from the browser'
);

SELECT lives_ok(
  $$ UPDATE public.admins SET last_login_at = NOW()
     WHERE id = '30000000-0000-0000-0000-000000000001'::UUID $$,
  'administrators can update only their own last-login timestamp'
);

SELECT * FROM finish();
ROLLBACK;
