import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import formidable from 'formidable'
import * as Papa from 'papaparse'

export const config = {
  api: {
    bodyParser: false,
  },
}

interface ParsedCSVRow {
  [key: string]: string
}

// Novo formato de CSV
interface KnowledgeBaseCSVRow {
  idpasta: string
  pasta: string
  idconhecimento: string
  titulo: string
  tipodocumento: string
  conteudosemformatacao: string
  conteudo: string
  tags: string
}

// Formato antigo (FAQ)
interface FAQCSVRow {
  pergunta?: string
  resposta?: string
  question?: string
  answer?: string
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
    console.log('🔍 Iniciando upload CSV para chatbot:', chatbotId)

    // Verificar se o chatbot existe e pertence ao usuário
    console.log('🔍 Verificando chatbot...')
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

    // Processar upload do arquivo
    console.log('🔍 Processando upload do arquivo...')
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      keepExtensions: true,
      filter: function (part) {
        return part.name === 'file' && (part.originalFilename?.endsWith('.csv') || false)
      },
    })

    const [fields, files] = await form.parse(req)
    const file = Array.isArray(files.file) ? files.file[0] : files.file

    if (!file) {
      console.error('❌ Nenhum arquivo CSV enviado')
      return res.status(400).json({ message: 'Nenhum arquivo CSV foi enviado' })
    }

    console.log('✅ Arquivo recebido:', file.originalFilename, 'Tamanho:', file.size)

    // Ler o arquivo CSV
    console.log('🔍 Lendo arquivo CSV...')
    const fileContent = fs.readFileSync(file.filepath, 'utf8')
    console.log('✅ Arquivo lido. Tamanho do conteúdo:', fileContent.length)
    console.log('🔍 Primeiros 200 caracteres:', fileContent.substring(0, 200))
    
    // Processar CSV
    console.log('🔍 Processando CSV com Papa Parse...')
    const parseResult = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      delimiter: ';', // Novo formato usa ponto e vírgula
    })

    console.log('✅ CSV processado. Linhas encontradas:', parseResult.data.length)
    console.log('🔍 Erros do Papa Parse:', parseResult.errors)

    if (parseResult.errors.length > 0) {
      console.error('❌ Erros ao processar CSV:', parseResult.errors)
      return res.status(400).json({ 
        message: 'Erro ao processar CSV', 
        errors: parseResult.errors.map((e: any) => e.message) 
      })
    }

    const csvData = parseResult.data as ParsedCSVRow[]

    if (csvData.length === 0) {
      console.error('❌ CSV está vazio')
      return res.status(400).json({ message: 'O arquivo CSV está vazio' })
    }

    // Verificar formato do CSV
    const headers = Object.keys(csvData[0])
    console.log('🔍 Headers encontrados:', headers)
    
    // Verificar se é o novo formato (base de conhecimento)
    const hasNewFormat = headers.includes('idconhecimento') && 
                         headers.includes('titulo') && 
                         headers.includes('conteudo') && 
                         headers.includes('tags')
    
    // Verificar se é o formato antigo (FAQ)
    const hasOldFormat = headers.some(h => 
      h.toLowerCase().includes('pergunta') || h.toLowerCase().includes('question')
    ) && headers.some(h => 
      h.toLowerCase().includes('resposta') || h.toLowerCase().includes('answer')
    )

    console.log('🔍 Formato novo detectado:', hasNewFormat)
    console.log('🔍 Formato antigo detectado:', hasOldFormat)

    let knowledgeBaseEntries: any[] = []

    if (hasNewFormat) {
      console.log('🔍 Processando formato novo...')
      // Processar novo formato
      knowledgeBaseEntries = csvData.map((row, index) => {
        try {
          console.log(`🔍 Processando linha ${index + 1}:`, row)
          
          const tags = row.tags ? row.tags.split(',').map((tag: string) => tag.trim()) : []
          
          const entry = {
            title: row.titulo || `Documento ${index + 1}`,
            content: row.conteudosemformatacao || row.conteudo || '',
            type: 'DOCUMENT' as const,
            source: file.originalFilename || 'uploaded.csv',
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
          
          console.log(`✅ Entrada ${index + 1} processada:`, entry.title)
          return entry
        } catch (error) {
          console.error(`❌ Erro ao processar linha ${index + 1}:`, error)
          throw error
        }
      })
    } else if (hasOldFormat) {
      console.log('🔍 Processando formato antigo...')
      // Processar formato antigo (FAQ)
      let questionColumn = headers.find(h => 
        h.toLowerCase().includes('pergunta') || h.toLowerCase().includes('question')
      )
      let answerColumn = headers.find(h => 
        h.toLowerCase().includes('resposta') || h.toLowerCase().includes('answer')
      )

      if (!questionColumn || !answerColumn) {
        console.error('❌ Colunas obrigatórias não encontradas')
        return res.status(400).json({ 
          message: 'Formato antigo: O CSV deve conter colunas "pergunta" e "resposta" (ou "question" e "answer")',
          foundColumns: headers
        })
      }

      knowledgeBaseEntries = csvData.map((row, index) => ({
        title: `FAQ ${index + 1}`,
        content: `Pergunta: ${row[questionColumn!]}\nResposta: ${row[answerColumn!]}`,
        type: 'FAQ' as const,
        source: file.originalFilename || 'uploaded.csv',
        metadata: {
          rowIndex: index,
          question: row[questionColumn!],
          answer: row[answerColumn!],
          uploadedAt: new Date().toISOString(),
        },
        chatbotId,
      }))
    } else {
      console.error('❌ Formato de CSV não reconhecido')
      return res.status(400).json({ 
        message: 'Formato de CSV não reconhecido. Use um dos formatos suportados:\n' +
                 '1. Novo formato: idpasta;pasta;idconhecimento;titulo;tipodocumento;conteudosemformatacao;conteudo;tags\n' +
                 '2. Formato antigo: pergunta,resposta',
        foundColumns: headers
      })
    }

    console.log('✅ Entradas processadas:', knowledgeBaseEntries.length)
    console.log('🔍 Primeira entrada:', knowledgeBaseEntries[0])

    // Inserir na base de conhecimento
    console.log('🔍 Inserindo na base de conhecimento...')
    await prisma.knowledgeBase.createMany({
      data: knowledgeBaseEntries,
    })

    console.log('✅ Inserção concluída')

    // Limpar arquivo temporário
    console.log('🔍 Limpando arquivo temporário...')
    fs.unlinkSync(file.filepath)

    console.log('🎉 Upload CSV concluído com sucesso!')
    
    res.status(200).json({
      message: 'CSV processado com sucesso',
      count: knowledgeBaseEntries.length,
      fileName: file.originalFilename,
      format: hasNewFormat ? 'novo' : 'antigo',
    })

  } catch (error) {
    console.error('❌ Erro completo no upload CSV:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
    
    // Tentar fornecer informações mais específicas sobre o erro
    let errorMessage = 'Erro interno do servidor'
    
    if (error instanceof Error) {
      console.error('Mensagem do erro:', error.message)
      
      // Identificar tipos específicos de erro
      if (error.message.includes('Prisma')) {
        errorMessage = 'Erro de banco de dados. Verifique a conexão.'
      } else if (error.message.includes('parse') || error.message.includes('Parse')) {
        errorMessage = 'Erro ao processar CSV. Verifique o formato do arquivo.'
      } else if (error.message.includes('encoding') || error.message.includes('charset')) {
        errorMessage = 'Erro de codificação. Salve o CSV em UTF-8.'
      } else if (error.message.includes('size') || error.message.includes('large')) {
        errorMessage = 'Arquivo muito grande. Limite de 5MB.'
      } else if (error.message.includes('not a function')) {
        errorMessage = 'Erro de dependência. Verifique se formidable está instalado corretamente.'
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