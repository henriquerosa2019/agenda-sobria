import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Cria cliente Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function backup() {
  try {
    // Apenas as tabelas existentes
    const tables = ["companions", "locations", "visit_companions", "visits"];
    const backupData: Record<string, any[]> = {};

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select("*");
      if (error) throw error;
      backupData[table] = data || [];
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filePath = `./backup-supabase-${timestamp}.json`;

    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));
    console.log(`✅ Backup criado com sucesso: ${filePath}`);
  } catch (err) {
    console.error("❌ Erro ao criar backup:", err);
  }
}

backup();
