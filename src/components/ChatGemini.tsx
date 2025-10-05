import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabaseClient";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export default function ChatGemini() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function askGemini() {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("Pensando... 🤔");

    try {
      // 📦 Buscar dados reais do Supabase
      const { data: visits } = await supabase
        .from("visits")
        .select(`id, date, time, locations(name, address), visit_companions(companions(name))`);

      const context = JSON.stringify(visits, null, 2);
      const today = new Date().toISOString().split("T")[0]; // data atual YYYY-MM-DD

      // 🧭 Prompt aprimorado
      const prompt = `
Você é um assistente especializado na **agenda de visitas do grupo CTO DS 17 – Área RJ** dos Alcoólicos Anônimos.

Sua função é responder perguntas com base nos dados reais abaixo (campo VISITAS), nunca inventando informações.

Considere que **hoje é ${today}**.

---

### ⚙️ Dados do Supabase:
${context}

---

### 📅 Regras temporais (muito importantes):
1. Se **date < ${today}**, a visita é **passada**.  
2. Se **date = ${today}**, a visita é **de hoje**.  
3. Se **date > ${today}**, a visita é **agendada (futura)**.  
4. Quando o usuário perguntar por “agendadas”, “próximas”, “futuras” → mostre **apenas as visitas com data >= ${today}**.  
5. Quando perguntar por “últimas”, “passadas”, “anteriores” → mostre **apenas as visitas com data < ${today}**.  
6. Sempre traga **até 3 resultados**, em ordem cronológica (mais próxima primeiro).  
7. Se o usuário citar o nome de um companheiro, filtre por ele em “visit_companions”.  
8. Formate a data no padrão brasileiro **DD/MM/AAAA** e a hora como **HH:mmh**.

---

### 🧾 Modelo de resposta:
${"```"}
📅 15/10/2025 às 15:30h – HOSPITAL CASA MENSSANA  
🏠 Endereço: Rua Marechal Jofre, Nº 30 – Grajaú  
👥 Companheiros: Cadu, Henrique R., Mariana  
🟢 Status: Agendada
${"```"}

> Se a visita já ocorreu, use “🟣 Status: Finalizada”.
> Se não encontrar nada, diga:  
> “Não encontrei nenhuma visita correspondente. Tente informar o nome do companheiro ou o local novamente.”

---

### 💬 Pergunta do usuário:
${question}
`;

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response.text();

      setAnswer(response);
    } catch (err) {
      console.error("Erro ao consultar Gemini:", err);
      setAnswer("⚠️ Não consegui obter resposta no momento. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* ===== Botão flutuante ===== */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-14 h-14 text-2xl shadow-lg hover:bg-blue-700 transition"
        title="Abrir chat inteligente"
      >
        💬
      </button>

      {/* ===== Janela de chat ===== */}
      {open && (
        <div className="fixed bottom-24 right-6 w-96 bg-white border shadow-xl rounded-lg overflow-hidden">
          <div className="bg-blue-600 text-white p-3 font-semibold flex justify-between items-center">
            <span>🤖 Chat Gemini</span>
            <button
              onClick={() => setOpen(false)}
              className="text-white hover:text-gray-300 font-bold text-lg"
              title="Fechar"
            >
              ✕
            </button>
          </div>

          <div className="p-3 max-h-64 overflow-y-auto text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
            {answer || "Faça uma pergunta sobre as visitas..."}
          </div>

          <div className="p-3 border-t bg-gray-50 flex">
            <input
              type="text"
              placeholder="Ex: Quem está agendado para 07/10?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 border rounded-l px-2 py-1 text-sm text-gray-800"
            />
            <button
              onClick={askGemini}
              disabled={loading}
              className="bg-blue-600 text-white px-3 py-1 rounded-r text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "..." : "Enviar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
