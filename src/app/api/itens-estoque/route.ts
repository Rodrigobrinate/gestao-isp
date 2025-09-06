// app/api/itens-estoque/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Lista itens de estoque, podendo filtrar por status, localização, etc.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const regiaoId = searchParams.get('regiaoId'); // Novo filtro

  const whereClause: any = {};
  if (status) whereClause.status = status;

  // Se uma regiaoId for fornecida, busca itens nela e em suas localidades filhas
  if (regiaoId) {
    const localidadesDaRegiao = await prisma.localizacao.findMany({
      where: { parentId: regiaoId },
    });
    const idsLocalidades = [regiaoId, ...localidadesDaRegiao.map(l => l.id)];
    whereClause.localizacaoId = { in: idsLocalidades };
  }

  try {
    const itens = await prisma.itemEstoque.findMany({
      where: whereClause,
      include: { produto: true, localizacao: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(itens);
  } catch (error) {
    return NextResponse.json({ message: "Erro ao buscar itens de estoque" }, { status: 500 });
  }
}
