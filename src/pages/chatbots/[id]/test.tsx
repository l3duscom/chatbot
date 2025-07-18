import { useState } from 'react'
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Head from 'next/head'
import Link from 'next/link'
import { Bot, ArrowLeft, MessageSquare, BarChart, Settings, Power, Play } from 'lucide-react'
import ChatInterface from '@/components/ChatInterface'
import { v4 as uuidv4 } from 'uuid'
import AppLayout from '@/components/AppLayout'

interface Chatbot {
  id: string
  name: string
  description: string
  isActive: boolean
  welcomeMessage: string
  _count: {
    conversations: number
    knowledgeBase: number
  }
}

interface TestChatbotPageProps {
  user: {
    id: string
    name: string
    email: string
  }
  chatbot: Chatbot
}

export default function TestChatbot({ user, chatbot }: TestChatbotPageProps) {
  const [sessionId] = useState(() => uuidv4())

  if (!chatbot.isActive) {
    return (
      <AppLayout user={user} title={`Testar ${chatbot.name}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Bot className="h-10 w-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Chatbot Inativo
              </h2>
              <p className="text-gray-600 mb-8">
                Este chatbot está desativado e não pode ser testado no momento.
              </p>
              <Link
                href="/chatbots"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Chatbots
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Testar {chatbot.name} - ChatBot IA</title>
        <meta name="description" content={`Teste o chatbot ${chatbot.name}`} />
      </Head>

      <AppLayout user={user} title={`Testar ${chatbot.name}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Bot className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {chatbot.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {chatbot.description || 'Teste seu assistente inteligente'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                    Online
                  </span>
                </div>
              </div>
              <Link
                href="/chatbots"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Chat Interface */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {chatbot.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Assistente Virtual
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">Online</span>
                    </div>
                  </div>
                </div>

                {/* Chat Messages Area */}
                <div className="flex-1 overflow-hidden">
                  <ChatInterface
                    chatbotId={chatbot.id}
                    sessionId={sessionId}
                    className="h-full"
                  />
                </div>
              </div>
            </div>

            {/* Info Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-8">
                {/* Stats */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Estatísticas
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Conversas</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {chatbot._count.conversations}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BarChart className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Conhecimento</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {chatbot._count.knowledgeBase}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Power className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Status</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        Ativo
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Ações Rápidas
                  </h3>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                      📊 Ver Analytics
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                      ⚙️ Configurações
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                      📚 Base de Conhecimento
                    </button>
                  </div>
                </div>

                {/* Test Tips */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    💡 Dicas de Teste
                  </h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start space-x-2">
                      <Play className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Faça perguntas sobre seu negócio</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Play className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Teste diferentes tipos de solicitações</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Play className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Verifique se as respostas são adequadas</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Play className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Experimente cenários reais</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    }
  }

  const { id } = context.query

  if (!id || typeof id !== 'string') {
    return {
      notFound: true,
    }
  }

  try {
    // Importar prisma aqui para evitar problemas de build
    const { prisma } = await import('@/lib/prisma')
    
    const chatbot = await prisma.chatbot.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            conversations: true,
            knowledgeBase: true,
          },
        },
      },
    })

    if (!chatbot) {
      return {
        notFound: true,
      }
    }

    return {
      props: {
        user: {
          id: session.user.id,
          name: session.user.name || 'Usuário',
          email: session.user.email,
        },
        chatbot: {
          id: chatbot.id,
          name: chatbot.name,
          description: chatbot.description,
          isActive: chatbot.isActive,
          welcomeMessage: chatbot.welcomeMessage,
          _count: chatbot._count,
        },
      },
    }
  } catch (error) {
    console.error('Error fetching chatbot:', error)
    return {
      notFound: true,
    }
  }
} 