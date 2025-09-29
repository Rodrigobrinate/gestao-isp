const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');

const prisma = new PrismaClient();

function getSheetData(workbook, sheetName) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
        throw new Error(`ERRO CRÍTICO: A planilha "${sheetName}" não foi encontrada.`);
    }
    return xlsx.utils.sheet_to_json(sheet, { blankrows: false });
}

function normalizeText(text) {
    if (typeof text !== 'string') return '';
    return text.trim().toUpperCase();
}

async function main() {
  console.log('🚀 Iniciando a importação dos dados...');
  const workbook = xlsx.readFile('dados_importacao.xlsx');

  const gruposData = getSheetData(workbook, 'GRUPO');
  const dashboardData = getSheetData(workbook, 'DASHBOARD');
  const dadosData = getSheetData(workbook, 'DADOS');

  // --- 1. Cadastrar Categorias ---
  console.log('\n1. Cadastrando categorias...');
  const categoriasUnicas = [...new Set(gruposData.map(item => item.GRUPO?.trim()).filter(Boolean))];
  for (const nomeCategoria of categoriasUnicas) {
    await prisma.categoria.upsert({ where: { nome: nomeCategoria }, update: {}, create: { nome: nomeCategoria } });
  }
  const categoriasMap = (await prisma.categoria.findMany()).reduce((acc, cat) => {
    acc[normalizeText(cat.nome)] = cat.id;
    return acc;
  }, {});
  console.log(`✅ ${Object.keys(categoriasMap).length} categorias cadastradas/verificadas.`);

  // --- 2. Cadastrar Usuários ---
  console.log('\n2. Cadastrando usuários...');
  const responsaveis = [...new Set(dadosData.map(item => item.RESPONSÁVEL?.trim()).filter(Boolean))];
  const tecnicos = [...new Set(dadosData.map(item => item.TÉCNICO?.trim()).filter(Boolean))];
  const usuariosUnicos = [...new Set([...responsaveis, ...tecnicos])];
  for (const nomeUsuario of usuariosUnicos) {
    let role = 'TECNICO';
    if (nomeUsuario.toUpperCase() === 'ERVEN') role = 'ALMOXARIFADO';
    await prisma.user.upsert({ where: { username: nomeUsuario }, update: { name: nomeUsuario, role: role }, create: { name: nomeUsuario, username: nomeUsuario, role: role } });
  }
  const usuariosMap = (await prisma.user.findMany()).reduce((acc, user) => { acc[user.name] = { id: user.id, role: user.role }; return acc; }, {});
  console.log(`✅ ${Object.keys(usuariosMap).length} usuários cadastrados/verificados.`);

  // --- 3. Cadastrar Localizações ---
  console.log('\n3. Cadastrando localizações...');
  const almoxarifadoCentral = await prisma.localizacao.upsert({ where: { nome: 'Almoxarifado Central' }, update: {}, create: { nome: 'Almoxarifado Central', tipo: 'ALMOXARIFADO' } });
  const cidadesUnicas = [...new Set(dadosData.map(item => item.CIDADE?.trim()).filter(Boolean))];
  for (const nomeCidade of cidadesUnicas) {
      await prisma.localizacao.upsert({ where: { nome: nomeCidade }, update: { tipo: 'REGIAO' }, create: { nome: nomeCidade, tipo: 'REGIAO' } });
  }
  const tecnicoParaRegiaoMap = {};
  for (const mov of dadosData) {
      const tecnico = mov.TÉCNICO?.trim();
      const cidade = mov.CIDADE?.trim();
      if (tecnico && cidade && !tecnicoParaRegiaoMap[tecnico]) tecnicoParaRegiaoMap[tecnico] = cidade;
  }
  const allLocations = await prisma.localizacao.findMany();
  let localizacoesMap = allLocations.reduce((acc, loc) => { acc[loc.nome] = loc.id; return acc; }, {});
  for (const nomeUsuario of Object.keys(usuariosMap)) {
      if (usuariosMap[nomeUsuario].role === 'TECNICO') {
          const nomeRegiao = tecnicoParaRegiaoMap[nomeUsuario];
          const regiaoId = nomeRegiao ? localizacoesMap[nomeRegiao] : null;
          const nomeLocalizacaoTecnico = `Estoque - ${nomeUsuario}`;
          const localizacaoTecnico = await prisma.localizacao.upsert({ where: { nome: nomeLocalizacaoTecnico }, update: { parentId: regiaoId }, create: { nome: nomeLocalizacaoTecnico, tipo: 'TECNICO', parentId: regiaoId } });
          await prisma.user.update({ where: { id: usuariosMap[nomeUsuario].id }, data: { localizacaoId: localizacaoTecnico.id } });
          localizacoesMap[nomeLocalizacaoTecnico] = localizacaoTecnico.id;
      }
  }
  console.log(`✅ ${Object.keys(localizacoesMap).length} localizações cadastradas/verificadas.`);

  // --- 4. Cadastrar Produtos ---
  console.log('\n4. Cadastrando produtos...');
  let produtosCadastrados = 0;
  for (const item of dashboardData) {
    // CORREÇÃO DEFINITIVA: Lendo os nomes de coluna que a biblioteca detectou
    const nomeProduto = item['__EMPTY_1']?.trim();
    const nomeGrupo = item['__EMPTY']?.trim();
    
    // Ignora a linha de cabeçalho que foi lida como dados
    if (nomeProduto === 'PRODUTO / OBJETO' || !nomeProduto) {
        continue;
    }

    const categoriaId = categoriasMap[normalizeText(nomeGrupo)];
    
    if (!categoriaId) {
        console.warn(`⚠️ AVISO: Categoria "${nomeGrupo}" para o produto "${nomeProduto}" não encontrada. Pulando.`);
        continue;
    }

    await prisma.produto.upsert({
        where: { nome: nomeProduto }, 
        update: {}, 
        create: {
            nome: nomeProduto, 
            categoriaId: categoriaId, 
            tipo: 'QUANTIDADE',
        },
    });
    produtosCadastrados++;
  }
  console.log(`✅ ${produtosCadastrados} produtos foram cadastrados/verificados.`);

  // --- 5 & 6. Estoque e Movimentações (O restante do script continua igual) ---
  const produtosMap = (await prisma.produto.findMany()).reduce((acc, p) => { acc[p.nome] = p.id; return acc; }, {});

  console.log('\n5. Cadastrando estoque inicial...');
  for (const item of dashboardData) {
    const nomeProduto = item['__EMPTY_1']?.trim();
    const produtoId = produtosMap[nomeProduto];
    const quantidade = item['30'] || 0; // Coluna '30' contém 'QTD EM ESTOQUE'
    
    if (!produtoId || !quantidade || typeof quantidade !== 'number' || quantidade <= 0) continue;
    
    console.log(`  -> Adicionando ${quantidade} unidades de "${nomeProduto}"...`);
    const itemsParaCriar = Array.from({ length: quantidade }, () => ({ produtoId: produtoId, localizacaoId: almoxarifadoCentral.id, condicao: 'NOVO', status: 'EM_ESTOQUE' }));
    const batchSize = 500;
    for (let i = 0; i < itemsParaCriar.length; i += batchSize) {
        const batch = itemsParaCriar.slice(i, i + batchSize);
        await prisma.itemEstoque.createMany({ data: batch, skipDuplicates: true });
    }
  }
  console.log('✅ Estoque inicial cadastrado.');

  console.log('\n6. Importando movimentações históricas...');
  // ... o restante do script continua ...

}

main()
  .catch((e) => {
    console.error('❌ Ocorreu um erro fatal durante a importação:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('\n✨ Importação finalizada!');
  });