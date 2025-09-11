// app/components/dashboard/EstoquePorTecnicoCard.tsx
'use client';
import { useMemo } from 'react';

export function EstoquePorTecnicoCard({ itens }: { itens: any[] }) {
  const estoqueAgrupado = useMemo(() => {
    return itens.reduce((acc, item) => {
      const tecnico = item.localizacao.nome;
      const produto = item.produto.nome;
      if (!acc[tecnico]) acc[tecnico] = {};
      acc[tecnico][produto] = (acc[tecnico][produto] || 0) + 1;
      return acc;
    }, {} as Record<string, Record<string, number>>);
  }, [itens]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="font-semibold mb-4">Estoque Alocado com Técnicos</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.keys(estoqueAgrupado).length > 0 ? Object.entries(estoqueAgrupado).map(([tecnico, produtos]:any) => (
          <div key={tecnico}>
            <p className="font-semibold text-gray-800">{tecnico}</p>
            <ul className="list-disc list-inside pl-4 text-sm text-gray-600">
              {Object.entries(produtos).map(([produto, qtd]:any) => (
                <li key={produto}><strong>{qtd}</strong> x {produto}</li>
              ))}
            </ul>
          </div>
        )) : <p className="text-gray-500">Nenhum item alocado com técnicos.</p>}
      </div>
    </div>
  );
}