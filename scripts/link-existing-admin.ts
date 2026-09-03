#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

const approvedProjectRef = 'icqbyybjhdaxvobfcnia'
const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

if (!supabaseUrl.includes(approvedProjectRef)) {
  throw new Error('Refusing to run: VITE_SUPABASE_URL does not target the approved project')
}

const args = process.argv.slice(2)

function readArgument(name: string): string | undefined {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : undefined
}

const email = readArgument('--email')?.trim().toLowerCase()
const name = readArgument('--name')?.trim()
const roleArgument = readArgument('--role') ?? 'admin'

if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
  throw new Error('Provide a valid --email')
}

if (!name) {
  throw new Error('Provide --name')
}

if (roleArgument !== 'admin' && roleArgument !== 'superadmin') {
  throw new Error('--role must be admin or superadmin')
}

const service = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function findUserByEmail() {
  const perPage = 100

  for (let page = 1; ; page += 1) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage })
    if (error) throw error

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email)
    if (user) return user
    if (data.users.length < perPage) return null
  }
}

async function main() {
  const user = await findUserByEmail()
  if (!user) {
    throw new Error('No matching Supabase Auth user exists; create it in the dashboard first')
  }

  const { error: upsertError } = await service.from('admins').upsert(
    {
      id: user.id,
      email,
      name,
      role: roleArgument,
      active: true,
    },
    { onConflict: 'id' }
  )
  if (upsertError) throw upsertError

  const { data: admin, error: verifyError } = await service
    .from('admins')
    .select('id,email,name,role,active')
    .eq('id', user.id)
    .single()
  if (verifyError) throw verifyError

  if (admin.email !== email || admin.name !== name || admin.role !== roleArgument || !admin.active) {
    throw new Error('Administrator record verification failed')
  }

  console.log(`Administrator linked: ${admin.email} (${admin.role}, active)`)
}

main().catch((error: unknown) => {
  console.error('Unable to link administrator:', error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
