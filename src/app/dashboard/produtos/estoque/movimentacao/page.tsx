// app/dashboard/estoque/movimentacao/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// IMPORTAÇÃO REAL
//import { AlmoxarifadoView } from '../../../components/movimentacao/AlmoxarifadoView.tsx';
//import { AlmoxarifadoView } from '@app/components/movimentacao/AlmoxarifadoView.tsx';
import { AlmoxarifadoView } from '@/src/app/components/movimentacao/AlmoxarifadoView';

// --- Placeholders dos outros componentes ---
const GerenteRegionalView = () => <div className="p-6 bg-green-50 rounded-lg">Visão do Gerente: Solicitar Material, Enviar para Técnico</div>;
const TecnicoView = () => <div className="p-6 bg-yellow-50 rounded-lg">Visão do Técnico: Ver meu estoque</div>;
const AcessoNegadoView = () => <div className="p-6 bg-red-50 rounded-lg">Você não tem permissão para acessar esta página.</div>;

export default function MovimentacaoPage() {
  const { data: session, status } = useSession();
  // @ts-ignore
  const userRole = session?.user?.role;

  const renderViewByRole = () => {
    switch (userRole) {
      case 'ALMOXARIFADO':
      case 'ADMIN': // Admin vê como almoxarifado
        return <AlmoxarifadoView />; // <<-- COMPONENTE REAL AGORA
      case 'GERENTE_REGIONAL':
        return <GerenteRegionalView />;
      case 'TECNICO':
        return <TecnicoView />;
      default:
        // Renderiza null enquanto o role não é carregado para evitar piscar "Acesso Negado"
        return userRole ? <AcessoNegadoView /> : null;
    }
  };

  if (status === 'loading') {
    return <p>Carregando sessão...</p>;
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold">Movimentação de Estoque</h1>
      {renderViewByRole()}
    </div>
  );
}