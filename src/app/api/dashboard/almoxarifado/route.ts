// app/api/dashboard/almoxarifado/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, TipoLocalizacao } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. Encontrar a localidade do almoxarifado principal (sede)
    const sede = await prisma.localizacao.findFirst({
      where: { tipo: TipoLocalizacao.ALMOXARIFADO },
    });
    if (!sede) throw new Error("Localização do Almoxarifado principal não encontrada.");

    // 2. Buscar e agrupar o estoque da sede
    const estoqueSede = await prisma.itemEstoque.groupBy({
      by: ['produtoId'],
      where: { localizacaoId: sede.id },
      _count: { id: true },
    });

    // 3. Buscar e agrupar o estoque de todas as outras regiões
    const estoqueRegioes = await prisma.itemEstoque.findMany({
      where: {
        localizacao: {
          tipo: TipoLocalizacao.REGIAO,
        },
      },
      select: {
        produto: { select: { nome: true } },
        localizacao: { select: { nome: true } },
      },
    });

    // 4. Buscar produtos próximos ao ponto de pedido (ex: estoque atual <= ponto de pedido do último mês)
    const produtos = await prisma.produto.findMany({
      select: { id: true, nome: true, pontoPedido1Mes: true },
    });

    const contagemEstoqueTotal = await prisma.itemEstoque.groupBy({
      by: ['produtoId'],
      _count: { id: true },
    });

    const alertasPontoPedido = produtos
      .map(p => {
        const estoqueAtual = contagemEstoqueTotal.find(e => e.produtoId === p.id)?._count.id || 0;
        return { ...p, estoqueAtual };
      })
      .filter(p => p.pontoPedido1Mes && p.estoqueAtual <= p.pontoPedido1Mes);
    
    // Preparar dados para o frontend
    const produtosMap = new Map(produtos.map(p => [p.id, p.nome]));
    const estoqueSedeFormatado = estoqueSede.map(item => ({
      nome: produtosMap.get(item.produtoId) || 'Produto desconhecido',
      quantidade: item._count.id,
    }));
    
    const estoqueRegioesAgrupado = estoqueRegioes.reduce((acc, item) => {
        const regiao = item.localizacao.nome;
        const produto = item.produto.nome;
        if (!acc[regiao]) acc[regiao] = {};
        acc[regiao][produto] = (acc[regiao][produto] || 0) + 1;
        return acc;
    }, {} as Record<string, Record<string, number>>);


    return NextResponse.json({
      estoqueSede: estoqueSedeFormatado,
      estoqueRegioes: estoqueRegioesAgrupado,
      alertasPontoPedido,
    });

  } catch (error: any) {
    console.error("Erro na API da Dashboard:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}