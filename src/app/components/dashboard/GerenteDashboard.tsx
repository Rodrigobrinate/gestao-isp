// app/components/dashboard/GerenteDashboard.tsx
'use client';
import { EstoquePorTecnicoAgrupado } from '../movimentacao/EstoquePorTecnicoAgrupado';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { StatCard } from './StatCard';
import { EstoqueDisponivelCard } from './EstoqueDisponivelCard';

 // Mantém o novo componente
import { Package, Wrench, Warehouse } from 'lucide-react';
import type { Prisma } from '@prisma-client';

// Tipo para os itens de estoque com suas relações (produto e localização)
type ItemEstoqueCompleto = Prisma.ItemEstoqueGetPayload<{
  include: {
    produto: true;
    localizacao: true;
  }
}>;

// Tipo para os dados agrupados que virão da API
type EstoqueTecnicoAgrupado = {
  tecnicoId: string;
  tecnicoNome: string;
  totalItens: number;
  produtos: {
    produtoId: string;
    produtoNome: string;
    quantidade: number;
  }[];
};

export default function GerenteDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  
  const [itensDaRegiao, setItensDaRegiao] = useState<ItemEstoqueCompleto[]>([]);
  const [estoqueTecnicosAgrupado, setEstoqueTecnicosAgrupado] = useState<EstoqueTecnicoAgrupado[]>([]);
  const [loading, setLoading] = useState(true);
 const [quantidade, setQuantidade] = useState(0);

  // @ts-ignore
  const minhaRegiao = session?.user?.localizacao;

  // A função de busca continua buscando ambos os endpoints
  const fetchData = useCallback(async () => {
    // @ts-ignore
    const regiaoId = session?.user?.localizacao?.id;
    if (!regiaoId) {
      setLoading(false);
      return;
    }
    

    setLoading(true);
    try {
      const [resItens, resEstoqueTecnicos] = await Promise.all([
        fetch(`/api/itens-estoque?regiaoId=${regiaoId}`, { cache: 'no-store' }),
        fetch(`/api/estoque/por-tecnico?regiaoId=${regiaoId}`, { cache: 'no-store' })
      ]);

      if (resItens.ok) {
        const data = await resItens.json();
        setItensDaRegiao(Array.isArray(data) ? data : []);
      } else {
        console.error("Falha ao buscar itens da região:", resItens.statusText);
        setItensDaRegiao([]);
      }

      if (resEstoqueTecnicos.ok) {
        const data = await resEstoqueTecnicos.json();
        setEstoqueTecnicosAgrupado(Array.isArray(data) ? data : []);
      } else {
        console.error("Falha ao buscar estoque agrupado por técnico:", resEstoqueTecnicos.statusText);
        setEstoqueTecnicosAgrupado([]);
      }

    } catch (error) {
      console.error("Erro de conexão ao buscar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchData();
    }
  }, [sessionStatus, fetchData]);

  // CORREÇÃO: Voltamos a calcular todos os KPIs a partir da mesma fonte de dados (`itensDaRegiao`)
  const { estoqueDisponivel, estoqueComTecnicos } = useMemo(() => {
    if (!minhaRegiao) return { estoqueDisponivel: [], estoqueComTecnicos: [] };
    
    // Calcula o estoque disponível (itens na localização do gerente)
    const disponivel = itensDaRegiao.filter(item => item.localizacaoId === minhaRegiao.id);
    
    // Calcula o estoque com técnicos (itens em qualquer outra localização da região)
    const comTecnicos = itensDaRegiao.filter(item => item.localizacaoId !== minhaRegiao.id);
    
    estoqueTecnicosAgrupado.map(tecnico => {
        tecnico.produtos.map(produto => {
            //const totalNoCampo = comTecnicos.filter(item => item.produtoId === produto.produtoId).length;
            console.log(produto.quantidade)
            setQuantidade(produto.quantidade)
        })
    })
    console.log(estoqueTecnicosAgrupado)
    // Retorna os arrays completos para usar tanto o `.length` quanto os dados em si
    return { estoqueDisponivel: disponivel, estoqueComTecnicos: comTecnicos };
  }, [itensDaRegiao, minhaRegiao]);

  if (loading) {
    return <p className="p-8 text-center text-gray-500">Carregando dashboard do gerente...</p>;
  }

  // @ts-ignore
  if (sessionStatus === 'authenticated' && !session?.user?.localizacao) {
    return <p className="p-8 text-center text-red-600">Erro: Seu usuário não está vinculado a uma região.</p>;
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard da Região: {minhaRegiao?.nome}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total de Itens na Região"
          value={itensDaRegiao.length}
          icon={Package}
        />
        <StatCard 
          title="Itens em Campo (com Técnicos)"
          // CORREÇÃO: O valor agora é o tamanho do array filtrado, garantindo consistência
          value={itensDaRegiao.length - estoqueDisponivel.length}
          icon={Wrench}
        />
        <StatCard 
          title="Itens Disponíveis para Alocação"
          value={estoqueDisponivel.length}
          icon={Warehouse}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <EstoqueDisponivelCard itens={estoqueDisponivel} />
        {/* Este componente continua usando a nova fonte de dados, mais eficiente para a visualização */}
        <EstoquePorTecnicoAgrupado dados={estoqueTecnicosAgrupado} />
      </div>
    </div>
  );
}