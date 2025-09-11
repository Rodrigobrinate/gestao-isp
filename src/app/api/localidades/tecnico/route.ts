import { NextResponse } from 'next/server';
import { PrismaClient, TipoLocalizacao } from '@prisma/client';
import { getServerSession } from 'next-auth';
//import { authOptions } from '../auth/[...nextauth]/route';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

/**
 * Rota GET para buscar e retornar localidades do tipo 'TECNICO'
 * que pertencem à região do gerente regional logado.
 *
 * @param req Objeto da requisição (não utilizado diretamente).
 * @returns Uma lista de localidades de técnicos ou uma mensagem de erro.
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Validação de autenticação
    if (!session?.user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    // 2. Obter a localização do usuário da sessão
    // @ts-ignore - Supõe que o objeto de usuário na sessão contém a localização
    const userLocalizacao = session.user.localizacao;

    // 3. Validar se o usuário (gerente) tem uma localização associada
    if (!userLocalizacao || !userLocalizacao.id) {
      return NextResponse.json(
        { message: 'Usuário gerente não está associado a nenhuma região.' },
        { status: 400 } // Bad Request
      );
    }

    const parentId = userLocalizacao.id;

    // 4. Busca no banco de dados usando o ID da localização do gerente como parentId
    const localidadesTecnicos = await prisma.localizacao.findMany({
      where: {
        tipo: TipoLocalizacao.TECNICO, // Critério 1: O tipo deve ser TECNICO
        parentId: parentId,             // Critério 2: O parentId é o da região do gerente
      },
      include: {
        // Inclui o nome do usuário associado a cada localidade para referência
        User: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        nome: 'asc' // Ordena os resultados por nome em ordem alfabética
      }
    });

    return NextResponse.json(localidadesTecnicos, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar localidades de técnicos:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar localidades do tipo técnico' },
      { status: 500 }
    );
  }
}

