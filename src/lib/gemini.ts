import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
}

export interface ChatbotSettings {
  temperature?: number
  maxTokens?: number
  topP?: number
  topK?: number
  systemPrompt?: string
}

export class GeminiChatbot {
  private model: any
  private settings: ChatbotSettings

  constructor(settings: ChatbotSettings = {}) {
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    this.settings = {
      temperature: 0.7,
      maxTokens: 1000,
      topP: 0.8,
      topK: 40,
      ...settings,
    }
  }

  async generateResponse(
    message: string,
    context: ChatMessage[] = [],
    knowledgeBase: string[] = []
  ): Promise<string> {
    try {
      // Preparar o contexto da conversa
      let conversationContext = ''
      
      if (context.length > 0) {
        conversationContext = context
          .map(msg => `${msg.role}: ${msg.content}`)
          .join('\n')
      }

      // Preparar a base de conhecimento
      let knowledgeContext = ''
      if (knowledgeBase.length > 0) {
        knowledgeContext = `\n\nBase de conhecimento:\n${knowledgeBase.join('\n\n')}`
      }

      // Preparar o prompt completo
      const fullPrompt = `
${this.settings.systemPrompt || ''}

${conversationContext}

${knowledgeContext}

Usuário: ${message}
Assistente:`

      // Gerar resposta
      const result = await this.model.generateContent(fullPrompt)
      const response = await result.response
      const text = response.text()

      return text.trim()
    } catch (error) {
      console.error('Gemini API error:', error)
      throw new Error('Failed to generate response')
    }
  }

  async generateStreamResponse(
    message: string,
    context: ChatMessage[] = [],
    knowledgeBase: string[] = []
  ): Promise<AsyncGenerator<string, void, unknown>> {
    try {
      // Preparar o contexto da conversa
      let conversationContext = ''
      
      if (context.length > 0) {
        conversationContext = context
          .map(msg => `${msg.role}: ${msg.content}`)
          .join('\n')
      }

      // Preparar a base de conhecimento
      let knowledgeContext = ''
      if (knowledgeBase.length > 0) {
        knowledgeContext = `\n\nBase de conhecimento:\n${knowledgeBase.join('\n\n')}`
      }

      // Preparar o prompt completo
      const fullPrompt = `
${this.settings.systemPrompt || ''}

${conversationContext}

${knowledgeContext}

Usuário: ${message}
Assistente:`

      // Gerar resposta em stream
      const result = await this.model.generateContentStream(fullPrompt)

      // Retornar o generator
      return this.createStreamGenerator(result.stream)
    } catch (error) {
      console.error('Gemini streaming error:', error)
      throw new Error('Failed to generate streaming response')
    }
  }

  private async *createStreamGenerator(stream: any): AsyncGenerator<string, void, unknown> {
    for await (const chunk of stream) {
      const chunkText = chunk.text()
      if (chunkText) {
        yield chunkText
      }
    }
  }

  async analyzeIntent(message: string): Promise<{
    intent: string
    confidence: number
    entities: Array<{ type: string; value: string }>
  }> {
    try {
      const prompt = `
Analise a seguinte mensagem e identifique:
1. A intenção principal (intent)
2. O nível de confiança (0-1)
3. Entidades mencionadas (nome, produto, data, etc.)

Mensagem: "${message}"

Responda no formato JSON:
{
  "intent": "nome_da_intencao",
  "confidence": 0.85,
  "entities": [
    {"type": "produto", "value": "nome_produto"},
    {"type": "data", "value": "2024-01-15"}
  ]
}
`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      try {
        return JSON.parse(text)
      } catch (parseError) {
        console.error('Failed to parse intent analysis:', parseError)
        return {
          intent: 'unknown',
          confidence: 0.5,
          entities: []
        }
      }
    } catch (error) {
      console.error('Intent analysis error:', error)
      return {
        intent: 'unknown',
        confidence: 0.5,
        entities: []
      }
    }
  }

  async summarizeConversation(messages: ChatMessage[]): Promise<string> {
    try {
      const conversation = messages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n')

      const prompt = `
Por favor, faça um resumo conciso da seguinte conversa:

${conversation}

Resumo:
`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text().trim()
    } catch (error) {
      console.error('Conversation summary error:', error)
      throw new Error('Failed to summarize conversation')
    }
  }

  async generateSuggestions(
    message: string,
    context: ChatMessage[] = []
  ): Promise<string[]> {
    try {
      const conversationContext = context
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n')

      const prompt = `
Baseado na seguinte conversa e na última mensagem do usuário, sugira 3 respostas rápidas relevantes:

${conversationContext}

Última mensagem: "${message}"

Gere 3 sugestões de resposta curtas e relevantes (máximo 10 palavras cada):
1.
2.
3.
`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Extrair sugestões numeradas
      const suggestions = response
        .split('\n')
        .filter((line: string) => line.match(/^\d+\./))
        .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
        .filter((suggestion: string) => suggestion.length > 0)

      return suggestions.slice(0, 3)
    } catch (error) {
      console.error('Suggestions generation error:', error)
      return []
    }
  }
}

export default GeminiChatbot 