import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Bot, ArrowLeft, Send, User, Loader2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export default function DemoSimple() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => uuidv4())

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro na resposta da API')
      }

      const data = await response.json()
      
      const botMessage: Message = {
        id: data.messageId || Date.now().toString(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Erro:', error)
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Desculpe, ocorreu um erro. Tente novamente.',
        role: 'assistant',
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      <Head>
        <title>Demo Simples - ChatBot IA</title>
        <meta name="description" content="Teste simples do ChatBot IA" />
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
                  <span className="text-2xl font-bold text-gray-900">ChatBot IA - Teste Simples</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Container */}
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
            {/* Chat Header */}
            <div className="bg-primary-600 text-white p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-medium">Assistente de Vendas</h3>
                <p className="text-sm text-primary-100">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: '480px' }}>
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-20">
                  <Bot className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg">Olá! Como posso ajudá-lo hoje?</p>
                  <p className="text-sm mt-2">Digite uma mensagem para começar</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                  >
                    <div className={`flex items-end max-w-xs lg:max-w-md ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-2' : 'mr-2'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === 'user' 
                            ? 'bg-primary-500 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <div className={`text-xs mt-1 ${
                          message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="flex items-end max-w-xs lg:max-w-md">
                    <div className="flex-shrink-0 mr-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 text-gray-600">
                        <Bot size={16} />
                      </div>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-gray-100">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    rows={1}
                    className="w-full resize-none rounded-lg px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    style={{ minHeight: '40px', maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className={`p-2 rounded-lg transition-colors ${
                    inputMessage.trim() && !isLoading
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Test Suggestions */}
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-medium text-yellow-800 mb-2">🧪 Teste estas mensagens:</h3>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setInputMessage('olá')}
                className="text-left p-2 bg-yellow-100 rounded hover:bg-yellow-200 text-sm"
              >
                "olá"
              </button>
              <button 
                onClick={() => setInputMessage('horário de funcionamento')}
                className="text-left p-2 bg-yellow-100 rounded hover:bg-yellow-200 text-sm"
              >
                "horário de funcionamento"
              </button>
              <button 
                onClick={() => setInputMessage('formas de pagamento')}
                className="text-left p-2 bg-yellow-100 rounded hover:bg-yellow-200 text-sm"
              >
                "formas de pagamento"
              </button>
              <button 
                onClick={() => setInputMessage('prazo de entrega')}
                className="text-left p-2 bg-yellow-100 rounded hover:bg-yellow-200 text-sm"
              >
                "prazo de entrega"
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 