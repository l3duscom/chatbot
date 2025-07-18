import { useState } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import Head from 'next/head'
import { useSession } from 'next-auth/react'
import { Bot, Play, CheckCircle, XCircle } from 'lucide-react'

export default function DebugCSV() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runDebug = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch('/api/debug-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro no debug')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso negado</h1>
          <p>Faça login para acessar esta página</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Debug CSV - ChatBot IA</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Bot className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Debug CSV Upload
              </h1>
            </div>

            <div className="space-y-6">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Esta página executa testes para identificar problemas no upload de CSV.
                      Clique em "Executar Debug" para começar.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={runDebug}
                  disabled={loading}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Play className="h-5 w-5 mr-2" />
                  {loading ? 'Executando...' : 'Executar Debug'}
                </button>
              </div>

              {loading && (
                <div className="text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Executando testes de debug...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <XCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-red-900 mb-2">Erro encontrado:</h3>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {result && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-medium text-green-900 mb-2">Debug concluído:</h3>
                      <p className="text-sm text-green-700 mb-4">{result.message}</p>
                      
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <h4 className="font-medium text-gray-900 mb-2">Resultados:</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Conexão BD:</span>
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                              result.results.databaseConnection === 'OK' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {result.results.databaseConnection}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Chatbots:</span>
                            <span className="ml-2 text-gray-700">{result.results.chatbotsFound}</span>
                          </div>
                          <div>
                            <span className="font-medium">Proc. CSV:</span>
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                              result.results.csvProcessing === 'OK' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {result.results.csvProcessing}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Inserção:</span>
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                              result.results.batchInsert === 'OK' 
                                ? 'bg-green-100 text-green-800' 
                                : result.results.batchInsert.includes('SKIPPED')
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {result.results.batchInsert}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Instruções:</h3>
                <ol className="text-sm text-gray-700 space-y-1">
                  <li>1. Execute o debug clicando no botão acima</li>
                  <li>2. Verifique se todos os testes passaram</li>
                  <li>3. Se houver erros, veja os detalhes no console do navegador</li>
                  <li>4. Tente fazer o upload do CSV após o debug passar</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
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
    props: {
      session,
    },
  }
} 