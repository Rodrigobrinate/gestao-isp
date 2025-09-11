// app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// PUT: Atualiza um usuário existente
export async function PUT(req: Request, { params }: { params: any }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });

  // @ts-ignore
  const userRole = session.user.role;
  // @ts-ignore
  const userLocalizacao = session.user.localizacao;

  try {
    const { id } = await params;
    const body = await req.json();

    if (userRole === Role.GERENTE_REGIONAL) {
      // VERIFICAÇÃO: O gerente só pode editar um técnico da sua região.
      const userToEdit = await prisma.user.findUnique({
        where: { id },
        include: { localizacao: true }
      });
      if (userToEdit?.localizacao?.parentId !== userLocalizacao?.id) {
        return NextResponse.json({ message: 'Permissão negada para editar este usuário.' }, { status: 403 });
      }
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name: body.name, username: body.username, role: body.role, localizacaoId: body.localizacaoId },
    });
    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json({ message: 'Erro ao atualizar usuário' }, { status: 500 });
  }
}

// DELETE: Apaga um usuário
export async function DELETE(req: Request, { params }: { params: any }) {
  const { id } = params;

  try {
    // A operação inteira é uma transação: ou tudo funciona, ou nada é alterado no banco.
    await prisma.$transaction(async (tx) => {
      // Passo 1: Encontrar o usuário e a sua localização para obter a regional (parentId).
      const userToDelete = await tx.user.findUnique({
        where: { id },
        include: { localizacao: true },
      });

      // Validação: Se o usuário não existe, lança um erro que será capturado pelo catch.
      if (!userToDelete) {
        throw new Error('Usuário não encontrado.');
      }
      
      // A lógica de realocação de estoque só se aplica se o usuário tiver uma localização.
      if (userToDelete.localizacao) {
        const tecnicoLocalizacao = userToDelete.localizacao;

        // Validação: A localização do técnico precisa estar vinculada a uma regional.
        if (!tecnicoLocalizacao.parentId) {
          throw new Error('A localização do técnico não está vinculada a uma regional, não é possível realocar o estoque.');
        }

        const regionalId = tecnicoLocalizacao.parentId;

        // Passo 2: Mover todo o ItemEstoque da localização do técnico para a regional.
        await tx.itemEstoque.updateMany({
          where: { localizacaoId: tecnicoLocalizacao.id },
          data: { localizacaoId: regionalId },
        });
      }
      
      // Passo 3: Apagar o usuário.
      // Nota: Se o usuário tiver registros em outras tabelas (Movimentacao, Solicitacao),
      // esta operação pode falhar devido a restrições de chave estrangeira. O bloco catch tratará esse caso.
      await tx.user.delete({
        where: { id },
      });

      // Passo 4: Apagar a localização que pertencia ao técnico (que agora está vazia).
      if (userToDelete.localizacao) {
        await tx.localizacao.delete({
          where: { id: userToDelete.localizacao.id }
        });
      }
    });

    // Se a transação for bem-sucedida, retorna sucesso.
    return new NextResponse(null, { status: 204 }); // 204 No Content

  } catch (error: any) {
    console.error("Erro ao deletar usuário e realocar estoque:", error);
    
    // Fornece respostas de erro específicas para melhor feedback no frontend.
    if (error.message.includes('Usuário não encontrado')) {
        return NextResponse.json({ message: error.message }, { status: 404 });
    }
    if (error.message.includes('não está vinculada a uma regional')) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    // Erro genérico, provavelmente por violação de chave estrangeira (histórico de movimentações).
    return NextResponse.json({ 
        message: 'Erro ao deletar usuário. Verifique se ele não possui um histórico de movimentações ou solicitações.' 
    }, { status: 500 });
  }
}
