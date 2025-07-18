import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req })

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    const { chatbotId } = req.query

    if (!chatbotId) {
      return res.status(400).json({ message: 'Chatbot ID is required' })
    }

    try {
      // Verificar se o usuário tem acesso ao chatbot
      const chatbot = await prisma.chatbot.findFirst({
        where: {
          id: chatbotId as string,
          userId: session.user.id,
        },
      })

      if (!chatbot) {
        return res.status(404).json({ message: 'Chatbot not found' })
      }

      // Buscar itens da base de conhecimento
      const knowledgeItems = await prisma.knowledgeBase.findMany({
        where: {
          chatbotId: chatbotId as string,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      res.status(200).json({ items: knowledgeItems })
    } catch (error) {
      console.error('Knowledge base fetch error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    const { chatbotId, title, content, type, source, metadata } = req.body

    if (!chatbotId || !title || !content || !type) {
      return res.status(400).json({ message: 'Missing required fields' })
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

      // Criar novo item da base de conhecimento
      const knowledgeItem = await prisma.knowledgeBase.create({
        data: {
          title,
          content,
          type,
          source,
          metadata: metadata || {},
          chatbotId,
        },
      })

      res.status(201).json({ item: knowledgeItem })
    } catch (error) {
      console.error('Knowledge base creation error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
} 