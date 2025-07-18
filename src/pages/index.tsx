import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Bot, MessageSquare, BarChart3, Settings, Zap, Shield, Globe } from 'lucide-react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner w-8 h-8 text-primary-500"></div>
      </div>
    )
  }

  if (session) {
    return null // Será redirecionado para o dashboard
  }

  return (
    <>
      <Head>
        <title>ChatBot IA - Crie seu assistente inteligente</title>
        <meta name="description" content="Plataforma SaaS para criação de chatbots inteligentes com IA" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-2">
                <Bot className="h-8 w-8 text-primary-600" />
                <span className="text-2xl font-bold text-gray-900">ChatBot IA</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/auth/signin" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Login
                </Link>
                <Link href="/auth/signup" className="btn-primary">
                  Cadastrar
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Crie seu{' '}
              <span className="text-primary-600">Assistente Inteligente</span>
              <br />
              em minutos
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Plataforma completa para criação de chatbots inteligentes com IA. 
              Integre com sua base de conhecimento e ofereça atendimento 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="btn-primary text-lg px-8 py-3">
                Começar Gratuitamente
              </Link>
              <Link href="/demo" className="btn-outline text-lg px-8 py-3">
                Ver Demonstração
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Tudo que você precisa para um chatbot inteligente
              </h2>
              <p className="text-xl text-gray-600">
                Recursos avançados para criar experiências únicas
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="card text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  IA Avançada
                </h3>
                <p className="text-gray-600">
                  Powered by Gemini AI para conversas naturais e inteligentes
                </p>
              </div>

              <div className="card text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Base de Conhecimento
                </h3>
                <p className="text-gray-600">
                  Integre com APIs externas e crie uma base personalizada
                </p>
              </div>

              <div className="card text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Analytics Avançado
                </h3>
                <p className="text-gray-600">
                  Métricas detalhadas e insights sobre performance
                </p>
              </div>

              <div className="card text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Customização Total
                </h3>
                <p className="text-gray-600">
                  Personalize comportamento, aparência e integrações
                </p>
              </div>

              <div className="card text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Treinamento Automático
                </h3>
                <p className="text-gray-600">
                  IA aprende com conversas e melhora continuamente
                </p>
              </div>

              <div className="card text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Widget Embarcável
                </h3>
                <p className="text-gray-600">
                  Adicione em qualquer site com uma linha de código
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Planos para todos os tamanhos
              </h2>
              <p className="text-xl text-gray-600">
                Escolha o plano ideal para seu negócio
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free Plan */}
              <div className="card">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Gratuito</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-4">R$ 0</div>
                  <p className="text-gray-600 mb-6">Para testar e pequenos projetos</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Shield className="h-5 w-5 text-success-500 mr-2" />
                    <span className="text-gray-700">1 chatbot</span>
                  </li>
                  <li className="flex items-center">
                    <Shield className="h-5 w-5 text-success-500 mr-2" />
                    <span className="text-gray-700">100 mensagens/mês</span>
                  </li>
                  <li className="flex items-center">
                    <Shield className="h-5 w-5 text-success-500 mr-2" />
                    <span className="text-gray-700">Base de conhecimento básica</span>
                  </li>
                </ul>
                <Link href="/auth/signup" className="btn-outline w-full">
                  Começar Grátis
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="card border-2 border-primary-500 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Mais Popular
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Pro</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-4">R$ 97</div>
                  <p className="text-gray-600 mb-6">Para empresas em crescimento</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Shield className="h-5 w-5 text-success-500 mr-2" />
                    <span className="text-gray-700">5 chatbots</span>
                  </li>
                  <li className="flex items-center">
                    <Shield className="h-5 w-5 text-success-500 mr-2" />
                    <span className="text-gray-700">10.000 mensagens/mês</span>
                  </li>
                  <li className="flex items-center">
                    <Shield className="h-5 w-5 text-success-500 mr-2" />
                    <span className="text-gray-700">Integrações com APIs</span>
                  </li>
                  <li className="flex items-center">
                    <Shield className="h-5 w-5 text-success-500 mr-2" />
                    <span className="text-gray-700">Analytics avançado</span>
                  </li>
                </ul>
                <Link href="/auth/signup" className="btn-primary w-full">
                  Começar Teste
                </Link>
              </div>

              {/* Enterprise Plan */}
              <div className="card">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-4">R$ 297</div>
                  <p className="text-gray-600 mb-6">Para grandes empresas</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Shield className="h-5 w-5 text-success-500 mr-2" />
                    <span className="text-gray-700">Chatbots ilimitados</span>
                  </li>
                  <li className="flex items-center">
                    <Shield className="h-5 w-5 text-success-500 mr-2" />
                    <span className="text-gray-700">Mensagens ilimitadas</span>
                  </li>
                  <li className="flex items-center">
                    <Shield className="h-5 w-5 text-success-500 mr-2" />
                    <span className="text-gray-700">Suporte prioritário</span>
                  </li>
                  <li className="flex items-center">
                    <Shield className="h-5 w-5 text-success-500 mr-2" />
                    <span className="text-gray-700">White-label</span>
                  </li>
                </ul>
                <Link href="/auth/signup" className="btn-outline w-full">
                  Contatar Vendas
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Bot className="h-8 w-8 text-primary-400" />
                  <span className="text-2xl font-bold">ChatBot IA</span>
                </div>
                <p className="text-gray-400">
                  Crie assistentes inteligentes para seu negócio
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Produto</h4>
                <ul className="space-y-2">
                  <li><Link href="/features" className="text-gray-400 hover:text-white">Recursos</Link></li>
                  <li><Link href="/pricing" className="text-gray-400 hover:text-white">Preços</Link></li>
                  <li><Link href="/demo" className="text-gray-400 hover:text-white">Demonstração</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Empresa</h4>
                <ul className="space-y-2">
                  <li><Link href="/about" className="text-gray-400 hover:text-white">Sobre</Link></li>
                  <li><Link href="/contact" className="text-gray-400 hover:text-white">Contato</Link></li>
                  <li><Link href="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Suporte</h4>
                <ul className="space-y-2">
                  <li><Link href="/docs" className="text-gray-400 hover:text-white">Documentação</Link></li>
                  <li><Link href="/help" className="text-gray-400 hover:text-white">Ajuda</Link></li>
                  <li><Link href="/status" className="text-gray-400 hover:text-white">Status</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 ChatBot IA. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
} 