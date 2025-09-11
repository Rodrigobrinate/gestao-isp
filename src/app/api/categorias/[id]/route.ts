import { NextRequest, NextResponse } from 'next/server';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Rota para deletar uma categoria específica pelo seu ID.
 * A exclusão só é permitida se não houver produtos vinculados à categoria.
 *
 * @param req Request - Objeto da requisição (não utilizado diretamente).
 * @param params - Contém o `id` da categoria a ser deletada, vindo da URL.
 */
//@ts-ignore
export async function DELETE(
  req: NextRequest,
  { params }: { params: any }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { message: 'O ID da categoria é obrigatório.' },
      { status: 400 }
    );
  }

  try {
    // 1. Verificar se existem produtos vinculados a esta categoria
    const produtosVinculados = await prisma.produto.count({
      where: {
        categoriaId: id,
      },
    });

    // 2. Se houver produtos, retornar um erro de conflito
    if (produtosVinculados > 0) {
      return NextResponse.json(
        {
          message: `Não é possível excluir a categoria, pois existem ${produtosVinculados} produtos vinculados a ela.`,
        },
        { status: 409 } // 409 Conflict é um status apropriado para esta situação
      );
    }

    // 3. Se não houver produtos, proceder com a exclusão
    await prisma.categoria.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json(
      { message: 'Categoria excluída com sucesso.' },
      { status: 200 }
    );
  } catch (error: any) {
    // Trata erros como "categoria não encontrada" ou falhas de banco de dados
    console.error('Erro ao deletar categoria:', error);

    // O Prisma lança um erro específico se o registro a ser deletado não for encontrado
    if (error.code === 'P2025') {
       return NextResponse.json(
        { message: 'Erro: Categoria não encontrada.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Ocorreu um erro interno no servidor.' },
      { status: 500 }
    );
  }
}
