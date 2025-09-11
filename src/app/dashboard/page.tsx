// app/dashboard/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import AlmoxarifadoDashboard from '@/src/app/components/dashboard/AlmoxarifadoDashboard';
import GerenteDashboard from '@/src/app/components/dashboard/GerenteDashboard';

// Placeholder para a visão do técnico
const TecnicoDashboard = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold">Bem-vindo, Técnico</h1>
    <p className="mt-4">Aqui você poderá ver seu estoque e outras informações importantes.</p>
  </div>
);

export default function DashboardRouterPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p className="p-8">Carregando dashboard...</p>;
  }

  // @ts-ignore
  const userRole = session?.user?.role;

  switch (userRole) {
    case 'ADMIN':
    case 'ALMOXARIFADO':
      return <AlmoxarifadoDashboard />;
    
    case 'GERENTE_REGIONAL':
      return <GerenteDashboard />;
    
    case 'TECNICO':
      return <TecnicoDashboard />;

    default:
      return <p className="p-8">Cargo não reconhecido. Contate o administrador.</p>;
  }
}