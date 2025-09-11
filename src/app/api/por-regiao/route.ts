// app/api/solicitacoes/por-regiao/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// A função precisa ser exportada e se chamar GET
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const regiaoId = searchParams.get('regiaoId');

  if (!regiaoId) {
    return NextResponse.json({ message: 'O ID da região é obrigatório.' }, { status: 400 });
  }

  try {
    const solicitacoes = await prisma.solicitacao.findMany({
      where: {
        solicitante: {
          role: Role.TECNICO,
          localizacao: {
            parentId: regiaoId,
          },
        },
      },
      include: {
        produto: true,
        solicitante: {
          select: { name: true, role: true }
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(solicitacoes);
  } catch (error) {
    console.error("Erro ao buscar solicitações por região:", error);
    return NextResponse.json({ message: "Erro ao buscar solicitações" }, { status: 500 });
  }
}