#!/usr/bin/env tsx

import { Client } from 'pg'

const connectionString = process.env.SUPABASE_DB_URL

if (!connectionString) {
  console.error('❌ Falta SUPABASE_DB_URL en el entorno local')
  console.error('   Usa una URL de conexión obtenida desde Supabase y no la guardes en Git')
  process.exit(1)
}

async function applyRLSPolicies() {
  const client = new Client({ connectionString })

  try {
    console.log('🔌 Conectando a PostgreSQL...\n')
    await client.connect()
    console.log('✓ Conectado exitosamente\n')

    // 1. Check if policies already exist
    console.log('1️⃣  Verificando políticas existentes...')
    const checkPolicies = await client.query(`
      SELECT policyname
      FROM pg_policies
      WHERE tablename = 'admins'
    `)

    if (checkPolicies.rows.length > 0) {
      console.log('   📋 Políticas existentes:')
      checkPolicies.rows.forEach((row) => console.log(`      - ${row.policyname}`))
      console.log('\n   🗑️  Eliminando políticas existentes...')

      await client.query(`DROP POLICY IF EXISTS "Admins can view their own record" ON admins`)
      await client.query(`DROP POLICY IF EXISTS "Admins can update their own record" ON admins`)

      console.log('   ✓ Políticas eliminadas')
    } else {
      console.log('   ℹ️  No hay políticas existentes')
    }

    // 2. Create SELECT policy
    console.log('\n2️⃣  Creando política SELECT...')
    await client.query(`
      CREATE POLICY "Admins can view their own record"
        ON admins FOR SELECT
        USING (auth.uid() = id);
    `)
    console.log('   ✓ Política SELECT creada')

    // 3. Create UPDATE policy
    console.log('3️⃣  Creando política UPDATE...')
    await client.query(`
      CREATE POLICY "Admins can update their own record"
        ON admins FOR UPDATE
        USING (auth.uid() = id);
    `)
    console.log('   ✓ Política UPDATE creada')

    // 4. Add comments
    console.log('4️⃣  Agregando comentarios...')
    await client.query(`
      COMMENT ON POLICY "Admins can view their own record" ON admins IS
        'Permite a usuarios autenticados leer su propio registro en la tabla admins';
    `)
    await client.query(`
      COMMENT ON POLICY "Admins can update their own record" ON admins IS
        'Permite a admins actualizar su propio registro (ej: last_login_at)';
    `)
    console.log('   ✓ Comentarios agregados')

    // 5. Verify final state
    console.log('\n5️⃣  Verificando políticas creadas...')
    const finalCheck = await client.query(`
      SELECT
        policyname,
        cmd,
        qual
      FROM pg_policies
      WHERE tablename = 'admins'
      ORDER BY policyname
    `)

    console.log('   ✓ Políticas verificadas:')
    finalCheck.rows.forEach((row) => {
      console.log(`      - ${row.policyname} (${row.cmd})`)
    })

    console.log('\n' + '='.repeat(70))
    console.log('✅ POLÍTICAS RLS APLICADAS EXITOSAMENTE')
    console.log('='.repeat(70))
    console.log('\n💡 Ahora puedes intentar hacer login en:')
    console.log('   http://localhost:5174/admin/login')
    console.log('\n🔐 Usa las credenciales administradas fuera del repositorio')
    console.log('\n' + '='.repeat(70) + '\n')
  } catch (error) {
    console.error('\n❌ Error:', error)
    throw error
  } finally {
    await client.end()
  }
}

applyRLSPolicies()
  .then(() => {
    console.log('🎉 Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
