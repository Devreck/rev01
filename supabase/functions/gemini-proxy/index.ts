// supabase/functions/gemini-proxy/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

console.log("Função gemini-proxy iniciada!"); // Log to know the new version is active

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`Received request: ${req.method}`);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!apiKey) {
      console.error("[CRITICAL ERROR] Secret 'GOOGLE_API_KEY' not found in Supabase environment.");
      throw new Error("Google API Key not found on server.");
    }

    const requestBody = await req.json();
    console.log("==> Request Body Received from Game:", JSON.stringify(requestBody, null, 2));

    // THE FIX IS HERE: Changed "gemini-pro" to "gemini-1.0-pro"
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${apiKey}`;

    console.log("--> Calling Google API URL:", apiUrl); // Log to confirm the new URL

    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const responseText = await geminiResponse.text();
    console.log("<== Raw Response Received from Google Gemini:", responseText);

    if (!geminiResponse.ok) {
      console.error("Google Gemini API returned a status error.", `Status: ${geminiResponse.status}`);
      throw new Error(`Error from Google API: ${responseText}`);
    }
    
    // If successful, send the Google response back to the game
    return new Response(responseText, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("[ERROR INSIDE TRY...CATCH]", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})