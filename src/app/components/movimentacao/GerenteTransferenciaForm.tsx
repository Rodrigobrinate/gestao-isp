// app/components/movimentacao/GerenteTransferenciaForm.tsx
'use client';

import { useState, FormEvent, useMemo } from 'react';
import type { User, Localizacao, Produto } from '@prisma/client';

type UserComLocalizacao = User & { localizacao: Localizacao | null };
type ItemEstoqueComProduto = { id: string, produtoId: string, produto: { id: string, nome: string, tipo: string } };

interface Props {
  itensDoGerente: ItemEstoqueComProduto[];
  tecnicos: UserComLocalizacao[];
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
  const [formError, setFormError] = useState('');

  const produtosDisponiveis = useMemo(() => {
    return [...new Map(itensDoGerente.map(item => [item.produto.id, item.produto])).values()];
  }, [itensDoGerente]);
  
  const produtoSelecionado = produtosDisponiveis.find(p => p.id === produtoId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (produtoSelecionado?.tipo === 'QUANTIDADE') {
      const estoqueDisponivel = itensDoGerente.filter(item => item.produtoId === produtoId).length;
      if (Number(quantidade) > estoqueDisponivel) {
        setFormError(`Quantidade indisponível. Você possui ${estoqueDisponivel} unidades.`);
        return;
      }
    }
    
    const success = await onTransferir({
      produtoId,
      quantidade: Number(quantidade),
      serialNumber: serial,
      origemId: localidadeGerente?.id,
      destinoId,
      responsavelId: currentUser.id,

    });
    if (success) {
      console.log(`transferencia de ${produtoId} realizada com sucesso para ${destinoId}`)
      setProdutoId(''); setQuantidade(''); setSerial(''); setDestinoId('');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Enviar Item para Técnico</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">1. Produto em seu Estoque</label>
          <select value={produtoId} onChange={e => setProdutoId(e.target.value)} required className="mt-1 block w-full p-2 border rounded-md bg-white">
            <option value="">Selecione...</option>
            {produtosDisponiveis.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        
        {produtoSelecionado?.tipo === 'QUANTIDADE' && (
          <div>
            <label className="text-sm font-medium">2. Quantidade a Enviar</label>
            <input type="number" min="1" value={quantidade} onChange={e => setQuantidade(e.target.value)} required placeholder="Ex: 5" className="mt-1 block w-full p-2 border rounded-md" />
          </div>
        )}

        {produtoSelecionado?.tipo === 'SERIALIZADO' && (
          <div>
            <label className="text-sm font-medium">2. Nº de Série do Item</label>
            <input type="text" value={serial} onChange={e => setSerial(e.target.value)} required placeholder="Digite o serial" className="mt-1 block w-full p-2 border rounded-md" />
          </div>
        )}
        
        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <div>
          <label className="text-sm font-medium">3. Enviar para o Técnico</label>
          <select onChange={e => {
            console.log(e.target.value)
            setDestinoId(e.target.value)}} required className="mt-1 block w-full p-2 border rounded-md bg-white" disabled={!produtoId}>
            <option value="">Selecione um técnico...</option>
            {tecnicos.map(tecnico => (
              <option key={tecnico.id} value={tecnico.localizacaoId!}>{tecnico.name}</option>
            ))}
          </select>
          {destinoId}
        </div>

        <div className="text-right pt-2">
          <button type="submit" disabled={!produtoId || !destinoId || isLoading} className="w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
            {isLoading ? 'Transferindo...' : 'Confirmar Envio'}
          </button>
        </div>
      </form>
    </div>
  );
}