// app/api/itens-estoque/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const regiaoId = searchParams.get('regiaoId');
console.log("teste",regiaoId)

  if (!regiaoId) {
    return NextResponse.json({ message: "O ID da região é obrigatório." }, { status: 400 });
  }

  if (regiaoId == "almoxarifado"){



    try {
    // 1. Encontra o ID de todas as localidades que são filhas da região
    const localidadeId = await prisma.localizacao.findFirst({
      where: { tipo: 'ALMOXARIFADO' 
       },
      select: { id: true }
    });
    console.log(localidadeId)

    if (!localidadeId) {
        console.warn("Nenhuma localidade do tipo ALMOXARIFADO foi encontrada.");
        return NextResponse.json([]); // Retorna array vazio se não encontrar o almoxarifado
      }
    
    // 2. Cria uma lista de IDs que inclui a própria região + as filhas
    //const todosIdsDaRegiao = [regiaoId, ...localidadesFilhas.map(l => l.id)];

    // 3. Busca todos os itens que pertencem a qualquer uma dessas localidades
    const itens = await prisma.itemEstoque.findMany({
      where: {
        AND: [{ status: 'EM_ESTOQUE' },
        {localizacaoId: localidadeId?.id}]
      },
      include: {
        produto: true,
        localizacao: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(itens);
  } catch (error) {
    console.error("ERRO AO BUSCAR ITENS DE ESTOQUE:", error);
    return NextResponse.json({ message: "Erro ao buscar itens de estoque" }, { status: 500 });
  }
  }else {
  try {
    // 1. Encontra o ID de todas as localidades que são filhas da região
    const localidadesFilhas = await prisma.localizacao.findMany({
      where: { parentId: regiaoId },
      select: { id: true }
    });
    
    // 2. Cria uma lista de IDs que inclui a própria região + as filhas
    const todosIdsDaRegiao = [regiaoId, ...localidadesFilhas.map(l => l.id)];

    // 3. Busca todos os itens que pertencem a qualquer uma dessas localidades
    const itens = await prisma.itemEstoque.findMany({
      where: {
        AND: [{ status: 'EM_ESTOQUE' },
        {localizacaoId: { in: todosIdsDaRegiao }}]
      },
      include: {
        produto: true,
        localizacao: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(itens);
  } catch (error) {
    console.error("ERRO AO BUSCAR ITENS DE ESTOQUE:", error);
    return NextResponse.json({ message: "Erro ao buscar itens de estoque" }, { status: 500 });
  }
}
}