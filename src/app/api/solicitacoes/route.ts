// app/api/solicitacoes/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import { getServerSession } from 'next-auth'; // <<--- LINHA FALTANTE
import { authOptions } from '../auth/[...nextauth]/route';

//função unstable getServerSession substituída por getServerSession


const prisma = new PrismaClient();

// GET: Lista solicitações com base no cargo de quem pede
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const solicitanteId = searchParams.get('solicitanteId');
  const status = searchParams.get('status');

  try {
    const whereClause: any = {};
    
    // @ts-ignore
    const userRole = session.user.role;
    // @ts-ignore
    const userLocalizacao = session.user.localizacao;

    if (userRole === Role.ADMIN || userRole === Role.ALMOXARIFADO) {
      whereClause.solicitante = { role: Role.GERENTE_REGIONAL };
      if(status) whereClause.status = status; // Adiciona filtro de status para admin/almox.
    }
    else if (userRole === Role.GERENTE_REGIONAL) {
      whereClause.solicitante = {
        role: Role.TECNICO,
        localizacao: { parentId: userLocalizacao?.id },
      };
    }
    
    if (solicitanteId) {
      whereClause.solicitanteId = solicitanteId;
    }

    const solicitacoes = await prisma.solicitacao.findMany({
      where: whereClause,
      include: {
        produto: true,
        solicitante: {
          select: { id: true, name: true, role: true }
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(solicitacoes);
  } catch (error) {
    console.error("Erro ao buscar solicitações:", error);
    return NextResponse.json({ message: "Erro ao buscar solicitações" }, { status: 500 });
  }
}

// POST: Cria uma nova solicitação
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    try {
        const { produtoId, quantidade, solicitanteId, observacao } = await req.json();
        const novaSolicitacao = await prisma.solicitacao.create({
            data: { produtoId, quantidade, solicitanteId, observacao },
        });
        return NextResponse.json(novaSolicitacao, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar solicitação:", error);
        return NextResponse.json({ message: 'Erro ao criar solicitação' }, { status: 500 });
    }
}