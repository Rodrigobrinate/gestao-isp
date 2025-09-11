// app/components/dashboard/EstoquePorRegiaoCard.tsx
'use client';
import { MapPin } from 'lucide-react';

export function EstoquePorRegiaoCard({ dados }: { dados: Record<string, Record<string, number>> }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><MapPin size={22}/> Estoque por Região</h3>
      <div className="space-y-4 max-h-60 overflow-y-auto">
        {Object.entries(dados).map(([regiao, produtos]) => (
          <div key={regiao}>
            <p className="font-semibold text-gray-800">{regiao}</p>
            <ul className="list-disc list-inside pl-4 text-sm text-gray-600">
              {Object.entries(produtos).map(([produto, qtd]) => (
                <li key={produto}><strong>{qtd}</strong> x {produto}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}