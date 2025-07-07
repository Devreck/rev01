// Configuração da aplicação
const CONFIG = {
    SUPABASE_URL: 'https://bsajzksjhpositpoflpr.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzYWp6a3NqaHBvc2l0cG9mbHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2OTU3OTMsImV4cCI6MjA2NzI3MTc5M30.RqfY989TR6Qkud7HZo8wE-gzXh6TCCfvyaJ3YFsglhI',
    SUPABASE_FUNCTION_URL: 'https://bsajzksjhpositpoflpr.supabase.co/functions/v1/gemini-proxy',
    USE_MOCK_MODE: false, // ✅ SEMPRE USAR IA REAL
    YOUTUBE_API_KEY: 'AIzaSyDaYSc2WoxCZ5RFgSSpvZwE7NuLIbdNo3c' // ✅ NOVA API KEY
    REQUIRE_LOGIN: true, // Definir como true para exigir login
    ALLOW_GUEST_MODE: true // Permitir modo visitante
};

// Verificar se CONFIG foi carregado corretamente
if (typeof CONFIG === 'undefined') {
    console.error('Configuração não encontrada. Verifique o arquivo config.js');
}