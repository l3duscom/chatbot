import React, { useState, useCallback } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface CSVUploadProps {
  chatbotId?: string
  onUploadSuccess?: (data: { count: number; fileName: string }) => void
  onUploadError?: (error: string) => void
}

export default function CSVUpload({ chatbotId, onUploadSuccess, onUploadError }: CSVUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleUpload = async (file: File) => {
    if (!chatbotId) {
      toast.error('ID do chatbot é obrigatório')
      return
    }

    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      console.log('🔍 Tentando upload com versão principal...')
      
      // Primeiro, tentar a versão normal
      let response = await fetch(`/api/chatbots/${chatbotId}/upload-csv`, {
        method: 'POST',
        body: formData,
      })

      // Se falhar com erro específico do formidable, tentar a versão corrigida
      if (!response.ok) {
        const errorData = await response.json()
        console.log('❌ Versão principal falhou:', errorData.message)
        
        if (errorData.message?.includes('not a function') || 
            errorData.message?.includes('formidable') ||
            errorData.message?.includes('Erro interno do servidor')) {
          
          console.log('🔄 Tentando versão corrigida...')
          toast.loading('Tentando método alternativo...')
          
          response = await fetch(`/api/chatbots/${chatbotId}/upload-csv-fix`, {
            method: 'POST',
            body: formData,
          })
        }
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer upload')
      }

      setUploadedFile(file)
      const successMessage = data.message?.includes('corrigida') 
        ? `${data.count} registros adicionados com sucesso! (método alternativo)`
        : `${data.count} registros adicionados com sucesso!`
      
      toast.success(successMessage)
      onUploadSuccess?.(data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      console.error('❌ Erro final no upload:', errorMessage)
      toast.error(errorMessage)
      onUploadError?.(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files?.[0]) {
      const file = files[0]
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        handleUpload(file)
      } else {
        toast.error('Por favor, selecione apenas arquivos CSV')
      }
    }
  }, [handleUpload])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <FileText className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          Base de Conhecimento
        </h3>
      </div>

      {!uploadedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="text-sm text-gray-600">
              <label
                htmlFor="csv-file"
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
              >
                <span>Clique para fazer upload</span>
                <input
                  id="csv-file"
                  name="csv-file"
                  type="file"
                  accept=".csv"
                  className="sr-only"
                  onChange={handleFileInput}
                  disabled={uploading}
                />
              </label>
              <p className="pl-1 inline">ou arraste e solte</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              CSV até 5MB
            </p>
          </div>

          {uploading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Processando...</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-green-700">
                  Upload concluído com sucesso
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="text-green-600 hover:text-green-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Formato do CSV */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Formatos de CSV Suportados
            </h4>
            
            <div className="space-y-4">
              {/* Novo formato */}
              <div>
                <h5 className="text-sm font-semibold text-blue-900 mb-2">
                  1. Formato Base de Conhecimento (Novo)
                </h5>
                <p className="text-sm text-blue-700 mb-2">
                  Separador: ponto e vírgula (;)
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>idpasta</strong>: ID da pasta</li>
                  <li>• <strong>pasta</strong>: Nome da pasta</li>
                  <li>• <strong>idconhecimento</strong>: ID único do conhecimento</li>
                  <li>• <strong>titulo</strong>: Título do documento</li>
                  <li>• <strong>tipodocumento</strong>: Tipo do documento</li>
                  <li>• <strong>conteudosemformatacao</strong>: Conteúdo em texto puro</li>
                  <li>• <strong>conteudo</strong>: Conteúdo com formatação HTML</li>
                  <li>• <strong>tags</strong>: Tags separadas por vírgulas</li>
                </ul>
              </div>

              {/* Formato antigo */}
              <div>
                <h5 className="text-sm font-semibold text-blue-900 mb-2">
                  2. Formato FAQ (Antigo)
                </h5>
                <p className="text-sm text-blue-700 mb-2">
                  Separador: vírgula (,)
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>pergunta</strong> (ou question): A pergunta do usuário</li>
                  <li>• <strong>resposta</strong> (ou answer): A resposta do chatbot</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exemplos de CSV */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Exemplos de CSV:
        </h4>
        
        <div className="space-y-4">
          {/* Exemplo novo formato */}
          <div>
            <h5 className="text-sm font-semibold text-gray-900 mb-2">
              Formato Base de Conhecimento:
            </h5>
            <pre className="text-xs text-gray-700 bg-white p-2 rounded border overflow-x-auto">
{`idpasta;pasta;idconhecimento;titulo;tipodocumento;conteudosemformatacao;conteudo;tags
983;;3991;Hardware - Computador - RAT de Atendimento;D;Modelo de RAT de atendimento de Computador.;<p>Modelo de RAT de atendimento de Computador.</p>;hardware,computador,rat,atendimento
983;;2305;Hardware - Impressora - ADF Atolando;D;Executar verificações do script em anexo.;<p>Executar verificações do script em anexo.</p>;hardware,impressora,adf`}
            </pre>
          </div>

          {/* Exemplo formato antigo */}
          <div>
            <h5 className="text-sm font-semibold text-gray-900 mb-2">
              Formato FAQ:
            </h5>
            <pre className="text-xs text-gray-700 bg-white p-2 rounded border overflow-x-auto">
{`pergunta,resposta
"Qual é o horário de funcionamento?","Funcionamos de segunda a sexta das 9h às 18h"
"Como posso cancelar meu pedido?","Você pode cancelar seu pedido até 24h após a compra"
"Quais são as formas de pagamento?","Aceitamos cartão de crédito, débito e PIX"`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
} 