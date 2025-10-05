import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "models/text-embedding-004" });

async function generateEmbeddings() {
  console.log("🧩 Gerando embeddings das visitas...");

  const { data: visits, error } = await supabase
    .from("visits")
    .select(`
      id,
      date,
      time,
      end_time,
      notes,
      locations:location_id(name, address),
      visit_companions(
        companions(name),
        cost
      )
    `);

  if (error) {
    console.error("❌ Erro ao buscar visitas:", error.message);
    return;
  }

  if (!visits || visits.length === 0) {
    console.warn("⚠️ Nenhuma visita encontrada no banco.");
    return;
  }

  for (const v of visits) {
    try {
      const companions = (v.visit_companions || [])
        .map((c: any) => c.companions?.name)
        .filter(Boolean)
        .join(", ") || "sem companheiros";

      const local = v.locations?.name || "local não informado";
      const endereco = v.locations?.address || "endereço não informado";
      const observacao = v.notes || "sem observações";

      const texto = `
        Visita marcada para o dia ${v.date} às ${v.time}.
        Local: ${local} (${endereco}).
        Companheiros: ${companions}.
        Observações: ${observacao}.
      `.trim();

      // Gera o embedding
      const embeddingResult = await model.embedContent(texto);
      const embedding = embeddingResult.embedding.values;

      // Salva no Supabase
      const { error: insertError } = await supabase
        .from("visit_embeddings")
        .insert({
          visit_id: v.id,
          content: texto,
          embedding,
        });

      if (insertError) throw insertError;
      console.log(`✅ Embedding gerado para visita ${v.id}`);
    } catch (err) {
      console.error("❌ Erro ao gerar embedding:", err);
    }
  }

  console.log("🎯 Finalizado!");
}

generateEmbeddings();
