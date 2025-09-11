// app/api/estoque/por-tecnico/route.ts
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
    // 1. Encontra as localidades de técnicos que são filhas da região especificada
    const localidadesTecnicos = await prisma.localizacao.findMany({
      where: {
        parentId: regiaoId,
        tipo: 'TECNICO'
      },
      include: {
        User: { // Inclui o nome do usuário (técnico) vinculado à localidade
          select: { id: true, name: true }
        }
      }
    });

    if (localidadesTecnicos.length === 0) {
      return NextResponse.json([]); // Retorna vazio se não houver técnicos na região
    }

    const idsLocalidadesTecnicos = localidadesTecnicos.map(l => l.id);

    // 2. Agrupa os itens de estoque por localidade (técnico) e por produto, e conta a quantidade
    const agregacao = await prisma.itemEstoque.groupBy({
      by: ['localizacaoId', 'produtoId'], // Agrupa por esses dois campos
      where: {
        localizacaoId: {
          in: idsLocalidadesTecnicos
        }
      },
      _count: {
        id: true, // Conta a quantidade de itens em cada grupo
      },
      orderBy: {
        localizacaoId: 'asc',
      },
      take: 100, // Aplica o limite de 100 registros de agrupamento
    });

    // 3. Busca os nomes dos produtos para enriquecer o resultado
    const produtoIds = [...new Set(agregacao.map(a => a.produtoId))];
    const produtos = await prisma.produto.findMany({
      where: { id: { in: produtoIds } },
      select: { id: true, nome: true }
    });
    const produtosMap = new Map(produtos.map(p => [p.id, p.nome]));
    const localidadesMap = new Map(localidadesTecnicos.map(l => [l.id, l.User[0]?.name || l.nome]));

    // 4. Formata a resposta final no formato desejado
    const resultadoFinal = agregacao.reduce((acc, curr) => {
      const tecnicoNome = localidadesMap.get(curr.localizacaoId) || 'Técnico Desconhecido';
      
      // Encontra ou cria o objeto do técnico no acumulador
      let tecnicoEntry = acc.find(t => t.tecnicoNome === tecnicoNome);
      if (!tecnicoEntry) {
        tecnicoEntry = {
          tecnicoNome: tecnicoNome,
          produtos: []
        };
        acc.push(tecnicoEntry);
      }
      
      // Adiciona o produto e a quantidade ao técnico
      tecnicoEntry.produtos.push({
        produtoNome: produtosMap.get(curr.produtoId) || 'Produto Desconhecido',
        quantidade: curr._count.id
      });
      
      return acc;
    }, [] as { tecnicoNome: string, produtos: { produtoNome: string, quantidade: number }[] });

    return NextResponse.json(resultadoFinal);

  } catch (error) {
    console.error("Erro ao buscar estoque por técnico:", error);
    return NextResponse.json({ message: "Erro ao processar a solicitação" }, { status: 500 });
  }
}