import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: 'Not authenticated' })
  }

  if (req.method === 'GET') {
    // Listar chatbots do usuário
    try {
      const chatbots = await prisma.chatbot.findMany({
        where: { userId: session.user.id },
        include: {
          _count: {
            select: {
              conversations: true,
              knowledgeBase: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      res.status(200).json({ chatbots })
    } catch (error) {
      console.error('Error fetching chatbots:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    // Criar novo chatbot
    const {
      name,
      description,
      prompt,
      welcomeMessage,
      fallbackMessage,
      settings,
      avatar,
    } = req.body

    if (!name || !prompt) {
      return res.status(400).json({ message: 'Name and prompt are required' })
    }

    try {
      const chatbot = await prisma.chatbot.create({
        data: {
          name,
          description,
          prompt,
          welcomeMessage: welcomeMessage || 'Olá! Como posso ajudá-lo hoje?',
          fallbackMessage: fallbackMessage || 'Desculpe, não entendi. Pode reformular sua pergunta?',
          settings: settings || {
            temperature: 0.7,
            maxTokens: 1000,
            responseTime: 'fast',
            language: 'pt-BR',
          },
          avatar,
          userId: session.user.id,
        },
        include: {
          _count: {
            select: {
              conversations: true,
              knowledgeBase: true,
            },
          },
        },
      })

      res.status(201).json({ chatbot })
    } catch (error) {
      console.error('Error creating chatbot:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
} 