// app/dashboard/admin/usuarios/page.tsx
'use client';

import { useState, useEffect, FormEvent, useMemo } from 'react';
import { useSession } from 'next-auth/react';
// ... (outros imports, como UserForm, UserPlus, etc.)

// --- NOVO CARD PARA O GERENTE ---
const LocalidadesTecnicosCard = ({ localidades, onSave }: any) => {
    const [nome, setNome] = useState('');
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await onSave({ nome, tipo: 'TECNICO' });
        setNome('');
    };
    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Localidades de Técnicos</h3>
            <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Carro do Técnico X" className="flex-grow p-2 border rounded" required/>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Criar</button>
            </form>
            <ul className="space-y-2 text-sm">
                {localidades.map((l: any) => <li key={l.id} className="p-2 bg-gray-100 rounded">{l.nome}</li>)}
            </ul>
        </div>
    );
};


export default function UsuariosPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<any[]>([]);
    const [localidades, setLocalidades] = useState<any[]>([]);
    // ... (outros states: isModalOpen, userToEdit)

    // @ts-ignore
    const currentUserRole = session?.user?.role;
    // @ts-ignore
    const currentUserLocalizacao = session?.user?.localizacao;

    const fetchData = async () => { /* ... (sua função fetchData que busca /api/users e /api/localidades) ... */ };
    useEffect(() => { fetchData(); }, [session]);

    const handleSaveUser = async (userData: any) => { /* ... (sua função de salvar usuário) ... */ };
    const handleSaveLocalidade = async (localidadeData: any) => {
        await fetch('/api/localidades', {
            method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(localidadeData)
        });
        fetchData(); // Re-busca tudo para atualizar as listas
    };

    // ... (funções openModalForNew, openModalForEdit)

    if (!currentUserRole || (currentUserRole !== 'ADMIN' && currentUserRole !== 'GERENTE_REGIONAL')) {
        return <p className="p-8">Acesso negado.</p>;
    }

    // Filtra localidades de técnicos para o card do gerente
    const localidadesDeTecnicos = localidades.filter(l => l.tipo === 'TECNICO');

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Gestão de Usuários e Equipe</h1>
                <button onClick={openModalForNew} className="... (estilo do botão)">
                    Novo Usuário
                </button>
            </div>

            {///isModalOpen && ( /* ... (seu componente UserForm) ... */ )}
}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    {/* ... (sua tabela de usuários) ... */}
                </div>
                <div className="lg:col-span-1">
                    {/* Card só aparece para o Gerente */}
                    {currentUserRole === 'GERENTE_REGIONAL' && (
                        <LocalidadesTecnicosCard 
                            localidades={localidadesDeTecnicos}
                            onSave={handleSaveLocalidade}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}