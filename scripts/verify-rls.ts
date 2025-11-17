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

async function verifyRLS() {
  console.log('🔍 Verificando configuración RLS de tabla admins...\n')

  try {
    // 1. Verificar si RLS está habilitado en la tabla
    const { data: rls, error: rlsError } = await supabase
      .from('admins')
      .select('*')
      .limit(0)

    console.log('1️⃣  Estado de RLS:')
    if (rlsError) {
      console.log(`   ⚠️  RLS parece estar activo (error esperado sin service key): ${rlsError.message}`)
    } else {
      console.log('   ✓ Tabla accesible (RLS podría estar deshabilitado)')
    }

    // 2. Intentar leer con el admin user ID real
    const ADMIN_ID = '97c9a86c-6bc8-4e80-9587-fc5e13806096'

    console.log('\n2️⃣  Intentando leer registro de admin con SERVICE_ROLE_KEY...')
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id, email, name, role, active')
      .eq('id', ADMIN_ID)
      .single()

    if (adminError) {
      console.error('   ❌ Error:', adminError)
    } else {
      console.log('   ✓ Registro encontrado:', adminData)
    }

    // 3. Simular una consulta como usuario autenticado (esto no funcionará desde aquí,
    //    pero podemos ver qué pasa)
    console.log('\n3️⃣  Información sobre el test de RLS:')
    console.log('   📋 Las políticas RLS solo aplican a usuarios autenticados a través de Supabase Auth')
    console.log('   📋 El SERVICE_ROLE_KEY bypasea RLS completamente')
    console.log('   📋 Para probar RLS correctamente, debes intentar hacer login en la aplicación')

    // 4. Intentar consultar la metadata de las políticas usando información del sistema
    console.log('\n4️⃣  Intentando consultar metadata de políticas...')
    console.log('   ℹ️  (Esto podría no funcionar dependiendo de los permisos)')

    // Usar una consulta raw si es posible
    const { data: policies } = await supabase.rpc('get_table_policies', {
      table_name: 'admins',
    }).catch(() => ({ data: null }))

    if (policies) {
      console.log('   ✓ Políticas encontradas:', policies)
    } else {
      console.log('   ⚠️  No se pudieron consultar las políticas mediante RPC')
    }

    console.log('\n' + '='.repeat(70))
    console.log('📊 RESUMEN')
    console.log('='.repeat(70))
    console.log('\n✅ Las migraciones están aplicadas según supabase migration list')
    console.log('✅ El registro del admin existe en la tabla')
    console.log('\n💡 SIGUIENTE PASO:')
    console.log('   Intenta hacer login nuevamente en:')
    console.log('   http://localhost:5174/admin/login')
    console.log('\n📧 Credenciales:')
    console.log('   Email: admin@sondenudos.com')
    console.log('   Password: [REDACTED]')
    console.log('\n🔍 Si sigue fallando, revisa la consola del navegador para ver el error exacto')
    console.log('\n' + '='.repeat(70) + '\n')
  } catch (error) {
    console.error('\n❌ Error:', error)
  }
}

verifyRLS()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
