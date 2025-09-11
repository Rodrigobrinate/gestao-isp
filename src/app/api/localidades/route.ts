// app/api/localidades/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET: Retorna localidades baseadas no cargo
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  
  // @ts-ignore
  const userRole = session.user.role;
  // @ts-ignore
  const userLocalizacao = session.user.localizacao;

  try {
    let whereClause: any = {};
    if (userRole === Role.GERENTE_REGIONAL) {
      // Gerente vê apenas sua região e seus filhos (técnicos)
      whereClause = {
        OR: [
          { id: userLocalizacao?.id },
          { parentId: userLocalizacao?.id }
        ]
      };
    }
    // Admin/Almoxarifado veem tudo (whereClause vazia)

    const localidades = await prisma.localizacao.findMany({ 
      where: {tipo: 'REGIAO'},
      include: { User: { select: { name: true }}} 
    });
    return NextResponse.json(localidades);
  } catch (error) {
    return NextResponse.json({ message: "Erro ao buscar localidades" }, { status: 500 });
  }
}

// POST: Cria localidades com base no cargo
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });

  const { nome, tipo } = await req.json();
  // @ts-ignore
  const userRole = session.user.role;
  // @ts-ignore
  const userLocalizacao = session.user.localizacao;

  try {
    if (userRole === Role.ADMIN || userRole === Role.ALMOXARIFADO) {
      // Admins/Almoxarifado SÓ PODEM criar REGIÕES
      if (tipo !== 'REGIAO') return NextResponse.json({ message: 'Permissão para criar apenas REGIOES.' }, { status: 403 });
      const novaLocalidade = await prisma.localizacao.create({
        data: { nome, tipo: 'REGIAO' }
      });
      return NextResponse.json(novaLocalidade, { status: 201 });
    }

    if (userRole === Role.GERENTE_REGIONAL) {
      // Gerentes SÓ PODEM criar localidades de TÉCNICOS dentro da sua própria região
      if (tipo !== 'TECNICO') return NextResponse.json({ message: 'Permissão para criar apenas localidades de TÉCNICO.' }, { status: 403 });
      if (!userLocalizacao?.id) return NextResponse.json({ message: 'Gerente não associado a uma região.' }, { status: 400 });
      
      const novaLocalidade = await prisma.localizacao.create({
        data: {
          nome,
          tipo: 'TECNICO',
          parentId: userLocalizacao.id // O vínculo é forçado pelo backend
        }
      });
      return NextResponse.json(novaLocalidade, { status: 201 });
    }

    return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });

  } catch (error) {
    return NextResponse.json({ message: "Erro ao criar localidade" }, { status: 500 });
  }
}