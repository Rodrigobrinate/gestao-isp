// app/api/categorias/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Listar todas as categorias
export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { nome: 'asc' },
    });
    return NextResponse.json(categorias);
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao buscar categorias' }, { status: 500 });
  }
}

// POST - Criar uma nova categoria
export async function POST(req: Request) {
  try {
    const { nome } = await req.json();
    if (!nome) {
      return NextResponse.json({ message: 'O nome é obrigatório' }, { status: 400 });
    }
    const novaCategoria = await prisma.categoria.create({
      data: { nome },
    });
    return NextResponse.json(novaCategoria, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao criar categoria' }, { status: 500 });
  }
}