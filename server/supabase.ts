import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

function getEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing env var: ${key}`)
  return value
}

export const supabaseAdmin = createClient(
  getEnv('VITE_SUPABASE_URL'),
  getEnv('SUPABASE_SERVICE_ROLE_KEY'),
  { auth: { autoRefreshToken: false, persistSession: false } },
)
