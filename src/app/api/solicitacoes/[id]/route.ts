// app/api/solicitacoes/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT: Atualizar status (Aprovar/Rejeitar - Almoxarifado)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { status } = await req.json();
  const solicitacao = await prisma.solicitacao.update({
    where: { id: params.id },
    data: { status },
  });
  return NextResponse.json(solicitacao);
}