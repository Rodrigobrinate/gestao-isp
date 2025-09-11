import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';

import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET: Lista usuários com base no cargo de quem pede
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  // @ts-ignore
  const userRole = session.user.role;
  // @ts-ignore
  const userLocalizacao = session.user.localizacao;

  try {
    let whereClause: any = {};

    // Se o usuário for um Gerente Regional, filtre os técnicos da sua região.
    if (userRole === Role.GERENTE_REGIONAL) {
      if (!userLocalizacao?.id) {
        // Se o gerente não tem região, ele não pode ver nenhum técnico.
        return NextResponse.json([]); 
      }
      
      // Busca os IDs das localidades que são "filhas" da região do gerente
      const localidadesDaRegiao = await prisma.localizacao.findMany({
        where: { parentId: userLocalizacao.id }, // Este campo será reconhecido após o 'prisma generate'
        select: { id: true },
      });
      const idsDasLocalidadesFilhas = localidadesDaRegiao.map(l => l.id);

      whereClause = {
        role: Role.TECNICO,
        localizacaoId: {
          in: idsDasLocalidadesFilhas,
        },
      };
    } 
    // Se não for Admin, não pode listar ninguém (exceto a regra do gerente acima).
    else if (userRole !== Role.ADMIN) {
        return NextResponse.json([]); // Retorna array vazio em vez de erro
    }
    // Se for ADMIN, o whereClause fica vazio {}, buscando todos os usuários.

    const users = await prisma.user.findMany({
      where: whereClause,
      include: { localizacao: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(users);

  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json({ message: 'Erro interno ao buscar usuários' }, { status: 500 });
  }
}


// POST: Cria um novo usuário
// app/api/users/route.ts

// ... (mantenha a função GET como está)

// POST: Cria um novo usuário (VERSÃO CORRIGIDA)
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, username, role, localizacaoId } = body;

        // Validação 1: Verifica se os campos essenciais existem
        if (!name || !username || !role || !localizacaoId) {
            return NextResponse.json({ message: 'Todos os campos são obrigatórios.' }, { status: 400 });
        }

        // Validação 2: Verifica se o cargo enviado é um cargo válido no nosso Enum
        if (!Object.values(Role).includes(role as Role)) {
            return NextResponse.json({ message: `O cargo '${role}' é inválido.` }, { status: 400 });
        }

        // Validação 3: Verifica se username já existe
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            return NextResponse.json({ message: 'Nome de usuário já existe.' }, { status: 409 });
        }

        const newUser = await prisma.user.create({
            data: {
                name,
                username,
                role, // Prisma vai entender a string se ela for um valor válido do Enum
                localizacaoId,
            },
        });

        // Retorna o usuário sem a senha
        const { password, ...userWithoutPassword } = newUser;
        return NextResponse.json(userWithoutPassword, { status: 201 });

    } catch (error) {
        // Log de erro aprimorado para o terminal
        console.error("ERRO DETALHADO AO CRIAR USUÁRIO:", error);
        return NextResponse.json({ message: 'Erro interno ao criar usuário. Verifique os logs do servidor.' }, { status: 500 });
    }
}