// app/login/page.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Importar o Link para a página de primeiro acesso

export default function LoginPage() {
  // --- 1. Mudar o estado de 'email' para 'username' ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // --- 2. Enviar 'username' para a função signIn ---
      const result = await signIn('credentials', {
        redirect: false,
        username,
        password,
      });

      if (result?.error) {
        setError('Usuário ou senha inválidos. Verifique seus dados.');
      } else {
        // Redireciona para uma página padrão do dashboard após o login
        router.push('/dashboard/produtos'); 
      }
    } catch (error) {
      setError('Ocorreu um erro ao tentar fazer login.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="mb-4 text-sm text-red-600 text-center">{error}</p>}
          
          {/* --- 3. Alterar o campo de input de Email para Usuário --- */}
          <div className="mb-4">
            <label className="block text-gray-700">Usuário</label>
            <input
              type="text" // tipo 'text' em vez de 'email'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Entrar
          </button>
        </form>
        {/* Adicionar um link para a página de primeiro acesso */}
        <p className="mt-4 text-sm text-center text-gray-600">
          Primeiro acesso?{' '}
          <Link href="/primeiro-acesso" className="text-blue-600 hover:underline">
            Crie sua senha aqui
          </Link>
        </p>
      </div>
    </div>
  );
}