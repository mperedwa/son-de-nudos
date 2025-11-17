#!/usr/bin/env tsx

/**
 * Son de Nudos - Create Admin User
 *
 * Crea un nuevo usuario admin en Supabase Auth y lo vincula con la tabla admins.
 * Acepta parámetros CLI para personalizar el usuario.
 *
 * IMPORTANTE: Este script usa SERVICE_ROLE_KEY para crear usuarios.
 *
 * Uso:
 *   npm run create:admin -- --email user@example.com --name "User Name" [--password "pass"] [--role admin|superadmin]
 *
 * Ejemplos:
 *   npm run create:admin -- --email priscilla@sondenudos.com --name Priscilla
 *   npm run create:admin -- --email admin@sondenudos.com --name "Admin" --password "MyPassword123" --role superadmin
 */

import { createClient } from '@supabase/supabase-js'
import * as crypto from 'crypto'

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
// PARSEO DE ARGUMENTOS CLI
// ============================================================================

interface AdminUserConfig {
  email: string
  password: string
  name: string
  role: 'admin' | 'superadmin'
}

function parseArguments(): AdminUserConfig {
  const args = process.argv.slice(2)
  const config: Partial<AdminUserConfig> = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === '--email' && args[i + 1]) {
      config.email = args[i + 1]
      i++
    } else if (arg === '--name' && args[i + 1]) {
      config.name = args[i + 1]
      i++
    } else if (arg === '--password' && args[i + 1]) {
      config.password = args[i + 1]
      i++
    } else if (arg === '--role' && args[i + 1]) {
      const role = args[i + 1]
      if (role === 'admin' || role === 'superadmin') {
        config.role = role
      } else {
        console.error(`❌ Error: --role debe ser "admin" o "superadmin", recibido: "${role}"`)
        process.exit(1)
      }
      i++
    } else if (arg === '--help' || arg === '-h') {
      printUsage()
      process.exit(0)
    }
  }

  // Validar campos requeridos
  if (!config.email) {
    console.error('❌ Error: --email es requerido\n')
    printUsage()
    process.exit(1)
  }

  if (!config.name) {
    console.error('❌ Error: --name es requerido\n')
    printUsage()
    process.exit(1)
  }

  // Generar contraseña segura si no se proporcionó
  if (!config.password) {
    config.password = generateSecurePassword()
    console.log('💡 No se proporcionó contraseña, generando una segura...\n')
  }

  // Rol por defecto: admin
  if (!config.role) {
    config.role = 'admin'
  }

  return config as AdminUserConfig
}

function printUsage() {
  console.log(`
📘 Uso:
  npm run create:admin -- --email <email> --name <name> [--password <password>] [--role <role>]

📋 Opciones:
  --email       Email del usuario admin (requerido)
  --name        Nombre completo del usuario (requerido)
  --password    Contraseña (opcional, se genera una segura si no se proporciona)
  --role        Rol: "admin" o "superadmin" (opcional, default: "admin")
  --help, -h    Mostrar esta ayuda

✨ Ejemplos:
  # Crear admin con contraseña generada
  npm run create:admin -- --email priscilla@sondenudos.com --name Priscilla

  # Crear superadmin con contraseña personalizada
  npm run create:admin -- --email admin@sondenudos.com --name "Admin Principal" --password "MyPass123" --role superadmin
  `)
}

function generateSecurePassword(): string {
  // Generar contraseña de 16 caracteres con letras, números y símbolos
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  const randomBytes = crypto.randomBytes(16)

  for (let i = 0; i < 16; i++) {
    const randomIndex = randomBytes[i] % charset.length
    password += charset[randomIndex]
  }

  return password
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

async function createAdminUser(config: AdminUserConfig) {
  console.log('🚀 Creando nuevo usuario admin...\n')
  console.log('📋 Configuración:')
  console.log(`   Email: ${config.email}`)
  console.log(`   Name:  ${config.name}`)
  console.log(`   Role:  ${config.role}`)
  console.log('')

  try {
    // 1. Verificar si ya existe en auth.users
    console.log('1️⃣  Verificando si el usuario ya existe en Supabase Auth...')
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users.find((u) => u.email === config.email)

    if (existingUser) {
      console.error(`   ❌ El usuario con email "${config.email}" ya existe (ID: ${existingUser.id})`)
      console.error('   💡 Usa un email diferente o elimina el usuario existente primero')
      process.exit(1)
    }

    console.log('   ✓ Email disponible')

    // 2. Crear usuario en Supabase Auth
    console.log('2️⃣  Creando usuario en Supabase Auth...')
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: config.email,
      password: config.password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        name: config.name,
      },
    })

    if (createError || !newUser.user) {
      throw new Error(`Error creando usuario: ${createError?.message || 'Unknown error'}`)
    }

    const userId = newUser.user.id
    console.log(`   ✓ Usuario creado con ID: ${userId}`)

    // 3. Insertar en tabla admins
    console.log('3️⃣  Insertando registro en tabla admins...')
    const { error: insertError } = await supabase.from('admins').insert({
      id: userId,
      email: config.email,
      name: config.name,
      role: config.role,
      active: true,
    })

    if (insertError) {
      // Si falla la inserción, intentar eliminar el usuario de Auth
      console.error('   ❌ Error insertando en tabla admins')
      console.log('   🧹 Limpiando: eliminando usuario de Supabase Auth...')

      await supabase.auth.admin.deleteUser(userId)

      throw new Error(`Error insertando en admins: ${insertError.message}`)
    }

    console.log('   ✓ Registro insertado en tabla admins')

    // ============================================================================
    // RESUMEN
    // ============================================================================

    console.log('\n' + '='.repeat(70))
    console.log('✅ USUARIO ADMIN CREADO EXITOSAMENTE')
    console.log('='.repeat(70))
    console.log('\n📋 Credenciales del nuevo usuario:')
    console.log(`   Email:    ${config.email}`)
    console.log(`   Password: ${config.password}`)
    console.log(`   Name:     ${config.name}`)
    console.log(`   Role:     ${config.role}`)
    console.log(`   User ID:  ${userId}`)
    console.log('\n⚠️  IMPORTANTE: Guarda estas credenciales de forma segura.')
    console.log('   La contraseña no se mostrará nuevamente.')
    console.log('\n💡 El usuario puede acceder a:')
    console.log('   http://localhost:5174/admin/login (desarrollo)')
    console.log('   https://son-de-nudos.vercel.app/admin/login (producción)')
    console.log('\n' + '='.repeat(70) + '\n')
  } catch (error) {
    console.error('\n❌ Error durante la creación:', error)
    process.exit(1)
  }
}

// ============================================================================
// EJECUCIÓN
// ============================================================================

const config = parseArguments()

createAdminUser(config)
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
