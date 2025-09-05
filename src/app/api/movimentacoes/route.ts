// app/api/movimentacoes/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, TipoProduto } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Listar o histórico de movimentações (COM CORREÇÃO)
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

// POST: Criar uma nova movimentação (sem alteração, já estava correto)
export async function POST(req: Request) {
    const { 
        produtoId, 
        quantidade, 
        serialNumber, 
        origemId, 
        destinoId, 
        responsavelId 
    } = await req.json();

    if (!produtoId || !origemId || !destinoId || !responsavelId) {
        return NextResponse.json({ message: "Dados insuficientes para a movimentação." }, { status: 400 });
    }

    try {
        const produto = await prisma.produto.findUnique({ where: { id: produtoId } });
        if (!produto) {
            return NextResponse.json({ message: "Produto não encontrado." }, { status: 404 });
        }

        if (produto.tipo === TipoProduto.QUANTIDADE) {
            // Lógica para QUANTIDADE
            if (!quantidade || quantidade <= 0) {
                return NextResponse.json({ message: "A quantidade deve ser maior que zero." }, { status: 400 });
            }
            await prisma.$transaction(async (tx) => {
                const itensDisponiveis = await tx.itemEstoque.findMany({
                    where: { produtoId, localizacaoId: origemId, status: 'EM_ESTOQUE' },
                    take: quantidade,
                });
                if (itensDisponiveis.length < quantidade) {
                    throw new Error(`Estoque insuficiente. Disponível: ${itensDisponiveis.length}, Solicitado: ${quantidade}`);
                }
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
            });
        } else if (produto.tipo === TipoProduto.SERIALIZADO) {
            // Lógica para SERIALIZADO
            if (!serialNumber) {
                return NextResponse.json({ message: "Número de série é obrigatório para este produto." }, { status: 400 });
            }
            await prisma.$transaction(async (tx) => {
                const item = await tx.itemEstoque.findFirst({
                    where: { serialNumber, localizacaoId: origemId, status: 'EM_ESTOQUE' },
                });
                if (!item) {
                    throw new Error(`Item com serial ${serialNumber} não encontrado na origem ou não está disponível.`);
                }
                await tx.itemEstoque.update({
                    where: { id: item.id },
                    data: { localizacaoId: destinoId },
                });
                await tx.movimentacao.create({
                    data: { itemEstoqueId: item.id, origemId, destinoId, responsavelId },
                });
            });
        }
        return NextResponse.json({ message: "Movimentação realizada com sucesso!" }, { status: 201 });
    } catch (error: any) {
        console.error("Erro na movimentação:", error);
        return NextResponse.json({ message: error.message || "Erro ao processar movimentação" }, { status: 500 });
    }
}