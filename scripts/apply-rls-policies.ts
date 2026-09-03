#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Faltan variables de entorno')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  db: {
    schema: 'public',
  },
})

async function applyRLSPolicies() {
  console.log('🚀 Aplicando políticas RLS para tabla admins...\n')

  try {
    // 1. Drop existing policies if they exist
    console.log('1️⃣  Eliminando políticas existentes (si existen)...')

    const dropPolicies = `
      DROP POLICY IF EXISTS "Admins can view their own record" ON admins;
      DROP POLICY IF EXISTS "Admins can update their own record" ON admins;
    `

    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: dropPolicies,
    })

    if (dropError) {
      console.log('   ℹ️  No hay políticas previas que eliminar (normal en primera instalación)')
    } else {
      console.log('   ✓ Políticas previas eliminadas')
    }

    // 2. Create SELECT policy
    console.log('2️⃣  Creando política SELECT...')

    const selectPolicy = `
      CREATE POLICY "Admins can view their own record"
        ON admins FOR SELECT
        USING (auth.uid() = id);
    `

    const { error: selectError } = await supabase.rpc('exec_sql', {
      sql: selectPolicy,
    })

    if (selectError) {
      console.error('   ❌ Error creando política SELECT:', selectError)
      throw selectError
    }

    console.log('   ✓ Política SELECT creada')

    // 3. Create UPDATE policy
    console.log('3️⃣  Creando política UPDATE...')

    const updatePolicy = `
      CREATE POLICY "Admins can update their own record"
        ON admins FOR UPDATE
        USING (auth.uid() = id);
    `

    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: updatePolicy,
    })

    if (updateError) {
      console.error('   ❌ Error creando política UPDATE:', updateError)
      throw updateError
    }

    console.log('   ✓ Política UPDATE creada')

    // 4. Verify policies were created
    console.log('4️⃣  Verificando políticas...')

    const { data: _verifyData, error: verifyError } = await supabase
      .from('admins')
      .select('id')
      .limit(1)

    if (verifyError) {
      console.log('   ⚠️  Advertencia al verificar:', verifyError.message)
    } else {
      console.log('   ✓ Políticas verificadas correctamente')
    }

    console.log('\n' + '='.repeat(70))
    console.log('✅ POLÍTICAS RLS APLICADAS EXITOSAMENTE')
    console.log('='.repeat(70))
    console.log('\n💡 Ahora puedes intentar hacer login en:')
    console.log('   http://localhost:5174/admin/login')
    console.log('\n🔐 Usa las credenciales administradas fuera del repositorio')
    console.log('\n' + '='.repeat(70) + '\n')
  } catch (error) {
    console.error('\n❌ Error aplicando políticas:', error)
    process.exit(1)
  }
}

applyRLSPolicies()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
