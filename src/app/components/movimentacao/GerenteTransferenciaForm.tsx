// app/components/movimentacao/GerenteTransferenciaForm.tsx
'use client';

import { useState, useMemo, FormEvent } from 'react';
import type { Produto, Localizacao, User } from '@prisma/client';
import { Send } from 'lucide-react';

// ... (Defina as interfaces de tipo como em AlmoxarifadoView.tsx, se necessário)
type ItemEstoqueCompleto = any; 

interface Props {
  itensDoGerente: ItemEstoqueCompleto[];
  tecnicos: Localizacao[]; // Assumindo que cada técnico tem uma localidade
  currentUser: User;
  localidadeGerente: Localizacao | undefined;
  onTransferir: (data: any) => Promise<boolean>;
  isLoading: boolean;
}

export function GerenteTransferenciaForm({ itensDoGerente, tecnicos, currentUser, localidadeGerente, onTransferir, isLoading }: Props) {
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [serial, setSerial] = useState('');
  const [destinoId, setDestinoId] = useState('');
  const [buscaProduto, setBuscaProduto] = useState('');

  const produtosDisponiveis = useMemo(() => {
    if (!itensDoGerente) return [];
    return [...new Map(itensDoGerente.map((item: any) => [item.produto.id, item.produto])).values()];
  }, [itensDoGerente]);

  const produtoSelecionado = produtosDisponiveis.find((p: any) => p.id === produtoId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const success = await onTransferir({
      produtoId,
      quantidade: Number(quantidade),
      serialNumber: serial,
      origemId: localidadeGerente?.id,
      destinoId,
      responsavelId: currentUser.id,
    });
    if (success) {
      setProdutoId(''); setQuantidade(''); setSerial(''); setDestinoId(''); setBuscaProduto('');
    }
  };

  const produtosFiltrados = useMemo(() => 
    produtosDisponiveis.filter((p: any) => 
      p.nome.toLowerCase().includes(buscaProduto.toLowerCase())
    ), 
    [produtosDisponiveis, buscaProduto]
  );
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Send size={24} /> Enviar Item para Técnico</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">1. Buscar Produto no seu Estoque</label>
          <input type="text" placeholder="Digite para buscar..." value={buscaProduto} onChange={e => setBuscaProduto(e.target.value)} className="mt-1 block w-full p-2 border rounded-md mb-2" />
          <select value={produtoId} onChange={e => setProdutoId(e.target.value)} required className="block w-full p-2 border rounded-md bg-white">
            <option value="">{produtosFiltrados.length > 0 ? 'Selecione um produto...' : 'Nenhum produto em seu estoque'}</option>
            {produtosFiltrados.map((p: any) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        
        {produtoSelecionado?.tipo === 'QUANTIDADE' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">2. Quantidade a Enviar</label>
            <input type="number" min="1" value={quantidade} onChange={e => setQuantidade(e.target.value)} required placeholder="Ex: 5" className="mt-1 block w-full p-2 border rounded-md" />
          </div>
        )}

        {produtoSelecionado?.tipo === 'SERIALIZADO' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">2. Nº de Série do Item</label>
            <input type="text" value={serial} onChange={e => setSerial(e.target.value)} required placeholder="Escaneie ou digite o serial" className="mt-1 block w-full p-2 border rounded-md" />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700">3. Enviar para o Técnico</label>
          <select value={destinoId} onChange={e => setDestinoId(e.target.value)} required className="mt-1 block w-full p-2 border rounded-md bg-white" disabled={!produtoId}>
            <option value="">Selecione um técnico...</option>
            {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
        </div>

        <div className="text-right pt-2">
          <button type="submit" disabled={!produtoId || !destinoId || isLoading} className="w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
            {isLoading ? 'Transferindo...' : 'Confirmar Envio'}
          </button>
        </div>
      </form>
    </div>
  );
}