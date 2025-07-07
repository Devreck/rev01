// ===================================================================================
// CONFIGURAÇÕES GLOBAIS
// ===================================================================================

// Verificar se CONFIG existe
if (typeof CONFIG === 'undefined') {
    console.error('Configuração não encontrada. Verifique o arquivo config.js');
    throw new Error('Configuração não encontrada. Verifique o arquivo config.js');
}

// APIs
const YOUTUBE_API_KEY = CONFIG.YOUTUBE_API_KEY;
let GEMINI_API_KEY = null;
let supabase = null;
let apiKeyLoaded = false;

// Elementos DOM
const slideContentEl = document.getElementById('slide-content');
const imageContainerEl = document.getElementById('slide-image-container');
const textContainerEl = document.getElementById('slide-text-container');
const choicesContainerEl = document.getElementById('slide-choices-container');
const geminiOutputContainerEl = document.getElementById('gemini-output-container');
const scoreDisplayEl = document.getElementById('score-display');
const resetBtn = document.getElementById('reset-btn');
const enemModalEl = document.getElementById('enem-modal');
const enemConfirmBtn = document.getElementById('enem-confirm-btn');
const enemCancelBtn = document.getElementById('enem-cancel-btn');
const videoModalEl = document.getElementById('video-modal');
const videoCloseBtn = document.getElementById('video-close-btn');
const videoGridEl = document.getElementById('video-grid');

// Estado do jogo
let currentSlideId = '1';
let currentQuestionData = null;
let score = 0;
let progress = {
    c1: { b3: false, b4: false, b5: false, b6: false },
    c2: { b9: false, b10: false, b11: false },
    c3: { b13: false }
};

// Função para criar cliente Supabase
function createClient(supabaseUrl, supabaseKey) {
    return {
        from: (table) => ({
            select: (columns) => ({
                eq: (column, value) => ({
                    single: async () => {
                        try {
                            const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${column}=eq.${value}&select=${columns}`, {
                                headers: {
                                    'apikey': supabaseKey,
                                    'Authorization': `Bearer ${supabaseKey}`,
                                    'Content-Type': 'application/json'
                                }
                            });
                            
                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
                            
                            const data = await response.json();
                            return { data: data[0] || null, error: null };
                        } catch (error) {
                            return { data: null, error };
                        }
                    }
                })
            })
        })
    };
}

// ===================================================================================
// BUSCA DE VÍDEOS DO YOUTUBE
// ===================================================================================

async function searchYouTubeVideos(query) {
    const videos = [];
    
    // Canais educacionais de física
    const educationalChannels = [
        'UCrWWMZ29MTjDCqeGBWNm_JQ', // Física Total
        'UCJ-yYJpHJlx-IlWLU7gKCzQ', // Professor Ferretto
        'UCWQalZkqNLD9JbU7eyWa9PA', // Ciência Todo Dia
        'UCyEbNSCBGasLNKOqRFYGo6A', // Fisiquei
        'UCh-3371TZ_Pcj_HRrjQgJwA'  // Me Salva!
    ];
    
    try {
        // Buscar em canais específicos primeiro
        for (const channelId of educationalChannels) {
            if (videos.length >= 6) break;
            
            const channelSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&q=${encodeURIComponent(query)}&type=video&maxResults=2&order=relevance&videoDuration=medium&key=${YOUTUBE_API_KEY}`;
            
            try {
                const response = await fetch(channelSearchUrl);
                
                if (!response.ok) {
                    console.warn(`Erro ao buscar no canal ${channelId}:`, response.status);
                    continue;
                }
                
                const data = await response.json();
                
                if (data.items) {
                    for (const video of data.items) {
                        if (videos.length >= 6) break;
                        
                        // Verificar detalhes do vídeo
                        const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${video.id.videoId}&key=${YOUTUBE_API_KEY}`;
                        
                        try {
                            const detailsResponse = await fetch(videoDetailsUrl);
                            
                            if (!detailsResponse.ok) continue;
                            
                            const detailsData = await detailsResponse.json();
                            
                            if (detailsData.items && detailsData.items.length > 0) {
                                const videoDetails = detailsData.items[0];
                                const duration = videoDetails.contentDetails.duration;
                                const stats = videoDetails.statistics;
                                
                                // Converter duração ISO 8601 para minutos
                                const durationMinutes = parseDuration(duration);
                                
                                // Filtrar: máximo 15 minutos e bem avaliado
                                if (durationMinutes <= 15 && parseInt(stats.likeCount || 0) > 10) {
                                    videos.push({
                                        title: video.snippet.title,
                                        thumbnail: video.snippet.thumbnails.medium.url,
                                        videoId: video.id.videoId,
                                        channelTitle: video.snippet.channelTitle,
                                        url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
                                        duration: formatDuration(durationMinutes),
                                        likes: stats.likeCount || 0,
                                        views: stats.viewCount || 0
                                    });
                                }
                            }
                        } catch (detailsError) {
                            console.error('Erro ao buscar detalhes do vídeo:', detailsError);
                        }
                    }
                }
            } catch (error) {
                console.error(`Erro ao buscar no canal ${channelId}:`, error);
            }
        }
        
        // Se não encontrou vídeos suficientes, fazer busca geral com filtros
        if (videos.length < 6) {
            const remainingSlots = 6 - videos.length;
            const generalSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query + ' física educação')}&type=video&maxResults=${remainingSlots * 2}&order=rating&videoDuration=medium&key=${YOUTUBE_API_KEY}`;
            
            try {
                const response = await fetch(generalSearchUrl);
                
                if (!response.ok) {
                    throw new Error(`Erro na busca geral: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.items) {
                    for (const video of data.items) {
                        if (videos.length >= 6) break;
                        
                        // Verificar se já não temos este vídeo
                        if (videos.some(v => v.videoId === video.id.videoId)) continue;
                        
                        // Verificar duração e avaliação
                        const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${video.id.videoId}&key=${YOUTUBE_API_KEY}`;
                        
                        try {
                            const detailsResponse = await fetch(videoDetailsUrl);
                            
                            if (!detailsResponse.ok) continue;
                            
                            const detailsData = await detailsResponse.json();
                            
                            if (detailsData.items && detailsData.items.length > 0) {
                                const videoDetails = detailsData.items[0];
                                const duration = videoDetails.contentDetails.duration;
                                const stats = videoDetails.statistics;
                                
                                const durationMinutes = parseDuration(duration);
                                
                                // Filtrar: máximo 15 minutos e bem avaliado
                                if (durationMinutes <= 15 && parseInt(stats.likeCount || 0) > 5) {
                                    videos.push({
                                        title: video.snippet.title,
                                        thumbnail: video.snippet.thumbnails.medium.url,
                                        videoId: video.id.videoId,
                                        channelTitle: video.snippet.channelTitle,
                                        url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
                                        duration: formatDuration(durationMinutes),
                                        likes: stats.likeCount || 0,
                                        views: stats.viewCount || 0
                                    });
                                }
                            }
                        } catch (detailsError) {
                            console.error('Erro ao buscar detalhes do vídeo:', detailsError);
                        }
                    }
                }
            } catch (error) {
                console.error('Erro na busca geral:', error);
            }
        }
        
        // Ordenar por likes (mais bem avaliados primeiro)
        videos.sort((a, b) => parseInt(b.likes) - parseInt(a.likes));
        
    } catch (error) {
        console.error('Erro na busca de vídeos:', error);
    }
    
    return videos.slice(0, 6); // Garantir máximo de 6 vídeos
}

// Função auxiliar para converter duração ISO 8601 para minutos
function parseDuration(isoDuration) {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);
    
    return hours * 60 + minutes + (seconds > 30 ? 1 : 0); // Arredondar segundos
}

// Função auxiliar para formatar duração
function formatDuration(minutes) {
    if (minutes < 60) {
        return `${minutes}min`;
    } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h${remainingMinutes > 0 ? remainingMinutes + 'min' : ''}`;
    }
}

// Função auxiliar para formatar números
function formatNumber(num) {
    const number = parseInt(num);
    if (number >= 1000000) {
        return (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
        return (number / 1000).toFixed(1) + 'K';
    }
    return number.toString();
}

// ===================================================================================
// INICIALIZAÇÃO
// ===================================================================================

window.onload = async () => {
    await initializeApp();
};

async function initializeApp() {
    try {
        showSystemMessage('🔑 Inicializando sistemas da Estação Aurora...', 'info');
        
        // Verificar se CONFIG existe
        if (typeof CONFIG !== 'undefined') {
            // Inicializar Supabase
            supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
            
            // SEMPRE tentar carregar a API key real (nunca usar mock)
            await loadApiKey();
        } else {
            throw new Error('CONFIG não encontrado');
        }
        
        setupEventListeners();
        showSystemMessage('✅ Sistemas online! Missão iniciada.', 'success');
        renderSlide(currentSlideId);
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        showSystemMessage(`❌ Erro crítico: ${error.message}`, 'error');
        // Não continuar sem API key
        return;
    }
}

async function loadApiKey() {
    try {
        showSystemMessage('🔄 Estabelecendo conexão com I.A. Central...', 'info');
        
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
            apiKeyLoaded = true;
            showSystemMessage('✅ Conexão com I.A. Central estabelecida!', 'success');
        } else {
            throw new Error('API key não encontrada no banco de dados');
        }
        
    } catch (error) {
        console.error('Erro ao carregar API key:', error);
        showSystemMessage(`❌ ${error.message}`, 'error');
        throw error; // Re-throw para parar a inicialização
    }
}

// ===================================================================================
// FUNÇÕES UTILITÁRIAS
// ===================================================================================

function showSystemMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `system-message ${type}`;
    messageEl.innerHTML = message;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.remove();
        }
    }, 5000);
}

function setupEventListeners() {
    resetBtn.onclick = () => {
        progress = {
            c1: { b3: false, b4: false, b5: false, b6: false },
            c2: { b9: false, b10: false, b11: false },
            c3: { b13: false }
        };
        score = 0;
        showSystemMessage('🔄 Sistemas reiniciados. Missão recomeçada.', 'info');
        renderSlide('1');
    };
    
    enemConfirmBtn.onclick = () => {
        enemModalEl.classList.add('hidden');
        showSystemMessage("🎯 Protocolo E.N.E.M. ativado! (Funcionalidade em desenvolvimento)", 'info');
    };
    
    enemCancelBtn.onclick = () => {
        enemModalEl.classList.add('hidden');
    };
    
    videoCloseBtn.onclick = () => {
        videoModalEl.classList.add('hidden');
    };
}

function updateScore(points) {
    score += points;
    scoreDisplayEl.textContent = `PONTUAÇÃO: ${score}`;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function createButton(text, onClick, className, disabled = false) {
    const button = document.createElement('button');
    button.className = `action-button w-full text-left font-bold py-3 px-5 rounded-md ${className}`;
    button.innerHTML = text;
    button.onclick = onClick;
    button.disabled = disabled;
    if(disabled) {
        button.classList.add('opacity-50', 'cursor-not-allowed');
    }
    return button;
}

// ===================================================================================
// GEMINI API - SOMENTE QUESTÕES REAIS
// ===================================================================================

async function callGeminiApi(prompt, button) {
    if (!apiKeyLoaded) {
        showSystemMessage('❌ I.A. Central não está disponível. Reinicie o sistema.', 'error');
        return;
    }
    
    geminiOutputContainerEl.innerHTML = '';
    const originalButtonText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<div class="flex items-center justify-center"><div class="loader"></div><span>Processando...</span></div>';

    try {
        // Usar API direta do Gemini
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

        const result = await response.json();
        
        let text = "Ocorreu uma interferência na comunicação com a I.A. Tente novamente.";
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            text = result.candidates[0].content.parts[0].text;
        }
        
        geminiOutputContainerEl.innerHTML = `<div class="gemini-response">${text.replace(/\n/g, '<br>')}</div>`;
        if (window.MathJax) { MathJax.typeset([geminiOutputContainerEl]); }

    } catch (error) {
        console.error("Gemini API call failed:", error);
        geminiOutputContainerEl.innerHTML = `<div class="gemini-response text-red-400">Falha crítica na conexão com a I.A. Central: ${error.message}</div>`;
    } finally {
         button.disabled = false;
         button.innerHTML = originalButtonText;
    }
}

async function generateDynamicQuestion(slide, difficulty = 'standard') {
    if (!apiKeyLoaded) {
        showSystemMessage('❌ I.A. Central indisponível. Não é possível gerar questões.', 'error');
        throw new Error('API key não carregada');
    }

    const promptTypes = [];
    if (slide.geminiCalcPrompt) promptTypes.push(slide.geminiCalcPrompt);
    if (slide.geminiConceptPrompt) promptTypes.push(slide.geminiConceptPrompt);

    if (promptTypes.length === 0) {
        console.error("No AI question prompts found for this slide:", slide);
        throw new Error('Nenhum prompt de questão encontrado');
    }

    const basePrompt = promptTypes[Math.floor(Math.random() * promptTypes.length)];
    
    let difficultyInstruction = '';
    switch (difficulty) {
        case 'easier':
            difficultyInstruction = ' Gere uma variação NOVA e MAIS FÁCIL desta questão. Simplifique o contexto e use números inteiros ou fáceis de calcular.';
            break;
        case 'harder':
            difficultyInstruction = ' Gere uma variação NOVA e MAIS DIFÍCIL desta questão. Adicione um passo extra no raciocínio.';
            break;
        default:
            difficultyInstruction = ' Crie uma questão desafiadora que se encaixe perfeitamente neste cenário.';
            break;
    }

    const finalPrompt = basePrompt + " " + difficultyInstruction;

    try {
        // Usar API direta do Gemini
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            question: { type: "STRING" }, 
                            answers: {
                                type: "ARRAY",
                                items: {
                                    type: "OBJECT",
                                    properties: {
                                        text: { type: "STRING" },
                                        correct: { type: "BOOLEAN" }
                                    },
                                    required: ["text", "correct"]
                                }
                            },
                            correctFeedback: { type: "STRING" },
                            incorrectFeedback: { type: "STRING" }
                        },
                        required: ["question", "answers", "correctFeedback", "incorrectFeedback"]
                    }
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`API response not OK: ${response.status}`);
        }
        
        const result = await response.json();
        const jsonString = result.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!jsonString) {
            throw new Error('No text in API response');
        }

        const parsedData = JSON.parse(jsonString);
        
        if (!parsedData.answers || !parsedData.answers.some(a => typeof a.correct === 'boolean')) {
            throw new Error("Invalid question format from API");
        }

        shuffleArray(parsedData.answers);
        return { ...slide, ...parsedData };
        
    } catch (error) {
        console.error("Failed to generate dynamic question:", error);
        throw error; // Re-throw para que o erro seja tratado no renderSlide
    }
}

// ===================================================================================
// RENDER FUNCTIONS
// ===================================================================================

async function renderSlide(slideId, difficulty = 'standard') {
    let slide = storyData[slideId];
    if (!slide) {
        showSystemMessage('❌ Slide não encontrado. Retornando ao início.', 'error');
        renderSlide('1');
        return;
    }
    
    currentSlideId = slideId;
    updateScore(0);
    geminiOutputContainerEl.innerHTML = '';
    slideContentEl.classList.remove('visible');

    setTimeout(async () => {
        // Renderizar imagem
        if (slide.image) {
            imageContainerEl.innerHTML = `<img src="${slide.image}" alt="${slide.title}" class="w-full h-auto max-h-80 object-cover rounded-lg shadow-lg border-2 border-black/20">`;
        } else {
            imageContainerEl.innerHTML = '';
        }
        
        // Renderizar texto
        const textContainer = document.createElement('div');
        textContainer.innerHTML = `<h2 class="text-3xl md:text-4xl font-bold text-cyan-300 mb-4 font-orbitron">${slide.title}</h2><div class="text-gray-300 text-base md:text-lg leading-relaxed">${slide.text}</div>`;
        textContainerEl.innerHTML = '';
        textContainerEl.appendChild(textContainer);
        choicesContainerEl.innerHTML = '';

        // Lógica para HUBs
        if (slide.isHub) {
            const chapterProgress = progress[`c${slide.chapter}`];
            let allBlocksComplete = true;

            slide.blocks.forEach(block => {
                const isComplete = chapterProgress[block.id];
                const buttonText = isComplete ? `${block.name} <span class="text-green-400 ml-2">✓</span>` : block.name;
                const button = createButton(buttonText, () => renderSlide(block.startSlide), 'bg-blue-800 hover:bg-blue-700 text-gray-100 border-blue-900', isComplete);
                choicesContainerEl.appendChild(button);
                if (!isComplete) {
                    allBlocksComplete = false;
                }
            });

            if (allBlocksComplete && slide.nextChapterSlide) {
                 const advanceButton = createButton(`Avançar para o ${storyData[slide.nextChapterSlide].title}`, () => renderSlide(slide.nextChapterSlide), 'bg-green-600 hover:bg-green-500 text-white border-green-800 mt-6');
                 choicesContainerEl.appendChild(advanceButton);
            }
        }
        // Lógica para slides de diagnóstico - SEMPRE USAR IA
        else if (slide.isDiagnosis) {
            choicesContainerEl.innerHTML = '<div class="text-cyan-300 flex items-center w-full justify-center py-4"><div class="loader"></div>Gerando diagnóstico...</div>';
            
            try {
                const dynamicSlide = await generateDynamicQuestion(slide, difficulty);
                currentQuestionData = dynamicSlide;
                choicesContainerEl.innerHTML = '';

                if (dynamicSlide.answers && dynamicSlide.answers.length > 0) {
                    
                    const questionContainer = document.createElement('div');
                    questionContainer.className = 'mt-6';

                    if (dynamicSlide.question) {
                        questionContainer.innerHTML = `<p class='font-bold text-cyan-200 text-lg'>${dynamicSlide.question}</p>`;
                    }
                    
                    textContainer.appendChild(questionContainer);

                    const answerButtonsContainer = document.createElement('div');
                    answerButtonsContainer.className = 'mt-6 space-y-3';
                    dynamicSlide.answers.forEach((answer, index) => {
                        const letter = String.fromCharCode(65 + index);
                        const buttonText = `<span class="font-bold mr-3">${letter})</span> ${answer.text}`;
                        const button = createButton(buttonText, () => handleAnswer(answer, dynamicSlide), 'bg-blue-800 hover:bg-blue-700 text-gray-100 border-blue-900');
                        answerButtonsContainer.appendChild(button);
                    });
                    choicesContainerEl.appendChild(answerButtonsContainer);
                    
                    const helpButtonsContainer = document.createElement('div');
                    helpButtonsContainer.className = "w-full grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 border-t border-gray-700 pt-4";
                    
                    const commanderPrompt = `Você é a Comandante Eva Rostova, orientando o cadete. Para o problema atual, descreva a estratégia de resolução de forma direta e eficiente. Apresente as etapas lógicas e as fórmulas necessárias em sua forma geral, **sem substituir os valores numéricos**. **Toda fórmula deve estar em modo de exibição ($$fórmula$$) e centralizada. Variáveis individuais no texto devem usar o modo inline ($símbolo$).** O objetivo é guiar o raciocínio, não dar a resposta. Questão: "${dynamicSlide.question}"`;
                    const commanderButton = createButton('Verificar com o comandante', (e) => callGeminiApi(commanderPrompt, e.currentTarget), 'gemini-button justify-center bg-teal-600 hover:bg-teal-500 text-white border-teal-800');
                    
                    if (dynamicSlide.diaryPrompt) {
                        const diaryPrompt = `Você é a I.A. da Estação Aurora. Crie uma entrada para o diário de bordo do cadete. **Formato estrito:** Comece com um cabeçalho futurista (ex: "Registro de Bordo: Data Estelar 74136.2, Ano 3125") e prossiga com um texto narrativo e explicativo. **NÃO use markdown, especialmente asteriscos para listas.** Para destacar termos, use a tag HTML <strong>.</strong> Explique os conceitos físicos de forma detalhada. **Apenas equações completas devem ser centralizadas em modo de exibição ($$fórmula$$). Variáveis e símbolos individuais devem usar o modo inline ($símbolo$).** Tópico: ${dynamicSlide.diaryPrompt}`;
                        const diaryButton = createButton('Consultar o diário de bordo', (e) => callGeminiApi(diaryPrompt, e.currentTarget), 'gemini-button justify-center bg-pink-600 hover:bg-pink-500 text-white border-pink-800');
                        helpButtonsContainer.appendChild(diaryButton);
                    }
                    
                    helpButtonsContainer.appendChild(commanderButton);

                    const enemButton = createButton('Aplicar protocolo E.N.E.M', () => showEnemConfirmation(slideId), 'gemini-button justify-center bg-yellow-500 hover:bg-yellow-400 text-black border-yellow-700');
                    const videoButton = createButton('Banco de Imagens Primitivas', () => showVideoModal(slide), 'gemini-button justify-center bg-red-600 hover:bg-red-500 text-white border-red-800');
                    
                    choicesContainerEl.appendChild(helpButtonsContainer);
                    
                    const extraHelpContainer = document.createElement('div');
                    extraHelpContainer.className = "w-full grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2";
                    extraHelpContainer.appendChild(enemButton);
                    extraHelpContainer.appendChild(videoButton);
                    choicesContainerEl.appendChild(extraHelpContainer);
                } else {
                    throw new Error('Questão gerada sem alternativas válidas');
                }
            } catch (error) {
                console.error('Erro ao gerar questão:', error);
                choicesContainerEl.innerHTML = `
                    <div class="text-center py-8">
                        <p class="text-red-400 mb-4">❌ Falha crítica na geração de diagnóstico</p>
                        <p class="text-gray-400 mb-4">A I.A. Central não conseguiu gerar uma questão válida.</p>
                        <button onclick="renderSlide('${slideId}')" class="action-button bg-blue-800 hover:bg-blue-700 text-gray-100 border-blue-900">
                            🔄 Tentar Novamente
                        </button>
                    </div>
                `;
            }
        } 
        
        // Renderizar escolhas padrão
        if (slide.choices) {
            slide.choices.forEach(choice => {
                const button = createButton(choice.text, () => renderSlide(choice.nextSlide), 'justify-center bg-indigo-700 hover:bg-indigo-600 text-gray-100 font-bold py-3 px-5 rounded-md border-indigo-900');
                choicesContainerEl.appendChild(button);
            });
        }
        
        if (window.MathJax && window.MathJax.typeset) {
        window.MathJax.typeset([textContainerEl, choicesContainerEl]);
}   

        slideContentEl.classList.add('visible');

    }, 500);
}

function handleAnswer(answer, slide) {
    if (typeof answer.correct !== 'boolean') {
        console.error("Answer object is malformed:", answer);
        return; 
    }

    choicesContainerEl.innerHTML = '';
    geminiOutputContainerEl.innerHTML = '';
    
    const feedbackContainer = document.createElement('div');
    const feedbackEl = document.createElement('div');
    const feedbackActions = document.createElement('div');
    feedbackActions.className = 'mt-4 flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4';

    let feedbackClass = '';

    if (answer.correct) {
        updateScore(10);
        feedbackEl.innerHTML = `<strong class='font-orbitron text-green-300'>SISTEMA CORRIGIDO:</strong> ${slide.correctFeedback}`;
        feedbackClass = 'feedback-correct';
        
        if (slide.nextSlideInBlock) {
            const nextButton = createButton('Próximo Diagnóstico', () => renderSlide(slide.nextSlideInBlock), 'justify-center bg-green-600 hover:bg-green-500 text-white border-green-800 mt-4');
            choicesContainerEl.appendChild(nextButton);
        } else if (slide.isDiagnosis) {
            progress[`c${slide.chapter}`][slide.block] = true;
            const backToHubButton = createButton('Retornar ao Painel de Diagnóstico', () => renderSlide(slide.nextHub), 'justify-center bg-indigo-700 hover:bg-indigo-600 text-gray-100 font-bold py-3 px-5 rounded-md border-indigo-900 mt-4');
            choicesContainerEl.appendChild(backToHubButton);
        }

    } else {
        updateScore(-5);
        feedbackEl.innerHTML = `<strong class='font-orbitron text-red-300'>FALHA NA CALIBRAÇÃO:</strong> ${slide.incorrectFeedback}`;
        feedbackClass = 'feedback-incorrect';

        const easierBtn = createButton('Tentar com simulação mais fácil', () => renderSlide(currentSlideId, 'easier'), 'justify-center bg-red-600 hover:bg-red-500 text-white border-red-800');
        const commanderPrompt = `Você é a Comandante Eva Rostova, orientando o cadete. Para o problema atual, descreva a estratégia de resolução de forma direta e eficiente. Apresente as etapas lógicas e as fórmulas necessárias em sua forma geral, **sem substituir os valores numéricos**. **Toda fórmula deve estar em modo de exibição ($$fórmula$$) e centralizada. Variáveis individuais no texto devem usar o modo inline ($símbolo$).** O objetivo é guiar o raciocínio, não dar a resposta. Questão: "${slide.question}"`;
        const commanderButton = createButton('Verificar com o comandante', (e) => callGeminiApi(commanderPrompt, e.currentTarget), 'gemini-button justify-center bg-teal-600 hover:bg-teal-500 text-white border-teal-800');
        feedbackActions.append(easierBtn, commanderButton);
    }
    
    feedbackEl.className = `feedback ${feedbackClass}`;
    feedbackContainer.appendChild(feedbackEl);
    feedbackContainer.appendChild(feedbackActions);
    
    const oldFeedback = textContainerEl.querySelector('.feedback')?.parentElement;
    if(oldFeedback) oldFeedback.remove();
    
    textContainerEl.appendChild(feedbackContainer);
    
    if (window.MathJax) {
        MathJax.typesetPromise([feedbackContainer]);
    }
}

// ===================================================================================
// MODAL FUNCTIONS
// ===================================================================================

let returnSlideId = null;

function showEnemConfirmation(slideId) {
    returnSlideId = slideId;
    enemModalEl.classList.remove('hidden');
}

async function showVideoModal(slide) {
    // Determinar o tópico de busca baseado no slide
    let searchTopic = 'física';
    
    if (slide.diaryPrompt) {
        if (slide.diaryPrompt.includes('termométrica') || slide.diaryPrompt.includes('temperatura')) {
            searchTopic = 'termometria escalas temperatura celsius fahrenheit';
        } else if (slide.diaryPrompt.includes('calor específico') || slide.diaryPrompt.includes('calorimetria')) {
            searchTopic = 'calorimetria calor específico capacidade térmica';
        } else if (slide.diaryPrompt.includes('condução') || slide.diaryPrompt.includes('Fourier')) {
            searchTopic = 'condução térmica lei fourier transferência calor';
        } else if (slide.diaryPrompt.includes('radiação') || slide.diaryPrompt.includes('Stefan-Boltzmann')) {
            searchTopic = 'radiação térmica stefan boltzmann corpo negro';
        } else if (slide.diaryPrompt.includes('convecção')) {
            searchTopic = 'convecção térmica transferência calor fluidos';
        } else if (slide.diaryPrompt.includes('onda') || slide.diaryPrompt.includes('frequência')) {
            searchTopic = 'ondas física frequência comprimento onda';
        } else if (slide.diaryPrompt.includes('refração') || slide.diaryPrompt.includes('Snell')) {
            searchTopic = 'refração lei snell óptica índice refração';
        }
    }
    
    videoGridEl.innerHTML = '<div class="flex justify-center items-center py-8"><div class="loader"></div><span class="ml-3">Buscando vídeos de treinamento...</span></div>';
    videoModalEl.classList.remove('hidden');

    try {
        const videos = await searchYouTubeVideos(searchTopic);
        
        if (videos.length === 0) {
            videoGridEl.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-400">Nenhum vídeo encontrado para este tópico.</p>
                    <p class="text-sm text-gray-500 mt-2">Tente verificar sua conexão com a internet.</p>
                </div>
            `;
            return;
        }
        
        // Dividir vídeos em duas seções
        const firstHalf = videos.slice(0, 3);
        const secondHalf = videos.slice(3, 6);
        
        videoGridEl.innerHTML = `
            <div class="mb-6">
                <h4 class="font-orbitron text-xl text-cyan-300 mb-4">Indicação Superior</h4>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    ${firstHalf.map(video => `
                        <a href="${video.url}"  class="block bg-gray-800/50 p-3 rounded-lg hover:bg-gray-700/70 transition-colors">
                            <div class="relative">
                                <img src="${video.thumbnail}" alt="${video.title}" class="w-full rounded-md mb-2 aspect-video object-cover">
                                <div class="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                                    ${video.duration}
                                </div>
                            </div>
                            <p class="text-sm font-medium text-gray-200 line-clamp-2 mb-1">${video.title}</p>
                            <p class="text-xs text-gray-400 mb-1">${video.channelTitle}</p>
                            <div class="flex items-center text-xs text-gray-500">
                                <span class="mr-2">👍 ${formatNumber(video.likes)}</span>
                                <span>👁️ ${formatNumber(video.views)}</span>
                            </div>
                        </a>
                    `).join('')}
                            </div>
            
            ${secondHalf.length > 0 ? `
            <div>
                <h4 class="font-orbitron text-xl text-cyan-300 mb-4">Conteúdo Adicional</h4>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    ${secondHalf.map(video => `
                        <a href="${video.url}"  class="block bg-gray-800/50 p-3 rounded-lg hover:bg-gray-700/70 transition-colors">
                            <div class="relative">
                                <img src="${video.thumbnail}" alt="${video.title}" class="w-full rounded-md mb-2 aspect-video object-cover">
                                <div class="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                                    ${video.duration}
                                </div>
                            </div>
                            <p class="text-sm font-medium text-gray-200 line-clamp-2 mb-1">${video.title}</p>
                            <p class="text-xs text-gray-400 mb-1">${video.channelTitle}</p>
                            <div class="flex items-center text-xs text-gray-500">
                                <span class="mr-2">👍 ${formatNumber(video.likes)}</span>
                                <span>👁️ ${formatNumber(video.views)}</span>
                            </div>
                        </a>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        `;
        
    } catch (error) {
        console.error('Erro ao buscar vídeos:', error);
        videoGridEl.innerHTML = `
            <div class="text-center py-8">
                <p class="text-red-400 mb-2">❌ Erro ao carregar vídeos</p>
                <p class="text-gray-400 text-sm">${error.message}</p>
                <button onclick="showVideoModal(currentQuestionData || storyData[currentSlideId])" class="mt-4 action-button bg-blue-800 hover:bg-blue-700 text-gray-100 border-blue-900">
                    🔄 Tentar Novamente
                </button>
            </div>
        `;
    }
}
            