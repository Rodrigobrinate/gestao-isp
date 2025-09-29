const xlsx = require('xlsx');

function verificarColunas() {
  try {
    console.log("🔍 Lendo o arquivo 'dados_importacao.xlsx'...");
    const workbook = xlsx.readFile('dados_importacao.xlsx');

    const sheetName = 'DASHBOARD';
    console.log(`\n📄 Acessando a planilha: '${sheetName}'...`);
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      console.error(`❌ ERRO: A planilha '${sheetName}' não foi encontrada! Verifique o nome da aba no seu arquivo Excel.`);
      return;
    }

    console.log("\n✅ Planilha encontrada. Convertendo as primeiras linhas para análise...");
    // Converte a planilha para um objeto JSON, pegando apenas as 2 primeiras linhas de dados
    const jsonData = xlsx.utils.sheet_to_json(sheet, { range: 'A1:Z2' });

    if (jsonData.length === 0) {
        console.error("❌ ERRO: A planilha 'DASHBOARD' parece estar vazia ou as primeiras linhas não contêm dados.");
        return;
    }

    // Pega o primeiro objeto de dados, que representa a primeira linha
    const primeiraLinhaDeDados = jsonData[0];

    console.log("\n--- COLUNAS DETECTADAS (CHAVES DO OBJETO) ---");
    // Imprime todas as chaves (nomes das colunas) que a biblioteca encontrou
    console.log(Object.keys(primeiraLinhaDeDados));

    console.log("\n--- DADOS COMPLETOS DA PRIMEIRA LINHA ---");
    // Imprime o objeto inteiro da primeira linha para vermos os valores
    console.log(primeiraLinhaDeDados);

    console.log("\n\n--- ANÁLISE ---");
    console.log("Por favor, copie TODA esta saída (desde '🔍 Lendo o arquivo...') e cole aqui na conversa.");
    console.log("Com isso, teremos o nome EXATO das colunas para usar no script final.");

  } catch (error) {
    console.error("\n💥 Ocorreu um erro ao tentar ler o arquivo:", error);
  }
}

verificarColunas();