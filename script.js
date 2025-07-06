// ===================================================================================
// ARQUIVO DE CONFIGURAÇÃO E BANCO DE DADOS DA MISSÃO
// ===================================================================================

import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';

// Configuração do Supabase
let supabase;
let GEMINI_API_KEY = null;

// Estado do jogo
let gameState = {
    currentSlideId: '1',
    score: 0,
    progress: {
        c1: { b3: false, b4: false, b5: false, b6: false },
        c2: { b9: false, b10: false, b11: false },
        c3: { b13: false }
    },
    isLoading: false,
    apiKeyLoaded: false
};

// Dados da questão dinâmica atualmente exibida
let currentQuestionData = null;

// Elementos do DOM
const DOM = {
    slideContent: document.getElementById('slide-content'),
    imageContainer: document.getElementById('slide-image-container'),
    textContainer: document.getElementById('slide-text-container'),
    choicesContainer: document.getElementById('slide-choices-container'),
    geminiOutputContainer: document.getElementById('gemini-output-container'),
    resetBtn: document.getElementById('reset-btn'),
    scoreDisplay: document.getElementById('score-display'),
    enemModal: document.getElementById('enem-modal'),
    enemConfirmBtn: document.getElementById('enem-confirm-btn'),
    enemCancelBtn: document.getElementById('enem-cancel-btn'),
    videoModal: document.getElementById('video-modal'),
    videoGrid: document.getElementById('video-grid'),
    videoCloseBtn: document.getElementById('video-close-btn'),
    loadingIndicator: document.getElementById('loading') || createLoadingIndicator()
};

/**
 * @description Contém toda a estrutura narrativa e de desafios da missão.
 * Cada chave é um ID de slide único.
 */
const storyData = {
    '1': {
        title: "S.O.S. Estação Aurora",
        image: "https://placehold.co/800x400/0c0a1e/4169E1?text=Alerta+Vermelho+na+Ponte",
        text: `O som estridente do alarme corta o silêncio da Estação Espacial Aurora. Luzes vermelhas pulsam nos corredores metálicos. Na ponte de comando, a I.A. Central projeta um aviso holográfico:<br><br><strong>"ALERTA. FALHA CASCATA DETECTADA. SISTEMAS DE SUPORTE À VIDA EM NÍVEL CRÍTICO. TEMPERATURA INTERNA INSTÁVEL."</strong><br><br>Como o(a) mais novo(a) Cadete de Engenharia a bordo, todos os olhares se voltam para você. A Comandante Eva Rostova aponta para o painel principal.<br>— Cadete, os sistemas de controle térmico entraram em colapso. Precisamos de você. Estabilize a temperatura antes que seja tarde demais. Sua missão começa agora.`,
        choices: [{ text: "Assumir o controle e iniciar diagnóstico", nextSlide: 'c1_hub' }]
    },
    'c1_hub': {
        isHub: true,
        chapter: 1,
        title: "Cap. 1 – O Coração Gelado",
        image: "https://placehold.co/800x400/1a1a2e/87CEEB?text=Controle+de+Suporte+à+Vida",
        text: "A falha no sistema de suporte à vida parece ter múltiplas causas. Você precisa diagnosticar e reparar cada subsistema para restaurar a estabilidade. Escolha um bloco de diagnóstico para começar.",
        blocks: [
            { id: 'b3', name: 'Protocolo de Calibração (Termometria)', startSlide: 'c1_b3_s1' },
            { id: 'b4', name: 'Contenção de Fuga Térmica (Calorimetria)', startSlide: 'c1_b4_s1' },
            { id: 'b5', name: 'Integridade Estrutural (Condução)', startSlide: 'c1_b5_s1' },
            { id: 'b6', name: 'Controle Ambiental (Radiação & Convecção)', startSlide: 'c1_b6_s1' }
        ],
        nextChapterSlide: 'c2_hub'
    },
    // ... resto dos dados do storyData (mantém igual)
};

// ===================================================================================
// INICIALIZAÇÃO
// ===================================================================================

window.onload = () => {
    initializeApp();
};

async function initializeApp() {
    try {
        displayMessage('🔑 Inicializando sistemas da Estação Aurora...', 'system');
        
        // Inicializar Supabase
        if (typeof CONFIG !== 'undefined') {
            supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
            await loadApiKey();
        } else {
            throw new Error('Configuração não encontrada. Verifique o arquivo config.js');
        }
        
        setupEventListeners();
        
        if (gameState.apiKeyLoaded) {
            displayMessage('✅ Sistemas online! Missão iniciada.', 'system');
            renderSlide(gameState.currentSlideId);
        }
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        displayMessage(`❌ Erro de configuração: ${error.message}`, 'error');
    }
}

async function loadApiKey() {
    try {
        displayMessage('🔄 Estabelecendo conexão com I.A. Central...', 'system');
        
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
            displayMessage('✅ Conexão com I.A. Central estabelecida!', 'system');
        } else {
            throw new Error('API key não encontrada no banco de dados');
        }
        
    } catch (error) {
        console.error('Erro ao carregar API key:', error);
        
        // Fallback para desenvolvimento local
        if (typeof CONFIG !== 'undefined' && CONFIG.GEMINI_API_KEY_LOCAL) {
            GEMINI_API_KEY = CONFIG.GEMINI_API_KEY_LOCAL;
            gameState.apiKeyLoaded = true;
            displayMessage('⚠️ Usando conexão local de emergência', 'system');
        } else {
            displayMessage(`❌ ${error.message}`, 'error');
        }
    }
}

function createLoadingIndicator() {
    const loading = document.createElement('div');
    loading.id = 'loading';
    loading.className = 'text-center py-4 text-cyan-300';
    loading.innerHTML = '🎲 Processando...';
    loading.style.display = 'none';
    return loading;
}

function displayMessage(message, type) {
    // Criar um container temporário para mensagens do sistema
    const messageContainer = document.getElementById('system-messages') || createSystemMessageContainer();
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type} mb-2 p-3 rounded-lg`;
    messageElement.innerHTML = message;
    
    // Aplicar estilos baseados no tipo
    switch(type) {
        case 'system':
            messageElement.classList.add('bg-blue-900/50', 'border-l-4', 'border-blue-400', 'text-blue-200');
            break;
        case 'error':
            messageElement.classList.add('bg-red-900/50', 'border-l-4', 'border-red-400', 'text-red-200');
            break;
        case 'success':
            messageElement.classList.add('bg-green-900/50', 'border-l-4', 'border-green-400', 'text-green-200');
            break;
    }
    
    messageContainer.appendChild(messageElement);
    
    // Auto-remover mensagens após 5 segundos
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.remove();
        }
    }, 5000);
}

function createSystemMessageContainer() {
    const container = document.createElement('div');
    container.id = 'system-messages';
    container.className = 'fixed top-4 right-4 z-50 max-w-md space-y-2';
    document.body.appendChild(container);
    return container;
}

// ===================================================================================
// EVENT LISTENERS
// ===================================================================================

function setupEventListeners() {
    DOM.resetBtn.onclick = () => {
        resetGame();
    };
    
    DOM.enemConfirmBtn.onclick = () => {
        DOM.enemModal.classList.add('hidden');
        displayMessage("🎯 Protocolo E.N.E.M. ativado! (Funcionalidade em desenvolvimento)", 'system');
    };
    
    DOM.enemCancelBtn.onclick = () => {
        DOM.enemModal.classList.add('hidden');
    };
    
    DOM.videoCloseBtn.onclick = () => {
        DOM.videoModal.classList.add('hidden');
    };
}

function resetGame() {
    gameState = {
        currentSlideId: '1',
        score: 0,
        progress: {
            c1: { b3: false, b4: false, b5: false, b6: false },
            c2: { b9: false, b10: false, b11: false },
            c3: { b13: false }
        },
        isLoading: false,
        apiKeyLoaded: gameState.apiKeyLoaded // Manter o status da API
    };
    
    DOM.geminiOutputContainer.innerHTML = '';
    displayMessage('🔄 Sistemas reiniciados. Missão recomeçada.', 'system');
    renderSlide('1');
}

// ===================================================================================
// GEMINI API INTEGRATION
// ===================================================================================

async function callGeminiApi(prompt, button) {
    if (!gameState.apiKeyLoaded) {
        displayMessage('❌ I.A. Central não está disponível. Verifique a conexão.', 'error');
        return;
    }
    
    DOM.geminiOutputContainer.innerHTML = '';
    const originalButtonText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<div class="flex items-center justify-center"><div class="loader"></div><span class="ml-2">Consultando I.A. Central...</span></div>';

    try {
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.8,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 500,
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

        const result = await response.json();
        
        let text = "Interferência detectada na comunicação com a I.A. Central. Tente novamente.";
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            text = result.candidates[0].content.parts[0].text;
        }
        
        DOM.geminiOutputContainer.innerHTML = `<div class="gemini-response bg-purple-900/30 border border-purple-500/50 rounded-lg p-4 mt-4">${text.replace(/\n/g, '<br>')}</div>`;
        
        // Renderizar MathJax se disponível
        if (window.MathJax) { 
            MathJax.typeset([DOM.geminiOutputContainer]); 
        }

    } catch (error) {
        console.error("Erro na chamada da API Gemini:", error);
        DOM.geminiOutputContainer.innerHTML = `<div class="gemini-response bg-red-900/30 border border-red-500/50 rounded-lg p-4 mt-4 text-red-200">❌ Falha crítica na conexão com a I.A. Central: ${error.message}</div>`;
    } finally {
        button.disabled = false;
        button.innerHTML = originalButtonText;
    }
}

async function generateDynamicQuestion(slide, difficulty = 'standard') {
    if (!gameState.apiKeyLoaded) {
        displayMessage('❌ I.A. Central indisponível para gerar diagnósticos.', 'error');
        return createFallbackSlide(slide);
    }
    
    const promptTypes = [];
    if (slide.geminiCalcPrompt) promptTypes.push(slide.geminiCalcPrompt);
    if (slide.geminiConceptPrompt) promptTypes.push(slide.geminiConceptPrompt);

    if (promptTypes.length === 0) {
        console.error("Nenhum prompt de questão encontrado para este slide:", slide);
        return createFallbackSlide(slide);
    }

    const basePrompt = promptTypes[Math.floor(Math.random() * promptTypes.length)];
    
    let difficultyInstruction = '';
    switch (difficulty) {
        case 'easier':
            difficultyInstruction = ' Gere uma variação NOVA e MAIS FÁCIL desta questão. Simplifique o contexto e use números inteiros ou fáceis de calcular.';
            break;
        case 'harder':
            difficultyInstruction = ' Gere uma variação NOVA e MAIS DIFÍCIL desta questão. Adicione complexidade extra no raciocínio.';
            break;
        default:
            difficultyInstruction = ' Crie uma questão desafiadora que se encaixe perfeitamente neste cenário.';
            break;
    }

    const jsonFormatExample = `{
        "question": "O enunciado da sua questão vem aqui.",
        "answers": [
            {"text": "Alternativa incorreta 1.", "correct": false},
            {"text": "Alternativa CORRETA.", "correct": true},
            {"text": "Alternativa incorreta 2.", "correct": false},
            {"text": "Alternativa incorreta 3.", "correct": false},
            {"text": "Alternativa incorreta 4.", "correct": false}
        ],
        "correctFeedback": "Feedback para resposta correta.",
        "incorrectFeedback": "Feedback para respostas incorretas."
    }`;

    const finalPrompt = basePrompt + " " + difficultyInstruction + ` **IMPORTANTE: Responda APENAS com um objeto JSON válido no formato: ${jsonFormatExample}**`;

    try {
        const requestBody = {
            contents: [{
                parts: [{
                    text: finalPrompt
                }]
            }],
            generationConfig: {
                temperature: 0.8,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 800,
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
            throw new Error(`Erro na API: ${response.status}`);
        }
        
        const result = await response.json();
        let jsonString = result.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!jsonString) {
            throw new Error('Resposta vazia da API');
        }

        jsonString = extractJsonPayload(jsonString);
        const parsedData = JSON.parse(jsonString);
        
        if (!parsedData.answers || !parsedData.answers.some(a => typeof a.correct === 'boolean')) {
            throw new Error("Formato de questão inválido");
        }

        shuffleArray(parsedData.answers);
        return { ...slide, ...parsedData };
        
    } catch (error) {
        console.error("Falha ao gerar questão dinâmica:", error);
        return createFallbackSlide(slide);
    }
}

function createFallbackSlide(slide) {
    const fallbackSlide = { ...slide };
    fallbackSlide.question = "⚠️ Erro na geração de diagnóstico da I.A. Central.";
    fallbackSlide.answers = [];
    fallbackSlide.text += "<br><div class='feedback feedback-incorrect'>A I.A. não conseguiu gerar um diagnóstico válido. Conexão instável detectada.</div>";
    fallbackSlide.choices = [{ text: "🔄 Reiniciar Sistemas", nextSlide: '1' }];
    delete fallbackSlide.nextChoices;
    return fallbackSlide;
}

// ===================================================================================
// UTILITY FUNCTIONS
// ===================================================================================

function updateScore(points) {
    gameState.score += points;
    if (DOM.scoreDisplay) {
        DOM.scoreDisplay.textContent = `PONTUAÇÃO: ${gameState.score}`;
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function extractJsonPayload(text) {
    if (!text) return '';
    
    // Tenta encontrar um bloco de código JSON
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced) {
        return fenced[1];
    }
    
    // Procura pelo primeiro '{' e último '}'
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) {
        return text.slice(first, last + 1);
    }
    
    return text;
}

function createButton(text, onClick, className, disabled = false, tooltip = '') {
    const button = document.createElement('button');
    button.className = `action-button w-full text-left font-bold py-3 px-5 rounded-md transition-all duration-200 ${className}`;
    button.innerHTML = text;
    button.onclick = onClick;
    button.title = tooltip;
    button.disabled = disabled;
    
    if (disabled) {
        button.classList.add('opacity-50', 'cursor-not-allowed');
    }
    
    return button;
}

// ===================================================================================
// RENDER FUNCTIONS
// ===================================================================================

async function renderSlide(slideId, difficulty = 'standard') {
    let slide = storyData[slideId];
    if (!slide) {
        displayMessage('❌ Slide não encontrado. Retornando ao início.', 'error');
        renderSlide('1');
        return;
    }
    
    gameState.currentSlideId = slideId;
    updateScore(0);
    DOM.geminiOutputContainer.innerHTML = '';
    
    if (DOM.slideContent) {
        DOM.slideContent.classList.remove('visible');
    }

    setTimeout(async () => {
        // Renderizar imagem
        if (slide.image && DOM.imageContainer) {
            DOM.imageContainer.innerHTML = `<img src="${slide.image}" alt="${slide.title}" class="w-full h-auto max-h-80 object-cover rounded-lg shadow-lg border-2 border-black/20">`;
        } else if (DOM.imageContainer) {
            DOM.imageContainer.innerHTML = '';
        }
        
        // Renderizar texto
        if (DOM.textContainer) {
            const textContainer = document.createElement('div');
            textContainer.innerHTML = `<h2 class="text-3xl md:text-4xl font-bold text-cyan-300 mb-4 font-orbitron">${slide.title}</h2><div class="text-gray-300 text-base md:text-lg leading-relaxed">${slide.text}</div>`;
            DOM.textContainer.innerHTML = '';
            DOM.textContainer.appendChild(textContainer);
        }
        
        if (DOM.choicesContainer) {
            DOM.choicesContainer.innerHTML = '';
        }

        // Renderizar baseado no tipo de slide
        if (slide.isHub) {
            renderHub(slide);
        } else if (slide.isDiagnosis) {
            await renderDiagnosis(slide, difficulty);
        }
        
        // Renderizar escolhas padrão
        if (slide.choices && DOM.choicesContainer) {
            slide.choices.forEach(choice => {
                const button = createButton(
                    choice.text, 
                    () => renderSlide(choice.nextSlide), 
                    'justify-center bg-indigo-700 hover:bg-indigo-600 text-gray-100 border-indigo-900', 
                    false, 
                    'Avançar na história'
                );
                DOM.choicesContainer.appendChild(button);
            });
        }
        
        // Renderizar MathJax se disponível
        if (window.MathJax && DOM.textContainer && DOM.choicesContainer) {
            MathJax.typesetPromise([DOM.textContainer, DOM.choicesContainer]);
        }

        if (DOM.slideContent) {
            DOM.slideContent.classList.add('visible');
        }

    }, 500);
}

// ... resto das funções renderHub, renderDiagnosis, handleAnswer, etc.
// (mantém a mesma lógica, apenas com as melhorias de integração)

// ===================================================================================
// MODAL FUNCTIONS
// ===================================================================================

let returnSlideId = null;

function showEnemConfirmation(slideId) {
    returnSlideId = slideId;
    if (DOM.enemModal) {
        DOM.enemModal.classList.remove('hidden');
    }
}

async function showVideoModal(slide) {
    if (!DOM.videoModal || !DOM.videoGrid) return;
    
    const topic = slide.diaryPrompt ? slide.diaryPrompt.split(".")[0] : "Física";
    DOM.videoGrid.innerHTML = '<div class="flex justify-center items-center"><div class="loader"></div><span class="ml-2">Buscando vídeos de treinamento...</span></div>';
    DOM.videoModal.classList.remove('hidden');

    // Simulação da busca de vídeos
    setTimeout(() => {
        DOM.videoGrid.innerHTML = `
            <div>
                <h4 class="font-orbitron text-xl text-cyan-300 mb-2">Indicação Superior</h4>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <a href="#" class="block bg-gray-800/50 p-2 rounded-lg hover:bg-gray-700/70" title="Assistir vídeo sobre ${topic}">
                        <img src="https://placehold.co/160x90/1a1a2e/4169E1?text=Vídeo+1" class="w-full rounded-md mb-2">
                        <p class="text-sm">Conceito de ${topic}</p>
                    </a>
                    <a href="#" class="block bg-gray-800/50 p-2 rounded-lg hover:bg-gray-700/70" title="Assistir exercício resolvido">
                        <img src="https://placehold.co/160x90/1a1a2e/4169E1?text=Vídeo+2" class="w-full rounded-md mb-2">
                        <p class="text-sm">Exercício Resolvido</p>
                    </a>
                    <a href="#" class="block bg-gray-800/50 p-2 rounded-lg hover:bg-gray-700/70" title="Assistir aplicação prática">
                        <img src="https://placehold.co/160x90/1a1a2e/4169E1?text=Vídeo+3" class="w-full rounded-md mb-2">
                        <p class="text-sm">Aplicação Prática</p>
                    </a>
                </div>
            </div>
        `;
    }, 1500);
}
// Função para renderizar o hub de seleção
function renderHub(slide) {
    slide.innerHTML = `
        <div class="hub-container">
            <h2>Escolha uma Área</h2>
            <div class="hub-options">
                <button class="hub-option" onclick="startQuiz('cardiologia')">
                    <i class="fas fa-heartbeat"></i>
                    <span>Cardiologia</span>
                </button>
                <button class="hub-option" onclick="startQuiz('neurologia')">
                    <i class="fas fa-brain"></i>
                    <span>Neurologia</span>
                </button>
                <button class="hub-option" onclick="startQuiz('pneumologia')">
                    <i class="fas fa-lungs"></i>
                    <span>Pneumologia</span>
                </button>
                <button class="hub-option" onclick="startQuiz('gastroenterologia')">
                    <i class="fas fa-stomach"></i>
                    <span>Gastroenterologia</span>
                </button>
            </div>
        </div>
    `;
}

// Função para iniciar o quiz de uma área específica
function startQuiz(area) {
    currentArea = area;
    currentSlide = 0;
    score = 0;
    generateQuestions(area);
}
