// app/dashboard/admin/usuarios/page.tsx
'use client';

import { useState, useEffect, FormEvent, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { UserPlus, Edit, Trash2 } from 'lucide-react';
import { Prisma, User, Localizacao, Role } from '@prisma/client';

type UserCompleto = User & { localizacao: Localizacao | null };

// O componente UserForm que você já tem (sem alterações)
const UserForm = ({ userToEdit, onSave, onCancel, currentUserRole, currentUserLocalizacao, localidades }: any) => {
    const [name, setName] = useState(userToEdit?.name || '');
    const [username, setUsername] = useState(userToEdit?.username || '');
    const [role, setRole] = useState(userToEdit?.role || 'TECNICO');
    const [localizacaoId, setLocalizacaoId] = useState(userToEdit?.localizacaoId || '');
    
    useEffect(() => {
      if (!userToEdit) {
        const generatedUsername = name.trim().toLowerCase().replace(/\s+/g, '.');
        setUsername(generatedUsername);
      }
    }, [name, userToEdit]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave({ id: userToEdit?.id, name, username, role, localizacaoId });
    };

    const availableRoles = useMemo(() => {
        if (currentUserRole === Role.ADMIN) return Object.values(Role);
        if (currentUserRole === Role.GERENTE_REGIONAL) return [Role.TECNICO];
        return [];
    }, [currentUserRole]);

    const availableLocalidades = useMemo(() => {
        if (currentUserRole === Role.ADMIN) return localidades;
        if (currentUserRole === Role.GERENTE_REGIONAL) {
            return localidades.filter((l: Localizacao) => l.parentId === currentUserLocalizacao?.id || l.id === currentUserLocalizacao?.id);
        }
        return [];
    }, [currentUserRole, currentUserLocalizacao, localidades]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">{userToEdit ? 'Editar Usuário' : 'Novo Usuário'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ... campos do formulário ... */}
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 border rounded"/>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full p-2 border rounded bg-gray-100"/>
                    <select value={role} onChange={e => setRole(e.target.value)} required className="w-full p-2 border rounded bg-white">
                        {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <select value={localizacaoId} onChange={e => setLocalizacaoId(e.target.value)} required className="w-full p-2 border rounded bg-white">
                        <option value="">Selecione...</option>
                        {availableLocalidades.map((l: Localizacao) => <option key={l.id} value={l.id}>{l.nome}</option>)}
                    </select>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default function UsuariosPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<UserCompleto[]>([]);
    const [localidades, setLocalidades] = useState<Localizacao[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<UserCompleto | null>(null);

    // @ts-ignore
    const currentUserRole = session?.user?.role;
    // @ts-ignore
    const currentUserLocalizacao = session?.user?.localizacao;

    const fetchData = async () => {
        const [resUsers, resLocalidades] = await Promise.all([
            fetch('/api/users'),
            fetch('/api/localidades'),
        ]);
        setUsers(await resUsers.json());
        setLocalidades(await resLocalidades.json());
    };

    useEffect(() => {
        if (currentUserRole === Role.ADMIN || currentUserRole === Role.GERENTE_REGIONAL) {
            fetchData();
        }
    }, [currentUserRole]);
    
    const handleSaveUser = async (userData: any) => {
        const url = userData.id ? `/api/users/${userData.id}` : '/api/users';
        const method = userData.id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        if (res.ok) {
            setIsModalOpen(false);
            setUserToEdit(null);
            fetchData();
        } else {
            const error = await res.json();
            alert(`Erro: ${error.message}`);
        }
    };

    // --- FUNÇÃO DE DELETAR ADICIONADA ---
    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('Tem certeza que deseja apagar este usuário? Esta ação não pode ser desfeita.')) {
            const res = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                alert('Usuário apagado com sucesso.');
                fetchData(); // Atualiza a lista
            } else {
                const error = await res.json();
                alert(`Erro ao apagar usuário: ${error.message}`);
            }
        }
    };

    const openModalForNew = () => {
        setUserToEdit(null);
        setIsModalOpen(true);
    };

    const openModalForEdit = (user: UserCompleto) => {
        setUserToEdit(user);
        setIsModalOpen(true);
    };

    if (!currentUserRole || (currentUserRole !== Role.ADMIN && currentUserRole !== Role.GERENTE_REGIONAL)) {
        return <p className="p-8">Acesso negado.</p>;
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
                <button onClick={openModalForNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    <UserPlus size={20} />
                    Novo Usuário
                </button>
            </div>

            {isModalOpen && (
                <UserForm
                    userToEdit={userToEdit}
                    onSave={handleSaveUser}
                    onCancel={() => setIsModalOpen(false)}
                    currentUserRole={currentUserRole}
                    currentUserLocalizacao={currentUserLocalizacao}
                    localidades={localidades}
                />
            )}

            <div className="bg-white p-6 rounded-lg shadow-md">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b"><th className="p-2">Nome</th><th className="p-2">Usuário</th><th className="p-2">Cargo</th><th className="p-2">Localização/Região</th><th className="p-2">Ações</th></tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                <td className="p-2">{user.name}</td>
                                <td className="p-2 font-mono">{user.username}</td>
                                <td className="p-2">{user.role}</td>
                                <td className="p-2">{user.localizacao?.nome || 'N/A'}</td>
                                <td className="p-2 flex gap-4">
                                    <button onClick={() => openModalForEdit(user)} className="text-blue-500 hover:text-blue-700" title="Editar">
                                        <Edit size={18}/>
                                    </button>
                                    {/* --- BOTÃO DE DELETAR AGORA CHAMA A FUNÇÃO --- */}
                                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700" title="Apagar">
                                        <Trash2 size={18}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}