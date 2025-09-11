// app/components/movimentacao/MeusEnviosTable.tsx
'use client';

import type { Prisma } from '@prisma/client';
import { ArrowLeftRight } from 'lucide-react';

type MovimentacaoCompleta = Prisma.MovimentacaoGetPayload<{
  include: {
    itemEstoque: { include: { produto: true } },
    destino: true,
  }
}>;

interface Props {
  envios: MovimentacaoCompleta[];
}

export function MeusEnviosTable({ envios }: Props) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <ArrowLeftRight size={24}/> Meus Envios Recentes
      </h2>
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-sm"><th className="p-2">Data</th><th className="p-2">Item (Serial)</th><th className="p-2">Enviado Para</th></tr>
          </thead>
          <tbody>
            {envios.length > 0 ? envios.slice(0, 15).map(mov => (
              <tr key={mov.id} className="border-b hover:bg-gray-50 text-sm">
                <td className="p-2">{new Date(mov.data).toLocaleString('pt-BR')}</td>
                <td className="p-2 font-medium">{mov.itemEstoque.produto.nome} <span className="text-gray-500">({mov.itemEstoque.serialNumber || 'Qtd'})</span></td>
                <td className="p-2">{mov.destino.nome}</td>
              </tr>
            )) : (
              <tr><td colSpan={3} className="text-center p-4 text-gray-500">Nenhum envio registrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}