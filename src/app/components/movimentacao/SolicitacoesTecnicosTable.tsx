// app/components/movimentacao/SolicitacoesTecnicosTable.tsx
'use client';

import { Check, X } from 'lucide-react';
import type { Prisma } from '@prisma/client';

type SolicitacaoCompleta = Prisma.SolicitacaoGetPayload<{
  include: { produto: true; solicitante: true; }
}>;

interface Props {
  solicitacoes: SolicitacaoCompleta[];
  onUpdate: (id: string, status: 'APROVADO' | 'REJEITADO', responsavelId: string) => void;
}

export function SolicitacoesTecnicosTable({ solicitacoes, onUpdate }: Props) {
  const solicitacoesPendentes = solicitacoes.filter(s => s.status === 'PENDENTE');

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Solicitações de Técnicos</h2>
      {solicitacoesPendentes.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhuma solicitação pendente no momento.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b text-sm"><th className="p-2">Técnico</th><th className="p-2">Produto</th><th className="p-2">Qtd.</th><th className="p-2">Ações</th></tr></thead>
            <tbody>
              {solicitacoesPendentes.map(sol => (
                <tr key={sol.id} className="border-b hover:bg-gray-50 text-sm">
                  <td className="p-2">{sol.solicitante.name}</td>
                  <td className="p-2">{sol.produto.nome}</td>
                  <td className="p-2 font-bold">{sol.quantidade}</td>
                  <td className="p-2 flex gap-2">
                    <button onClick={() => onUpdate(sol.id, 'APROVADO', sol.solicitante.id)} title="Aprovar" className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200"><Check size={16} /></button>
                    <button onClick={() => onUpdate(sol.id, 'REJEITADO', sol.solicitante.id)} title="Rejeitar" className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200"><X size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}