#!/usr/bin/env tsx

import { spawnSync } from 'node:child_process'

const approvedProjectRef = 'icqbyybjhdaxvobfcnia'
const vercelProjectId = 'prj_dc1X35rnTU5s9JhchVa1BSMPAM7a'
const vercelScope = 'mario-perez-edwards-projects'
const allTargets = ['development', 'preview', 'production']

function requiredEnvironmentValue(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name} in the local environment`)
  return value
}

const localValues = {
  VITE_SUPABASE_URL: requiredEnvironmentValue('VITE_SUPABASE_URL'),
  VITE_SUPABASE_ANON_KEY: requiredEnvironmentValue('VITE_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: requiredEnvironmentValue('SUPABASE_SERVICE_ROLE_KEY'),
}

if (!localValues.VITE_SUPABASE_URL?.includes(approvedProjectRef)) {
  throw new Error('Refusing to run: local Supabase URL does not target the approved project')
}

const variables = [
  ['VITE_SUPABASE_URL', localValues.VITE_SUPABASE_URL],
  ['VITE_SUPABASE_ANON_KEY', localValues.VITE_SUPABASE_ANON_KEY],
  ['SUPABASE_URL', localValues.VITE_SUPABASE_URL],
  ['SUPABASE_ANON_KEY', localValues.VITE_SUPABASE_ANON_KEY],
  ['SUPABASE_SERVICE_ROLE_KEY', localValues.SUPABASE_SERVICE_ROLE_KEY],
] as const

type VercelEnvironmentVariable = {
  id: string
  key: string
  target: string[]
  gitBranch?: string | null
  type?: string
}

function runVercelApi(endpoint: string, method = 'GET', input?: unknown): string {
  const args = ['api', endpoint, '--scope', vercelScope, '--raw']
  if (method !== 'GET') args.push('--method', method, '--input', '-', '--silent')

  const result = spawnSync('vercel', args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    input: input === undefined ? undefined : JSON.stringify(input),
  })

  if (result.status !== 0) {
    let diagnostic = `${result.stdout}\n${result.stderr}`.trim()
    for (const value of Object.values(localValues)) {
      diagnostic = diagnostic.replaceAll(value, '[REDACTED]')
    }
    throw new Error(`Vercel API ${method} ${endpoint} failed: ${diagnostic}`)
  }

  return result.stdout
}

const currentEnvironment = JSON.parse(
  runVercelApi(`/v9/projects/${vercelProjectId}/env`)
) as { envs: VercelEnvironmentVariable[] }

for (const [name, value] of variables) {
  const existingVariables = currentEnvironment.envs.filter(({ key }) => key === name)

  if (existingVariables.length === 0) {
    runVercelApi(`/v10/projects/${vercelProjectId}/env`, 'POST', {
      key: name,
      value,
      type: 'encrypted',
      target: allTargets,
    })
    console.log(`Created ${name} for Development, Preview, and Production`)
    continue
  }

  for (const existingVariable of existingVariables) {
    const payload: Record<string, unknown> = {
      key: name,
      value,
      type: existingVariable.type ?? 'encrypted',
      target: existingVariable.target,
    }

    if (existingVariable.gitBranch) {
      payload.gitBranch = existingVariable.gitBranch
    }

    runVercelApi(
      `/v9/projects/${vercelProjectId}/env/${existingVariable.id}`,
      'PATCH',
      payload
    )
    console.log(`Updated ${name} for ${existingVariable.target.join(', ')}`)
  }
}
