import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    console.log('🔍 [FIX] Iniciando upload CSV para chatbot:', chatbotId)

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

    // Processar o corpo da requisição para extrair dados CSV
    const chunks: Buffer[] = []
    
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })
    
    req.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks)
        const boundary = req.headers['content-type']?.split('boundary=')[1]
        
        if (!boundary) {
          return res.status(400).json({ message: 'Boundary não encontrado' })
        }

        // Extrair dados CSV do multipart
        const bodyStr = buffer.toString('utf8')
        const parts = bodyStr.split(`--${boundary}`)
        
        let csvContent = ''
        for (const part of parts) {
          if (part.includes('filename=') && part.includes('.csv')) {
            const contentStart = part.indexOf('\r\n\r\n') + 4
            const contentEnd = part.lastIndexOf('\r\n')
            csvContent = part.substring(contentStart, contentEnd)
            break
          }
        }

        if (!csvContent) {
          return res.status(400).json({ message: 'Conteúdo CSV não encontrado' })
        }

        console.log('✅ CSV extraído. Tamanho:', csvContent.length)
        console.log('🔍 Primeiros 200 caracteres:', csvContent.substring(0, 200))

        // Processar CSV manualmente
        const lines = csvContent.split('\n').filter(line => line.trim())
        if (lines.length < 2) {
          return res.status(400).json({ message: 'CSV deve ter pelo menos 2 linhas (cabeçalho + dados)' })
        }

        const headers = lines[0].split(';').map(h => h.trim().replace(/"/g, ''))
        console.log('🔍 Headers encontrados:', headers)

        // Verificar se é o novo formato
        const hasNewFormat = headers.includes('idconhecimento') && 
                             headers.includes('titulo') && 
                             headers.includes('conteudo') && 
                             headers.includes('tags')

        if (!hasNewFormat) {
          return res.status(400).json({ 
            message: 'Formato não reconhecido. Esperado: idpasta;pasta;idconhecimento;titulo;tipodocumento;conteudosemformatacao;conteudo;tags',
            foundHeaders: headers
          })
        }

        console.log('✅ Formato novo detectado')

        // Processar dados
        const knowledgeBaseEntries = []
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue

          const values = line.split(';')
          const row: any = {}
          
          headers.forEach((header, index) => {
            row[header] = values[index]?.replace(/"/g, '') || ''
          })

          console.log(`🔍 Processando linha ${i}:`, row.titulo)

          const tags = row.tags ? row.tags.split(',').map((tag: string) => tag.trim()) : []
          
          const entry = {
            title: row.titulo || `Documento ${i}`,
            content: row.conteudosemformatacao || row.conteudo || '',
            type: 'DOCUMENT' as const,
            source: 'upload-fix.csv',
            metadata: {
              rowIndex: i - 1,
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

          knowledgeBaseEntries.push(entry)
        }

        console.log('✅ Entradas processadas:', knowledgeBaseEntries.length)

        // Inserir na base de conhecimento
        console.log('🔍 Inserindo na base de conhecimento...')
        await prisma.knowledgeBase.createMany({
          data: knowledgeBaseEntries,
        })

        console.log('✅ Inserção concluída')
        console.log('🎉 Upload CSV concluído com sucesso!')
        
        res.status(200).json({
          message: 'CSV processado com sucesso (versão corrigida)',
          count: knowledgeBaseEntries.length,
          fileName: 'upload-fix.csv',
          format: 'novo',
        })

      } catch (error) {
        console.error('❌ Erro no processamento:', error)
        res.status(500).json({ 
          message: 'Erro ao processar CSV',
          error: error instanceof Error ? error.message : String(error)
        })
      }
    })

  } catch (error) {
    console.error('❌ Erro completo no upload CSV:', error)
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : String(error)
    })
  }
} 