import { NextResponse } from 'next/server';
import { PrismaClient, TipoLocalizacao } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Rota para atualizar o status de uma solicitação (Aprovar/Rejeitar).
 * Se aprovada, movimenta os itens do almoxarifado para a localização do solicitante.
 *
 * @param req Request - Corpo da requisição deve conter `status` e `responsavelId` (se aprovando).
 * @param params - Contém o `id` da solicitação a ser atualizada.
 */
export async function PUT(req: Request, { params }: { params: any }) {
  const { id } = await params;
  const body = await req.json();
  const { status, responsavelId } = body;
  console.log("Corpo da requisição:", body);
  console.log("ID da solicitação:", id);


  // Validação dos dados de entrada
  if (!status || (status === 'APROVADO' && !responsavelId)) {
    return NextResponse.json(
      { message: 'Status e responsavelId (para aprovação) são obrigatórios.' },
      { status: 400 }
    );
  }

  try {
    const solicitacaoAtualizada = await prisma.$transaction(async (tx) => {
      // 1. Busca a solicitação e os dados relacionados necessários para a operação
      const solicitacao = await tx.solicitacao.findUnique({
        where: { id },
        include: {
          produto: true,
          solicitante: true,
        },
      });

      // Validações da solicitação
      if (!solicitacao) {
        throw new Error('Solicitação não encontrada.');
      }
      if (solicitacao.status !== 'PENDENTE') {
        throw new Error(`Esta solicitação já foi processada e seu status é ${solicitacao.status}.`);
      }

      // 2. Atualiza o status da solicitação
      const updatedSolicitacao = await tx.solicitacao.update({
        where: { id },
        data: { status },
      });

      // 3. Se o status for "APROVADO", realiza a movimentação do estoque
      if (status === 'APROVADO') {
        // Encontra o local de origem (almoxarifado)
        const almoxarifado = await tx.localizacao.findFirst({
          where: { tipo: TipoLocalizacao.ALMOXARIFADO },
        });

        if (!almoxarifado) {
          throw new Error('Nenhum almoxarifado de origem foi encontrado no sistema.');
        }

        const origemId = almoxarifado.id;
        const destinoId = solicitacao.solicitante.localizacaoId;

        // Validações para a movimentação
        if (!destinoId) {
          throw new Error('O solicitante não possui uma localização de destino definida.');
        }
        if (origemId === destinoId) {
            throw new Error("A origem e o destino da movimentação não podem ser os mesmos.");
        }

        // Busca os itens disponíveis no estoque do almoxarifado
        const itensDisponiveis = await tx.itemEstoque.findMany({
          where: {
            produtoId: solicitacao.produtoId,
            localizacaoId: origemId,
            status: 'EM_ESTOQUE',
          },
          take: solicitacao.quantidade,
        });

        // Verifica se há estoque suficiente
        if (itensDisponiveis.length < solicitacao.quantidade) {
          throw new Error(
            `Estoque insuficiente. Disponível: ${itensDisponiveis.length}, Solicitado: ${solicitacao.quantidade}`
          );
        }

        const itemIds = itensDisponiveis.map((item) => item.id);

        // Atualiza a localização dos itens
        await tx.itemEstoque.updateMany({
          where: { id: { in: itemIds } },
          data: { localizacaoId: destinoId },
        });

        // Cria os registros de movimentação para rastreabilidade
        const movimentacoesData = itemIds.map((itemId) => ({
          itemEstoqueId: itemId,
          origemId,
          destinoId,
          responsavelId,
        }));

        await tx.movimentacao.createMany({ data: movimentacoesData });
      }

      return updatedSolicitacao;
    });

    return NextResponse.json(solicitacaoAtualizada, { status: 200 });

  } catch (error: any) {
    console.error("Erro ao processar solicitação:", error);
    return NextResponse.json(
      { message: error.message || 'Ocorreu um erro interno.' },
      { status: 500 }
    );
  }
}
