import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    console.log('🔍 Testando debug CSV...')
    
    // Testar conexão com banco de dados
    console.log('🔍 Testando conexão com banco de dados...')
    const testConnection = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Conexão com banco OK:', testConnection)

    // Testar se temos chatbots
    console.log('🔍 Verificando chatbots existentes...')
    const chatbots = await prisma.chatbot.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        userId: true,
      }
    })
    console.log('✅ Chatbots encontrados:', chatbots.length)
    console.log('📋 Primeiros chatbots:', chatbots)

    // Testar inserção na knowledge base
    console.log('🔍 Testando inserção na knowledge base...')
    
    if (chatbots.length > 0) {
      const testChatbotId = chatbots[0].id
      console.log('🔍 Usando chatbot para teste:', testChatbotId)

      // Criar entrada de teste
      const testEntry = {
        title: 'Teste Debug - ' + Date.now(),
        content: 'Conteúdo de teste para debug',
        type: 'DOCUMENT' as const,
        source: 'debug-test.csv',
        metadata: {
          debug: true,
          testTime: new Date().toISOString(),
          tags: ['debug', 'teste'],
        },
        chatbotId: testChatbotId,
      }

      console.log('🔍 Inserindo entrada de teste:', testEntry)
      
      const insertedEntry = await prisma.knowledgeBase.create({
        data: testEntry
      })

      console.log('✅ Entrada inserida com sucesso:', insertedEntry.id)

      // Verificar se foi inserida corretamente
      const verifyEntry = await prisma.knowledgeBase.findUnique({
        where: { id: insertedEntry.id }
      })

      console.log('✅ Verificação da entrada:', verifyEntry ? 'OK' : 'FALHOU')

      // Limpar entrada de teste
      await prisma.knowledgeBase.delete({
        where: { id: insertedEntry.id }
      })

      console.log('✅ Entrada de teste removida')
    }

    // Testar processamento de dados CSV
    console.log('🔍 Testando processamento de dados CSV...')
    
    const testCSVData = [
      {
        idpasta: '983',
        pasta: '',
        idconhecimento: '3991',
        titulo: 'Hardware - Computador - RAT de Atendimento',
        tipodocumento: 'D',
        conteudosemformatacao: 'Modelo de RAT de atendimento de Computador.',
        conteudo: '<p>Modelo de RAT de atendimento de Computador.</p>',
        tags: 'hardware,computador,rat,atendimento'
      }
    ]

    console.log('🔍 Dados CSV de teste:', testCSVData)

    // Processar dados como na API real
    const processedEntries = testCSVData.map((row, index) => {
      const tags = row.tags ? row.tags.split(',').map(tag => tag.trim()) : []
      
      return {
        title: row.titulo || `Documento ${index + 1}`,
        content: row.conteudosemformatacao || row.conteudo || '',
        type: 'DOCUMENT' as const,
        source: 'debug-test.csv',
        metadata: {
          rowIndex: index,
          idpasta: row.idpasta,
          pasta: row.pasta,
          idconhecimento: row.idconhecimento,
          tipodocumento: row.tipodocumento,
          conteudoFormatado: row.conteudo,
          tags: tags,
          uploadedAt: new Date().toISOString(),
        },
        chatbotId: chatbots.length > 0 ? chatbots[0].id : 'test-id',
      }
    })

    console.log('✅ Dados processados:', processedEntries)

    // Testar inserção em lote se tivermos chatbots
    if (chatbots.length > 0) {
      console.log('🔍 Testando inserção em lote...')
      
      const insertedEntries = await prisma.knowledgeBase.createMany({
        data: processedEntries,
      })

      console.log('✅ Inserção em lote concluída:', insertedEntries.count)

      // Verificar entradas inseridas
      const verifyEntries = await prisma.knowledgeBase.findMany({
        where: {
          chatbotId: chatbots[0].id,
          source: 'debug-test.csv'
        }
      })

      console.log('✅ Entradas verificadas:', verifyEntries.length)

      // Limpar entradas de teste
      await prisma.knowledgeBase.deleteMany({
        where: {
          chatbotId: chatbots[0].id,
          source: 'debug-test.csv'
        }
      })

      console.log('✅ Entradas de teste removidas')
    }

    console.log('🎉 Todos os testes passaram!')

    res.status(200).json({
      message: 'Debug concluído com sucesso',
      results: {
        databaseConnection: 'OK',
        chatbotsFound: chatbots.length,
        csvProcessing: 'OK',
        batchInsert: chatbots.length > 0 ? 'OK' : 'SKIPPED - No chatbots',
      }
    })

  } catch (error) {
    console.error('❌ Erro no debug:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
    
    res.status(500).json({
      message: 'Erro no debug',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
} 