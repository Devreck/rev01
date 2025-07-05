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
    // Pega a chave da API guardada de forma segura no Supabase
    const apiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!apiKey) {
      throw new Error("Chave da API do Google não encontrada.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    // Pega o corpo da requisição enviada pelo seu script.js
    const requestBody = await req.json();

    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      throw new Error(`Erro na API do Google: ${errorText}`);
    }

    const data = await geminiResponse.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})