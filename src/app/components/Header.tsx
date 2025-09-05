// app/components/Header.tsx
'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, LogIn, LogOut, Home } from 'lucide-react'; // Ícones para um visual melhor

export default function Header() {
  const { data: session, status } = useSession();

  // status pode ser 'loading', 'authenticated', ou 'unauthenticated'
  const isLoading = status === 'loading';

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo ou Nome do Sistema */}
        <Link href="/" className="text-xl font-bold text-gray-800 hover:text-gray-700">
          Gestão ISP
        </Link>

        {/* Itens de Navegação e Sessão */}
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="text-gray-500">Carregando...</div>
          ) : session ? (
            // --- Usuário Autenticado ---
            <>
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                <Home size={18} />
                <span>Início</span>
              </Link>
              <Link href="/dashboard/produtos" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <span className="text-gray-700">Olá, {session.user?.name || 'Usuário'}!</span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })} // Redireciona para a home após o logout
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                <LogOut size={18} />
                Sair
              </button>
            </>
          ) : (
            // --- Usuário Não Autenticado ---
            <Link
              href="/login"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <LogIn size={18} />
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}