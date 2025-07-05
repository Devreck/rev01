// supabase/functions/gemini-proxy/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

console.log("Função gemini-proxy iniciada!"); // Log de verificação inicial

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`Recebido pedido: ${req.method}`);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!apiKey) {
      console.error("[ERRO CRÍTICO] Segredo 'GOOGLE_API_KEY' não foi encontrado no ambiente do Supabase.");
      throw new Error("Chave da API do Google não foi encontrada no servidor.");
    }

    const requestBody = await req.json();

    console.log("==> Corpo do Pedido Recebido do Jogo:", JSON.stringify(requestBody, null, 2));

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const responseText = await geminiResponse.text();

    console.log("<== Resposta Bruta Recebida do Google Gemini:", responseText);

    if (!geminiResponse.ok) {
      console.error("A API do Google Gemini retornou um erro de status.", `Status: ${geminiResponse.status}`);
      throw new Error(`Erro na API do Google: ${responseText}`);
    }

    // A resposta do Google foi bem-sucedida, vamos enviá-la de volta para o jogo.
    return new Response(responseText, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("[ERRO DENTRO DO TRY...CATCH]", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})