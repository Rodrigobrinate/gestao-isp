// app/components/movimentacao/VisaoGeralEstoque.tsx
'use client';

import { useMemo } from 'react';
import type { Prisma } from '@prisma/client';
import { ChevronDown, ChevronRight } from 'lucide-react';
import React from 'react';

type ItemEstoqueCompleto = Prisma.ItemEstoqueGetPayload<{
  include: { produto: true; localizacao: true; }
}>;

interface Agrupado {
  [key: string]: {
    localizacaoNome: string;
    itens: ItemEstoqueCompleto[];
  }
}

export function VisaoGeralEstoque({ itens }: { itens: ItemEstoqueCompleto[] }) {
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});

  const estoqueAgrupado = useMemo(() => {
    return itens.reduce((acc, item) => {
      const locId = item.localizacaoId;
      if (!acc[locId]) {
        acc[locId] = {
          localizacaoNome: item.localizacao.nome,
          itens: []
        };
      }
      acc[locId].itens.push(item);
      return acc;
    }, {} as Agrupado);
  }, [itens]);

  const toggleGroup = (locId: string) => {
    setOpenGroups(prev => ({ ...prev, [locId]: !prev[locId] }));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Visão Geral do Estoque da Região</h2>
      <div className="space-y-4">
        {Object.keys(estoqueAgrupado).map(locId => {
          const grupo = estoqueAgrupado[locId];
          const isOpen = openGroups[locId] ?? false;
          return (
            <div key={locId} className="border rounded-md">
              <button onClick={() => toggleGroup(locId)} className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100">
                <div className="flex items-center gap-2">
                  {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  <span className="font-semibold">{grupo.localizacaoNome}</span>
                </div>
                <span className="px-2 py-1 text-xs font-bold text-gray-600 bg-gray-200 rounded-full">
                  {grupo.itens.length} itens
                </span>
              </button>
              {isOpen && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="border-t"><th className="p-2">Produto</th><th className="p-2">Serial</th></tr></thead>
                    <tbody>
                      {grupo.itens.map(item => (
                        <tr key={item.id} className="border-t">
                          <td className="p-2">{item.produto.nome}</td>
                          <td className="p-2 font-mono text-xs">{item.serialNumber || '(Item de Qtd)'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
}