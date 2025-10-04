import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ Chave da API Gemini não encontrada (.env)");
}

export const genAI = new GoogleGenerativeAI(apiKey);

export async function askGemini(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err: any) {
    console.error("Erro ao gerar resposta Gemini:", err);
    return "⚠️ Ocorreu um erro ao consultar o Gemini.";
  }
}
