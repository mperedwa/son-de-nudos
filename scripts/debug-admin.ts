#!/usr/bin/env tsx

/**
 * Debug script para verificar el estado del usuario admin
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variables de entorno faltantes')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

async function debug() {
  console.log('🔍 Verificando estado del admin...\n')

  // 1. Verificar usuarios en auth.users
  console.log('1️⃣  Usuarios en Supabase Auth:')
  const { data: authUsers } = await supabase.auth.admin.listUsers()
  const adminAuthUser = authUsers?.users.find(
    (u) => u.email === 'admin@sondenudos.com'
  )

  if (adminAuthUser) {
    console.log(`   ✓ Usuario encontrado en Auth`)
    console.log(`     ID: ${adminAuthUser.id}`)
    console.log(`     Email: ${adminAuthUser.email}`)
    console.log(`     Confirmado: ${adminAuthUser.email_confirmed_at ? 'Sí' : 'No'}`)
  } else {
    console.log('   ✗ Usuario NO encontrado en Auth')
  }

  // 2. Verificar registros en tabla admins
  console.log('\n2️⃣  Registros en tabla admins:')
  const { data: admins, error } = await supabase
    .from('admins')
    .select('id, email, name, role, active')

  if (error) {
    console.log(`   ✗ Error: ${error.message}`)
  } else if (!admins || admins.length === 0) {
    console.log('   ✗ Tabla admins está VACÍA')
  } else {
    console.log(`   ✓ ${admins.length} registro(s) encontrado(s):`)
    admins.forEach((admin) => {
      console.log(`     - ID: ${admin.id}`)
      console.log(`       Email: ${admin.email}`)
      console.log(`       Nombre: ${admin.name}`)
      console.log(`       Role: ${admin.role}`)
      console.log(`       Activo: ${admin.active}`)
    })
  }

  // 3. Verificar coincidencia
  if (adminAuthUser && admins && admins.length > 0) {
    const matching = admins.find((a) => a.id === adminAuthUser.id)
    console.log('\n3️⃣  Verificación de coincidencia:')
    if (matching) {
      console.log('   ✓ IDs coinciden correctamente')
    } else {
      console.log('   ✗ IDs NO coinciden')
      console.log(`     Auth ID: ${adminAuthUser.id}`)
      console.log(`     Admin IDs: ${admins.map((a) => a.id).join(', ')}`)
    }
  }
}

debug()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err)
    process.exit(1)
  })
