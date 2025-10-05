import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// ==== CONFIGURAÇÕES ====
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function generateEmbeddings() {
  console.log("🚀 Iniciando geração de embeddings das visitas...");

  const { data: visits, error } = await supabase
    .from("visits")
    .select(`
      id,
      date,
      time,
      notes,
      start_time,
      end_time,
      locations(name, address),
      visit_companions(companions(name))
    `);

  if (error) throw error;
  if (!visits?.length) return console.log("⚠️ Nenhuma visita encontrada.");

  for (const visit of visits) {
    const companions = visit.visit_companions
      ?.map((vc: any) => vc.companions?.name)
      .filter(Boolean)
      .join(", ");

    const text = `
      Visita em ${visit.locations?.name || "local não informado"} 
      (${visit.locations?.address || "endereço não informado"})
      no dia ${visit.date} às ${visit.time || visit.start_time || "horário não informado"}.
      Companheiros: ${companions || "nenhum registrado"}.
      Observações: ${visit.notes || "sem observações"}.
    `;

    try {
      const result = await model.embedContent(text);
      const embedding = result.embedding.values;

      // Apaga embedding anterior (se existir)
      await supabase.from("visit_embeddings").delete().eq("visit_id", visit.id);

      // Insere novo embedding
      await supabase.from("visit_embeddings").insert({
        visit_id: visit.id,
        content: text,
        embedding,
      });

      console.log(`✅ Embedding gerado para visita ${visit.id}`);
    } catch (err) {
      console.error(`❌ Erro ao processar visita ${visit.id}:`, err);
    }
  }

  console.log("🎯 Finalizado!");
}

generateEmbeddings().catch(console.error);
