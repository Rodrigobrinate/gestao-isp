// app/api/solicitacoes/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Listar todas as solicitações
export async function GET() {
  const solicitacoes = await prisma.solicitacao.findMany({
    include: { produto: true, solicitante: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(solicitacoes);
}

// POST: Criar uma nova solicitação (Gerente Regional)
export async function POST(req: Request) {
  const { produtoId, quantidade, solicitanteId, observacao } = await req.json();
  const novaSolicitacao = await prisma.solicitacao.create({
    data: { produtoId, quantidade, solicitanteId, observacao },
  });
  return NextResponse.json(novaSolicitacao, { status: 201 });
}