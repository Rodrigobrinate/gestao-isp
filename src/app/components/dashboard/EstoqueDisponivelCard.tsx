// app/components/dashboard/EstoqueDisponivelCard.tsx
'use client';
import { useMemo } from 'react';

export function EstoqueDisponivelCard({ itens }: { itens: any[] }) {
  const estoqueAgrupado = useMemo(() => {
    return itens.reduce((acc, item) => {
      const nome = item.produto.nome;
      acc[nome] = (acc[nome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [itens]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="font-semibold mb-4">Estoque Disponível (Sua Região)</h3>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {Object.keys(estoqueAgrupado).length > 0 ? Object.entries(estoqueAgrupado).map(([nome, qtd]: any) => (
          <div key={nome} className="flex justify-between items-center text-sm border-b pb-1">
            <span>{nome}</span>
            <span className="font-bold text-base">{qtd}</span>
          </div>
        )) : <p className="text-gray-500">Nenhum item disponível.</p>}
      </div>
    </div>
  );
}