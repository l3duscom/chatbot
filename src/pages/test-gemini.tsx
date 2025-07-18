import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Bot, ArrowLeft, Play, CheckCircle, XCircle } from 'lucide-react'

export default function TestGemini() {
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testGemini = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/test-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.message || 'Erro desconhecido')
      }
    } catch (err) {
      setError('Erro ao conectar com a API')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Teste Gemini API - ChatBot IA</title>
        <meta name="description" content="Teste da integração com Gemini" />
      </Head>

      <div className="min-h-screen bg-gray-50">
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
                  <span className="text-2xl font-bold text-gray-900">Teste Gemini API</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-6">
          <div className="space-y-6">
            {/* Test Button */}
            <div className="card text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Teste da Integração Gemini
              </h2>
              <p className="text-gray-600 mb-6">
                Clique no botão abaixo para testar se a API do Gemini está funcionando corretamente
              </p>
              
              <button
                onClick={testGemini}
                disabled={isLoading}
                className="btn-primary inline-flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    <span>Testando...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    <span>Testar Gemini API</span>
                  </>
                )}
              </button>
            </div>

            {/* Success Result */}
            {result && (
              <div className="card border-green-200 bg-green-50">
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-800">
                    ✅ Gemini API funcionando!
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Resposta do Gemini:</h4>
                    <div className="bg-white p-4 rounded-lg border">
                      <p className="text-gray-800">{result.response}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">API Key (parcial):</h4>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {result.apiKey}
                    </code>
                  </div>
                </div>
              </div>
            )}

            {/* Error Result */}
            {error && (
              <div className="card border-red-200 bg-red-50">
                <div className="flex items-center space-x-2 mb-4">
                  <XCircle className="h-6 w-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-800">
                    ❌ Erro na API do Gemini
                  </h3>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-red-700">{error}</p>
                </div>
                
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-2">
                    💡 Como resolver:
                  </h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Verifique se a GEMINI_API_KEY está configurada no .env.local</li>
                    <li>• Acesse <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a> para criar uma nova API key</li>
                    <li>• Certifique-se de que a API key é válida e ativa</li>
                    <li>• Reinicie o servidor após alterar o .env.local</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📋 Instruções
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">1. Configurar API Key</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Adicione sua API key do Gemini no arquivo <code className="bg-gray-100 px-1 rounded">.env.local</code>:
                  </p>
                  <pre className="bg-gray-100 p-3 rounded mt-2 text-sm">
{`GEMINI_API_KEY="sua-api-key-aqui"`}
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">2. Obter API Key</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Acesse o <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">Google AI Studio</a> para criar uma nova API key gratuita.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">3. Reiniciar Servidor</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Após alterar o <code className="bg-gray-100 px-1 rounded">.env.local</code>, reinicie o servidor com <code className="bg-gray-100 px-1 rounded">npm run dev</code>.
                  </p>
                </div>
              </div>
            </div>

            {/* Alternative Test */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🔧 Teste Alternativo
              </h3>
              <p className="text-gray-600 mb-4">
                Se o Gemini não estiver funcionando, você pode testar o chat básico:
              </p>
              <Link 
                href="/demo-simple" 
                className="btn-outline inline-flex items-center space-x-2"
              >
                <Bot className="h-5 w-5" />
                <span>Testar Chat Simples</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  )
} 