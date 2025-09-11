// app/components/movimentacao/GerenteRegionalView.tsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { GerenteTransferenciaForm } from './GerenteTransferenciaForm';
import { SolicitacaoForm } from './SolicitacaoForm';
import { EstoqueDisponivelAgrupado } from './EstoqueDisponivelAgrupado';
import { EstoquePorTecnico } from './EstoquePorTecnico';
import { TotalEstoqueRegiao } from './TotalEstoqueRegiao';
import type { Prisma, Produto, Localizacao, User } from '@prisma/client';
import { MinhasSolicitacoesTable } from './MinhasSolicitacoesTable'; // Re-importado

import { EstoquePorTecnicoAgrupado } from './EstoquePorTecnicoAgrupado'; // Importar o novo componente
import { SolicitacoesTecnicosTable } from './SolicitacoesTecnicosTable';
import { EstoqueDisponivelCard } from '../dashboard/EstoqueDisponivelCard';

// Tipos
type UserComLocalizacao = User & { localizacao: Localizacao | null };
type ItemEstoqueCompleto = Prisma.ItemEstoqueGetPayload<{ include: { produto: true; localizacao: true; } }>;
type SolicitacaoCompleta = Prisma.SolicitacaoGetPayload<{ include: { produto: true; solicitante: true; } }>;

export function GerenteRegionalView() {
  const { data: session, status: sessionStatus } = useSession() as any
  const [estoqueTecnicosAgrupado, setEstoqueTecnicosAgrupado] = useState([]); // NOVO STATE

  const [produtosCatalogo, setProdutosCatalogo] = useState<Produto[]>([]);
  const [itensDaRegiao, setItensDaRegiao] = useState<ItemEstoqueCompleto[]>([]);
  const [tecnicosDaRegiao, setTecnicosDaRegiao] = useState<UserComLocalizacao[]>([]);
  const [loading, setLoading] = useState(true);
    const [minhasSolicitacoes, setMinhasSolicitacoes] = useState<SolicitacaoCompleta[]>([]); // Re-adicionado
  const [solicitacoesDeTecnicos, setSolicitacoesDeTecnicos] = useState<SolicitacaoCompleta[]>([]);

  
  // @ts-ignore
  const minhaRegiao: Localizacao | undefined = session?.user?.localizacao;

  const fetchData = useCallback(async () => {
    // @ts-ignore
    const regiaoId = session?.user?.localizacao?.id;
    console.log(`[GerenteRegionalView] Minha região ID: ${regiaoId}`)
        const userId = session?.user?.id;

     if (!regiaoId) {
      console.error("Gerente sem região definida na sessão.");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const [resItens, resTecnicos, resProdutos, resMinhasSol, resSolTecnicos, estoqueTecnicosAgrupado] = await Promise.all([
        fetch(`/api/itens-estoque?regiaoId=${regiaoId}`, { cache: 'no-store' }),
        fetch(`/api/users?regiaoId=${regiaoId}`, { cache: 'no-store' }),
        fetch('/api/produtos', { cache: 'no-store' }),
        fetch(`/api/solicitacoes?solicitanteId=${userId}`, { cache: 'no-store' }),
        fetch(`/api/gerente/solicitacoes-tecnicos`, { cache: 'no-store' }),
        fetch(`/api/estoque/por-tecnico?regiaoId=${regiaoId}`, { cache: 'no-store' }),

      ]);
      
      setItensDaRegiao(await resItens.json());
      setTecnicosDaRegiao(await resTecnicos.json());
      setProdutosCatalogo(await resProdutos.json());
      setMinhasSolicitacoes(await resMinhasSol.json());
      setSolicitacoesDeTecnicos(await resSolTecnicos.json());
      setEstoqueTecnicosAgrupado(await estoqueTecnicosAgrupado.json());

    } catch (err) {
      console.error("Falha ao carregar dados da visão do gerente:", err);
    } finally {
      setLoading(false);
    }
  }, [sessionStatus, session]); // CORREÇÃO: A dependência principal é o status e a sessão em si

  useEffect(() => {
    fetchData();
  }, [fetchData]); 

  const { estoqueDisponivel, estoqueComTecnicos } = useMemo(() => {
    const disponivel = itensDaRegiao.filter(item => item.localizacaoId === minhaRegiao?.id);
    const comTecnicos = itensDaRegiao.filter(item => item.localizacaoId !== minhaRegiao?.id);
   // console.log(`[GerenteRegionalView] Itens na região: ${itensDaRegiao.length}, Disponível: ${disponivel.length}, Com técnicos: ${comTecnicos.length}`);
    return { estoqueDisponivel: disponivel, estoqueComTecnicos: comTecnicos };
  }, [itensDaRegiao, minhaRegiao]);

  const handleAction = async (res: Response): Promise<boolean> => {
    if (res.ok) await fetchData();
    return res.ok;
  };
 //const handleTransferencia = (data: any) => handleAction(fetch('/api/movimentacoes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }));
 // const handleSolicitacao = (data: any) => handleAction(fetch('/api/solicitacoes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }));
   const handleUpdateSolicitacao = async (id: string, status: 'APROVADO' | 'REJEITADO', responsavelId: string) => {
    const res = await fetch(`/api/solicitacoes/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({  status, responsavelId})
    });
    return handleAction(res);
  };
  const handleTransferencia = async (data: any) => {
    const res = await fetch('/api/movimentacoes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    return handleAction(res);
  };

  const handleSolicitacao = async (data: any) => {
    const res = await fetch('/api/solicitacoes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    return handleAction(res);
  };
  
  if (loading) return <p>Carregando visão do gerente...</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Coluna de Ações (Formulários) */}
      <div className="lg:col-span-1 space-y-8">
        <SolicitacaoForm
          produtosDoCatalogo={produtosCatalogo}
          // @ts-ignore
          currentUser={session?.user}
          onSubmit={handleSolicitacao}
          isLoading={loading}
        />
        <GerenteTransferenciaForm
          itensDoGerente={estoqueDisponivel}
          tecnicos={tecnicosDaRegiao}
          // @ts-ignore
          currentUser={session?.user}
          localidadeGerente={minhaRegiao}
          onTransferir={handleTransferencia}
          isLoading={loading}
        />
      </div>

      {/* Coluna de Visualização (Tabelas Agrupadas) */}
      <div className="lg:col-span-2 space-y-8">
        <TotalEstoqueRegiao itens={itensDaRegiao} />
        <EstoqueDisponivelCard itens={estoqueDisponivel} />
        
                <EstoquePorTecnicoAgrupado dados={estoqueTecnicosAgrupado} />
        <SolicitacoesTecnicosTable solicitacoes={solicitacoesDeTecnicos} onUpdate={handleUpdateSolicitacao} />

        <MinhasSolicitacoesTable solicitacoes={minhasSolicitacoes} />

      </div>
    </div>
  );
}