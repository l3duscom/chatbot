import React, { useState, useEffect } from 'react'
import { FileText, Search, Tag, Calendar, Trash2, RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface KnowledgeBaseItem {
  id: string
  title: string
  content: string
  type: 'DOCUMENT' | 'FAQ' | 'TEXT'
  source: string
  tags: string[]
  metadata: any
  createdAt: string
}

interface KnowledgeBaseViewerProps {
  chatbotId: string
  onUpdate?: () => void
}

export default function KnowledgeBaseViewer({ chatbotId, onUpdate }: KnowledgeBaseViewerProps) {
  const [items, setItems] = useState<KnowledgeBaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedItem, setSelectedItem] = useState<KnowledgeBaseItem | null>(null)

  useEffect(() => {
    loadKnowledgeBase()
  }, [chatbotId])

  const loadKnowledgeBase = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/chatbots/${chatbotId}/knowledge-base`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar base de conhecimento')
      }

      const data = await response.json()
      
      // Processar itens para extrair tags do metadata
      const processedItems = data.knowledgeBase.map((item: any) => ({
        ...item,
        tags: item.metadata?.tags || [],
        createdAt: new Date(item.createdAt).toLocaleDateString('pt-BR')
      }))

      setItems(processedItems)
    } catch (error) {
      console.error('Erro ao carregar base de conhecimento:', error)
      toast.error('Erro ao carregar base de conhecimento')
    } finally {
      setLoading(false)
    }
  }

  const clearKnowledgeBase = async () => {
    if (!confirm('Tem certeza que deseja limpar toda a base de conhecimento? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const response = await fetch(`/api/chatbots/${chatbotId}/knowledge-base`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao limpar base de conhecimento')
      }

      setItems([])
      toast.success('Base de conhecimento limpa com sucesso')
      onUpdate?.()
    } catch (error) {
      console.error('Erro ao limpar base de conhecimento:', error)
      toast.error('Erro ao limpar base de conhecimento')
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = typeFilter === 'all' || item.type === typeFilter

    return matchesSearch && matchesType
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DOCUMENT': return 'bg-blue-100 text-blue-800'
      case 'FAQ': return 'bg-green-100 text-green-800'
      case 'TEXT': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DOCUMENT': return <FileText className="h-4 w-4" />
      case 'FAQ': return <Search className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando base de conhecimento...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            Base de Conhecimento
          </h3>
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {items.length} itens
          </span>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearKnowledgeBase}
            className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Limpar Tudo
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma base de conhecimento encontrada
          </h3>
          <p className="text-gray-600">
            Faça upload de um arquivo CSV para adicionar conhecimento ao seu chatbot.
          </p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar na base de conhecimento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos os tipos</option>
                <option value="DOCUMENT">Documentos</option>
                <option value="FAQ">FAQ</option>
                <option value="TEXT">Texto</option>
              </select>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="flex items-center mr-3">
                      {getTypeIcon(item.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 line-clamp-1">
                        {item.title}
                      </h4>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {item.createdAt}
                        <span className="mx-2">•</span>
                        <span className="text-xs">
                          {item.source}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(item.type)}`}>
                      {item.type}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {item.content}
                </p>

                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 5).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 5 && (
                      <span className="text-xs text-gray-500">
                        +{item.tags.length - 5} mais
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-gray-600">
                Tente ajustar os filtros ou termo de busca.
              </p>
            </div>
          )}
        </>
      )}

      {/* Modal de Detalhes */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedItem.title}
                </h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full ${getTypeColor(selectedItem.type)}`}>
                    {selectedItem.type}
                  </span>
                  <span>•</span>
                  <span>{selectedItem.createdAt}</span>
                  <span>•</span>
                  <span>{selectedItem.source}</span>
                </div>

                <div className="prose max-w-none">
                  <h4 className="font-medium text-gray-900 mb-2">Conteúdo:</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedItem.content}
                    </p>
                  </div>
                </div>

                {selectedItem.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.metadata && Object.keys(selectedItem.metadata).length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Metadados:</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(selectedItem.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 