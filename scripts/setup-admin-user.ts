#!/usr/bin/env tsx

/**
 * Son de Nudos - Setup Admin User
 *
 * Crea el usuario admin en Supabase Auth y lo vincula con la tabla admins.
 *
 * IMPORTANTE: Este script usa SERVICE_ROLE_KEY para crear usuarios.
 * Solo debe ejecutarse una vez en setup inicial.
 *
 * Uso:
 *   npm run setup:admin
 */

import { createClient } from '@supabase/supabase-js'

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Variables de entorno faltantes')
  console.error('   VITE_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✓' : '✗')
  console.error('\n💡 Asegúrate de tener un archivo .env con estas variables')
  process.exit(1)
}

// Cliente Supabase con SERVICE_ROLE_KEY para crear usuarios
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

// ============================================================================
// DATOS DEL ADMIN
// ============================================================================

const ADMIN_USER = {
  email: 'admin@sondenudos.com',
  password: '[REDACTED]',
  name: 'Admin Principal',
  role: 'superadmin' as const,
}

// ============================================================================
// FUNCIONES
// ============================================================================

async function setupAdminUser() {
  console.log('🚀 Iniciando setup del usuario admin...\n')

  try {
    // 1. Verificar si ya existe en auth.users
    console.log('1️⃣  Verificando si el usuario ya existe en Supabase Auth...')
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users.find(
      (u) => u.email === ADMIN_USER.email
    )

    let userId: string

    if (existingUser) {
      console.log(`   ✓ Usuario ya existe con ID: ${existingUser.id}`)
      userId = existingUser.id
    } else {
      // 2. Crear usuario en Supabase Auth
      console.log('2️⃣  Creando usuario en Supabase Auth...')
      const { data: newUser, error: createError } =
        await supabase.auth.admin.createUser({
          email: ADMIN_USER.email,
          password: ADMIN_USER.password,
          email_confirm: true, // Auto-confirmar email
          user_metadata: {
            name: ADMIN_USER.name,
          },
        })

      if (createError || !newUser.user) {
        throw new Error(
          `Error creando usuario: ${createError?.message || 'Unknown error'}`
        )
      }

      userId = newUser.user.id
      console.log(`   ✓ Usuario creado con ID: ${userId}`)
    }

    // 3. Verificar si ya existe en tabla admins
    console.log('3️⃣  Verificando si existe en tabla admins...')
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingAdmin) {
      console.log('   ✓ Registro ya existe en tabla admins')
    } else {
      // 4. Insertar en tabla admins
      console.log('4️⃣  Insertando registro en tabla admins...')
      const { error: insertError } = await supabase.from('admins').insert({
        id: userId,
        email: ADMIN_USER.email,
        name: ADMIN_USER.name,
        role: ADMIN_USER.role,
        active: true,
      })

      if (insertError) {
        throw new Error(
          `Error insertando en admins: ${insertError.message}`
        )
      }

      console.log('   ✓ Registro insertado en tabla admins')
    }

    // ============================================================================
    // RESUMEN
    // ============================================================================

    console.log('\n' + '='.repeat(70))
    console.log('✅ SETUP COMPLETADO EXITOSAMENTE')
    console.log('='.repeat(70))
    console.log('\n📋 Credenciales del usuario admin:')
    console.log(`   Email:    ${ADMIN_USER.email}`)
    console.log(`   Password: ${ADMIN_USER.password}`)
    console.log(`   Role:     ${ADMIN_USER.role}`)
    console.log(`   User ID:  ${userId}`)
    console.log('\n💡 Puedes usar estas credenciales para acceder a:')
    console.log('   http://localhost:5174/admin/login')
    console.log('\n' + '='.repeat(70) + '\n')
  } catch (error) {
    console.error('\n❌ Error durante el setup:', error)
    process.exit(1)
  }
}

// ============================================================================
// EJECUCIÓN
// ============================================================================

setupAdminUser()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
