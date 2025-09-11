'use client';
import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PrimeiroAcessoPage() {
    const router = useRouter();
  
    //const username = searchParams.get('username');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [username, setUsername] = useState('');


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        

        const res = await fetch('/api/users/set-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        
        const data = await res.json();
        if (res.ok) {
            setSuccess('Senha definida! Você será redirecionado para o login...');
            setTimeout(() => router.push('/login'), 2000);
        } else {
            setError(data.message || 'Ocorreu um erro.');
        }
    };

   

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-2 text-center">Primeiro Acesso</h2>
                <p className="text-center text-gray-600 mb-6">Crie sua senha para o usuário: </p>
                
                <form onSubmit={handleSubmit}>
                     
                    {error && <p className="mb-4 text-sm text-red-600 text-center">{error}</p>}
                    {success && <p className="mb-4 text-sm text-green-600 text-center">{success}</p>}
                    <div className="mb-4">
                        <label className="block text-gray-700">Usuário</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full px-3 py-2 border rounded mt-1"/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Nova Senha</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 border rounded mt-1"/>
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700">Confirme a Nova Senha</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full px-3 py-2 border rounded mt-1"/>
                    </div>
                    <button type="submit" disabled={!!success} className="w-full py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">Definir Senha</button>
                </form>
            </div>
        </div>
    );
}