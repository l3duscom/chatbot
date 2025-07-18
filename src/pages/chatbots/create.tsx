import { useState } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Head from 'next/head'
import Link from 'next/link'
import { Bot, Save, Sparkles, ArrowLeft, Zap, MessageSquare, GraduationCap, Heart } from 'lucide-react'
import { toast } from 'react-hot-toast'
import AppLayout from '@/components/AppLayout'
import CSVUpload from '@/components/CSVUpload'
import KnowledgeBaseViewer from '@/components/KnowledgeBaseViewer'

interface CreateChatbotPageProps {
  user: {
    id: string
    name: string
    email: string
  }
}

export default function CreateChatbot({ user }: CreateChatbotPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [createdChatbotId, setCreatedChatbotId] = useState<string | null>(null)
  const [uploadKey, setUploadKey] = useState(0) // Para forçar re-render do viewer
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prompt: '',
    welcomeMessage: 'Olá! Como posso ajudá-lo hoje?',
    fallbackMessage: 'Desculpe, não entendi. Pode reformular sua pergunta?',
    settings: {
      temperature: 0.7,
      maxTokens: 1000,
      responseTime: 'fast',
      language: 'pt-BR',
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/chatbots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar chatbot')
      }

      const { chatbot } = await response.json()
      
      setCreatedChatbotId(chatbot.id)
      toast.success('Chatbot criado com sucesso! Agora você pode adicionar uma base de conhecimento.')
    } catch (error) {
      console.error('Error creating chatbot:', error)
      toast.error('Erro ao criar chatbot')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('settings.')) {
      const settingField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingField]: value,
        },
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const promptTemplates = [
    {
      title: 'Assistente de Atendimento',
      description: 'Para suporte ao cliente e vendas',
      icon: MessageSquare,
      color: 'bg-blue-50 text-blue-600',
      prompt: `Você é um assistente especializado em atendimento ao cliente. Suas principais funções são:

1. Dar boas-vindas aos clientes de forma amigável
2. Responder dúvidas sobre produtos e serviços
3. Auxiliar no processo de compra
4. Coletar informações de contato quando necessário
5. Escalar para atendimento humano quando apropriado

Mantenha um tom profissional, mas amigável. Sempre busque resolver o problema do cliente da melhor forma possível.`,
    },
    {
      title: 'Assistente Educacional',
      description: 'Para ensino e tutoria',
      icon: GraduationCap,
      color: 'bg-green-50 text-green-600',
      prompt: `Você é um assistente educacional dedicado a ajudar estudantes. Suas responsabilidades incluem:

1. Explicar conceitos complexos de forma simples
2. Fornecer exemplos práticos
3. Criar exercícios e atividades
4. Dar feedback construtivo
5. Encorajar o aprendizado

Seja paciente, didático e sempre incentive o estudante a continuar aprendendo.`,
    },
    {
      title: 'Assistente de Saúde',
      description: 'Para informações médicas básicas',
      icon: Heart,
      color: 'bg-red-50 text-red-600',
      prompt: `Você é um assistente de informações de saúde. Suas funções são:

1. Fornecer informações gerais sobre saúde
2. Explicar sintomas comuns
3. Dar dicas de prevenção
4. Orientar sobre quando buscar ajuda médica
5. Esclarecer dúvidas sobre medicamentos

IMPORTANTE: Sempre reforce que suas informações não substituem consulta médica profissional.`,
    },
  ]

  const useTemplate = (template: any) => {
    setFormData(prev => ({
      ...prev,
      prompt: template.prompt,
    }))
    toast.success('Template aplicado!')
  }

  return (
    <>
      <Head>
        <title>Criar Chatbot - ChatBot IA</title>
        <meta name="description" content="Crie um novo chatbot inteligente" />
      </Head>

      <AppLayout user={user} title="Criar Novo Chatbot">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">
                  Configure seu assistente inteligente em poucos minutos
                </p>
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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Form */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center mb-6">
                    <div className="p-2 bg-blue-50 rounded-lg mr-3">
                      <Bot className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Informações Básicas
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Chatbot *
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: Assistente de Vendas"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição
                      </label>
                      <input
                        type="text"
                        id="description"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Descreva brevemente o propósito do chatbot"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Personality */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center mb-6">
                    <div className="p-2 bg-purple-50 rounded-lg mr-3">
                      <Zap className="h-5 w-5 text-purple-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Personalidade e Comportamento
                    </h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                        Prompt do Sistema *
                      </label>
                      <textarea
                        id="prompt"
                        rows={8}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Defina como o chatbot deve se comportar..."
                        value={formData.prompt}
                        onChange={(e) => handleInputChange('prompt', e.target.value)}
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Descreva o papel, personalidade e funções do seu chatbot
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700 mb-2">
                          Mensagem de Boas-vindas
                        </label>
                        <input
                          type="text"
                          id="welcomeMessage"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={formData.welcomeMessage}
                          onChange={(e) => handleInputChange('welcomeMessage', e.target.value)}
                        />
                      </div>

                      <div>
                        <label htmlFor="fallbackMessage" className="block text-sm font-medium text-gray-700 mb-2">
                          Mensagem de Erro
                        </label>
                        <input
                          type="text"
                          id="fallbackMessage"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={formData.fallbackMessage}
                          onChange={(e) => handleInputChange('fallbackMessage', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center mb-6">
                    <div className="p-2 bg-green-50 rounded-lg mr-3">
                      <Sparkles className="h-5 w-5 text-green-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Configurações Avançadas
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-2">
                        Criatividade: {formData.settings.temperature}
                      </label>
                      <input
                        type="range"
                        id="temperature"
                        min="0"
                        max="1"
                        step="0.1"
                        className="w-full"
                        value={formData.settings.temperature}
                        onChange={(e) => handleInputChange('settings.temperature', parseFloat(e.target.value))}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Conservativo</span>
                        <span>Equilibrado</span>
                        <span>Criativo</span>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="maxTokens" className="block text-sm font-medium text-gray-700 mb-2">
                        Tamanho da Resposta
                      </label>
                      <select
                        id="maxTokens"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.settings.maxTokens}
                        onChange={(e) => handleInputChange('settings.maxTokens', parseInt(e.target.value))}
                      >
                        <option value={500}>Curta (500 tokens)</option>
                        <option value={1000}>Média (1000 tokens)</option>
                        <option value={2000}>Longa (2000 tokens)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Link
                    href="/chatbots"
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    disabled={loading || !!createdChatbotId}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        <span>Criando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>{createdChatbotId ? 'Chatbot Criado' : 'Criar Chatbot'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
              
              {/* Knowledge Base Upload Section */}
              {createdChatbotId && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <CSVUpload 
                      chatbotId={createdChatbotId}
                      onUploadSuccess={(data) => {
                        toast.success(`Base de conhecimento adicionada! ${data.count} registros processados.`)
                        // Recarregar a base de conhecimento
                        setUploadKey(Date.now())
                      }}
                      onUploadError={(error) => {
                        toast.error(`Erro no upload: ${error}`)
                      }}
                    />
                  </div>

                  {/* Visualizador da Base de Conhecimento */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <KnowledgeBaseViewer 
                      key={uploadKey}
                      chatbotId={createdChatbotId}
                      onUpdate={() => {
                        setUploadKey(Date.now())
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => router.push('/chatbots')}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Pular por Agora
                    </button>
                    <button
                      onClick={() => router.push('/chatbots')}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Finalizar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Templates Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-8">
                <div className="flex items-center mb-6">
                  <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Templates
                  </h3>
                </div>
                <div className="space-y-4">
                  {promptTemplates.map((template, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-center mb-3">
                        <div className={`p-2 rounded-lg ${template.color} mr-3`}>
                          <template.icon className="h-4 w-4" />
                        </div>
                        <h4 className="font-medium text-gray-900 text-sm">
                          {template.title}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {template.description}
                      </p>
                      <button
                        type="button"
                        onClick={() => useTemplate(template)}
                        className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium text-left"
                      >
                        Usar Template
                      </button>
                    </div>
                  ))}
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