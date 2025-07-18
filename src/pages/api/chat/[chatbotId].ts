import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { GeminiChatbot } from '@/lib/gemini'

interface SearchResult {
  id: string
  title: string
  content: string
  type: string
  source: string
  tags: string[]
  relevanceScore: number
  metadata: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { chatbotId } = req.query
  const { message, sessionId, userId } = req.body

  if (!chatbotId || !message || !sessionId) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  try {
    // Buscar o chatbot
    const chatbot = await prisma.chatbot.findUnique({
      where: { id: chatbotId as string },
      include: {
        knowledgeBase: true,
        user: {
          select: {
            id: true,
            plan: true,
          },
        },
      },
    })

    if (!chatbot) {
      return res.status(404).json({ message: 'Chatbot not found' })
    }

    if (!chatbot.isActive) {
      return res.status(400).json({ message: 'Chatbot is not active' })
    }

    // Buscar ou criar conversa
    let conversation = await prisma.conversation.findFirst({
      where: {
        chatbotId: chatbotId as string,
        sessionId,
        status: 'ACTIVE',
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          chatbotId: chatbotId as string,
          sessionId,
          userId,
          status: 'ACTIVE',
        },
        include: {
          messages: true,
        },
      })
    }

    // Salvar mensagem do usuário
    await prisma.message.create({
      data: {
        content: message,
        role: 'USER',
        conversationId: conversation.id,
      },
    })

    // Preparar contexto da conversa
    const context = conversation.messages
      .reverse()
      .map((msg: any) => ({
        role: msg.role.toLowerCase() as 'user' | 'assistant' | 'system',
        content: msg.content,
        timestamp: msg.createdAt,
      }))

    // Buscar informações relevantes na base de conhecimento
    const relevantKnowledge = await searchRelevantKnowledge(
      message,
      chatbot.knowledgeBase,
      5 // Limite de 5 itens mais relevantes
    )

    // Preparar base de conhecimento formatada
    const knowledgeContext = relevantKnowledge.map(item => {
      const tags = item.tags.length > 0 ? ` [Tags: ${item.tags.join(', ')}]` : ''
      return `**${item.title}**${tags}\n${item.content}`
    })

    // Configurar Gemini
    const geminiChatbot = new GeminiChatbot({
      systemPrompt: chatbot.prompt,
      temperature: (chatbot.settings as any)?.temperature || 0.7,
      maxTokens: (chatbot.settings as any)?.maxTokens || 1000,
    })

    // Gerar resposta
    const response = await geminiChatbot.generateResponse(
      message,
      context,
      knowledgeContext
    )

    // Salvar resposta do bot
    const botMessage = await prisma.message.create({
      data: {
        content: response,
        role: 'ASSISTANT',
        conversationId: conversation.id,
      },
    })

    // Registrar analytics
    await prisma.analytics.create({
      data: {
        chatbotId: chatbotId as string,
        eventType: 'message_exchange',
        eventData: {
          messageLength: message.length,
          responseLength: response.length,
          hasKnowledgeBase: knowledgeContext.length > 0,
          knowledgeItemsUsed: relevantKnowledge.length,
          relevantKnowledgeIds: relevantKnowledge.map(k => k.id),
        },
        userId,
        sessionId,
      },
    })

    res.status(200).json({
      message: response,
      messageId: botMessage.id,
      conversationId: conversation.id,
      knowledgeUsed: relevantKnowledge.length,
    })
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Função para buscar conhecimento relevante
async function searchRelevantKnowledge(
  query: string,
  knowledgeBase: any[],
  limit: number = 5
): Promise<SearchResult[]> {
  const searchResults: SearchResult[] = []
  const queryLower = query.toLowerCase()
  const queryWords = queryLower.split(' ').filter((word: string) => word.length > 2)

  for (const item of knowledgeBase) {
    const relevanceScore = calculateRelevanceScore(
      queryLower,
      queryWords,
      item,
      0.1 // Threshold mais baixo para incluir mais conteúdo
    )

    if (relevanceScore > 0.1) {
      const tags = item.metadata?.tags || []
      
      searchResults.push({
        id: item.id,
        title: item.title,
        content: item.content,
        type: item.type,
        source: item.source || 'unknown',
        tags: Array.isArray(tags) ? tags : [],
        relevanceScore,
        metadata: item.metadata,
      })
    }
  }

  // Ordenar por relevância e limitar
  return searchResults
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit)
}

// Função para calcular relevância (mesma lógica da API de busca)
function calculateRelevanceScore(
  queryLower: string,
  queryWords: string[],
  item: any,
  threshold: number
): number {
  let score = 0
  const maxScore = 100

  const titleLower = item.title.toLowerCase()
  const contentLower = item.content.toLowerCase()
  const tags = item.metadata?.tags || []

  // Pontuação por correspondência exata no título (peso 40)
  if (titleLower.includes(queryLower)) {
    score += 40
  }

  // Pontuação por correspondência exata no conteúdo (peso 20)
  if (contentLower.includes(queryLower)) {
    score += 20
  }

  // Pontuação por palavras-chave no título (peso 30)
  let titleWordMatches = 0
  for (const word of queryWords) {
    if (titleLower.includes(word)) {
      titleWordMatches++
    }
  }
  if (queryWords.length > 0) {
    score += (titleWordMatches / queryWords.length) * 30
  }

  // Pontuação por palavras-chave no conteúdo (peso 20)
  let contentWordMatches = 0
  for (const word of queryWords) {
    if (contentLower.includes(word)) {
      contentWordMatches++
    }
  }
  if (queryWords.length > 0) {
    score += (contentWordMatches / queryWords.length) * 20
  }

  // Pontuação por tags (peso 25)
  if (Array.isArray(tags) && tags.length > 0) {
    let tagMatches = 0
    for (const tag of tags) {
      const tagLower = tag.toLowerCase()
      if (queryLower.includes(tagLower) || tagLower.includes(queryLower)) {
        tagMatches++
      }
      // Verificar palavras individuais nas tags
      for (const word of queryWords) {
        if (tagLower.includes(word)) {
          tagMatches += 0.5
        }
      }
    }
    if (tags.length > 0) {
      score += Math.min((tagMatches / tags.length) * 25, 25)
    }
  }

  // Pontuação por tipo de documento (peso 5)
  if (item.type === 'DOCUMENT') {
    score += 5
  } else if (item.type === 'FAQ') {
    score += 3
  }

  // Normalizar pontuação para 0-1
  return Math.min(score / maxScore, 1)
} 