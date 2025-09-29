const xlsx = require('xlsx');

// Função de leitura robusta, que ignora linhas em branco
function getSheetData(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    console.error(`\n❌ ERRO CRÍTICO: A planilha "${sheetName}" não foi encontrada no arquivo Excel.`);
    return null;
  }
  return xlsx.utils.sheet_to_json(sheet, { blankrows: false });
}

function normalizeText(text) {
    if (typeof text !== 'string') return '';
    return text.trim().toUpperCase();
}

function runDiagnostics() {
  try {
    console.log("--- INICIANDO SCRIPT DE DIAGNÓSTICO FINAL ---");
    const workbook = xlsx.readFile('dados_importacao.xlsx');

    // 1. Analisar a planilha GRUPO
    console.log("\n[ETAPA 1 de 3] Analisando a planilha 'GRUPO'...");
    const gruposData = getSheetData(workbook, 'GRUPO');
    if (!gruposData) return;

    const categoriasEncontradas = new Set(gruposData.map(item => normalizeText(item.GRUPO)));
    console.log(`✅ Categorias encontradas e normalizadas:`);
    console.log(Array.from(categoriasEncontradas));

    // 2. Analisar a planilha DASHBOARD
    console.log("\n[ETAPA 2 de 3] Analisando a planilha 'DASHBOARD'...");
    const dashboardData = getSheetData(workbook, 'DASHBOARD');
    if (!dashboardData || dashboardData.length === 0) {
        console.error("❌ ERRO: A planilha 'DASHBOARD' foi lida mas está vazia ou não contém dados.");
        return;
    }

    const primeiraLinha = dashboardData[0];
    const colunasDetectadas = Object.keys(primeiraLinha);
    console.log("✅ Colunas detectadas na planilha 'DASHBOARD':");
    console.log(colunasDetectadas);
    console.log("\nAVISO: Compare a lista acima com os nomes usados no script. O nome do produto DEVE estar nessa lista.");


    // 3. Simular a combinação dos dados das 5 primeiras linhas
    console.log("\n[ETAPA 3 de 3] Simulando a combinação de dados...");
    for (let i = 0; i < Math.min(dashboardData.length, 5); i++) {
        const item = dashboardData[i];
        console.log(`\n--- Analisando Linha ${i + 2} da Planilha DASHBOARD ---`);
        console.log("Dados brutos da linha:", item);

        // Tentativa de ler o produto com o nome que já tentamos
        const nomeProduto = item['PRODUTO /  OBJETO']?.trim(); // Nome com 2 espaços
        const nomeGrupo = item['GRUPO']?.trim();

        console.log(`> Tentando ler 'PRODUTO /  OBJETO': "${nomeProduto}"`);
        console.log(`> Tentando ler 'GRUPO': "${nomeGrupo}"`);

        if (!nomeProduto || !nomeGrupo) {
            console.log("🔴 [FALHA] Não foi possível ler o nome do produto ou do grupo nesta linha a partir dos nomes de coluna esperados.");
            continue;
        }

        const grupoNormalizado = normalizeText(nomeGrupo);
        if (categoriasEncontradas.has(grupoNormalizado)) {
            console.log(`🟢 [SUCESSO] O grupo "${nomeGrupo}" foi encontrado na lista de categorias.`);
        } else {
            console.log(`🔴 [FALHA] O grupo "${nomeGrupo}" (normalizado para "${grupoNormalizado}") NÃO FOI ENCONTRADO na lista de categorias.`);
        }
    }
    console.log("\n--- DIAGNÓSTICO FINALIZADO ---");
    console.log("Por favor, copie TODA a saída do terminal (desde o início) e cole na nossa conversa.");

  } catch (error) {
    console.error("\n💥 Ocorreu um erro inesperado durante o diagnóstico:", error);
  }
}

runDiagnostics();