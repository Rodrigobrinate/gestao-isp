// app/components/Header.tsx
'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, LogIn, LogOut, Home, PackagePlus, ArrowRightLeft, Users, Warehouse, MapPin } from 'lucide-react';

export default function Header() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  // @ts-ignore - Usado porque estendemos o tipo da sessão
  const userRole = session?.user?.role;

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-gray-800 hover:text-gray-700">
          Gestão ISP
        </Link>

        {/* Itens de Navegação e Sessão */}
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="text-gray-500 text-sm">Carregando...</div>
          ) : session ? (
            // --- MENU PARA USUÁRIO AUTENTICADO ---
            <>
              {/* Links Comuns a Todos */}
              <Link href="/dashboard" className="hidden md:flex items-center gap-2 text-gray-600 hover:text-blue-600">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>

              {/* Links do ADMIN e ALMOXARIFADO */}
              {(userRole === 'ADMIN' || userRole === 'ALMOXARIFADO') && (
                <>
                  <Link href="/dashboard/produtos" className="hidden md:flex items-center gap-2 text-gray-600 hover:text-blue-600">
                    <Warehouse size={18} />
                    <span>Catálogo</span>
                  </Link>
                  <Link href="/dashboard/produtos/estoque/entrada" className="hidden md:flex items-center gap-2 text-gray-600 hover:text-blue-600">
                    <PackagePlus size={18} />
                    <span>Entrada</span>
                  </Link>
                   <Link href="/dashboard/admin/localidades" className="hidden md:flex items-center gap-2 text-gray-600 hover:text-blue-600">
        <MapPin size={18} /> {/* Adicione MapPin aos imports do lucide-react */}
        <span>Localidades</span>
    </Link>
    
                </>
              )}
              
              {/* Links de Movimentação (Todos, exceto Técnico talvez) */}
              {(userRole === 'ADMIN' || userRole === 'ALMOXARIFADO' || userRole === 'GERENTE_REGIONAL') && (
                <Link href="/dashboard/produtos/estoque/movimentacao" className="hidden md:flex items-center gap-2 text-gray-600 hover:text-blue-600">
                  <ArrowRightLeft size={18} />
                  <span>Movimentação</span>
                </Link>
              )}
              
              {/* Links de Gestão de Usuários (ADMIN e GERENTE) */}
              {(userRole === 'ADMIN' || userRole === 'GERENTE_REGIONAL') && (
                 <Link href="/dashboard/usuarios" className="hidden md:flex items-center gap-2 text-gray-600 hover:text-blue-600">
                  <Users size={18} />
                  <span>Usuários</span>
                </Link>
              )}

              {userRole === 'GERENTE_REGIONAL' && (
    <Link href="/dashboard/equipe" className="hidden md:flex items-center gap-2 text-gray-600 hover:text-blue-600">
        <Users size={18} />
        <span>Minha Equipe</span>
    </Link>
)}

              {/* Informações do Usuário */}
              <div className="flex items-center gap-2 border-l pl-4">
                <span className="text-gray-700 hidden sm:inline">Olá, {session.user?.name || 'Usuário'}!</span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition-colors"
                >
                  <LogOut size={18} />
                  <span className="hidden md:inline">Sair</span>
                </button>
              </div>
            </>
          ) : (
            // --- MENU PARA USUÁRIO NÃO AUTENTICADO ---
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