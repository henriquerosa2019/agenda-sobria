import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

// Expor no window para debug local
if (import.meta.env.DEV) {
  // @ts-ignore
  window.sb = supabase;
  console.log("[DEBUG] window.sb disponível no console");
}
