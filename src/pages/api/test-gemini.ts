import { NextApiRequest, NextApiResponse } from 'next'
import { GoogleGenerativeAI } from '@google/generative-ai'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'GEMINI_API_KEY não encontrada',
        message: 'Configurar a API key do Gemini no .env.local'
      })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const result = await model.generateContent('Olá, você está funcionando?')
    const response = await result.response
    const text = response.text()

    res.status(200).json({
      success: true,
      response: text,
      apiKey: apiKey.substring(0, 10) + '...' // Mostrar apenas o início da key
    })
  } catch (error) {
    console.error('Gemini test error:', error)
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      message: 'Erro ao testar Gemini API'
    })
  }
} 