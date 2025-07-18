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

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid chatbot ID' })
  }

  if (req.method === 'GET') {
    // Buscar chatbot específico
    try {
      const chatbot = await prisma.chatbot.findFirst({
        where: {
          id,
          userId: session.user.id,
        },
        include: {
          knowledgeBase: {
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              conversations: true,
              knowledgeBase: true,
            },
          },
        },
      })

      if (!chatbot) {
        return res.status(404).json({ message: 'Chatbot not found' })
      }

      res.status(200).json({ chatbot })
    } catch (error) {
      console.error('Error fetching chatbot:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'PUT') {
    // Atualizar chatbot
    const {
      name,
      description,
      prompt,
      welcomeMessage,
      fallbackMessage,
      settings,
      avatar,
      isActive,
    } = req.body

    try {
      // Verificar se o chatbot pertence ao usuário
      const existingChatbot = await prisma.chatbot.findFirst({
        where: {
          id,
          userId: session.user.id,
        },
      })

      if (!existingChatbot) {
        return res.status(404).json({ message: 'Chatbot not found' })
      }

      const updatedChatbot = await prisma.chatbot.update({
        where: { id },
        data: {
          name: name || existingChatbot.name,
          description: description !== undefined ? description : existingChatbot.description,
          prompt: prompt || existingChatbot.prompt,
          welcomeMessage: welcomeMessage || existingChatbot.welcomeMessage,
          fallbackMessage: fallbackMessage || existingChatbot.fallbackMessage,
          settings: settings || existingChatbot.settings,
          avatar: avatar !== undefined ? avatar : existingChatbot.avatar,
          isActive: isActive !== undefined ? isActive : existingChatbot.isActive,
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

      res.status(200).json({ chatbot: updatedChatbot })
    } catch (error) {
      console.error('Error updating chatbot:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'DELETE') {
    // Deletar chatbot
    try {
      // Verificar se o chatbot pertence ao usuário
      const existingChatbot = await prisma.chatbot.findFirst({
        where: {
          id,
          userId: session.user.id,
        },
      })

      if (!existingChatbot) {
        return res.status(404).json({ message: 'Chatbot not found' })
      }

      // Deletar chatbot (cascade vai deletar conversas, mensagens, etc.)
      await prisma.chatbot.delete({
        where: { id },
      })

      res.status(200).json({ message: 'Chatbot deleted successfully' })
    } catch (error) {
      console.error('Error deleting chatbot:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
} 