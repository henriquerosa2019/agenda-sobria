import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Inicializa o Supabase
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async () => {
  try {
    // Data atual
    const now = new Date();

    // Define intervalo do mês anterior
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      .toISOString()
      .split("T")[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
      .toISOString()
      .split("T")[0];

    // Busca visitas do mês anterior
    const { data: visits, error } = await supabase
      .from("visits")
      .select("date, time, location_id, locations(name)")
      .gte("date", firstDay)
      .lte("date", lastDay)
      .order("date", { ascending: true });

    if (error) throw error;

    if (!visits || visits.length === 0) {
      console.log("Nenhuma visita registrada no mês anterior.");
      return new Response("Sem visitas no período.");
    }

    // Monta o texto do resumo
    const resumo = visits
      .map((v) => `📅 ${v.date} às ${v.time} – ${v.locations?.name || "Local indefinido"}`)
      .join("\n");

    const messageBody = `📋 *Resumo Mensal de Visitas*\n\n${resumo}\n\nTotal: ${visits.length} visitas registradas.`;

    // Envia mensagem pelo WhatsApp Cloud API
    const resp = await fetch(
      `https://graph.facebook.com/v20.0/${Deno.env.get("WHATSAPP_PHONE_ID")}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("WHATSAPP_ACCESS_TOKEN")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: Deno.env.get("ADMIN_PHONE")!, // número do admin
          type: "text",
          text: { body: messageBody },
        }),
      }
    );

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Erro ao enviar WhatsApp: ${errText}`);
    }

    console.log("Resumo enviado com sucesso!");
    return new Response("Resumo mensal enviado com sucesso!");
  } catch (err) {
    console.error("Erro:", err);
    return new Response(`Erro: ${err.message}`, { status: 500 });
  }
});
