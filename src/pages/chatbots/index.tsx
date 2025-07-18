import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Head from 'next/head'
import Link from 'next/link'
import { Bot, Plus, MessageSquare, Settings, BarChart, Eye, Power, Trash2, Edit, Search, Filter } from 'lucide-react'
import { toast } from 'react-hot-toast'
import AppLayout from '@/components/AppLayout'

interface Chatbot {
  id: string
  name: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    conversations: number
    knowledgeBase: number
  }
}

interface ChatbotsPageProps {
  user: {
    id: string
    name: string
    email: string
  }
}

export default function Chatbots({ user }: ChatbotsPageProps) {
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    fetchChatbots()
  }, [])

  const fetchChatbots = async () => {
    try {
      const response = await fetch('/api/chatbots')
      if (!response.ok) {
        throw new Error('Erro ao carregar chatbots')
      }
      const data = await response.json()
      setChatbots(data.chatbots)
    } catch (error) {
      console.error('Error fetching chatbots:', error)
      toast.error('Erro ao carregar chatbots')
    } finally {
      setLoading(false)
    }
  }

  const toggleChatbotStatus = async (id: string, isActive: boolean) => {
    setActionLoading(id)
    try {
      const response = await fetch(`/api/chatbots/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (!response.ok) {
        throw new Error('Erro ao alterar status')
      }

      setChatbots(prev => 
        prev.map(bot => 
          bot.id === id ? { ...bot, isActive: !isActive } : bot
        )
      )

      toast.success(`Chatbot ${!isActive ? 'ativado' : 'desativado'} com sucesso`)
    } catch (error) {
      console.error('Error toggling chatbot status:', error)
      toast.error('Erro ao alterar status do chatbot')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteChatbot = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja deletar o chatbot "${name}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    setActionLoading(id)
    try {
      const response = await fetch(`/api/chatbots/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar chatbot')
      }

      setChatbots(prev => prev.filter(bot => bot.id !== id))
      toast.success('Chatbot deletado com sucesso')
    } catch (error) {
      console.error('Error deleting chatbot:', error)
      toast.error('Erro ao deletar chatbot')
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const filteredChatbots = chatbots.filter(chatbot => {
    const matchesSearch = chatbot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chatbot.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && chatbot.isActive) ||
                         (filter === 'inactive' && !chatbot.isActive)
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <AppLayout user={user} title="Chatbots">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando chatbots...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Meus Chatbots - ChatBot IA</title>
        <meta name="description" content="Gerencie seus chatbots" />
      </Head>

      <AppLayout user={user} title="Meus Chatbots">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex-1 min-w-0">
              <p className="text-gray-600">
                Gerencie e monitore seus assistentes inteligentes
              </p>
            </div>
            <Link
              href="/chatbots/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Chatbot
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar chatbots..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>

          {/* Chatbots Grid */}
          {filteredChatbots.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bot className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || filter !== 'all' ? 'Nenhum chatbot encontrado' : 'Nenhum chatbot criado'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filter !== 'all' 
                  ? 'Tente ajustar sua busca ou filtro' 
                  : 'Crie seu primeiro chatbot para começar a automatizar o atendimento'
                }
              </p>
              {(!searchTerm && filter === 'all') && (
                <Link
                  href="/chatbots/create"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Chatbot
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChatbots.map((chatbot) => (
                <div key={chatbot.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Bot className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {chatbot.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(chatbot.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      chatbot.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {chatbot.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  {chatbot.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {chatbot.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{chatbot._count.conversations}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BarChart className="h-4 w-4" />
                      <span>{chatbot._count.knowledgeBase}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/chatbots/${chatbot.id}/test`}
                        className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Testar</span>
                      </Link>
                      <button
                        onClick={() => {
                          toast('Funcionalidade em desenvolvimento')
                        }}
                        className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-700 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleChatbotStatus(chatbot.id, chatbot.isActive)}
                        disabled={actionLoading === chatbot.id}
                        className={`flex items-center space-x-1 text-sm transition-colors ${
                          chatbot.isActive 
                            ? 'text-orange-600 hover:text-orange-700' 
                            : 'text-green-600 hover:text-green-700'
                        }`}
                      >
                        {actionLoading === chatbot.id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                        <span>{chatbot.isActive ? 'Pausar' : 'Ativar'}</span>
                      </button>
                      <button
                        onClick={() => deleteChatbot(chatbot.id, chatbot.name)}
                        disabled={actionLoading === chatbot.id}
                        className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Deletar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

  return {
    props: {
      user: {
        id: session.user.id,
        name: session.user.name || 'Usuário',
        email: session.user.email,
      },
    },
  }
} 