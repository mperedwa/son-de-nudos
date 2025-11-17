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
})

async function verifyIdMismatch() {
  console.log('🔍 Verificando coincidencia de IDs entre auth.users y admins...\n')

  try {
    // 1. Obtener usuario de auth.users
    console.log('1️⃣  Obteniendo usuario de Supabase Auth...')
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const adminAuthUser = authUsers?.users.find(
      (u) => u.email === 'admin@sondenudos.com'
    )

    if (!adminAuthUser) {
      console.error('   ❌ No se encontró usuario en auth.users')
      process.exit(1)
    }

    console.log(`   ✓ Usuario encontrado en auth.users`)
    console.log(`   📋 ID: ${adminAuthUser.id}`)
    console.log(`   📋 Email: ${adminAuthUser.email}`)

    // 2. Obtener registro de tabla admins
    console.log('\n2️⃣  Obteniendo registro de tabla admins...')
    const { data: admins, error: adminsError } = await supabase
      .from('admins')
      .select('id, email, name, role, active')
      .eq('email', 'admin@sondenudos.com')

    if (adminsError) {
      console.error('   ❌ Error consultando admins:', adminsError)
      process.exit(1)
    }

    if (!admins || admins.length === 0) {
      console.error('   ❌ No se encontró registro en tabla admins')
      process.exit(1)
    }

    const adminRecord = admins[0]
    console.log(`   ✓ Registro encontrado en tabla admins`)
    console.log(`   📋 ID: ${adminRecord.id}`)
    console.log(`   📋 Email: ${adminRecord.email}`)

    // 3. Comparar IDs
    console.log('\n3️⃣  Comparando IDs...')
    console.log(`   auth.users.id:  ${adminAuthUser.id}`)
    console.log(`   admins.id:      ${adminRecord.id}`)

    if (adminAuthUser.id === adminRecord.id) {
      console.log('\n' + '='.repeat(70))
      console.log('✅ LOS IDs COINCIDEN - NO HAY PROBLEMA')
      console.log('='.repeat(70))
      console.log('\n💡 El problema debe estar en otro lado')
      console.log('\n' + '='.repeat(70) + '\n')
    } else {
      console.log('\n' + '='.repeat(70))
      console.log('❌ LOS IDs NO COINCIDEN - PROBLEMA CONFIRMADO')
      console.log('='.repeat(70))
      console.log('\n🎯 CAUSA RAÍZ CONFIRMADA:')
      console.log('   Las políticas RLS comparan auth.uid() con admins.id')
      console.log('   Pero estos IDs son diferentes, por eso falla el acceso')
      console.log('\n💡 SOLUCIÓN:')
      console.log('   Necesitamos eliminar el registro actual y recrearlo')
      console.log('   con el ID correcto de auth.users')
      console.log('\n' + '='.repeat(70) + '\n')
      process.exit(1)
    }
  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

verifyIdMismatch()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
