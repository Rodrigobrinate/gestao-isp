// app/components/movimentacao/TransferenciaForm.tsx
'use client';
import { useState, FormEvent } from 'react';
import { ProductCombobox } from './ProductCombobox'; // Importando o novo componente

// Tipos
type Produto = { id: string; nome: string; tipo: string };
type Localizacao = { id: string; nome: string };
type User = { id: string; name: string | null };

// ... (Interface Props permanece a mesma)

export function TransferenciaForm({ produtosDisponiveis, localidades, currentUser, localidadeAlmoxarifado, onTransferir, isLoading }: any) {
  const [produto, setProduto] = useState<Produto | null>(null);
  const [quantidade, setQuantidade] = useState('');
  const [serial, setSerial] = useState('');
  const [destinoId, setDestinoId] = useState('');
  
  const resetForm = () => {
    setProduto(null);
    setQuantidade('');
    setSerial('');
    setDestinoId('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const success = await onTransferir({
      produtoId: produto?.id,
      quantidade: Number(quantidade),
      serialNumber: serial,
      origemId: localidadeAlmoxarifado?.id,
      destinoId,
      responsavelId: currentUser.id,
    });
    if (success) resetForm();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Transferir Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Componente de Busca Substituído */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">1. Produto</label>
          <ProductCombobox
            produtos={produtosDisponiveis}
            value={produto?.id || ''}
            onSelect={(selected) => {
              setProduto(selected);
              setSerial('');
              setQuantidade('');
            }}
          />
        </div>
        
        {/* Campos Condicionais */}
        {produto?.tipo === 'QUANTIDADE' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">2. Quantidade</label>
            <input type="number" min="1" value={quantidade} onChange={e => setQuantidade(e.target.value)} required placeholder="Ex: 50" className="mt-1 block w-full p-2 border rounded-md" />
          </div>
        )}

        {produto?.tipo === 'SERIALIZADO' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">2. Nº de Série</label>
            <input type="text" value={serial} onChange={e => setSerial(e.target.value)} required placeholder="Escaneie ou digite o serial" className="mt-1 block w-full p-2 border rounded-md" />
          </div>
        )}
        
        {/* Seleção de Destino */}
        <div>
          <label className="block text-sm font-medium text-gray-700">3. Destino</label>
          <select value={destinoId} onChange={e => setDestinoId(e.target.value)} required className="mt-1 block w-full p-2 border rounded-md bg-white" disabled={!produto}>
            <option value="">Selecione...</option>
            {localidades.filter((l: Localizacao) => l.id !== localidadeAlmoxarifado?.id).map((l: Localizacao) => <option key={l.id} value={l.id}>{l.nome}</option>)}
          </select>
        </div>

        <div className="text-right pt-2">
          <button type="submit" disabled={!produto || !destinoId || isLoading} className="w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isLoading ? 'Processando...' : 'Confirmar Transferência'}
          </button>
        </div>
      </form>
    </div>
  );
}