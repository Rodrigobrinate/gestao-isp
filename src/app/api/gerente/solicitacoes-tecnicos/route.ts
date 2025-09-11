// app/api/gerente/solicitacoes-tecnicos/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET: Busca exclusivamente as solicitações de técnicos para a visão do gerente
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const userRole = session?.user?.role;
  // @ts-ignore
  const userLocalizacao = session?.user?.localizacao;

  if (!session || (userRole !== Role.GERENTE_REGIONAL && userRole !== Role.ADMIN)) {
    return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
  }

  const regiaoId = userLocalizacao?.id;

  if (!regiaoId) {
    return NextResponse.json({ message: 'Gerente não está vinculado a uma região.' }, { status: 400 });
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
        status: 'PENDENTE', // Gerente só precisa ver as pendentes nesta tela
      },
      include: {
        produto: true,
        solicitante: {
          select: { name: true, id: true}
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(solicitacoes);
  } catch (error) {
    console.error("Erro ao buscar solicitações de técnicos:", error);
    return NextResponse.json({ message: "Erro ao buscar solicitações" }, { status: 500 });
  }
}