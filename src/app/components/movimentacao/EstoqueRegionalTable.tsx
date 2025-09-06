// app/components/movimentacao/EstoqueRegionalTable.tsx
'use client';

import { useState, useMemo } from 'react';
import type { Prisma } from '@prisma/client';

type ItemEstoqueCompleto = Prisma.ItemEstoqueGetPayload<{
  include: { produto: true; localizacao: true; }
}>;

interface Props {
  itensDaRegiao: ItemEstoqueCompleto[];
  localidadesDaRegiao: any[]; // Inclui a localidade do gerente e dos técnicos
}

export function EstoqueRegionalTable({ itensDaRegiao, localidadesDaRegiao }: Props) {
  const [filtroLocalidade, setFiltroLocalidade] = useState('TODOS');

  const itensFiltrados = useMemo(() => {
    if (filtroLocalidade === 'TODOS') {
      return itensDaRegiao;
    }
    return itensDaRegiao.filter(item => item.localizacaoId === filtroLocalidade);
  }, [itensDaRegiao, filtroLocalidade]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Visão Geral do Estoque da Região</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Filtrar por Localidade</label>
        <select
          value={filtroLocalidade}
          onChange={e => setFiltroLocalidade(e.target.value)}
          className="mt-1 w-full md:w-1/3 p-2 border rounded-md bg-white"
        >
          <option value="TODOS">Todas as Localidades</option>
          {localidadesDaRegiao.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.nome}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-sm"><th className="p-2">Produto</th><th className="p-2">Serial</th><th className="p-2">Localização Atual</th><th className="p-2">Condição</th></tr>
          </thead>
          <tbody>
            {itensFiltrados.length > 0 ? itensFiltrados.map(item => (
              <tr key={item.id} className="border-b hover:bg-gray-50 text-sm">
                <td className="p-2 font-medium">{item.produto.nome}</td>
                <td className="p-2 text-gray-600">{item.serialNumber || 'N/A (Qtd)'}</td>
                <td className="p-2">{item.localizacao.nome}</td>
                <td className="p-2">{item.condicao}</td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="text-center p-4 text-gray-500">Nenhum item encontrado para este filtro.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}