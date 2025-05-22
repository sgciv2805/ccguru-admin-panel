import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

// TODO: Add cookie-based auth for RLS when implementing auth
export const supabaseServer = () => createClient(supabaseUrl, supabaseAnonKey) 