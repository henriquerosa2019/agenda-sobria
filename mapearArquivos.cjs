/**
 * Script: mapearArquivos.js
 * Função: listar todos os arquivos .ts, .tsx, .js e .jsx da pasta src,
 * correlacionando nomes e caminhos para gerar um relatório mapa.txt
 */

const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "src");
const outputFile = path.join(__dirname, "mapa.txt");

// Função recursiva para percorrer a pasta src
function listarArquivos(dir, lista = []) {
  const itens = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of itens) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      listarArquivos(fullPath, lista);
    } else if (/\.(ts|tsx|js|jsx)$/.test(item.name)) {
      const relPath = path.relative(rootDir, fullPath);
      lista.push(relPath);
    }
  }
  return lista;
}

// Cria o relatório
function gerarMapa() {
  if (!fs.existsSync(rootDir)) {
    console.error("❌ Pasta src não encontrada. Coloque este script na raiz do projeto.");
    return;
  }

  const arquivos = listarArquivos(rootDir);
  if (arquivos.length === 0) {
    console.warn("⚠️ Nenhum arquivo .ts, .tsx, .js ou .jsx encontrado em src/");
  }

  const conteudo = [
    "===========================",
    " MAPA DE ARQUIVOS DO PROJETO AGENDA-SOBRIA ",
    "===========================\n",
    ...arquivos.map((a) => `📄 ${a}`),
  ].join("\n");

  fs.writeFileSync(outputFile, conteudo, "utf8");
  console.log(`✅ Mapa gerado com sucesso: ${outputFile}`);
}

// Executar
gerarMapa();
