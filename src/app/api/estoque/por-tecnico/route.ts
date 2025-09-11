// app/api/estoque/por-tecnico/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, Prisma, Role } from '@prisma/client';

const prisma = new PrismaClient();

// Definindo o tipo do resultado que esperamos da nossa consulta SQL
type ResultadoRawQuery = {
  tecnico_nome: string;
  produto_nome: string;
  quantidade: BigInt; // Raw queries de contagem retornam BigInt
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const regiaoId = searchParams.get('regiaoId');

  if (!regiaoId) {
    return NextResponse.json({ message: "O ID da região é obrigatório." }, { status: 400 });
  }

  try {
    // 1. A consulta SQL crua
    // Esta query faz todo o trabalho:
    // - Junta as tabelas ItemEstoque, Produto, Localizacao e User.
    // - Filtra para pegar apenas usuários com role TECNICO cuja localização é "filha" da região do gerente.
    // - Agrupa por nome do técnico e nome do produto para a contagem.
    // - Limita o resultado a 100 grupos.
    const resultadoFlat: ResultadoRawQuery[] = await prisma.$queryRaw`
      SELECT
        u.name AS tecnico_nome,
        p.nome AS produto_nome,
        COUNT(ie.id) AS quantidade
      FROM "ItemEstoque" AS ie
      JOIN "Produto" AS p ON ie."produtoId" = p.id
      JOIN "Localizacao" AS l ON ie."localizacaoId" = l.id
      JOIN "User" AS u ON l.id = u."localizacaoId"
      WHERE
        l."parentId" = ${regiaoId} AND u.role = 'TECNICO'
      GROUP BY
        u.name, p.nome
      ORDER BY
        u.name ASC
      LIMIT 100;
    `;

    // 2. Formata o resultado plano da query em uma estrutura aninhada para o frontend
    const resultadoFinal = resultadoFlat.reduce((acc, curr) => {
      const tecnicoNome = curr.tecnico_nome || 'Técnico Não Identificado';
      
      let tecnicoEntry = acc.find(t => t.tecnicoNome === tecnicoNome);
      if (!tecnicoEntry) {
        tecnicoEntry = { tecnicoNome, produtos: [] };
        acc.push(tecnicoEntry);
      }
      
      tecnicoEntry.produtos.push({
        produtoNome: curr.produto_nome,
        quantidade: Number(curr.quantidade) // Converte BigInt para Number
      });
      
      return acc;
    }, [] as { tecnicoNome: string, produtos: { produtoNome: string, quantidade: number }[] });

    return NextResponse.json(resultadoFinal);

  } catch (error) {
    console.error("Erro ao buscar estoque por técnico (Raw Query):", error);
    return NextResponse.json({ message: "Erro ao processar a solicitação" }, { status: 500 });
  }
}