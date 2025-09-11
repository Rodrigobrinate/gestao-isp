// app/api/itens-estoque/[id]/instalar/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT: Marca um item como INSTALADO
export async function PUT(req: Request, { params }: { params: any }) {
  try {
    const { id } = await params;

    const updatedItem = await prisma.itemEstoque.update({
      where: { id },
      data: {
        status: 'INSTALADO', // Muda o status do item
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Erro ao instalar item:", error);
    return NextResponse.json({ message: 'Erro ao registrar instalação' }, { status: 500 });
  }
}