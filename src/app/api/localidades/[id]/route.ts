// app/api/localidades/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// Garante que o gerente só possa alterar localidades da sua região
async function checkManagerPermission(session: any, localizacaoId: string) {
  // @ts-ignore
  const userRole = session.user.role;
  // @ts-ignore
  const userLocalizacao = session.user.localizacao;
  
  if (userRole !== Role.GERENTE_REGIONAL) return true; // Se não for gerente, não aplica esta regra

  const localizacao = await prisma.localizacao.findUnique({ where: { id: localizacaoId } });
  
  // A permissão é válida se o parentId da localidade for o ID da região do gerente
  return localizacao?.parentId === userLocalizacao?.id;
}


export async function PUT(req: Request, { params }: { params: any }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });

  const hasPermission = await checkManagerPermission(session, params.id);
  if (!hasPermission) return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });

  try {
    const { nome } = await req.json();
    const updatedLocalidade = await prisma.localizacao.update({
      where: { id: params.id },
      data: { nome },
    });
    return NextResponse.json(updatedLocalidade);
  } catch (error) {
    return NextResponse.json({ message: "Erro ao atualizar localidade" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: any }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });

  const hasPermission = await checkManagerPermission(session, params.id);
  if (!hasPermission) return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });

  try {
    await prisma.localizacao.delete({ where: { id: params.id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ message: "Erro ao deletar localidade" }, { status: 500 });
  }
}