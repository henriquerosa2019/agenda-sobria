import { createClient } from '@supabase/supabase-js'

// Pega as variáveis do .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

// Cria o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey)
