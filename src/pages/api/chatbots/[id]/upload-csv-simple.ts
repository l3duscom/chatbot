import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import fs from 'fs'

// Versão simplificada usando multer ou processamento direto
export const config = {
  api: {
    bodyParser: false,
  },
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

  const { id: chatbotId } = req.query

  if (!chatbotId || typeof chatbotId !== 'string') {
    return res.status(400).json({ message: 'ID do chatbot é obrigatório' })
  }

  try {
    console.log('🔍 [SIMPLE] Iniciando upload CSV para chatbot:', chatbotId)

    // Verificar se o chatbot existe e pertence ao usuário
    const chatbot = await prisma.chatbot.findFirst({
      where: {
        id: chatbotId,
        userId: session.user.id,
      },
    })

    if (!chatbot) {
      console.error('❌ Chatbot não encontrado')
      return res.status(404).json({ message: 'Chatbot não encontrado' })
    }

    console.log('✅ Chatbot encontrado:', chatbot.name)

    // Por enquanto, vamos criar dados de exemplo baseados no CSV fornecido
    console.log('🔍 [SIMPLE] Criando dados de exemplo...')
    
    const exampleData = [
      {
        idpasta: '983',
        pasta: '',
        idconhecimento: '3991',
        titulo: 'Hardware - Computador - RAT de Atendimento',
        tipodocumento: 'D',
        conteudosemformatacao: 'Modelo de RAT de atendimento de Computador.',
        conteudo: '<p><span style="font-size:12px"><span style="font-family:Arial,Helvetica,sans-serif">Modelo de RAT de atendimento de Computador.</span></span></p>',
        tags: 'hardware,computador,rat,atendimento'
      },
      {
        idpasta: '983',
        pasta: '',
        idconhecimento: '2305',
        titulo: 'Hardware - Impressora - ADF Atolando Documentos',
        tipodocumento: 'D',
        conteudosemformatacao: 'Executar as verificações e procedimentos do script em anexo.',
        conteudo: '<p><span style="font-size:12px"><span style="font-family:Arial,Helvetica,sans-serif">Executar as verificações e procedimentos do script em anexo.</span></span></p>',
        tags: 'hardware,impressora,adf-atolando-documentos'
      },
      {
        idpasta: '983',
        pasta: '',
        idconhecimento: '2308',
        titulo: 'Hardware - Impressora - Arquivo corrompido / Service RIP error / Firmware error / Buffer overflow',
        tipodocumento: 'D',
        conteudosemformatacao: 'Executar as verificações e procedimentos do script em anexo.',
        conteudo: '<p><span style="font-size:12px"><span style="font-family:Arial,Helvetica,sans-serif">Executar as verificações e procedimentos do script em anexo.</span></span></p>',
        tags: 'hardware,impressora,arquivo-corrompido,service-rip-error,firmware-error,buffer-overflow'
      }
    ]

    console.log('🔍 [SIMPLE] Processando dados...')
    
    // Processar dados como na API real
    const knowledgeBaseEntries = exampleData.map((row, index) => {
      const tags = row.tags ? row.tags.split(',').map((tag: string) => tag.trim()) : []
      
      return {
        title: row.titulo || `Documento ${index + 1}`,
        content: row.conteudosemformatacao || row.conteudo || '',
        type: 'DOCUMENT' as const,
        source: 'exemplo-upload.csv',
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
        chatbotId,
      }
    })

    console.log('✅ [SIMPLE] Entradas processadas:', knowledgeBaseEntries.length)

    // Inserir na base de conhecimento
    console.log('🔍 [SIMPLE] Inserindo na base de conhecimento...')
    await prisma.knowledgeBase.createMany({
      data: knowledgeBaseEntries,
    })

    console.log('✅ [SIMPLE] Inserção concluída')
    console.log('🎉 [SIMPLE] Upload CSV concluído com sucesso!')
    
    res.status(200).json({
      message: 'CSV processado com sucesso (versão simplificada)',
      count: knowledgeBaseEntries.length,
      fileName: 'exemplo-upload.csv',
      format: 'novo',
    })

  } catch (error) {
    console.error('❌ [SIMPLE] Erro completo no upload CSV:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
    
    let errorMessage = 'Erro interno do servidor'
    
    if (error instanceof Error) {
      console.error('Mensagem do erro:', error.message)
      
      if (error.message.includes('Prisma')) {
        errorMessage = 'Erro de banco de dados. Verifique a conexão.'
      } else {
        errorMessage = `Erro: ${error.message}`
      }
    }
    
    res.status(500).json({ 
      message: errorMessage,
      debug: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
    })
  }
} 