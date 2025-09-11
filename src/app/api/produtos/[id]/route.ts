// app/api/produtos/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT - Atualizar um produto
export async function PUT(req: Request, { params }: { params: any }) {
  try {
    //console.log(params.id)
    const { id } = await params;
    const body = await req.json();
const {
      id: bodyId, // renomeia para não conflitar com o id dos params
      createdAt,
      updatedAt,
      categoria, // remove o objeto aninhado
      ...dadosParaAtualizar // agrupa o resto dos campos
    } = body;
    // Converte os novos campos para números, caso venham como string do formulário
    const dataToUpdate = {
      ...dadosParaAtualizar ,
      tempoEntrega: body.tempoEntrega ? parseInt(body.tempoEntrega) : null,
      pontoPedido1Mes: body.pontoPedido1Mes ? parseInt(body.pontoPedido1Mes) : null,
      estoqueSeguranca1Mes: body.estoqueSeguranca1Mes ? parseInt(body.estoqueSeguranca1Mes) : null,
      pontoPedido12Meses: body.pontoPedido12Meses ? parseInt(body.pontoPedido12Meses) : null,
      estoqueSeguranca12Meses: body.estoqueSeguranca12Meses ? parseInt(body.estoqueSeguranca12Meses) : null,
    };

    const produtoAtualizado = await prisma.produto.update({
      where: { id },
      data: dataToUpdate,
    });
    return NextResponse.json(produtoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json({ message: 'Erro ao atualizar produto' }, { status: 500 });
  }
}

// DELETE - Apagar um produto
export async function DELETE(req: Request, { params }: { params: any }) {
  try {
    const { id } = params;
    await prisma.produto.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao apagar produto' }, { status: 500 });
  }
}