// app/api/localidades/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT - Atualizar uma localidade
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { nome, descricao } = await req.json();
    const localidadeAtualizada = await prisma.localizacao.update({
      where: { id },
      data: { nome, descricao },
    });
    return NextResponse.json(localidadeAtualizada);
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao atualizar localidade' }, { status: 500 });
  }
}

// DELETE - Apagar uma localidade
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // VERIFICAÇÃO DE SEGURANÇA: Não apagar se houver itens na localidade
    const itemsNaLocalidade = await prisma.itemEstoque.count({
      where: { localizacaoId: id },
    });

    if (itemsNaLocalidade > 0) {
      return NextResponse.json(
        { message: 'Não é possível apagar. Existem itens de estoque nesta localidade.' },
        { status: 409 } // 409 Conflict
      );
    }
    
    await prisma.localizacao.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao apagar localidade.' }, { status: 500 });
  }
}