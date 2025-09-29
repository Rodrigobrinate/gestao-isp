import Head from 'next/head';
import Link from 'next/link';

// Reutilize os componentes Navbar e Footer
const Navbar = () => (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-gray-800">Estoque<span className="text-blue-600">Provedor</span></div>
        <div className="hidden md:flex space-x-6 items-center">
          <Link href="/" className="text-gray-600 hover:text-blue-600">Início</Link>
          <Link href="/precos" className="text-blue-600 font-semibold">Licenciamento</Link>
          <a href="#demo" className="text-gray-600 hover:text-blue-600">Demo Online</a>
          <a href="mailto:contato@estoqueprovedor.com.br" className="text-gray-600 hover:text-blue-600">Contato</a>
        </div>
        <a href="#planos" className="hidden md:block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300">
          Ver Planos
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
            <Link href="/precos" className="text-gray-400 hover:text-white">Licenciamento</Link>
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


export default function PricingPage() {
  return (
    <div className="bg-gray-50">
      <Head>
        <title>Licenciamento - Estoque Provedor</title>
        <meta name="description" content="Licenças para provedores de todos os tamanhos. Experimente nossa demo online e compre com garantia." />
      </Head>

      <Navbar />

      {/* Seção Hero */}
      <section className="text-center pt-20 pb-12 container mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">A licença certa para o seu tamanho.</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
          Seja você um provedor começando ou uma grande operadora, temos a solução auto-hospedada perfeita. Sem mensalidades, com total controle.
        </p>
      </section>

      {/* Seção "Experimente Sem Risco" - CHAMARIZ */}
      <section id="demo" className="container mx-auto px-6 pb-20">
        <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-dashed border-blue-300">
          <h2 className="text-center text-3xl font-bold text-gray-800 mb-6">Experimente Sem Risco</h2>
          <div className="grid md:grid-cols-2 gap-8 text-center">
            
            {/* Demo Interativa */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-2xl font-bold text-blue-800">Demonstração Interativa</h3>
              <p className="mt-2 text-gray-700">
                Navegue em uma versão completa do nosso sistema agora mesmo. Sem cadastros, sem compromisso. Veja na prática como tudo funciona.
              </p>
              <a href="http://demo.estoqueprovedor.com.br" target="_blank" rel="noopener noreferrer" className="inline-block mt-4 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700">
                Acessar Sandbox Online
              </a>
            </div>

            {/* Garantia de Satisfação */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-2xl font-bold text-green-800">Garantia de 30 Dias</h3>
              <p className="mt-2 text-gray-700">
                Compre com total tranquilidade. Se o sistema não atender às suas expectativas, devolvemos 100% do seu investimento. Simples assim.
              </p>
              <div className="mt-4 text-green-700 font-semibold">
                Satisfação garantida ou seu dinheiro de volta.
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Planos de Licenciamento */}
      <section id="planos" className="py-20 bg-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Plano 1: Essencial */}
            <div className="bg-white p-8 rounded-xl shadow-lg border flex flex-col">
              <h2 className="text-3xl font-bold text-gray-800">Licença Essencial</h2>
              <p className="text-gray-500 mt-2">Para provedores em crescimento e operações focadas.</p>
              <div className="my-6">
                <span className="text-5xl font-extrabold text-gray-900">R$ 4.800</span>
                <span className="text-gray-500 block text-lg">Pagamento Único</span>
              </div>
              <ul className="space-y-4 text-gray-600 flex-grow">
                <li className="flex items-center"><span className="text-green-500 mr-2">✔</span><strong>Até 5 usuários</strong></li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✔</span><strong>1 CNPJ</strong> / Almoxarifado Principal</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✔</span>Itens e Técnicos Ilimitados</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✔</span>Rastreamento por Serial</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✔</span>Controle de Estoque do Técnico</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✔</span>Gestão de POPs</li>
                <li className="flex items-center text-gray-400"><span className="text-red-400 mr-2">❌</span><span className="line-through">Gestão Multi-CNPJ / Holding</span></li>
                <li className="flex items-center text-gray-400"><span className="text-red-400 mr-2">❌</span><span className="line-through">Gestão de Regionais</span></li>
              </ul>
              <a href="mailto:contato@estoqueprovedor.com.br?subject=Aquisição da Licença Essencial" className="w-full mt-8 bg-gray-800 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-900 text-center">
                Adquirir Licença Essencial
              </a>
            </div>

            {/* Plano 2: Completo (Destaque) */}
            <div className="bg-white p-8 rounded-xl shadow-2xl border-4 border-blue-600 relative flex flex-col">
              <span className="bg-blue-600 text-white text-sm font-bold px-4 py-1 rounded-full absolute -top-4 left-1/2 -translate-x-1/2">RECOMENDADO</span>
              <h2 className="text-3xl font-bold text-gray-800">Licença Completa</h2>
              <p className="text-gray-500 mt-2">Para provedores estabelecidos e operações complexas.</p>
              <div className="my-6">
                <span className="text-5xl font-extrabold text-gray-900">R$ 15.000</span>
                <span className="text-gray-500 block text-lg">Pagamento Único</span>
              </div>
              <ul className="space-y-4 text-gray-600 flex-grow">
                <li className="flex items-center"><span className="text-green-500 mr-2">✔</span><strong>Usuários ilimitados</strong></li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✔</span><strong>CNPJs e Holdings ilimitados</strong></li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✔</span>Itens e Técnicos Ilimitados</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✔</span>Rastreamento por Serial</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✔</span>Controle de Estoque do Técnico</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✔</span>Gestão de POPs</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✔</span><strong>Gestão Multi-CNPJ / Holding</strong></li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✔</span><strong>Gestão de Regionais</strong></li>
              </ul>
               <a href="mailto:contato@estoqueprovedor.com.br?subject=Aquisição da Licença Completa" className="w-full mt-8 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 text-center">
                Adquirir Licença Completa
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Suporte e Atualizações */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Suporte e Atualizações (Opcional)</h2>
            <p className="mt-4 text-gray-600">Mantenha seu sistema seguro, atualizado e conte com nossa equipe para o que precisar.</p>
          </div>
          <div className="bg-gray-100 p-8 rounded-lg border text-center">
            <p className="text-gray-700">
              Sua licença é vitalícia. Para ter acesso contínuo a novas funcionalidades e suporte técnico, oferecemos um plano anual.
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-10 my-6">
                <div>
                    <p className="text-lg font-semibold text-gray-800">Plano Essencial</p>
                    <p><span className="text-3xl font-bold text-gray-900">R$ 990</span><span className="text-gray-500"> /ano</span></p>
                </div>
                <div className="w-px h-12 bg-gray-300 hidden md:block"></div>
                <div>
                    <p className="text-lg font-semibold text-gray-800">Plano Completo</p>
                    <p><span className="text-3xl font-bold text-gray-900">R$ 2.500</span><span className="text-gray-500"> /ano</span></p>
                </div>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              Não quer renovar? Sem problemas. Você pode continuar usando a versão que possui para sempre.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}