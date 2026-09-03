#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL
const TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !TEST_ADMIN_EMAIL || !TEST_ADMIN_PASSWORD) {
  console.error('❌ Faltan variables de Supabase o credenciales TEST_ADMIN_* locales')
  process.exit(1)
}

// Usar ANON KEY como lo hace la aplicación real
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

async function testLoginFlow() {
  console.log('🧪 Probando flujo de login completo...\n')

  try {
    // 1. Hacer login
    console.log(`1️⃣  Intentando login con ${TEST_ADMIN_EMAIL}...`)

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: TEST_ADMIN_EMAIL,
        password: TEST_ADMIN_PASSWORD,
      })

    if (authError) {
      console.error('   ❌ Error en login:', authError)
      throw authError
    }

    if (!authData.user) {
      console.error('   ❌ No se obtuvo usuario')
      throw new Error('No user returned from login')
    }

    console.log(`   ✓ Login exitoso, User ID: ${authData.user.id}`)
    console.log(`   ✓ Email: ${authData.user.email}`)

    // 2. Verificar que la sesión está activa
    console.log('\n2️⃣  Verificando sesión activa...')

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      console.error('   ❌ Error obteniendo sesión:', sessionError)
      throw sessionError || new Error('No session')
    }

    console.log(`   ✓ Sesión activa para user: ${session.user.id}`)

    // 3. Intentar leer el registro de admin (AQUÍ ES DONDE FALLA EN LA APP)
    console.log('\n3️⃣  Intentando leer registro de admin...')

    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id, email, name, role, active')
      .eq('id', authData.user.id)
      .eq('active', true)
      .single()

    if (adminError) {
      console.error('   ❌ Error leyendo admin:', adminError)
      console.error('   📋 Detalles:', {
        code: adminError.code,
        message: adminError.message,
        details: adminError.details,
        hint: adminError.hint,
      })

      // Intentar sin .single() para ver si es un problema de cantidad de registros
      console.log('\n   🔍 Intentando sin .single()...')
      const { data: adminList, error: listError } = await supabase
        .from('admins')
        .select('id, email, name, role, active')
        .eq('id', authData.user.id)
        .eq('active', true)

      if (listError) {
        console.error('      ❌ Error:', listError)
      } else {
        console.log('      ✓ Registros encontrados:', adminList?.length || 0)
        if (adminList && adminList.length > 0) {
          console.log('      ✓ Datos:', adminList[0])
        }
      }
    } else {
      console.log('   ✓ Registro de admin obtenido correctamente:')
      console.log('   📋 Datos:', adminData)
    }

    // 4. Logout
    console.log('\n4️⃣  Haciendo logout...')
    await supabase.auth.signOut()
    console.log('   ✓ Logout exitoso')

    if (!adminError && adminData) {
      console.log('\n' + '='.repeat(70))
      console.log('✅ TEST EXITOSO - RLS FUNCIONANDO CORRECTAMENTE')
      console.log('='.repeat(70))
      console.log('\n💡 Las políticas RLS están funcionando bien')
      console.log('💡 El login debería funcionar en la aplicación')
      console.log('\n' + '='.repeat(70) + '\n')
    } else {
      console.log('\n' + '='.repeat(70))
      console.log('❌ TEST FALLÓ - PROBLEMA CON RLS')
      console.log('='.repeat(70))
      console.log('\n💡 Las políticas RLS no están permitiendo acceso')
      console.log('💡 Necesitamos investigar las políticas en la base de datos')
      console.log('\n' + '='.repeat(70) + '\n')
    }
  } catch (error) {
    console.error('\n❌ Error durante el test:', error)
    process.exit(1)
  }
}

testLoginFlow()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
