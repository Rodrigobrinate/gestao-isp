// app/components/movimentacao/TecnicoView.tsx
'use client';

import { useState, useEffect, useCallback, useMemo, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { AlertCircle, CheckCircle, Wrench, ArrowUpCircle, ChevronsDown, ShoppingCart, ListChecks } from 'lucide-react';
import type { Prisma, Produto, Localizacao, User } from '@prisma/client';

// --- Tipos Completos para os Dados ---
type ItemEstoqueCompleto = Prisma.ItemEstoqueGetPayload<{ include: { produto: true; localizacao: true; } }>;
type SolicitacaoCompleta = Prisma.SolicitacaoGetPayload<{ include: { produto: true; solicitante: true; } }>;

// ---
// --- SUB-COMPONENTE: Tabela de Estoque do Técnico ---
// ---
const ITENS_VISIVEIS_INICIALMENTE = 5;
const ITENS_PARA_CARREGAR_MAIS = 10;

function MeuEstoqueTable({ itens, onInstalar, onDevolver }: {
  itens: ItemEstoqueCompleto[],
  onInstalar: (itemId: string) => void,
  onDevolver: (item: ItemEstoqueCompleto) => void,
}) {
  if (!Array.isArray(itens)) {
    console.error("MeuEstoqueTable recebeu 'itens' que não é um array:", itens);
    return <div className="p-6 bg-red-100 text-red-800 rounded-lg shadow-md">Erro ao carregar itens do estoque.</div>;
  }

  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});

  const estoqueAgrupado = useMemo(() => {
    return itens.reduce((acc, item) => {
      const nomeProduto = item.produto.nome;
      if (!acc[nomeProduto]) {
        acc[nomeProduto] = { tipo: item.produto.tipo, itens: [] };
      }
      acc[nomeProduto].itens.push(item);
      return acc;
    }, {} as Record<string, { tipo: string, itens: ItemEstoqueCompleto[] }>);
  }, [itens]);

  useEffect(() => {
    const initialCounts: Record<string, number> = {};
    for (const nomeProduto in estoqueAgrupado) {
      initialCounts[nomeProduto] = ITENS_VISIVEIS_INICIALMENTE;
    }
    setVisibleCounts(initialCounts);
  }, [estoqueAgrupado]);

  const handleShowMore = (nomeProduto: string) => {
    setVisibleCounts(prev => ({ ...prev, [nomeProduto]: (prev[nomeProduto] || 0) + ITENS_PARA_CARREGAR_MAIS }));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Meu Estoque Disponível</h2>
      <div className="space-y-6 max-h-[60vh] overflow-y-auto">
        {Object.keys(estoqueAgrupado).length > 0 ? Object.entries(estoqueAgrupado).map(([nome, grupo]) => {
          const countToShow = visibleCounts[nome] || ITENS_VISIVEIS_INICIALMENTE;
          const remainingCount = grupo.itens.length - countToShow;
          return (
            <div key={nome}>
              <p className="font-semibold">{nome} <span className="text-gray-500 font-normal">({grupo.itens.length} unid. total)</span></p>
              <ul className="pl-4 mt-2 space-y-2">
                {grupo.itens.slice(0, countToShow).map(item => (
                  <li key={item.id} className="flex justify-between items-center text-sm border-b pb-2">
                    <span>{grupo.tipo === 'SERIALIZADO' ? `Serial: ${item.serialNumber}` : 'Item de Quantidade'}</span>
                    <div className="flex gap-2">
                      <button onClick={() => onDevolver(item)} title="Devolver para Região" className="p-2 text-orange-600 hover:bg-orange-100 rounded-full"><ArrowUpCircle size={16}/></button>
                      <button onClick={() => onInstalar(item.id)} title="Marcar como Instalado" className="p-2 text-green-600 hover:bg-green-100 rounded-full"><Wrench size={16}/></button>
                    </div>
                  </li>
                ))}
              </ul>
              {remainingCount > 0 && (
                <div className="pl-4 mt-2"><button onClick={() => handleShowMore(nome)} className="text-sm text-blue-600 hover:underline flex items-center gap-1"><ChevronsDown size={16} />Mostrar mais ({remainingCount} restantes)</button></div>
              )}
            </div>
          )
        }) : <p className="text-center text-gray-500">Você não possui itens em estoque.</p>}
      </div>
    </div>
  );
}

// ---
// --- SUB-COMPONENTE: Formulário de Solicitação ---
// ---
function SolicitacaoForm({ produtosDoCatalogo, currentUser, onSubmit, isLoading }: {
  produtosDoCatalogo: Produto[],
  currentUser: any,
  onSubmit: (data: any) => Promise<boolean>,
  isLoading: boolean
}) {
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

    if (success) { setProdutoId(''); setQuantidade(''); setObservacao(''); }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><ShoppingCart size={24} /> Solicitar Material</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Produto</label>
          <select value={produtoId} onChange={e => setProdutoId(e.target.value)} required className="mt-1 block w-full p-2 border rounded-md bg-white">
            <option value="">Selecione...</option>
            {produtosDoCatalogo.map(p => (<option key={p.id} value={p.id}>{p.nome}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantidade</label>
          <input type="number" min="1" value={quantidade} onChange={e => setQuantidade(e.target.value)} required placeholder="Ex: 10" className="mt-1 block w-full p-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Observação (Opcional)</label>
          <textarea value={observacao} onChange={e => setObservacao(e.target.value)} placeholder="Ex: Urgente" rows={2} className="mt-1 block w-full p-2 border rounded-md"></textarea>
        </div>
        <div className="text-right pt-2">
          <button type="submit" disabled={isLoading} className="w-full px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2">
            {isLoading ? 'Enviando...' : 'Enviar Solicitação'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ---
// --- SUB-COMPONENTE: Tabela de Minhas Solicitações ---
// ---
function MinhasSolicitacoesTable({ solicitacoes }: { solicitacoes: SolicitacaoCompleta[] }) {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'PENDENTE': return 'bg-yellow-100 text-yellow-800';
      case 'APROVADO': return 'bg-green-100 text-green-800';
      case 'REJEITADO': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><ListChecks size={24}/> Minhas Solicitações</h2>
      <div className="overflow-x-auto max-h-72">
        <table className="w-full text-left">
          <thead><tr className="border-b text-sm"><th className="p-2">Data</th><th className="p-2">Produto</th><th className="p-2">Qtd.</th><th className="p-2">Status</th></tr></thead>
          <tbody>
            {solicitacoes.length > 0 ? solicitacoes.map(sol => (
              <tr key={sol.id} className="border-b hover:bg-gray-50 text-sm">
                <td className="p-2">{new Date(sol.createdAt).toLocaleDateString('pt-BR')}</td>
                <td className="p-2 font-medium">{sol.produto.nome}</td>
                <td className="p-2">{sol.quantidade}</td>
                <td className="p-2"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(sol.status)}`}>{sol.status}</span></td>
              </tr>
            )) : (<tr><td colSpan={4} className="text-center p-4 text-gray-500">Nenhuma solicitação encontrada.</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// ---
// --- COMPONENTE PRINCIPAL: TecnicoView ---
// ---
export function TecnicoView() {
  const { data: session, status: sessionStatus } = useSession();

  const [meusItens, setMeusItens] = useState<ItemEstoqueCompleto[]>([]);
  const [minhasSolicitacoes, setMinhasSolicitacoes] = useState<SolicitacaoCompleta[]>([]);
  const [produtosCatalogo, setProdutosCatalogo] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success', message: string } | null>(null);

  // @ts-ignore
  const minhaLocalizacao: Localizacao | undefined = session?.user?.localizacao;
  // @ts-ignore
  const regiaoDoTecnicoId = minhaLocalizacao?.parentId;

  const fetchData = useCallback(async () => {
    // @ts-ignore
    const userId = session?.user?.id;
    if (!minhaLocalizacao?.id || !userId) { 
      if (sessionStatus === 'authenticated') setFeedback({type: 'error', message: "Usuário não vinculado a uma localidade."});
      setLoading(false); 
      return; 
    }

    setLoading(true);
    setFeedback(null);
    try {
      const [resItens, resProdutos, resSolicitacoes] = await Promise.all([
        fetch(`/api/itens-estoque?regiaoId=${minhaLocalizacao.id}&status=EM_ESTOQUE`, { cache: 'no-store' }),
        fetch('/api/produtos', { cache: 'no-store' }),
        fetch(`/api/solicitacoes?solicitanteId=${userId}`, { cache: 'no-store' }),
      ]);
      
      const dataItens = await resItens.json();
      setMeusItens(Array.isArray(dataItens) ? dataItens : []);
      
      const dataProdutos = await resProdutos.json();
      setProdutosCatalogo(Array.isArray(dataProdutos) ? dataProdutos : []);
      
      const dataSolicitacoes = await resSolicitacoes.json();
      setMinhasSolicitacoes(Array.isArray(dataSolicitacoes) ? dataSolicitacoes : []);

    } catch (error) {
      setFeedback({ type: 'error', message: "Falha ao carregar dados." });
      setMeusItens([]); setProdutosCatalogo([]); setMinhasSolicitacoes([]);
    } finally {
      setLoading(false);
    }
  }, [session, sessionStatus, minhaLocalizacao]);

  useEffect(() => {
    if (sessionStatus === 'authenticated') fetchData();
  }, [sessionStatus, fetchData]);

  const handleAction = async (res: Response, successMsg: string, errorMsg: string) => {
    setLoading(true);
    if (res.ok) {
      setFeedback({type: 'success', message: successMsg});
      await fetchData();
      return true;
    }
    const err = await res.json();
    setFeedback({type: 'error', message: `${errorMsg}: ${err.message}`});
    setLoading(false);
    return false;
  };

  const handleSolicitacao = async (data: any) => {
    const res = await fetch('/api/solicitacoes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return handleAction(res, "Solicitação enviada com sucesso!", "Erro ao solicitar");
  };

  const handleInstalar = async (itemId: string) => {
    if (!window.confirm("Confirmar instalação? Esta ação mudará o status do item para 'INSTALADO'.")) return;
    const res = await fetch(`/api/itens-estoque/${itemId}/instalar`, { method: 'PUT' });
    return handleAction(res, "Item marcado como instalado!", "Erro ao instalar");
  };

  const handleDevolver = async (item: ItemEstoqueCompleto) => {
    if (!regiaoDoTecnicoId) { alert("Erro: Sua região não foi encontrada."); return; }
    if (!window.confirm(`Devolver ${item.produto.nome} para a central da sua região?`)) return;

    const res = await fetch('/api/movimentacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        produtoId: item.produtoId,
        serialNumber: item.serialNumber,
        quantidade: item.produto.tipo === 'QUANTIDADE' ? 1 : undefined,
        origemId: item.localizacaoId,
        destinoId: regiaoDoTecnicoId,
        // @ts-ignore
        responsavelId: session?.user?.id,
      }),
    });
    return handleAction(res, "Item devolvido com sucesso!", "Erro ao devolver");
  };

  if (loading) return <p className='text-center'>Carregando visão do técnico...</p>;

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
          <SolicitacaoForm
            produtosDoCatalogo={produtosCatalogo}
            // @ts-ignore
            currentUser={session?.user}
            onSubmit={handleSolicitacao}
            isLoading={loading}
          />
          <MinhasSolicitacoesTable solicitacoes={minhasSolicitacoes} />
        </div>
        
        <div className="lg:col-span-2">
          <MeuEstoqueTable
            itens={meusItens}
            onInstalar={handleInstalar}
            onDevolver={handleDevolver}
          />
        </div>
      </div>
    </div>
  );
}