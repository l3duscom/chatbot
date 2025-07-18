import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const { query, chatbotId, limit = 10, threshold = 0.3 } = req.body

  if (!query || !chatbotId) {
    return res.status(400).json({ message: 'Query and chatbotId are required' })
  }

  try {
    // Verificar se o usuário tem acesso ao chatbot
    const chatbot = await prisma.chatbot.findFirst({
      where: {
        id: chatbotId,
        userId: session.user.id,
      },
    })

    if (!chatbot) {
      return res.status(404).json({ message: 'Chatbot not found' })
    }

    // Buscar todos os itens da base de conhecimento do chatbot
    const knowledgeItems = await prisma.knowledgeBase.findMany({
      where: {
        chatbotId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Implementar busca inteligente
    const searchResults: SearchResult[] = []
    const queryLower = query.toLowerCase()
    const queryWords = queryLower.split(' ').filter((word: string) => word.length > 2)

    for (const item of knowledgeItems) {
      const relevanceScore = calculateRelevanceScore(
        queryLower,
        queryWords,
        item,
        threshold
      )

      if (relevanceScore > threshold) {
        const tags = (item.metadata as any)?.tags || []
        
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

    // Ordenar por relevância
    searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore)

    // Limitar resultados
    const limitedResults = searchResults.slice(0, limit)

    res.status(200).json({
      results: limitedResults,
      total: limitedResults.length,
      query,
      chatbotId,
    })
  } catch (error) {
    console.error('Knowledge base search error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Função para calcular relevância
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
  const tags = (item.metadata as any)?.tags || []

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

// Função para destacar termos relevantes
function highlightRelevantTerms(text: string, query: string): string {
  const queryWords = query.toLowerCase().split(' ').filter((word: string) => word.length > 2)
  let highlightedText = text

  for (const word of queryWords) {
    const regex = new RegExp(`(${word})`, 'gi')
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>')
  }

  return highlightedText
}

// Função para extrair contexto relevante
function extractRelevantContext(content: string, query: string, maxLength: number = 200): string {
  const queryWords = query.toLowerCase().split(' ').filter((word: string) => word.length > 2)
  const contentLower = content.toLowerCase()
  
  // Encontrar a primeira ocorrência de qualquer palavra-chave
  let firstMatch = -1
  for (const word of queryWords) {
    const index = contentLower.indexOf(word)
    if (index !== -1 && (firstMatch === -1 || index < firstMatch)) {
      firstMatch = index
    }
  }

  if (firstMatch === -1) {
    return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '')
  }

  // Extrair contexto ao redor da primeira correspondência
  const start = Math.max(0, firstMatch - 50)
  const end = Math.min(content.length, firstMatch + maxLength - 50)
  
  let context = content.substring(start, end)
  
  if (start > 0) {
    context = '...' + context
  }
  if (end < content.length) {
    context = context + '...'
  }

  return context
} 