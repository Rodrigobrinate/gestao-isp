// app/api/localidades/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Listar todas as localidades
export async function GET() {
  try {
    const localidades = await prisma.localizacao.findMany({
      orderBy: { nome: 'asc' },
    });
    return NextResponse.json(localidades);
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao buscar localidades' }, { status: 500 });
  }
}

// POST - Criar uma nova localidade
export async function POST(req: Request) {
  try {
    const { nome, descricao } = await req.json();
    if (!nome) {
      return NextResponse.json({ message: 'O nome é obrigatório' }, { status: 400 });
    }
    const novaLocalidade = await prisma.localizacao.create({
      data: { nome, descricao },
    });
    return NextResponse.json(novaLocalidade, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao criar localidade' }, { status: 500 });
  }
}