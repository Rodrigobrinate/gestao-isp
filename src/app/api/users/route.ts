// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Lista todos os usuários
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { // Seleciona apenas campos seguros
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        name: 'asc'
      }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: "Erro ao buscar usuários" }, { status: 500 });
  }
}