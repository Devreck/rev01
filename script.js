// script.js - Versão com Supabase
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';

// Configuração do Supabase
let supabase;
let GEMINI_API_KEY = null;

// Elementos do DOM
const gameContainer = document.getElementById('game-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const gameOutput = document.getElementById('game-output');
const loadingIndicator = document.getElementById('loading');

// Estado do jogo
let gameState = {
    isLoading: false,
    conversationHistory: [],
    apiKeyLoaded: false
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        // Inicializar Supabase
        if (typeof CONFIG !== 'undefined') {
            supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
            
            // Carregar API key do Supabase
            await loadApiKey();
        } else {
            throw new Error('Configuração não encontrada. Verifique o arquivo config.js');
        }
        
        setupEventListeners();
        
        if (gameState.apiKeyLoaded) {
            displayMessage('🎮 Bem-vindo ao jogo! Digite sua ação para começar.', 'system');
            userInput.focus();
        }
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        displayMessage(`❌ Erro de configuração: ${error.message}`, 'error');
    }
}

async function loadApiKey() {
    try {
        displayMessage('🔑 Carregando configurações...', 'system');
        
        const { data, error } = await supabase
            .from('app_config')
            .select('key_value')
            .eq('key_name', 'gemini_api_key')
            .single();
        
        if (error) {
            throw new Error(`Erro ao carregar API key: ${error.message}`);
        }
        
        if (data && data.key_value) {
            GEMINI_API_KEY = data.key_value;
            gameState.apiKeyLoaded = true;
            displayMessage('✅ Configurações carregadas com sucesso!', 'system');
        } else {
            throw new Error('API key não encontrada no banco de dados');
        }
        
    } catch (error) {
        console.error('Erro ao carregar API key:', error);
        
        // Fallback para desenvolvimento local
        if (typeof CONFIG !== 'undefined' && CONFIG.GEMINI_API_KEY_LOCAL) {
            GEMINI_API_KEY = CONFIG.GEMINI_API_KEY_LOCAL;
            gameState.apiKeyLoaded = true;
            displayMessage('⚠️ Usando API key local para desenvolvimento', 'system');
        } else {
            displayMessage(`❌ ${error.message}`, 'error');
        }
    }
}

function setupEventListeners() {
    sendButton.addEventListener('click', handleUserInput);
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserInput();
        }
    });
    
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });
}

async function handleUserInput() {
    if (!gameState.apiKeyLoaded) {
        displayMessage('❌ API key não carregada. Recarregue a página.', 'error');
        return;
    }
    
    const userMessage = userInput.value.trim();
    
    if (!userMessage) return;
    if (gameState.isLoading) return;
    
    displayMessage(`👤 Você: ${userMessage}`, 'user');
    
    userInput.value = '';
    userInput.style.height = 'auto';
    
    gameState.conversationHistory.push({
        role: 'user',
        content: userMessage
    });
    
    await sendToGemini(userMessage);
}

async function sendToGemini(message) {
    try {
        setLoading(true);
        
        const gamePrompt = `Você é um mestre de jogo (Game Master) criativo e envolvente. 
        Crie uma aventura interativa baseada na ação do jogador: "${message}"
        
        Regras:
        - Seja criativo e descritivo
        - Mantenha a narrativa envolvente
        - Ofereça opções claras para o jogador
        - Use emojis para tornar mais visual
        - Mantenha respostas entre 100-200 palavras
        
        Responda como um GM experiente criando uma cena emocionante.`;
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: gamePrompt
                }]
            }],
            generationConfig: {
                temperature: 0.8,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 300,
            }
        };
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            displayMessage(`🎲 GM: ${aiResponse}`, 'ai');
            
            gameState.conversationHistory.push({
                role: 'assistant',
                content: aiResponse
            });
        } else {
            throw new Error('Resposta inválida da API');
        }
        
    } catch (error) {
        console.error('Erro ao comunicar com Gemini:', error);
        displayMessage(`❌ Erro: ${error.message}. Tente novamente.`, 'error');
    } finally {
        setLoading(false);
    }
}

function displayMessage(message, type) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.innerHTML = message;
    
    gameOutput.appendChild(messageElement);
    gameOutput.scrollTop = gameOutput.scrollHeight;
    
    messageElement.style.opacity = '0';
    messageElement.style.transform = 'translateY(20px)';
    
    requestAnimationFrame(() => {
        messageElement.style.transition = 'all 0.3s ease';
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateY(0)';
    });
}

function setLoading(isLoading) {
    gameState.isLoading = isLoading;
    
    if (isLoading) {
        loadingIndicator.style.display = 'block';
        sendButton.disabled = true;
        sendButton.textContent = 'Enviando...';
        userInput.disabled = true;
    } else {
        loadingIndicator.style.display = 'none';
        sendButton.disabled = false;
        sendButton.textContent = 'Enviar';
        userInput.disabled = false;
        userInput.focus();
    }
}

function clearChat() {
    gameOutput.innerHTML = '';
    gameState.conversationHistory = [];
    displayMessage('🎮 Chat limpo! Digite sua ação para começar uma nova aventura.', 'system');
}

// Adicionar botão de limpar chat
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const clearButton = document.createElement('button');
        clearButton.textContent = '🗑️ Limpar Chat';
        clearButton.className = 'clear-button';
        clearButton.onclick = clearChat;
        
        const inputContainer = document.querySelector('.input-container');
        if (inputContainer) {
            inputContainer.appendChild(clearButton);
        }
    }, 1000);
});