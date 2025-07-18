import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const { id: chatbotId } = req.query

  if (!chatbotId || typeof chatbotId !== 'string') {
    return res.status(400).json({ message: 'ID do chatbot é obrigatório' })
  }

  try {
    // Verificar se o chatbot existe e pertence ao usuário
    const chatbot = await prisma.chatbot.findFirst({
      where: {
        id: chatbotId,
        userId: session.user.id,
      },
    })

    if (!chatbot) {
      return res.status(404).json({ message: 'Chatbot não encontrado' })
    }

    switch (req.method) {
      case 'GET':
        const knowledgeBase = await prisma.knowledgeBase.findMany({
          where: {
            chatbotId,
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

        return res.status(200).json({
          knowledgeBase,
          count: knowledgeBase.length,
        })

      case 'DELETE':
        // Deletar toda a base de conhecimento do chatbot
        await prisma.knowledgeBase.deleteMany({
          where: {
            chatbotId,
          },
        })

        return res.status(200).json({
          message: 'Base de conhecimento removida com sucesso',
        })

      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Error managing knowledge base:', error)
    return res.status(500).json({ message: 'Erro interno do servidor' })
  }
} 