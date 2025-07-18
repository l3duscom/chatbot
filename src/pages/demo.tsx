import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Bot, ArrowLeft } from 'lucide-react'
import ChatInterface from '@/components/ChatInterface'
import { v4 as uuidv4 } from 'uuid'

export default function Demo() {
  const [sessionId] = useState(() => uuidv4())

  return (
    <>
      <Head>
        <title>Demonstração - ChatBot IA</title>
        <meta name="description" content="Teste o ChatBot IA em ação" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/" 
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Voltar</span>
                </Link>
                <div className="flex items-center space-x-2">
                  <Bot className="h-8 w-8 text-primary-600" />
                  <span className="text-2xl font-bold text-gray-900">ChatBot IA</span>
                </div>
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

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Info Panel */}
            <div className="lg:col-span-1">
              <div className="card sticky top-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="h-8 w-8 text-primary-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Assistente de Vendas
                  </h2>
                  <p className="text-gray-600">
                    Chatbot especializado em atendimento ao cliente e vendas
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      🎯 Funcionalidades
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Responde dúvidas sobre produtos</li>
                      <li>• Informa preços e condições</li>
                      <li>• Auxilia no processo de compra</li>
                      <li>• Fornece informações de contato</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      💬 Perguntas Sugeridas
                    </h3>
                    <div className="space-y-2">
                      <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                        "Qual é o horário de funcionamento?"
                      </button>
                      <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                        "Como faço para devolver um produto?"
                      </button>
                      <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                        "Quais são as formas de pagamento?"
                      </button>
                      <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                        "Qual é o prazo de entrega?"
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      🚀 Recursos Avançados
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Powered by Gemini AI</li>
                      <li>• Base de conhecimento integrada</li>
                      <li>• Respostas em tempo real</li>
                      <li>• Suporte a markdown</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Gostou do que viu? Crie sua conta gratuita!
                    </p>
                    <Link href="/auth/signup" className="btn-primary w-full">
                      Começar Agora
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Panel */}
            <div className="lg:col-span-2">
              <div className="card p-0 overflow-hidden h-[600px]">
                <ChatInterface
                  chatbotId="demo-chatbot"
                  sessionId={sessionId}
                  className="h-full"
                />
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Por que escolher o ChatBot IA?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Plataforma completa para criar assistentes inteligentes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  IA Avançada
                </h3>
                <p className="text-gray-600">
                  Powered by Google Gemini para conversas naturais e inteligentes
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Configuração Rápida
                </h3>
                <p className="text-gray-600">
                  Crie e configure seu chatbot em minutos, não em horas
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Analytics Detalhado
                </h3>
                <p className="text-gray-600">
                  Acompanhe métricas e insights sobre o desempenho do seu bot
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
} 