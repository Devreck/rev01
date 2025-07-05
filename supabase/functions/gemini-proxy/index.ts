// supabase/functions/gemini-proxy/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!apiKey) {
      throw new Error("Chave da API do Google não foi encontrada no servidor.");
    }
    
    // Usando o modelo mais recente e estável
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    // Pega o corpo da requisição que veio do script.js
    const originalPayload = await req.json();

    // *** A CORREÇÃO FINAL ESTÁ AQUI ***
    // Adicionamos a configuração para forçar a saída em JSON.
    const modifiedPayload = {
      ...originalPayload,
      generationConfig: {
        response_mime_type: "application/json",
      }
    };

    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(modifiedPayload), // Enviamos o payload modificado
    });

    const responseText = await geminiResponse.text();

    if (!geminiResponse.ok) {
      // Se houver um erro, o responseText terá a mensagem detalhada do Google.
      throw new Error(`Erro na API do Google: ${responseText}`);
    }

    // Se tudo correu bem, a resposta já é um JSON garantido.
    // O seu script.js já sabe como processá-la.
    return new Response(responseText, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // Captura qualquer erro no processo e o envia de volta para o console do navegador.
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})