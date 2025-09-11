// app/components/movimentacao/EstoquePorTecnicoAgrupado.tsx
'use client';

type ProdutoAgrupado = {
  produtoNome: string;
  quantidade: number;
}

type TecnicoComEstoque = {
  tecnicoNome: string;
  produtos: ProdutoAgrupado[];
}

interface Props {
  dados: TecnicoComEstoque[];
}

export function EstoquePorTecnicoAgrupado({ dados }: Props) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="font-semibold mb-4">Estoque Alocado por Técnico</h3>
      <div className="space-y-4 max-h-72 overflow-y-auto">
        {dados.length > 0 ? dados.map(tecnico => (
          <div key={tecnico.tecnicoNome}>
            <p className="font-semibold text-gray-800">{tecnico.tecnicoNome}</p>
            <ul className="list-disc list-inside pl-4 text-sm text-gray-600">
              {tecnico.produtos.map(p => (
                <li key={p.produtoNome}><strong>{p.quantidade}</strong> x {p.produtoNome}</li>
              ))}
            </ul>
          </div>
        )) : <p className="text-center text-gray-500">Nenhum item alocado com técnicos.</p>}
      </div>
    </div>
  );
}