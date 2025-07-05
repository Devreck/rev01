// supabase/functions/gemini-proxy/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Trata a requisição pre-flight do navegador (necessário para CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!apiKey) {
      console.error("ERRO CRÍTICO: Segredo 'GOOGLE_API_KEY' não encontrado no Supabase.");
      throw new Error("Chave da API do Google não encontrada.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const requestBody = await req.json();

    // LOG 1: Mostrar exatamente o que estamos a enviar para o Gemini
    console.log("==> ENVIANDO PARA O GEMINI:", JSON.stringify(requestBody, null, 2));

    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const responseText = await geminiResponse.text();

    // LOG 2: Mostrar a resposta bruta que o Gemini nos devolveu
    console.log("<== RESPOSTA BRUTA DO GEMINI:", responseText);

    if (!geminiResponse.ok) {
      console.error("A API do Google retornou um erro:", responseText);
      throw new Error(`Erro na API do Google: ${responseText}`);
    }

    const data = JSON.parse(responseText);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("ERRO NA FUNÇÃO PROXY:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})