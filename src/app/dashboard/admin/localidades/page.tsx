// app/dashboard/admin/localidades/page.tsx
'use client';
import { useState, useEffect, FormEvent } from 'react';

// Este é um exemplo simples de CRUD para o Admin gerenciar regiões
export default function LocalidadesPage() {
  const [localidades, setLocalidades] = useState<any[]>([]);
  const [nome, setNome] = useState('');

  const fetchData = async () => {
    const res = await fetch('/api/localidades');
    const data = await res.json();
    setLocalidades(data.filter((l: any) => l.tipo === 'REGIAO'));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('/api/localidades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, tipo: 'REGIAO' })
    });
    setNome('');
    fetchData();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Gerenciar Regiões</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Nova Região</h2>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome da Região" className="flex-grow p-2 border rounded" required />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Adicionar</button>
          </form>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Regiões Existentes</h2>
          <ul className="space-y-2">
            {localidades.map(loc => <li key={loc.id} className="p-2 bg-gray-100 rounded">{loc.nome}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}