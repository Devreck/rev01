import { serve } from "https://deno.land/std@0.208.0/http/server.ts"

// CORS headers para permitir requisições do frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

// Interface para tipagem da requisição
interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

// Função principal do Edge Function
serve(async (req: Request): Promise<Response> => {
  console.log(`${req.method} ${req.url}`)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Apenas aceitar POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Use POST.' }),
        { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse do body da requisição
    const requestData: GeminiRequest = await req.json()
    const { contents, generationConfig } = requestData
    
    // Validar dados obrigatórios
    if (!contents || !Array.isArray(contents)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: contents array is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Pegar API key do ambiente
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not configured in environment')
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Configuração padrão para o Gemini
    const defaultConfig = {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 800,
    }

    // Preparar body para a API do Gemini
    const geminiRequestBody = {
      contents,
      generationConfig: { ...defaultConfig, ...generationConfig }
    }

    console.log('🤖 Calling Gemini API...')

    // Chamar a API do Google Gemini
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geminiRequestBody),
      }
    )

    // Verificar se a resposta da API foi bem-sucedida
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('❌ Gemini API error:', errorText)
      
      return new Response(
        JSON.stringify({ 
          error: 'Gemini API error',
          details: errorText,
          status: geminiResponse.status
        }),
        { 
          status: geminiResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse da resposta
    const data = await geminiResponse.json()
    
    console.log('✅ Gemini API response received successfully')

    // Retornar resposta para o frontend
    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error: unknown) {
    // Tratamento de erro type-safe
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('❌ Function error:', errorMessage)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})

// Log de inicialização
console.log('🚀 Gemini Proxy Function initialized')