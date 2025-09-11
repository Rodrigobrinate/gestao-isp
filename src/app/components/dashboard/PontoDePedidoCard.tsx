// app/components/dashboard/PontoDePedidoCard.tsx
'use client';
import { AlertTriangle } from 'lucide-react';

export function PontoDePedidoCard({ dados }: { dados: { nome: string, estoqueAtual: number, pontoPedido1Mes: number | null }[] }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-yellow-600"><AlertTriangle size={22}/> Alertas de Ponto de Pedido</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {dados.length > 0 ? dados.map(item => (
          <div key={item.nome} className="flex justify-between items-center text-sm border-b pb-1">
            <span>{item.nome}</span>
            <span className="font-bold text-base text-red-600">{item.estoqueAtual} / {item.pontoPedido1Mes}</span>
          </div>
        )) : <p className="text-sm text-gray-500">Nenhum produto em ponto de pedido.</p>}
      </div>
    </div>
  );
}