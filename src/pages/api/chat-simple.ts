import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { message } = req.body

  if (!message) {
    return res.status(400).json({ message: 'Message is required' })
  }

  try {
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Respostas pré-definidas para teste
    const responses = {
      'olá': 'Olá! Como posso ajudá-lo hoje?',
      'horário': 'Nosso horário de funcionamento é de segunda a sexta-feira das 8h às 18h.',
      'produto': 'Temos uma ampla linha de produtos. Você está procurando algo específico?',
      'pagamento': 'Aceitamos cartão de crédito, débito, PIX e boleto bancário.',
      'entrega': 'O prazo de entrega é de 3 a 5 dias úteis para sua região.',
      'default': 'Obrigado pela sua mensagem! Estou aqui para ajudar com informações sobre nossos produtos e serviços.'
    }

    // Encontrar resposta baseada na mensagem
    const lowerMessage = message.toLowerCase()
    let response = responses.default

    for (const [key, value] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        response = value
        break
      }
    }

    res.status(200).json({
      message: response,
      messageId: Date.now().toString(),
      conversationId: 'simple-chat-' + Date.now(),
    })
  } catch (error) {
    console.error('Simple chat error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
} 