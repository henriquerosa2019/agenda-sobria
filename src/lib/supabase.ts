import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

// debug leve (não logue a chave completa)
console.log('[ENV] hasURL?', !!url, 'hasAnon?', !!anon);

export const supabase = createClient(url!, anon!, {
  auth: { persistSession: false },
});


