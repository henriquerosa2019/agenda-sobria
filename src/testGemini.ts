import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash"; // ✅ modelo confirmado via listModels

async function testGemini() {
  if (!API_KEY) {
    console.error("❌ ERRO: VITE_GEMINI_API_KEY não encontrada no .env");
    process.exit(1);
  }

  console.log("✅ Chave carregada com sucesso:", API_KEY.slice(0, 10) + "...");

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = "Resuma em uma frase o propósito de um grupo de serviço de AA.";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("💬 Resposta do Gemini:", response.text());
  } catch (err: any) {
    console.error("❌ Erro ao testar Gemini:", err);
  }
}

testGemini();
