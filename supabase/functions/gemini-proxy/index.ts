// supabase/functions/gemini-proxy/index.ts --- CÓDIGO DE TESTE SIMPLIFICADO

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("FUNÇÃO DE TESTE 'DUMMY' INICIADA. Versão: 1.0");

serve(async (req) => {
  // Responde ao pre-flight do CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Apenas para garantir que o corpo do pedido pode ser lido
    const body = await req.json();
    console.log("Corpo do pedido recebido com sucesso:", body);

    // Devolve uma resposta de sucesso FIXA, sem contactar o Google.
    const successResponse = {
      message: "Teste bem-sucedido! A função aceitou o método POST.",
      testData: true
    };

    return new Response(JSON.stringify(successResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Retorna 200 OK
    });

  } catch (error) {
    // Se houver algum erro, devolve-o
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})