// app/api/movimentacoes/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, TipoProduto } from '@prisma/client';

const prisma = new PrismaClient();



export async function GET() {
    try { // Adicionado o bloco try...catch que estava faltando
        const movimentacoes = await prisma.movimentacao.findMany({
            include: {
                itemEstoque: { include: { produto: true } },
                origem: true,
                destino: true,
                responsavel: true,
            },
            orderBy: { data: 'desc' },
        });
        // Retorno em caso de sucesso
        return NextResponse.json(movimentacoes);
    } catch (error) {
        console.error("Erro ao buscar movimentações:", error);
        // Retorno em caso de erro
        return NextResponse.json({ message: "Erro ao buscar histórico de movimentações" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const body = await req.json();
    const { 
        produtoId, 
        quantidade, 
        serialNumber,
        origemId, 
        destinoId, 
        responsavelId 
    } = body;

    if (!produtoId || !origemId || !destinoId || !responsavelId) {
        return NextResponse.json({ message: "Dados insuficientes para a movimentação." }, { status: 400 });
    }

    try {
        const produto = await prisma.produto.findUnique({ where: { id: produtoId } });
        if (!produto) return NextResponse.json({ message: "Produto não encontrado." }, { status: 404 });

        await prisma.$transaction(async (tx) => {
            if (produto.tipo === TipoProduto.SERIALIZADO) {
                if (!serialNumber) throw new Error("Número de série é obrigatório para este item.");
                
                const itemParaMover = await tx.itemEstoque.findFirst({
                    where: { serialNumber: serialNumber, localizacaoId: origemId },
                });
                if (!itemParaMover) throw new Error(`Item com serial ${serialNumber} não encontrado na sua localidade.`);

                await tx.itemEstoque.update({
                    where: { id: itemParaMover.id },
                    data: { localizacaoId: destinoId },
                });

                await tx.movimentacao.create({
                    data: {
                        itemEstoqueId: itemParaMover.id,
                        origemId,
                        destinoId,
                        responsavelId,
                    },
                });

            } else { // TipoProduto.QUANTIDADE
                if (!quantidade || quantidade <= 0) throw new Error("A quantidade deve ser maior que zero.");

                const itensDisponiveis = await tx.itemEstoque.findMany({
                    where: { produtoId, localizacaoId: origemId, status: 'EM_ESTOQUE' },
                    take: quantidade,
                });
                
                if (itensDisponiveis.length < quantidade) throw new Error(`Estoque insuficiente. Disponível: ${itensDisponiveis.length}, Solicitado: ${quantidade}`);

                const itemIds = itensDisponiveis.map(item => item.id);
                await tx.itemEstoque.updateMany({
                    where: { id: { in: itemIds } },
                    data: { localizacaoId: destinoId },
                });

                const movimentacoesData = itemIds.map(itemId => ({
                    itemEstoqueId: itemId,
                    origemId,
                    destinoId,
                    responsavelId,
                }));
                await tx.movimentacao.createMany({ data: movimentacoesData });
            }
        });

        return NextResponse.json({ message: "Movimentação realizada com sucesso!" }, { status: 200 });

    } catch (error: any) {
        console.error("Erro na transação de movimentação:", error);
        return NextResponse.json({ message: error.message || "Erro ao processar movimentação" }, { status: 500 });
    }
}