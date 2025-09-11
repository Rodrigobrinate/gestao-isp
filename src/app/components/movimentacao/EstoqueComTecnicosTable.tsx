// app/components/movimentacao/EstoqueComTecnicosTable.tsx
'use client';
import type { Prisma } from '@prisma/client';

type ItemEstoqueCompleto = Prisma.ItemEstoqueGetPayload<{ include: { produto: true; localizacao: true; } }>;

export function EstoqueComTecnicosTable({ itens }: { itens: ItemEstoqueCompleto[] }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="font-semibold mb-4">Estoque Alocado com Técnicos</h3>
       <div className="overflow-x-auto max-h-72">
        <table className="w-full text-left">
          <thead><tr className="border-b text-sm"><th className="p-2">Produto</th><th className="p-2">Serial</th><th className="p-2">Técnico/Local</th></tr></thead>
          <tbody>
            {itens.length > 0 ? itens.map(item => (
              <tr key={item.id} className="border-b hover:bg-gray-50 text-sm">
                <td className="p-2">{item.produto.nome}</td>
                <td className="p-2 font-mono text-xs">{item.serialNumber}</td>
                <td className="p-2">{item.localizacao.nome}</td>
              </tr>
            )) : <tr><td colSpan={3} className="p-4 text-center text-gray-500">Nenhum item com técnicos.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}