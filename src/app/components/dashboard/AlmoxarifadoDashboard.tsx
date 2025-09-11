// app/components/dashboard/AlmoxarifadoDashboard.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { StatCard } from './StatCard';
import { Package, Truck, BellRing } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function AlmoxarifadoDashboard() {
    const { data: session } = useSession();
  
  const [stats, setStats] = useState({ totalItens: 0, produtosDistintos: 0, solicitacoesPendentes: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
        const regiaoId = session?.user?.localizacao?.id;

    setLoading(true);
    try {
      const [resItens, resProdutos, resSolicitacoes] = await Promise.all([
        fetch(`/api/itens-estoque?regiaoId=${regiaoId}`, { cache: 'no-store' }),
        fetch('/api/produtos', { cache: 'no-store' }),
        fetch('/api/solicitacoes?status=PENDENTE', { cache: 'no-store' }),
      ]);
      const dataItens = await resItens.json();
      const dataProdutos = await resProdutos.json();
      const dataSolicitacoes = await resSolicitacoes.json();

      setStats({
        totalItens: Array.isArray(dataItens) ? dataItens.length : 0,
        produtosDistintos: Array.isArray(dataProdutos) ? dataProdutos.length : 0,
        solicitacoesPendentes: Array.isArray(dataSolicitacoes) ? dataSolicitacoes.length : 0,
      });

    } catch (error) {
      console.error("Falha ao carregar dados da dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <p className="p-8">Carregando dashboard do almoxarifado...</p>;
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard do Almoxarifado</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total de Itens em Estoque"
          value={stats.totalItens}
          icon={Package}
        />
        <StatCard 
          title="Produtos Distintos no Catálogo"
          value={stats.produtosDistintos}
          icon={Truck}
        />
        <div className="relative">
          <StatCard 
            title="Solicitações Pendentes"
            value={stats.solicitacoesPendentes}
            icon={BellRing}
          />
          {stats.solicitacoesPendentes > 0 && (
            <span className="absolute top-4 right-4 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold">Ações Rápidas</h2>
        <p className="text-gray-600 mt-2 mb-4">Gerencie o fluxo de entrada e saída de materiais.</p>
        <Link href="/dashboard/produtos/estoque/movimentacao" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
          Ir para a Tela de Movimentação
        </Link>
      </div>
    </div>
  );
}