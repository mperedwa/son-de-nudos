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
  console.log('🔍 Verificando políticas RLS en tabla admins...\n')

  try {
    // Consultar políticas RLS desde pg_policies
    const { data: policies, error } = await supabase.rpc('sql', {
      query: `
        SELECT
          schemaname,
          tablename,
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies
        WHERE tablename = 'admins';
      `,
    })

    if (error) {
      // Try alternative method
      console.log('📋 Intentando método alternativo...\n')
      const { data, error: selectError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'admins')

      if (selectError) {
        console.error('❌ Error consultando políticas:', selectError)
        console.log('\n💡 Intentando consulta SQL directa...')

        // Let's just check if RLS is enabled
        const { data: tableInfo, error: tableError } = await supabase.rpc('sql', {
          query: `
            SELECT
              relname as table_name,
              relrowsecurity as rls_enabled
            FROM pg_class
            WHERE relname = 'admins' AND relkind = 'r';
          `,
        })

        if (!tableError && tableInfo) {
          console.log('📊 Información de la tabla admins:')
          console.log(tableInfo)
        }
      } else {
        console.log('✅ Políticas encontradas:')
        console.log(JSON.stringify(data, null, 2))
      }
    } else {
      console.log('✅ Políticas RLS encontradas:')
      console.log(JSON.stringify(policies, null, 2))
    }
  } catch (err) {
    console.error('❌ Error:', err)
  }
}

checkRLSPolicies()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error fatal:', err)
    process.exit(1)
  })
