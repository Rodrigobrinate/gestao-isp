// app/dashboard/produtos/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import { TipoProduto } from '@prisma/client';
import { useSession } from 'next-auth/react';

// --- Interfaces de Tipos ---
interface Categoria {
  id: string;
  nome: string;
}
interface Localidade {
  id: string;
  nome: string;
  descricao?: string | null;
}
interface Produto {
  id: string;
  nome: string;
  sku?: string | null;
  tipo: TipoProduto;
  categoriaId: string;
  categoria: {
    nome: string;
  };
  pontoPedido1Mes?: number | null;
  estoqueSeguranca1Mes?: number | null;
  pontoPedido12Meses?: number | null;
  estoqueSeguranca12Meses?: number | null;
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [localidades, setLocalidades] = useState<Localidade[]>([]);
  const [modalProdutoAberto, setModalProdutoAberto] = useState(false);
  const [produtoAtual, setProdutoAtual] = useState<Partial<Produto>>({});
  const [isEditando, setIsEditando] = useState(false);
  const [nomeNovaCategoria, setNomeNovaCategoria] = useState('');
  const [novaLocalidade, setNovaLocalidade] = useState<Partial<Localidade>>({});
  const { data: session, status } = useSession();

  

  const fetchData = async () => {
    const [resProdutos, resCategorias, resLocalidades] = await Promise.all([
      fetch('/api/produtos'),
      fetch('/api/categorias'),
      fetch('/api/localidades')
    ]);
    setProdutos(await resProdutos.json());
    setCategorias(await resCategorias.json());
    setLocalidades(await resLocalidades.json());
  };

  useEffect(() => { fetchData(); }, []);

  // --- Funções de Categoria ---
  const handleAddCategoria = async (e: FormEvent) => {

    if (status === "authenticated") {
    console.log(session.user)
 
    e.preventDefault();
    await fetch('/api/categorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: nomeNovaCategoria, holdingId : session.user.empresa.holdingId }),
    });
    setNomeNovaCategoria('');
    fetchData(); 
  }
  };

  const handleDeleteCategoria = async (id: string) => {
    if (confirm('Tem certeza?')) {
      await fetch(`/api/categorias/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  // --- Funções de Localidade ---
  const handleSaveLocalidade = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('/api/localidades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({nome: novaLocalidade.nome, tipo: 'REGIAO' }),
    });
    setNovaLocalidade({});
    fetchData();
  };
  
  const handleEditLocalidade = async(loc: Localidade) => {
    const novoNome = prompt("Editar nome:", loc.nome);
    if (novoNome) {
      await fetch(`/api/localidades/${loc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...loc, nome: novoNome }),
      });
      fetchData();
    }
  };

  const handleDeleteLocalidade = async (id: string) => {
    if (confirm('Tem certeza?')) {
      const res = await fetch(`/api/localidades/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || 'Erro ao apagar.');
      }
      fetchData();
    }
  };

  // --- Funções de Produto ---
  const abrirModalParaNovoProduto = () => {
    setIsEditando(false);
    setProdutoAtual({});
    setModalProdutoAberto(true);
  };

  const abrirModalParaEditarProduto = (produto: Produto) => {
    setIsEditando(true);
    setProdutoAtual(produto);
    setModalProdutoAberto(true);
  };
  
  const handleSalvarProduto = async (e: FormEvent) => {
    e.preventDefault();
    const url = isEditando ? `/api/produtos/${produtoAtual.id}` : '/api/produtos';
    const method = isEditando ? 'PUT' : 'POST';

    const dadosParaSalvar = {
      ...produtoAtual,
      pontoPedido1Mes: Number(produtoAtual.pontoPedido1Mes) || null,
      estoqueSeguranca1Mes: Number(produtoAtual.estoqueSeguranca1Mes) || null,
      pontoPedido12Meses: Number(produtoAtual.pontoPedido12Meses) || null,
      estoqueSeguranca12Meses: Number(produtoAtual.estoqueSeguranca12Meses) || null,
    };

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosParaSalvar),
    });

    setModalProdutoAberto(false);
    fetchData();
  };
  
  const handleDeleteProduto = async (id: string) => {
    if (confirm('Tem certeza?')) {
      await fetch(`/api/produtos/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold">Gestão de Catálogo</h1>
      
      {/* SEÇÕES DE CATEGORIA E LOCALIDADE RESTAURADAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Categorias</h2>
          <form onSubmit={handleAddCategoria} className="flex gap-2 mb-4">
            <input type="text" value={nomeNovaCategoria} onChange={(e) => setNomeNovaCategoria(e.target.value)} placeholder="Nova categoria" className="flex-grow p-2 border rounded" required />
            <button type="submit" className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"><PlusCircle size={20} /></button>
          </form>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {categorias.map((cat) => (
              <li key={cat.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>{cat.nome}</span>
                <button onClick={() => handleDeleteCategoria(cat.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Localidades</h2>
          <form onSubmit={handleSaveLocalidade} className="flex flex-col gap-2 mb-4">
            <input type="text" value={novaLocalidade.nome || ''} onChange={(e) => setNovaLocalidade({...novaLocalidade, nome: e.target.value})} placeholder="Nome da localidade" className="p-2 border rounded" required />
            <div className='flex gap-2'>
              <input type="text" value={novaLocalidade.descricao || ''} onChange={(e) => setNovaLocalidade({...novaLocalidade, descricao: e.target.value})} placeholder="Descrição (Opcional)" className="flex-grow p-2 border rounded" />
              <button type="submit" className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"><PlusCircle size={20} /></button>
            </div>
          </form>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {localidades.map((loc) => (
              <li key={loc.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{loc.nome}</p>
                  <p className="text-sm text-gray-500">{loc.descricao}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditLocalidade(loc)} className="text-blue-500 hover:text-blue-700"><Edit size={16} /></button>
                  <button onClick={() => handleDeleteLocalidade(loc.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Produtos</h2>
          <button onClick={abrirModalParaNovoProduto} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            <PlusCircle size={20} /> Novo Produto
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-2">Nome</th>
                <th className="p-2">Tipo</th>
                <th className="p-2">Categoria</th>
                <th className="p-2">Ponto de Pedido (1M)</th>
                <th className="p-2">Estoque Seg. (1M)</th>
                <th className="p-2">Ponto de Pedido (12M)</th>
                <th className="p-2">Estoque Seg. (12M)</th>
                <th className="p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((prod) => (
                <tr key={prod.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{prod.nome} <br/><span className="text-xs text-gray-500">{prod.sku || ''}</span></td>
                  <td className="p-2">{prod.tipo}</td>
                  <td className="p-2">{prod.categoria.nome}</td>
                  <td className="p-2">{prod.pontoPedido1Mes ?? 'N/A'}</td>
                  <td className="p-2">{prod.estoqueSeguranca1Mes ?? 'N/A'}</td>
                   <td className="p-2">{prod.pontoPedido12Meses ?? 'N/A'}</td>
                  <td className="p-2">{prod.estoqueSeguranca1Mes ?? 'N/A'}</td>
                  <td className="p-2 flex gap-2">
                    <button onClick={() => abrirModalParaEditarProduto(prod)} className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                    <button onClick={() => handleDeleteProduto(prod.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalProdutoAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">{isEditando ? 'Editar Produto' : 'Novo Produto'}</h2>
            <form onSubmit={handleSalvarProduto}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Nome do Produto" value={produtoAtual.nome || ''} onChange={(e) => setProdutoAtual({ ...produtoAtual, nome: e.target.value })} className="w-full p-2 border rounded" required />
                <input type="text" placeholder="SKU (Opcional)" value={produtoAtual.sku || ''} onChange={(e) => setProdutoAtual({ ...produtoAtual, sku: e.target.value })} className="w-full p-2 border rounded" />
                <select value={produtoAtual.tipo || ''} onChange={(e) => setProdutoAtual({ ...produtoAtual, tipo: e.target.value as TipoProduto })} className="w-full p-2 border rounded" required >
                  <option value="" disabled>Selecione o tipo</option>
                  <option value="SERIALIZADO">Serializado</option>
                  <option value="QUANTIDADE">Quantidade</option>
                </select>
                <select value={produtoAtual.categoriaId || ''} onChange={(e) => setProdutoAtual({ ...produtoAtual, categoriaId: e.target.value })} className="w-full p-2 border rounded" required >
                  <option value="" disabled>Selecione a categoria</option>
                  {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
                </select>
              </div>
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Parâmetros de Controle (Manual)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Ponto de Pedido (Mês)</label>
                    <input type="number" placeholder="0" value={produtoAtual.pontoPedido1Mes || ''} onChange={(e) => setProdutoAtual({ ...produtoAtual, pontoPedido1Mes: parseInt(e.target.value) })} className="w-full p-2 border rounded mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Estoque de Segurança (Mês)</label>
                    <input type="number" placeholder="0" value={produtoAtual.estoqueSeguranca1Mes || ''} onChange={(e) => setProdutoAtual({ ...produtoAtual, estoqueSeguranca1Mes: parseInt(e.target.value) })} className="w-full p-2 border rounded mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Ponto de Pedido (Ano)</label>
                    <input type="number" placeholder="0" value={produtoAtual.pontoPedido12Meses || ''} onChange={(e) => setProdutoAtual({ ...produtoAtual, pontoPedido12Meses: parseInt(e.target.value) })} className="w-full p-2 border rounded mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Estoque de Segurança (Ano)</label>
                    <input type="number" placeholder="0" value={produtoAtual.estoqueSeguranca12Meses || ''} onChange={(e) => setProdutoAtual({ ...produtoAtual, estoqueSeguranca12Meses: parseInt(e.target.value) })} className="w-full p-2 border rounded mt-1" />
                  </div>

                  
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={() => setModalProdutoAberto(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}