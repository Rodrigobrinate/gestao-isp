// app/api/estoque/entrada/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient, TipoProduto, CondicaoItem } from '@prisma/client';

const prisma = new PrismaClient();

interface EntradaRequestBody {
  produtoId: string;
  localizacaoId: string;
  quantidade: number;
  condicao: CondicaoItem;
  numeroNotaFiscal: string;
  fornecedor?: string;
  seriais?: string[]; // Array de números de série, opcional
}

export async function POST(req: Request) {
  try {
    const body: EntradaRequestBody = await req.json();
    const { 
      produtoId, 
      localizacaoId, 
      quantidade, 
      condicao, 
      numeroNotaFiscal, 
      fornecedor, 
      seriais 
    } = body;

    // 1. Validação de dados de entrada
    if (!produtoId || !localizacaoId || !quantidade || !condicao || !numeroNotaFiscal) {
      return NextResponse.json({ message: 'Dados insuficientes para a entrada.' }, { status: 400 });
    }

    // 2. Busca o produto para saber seu tipo (SERIALIZADO ou QUANTIDADE)
    const produto = await prisma.produto.findUnique({ where: { id: produtoId } });
    if (!produto) {
      return NextResponse.json({ message: 'Produto não encontrado.' }, { status: 404 });
    }

    // 3. Validação específica para produtos serializados
    if (produto.tipo === TipoProduto.SERIALIZADO) {
      if (!seriais || seriais.length !== quantidade) {
        return NextResponse.json(
          { message: `A quantidade de números de série (${seriais?.length || 0}) não corresponde à quantidade de produtos (${quantidade}).` },
          { status: 400 }
        );
      }
    }

    // 4. Executa a criação da entrada e dos itens em uma transação
    const novaEntrada = await prisma.$transaction(async (tx) => {
      // a. Cria o registro histórico da entrada
      const entrada = await tx.entradaEstoque.create({
        data: {
          produtoId,
          quantidade,
          numeroNotaFiscal,
          fornecedor,
          dataChegada: new Date(),
        },
      });

      // b. Prepara a criação dos itens de estoque individuais
      const itensParaCriar = [];
      for (let i = 0; i < quantidade; i++) {
        itensParaCriar.push({
          produtoId,
          localizacaoId,
          condicao,
          status: 'EM_ESTOQUE', // Itens novos sempre entram EM_ESTOQUE
          serialNumber: produto.tipo === TipoProduto.SERIALIZADO ? seriais![i] : null,
        });
      }
      
      // c. Cria todos os itens de uma vez (mais eficiente)
      await tx.itemEstoque.createMany({
        data: itensParaCriar,
      });

      return entrada;
    });

    return NextResponse.json(novaEntrada, { status: 201 });

  } catch (error) {
    console.error("ERRO AO DAR ENTRADA NO ESTOQUE:", error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}