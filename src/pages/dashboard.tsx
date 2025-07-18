import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import Link from 'next/link'
import { Bot, Plus, MessageSquare, BarChart3, TrendingUp, Users, Zap, ArrowUpRight } from 'lucide-react'
import AppLayout from '@/components/AppLayout'

export default function Dashboard() {
  const { data: session } = useSession()

  if (!session) {
    return null
  }

  const stats = [
    {
      name: 'Chatbots Ativos',
      value: '3',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Bot,
    },
    {
      name: 'Conversas Hoje',
      value: '247',
      change: '+18%',
      changeType: 'positive' as const,
      icon: MessageSquare,
    },
    {
      name: 'Taxa de Satisfação',
      value: '94%',
      change: '+2%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
    {
      name: 'Usuários Únicos',
      value: '1.2k',
      change: '+25%',
      changeType: 'positive' as const,
      icon: Users,
    },
  ]

  const quickActions = [
    {
      name: 'Criar Novo Chatbot',
      description: 'Configure um assistente IA personalizado',
      href: '/chatbots/create',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      name: 'Ver Chatbots',
      description: 'Gerencie seus assistentes existentes',
      href: '/chatbots',
      icon: Bot,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      name: 'Analytics',
      description: 'Visualize métricas e relatórios',
      href: '/analytics',
      icon: BarChart3,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'conversation',
      title: 'Nova conversa iniciada',
      description: 'Assistente de Vendas respondeu uma consulta',
      time: '2 min atrás',
      icon: MessageSquare,
    },
    {
      id: 2,
      type: 'chatbot',
      title: 'Chatbot atualizado',
      description: 'Assistente de Suporte foi configurado',
      time: '1 hora atrás',
      icon: Bot,
    },
    {
      id: 3,
      type: 'analytics',
      title: 'Relatório gerado',
      description: 'Métricas semanais estão disponíveis',
      time: '3 horas atrás',
      icon: BarChart3,
    },
  ]

  return (
    <>
      <Head>
        <title>Dashboard - ChatBot IA</title>
        <meta name="description" content="Dashboard do ChatBot IA" />
      </Head>

      <AppLayout user={{
        id: session.user.id,
        name: session.user.name || 'Usuário',
        email: session.user.email,
        image: session.user.image || undefined,
      }} title="Dashboard">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Bem-vindo de volta, {session.user.name}!
                  </h2>
                  <p className="text-blue-100">
                    Seus assistentes IA estão prontos para ajudar seus clientes
                  </p>
                </div>
                <div className="hidden md:block">
                  <Zap className="h-16 w-16 text-blue-200" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <stat.icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm font-medium text-green-600">
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">vs último mês</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${action.color} transition-colors`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{action.name}</h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity & Demo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <activity.icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Demo Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Teste o Sistema</h3>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Bot className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Chatbot de Demonstração
                </h4>
                <p className="text-gray-600 mb-6">
                  Experimente nosso assistente IA já configurado com base de conhecimento
                </p>
                <Link
                  href="/demo"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Testar Agora
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    }
  }

  return {
    props: { session },
  }
} 