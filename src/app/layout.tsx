// app/layout.tsx

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from './components/AuthProvider';
import Header from './components/Header'; // 1. Importe o Header

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gestão de Estoque ISP',
  description: 'Sistema de gestão para provedores de internet',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
       {   <Header />  /*2. Adicione o Header aqui */}
          <main className="container mx-auto ">
            {children} {/* O conteúdo da página será renderizado aqui */}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}