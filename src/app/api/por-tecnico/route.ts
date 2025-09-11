import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const regiaoId = searchParams.get('regiaoId');

  if (!regiaoId) {
    return NextResponse.json({ message: "O ID da região é obrigatório." }, { status: 400 });
  }

  try {
    // 1. Encontra as localidades de técnicos (e seus usuários) na região
    const localidadesTecnicos = await prisma.localizacao.findMany({
      where: {
        parentId: regiaoId,
        tipo: 'TECNICO'
      },
      include: {
        User: {
          select: { id: true, name: true }
        }
      }
    });

    if (localidadesTecnicos.length === 0) {
      return NextResponse.json([]);
    }

    const idsLocalidadesTecnicos = localidadesTecnicos.map(l => l.id);

    // 2. Agrupa itens por localidade e produto, sem limites
    const agregacao = await prisma.itemEstoque.groupBy({
      by: ['localizacaoId', 'produtoId'],
      where: {
        AND: [{ status: 'EM_ESTOQUE' },
        {localizacaoId: { in: idsLocalidadesTecnicos }}]
      },
      _count: {
        id: true,
      },
      // CORREÇÃO 1: Removido o `take: 100` para garantir que todos os dados sejam processados
    });

    // 3. Busca informações de produtos para enriquecer os dados
    const produtoIds = [...new Set(agregacao.map(a => a.produtoId))];
    const produtos = await prisma.produto.findMany({
      where: { id: { in: produtoIds } },
      select: { id: true, nome: true }
    });
    const produtosMap = new Map(produtos.map(p => [p.id, p.nome]));

    // CORREÇÃO 2: A lógica de formatação foi reescrita para ser mais robusta,
    // usando um Map com o ID da localização como chave única, em vez do nome do técnico.
    const resultadoMap = new Map<string, any>();

    for (const item of agregacao) {
      const { localizacaoId, produtoId, _count } = item;

      // Se o técnico (baseado no localizacaoId) ainda não está no mapa, adiciona-o.
      if (!resultadoMap.has(localizacaoId)) {
        const localidadeInfo = localidadesTecnicos.find(l => l.id === localizacaoId);
        resultadoMap.set(localizacaoId, {
          tecnicoId: localidadeInfo?.User[0]?.id || localizacaoId,
          tecnicoNome: localidadeInfo?.User[0]?.name || localidadeInfo?.nome || 'Técnico Desconhecido',
          produtos: []
        });
      }

      // Adiciona o produto ao técnico correspondente no mapa
      resultadoMap.get(localizacaoId).produtos.push({
        produtoId: produtoId,
        produtoNome: produtosMap.get(produtoId) || 'Produto Desconhecido',
        quantidade: _count.id
      });
    }

    // Converte o mapa de resultados em um array para a resposta JSON
    const resultadoFinal = Array.from(resultadoMap.values());

    return NextResponse.json(resultadoFinal);

  } catch (error) {
    console.error("Erro ao buscar estoque por técnico:", error);
    return NextResponse.json({ message: "Erro ao processar a solicitação" }, { status: 500 });
  }
}

