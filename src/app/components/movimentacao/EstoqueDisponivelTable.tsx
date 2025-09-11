// app/components/movimentacao/EstoqueDisponivelTable.tsx
'use client';
import type { Prisma } from '@prisma/client';

type ItemEstoqueCompleto = Prisma.ItemEstoqueGetPayload<{ include: { produto: true } }>;

export function EstoqueDisponivelTable({ itens }: { itens: ItemEstoqueCompleto[] }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="font-semibold mb-4">Estoque Disponível na Região</h3>
      <div className="overflow-x-auto max-h-72">
        <table className="w-full text-left">
          <thead><tr className="border-b text-sm"><th className="p-2">Produto</th><th className="p-2">Serial/Qtd</th></tr></thead>
          <tbody>
            {itens.length > 0 ? itens.map(item => (
              <tr key={item.id} className="border-b hover:bg-gray-50 text-sm">
                <td className="p-2">{item.produto.nome}</td>
                <td className="p-2 font-mono text-xs">{item.serialNumber || '(Item de Qtd)'}</td>
              </tr>
            )) : <tr><td colSpan={2} className="p-4 text-center text-gray-500">Nenhum item disponível.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}