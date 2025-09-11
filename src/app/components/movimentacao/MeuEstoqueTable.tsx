// app/components/movimentacao/MeuEstoqueTable.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Wrench, ArrowUpCircle, ChevronsDown } from 'lucide-react';
import type { Prisma } from '@prisma/client';

// CORREÇÃO: Usar o tipo completo que inclui a relação 'localizacao'
type ItemEstoqueCompleto = Prisma.ItemEstoqueGetPayload<{ 
  include: { 
    produto: true;
    localizacao: true; // Garante que a localização esteja no tipo
  } 
}>;

interface Props {
  itens: ItemEstoqueCompleto[];
  onInstalar: (itemId: string) => void;
  onDevolver: (item: ItemEstoqueCompleto) => void; // Agora o tipo esperado corresponde
}

const ITENS_VISIVEIS_INICIALMENTE = 3;
const ITENS_PARA_CARREGAR_MAIS = 10;

export function MeuEstoqueTable({ itens, onInstalar, onDevolver }: Props) {
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});

  const estoqueAgrupado = useMemo(() => {
    return itens.reduce((acc, item) => {
      const nomeProduto = item.produto.nome;
      if (!acc[nomeProduto]) {
        acc[nomeProduto] = {
          tipo: item.produto.tipo,
          itens: []
        };
      }
      acc[nomeProduto].itens.push(item);
      return acc;
    }, {} as Record<string, { tipo: string, itens: ItemEstoqueCompleto[] }>);
  }, [itens]);

  useEffect(() => {
    const initialCounts: Record<string, number> = {};
    for (const nomeProduto in estoqueAgrupado) {
      initialCounts[nomeProduto] = ITENS_VISIVEIS_INICIALMENTE;
    }
    setVisibleCounts(initialCounts);
  }, [estoqueAgrupado]);

  const handleShowMore = (nomeProduto: string) => {
    setVisibleCounts(prevCounts => ({
      ...prevCounts,
      [nomeProduto]: (prevCounts[nomeProduto] || 0) + ITENS_PARA_CARREGAR_MAIS,
    }));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Meu Estoque Disponível</h2>
      <div className="space-y-6 max-h-[60vh] overflow-y-auto">
        {Object.keys(estoqueAgrupado).length > 0 ? Object.entries(estoqueAgrupado).map(([nome, grupo]) => {
          const countToShow = visibleCounts[nome] || ITENS_VISIVEIS_INICIALMENTE;
          const remainingCount = grupo.itens.length - countToShow;

          return (
            <div key={nome}>
              <p className="font-semibold">{nome} <span className="text-gray-500 font-normal">({grupo.itens.length} unid. total)</span></p>
              <ul className="pl-4 mt-2 space-y-2">
                {grupo.itens.slice(0, countToShow).map(item => (
                  <li key={item.id} className="flex justify-between items-center text-sm border-b pb-2">
                    <span>{grupo.tipo === 'SERIALIZADO' ? `Serial: ${item.serialNumber}` : 'Item de Quantidade'}</span>
                    <div className="flex gap-2">
                      <button onClick={() => onDevolver(item)} title="Devolver para Região" className="p-2 text-orange-600 hover:bg-orange-100 rounded-full"><ArrowUpCircle size={16}/></button>
                      <button onClick={() => onInstalar(item.id)} title="Marcar como Instalado" className="p-2 text-green-600 hover:bg-green-100 rounded-full"><Wrench size={16}/></button>
                    </div>
                  </li>
                ))}
              </ul>
              {remainingCount > 0 && (
                <div className="pl-4 mt-2">
                  <button 
                    onClick={() => handleShowMore(nome)} 
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <ChevronsDown size={16} />
                    Mostrar mais ({remainingCount} restantes)
                  </button>
                </div>
              )}
            </div>
          )
        }) : <p className="text-center text-gray-500">Você não possui itens em estoque.</p>}
      </div>
    </div>
  );
}