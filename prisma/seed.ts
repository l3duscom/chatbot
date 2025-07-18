import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Criar usuário administrador
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@chatbot-ia.com' },
    update: {},
    create: {
      email: 'admin@chatbot-ia.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
      plan: 'ENTERPRISE',
      emailVerified: new Date(),
    },
  })

  // Criar usuário de demonstração
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@chatbot-ia.com' },
    update: {},
    create: {
      email: 'demo@chatbot-ia.com',
      name: 'Demo User',
      password: await bcrypt.hash('demo123', 10),
      role: 'USER',
      plan: 'FREE',
      emailVerified: new Date(),
    },
  })

  // Criar chatbot de demonstração
  const demoChatbot = await prisma.chatbot.upsert({
    where: { id: 'demo-chatbot' },
    update: {},
    create: {
      id: 'demo-chatbot',
      name: 'Assistente de Vendas',
      description: 'Chatbot especializado em vendas e atendimento ao cliente',
      prompt: `Você é um assistente de vendas especializado em atendimento ao cliente. Suas principais funções são:

1. Dar boas-vindas aos clientes de forma amigável
2. Responder dúvidas sobre produtos e serviços
3. Auxiliar no processo de compra
4. Coletar informações de contato quando necessário
5. Escalar para atendimento humano quando apropriado

Mantenha um tom profissional, mas amigável. Sempre busque resolver o problema do cliente da melhor forma possível.`,
      welcomeMessage: 'Olá! Sou o assistente de vendas da empresa. Como posso ajudá-lo hoje?',
      fallbackMessage: 'Desculpe, não consegui entender sua pergunta. Pode reformular de outra forma? Ou se preferir, posso direcioná-lo para um atendente humano.',
      userId: demoUser.id,
      settings: {
        temperature: 0.7,
        maxTokens: 1000,
        responseTime: 'fast',
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo',
      },
    },
  })

  // Criar base de conhecimento de demonstração
  const knowledgeBaseItems = [
    {
      title: 'Horário de Funcionamento',
      content: 'Nosso horário de funcionamento é de segunda a sexta-feira das 8h às 18h, e aos sábados das 8h às 12h. Não funcionamos aos domingos e feriados.',
      type: 'FAQ' as const,
      chatbotId: demoChatbot.id,
    },
    {
      title: 'Política de Devolução',
      content: 'Aceitamos devoluções em até 30 dias após a compra, desde que o produto esteja em perfeito estado e na embalagem original. O cliente deve arcar com os custos de frete para devolução.',
      type: 'FAQ' as const,
      chatbotId: demoChatbot.id,
    },
    {
      title: 'Formas de Pagamento',
      content: 'Aceitamos pagamento via cartão de crédito (Visa, Mastercard, Elo), cartão de débito, PIX, boleto bancário e transferência bancária. Parcelamos em até 12x no cartão de crédito.',
      type: 'FAQ' as const,
      chatbotId: demoChatbot.id,
    },
    {
      title: 'Prazo de Entrega',
      content: 'O prazo de entrega varia conforme a região: Sul e Sudeste: 3-5 dias úteis; Nordeste: 5-7 dias úteis; Norte e Centro-Oeste: 7-10 dias úteis. Frete grátis para pedidos acima de R$ 200.',
      type: 'FAQ' as const,
      chatbotId: demoChatbot.id,
    },
    {
      title: 'Contato',
      content: 'Para falar conosco: Telefone: (11) 99999-9999; Email: contato@empresa.com; WhatsApp: (11) 99999-9999; Endereço: Rua Exemplo, 123 - São Paulo, SP',
      type: 'TEXT' as const,
      chatbotId: demoChatbot.id,
    },
  ]

  for (const item of knowledgeBaseItems) {
    await prisma.knowledgeBase.upsert({
      where: { id: `kb-${item.title.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `kb-${item.title.toLowerCase().replace(/\s+/g, '-')}`,
        ...item,
      },
    })
  }

  // Criar uma conversa de demonstração
  const demoConversation = await prisma.conversation.create({
    data: {
      title: 'Consulta sobre produtos',
      userId: demoUser.id,
      chatbotId: demoChatbot.id,
      sessionId: 'demo-session-1',
      status: 'ACTIVE',
    },
  })

  // Criar mensagens de demonstração
  const demoMessages = [
    {
      content: 'Olá! Sou o assistente de vendas da empresa. Como posso ajudá-lo hoje?',
      role: 'ASSISTANT' as const,
      conversationId: demoConversation.id,
    },
    {
      content: 'Olá! Gostaria de saber mais sobre seus produtos.',
      role: 'USER' as const,
      conversationId: demoConversation.id,
    },
    {
      content: 'Claro! Temos uma ampla linha de produtos. Você está procurando algo específico? Posso ajudá-lo com informações sobre preços, características, disponibilidade e formas de pagamento.',
      role: 'ASSISTANT' as const,
      conversationId: demoConversation.id,
    },
    {
      content: 'Qual é o prazo de entrega para São Paulo?',
      role: 'USER' as const,
      conversationId: demoConversation.id,
    },
    {
      content: 'Para São Paulo, o prazo de entrega é de 3 a 5 dias úteis. Oferecemos frete grátis para pedidos acima de R$ 200. Você gostaria de fazer um pedido?',
      role: 'ASSISTANT' as const,
      conversationId: demoConversation.id,
    },
  ]

  for (const message of demoMessages) {
    await prisma.message.create({
      data: message,
    })
  }

  // Criar dados de analytics de demonstração
  const analyticsData = [
    {
      chatbotId: demoChatbot.id,
      eventType: 'message_sent',
      eventData: { messageCount: 1, userId: demoUser.id },
      userId: demoUser.id,
      sessionId: 'demo-session-1',
    },
    {
      chatbotId: demoChatbot.id,
      eventType: 'conversation_started',
      eventData: { source: 'website' },
      userId: demoUser.id,
      sessionId: 'demo-session-1',
    },
    {
      chatbotId: demoChatbot.id,
      eventType: 'knowledge_base_query',
      eventData: { query: 'prazo de entrega', result: 'found' },
      userId: demoUser.id,
      sessionId: 'demo-session-1',
    },
  ]

  for (const analytics of analyticsData) {
    await prisma.analytics.create({
      data: analytics,
    })
  }

  console.log('Seed executado com sucesso!')
  console.log('Usuários criados:')
  console.log('- Admin: admin@chatbot-ia.com (senha: admin123)')
  console.log('- Demo: demo@chatbot-ia.com (senha: demo123)')
  console.log('- Chatbot de demonstração criado com base de conhecimento')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }) 