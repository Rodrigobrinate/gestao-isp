// app/components/movimentacao/MinhasSolicitacoesTable.tsx
'use client';

import { useState, useMemo } from 'react';
import type { Prisma } from '@prisma/client';
import { ListFilter, Search } from 'lucide-react';

type SolicitacaoCompleta = Prisma.SolicitacaoGetPayload<{
  include: { produto: true; solicitante: true; }
}>;

interface Props {
  solicitacoes: SolicitacaoCompleta[];
}

export function MinhasSolicitacoesTable({ solicitacoes }: Props) {
  const [statusFiltro, setStatusFiltro] = useState('TODOS');
  const [busca, setBusca] = useState('');

  const solicitacoesFiltradas = useMemo(() => {
    return solicitacoes.filter(sol => {
      const correspondeStatus = statusFiltro === 'TODOS' || sol.status === statusFiltro;
      const correspondeBusca = sol.produto.nome.toLowerCase().includes(busca.toLowerCase());
      return correspondeStatus && correspondeBusca;
    });
  }, [solicitacoes, statusFiltro, busca]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'PENDENTE': return 'bg-yellow-100 text-yellow-800';
      case 'APROVADO': return 'bg-green-100 text-green-800';
      case 'REJEITADO': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Minhas Solicitações</h2>
      
      {/* Controles de Filtro e Busca */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-grow">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por produto..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full p-2 pl-10 border rounded-md"
            />
          </div>
        </div>
        <div className="flex-shrink-0">
          <select
            value={statusFiltro}
            onChange={e => setStatusFiltro(e.target.value)}
            className="w-full p-2 border rounded-md bg-white"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="PENDENTE">Pendente</option>
            <option value="APROVADO">Aprovado</option>
            <option value="REJEITADO">Rejeitado</option>
          </select>
        </div>
      </div>

      {/* Tabela de Solicitações */}
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-sm"><th className="p-2">Data</th><th className="p-2">Produto</th><th className="p-2">Qtd.</th><th className="p-2">Status</th></tr>
          </thead>
          <tbody>
            {solicitacoesFiltradas.length > 0 ? solicitacoesFiltradas.map(sol => (
              <tr key={sol.id} className="border-b hover:bg-gray-50 text-sm">
                <td className="p-2">{new Date(sol.createdAt).toLocaleDateString('pt-BR')}</td>
                <td className="p-2 font-medium">{sol.produto.nome}</td>
                <td className="p-2">{sol.quantidade}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(sol.status)}`}>
                    {sol.status}
                  </span>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="text-center p-4 text-gray-500">Nenhuma solicitação encontrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}