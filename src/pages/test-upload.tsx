import { useState } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import Head from 'next/head'
import { useSession } from 'next-auth/react'
import { Bot, Upload, FileText } from 'lucide-react'

export default function TestUpload() {
  const { data: session } = useSession()
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<string>('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      
      // Simular leitura do CSV
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        setResult(`Arquivo carregado: ${selectedFile.name}\nConteúdo:\n${content.substring(0, 500)}...`)
      }
      reader.readAsText(selectedFile)
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
        <title>Teste de Upload CSV - ChatBot IA</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Bot className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Teste de Upload CSV
              </h1>
            </div>

            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="text-sm text-gray-600 mb-4">
                  <label
                    htmlFor="csv-file"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                  >
                    <span>Selecione um arquivo CSV</span>
                    <input
                      id="csv-file"
                      name="csv-file"
                      type="file"
                      accept=".csv"
                      className="sr-only"
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  Arquivo CSV com colunas: pergunta, resposta
                </p>
              </div>

              {file && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <FileText className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-900">
                      {file.name}
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    Tamanho: {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}

              {result && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">
                    Preview do Arquivo:
                  </h3>
                  <pre className="text-sm text-blue-800 bg-white p-3 rounded border overflow-x-auto">
                    {result}
                  </pre>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-900 mb-2">
                  ⚠️ Dependências Necessárias:
                </h3>
                <p className="text-sm text-yellow-800 mb-2">
                  Para o upload funcionar completamente, execute:
                </p>
                <code className="text-sm bg-yellow-100 p-2 rounded block text-yellow-900">
                  npm install @next-auth/prisma-adapter formidable papaparse @types/formidable @types/papaparse
                </code>
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
    props: { session },
  }
} 