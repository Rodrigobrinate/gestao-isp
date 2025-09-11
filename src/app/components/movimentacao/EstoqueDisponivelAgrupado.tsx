// app/components/movimentacao/EstoqueDisponivelAgrupado.tsx
'use client';
import { useMemo } from 'react';
import type { Prisma } from '@prisma/client';

type ItemEstoqueCompleto = Prisma.ItemEstoqueGetPayload<{ include: { produto: true } }>;

export function EstoqueDisponivelAgrupado({ itens }: { itens: ItemEstoqueCompleto[] }) {
  const estoqueAgrupado = useMemo(() => {
    return itens.reduce((acc, item) => {
      const nome = item.produto.nome;
      acc[nome] = (acc[nome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [itens]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="font-semibold mb-4">Seu Estoque Disponível (Agrupado)</h3>
      <div className="overflow-x-auto max-h-72">
        <table className="w-full text-left">
          <thead><tr className="border-b text-sm"><th className="p-2 w-1/4">Qtd.</th><th className="p-2">Produto</th></tr></thead>
          <tbody>
            {Object.keys(estoqueAgrupado).length > 0 ? Object.entries(estoqueAgrupado).map(([nome, qtd]) => (
              <tr key={nome} className="border-b hover:bg-gray-50 text-sm">
                <td className="p-2 font-bold">{qtd}</td>
                <td className="p-2">{nome}</td>
              </tr>
            )) : <tr><td colSpan={2} className="p-4 text-center text-gray-500">Nenhum item.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}