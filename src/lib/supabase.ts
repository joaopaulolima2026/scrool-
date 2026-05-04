import { createClient } from '@supabase/supabase-js'

function getEnv(key: string): string {
  const value = import.meta.env[key]
  if (!value) throw new Error(`Missing env var: ${key}`)
  return value
}

export const supabase = createClient(
  getEnv('VITE_SUPABASE_URL'),
  getEnv('VITE_SUPABASE_ANON_KEY'),
)
