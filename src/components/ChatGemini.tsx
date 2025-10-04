import { useState, useEffect } from "react";
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
    setAnswer("Pensando...");

    try {
      // 🔹 Obter dados reais do Supabase
      const { data: visits } = await supabase
        .from("visits")
        .select(`id, date, time, locations(name, address), visit_companions(companions(name))`);

      // Criar contexto para o modelo
      const context = JSON.stringify(visits, null, 2);

      // 🔹 Prompt para o Gemini
      const prompt = `
      Você é um assistente de agenda de visitas de AA.
      Responda à pergunta do usuário com base nas visitas abaixo.
      Use datas, horários, locais e nomes dos companheiros para responder.
      
      VISITAS:
      ${context}

      PERGUNTA DO USUÁRIO:
      ${question}
      `;

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response.text();

      setAnswer(response);
    } catch (err) {
      console.error("Erro ao consultar Gemini:", err);
      setAnswer("⚠️ Não consegui obter resposta no momento.");
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
          <div className="bg-blue-600 text-white p-3 font-semibold">🤖 Chat Gemini</div>
          <div className="p-3 max-h-64 overflow-y-auto text-gray-800 text-sm whitespace-pre-wrap">
            {answer || "Faça uma pergunta sobre as visitas..."}
          </div>

          <div className="p-3 border-t bg-gray-50 flex">
            <input
              type="text"
              placeholder="Ex: Quem está agendado para 07/10?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 border rounded-l px-2 py-1 text-sm"
            />
            <button
              onClick={askGemini}
              disabled={loading}
              className="bg-blue-600 text-white px-3 py-1 rounded-r text-sm"
            >
              {loading ? "..." : "Enviar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
