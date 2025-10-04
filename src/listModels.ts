import "dotenv/config";
import fetch from "node-fetch";

async function listModels() {
  const apiKey = process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ Chave não encontrada. Verifique o arquivo .env");
    process.exit(1);
  }

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1/models?key=" + apiKey
    );

    if (!res.ok) {
      throw new Error(`Erro HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();

    console.log("📋 Modelos disponíveis na sua conta:");
    (data.models || []).forEach((m: any) => {
      console.log("→", m.name);
    });
  } catch (err: any) {
    console.error("❌ Erro ao listar modelos:", err.message);
  }
}

listModels();
