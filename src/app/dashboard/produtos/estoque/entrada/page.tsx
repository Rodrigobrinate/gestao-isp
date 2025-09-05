// app/dashboard/estoque/entrada/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Produto, Localizacao, TipoProduto, CondicaoItem } from '@prisma/client';

export default function EntradaEstoquePage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [localidades, setLocalidades] = useState<Localizacao[]>([]);
  
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [quantidade, setQuantidade] = useState('');
  const [localizacaoId, setLocalizacaoId] = useState('');
  const [condicao, setCondicao] = useState<CondicaoItem>('NOVO');
  const [notaFiscal, setNotaFiscal] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [seriais, setSeriais] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Carrega produtos e localidades ao iniciar a página
  useEffect(() => {
    const fetchData = async () => {
      const [resProdutos, resLocalidades] = await Promise.all([
        fetch('/api/produtos'),
        fetch('/api/localidades'),
      ]);
      setProdutos(await resProdutos.json());
      setLocalidades(await resLocalidades.json());
    };
    fetchData();
  }, []);

  const handleProdutoChange = (id: string) => {
    const produto = produtos.find(p => p.id === id) || null;
    setProdutoSelecionado(produto);
    // Limpa os seriais se o produto mudar
    setSeriais(Array(Number(quantidade)).fill(''));
  };

  const handleQuantidadeChange = (qtd: string) => {
    const numQtd = Number(qtd);
    setQuantidade(qtd);
    // Ajusta o tamanho do array de seriais dinamicamente
    if (produtoSelecionado?.tipo === TipoProduto.SERIALIZADO) {
      setSeriais(Array(numQtd > 0 ? numQtd : 0).fill(''));
    }
  };

  const handleSerialChange = (index: number, value: string) => {
    const novosSeriais = [...seriais];
    novosSeriais[index] = value;
    setSeriais(novosSeriais);
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const dadosEntrada = {
        produtoId: produtoSelecionado?.id,
        localizacaoId,
        quantidade: Number(quantidade),
        condicao,
        numeroNotaFiscal: notaFiscal,
        fornecedor,
        seriais: produtoSelecionado?.tipo === TipoProduto.SERIALIZADO ? seriais : undefined,
    };
    
    const res = await fetch('/api/estoque/entrada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosEntrada),
    });

    if(!res.ok) {
        const data = await res.json();
        setError(data.message || 'Falha ao registrar entrada.');
    } else {
        setSuccess('Entrada registrada com sucesso! A página será reiniciada.');
        setTimeout(() => window.location.reload(), 2000);
    }

    setIsLoading(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Registrar Entrada de Estoque</h1>
      <div className="p-8 bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Seleção de Produto */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Produto</label>
              <select onChange={(e) => handleProdutoChange(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                <option value="">Selecione um produto...</option>
                {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>

            {/* Quantidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantidade</label>
              <input type="number" min="1" value={quantidade} onChange={(e) => handleQuantidadeChange(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
            </div>

            {/* Nota Fiscal e Fornecedor */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nº da Nota Fiscal</label>
              <input type="text" value={notaFiscal} onChange={(e) => setNotaFiscal(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fornecedor (Opcional)</label>
              <input type="text" value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
            </div>

            {/* Localização de Destino e Condição */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Localização de Destino</label>
              <select value={localizacaoId} onChange={(e) => setLocalizacaoId(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                <option value="">Selecione uma localidade...</option>
                {localidades.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Condição do Item</label>
              <select value={condicao} onChange={(e) => setCondicao(e.target.value as CondicaoItem)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                <option value="NOVO">Novo</option>
                <option value="REUTILIZADO">Reutilizado</option>
              </select>
            </div>
          </div>
          
          {/* Campos Dinâmicos para Números de Série */}
          {produtoSelecionado?.tipo === TipoProduto.SERIALIZADO && Number(quantidade) > 0 && (
            <div className="pt-6 border-t">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Números de Série</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: Number(quantidade) }).map((_, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700">Serial #{index + 1}</label>
                    <input type="text" value={seriais[index] || ''} onChange={(e) => handleSerialChange(index, e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botão de Submissão e Mensagens */}
          <div className="flex items-center justify-end pt-6 border-t space-x-4">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <button type="submit" disabled={isLoading} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 disabled:bg-gray-400">
              {isLoading ? 'Salvando...' : 'Registrar Entrada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}