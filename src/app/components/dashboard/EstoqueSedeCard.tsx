// app/components/dashboard/EstoqueSedeCard.tsx
'use client';
import { Warehouse } from 'lucide-react';

export function EstoqueSedeCard({ dados }: { dados: { nome: string, quantidade: number }[] }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Warehouse size={22}/> Estoque na Sede</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {dados.map(item => (
          <div key={item.nome} className="flex justify-between items-center text-sm border-b pb-1">
            <span>{item.nome}</span>
            <span className="font-bold text-base">{item.quantidade}</span>
          </div>
        ))}
      </div>
    </div>
  );
}