// app/api/categorias/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET - Listar todas as categorias
export async function GET() {
const session = await getServerSession(authOptions);
    //console.log(session)
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { nome: 'asc' },
      where: { holdingId: session.user.empresa.holdingId }
    })
    return NextResponse.json(categorias);
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao buscar categorias' }, { status: 500 });
  }
}

// POST - Criar uma nova categoria
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  try {
    const { nome, holdingId } = await req.json();
    if (!nome) {
      return NextResponse.json({ message: 'O nome é obrigatório' }, { status: 400 });
    }
    const novaCategoria = await prisma.categoria.create({
      data: { nome, holdingId: session.user.empresa.holdingId },
    });
    return NextResponse.json(novaCategoria, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: 'Erro ao criar categoria' }, { status: 500 });
  }
}

function auth() {
  throw new Error('Function not implemented.');
}
