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

async function checkRLSPolicies() {
  console.log('🔍 Verificando políticas RLS en la base de datos...\n')

  try {
    // 1. Verificar si RLS está habilitado
    console.log('1️⃣  Verificando si RLS está habilitado en tabla admins...')

    const { data: rlsEnabled, error: rlsError } = await supabase
      .rpc('check_rls_enabled', {
        table_name: 'admins',
      })
      .single()
      .catch(async () => {
        // Si RPC no existe, usar query directa
        return await supabase
          .from('pg_class')
          .select('relrowsecurity')
          .eq('relname', 'admins')
          .eq('relkind', 'r')
          .single()
          .catch(() => ({ data: null, error: null }))
      })

    if (rlsEnabled?.relrowsecurity !== undefined) {
      console.log(`   ${rlsEnabled.relrowsecurity ? '✓' : '❌'} RLS ${rlsEnabled.relrowsecurity ? 'HABILITADO' : 'DESHABILITADO'}`)
    } else {
      console.log('   ⚠️  No se pudo verificar estado de RLS')
    }

    // 2. Listar políticas activas
    console.log('\n2️⃣  Listando políticas RLS activas...')

    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname, cmd, qual, with_check')
      .eq('tablename', 'admins')
      .catch(() => ({ data: null, error: null }))

    if (policies && policies.length > 0) {
      console.log(`   ✓ Se encontraron ${policies.length} política(s):`)
      policies.forEach((policy) => {
        console.log(`\n   📋 Política: ${policy.policyname}`)
        console.log(`      Comando: ${policy.cmd}`)
        console.log(`      Condición: ${policy.qual}`)
      })
    } else {
      console.log('   ❌ NO SE ENCONTRARON POLÍTICAS')
      console.log('   💡 Las migraciones dicen que están aplicadas, pero NO existen en la BD')
    }

    // 3. Intentar crear las políticas manualmente
    if (!policies || policies.length === 0) {
      console.log('\n3️⃣  Intentando crear políticas manualmente...')

      // Primero, eliminar cualquier política existente (por si acaso)
      console.log('   🗑️  Eliminando políticas previas (si existen)...')

      try {
        await supabase.rpc('execute_sql', {
          sql: `
            DROP POLICY IF EXISTS "Admins can view their own record" ON admins;
            DROP POLICY IF EXISTS "Admins can update their own record" ON admins;
          `,
        }).catch(() => {
          console.log('      ℹ️  No hay políticas previas que eliminar')
        })
      } catch {
        // Ignore
      }

      console.log('\n   ➕ Creando política SELECT...')
      const selectPolicySQL = `
        CREATE POLICY "Admins can view their own record"
          ON admins FOR SELECT
          USING (auth.uid() = id);
      `

      console.log('      SQL:', selectPolicySQL.trim())
      console.log('      ⚠️  NOTA: No puedo ejecutar esto con supabase-js')
      console.log('      💡 Necesitas ejecutarlo manualmente en Supabase Dashboard')

      console.log('\n   ➕ Creando política UPDATE...')
      const updatePolicySQL = `
        CREATE POLICY "Admins can update their own record"
          ON admins FOR UPDATE
          USING (auth.uid() = id);
      `

      console.log('      SQL:', updatePolicySQL.trim())
    }

    console.log('\n' + '='.repeat(70))
    console.log('📊 RESUMEN')
    console.log('='.repeat(70))

    if (policies && policies.length > 0) {
      console.log('\n✅ Las políticas RLS existen en la base de datos')
      console.log('💡 El problema debe estar en otro lado')
    } else {
      console.log('\n❌ LAS POLÍTICAS RLS NO EXISTEN EN LA BASE DE DATOS')
      console.log('💡 Aunque `supabase migration list` dice que están aplicadas')
      console.log('💡 Necesitas aplicarlas manualmente en Supabase Dashboard')
      console.log('\n🔗 Ve a: https://supabase.com/dashboard/project/mxpmbzdenlelrlcwmjmg/editor')
      console.log('   Ejecuta el SQL de la migración 20251116000002_add_admins_rls_policies.sql')
    }

    console.log('\n' + '='.repeat(70) + '\n')
  } catch (error) {
    console.error('\n❌ Error:', error)
  }
}

checkRLSPolicies()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
