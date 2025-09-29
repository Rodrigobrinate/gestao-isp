import Head from 'next/head';
import Link from 'next/link';

// Componentes (Navbar e Footer podem ser importados de /components)
const Navbar = () => (
  <nav className="bg-white shadow-md sticky top-0 z-50">
    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
      <div className="text-2xl font-bold text-gray-800">Estoque<span className="text-blue-600">Provedor</span></div>
      <div className="hidden md:flex space-x-6">
        <Link href="/" className="text-gray-600 hover:text-blue-600">Início</Link>
        <Link href="/precos" className="text-gray-600 hover:text-blue-600">Preços</Link>
        <a href="#contato" className="text-gray-600 hover:text-blue-600">Contato</a>
      </div>
      <a href="#demonstracao" className="hidden md:block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300">
        Agendar Demonstração
      </a>
    </div>
  </nav>
);

const Footer = () => (
  <footer className="bg-gray-800 text-white">
    <div className="container mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-xl font-bold">Estoque<span className="text-blue-500">Provedor</span></div>
        <div className="flex mt-4 md:mt-0 space-x-6">
          <Link href="/precos" className="text-gray-400 hover:text-white">Preços</Link>
          <a href="#" className="text-gray-400 hover:text-white">Termos de Serviço</a>
          <a href="#" className="text-gray-400 hover:text-white">Política de Privacidade</a>
        </div>
      </div>
      <div className="text-center text-gray-500 mt-8">
        © 2025 Estoque Provedor. Todos os direitos reservados.
      </div>
    </div>
  </footer>
);


export default function HomePage() {
  return (
    <div className="bg-gray-50">
      <Head>
        <title>Estoque Provedor - Gestão de Estoque para ISPs</title>
        <meta name="description" content="Sistema de gestão de estoque criado por provedores, para provedores. Controle total de ONUs, fibra, e equipamentos." />
      </Head>

      <Navbar />

      {/* Hero Section */}
      <header className="bg-white">
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 leading-tight">
            Chega de planilhas. Gestão de estoque <span className="text-blue-600">feita para provedores.</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Criado dentro de um provedor para resolver problemas reais. Rastreie cada item, do almoxarifado ao cliente, com total precisão.
          </p>
          <div className="mt-8">
            <a href="#demonstracao" className="bg-blue-600 text-white py-4 px-8 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300">
              Ver uma Demonstração
            </a>
          </div>
        </div>
      </header>

      {/* Seção "Nossa História" */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Nascemos da sua realidade</h2>
            <p className="mt-4 text-gray-600 max-w-3xl mx-auto">
              Não somos uma empresa de software genérico. Somos do setor, e construímos a ferramenta que sempre sonhamos em ter.
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <img src="https://images.unsplash.com/photo-1581093450021-91638249b6b3?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1600" alt="Técnico organizando equipamentos de fibra óptica" className="rounded-lg shadow-2xl" />
            </div>
            <div className="md:w-1/2">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">O Fim do Caos no Almoxarifado</h3>
              <p className="text-gray-600 mb-4">
                Sabe aquela ONU que "sumiu"? Ou o rolo de fibra que consta no sistema mas não está na prateleira? Nós vivemos isso. Por isso, nosso sistema oferece rastreamento por serial, controle de lote e visibilidade total do estoque do técnico em tempo real.
              </p>
              <p className="text-gray-600">
                Cada movimentação é registrada, desde a entrada da nota fiscal até a instalação no cliente final. Saiba exatamente onde está cada componente do seu ativo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Funcionalidades */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Recursos Pensados para o seu Dia a Dia</h2>
            <p className="mt-4 text-gray-600">Tudo que você precisa, sem complexidade.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-gray-800">Rastreamento por Serial</h3>
              <p className="mt-2 text-gray-600">Acompanhe o ciclo de vida completo de equipamentos serializados como ONUs e roteadores.</p>
            </div>
            {/* Feature 2 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-gray-800">Estoque do Técnico na Palma da Mão</h3>
              <p className="mt-2 text-gray-600">Saiba exatamente o que cada técnico tem em seu veículo. Dê baixas em tempo real via celular.</p>
            </div>
            {/* Feature 3 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-gray-800">Gestão Multi-Almoxarifado</h3>
              <p className="mt-2 text-gray-600">Controle múltiplos CNPJs, almoxarifados centrais, regionais e POPs em uma única plataforma.</p>
            </div>
            {/* Feature 4 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-gray-800">Ponto de Pedido Inteligente</h3>
              <p className="mt-2 text-gray-600">Nunca mais seja pego de surpresa. O sistema avisa quando é hora de comprar mais material.</p>
            </div>
            {/* Feature 5 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-gray-800">Movimentações Simplificadas</h3>
              <p className="mt-2 text-gray-600">Transfira itens entre almoxarifados e técnicos com poucos cliques e total rastreabilidade.</p>
            </div>
            {/* Feature 6 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-gray-800">Relatórios para Decisões</h3>
              <p className="mt-2 text-gray-600">Visualize o custo do seu estoque, consumo por período, e tome decisões baseadas em dados.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="demonstracao" className="bg-blue-600 text-white">
        <div className="container mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Pronto para ter controle total do seu estoque?</h2>
          <p className="mt-4 text-blue-100 max-w-2xl mx-auto">
            Agende uma demonstração online de 30 minutos. Vamos te mostrar na prática como podemos organizar sua operação e economizar seu dinheiro.
          </p>
          <div className="mt-8">
            <a href="mailto:contato@estoqueprovedor.com.br" className="bg-white text-blue-600 py-4 px-8 rounded-lg text-lg font-semibold hover:bg-gray-100 transition duration-300">
              Agendar Agora
            </a>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}