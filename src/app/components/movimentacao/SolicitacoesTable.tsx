// app/components/movimentacao/SolicitacoesTable.tsx
'use client';

// Tipos para ajudar o TypeScript
type Solicitacao = {
  id: string;
  status: string;
  quantidade: number;
  produto: { nome: string };
  solicitante: { name: string | null };
  createdAt: string;
}

interface Props {
  solicitacoes: Solicitacao[];
  onAprovar: (id: string) => void;
  onRejeitar: (id: string) => void;
}

export function SolicitacoesTable({ solicitacoes, onAprovar, onRejeitar }: Props) {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Solicitações Pendentes</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-2">Produto</th>
              <th className="p-2">Qtd.</th>
              <th className="p-2">Solicitante</th>
              <th className="p-2">Status</th>
              <th className="p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {solicitacoes.filter(s => s.status === 'PENDENTE').map((sol) => (
              <tr key={sol.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{sol.produto.nome}</td>
                <td className="p-2">{sol.quantidade}</td>
                <td className="p-2">{sol.solicitante.name}</td>
                <td className="p-2"><span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">{sol.status}</span></td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => onAprovar(sol.id)} className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">Aprovar</button>
                  <button onClick={() => onRejeitar(sol.id)} className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">Rejeitar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}