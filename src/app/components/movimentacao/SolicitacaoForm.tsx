// app/components/movimentacao/SolicitacaoForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import type { Produto, User } from '@prisma/client';
import { ShoppingCart } from 'lucide-react';

interface Props {
  produtosDoCatalogo: Produto[];
  currentUser: User;
  onSubmit: (data: any) => Promise<boolean>;
  isLoading: boolean;
}

export function SolicitacaoForm({ produtosDoCatalogo, currentUser, onSubmit, isLoading }: Props) {
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [observacao, setObservacao] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!produtoId || !quantidade) return;
    
    const success = await onSubmit({
      produtoId,
      quantidade: Number(quantidade),
      solicitanteId: currentUser.id,
      observacao,
    });

    if (success) {
      setProdutoId('');
      setQuantidade('');
      setObservacao('');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <ShoppingCart size={24} /> Solicitar Material ao Almoxarifado
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">1. Produto</label>
          <select 
            value={produtoId} 
            onChange={e => setProdutoId(e.target.value)} 
            required 
            className="mt-1 block w-full p-2 border rounded-md bg-white"
          >
            <option value="">Selecione o produto...</option>
            {produtosDoCatalogo.map(p => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">2. Quantidade Desejada</label>
          <input 
            type="number" 
            min="1" 
            value={quantidade} 
            onChange={e => setQuantidade(e.target.value)} 
            required 
            placeholder="Ex: 20" 
            className="mt-1 block w-full p-2 border rounded-md" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Observação (Opcional)</label>
          <textarea
            value={observacao}
            onChange={e => setObservacao(e.target.value)}
            placeholder="Ex: Urgente para o projeto X"
            rows={2}
            className="mt-1 block w-full p-2 border rounded-md"
          ></textarea>
        </div>
        <div className="text-right pt-2">
          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {isLoading ? 'Enviando...' : 'Enviar Solicitação'}
          </button>
        </div>
      </form>
    </div>
  );
}