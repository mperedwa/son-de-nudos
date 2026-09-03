import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const anonKey = process.env.VITE_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  throw new Error('Missing VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, or SUPABASE_SERVICE_ROLE_KEY')
}

if (!supabaseUrl.includes('icqbyybjhdaxvobfcnia')) {
  throw new Error('Refusing to run: VITE_SUPABASE_URL does not target the approved project')
}

const runId = randomUUID()
const shortId = runId.slice(0, 8)
const password = `Rls!${randomUUID()}aA1`
const adminEmail = `rls-admin-${shortId}@example.com`
const userEmail = `rls-user-${shortId}@example.com`
const publicProductId = randomUUID()
const draftProductId = randomUUID()
const adminProductId = randomUUID()
const publicVariantId = randomUUID()
const draftVariantId = randomUUID()
const couponId = randomUUID()
const orderId = randomUUID()
const storagePath = `rls-tests/${runId}.txt`

const clientOptions = {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
}

const service = createClient(supabaseUrl, serviceRoleKey, clientOptions)
const anonymous = createClient(supabaseUrl, anonKey, clientOptions)
let adminUserId: string | undefined
let regularUserId: string | undefined
let unexpectedSignupUserId: string | undefined
let passed = 0

function pass(message: string) {
  passed += 1
  console.log(`ok ${passed} - ${message}`)
}

async function expectDenied(
  message: string,
  operation: () => PromiseLike<{ error: { message: string } | null }>
) {
  const { error } = await operation()
  assert.ok(error, `${message}: operation unexpectedly succeeded`)
  pass(message)
}

async function signIn(email: string): Promise<SupabaseClient> {
  const client = createClient(supabaseUrl, anonKey, clientOptions)
  const { error } = await client.auth.signInWithPassword({ email, password })
  assert.ifError(error)
  return client
}

async function createTestUsers() {
  const adminResult = await service.auth.admin.createUser({
    email: adminEmail,
    password,
    email_confirm: true,
  })
  assert.ifError(adminResult.error)
  assert.ok(adminResult.data.user)
  adminUserId = adminResult.data.user.id

  const userResult = await service.auth.admin.createUser({
    email: userEmail,
    password,
    email_confirm: true,
  })
  assert.ifError(userResult.error)
  assert.ok(userResult.data.user)
  regularUserId = userResult.data.user.id
}

async function seedFixtures() {
  assert.ok(adminUserId)

  const { error: productsError } = await service.from('products').insert([
    {
      id: publicProductId,
      handle: `rls-public-${shortId}`,
      title: 'RLS public product',
      price: 25,
      available_for_sale: true,
    },
    {
      id: draftProductId,
      handle: `rls-draft-${shortId}`,
      title: 'RLS draft product',
      price: 30,
      available_for_sale: false,
    },
  ])
  assert.ifError(productsError)

  const { error: variantsError } = await service.from('variants').insert([
    {
      id: publicVariantId,
      product_id: publicProductId,
      title: 'RLS public variant',
      sku: `RLS-PUBLIC-${shortId}`,
      price: 25,
      stock: 1,
      fulfillment_mode: 'ready_to_ship',
      preparation_days_min: 0,
      preparation_days_max: 0,
    },
    {
      id: draftVariantId,
      product_id: draftProductId,
      title: 'RLS draft variant',
      sku: `RLS-DRAFT-${shortId}`,
      price: 30,
      stock: 1,
      fulfillment_mode: 'ready_to_ship',
      preparation_days_min: 0,
      preparation_days_max: 0,
    },
  ])
  assert.ifError(variantsError)

  const { error: couponError } = await service.from('coupons').insert({
    id: couponId,
    code: `RLS${shortId}`,
    percent: 0.1,
    active: true,
  })
  assert.ifError(couponError)

  const { error: orderError } = await service.from('orders').insert({
    id: orderId,
    stripe_session_id: `cs_rls_${runId}`,
    customer_email: 'rls-customer@example.com',
    items: [],
    subtotal: 25,
    shipping: 0,
    total: 25,
    status: 'paid',
  })
  assert.ifError(orderError)

  const { error: adminError } = await service.from('admins').insert({
    id: adminUserId,
    email: adminEmail,
    name: 'RLS Admin',
    role: 'admin',
    active: true,
  })
  assert.ifError(adminError)
}

async function testAnonymousAccess() {
  const signupResult = await anonymous.auth.signUp({
    email: `rls-signup-${shortId}@example.com`,
    password,
  })
  unexpectedSignupUserId = signupResult.data.user?.id
  assert.ok(signupResult.error, 'public signup unexpectedly succeeded')
  pass('public email signup is disabled')

  const { data: products, error: productsError } = await anonymous
    .from('products')
    .select('id')
    .in('id', [publicProductId, draftProductId])
  assert.ifError(productsError)
  assert.deepEqual(products?.map(({ id }) => id), [publicProductId])
  pass('anonymous visitors only see published products')

  const { data: variants, error: variantsError } = await anonymous
    .from('variants')
    .select('id')
    .in('id', [publicVariantId, draftVariantId])
  assert.ifError(variantsError)
  assert.deepEqual(variants?.map(({ id }) => id), [publicVariantId])
  pass('anonymous visitors only see variants of published products')

  await expectDenied('anonymous visitors cannot enumerate coupons', () =>
    anonymous.from('coupons').select('code').eq('id', couponId)
  )
  await expectDenied('anonymous visitors cannot create products', () =>
    anonymous.from('products').insert({ handle: `anon-${shortId}`, title: 'No', price: 1 })
  )

  const { data: shipping, error: shippingError } = await anonymous
    .from('shipping_config')
    .select('id')
    .limit(1)
  assert.ifError(shippingError)
  assert.equal(shipping?.length, 1)
  pass('anonymous visitors can read shipping configuration')
}

async function testRegularUserAccess(client: SupabaseClient) {
  const { data: products, error: productsError } = await client
    .from('products')
    .select('id')
    .in('id', [publicProductId, draftProductId])
  assert.ifError(productsError)
  assert.deepEqual(products?.map(({ id }) => id), [publicProductId])
  pass('authenticated non-admins only see published products')

  await expectDenied('authenticated non-admins cannot create products', () =>
    client.from('products').insert({ handle: `user-${shortId}`, title: 'No', price: 1 })
  )

  const { error: stockError } = await client.rpc('admin_set_variant_stock', {
    target_variant_id: publicVariantId,
    target_stock: 2,
    change_reason: 'adjustment',
  })
  assert.ok(stockError)
  pass('authenticated non-admins cannot use the stock mutation function')

  const { data: orders, error: ordersError } = await client
    .from('orders')
    .select('id')
    .eq('id', orderId)
  assert.ifError(ordersError)
  assert.deepEqual(orders, [])
  pass('authenticated non-admins cannot read orders')

  const { data: admins, error: adminsError } = await client
    .from('admins')
    .select('id')
    .eq('id', adminUserId)
  assert.ifError(adminsError)
  assert.deepEqual(admins, [])
  pass('authenticated non-admins cannot read administrator records')

  await expectDenied('authenticated non-admins cannot upload product images', () =>
    client.storage.from('product-images').upload(storagePath, new Uint8Array([1, 2, 3]), {
      contentType: 'image/png',
    })
  )
}

async function testAdminAccess(client: SupabaseClient) {
  const { data: products, error: productsError } = await client
    .from('products')
    .select('id')
    .in('id', [publicProductId, draftProductId])
  assert.ifError(productsError)
  assert.equal(products?.length, 2)
  pass('active administrators see published and draft products')

  const { error: insertError } = await client.from('products').insert({
    id: adminProductId,
    handle: `admin-${shortId}`,
    title: 'Allowed',
    price: 40,
  })
  assert.ifError(insertError)
  pass('active administrators can create products')

  const { data: orders, error: ordersError } = await client
    .from('orders')
    .select('id')
    .eq('id', orderId)
  assert.ifError(ordersError)
  assert.deepEqual(orders?.map(({ id }) => id), [orderId])
  pass('active administrators can read orders')

  const { error: stockError } = await client.rpc('admin_set_variant_stock', {
    target_variant_id: publicVariantId,
    target_stock: 3,
    change_reason: 'restock',
  })
  assert.ifError(stockError)
  pass('active administrators can update stock atomically')

  const { data: history, error: historyError } = await client
    .from('stock_history')
    .select('reason')
    .eq('variant_id', publicVariantId)
  assert.ifError(historyError)
  assert.deepEqual(history, [{ reason: 'restock' }])
  pass('atomic stock updates record one trustworthy history row')

  await expectDenied('administrators cannot promote themselves from the browser', () =>
    client.from('admins').update({ role: 'superadmin' }).eq('id', adminUserId)
  )

  const { error: lastLoginError } = await client
    .from('admins')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', adminUserId)
  assert.ifError(lastLoginError)
  pass('administrators can update only their own last-login timestamp')

  const { error: uploadError } = await client.storage
    .from('product-images')
    .upload(storagePath, new Uint8Array([137, 80, 78, 71]), { contentType: 'image/png' })
  assert.ifError(uploadError)
  pass('active administrators can upload product images')

  const { error: downloadError } = await anonymous.storage
    .from('product-images')
    .download(storagePath)
  assert.ifError(downloadError)
  pass('anonymous visitors can read public product images')

  const { error: deleteError } = await client.storage.from('product-images').remove([storagePath])
  assert.ifError(deleteError)
  pass('active administrators can delete product images')
}

async function cleanup() {
  const cleanupResults = await Promise.all([
    service.storage.from('product-images').remove([storagePath]),
    service.from('products').delete().in('id', [publicProductId, draftProductId, adminProductId]),
    service.from('coupons').delete().eq('id', couponId),
    service.from('orders').delete().eq('id', orderId),
    adminUserId ? service.from('admins').delete().eq('id', adminUserId) : Promise.resolve({ error: null }),
  ])

  for (const result of cleanupResults) assert.ifError(result.error)

  if (adminUserId) assert.ifError((await service.auth.admin.deleteUser(adminUserId)).error)
  if (regularUserId) assert.ifError((await service.auth.admin.deleteUser(regularUserId)).error)
  if (unexpectedSignupUserId) {
    assert.ifError((await service.auth.admin.deleteUser(unexpectedSignupUserId)).error)
  }
}

async function main() {
  console.log('TAP version 13')
  try {
    await createTestUsers()
    await seedFixtures()
    await testAnonymousAccess()
    const regularUser = await signIn(userEmail)
    const admin = await signIn(adminEmail)
    await testRegularUserAccess(regularUser)
    await testAdminAccess(admin)
    assert.equal(passed, 22)
    console.log(`1..${passed}`)
  } finally {
    await cleanup()
  }
}

main().catch((error: unknown) => {
  console.error('Remote RLS test failed:', error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
