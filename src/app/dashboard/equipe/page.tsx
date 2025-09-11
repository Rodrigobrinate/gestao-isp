'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { UserPlus, Edit, Trash2, PlusCircle, Check, X, AlertTriangle } from 'lucide-react';
import type { Prisma, Localizacao, User, Role } from '@prisma/client';

type UserComLocalizacao = User & { localizacao: Localizacao | null };

export default function EquipePage() {
  const { data: session, status } = useSession();
  const [tecnicos, setTecnicos] = useState<UserComLocalizacao[]>([]);
  const [localidadesTecnicos, setLocalidadesTecnicos] = useState<Localizacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  // Estados para os modais e formulários
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserComLocalizacao | null>(null);
  const [newLocationName, setNewLocationName] = useState('');
  const [editingLocation, setEditingLocation] = useState<{ id: string, nome: string } | null>(null);
  
  // Estados para o modal de confirmação
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');


  // @ts-ignore
  const minhaRegiaoId = session?.user?.localizacao?.id;

  const fetchData = useCallback(async () => {
    if (!minhaRegiaoId) { setLoading(false); return; }
    setLoading(true);
    try {
        const [resUsers, resLocalidades] = await Promise.all([
            fetch(`/api/users?regiaoId=${minhaRegiaoId}`),
            fetch(`/api/localidades/tecnico`), // Este endpoint agora usa a sessão, então não precisa de param
        ]);
        if (resUsers.ok) setTecnicos(await resUsers.json());
        if (resLocalidades.ok) setLocalidadesTecnicos(await resLocalidades.json());
    } catch (error) {
        console.error("Falha ao buscar dados:", error);
    } finally {
        setLoading(false);
    }
  }, [minhaRegiaoId]);

  useEffect(() => {
    if (status === 'authenticated') fetchData();
  }, [status, fetchData]);

  const handleSaveLocalidade = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('/api/localidades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: newLocationName, tipo: 'TECNICO' })
    });
    setNewLocationName('');
    fetchData();
  };

  const handleUpdateLocalidade = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingLocation) return;
    await fetch(`/api/localidades/${editingLocation.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: editingLocation.nome })
    });
    setEditingLocation(null);
    fetchData();
  };

  const handleDeleteLocalidade = (localidadeId: string) => {
    setConfirmMessage('Tem certeza que deseja apagar esta localidade?');
    const confirmAction = async () => {
        setErrorMessage(null);
        const response = await fetch(`/api/localidades/${localidadeId}`, { method: 'DELETE' });
        if (!response.ok) {
            const error = await response.json();
            setErrorMessage(error.message || 'Não foi possível apagar. Verifique se existem técnicos vinculados a esta localidade.');
            setTimeout(() => setErrorMessage(null), 5000);
        } else {
            fetchData();
        }
        setConfirmModalOpen(false);
    };
    setActionToConfirm(() => confirmAction);
    setConfirmModalOpen(true);
  };
  
  const handleSaveUser = async (userData: any) => {
    const url = userData.id ? `/api/users/${userData.id}` : '/api/users';
    const method = userData.id ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData) });
    setUserModalOpen(false);
    fetchData();
  };

  const handleDeleteUser = (userId: string) => {
    setConfirmMessage('Tem certeza que deseja apagar este técnico?');
    const confirmAction = async () => {
        await fetch(`/api/users/${userId}`, { method: 'DELETE' });
        fetchData();
        setConfirmModalOpen(false);
    };
    setActionToConfirm(() => confirmAction);
    setConfirmModalOpen(true);
  };

  if (loading) return <p className="p-8">Carregando equipe...</p>;

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold">Gestão de Equipe</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Coluna de Técnicos */}
        <div className="lg:col-span-2 p-6 bg-white rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Técnicos</h2>
            <button onClick={() => { setUserToEdit(null); setUserModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              <UserPlus size={18} /> Novo Técnico
            </button>
          </div>
          <table className="w-full text-left">
            <thead><tr className="border-b"><th className="p-2">Nome</th><th className="p-2">Usuário</th><th className="p-2">Localidade Vinculada</th><th className="p-2">Ações</th></tr></thead>
            <tbody>
              {tecnicos.map(user => (
                <tr key={user.id} className="border-b hover:bg-gray-50 text-sm">
                  <td className="p-2">{user.name}</td>
                  <td className="p-2 font-mono">{user.username}</td>
                  <td className="p-2">{user.localizacao?.nome || <span className="text-red-500">Nenhuma</span>}</td>
                  <td className="p-2 flex gap-2">
                    <button onClick={() => { setUserToEdit(user); setUserModalOpen(true); }} className="text-blue-600 hover:text-blue-800"><Edit size={16}/></button>
                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Coluna de Localidades */}
        <div className="lg:col-span-1 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Localidades da Equipe</h2>
          {errorMessage && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded">{errorMessage}</div>}
          <form onSubmit={handleSaveLocalidade} className="flex gap-2 mb-4">
            <input type="text" value={newLocationName} onChange={e => setNewLocationName(e.target.value)} placeholder="Nome da nova localidade" className="flex-grow p-2 border rounded" required />
            <button type="submit" className="p-2 bg-green-600 text-white rounded hover:bg-green-700"><PlusCircle size={18}/></button>
          </form>
          <ul className="space-y-2 text-sm max-h-80 overflow-y-auto">
            {localidadesTecnicos.map(loc => (
              <li key={loc.id} className="p-2 bg-gray-50 rounded flex justify-between items-center">
                {editingLocation?.id === loc.id ? (
                  <form onSubmit={handleUpdateLocalidade} className="flex gap-2 w-full items-center">
                    <input
                      type="text"
                      value={editingLocation.nome}
                      onChange={(e) => setEditingLocation({ ...editingLocation, nome: e.target.value })}
                      className="flex-grow p-1 border rounded"
                      autoFocus
                    />
                    <button type="submit" className="text-green-600 hover:text-green-800"><Check size={16} /></button>
                    <button type="button" onClick={() => setEditingLocation(null)} className="text-gray-500 hover:text-gray-700"><X size={16} /></button>
                  </form>
                ) : (
                  <>
                    <span>{loc.nome}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingLocation({ id: loc.id, nome: loc.nome })} className="text-blue-600 hover:text-blue-800"><Edit size={14}/></button>
                      <button onClick={() => handleDeleteLocalidade(loc.id)} className="text-red-600 hover:text-red-800"><Trash2 size={14}/></button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {isUserModalOpen && (
        <UserFormModal
          userToEdit={userToEdit}
          onSave={handleSaveUser}
          onCancel={() => setUserModalOpen(false)}
          availableLocalidades={localidadesTecnicos}
        />
      )}

      {isConfirmModalOpen && actionToConfirm && (
        <ConfirmationModal
          message={confirmMessage}
          onConfirm={actionToConfirm}
          onCancel={() => {
            setConfirmModalOpen(false);
            setActionToConfirm(null);
          }}
        />
      )}
    </div>
  );
}

// --- Modal de Formulário de Usuário ---
function UserFormModal({ userToEdit, onSave, onCancel, availableLocalidades }: any) {
  const [name, setName] = useState(userToEdit?.name || '');
  const [username, setUsername] = useState(userToEdit?.username || '');
  const [localizacaoId, setLocalizacaoId] = useState(userToEdit?.localizacaoId || '');

  useEffect(() => {
    if (!userToEdit) {
      const generatedUsername = name.trim().toLowerCase().replace(/\s+/g, '.');
      setUsername(generatedUsername);
    }
  }, [name, userToEdit]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({ id: userToEdit?.id, name, username, role: 'TECNICO', localizacaoId });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{userToEdit ? 'Editar Técnico' : 'Novo Técnico'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Nome Completo</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 border rounded mt-1"/>
          </div>
          <div>
            <label>Nome de Usuário (para login)</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full p-2 border rounded mt-1 bg-gray-100"/>
          </div>
          <div>
            <label>Vincular à Localidade</label>
            <select value={localizacaoId} onChange={e => setLocalizacaoId(e.target.value)} required className="w-full p-2 border rounded mt-1 bg-white">
              <option value="">Selecione uma localidade...</option>
              {availableLocalidades.map((l: Localizacao) => <option key={l.id} value={l.id}>{l.nome}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Modal de Confirmação ---
function ConfirmationModal({ message, onConfirm, onCancel }: { message: string, onConfirm: () => void, onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
        <div className="flex items-start gap-4">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <div className="mt-0 text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Confirmar Ação
                </h3>
                <div className="mt-2">
                    <p className="text-sm text-gray-600">{message}</p>
                </div>
            </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
          <button type="button" onClick={onConfirm} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:w-auto sm:text-sm">
            Apagar
          </button>
          <button type="button" onClick={onCancel} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

