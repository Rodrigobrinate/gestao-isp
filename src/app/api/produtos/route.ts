// app/api/produtos/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Listar todos os produtos (sem alteração)
export async function GET() {
  try {
    const produtos = await prisma.produto.findMany({
      include: { categoria: { select: { nome: true } } },
      orderBy: { nome: 'asc' },
    });
    return NextResponse.json(produtos);
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao buscar produtos' }, { status: 500 });
  }
}

// POST - Criar um novo produto (CÓDIGO CORRIGIDO)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // CORREÇÃO: Converte os novos campos para números ou null antes de salvar
    // Isso evita o erro quando os campos estão vazios no formulário
    const dataToCreate = {
      ...body,
      tempoEntrega: body.tempoEntrega ? parseInt(body.tempoEntrega) : null,
      pontoPedido1Mes: body.pontoPedido1Mes ? parseInt(body.pontoPedido1Mes) : null,
      estoqueSeguranca1Mes: body.estoqueSeguranca1Mes ? parseInt(body.estoqueSeguranca1Mes) : null,
      pontoPedido12Meses: body.pontoPedido12Meses ? parseInt(body.pontoPedido12Meses) : null,
      estoqueSeguranca12Meses: body.estoqueSeguranca12Meses ? parseInt(body.estoqueSeguranca12Meses) : null,
    };

    const novoProduto = await prisma.produto.create({
      data: dataToCreate,
    });
    return NextResponse.json(novoProduto, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return NextResponse.json({ message: 'Erro ao criar produto' }, { status: 500 });
  }
}