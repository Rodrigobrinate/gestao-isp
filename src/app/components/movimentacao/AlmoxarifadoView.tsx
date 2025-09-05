// app/components/movimentacao/AlmoxarifadoView.tsx
'use client';

import { useState, useEffect, useMemo, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { Check, X, Send, ArrowLeftRight, AlertCircle, CheckCircle } from 'lucide-react';
import type { Produto, Localizacao, User, ItemEstoque as PrismaItemEstoque, Solicitacao as PrismaSolicitacao, Movimentacao as PrismaMovimentacao } from '@prisma/client';

// --- Interfaces para Tipagem dos Dados com Relações ---
// Tipos mais completos para facilitar o uso dos dados que vêm da API
type ItemEstoque = PrismaItemEstoque & { produto: Produto; localizacao: Localizacao; };
type Solicitacao = PrismaSolicitacao & { produto: Produto; solicitante: User; };
type Movimentacao = PrismaMovimentacao & { itemEstoque: ItemEstoque; origem: Localizacao; destino: Localizacao; responsavel: User; };

// ---
// --- Componente Principal: AlmoxarifadoView
// ---
export function AlmoxarifadoView() {
  const { data: session } = useSession();
  
  // --- Estados da View ---
  const [itensEstoque, setItensEstoque] = useState<ItemEstoque[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [localidades, setLocalidades] = useState<Localizacao[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success', message: string } | null>(null);

  // --- Funções de Busca de Dados ---
  const fetchData = async () => {
    try {
      setFeedback(null); 
      const [resItens, resSol, resMov, resLoc] = await Promise.all([
        fetch('/api/itens-estoque?status=EM_ESTOQUE'),
        fetch('/api/solicitacoes'),
        fetch('/api/movimentacoes'),
        fetch('/api/localidades'),
      ]);
      
      if (!resItens.ok || !resSol.ok || !resMov.ok || !resLoc.ok) {
        throw new Error("Falha na comunicação com o servidor.");
      }
      
      setItensEstoque(await resItens.json());
      setSolicitacoes(await resSol.json());
      setMovimentacoes(await resMov.json());
      setLocalidades(await resLoc.json());

    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Dados Derivados (Calculados a partir do state) ---
  const localidadeAlmoxarifado = useMemo(() => 
    localidades.find(l => l.nome.toLowerCase().includes('almoxarifado')), 
    [localidades]
  );

  const produtosDisponiveis = useMemo(() => {
    if (!localidadeAlmoxarifado) return [];
    const itensNoAlmoxarifado = itensEstoque.filter(item => item.localizacaoId === localidadeAlmoxarifado.id);
    return [...new Map(
      itensNoAlmoxarifado.map(item => [item.produto.id, item.produto])
    ).values()];
  }, [itensEstoque, localidadeAlmoxarifado]);
  
  // --- Handlers de Ações ---
  const handleTransferencia = async (data: any): Promise<boolean> => {
    setLoading(true);
    const res = await fetch('/api/movimentacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setFeedback({ type: 'success', message: 'Transferência realizada com sucesso!' });
      await fetchData();
      return true;
    } else {
      const errorData = await res.json();
      setFeedback({ type: 'error', message: `Erro: ${errorData.message}` });
      setLoading(false);
      return false;
    }
  };

  const handleUpdateSolicitacao = async (id: string, status: 'APROVADO' | 'REJEITADO') => {
    setLoading(true);
    await fetch(`/api/solicitacoes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setFeedback({ type: 'success', message: `Solicitação atualizada com sucesso.` });
    await fetchData();
  };

  if (loading && !itensEstoque.length) return <p className="text-center mt-8">Carregando dados do almoxarifado...</p>;

  return (
    <div className="space-y-8">
      {feedback && (
        <div className={`p-4 rounded-md flex items-center gap-3 text-sm ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {feedback.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
          <p>{feedback.message}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-8">
          <TransferenciaForm
            produtosDisponiveis={produtosDisponiveis}
            localidades={localidades}
            // @ts-ignore
            currentUser={session?.user}
            localidadeAlmoxarifado={localidadeAlmoxarifado}
            onTransferir={handleTransferencia}
            isLoading={loading}
          />
        </div>

        <div className="lg:col-span-2 space-y-8">
          <SolicitacoesTable
            solicitacoes={solicitacoes}
            onUpdate={handleUpdateSolicitacao}
          />
          <MovimentacoesRecentes
            movimentacoes={movimentacoes}
          />
        </div>
      </div>
    </div>
  );
}

// ---
// --- SUB-COMPONENTE: Formulário de Transferência
// ---
function TransferenciaForm({ produtosDisponiveis, localidades, currentUser, localidadeAlmoxarifado, onTransferir, isLoading }: any) {
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [serial, setSerial] = useState('');
  const [destinoId, setDestinoId] = useState('');
  const [buscaProduto, setBuscaProduto] = useState('');

  const produtoSelecionado = produtosDisponiveis.find((p: Produto) => p.id === produtoId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const success = await onTransferir({
      produtoId,
      quantidade: Number(quantidade),
      serialNumber: serial,
      origemId: localidadeAlmoxarifado?.id,
      destinoId,
      responsavelId: currentUser.id,
    });
    if (success) {
      setProdutoId(''); setQuantidade(''); setSerial(''); setDestinoId(''); setBuscaProduto('');
    }
  };

  const produtosFiltrados = produtosDisponiveis.filter((p: Produto) => 
    p.nome.toLowerCase().includes(buscaProduto.toLowerCase())
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Send size={24} /> Transferir Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">1. Buscar e Selecionar Produto</label>
          <input
            type="text"
            placeholder="Digite para buscar..."
            value={buscaProduto}
            onChange={e => setBuscaProduto(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-md mb-2"
          />
          <select value={produtoId} onChange={e => setProdutoId(e.target.value)} required className="block w-full p-2 border rounded-md bg-white">
            <option value="">{produtosFiltrados.length > 0 ? 'Selecione um produto' : 'Nenhum produto encontrado'}</option>
            {produtosFiltrados.map((p: Produto) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        
        {produtoSelecionado?.tipo === 'QUANTIDADE' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">2. Quantidade</label>
            <input type="number" min="1" value={quantidade} onChange={e => setQuantidade(e.target.value)} required placeholder="Ex: 50" className="mt-1 block w-full p-2 border rounded-md" />
          </div>
        )}

        {produtoSelecionado?.tipo === 'SERIALIZADO' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">2. Nº de Série</label>
            <input type="text" value={serial} onChange={e => setSerial(e.target.value)} required placeholder="Escaneie ou digite o serial" className="mt-1 block w-full p-2 border rounded-md" />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700">3. Destino</label>
          <select value={destinoId} onChange={e => setDestinoId(e.target.value)} required className="mt-1 block w-full p-2 border rounded-md bg-white" disabled={!produtoId}>
            <option value="">Selecione...</option>
            {localidades.filter((l: Localizacao) => l.id !== localidadeAlmoxarifado?.id).map((l: Localizacao) => <option key={l.id} value={l.id}>{l.nome}</option>)}
          </select>
        </div>

        <div className="text-right pt-2">
          <button type="submit" disabled={!produtoId || !destinoId || isLoading} className="w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isLoading ? 'Processando...' : 'Confirmar Transferência'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ---
// --- SUB-COMPONENTE: Tabela de Solicitações
// ---
function SolicitacoesTable({ solicitacoes, onUpdate }: { solicitacoes: Solicitacao[], onUpdate: (id: string, status: 'APROVADO' | 'REJEITADO') => void }) {
  const solicitacoesPendentes = solicitacoes.filter(s => s.status === 'PENDENTE');
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Solicitações Pendentes</h2>
      {solicitacoesPendentes.length === 0 ? (<p className="text-sm text-gray-500">Nenhuma solicitação pendente no momento.</p>) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b text-sm"><th className="p-2">Data</th><th className="p-2">Solicitante</th><th className="p-2">Produto</th><th className="p-2">Qtd.</th><th className="p-2">Ações</th></tr></thead>
            <tbody>
              {solicitacoesPendentes.map(sol => (
                <tr key={sol.id} className="border-b hover:bg-gray-50 text-sm">
                  <td className="p-2">{new Date(sol.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="p-2">{sol.solicitante.name}</td>
                  <td className="p-2">{sol.produto.nome}</td>
                  <td className="p-2 font-bold">{sol.quantidade}</td>
                  <td className="p-2 flex gap-2">
                    <button onClick={() => onUpdate(sol.id, 'APROVADO')} title="Aprovar" className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200"><Check size={16} /></button>
                    <button onClick={() => onUpdate(sol.id, 'REJEITADO')} title="Rejeitar" className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200"><X size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---
// --- SUB-COMPONENTE: Histórico de Movimentações
// ---
function MovimentacoesRecentes({ movimentacoes }: { movimentacoes: Movimentacao[] }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><ArrowLeftRight size={24}/> Histórico de Movimentações</h2>
       <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left">
            <thead><tr className="border-b text-sm"><th className="p-2">Data</th><th className="p-2">Item (Serial)</th><th className="p-2">De</th><th className="p-2">Para</th><th className="p-2">Por</th></tr></thead>
            <tbody>
              {movimentacoes.slice(0, 15).map(mov => (
                <tr key={mov.id} className="border-b hover:bg-gray-50 text-sm">
                  <td className="p-2">{new Date(mov.data).toLocaleString('pt-BR')}</td>
                  <td className="p-2 font-medium">{mov.itemEstoque.produto.nome} <span className="text-gray-500">({mov.itemEstoque.serialNumber || 'Qtd'})</span></td>
                  <td className="p-2">{mov.origem.nome}</td>
                  <td className="p-2">{mov.destino.nome}</td>
                  <td className="p-2">{mov.responsavel.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  );
}