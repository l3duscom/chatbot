import axios from 'axios'

export interface KnowledgeBaseItem {
  id: string
  title: string
  content: string
  type: 'TEXT' | 'FAQ' | 'DOCUMENT' | 'URL' | 'API'
  source?: string
  metadata?: Record<string, any>
  tags?: string[]
  embedding?: number[]
}

export interface ExternalKnowledgeSource {
  type: 'api' | 'website' | 'document' | 'database'
  url: string
  apiKey?: string
  headers?: Record<string, string>
  query?: string
}

export class KnowledgeBaseManager {
  private externalApiUrl: string
  private apiKey: string

  constructor(apiUrl: string, apiKey: string) {
    this.externalApiUrl = apiUrl
    this.apiKey = apiKey
  }

  // Buscar na base de conhecimento interna
  async searchInternalKnowledge(
    query: string,
    chatbotId: string,
    limit: number = 5
  ): Promise<KnowledgeBaseItem[]> {
    try {
      const response = await axios.post('/api/knowledge-base/search', {
        query,
        chatbotId,
        limit,
      })
      return response.data.results
    } catch (error) {
      console.error('Internal knowledge search error:', error)
      return []
    }
  }

  // Buscar na API externa
  async searchExternalKnowledge(
    query: string,
    source: ExternalKnowledgeSource
  ): Promise<KnowledgeBaseItem[]> {
    try {
      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...source.headers,
      }

      const response = await axios.post(
        `${this.externalApiUrl}/search`,
        {
          query,
          source: source.type,
          url: source.url,
          ...source.query && { customQuery: source.query },
        },
        { headers }
      )

      return response.data.results || []
    } catch (error) {
      console.error('External knowledge search error:', error)
      return []
    }
  }

  // Buscar conhecimento combinado (interno + externo)
  async searchCombinedKnowledge(
    query: string,
    chatbotId: string,
    externalSources: ExternalKnowledgeSource[] = []
  ): Promise<{
    internal: KnowledgeBaseItem[]
    external: KnowledgeBaseItem[]
    combined: KnowledgeBaseItem[]
  }> {
    try {
      // Buscar conhecimento interno
      const internalPromise = this.searchInternalKnowledge(query, chatbotId)

      // Buscar conhecimento externo
      const externalPromises = externalSources.map(source =>
        this.searchExternalKnowledge(query, source)
      )

      const [internal, ...externalResults] = await Promise.all([
        internalPromise,
        ...externalPromises,
      ])

      const external = externalResults.flat()

      // Combinar e ordenar por relevância
      const combined = [...internal, ...external]
        .sort((a, b) => {
          // Priorizar conhecimento interno
          if (a.source === 'internal' && b.source !== 'internal') return -1
          if (a.source !== 'internal' && b.source === 'internal') return 1
          return 0
        })
        .slice(0, 10)

      return {
        internal,
        external,
        combined,
      }
    } catch (error) {
      console.error('Combined knowledge search error:', error)
      return {
        internal: [],
        external: [],
        combined: [],
      }
    }
  }

  // Adicionar novo conhecimento
  async addKnowledge(
    chatbotId: string,
    item: Omit<KnowledgeBaseItem, 'id'>
  ): Promise<KnowledgeBaseItem | null> {
    try {
      const response = await axios.post('/api/knowledge-base', {
        chatbotId,
        ...item,
      })
      return response.data.item
    } catch (error) {
      console.error('Add knowledge error:', error)
      return null
    }
  }

  // Atualizar conhecimento existente
  async updateKnowledge(
    id: string,
    updates: Partial<KnowledgeBaseItem>
  ): Promise<KnowledgeBaseItem | null> {
    try {
      const response = await axios.patch(`/api/knowledge-base/${id}`, updates)
      return response.data.item
    } catch (error) {
      console.error('Update knowledge error:', error)
      return null
    }
  }

  // Remover conhecimento
  async removeKnowledge(id: string): Promise<boolean> {
    try {
      await axios.delete(`/api/knowledge-base/${id}`)
      return true
    } catch (error) {
      console.error('Remove knowledge error:', error)
      return false
    }
  }

  // Importar conhecimento de fonte externa
  async importFromExternalSource(
    chatbotId: string,
    source: ExternalKnowledgeSource
  ): Promise<{
    success: boolean
    imported: number
    errors: string[]
  }> {
    try {
      const response = await axios.post('/api/knowledge-base/import', {
        chatbotId,
        source,
      })
      return response.data
    } catch (error) {
      console.error('Import knowledge error:', error)
      return {
        success: false,
        imported: 0,
        errors: [error.message],
      }
    }
  }

  // Treinar o agente com novos dados
  async trainAgent(
    chatbotId: string,
    trainingData: {
      conversations: Array<{
        messages: Array<{ role: string; content: string }>
        outcome: 'success' | 'failure'
        feedback?: string
      }>
      knowledgeUpdates?: KnowledgeBaseItem[]
    }
  ): Promise<{
    success: boolean
    trainingId: string
    metrics: {
      accuracy: number
      confidence: number
      knowledgeGaps: string[]
    }
  }> {
    try {
      const response = await axios.post('/api/agents/train', {
        chatbotId,
        trainingData,
      })
      return response.data
    } catch (error) {
      console.error('Agent training error:', error)
      return {
        success: false,
        trainingId: '',
        metrics: {
          accuracy: 0,
          confidence: 0,
          knowledgeGaps: [],
        },
      }
    }
  }

  // Analisar performance do agente
  async analyzeAgentPerformance(
    chatbotId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<{
    totalConversations: number
    successRate: number
    averageResponseTime: number
    commonQuestions: string[]
    knowledgeGaps: string[]
    improvementSuggestions: string[]
  }> {
    try {
      const response = await axios.post('/api/agents/analyze', {
        chatbotId,
        timeRange,
      })
      return response.data
    } catch (error) {
      console.error('Agent analysis error:', error)
      return {
        totalConversations: 0,
        successRate: 0,
        averageResponseTime: 0,
        commonQuestions: [],
        knowledgeGaps: [],
        improvementSuggestions: [],
      }
    }
  }

  // Gerar embeddings para texto
  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const response = await axios.post('/api/embeddings', {
        text,
      })
      return response.data.embedding
    } catch (error) {
      console.error('Embedding generation error:', error)
      return []
    }
  }

  // Buscar similar por embeddings
  async searchSimilarByEmbedding(
    embedding: number[],
    chatbotId: string,
    threshold: number = 0.8
  ): Promise<KnowledgeBaseItem[]> {
    try {
      const response = await axios.post('/api/knowledge-base/search-similar', {
        embedding,
        chatbotId,
        threshold,
      })
      return response.data.results
    } catch (error) {
      console.error('Similarity search error:', error)
      return []
    }
  }
}

export default KnowledgeBaseManager 