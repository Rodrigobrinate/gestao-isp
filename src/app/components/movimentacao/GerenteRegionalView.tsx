




// app/components/movimentacao/GerenteRegionalView.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { SolicitacaoForm } from './SolicitacaoForm';
import { GerenteTransferenciaForm } from './GerenteTransferenciaForm';
import { MinhasSolicitacoesTable } from './MinhasSolicitacoesTable';
import { EstoqueRegionalTable } from './EstoqueRegionalTable'; // Importar nova tabela
import { AlertCircle, CheckCircle } from 'lucide-react';
import type { Prisma, Produto, Localizacao } from '@prisma/client';

// ... (Tipos completos como na versão anterior)
type ItemEstoqueCompleto = Prisma.ItemEstoqueGetPayload<{ include: { produto: true; localizacao: true; } }>;
type SolicitacaoCompleta = Prisma.SolicitacaoGetPayload<{ include: { produto: true; solicitante: true; } }>;

export function GerenteRegionalView() {
  const { data: session } = useSession();

  const [produtosCatalogo, setProdutosCatalogo] = useState<Produto[]>([]);
  const [minhasSolicitacoes, setMinhasSolicitacoes] = useState<SolicitacaoCompleta[]>([]);
  const [itensDaRegiao, setItensDaRegiao] = useState<ItemEstoqueCompleto[]>([]);
  const [localidadesDaRegiao, setLocalidadesDaRegiao] = useState<Localizacao[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success', message: string } | null>(null);

  // @ts-ignore
  const minhaRegiao = session?.user?.localizacao;

  const fetchData = async () => {
    // @ts-ignore
    if (!session?.user?.localizacao) return;
    
    setLoading(true);
    setFeedback(null);
    try {
      // @ts-ignore
      const regiaoId = session.user.localizacao.id;

      const [resProdutos, resItens, resLocalidades, resSol] = await Promise.all([
        fetch('/api/produtos'),
        fetch(`/api/itens-estoque?regiaoId=${regiaoId}`), // Usa a nova API
        fetch('/api/localidades'),
        // @ts-ignore
        fetch(`/api/solicitacoes?solicitanteId=${session.user.id}`), // API otimizada
      ]);
      
      const dataProdutos = await resProdutos.json();
      const dataItens = await resItens.json();
      const dataLocalidades = await resLocalidades.json();
      const dataSolicitacoes = await resSol.json();
      
      setProdutosCatalogo(dataProdutos);
      setItensDaRegiao(dataItens);
      setMinhasSolicitacoes(dataSolicitacoes);
      
      // Filtra as localidades que pertencem à região do gerente
      const localidadesFiltradas = dataLocalidades.filter((l: Localizacao) => l.parentId === regiaoId || l.id === regiaoId);
      setLocalidadesDaRegiao(localidadesFiltradas);

    } catch (err: any) {
      setFeedback({ type: 'error', message: "Falha ao carregar dados." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // @ts-ignore
    if (session?.user?.localizacao) {
      fetchData();
    }
  }, [session]);

  const handleSolicitacao = async (data: any): Promise<boolean> => { /* ... (mesma função da versão anterior) ... */ };
  const handleTransferencia = async (data: any): Promise<boolean> => { /* ... (mesma função da versão anterior) ... */ };

  if (loading) return <p>Carregando visão do gerente...</p>;

  return (
    <div className="space-y-8">
       {feedback && (
          <div className={`p-4 rounded-md flex items-center gap-3 ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {feedback.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
              <p>{feedback.message}</p>
          </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <SolicitacaoForm
          produtosDoCatalogo={produtosCatalogo}
          // @ts-ignore
          currentUser={session?.user}
          onSubmit={handleSolicitacao}
          isLoading={loading}
        />
       
        <GerenteTransferenciaForm
            itensDoGerente={itensDaRegiao.filter(i => i.localizacaoId === minhaRegiao?.id)}
            tecnicos={localidadesDaRegiao.filter(l => l.tipo === 'TECNICO')}
            // @ts-ignore
            currentUser={session?.user}
            localidadeGerente={minhaRegiao}
            onTransferir={handleTransferencia}
            isLoading={loading}
        />
      </div>

      <div className="space-y-8">
        <MinhasSolicitacoesTable solicitacoes={minhasSolicitacoes} />
        {/* Substituindo a tabela antiga pela nova */}
        <EstoqueRegionalTable
          itensDaRegiao={itensDaRegiao}
          localidadesDaRegiao={localidadesDaRegiao}
        />
      </div>
    </div>
  );
}