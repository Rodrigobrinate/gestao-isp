// app/components/movimentacao/TotalEstoqueRegiao.tsx
'use client';
import { useMemo } from 'react';
import type { Prisma } from '@prisma/client';

type ItemEstoqueCompleto = Prisma.ItemEstoqueGetPayload<{ include: { produto: true } }>;

export function TotalEstoqueRegiao({ itens }: { itens: ItemEstoqueCompleto[] }) {
  const totalAgrupado = useMemo(() => {
    return itens.reduce((acc, item) => {
      const nome = item.produto.nome;
      acc[nome] = (acc[nome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [itens]);

  return (
    <div className="p-6 bg-gray-800 text-white rounded-lg shadow-md">
      <h3 className="font-semibold mb-4 text-gray-200">Total de Itens na Região</h3>
      <div className="space-y-2">
        {Object.keys(totalAgrupado).map(nome => (
          <div key={nome} className="flex justify-between items-center text-sm">
            <span>{nome}</span>
            <span className="font-bold text-lg">{totalAgrupado[nome]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}