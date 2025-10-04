import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function resetDatabase() {
  try {
    console.log("🧹 Limpando banco de dados (UUID-safe)...");

    // 1️⃣ Limpa vínculos primeiro
    let { error: errVC } = await supabase.from("visit_companions").delete().not("id", "is", null);
    if (errVC) console.warn("⚠️ visit_companions:", errVC.message);

    // 2️⃣ Depois visitas
    let { error: errV } = await supabase.from("visits").delete().not("id", "is", null);
    if (errV) console.warn("⚠️ visits:", errV.message);

    // 3️⃣ Depois companheiros
    let { error: errC } = await supabase.from("companions").delete().not("id", "is", null);
    if (errC) console.warn("⚠️ companions:", errC.message);

    // 4️⃣ E por fim locais
    let { error: errL } = await supabase.from("locations").delete().not("id", "is", null);
    if (errL) console.warn("⚠️ locations:", errL.message);

    console.log("✅ Banco limpo com sucesso (UUID-safe)!");
  } catch (err) {
    console.error("❌ Erro ao limpar banco:", err);
  }
}

resetDatabase();
