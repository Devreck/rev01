// ===================================================================================
// MISSÃO S.O.S. AURORA - SISTEMA INTEGRADO
// ===================================================================================

import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';

// Configuração
let supabase;
let GEMINI_API_KEY = null;
let apiKeyLoaded = false;

// Estado do jogo
let currentSlideId = '1';
let currentQuestionData = null;
let score = 0;
let progress = {
    c1: { b3: false, b4: false, b5: false, b6: false },
    c2: { b9: false, b10: false, b11: false },
    c3: { b13: false }
};

// Elementos DOM
const slideContentEl = document.getElementById('slide-content');
const imageContainerEl = document.getElementById('slide-image-container');
const textContainerEl = document.getElementById('slide-text-container');
const choicesContainerEl = document.getElementById('slide-choices-container');
const geminiOutputContainerEl = document.getElementById('gemini-output-container');
const resetBtn = document.getElementById('reset-btn');
const scoreDisplayEl = document.getElementById('score-display');
const enemModalEl = document.getElementById('enem-modal');
const enemConfirmBtn = document.getElementById('enem-confirm-btn');
const enemCancelBtn = document.getElementById('enem-cancel-btn');
const videoModalEl = document.getElementById('video-modal');
const videoGridEl = document.getElementById('video-grid');
const videoCloseBtn = document.getElementById('video-close-btn');

// ===================================================================================
// BANCO DE DADOS DA HISTÓRIA
// ===================================================================================

const storyData = {
    '1':{title:"S.O.S. Estação Aurora",image:"https://placehold.co/800x400/0c0a1e/4169E1?text=Alerta+Vermelho+na+Ponte",text:`O som estridente do alarme corta o silêncio da Estação Espacial Aurora. Luzes vermelhas pulsam nos corredores metálicos. Na ponte de comando, a I.A. Central projeta um aviso holográfico:<br><br><strong>"ALERTA. FALHA CASCATA DETECTADA. SISTEMAS DE SUPORTE À VIDA EM NÍVEL CRÍTICO. TEMPERATURA INTERNA INSTÁVEL."</strong><br><br>Como o(a) mais novo(a) Cadete de Engenharia a bordo, todos os olhares se voltam para você. A Comandante Eva Rostova aponta para o painel principal.<br>— Cadete, os sistemas de controle térmico entraram em colapso. Precisamos de você. Estabilize a temperatura antes que seja tarde demais. Sua missão começa agora.`,choices:[{text:"Assumir o controle e iniciar diagnóstico",nextSlide:'c1_hub'}]},
    'c1_hub':{isHub:true,chapter:1,title:"Cap. 1 – O Coração Gelado",image:"https://placehold.co/800x400/1a1a2e/87CEEB?text=Controle+de+Suporte+à+Vida",text:"A falha no sistema de suporte à vida parece ter múltiplas causas. Você precisa diagnosticar e reparar cada subsistema para restaurar a estabilidade. Escolha um bloco de diagnóstico para começar.",blocks:[{id:'b3',name:'Protocolo de Calibração (Termometria)',startSlide:'c1_b3_s1'},{id:'b4',name:'Contenção de Fuga Térmica (Calorimetria)',startSlide:'c1_b4_s1'},{id:'b5',name:'Integridade Estrutural (Condução)',startSlide:'c1_b5_s1'},{id:'b6',name:'Controle Ambiental (Radiação & Convecção)',startSlide:'c1_b6_s1'}],nextChapterSlide:'c2_hub'},
    
    // Bloco 3: Termometria
    'c1_b3_s1':{isDiagnosis:true,chapter:1,block:'b3',title:"Protocolo de Calibração (1/3): Escalas",text:"Log da I.A.: Detectada anomalia no sistema de refrigeração. A unidade de controle, um modelo Aratech legado, opera em Fahrenheit. Os sensores principais, no entanto, reportam em Celsius. A conversão precisa é essencial para evitar o congelamento da linha de plasma.",nextSlideInBlock:'c1_b3_s2',diaryPrompt:"Explique os conceitos de escalas termométricas. Detalhe a origem das escalas Celsius e Fahrenheit, seus pontos fixos e por que a escala Kelvin é considerada absoluta. Enfatize a importância da precisão na conversão para a segurança dos sistemas.",geminiCalcPrompt:"Você é a I.A. da Estação Aurora. Crie um desafio de CÁLCULO com 5 opções de resposta. O cenário: 'O painel de controle do núcleo do reator mostra uma leitura de temperatura em graus Celsius, mas o sistema de refrigeração de emergência só aceita comandos em graus Fahrenheit.' A pergunta deve exigir a conversão de um valor. O feedback deve mostrar a fórmula $$T_{F} = T_{C} \cdot 1.8 + 32$$ em modo de exibição e o cálculo passo a passo."},
    'c1_b3_s2':{isDiagnosis:true,chapter:1,block:'b3',title:"Protocolo de Calibração (2/3): Variação",text:"Log da I.A.: A falha parece estar na interpretação das <strong>variações</strong> de temperatura. Uma variação de 1°C não é o mesmo que uma variação de 1°F, mas é idêntica a uma variação de 1 K. Os atuadores do sistema de refrigeração estão respondendo de forma desproporcional.",nextSlideInBlock:'c1_b3_s3',diaryPrompt:"Explique a diferença entre a conversão de um ponto de temperatura e a conversão de uma <strong>variação</strong> de temperatura ($\Delta T$). Explique por que $\Delta T_C = \Delta T_K$ e por que $\Delta T_F = 1.8 \cdot \Delta T_C$.",geminiConceptPrompt:"Você é a I.A. da Estação Aurora. Crie um desafio CONCEITUAL com 5 opções de resposta. O cenário: 'Dois sensores medem a variação de temperatura de um componente. O sensor A (em Celsius) registra uma variação de 15°C. O sensor B (em Kelvin) registra uma variação de 15 K. O sensor C (em Fahrenheit) registra uma variação de 15°F.' A pergunta deve ser: 'Quais sensores registraram a mesma variação de energia térmica?'. O feedback deve explicar por que a variação em Celsius e Kelvin são equivalentes, enquanto a de Fahrenheit é diferente."},
    'c1_b3_s3':{isDiagnosis:true,chapter:1,block:'b3',title:"Protocolo de Calibração (3/3): Função Termométrica",text:"Log da I.A.: Alguns sensores antigos não são padronizados. Eles relacionam uma propriedade física (como a resistência de um fio) com a temperatura através de uma função linear. Precisamos saber como calibrar um desses sensores usando dois pontos fixos conhecidos, como os pontos de fusão e ebulição da água.",nextHub:'c1_hub',diaryPrompt:"Explique como construir a equação de uma escala termométrica arbitrária ($T_X$) em relação a uma escala conhecida ($T_C$), usando dois pontos fixos e a relação $$\frac{T_C - T_{C1}}{T_{C2} - T_{C1}} = \frac{T_X - T_{X1}}{T_{X2} - T_{X1}}$$. Detalhe o que cada termo significa.",geminiCalcPrompt:"Você é a I.A. da Estação Aurora. Crie um desafio de CÁLCULO com 5 opções de resposta. O cenário: 'Um termômetro descalibrado marca 10°X no ponto de fusão do gelo (0°C) e 90°X no ponto de ebulição da água (100°C). Qual temperatura em Celsius corresponde a 50°X?'. O feedback deve mostrar o passo a passo da resolução usando a relação entre as escalas, com as fórmulas principais em modo de exibição ($$fórmula$$)."},

    // Bloco 4: Trocas de Calor
    'c1_b4_s1':{isDiagnosis:true,chapter:1,block:'b4',title:"Contenção de Fuga Térmica (1/3): Capacidade Térmica",text:"Log da I.A.: Cada material a bordo reage de forma diferente ao calor. Alguns, como a água usada na refrigeração, possuem alto calor específico e podem absorver muita energia. Outros, como os metais do casco, têm baixa capacidade térmica e aquecem rapidamente. Essa distinção é vital.",nextSlideInBlock:'c1_b4_s2',diaryPrompt:"Explique a diferença fundamental entre <strong>Calor Específico</strong> ($c$) e <strong>Capacidade Térmica</strong> ($C$). Explique que 'c' é uma propriedade intensiva do material, enquanto 'C' é uma propriedade extensiva do objeto ($C=m \cdot c$).",geminiConceptPrompt:`Você é a I.A. da Estação Aurora. Crie um desafio CONCEITUAL com 5 opções de resposta. **REGRA DE VARIAÇÃO: Aleatoriamente, decida se o material A ou B terá o maior calor específico e construa a pergunta e o feedback com base nessa escolha, para que a resposta correta não seja sempre a mesma.** O cenário: "Dois componentes de mesma massa, feitos de materiais diferentes, recebem a mesma quantidade de calor de uma fonte de energia. O sensor de diagnóstico registra a variação de temperatura de cada um." A pergunta deve levar o cadete a identificar qual material tem o maior calor específico com base nas variações de temperatura. O feedback deve explicar a relação inversa entre calor específico e variação de temperatura para uma dada quantidade de calor.`},
    'c1_b4_s2':{isDiagnosis:true,chapter:1,block:'b4',title:"Contenção de Fuga Térmica (2/3): Calor Latente",text:"Log da I.A.: Os sistemas de refrigeração de emergência usam a vaporização de líquidos para absorver enormes quantidades de calor sem aumentar a temperatura. Este é o conceito de calor latente. Precisamos verificar se a energia da fuga térmica é suficiente para causar uma mudança de fase no refrigerante.",nextSlideInBlock:'c1_b4_s3',diaryPrompt:"Explique o conceito de <strong>Calor Latente</strong>. Descreva como a energia é usada para quebrar as ligações intermoleculares durante uma mudança de fase (fusão, vaporização) sem alterar a temperatura do sistema. Use a fórmula $$Q = m \cdot L$$ para ilustrar.",geminiCalcPrompt:`Você é a I.A. da Estação Aurora. Crie um desafio de CÁLCULO com 5 opções de resposta. O cenário: "Uma massa de gelo a 0°C precisa ser completamente derretida. Dado o calor latente de fusão da água, o cadete deve calcular a quantidade de calor necessária." O feedback deve mostrar a fórmula $$Q = m \cdot L$$ em modo de exibição e o cálculo.`},
    'c1_b4_s3':{isDiagnosis:true,chapter:1,block:'b4',title:"Contenção de Fuga Térmica (3/3): Equilíbrio",text:"Log da I.A.: Alerta! Fluido do sistema de refrigeração primário vazou para o reservatório secundário. Os dois fluidos estão em temperaturas diferentes. É preciso prever a temperatura de equilíbrio para evitar danos por choque térmico.",nextHub:'c1_hub',diaryPrompt:"Explique o <strong>Princípio das Trocas de Calor</strong> em sistemas isolados. Detalhe que a soma das quantidades de calor trocadas é nula ($$\sum Q = 0$$), o que significa que o calor cedido pelos corpos mais quentes é igual ao calor recebido pelos corpos mais frios.",geminiCalcPrompt:`Você é a I.A. da Estação Aurora. Crie um desafio de CÁLCULO com 5 opções de resposta. O cenário: "Uma peça de metal superaquecida de um motor é ejetada em um tanque de água de refrigeração." **REGRA DE VARIAÇÃO: Os dados podem estar em unidades diferentes (ex: massa em gramas, calor específico em J/kg°C ou cal/g°C), exigindo conversão. Os materiais e o contexto podem variar (ex: fluido criogênico resfriando um sensor, etc.).** A pergunta deve exigir o cálculo da temperatura final de equilíbrio do sistema. O feedback deve mostrar a aplicação do princípio das trocas de calor, começando com a equação fundamental em modo de exibição: $$Q_{\text{recebido}} + Q_{\text{cedido}} = 0$$ Em seguida, mostre o cálculo passo a passo de forma clara e organizada, com cada passo em uma nova linha.`},
    
    // Outros blocos...
    'c1_b5_s1':{isDiagnosis:true,chapter:1,block:'b5',title:"Integridade Estrutural (1/2): Lei de Fourier",text:"Log da I.A.: Sensores indicam uma perda de calor anormal em uma seção do casco. A energia está se propagando por condução através de painéis que deveriam ser isolantes. É preciso entender a Lei de Fourier para quantificar e mitigar essa perda.",nextSlideInBlock:'c1_b5_s2',diaryPrompt:"Explique a <strong>Lei de Fourier</strong> para o fluxo de calor ($Φ = \frac{k \cdot A \cdot \Delta T}{L}$). Detalhe o que cada variável representa (condutividade térmica, área, variação de temperatura, espessura) e como elas influenciam a taxa de transferência de calor.",geminiCalcPrompt:`Você é a I.A. da Estação Aurora. Crie um desafio de CÁLCULO com 5 opções de resposta. O cenário: "Um painel do casco da nave, com área, espessura e condutividade térmica conhecidas, está com uma face exposta ao frio do espaço e a outra face em contato com o ambiente interno aquecido." A pergunta deve ser sobre o cálculo do fluxo de calor (potência térmica) através do painel. O feedback deve mostrar a Lei de Fourier em modo de exibição ($$Φ = \frac{k \cdot A \cdot \Delta T}{L}$$) e o cálculo detalhado.`},
    'c1_b5_s2':{isDiagnosis:true,chapter:1,block:'b5',title:"Integridade Estrutural (2/2): Materiais",text:"Log da I.A.: A escolha do material é tudo. Alguns materiais são excelentes condutores, outros são isolantes. Sua condutividade térmica ($k$) define sua função. A falha pode estar em um painel de material inadequado.",nextHub:'c1_hub',diaryPrompt:"Explique o conceito de <strong>condutividade térmica</strong> ($k$). Compare materiais condutores (metais) e isolantes (cerâmicas, vácuo), explicando como a estrutura atômica de cada um facilita ou dificulta a transferência de energia por vibrações.",geminiConceptPrompt:`Você é a I.A. da Estação Aurora. Crie um desafio CONCEITUAL com 5 opções de resposta. **REGRA DE VARIAÇÃO: Aleatoriamente, decida qual material (A ou B) terá a maior condutividade e construa a questão e o feedback com base nisso.** O cenário: "Temos dois painéis de materiais diferentes, A e B, com a mesma área e espessura. Ambos são submetidos à mesma diferença de temperatura." A pergunta deve ser sobre qual painel permitirá um maior fluxo de calor e por quê. O feedback deve explicar a relação direta entre a condutividade térmica ($k$) e o fluxo de calor.`},
    'c1_b6_s1':{isDiagnosis:true,chapter:1,block:'b6',title:"Controle Ambiental (1/2): Convecção",text:"Log da I.A.: O calor não se move apenas através de sólidos. As correntes de ar no nosso sistema de ventilação transferem calor por convecção. Uma falha nessas correntes pode criar pontos perigosamente quentes ou frios no habitat.",nextSlideInBlock:'c1_b6_s2',diaryPrompt:"Explique o processo de <strong>Convecção</strong>. Diferencie convecção natural (causada por diferenças de densidade induzidas pela temperatura, dependente da gravidade) e convecção forçada (causada por ventiladores e bombas), ambas cruciais para o sistema de suporte à vida.",geminiConceptPrompt:`Você é a I.A. da Estação Aurora. Crie um desafio CONCEITUAL com 5 opções de resposta. O cenário: "Em um ambiente de microgravidade, um aquecedor é ligado. Como o ar aquecido se comportará em comparação com um ambiente com gravidade normal?" A pergunta deve testar o entendimento de que a convecção natural depende da gravidade (densidade). O feedback deve explicar que, sem gravidade, as correntes de convecção natural não se formam eficientemente.`},
    'c1_b6_s2':{isDiagnosis:true,chapter:1,block:'b6',title:"Controle Ambiental (2/2): Radiação",text:"Log da I.A.: No vácuo, a principal forma de transferência de calor é a radiação. Os painéis radiadores da estação dissipam o excesso de calor para o espaço. A eficiência deles depende da temperatura e das propriedades da superfície. Uma falha aqui é crítica.",nextHub:'c1_hub',diaryPrompt:"Explique a <strong>Radiação Térmica</strong>. Detalhe que todo corpo com temperatura acima do zero absoluto emite ondas eletromagnéticas e explique a Lei de Stefan-Boltzmann ($P = \sigma \cdot \epsilon \cdot A \cdot T^4$), enfatizando a forte dependência da temperatura ($T^4$) e da emissividade da superfície ($\epsilon$).",geminiCalcPrompt:`Você é a I.A. da Estação Aurora. Crie um desafio de CÁLCULO com 5 opções de resposta. O cenário: "Um painel radiador externo da estação, com área e emissividade conhecidas, está operando a uma certa temperatura." A pergunta deve ser sobre a potência total que ele irradia para o espaço. O feedback deve mostrar a Lei de Stefan-Boltzmann em modo de exibição ($$P = \sigma \cdot \epsilon \cdot A \cdot T^4$$) e o cálculo detalhado.`},
    'c2_hub':{isHub:true,chapter:2,title:"Cap. 2 – O Silêncio do Vazio",image:"https://placehold.co/800x400/2c3e50/ecf0f1?text=Antena+de+Comunicação",text:"Com o suporte à vida estável, um novo alarme soa. O sistema de comunicação subluz está inoperante. Sem contato com o Comando Estelar, estamos isolados. Sua tarefa é diagnosticar e reparar os sistemas de ondas.",blocks:[{id:'b9',name:'O Sinal Portador (Fundamentos de Ondas)',startSlide:'c2_b9_s1'}],nextChapterSlide:'c3_hub'},
    'c2_b9_s1':{isDiagnosis:true,chapter:2,block:'b9',title:"Diagnóstico: O Sinal Portador",text:"Log da I.A.: A antena principal está dessincronizada. Para calibrá-la, precisamos definir os parâmetros corretos da onda portadora: frequência ($f$), período ($T$), comprimento de onda ($\lambda$) e amplitude ($A$). A relação entre eles é governada pela equação fundamental $v = \lambda \cdot f$. Um erro aqui e o sinal se perde no vácuo.",nextHub:'c2_hub',diaryPrompt:"Explique a <strong>equação fundamental da ondulatória</strong>, $v = \lambda \cdot f$. Descreva o que cada termo representa (velocidade, comprimento de onda, frequência) e como eles se relacionam para definir as características de uma onda de comunicação.",geminiCalcPrompt:`Você é a I.A. da Estação Aurora. Crie um desafio de CÁLCULO com 5 opções de resposta. O cenário: "Para restabelecer a comunicação, o manual técnico especifica a frequência e o comprimento de onda da onda portadora." A pergunta deve exigir o cálculo da velocidade de propagação. O feedback deve mostrar a equação $v = \lambda \cdot f$ em modo de exibição e o cálculo detalhado.`,geminiConceptPrompt:`Você é a I.A. da Estação Aurora. Crie um desafio CONCEITUAL com 5 opções de resposta. O cenário: "A onda de comunicação precisa passar por uma nebulosa densa, que atua como um meio diferente." A pergunta deve testar o entendimento sobre o que acontece com a frequência, o comprimento de onda e a velocidade da onda ao mudar de meio. O feedback deve explicar que a frequência se mantém constante.`},
    'c3_hub':{isHub:true,chapter:3,title:"Cap. 3 – Perdidos nas Estrelas",image:"https://placehold.co/800x400/9b59b6/f3e5f5?text=Sensor+de+Navegação",text:"Comunicação restaurada, mas um novo alerta surge. O sistema de navegação óptica falhou. Estamos à deriva. Sua tarefa final é recalibrar os sensores ópticos usando as estrelas como guia.",blocks:[{id:'b13',name:'Alinhamento da Lente (Refração & Dispersão)',startSlide:'c3_b13_s1'}],nextChapterSlide:'c4_epilogo'},
    'c3_b13_s1':{isDiagnosis:true,chapter:3,block:'b13',title:"Diagnóstico: Alinhamento da Lente",text:"Log da I.A.: A luz da estrela guia está se desviando ao entrar nas lentes dos sensores. Esse desvio (refração) depende do material da lente. Além disso, a luz está se dispersando em cores, causando aberrações cromáticas. Em alguns cabos de fibra óptica, a luz está sendo totalmente refletida internamente, causando perda de sinal. Sua tarefa é analisar os dados do sensor para corrigir a trajetória.",nextHub:'c3_hub',diaryPrompt:"Explique a <strong>Lei de Snell</strong> ($n_1 \sin(\theta_1) = n_2 \sin(\theta_2)$) e o conceito de <strong>ângulo crítico</strong> para a reflexão interna total. Detalhe como esses princípios são essenciais para o funcionamento de lentes e fibras ópticas.",geminiCalcPrompt:`Você é a I.A. da Estação Aurora. Crie um desafio de CÁLCULO com 5 opções de resposta. O cenário: "Um feixe de laser de calibração entra em um bloco de material óptico desconhecido. Os sensores medem o ângulo de incidência e o ângulo de refração." A pergunta deve exigir o cálculo do índice de refração do material. O feedback deve mostrar a Lei de Snell em modo de exibição e o cálculo passo a passo.`,geminiConceptPrompt:`Você é a I.A. da Estação Aurora. Crie um desafio CONCEITUAL com 5 opções de resposta. O cenário: "Um feixe de luz está viajando do interior de um cabo de fibra óptica (com alto índice de refração) para o seu revestimento (com baixo índice de refração)." A pergunta deve ser sobre o que acontece com o feixe de luz se o ângulo de incidência exceder o ângulo crítico. O feedback deve explicar o fenômeno da reflexão interna total.`},
    'c4_epilogo':{title:"Epílogo: O Caminho de Casa",image:"https://placehold.co/800x400/f1c40f/2c3e50?text=Estação+Aurora+Salva",text:`Com todos os sistemas reparados, o mapa estelar se encaixa perfeitamente na tela de navegação. A rota de volta para casa está traçada. A Comandante Rostova coloca a mão em seu ombro.<br>— Você fez o impossível, Cadete. Você salvou a todos nós. Sua perícia em física transformou uma catástrofe certa em nosso retorno seguro.<br><br><h3 class="text-2xl text-cyan-300 font-orbitron text-center mt-4">🏆 Conquista Desbloqueada: Engenheiro(a) Chefe da Aurora 🏆</h3>`,choices:[]}
};

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
            await loadApiKey();
        } else {
            console.warn('CONFIG não encontrado, usando modo local');
            // Usar API key local como fallback
            GEMINI_API_KEY = 'AIzaSyBVkxYFxiDWqrTVrwl5xMuZ5qZZJuNC-nA';
            apiKeyLoaded = true;
        }
        
        setupEventListeners();
        showSystemMessage('✅ Sistemas online! Missão iniciada.', 'success');
        renderSlide(currentSlideId);
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        showSystemMessage(`❌ Erro de configuração: ${error.message}`, 'error');
        // Continuar em modo local
        GEMINI_API_KEY = 'AIzaSyBVkxYFxiDWqrTVrwl5xMuZ5qZZJuNC-nA';
        apiKeyLoaded = true;
        renderSlide(currentSlideId);
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
        
        // Fallback para desenvolvimento local
        if (typeof CONFIG !== 'undefined' && CONFIG.GEMINI_API_KEY_LOCAL) {
            GEMINI_API_KEY = CONFIG.GEMINI_API_KEY_LOCAL;
            apiKeyLoaded = true;
            showSystemMessage('⚠️ Usando conexão local de emergência', 'info');
        } else {
            showSystemMessage(`❌ ${error.message}`, 'error');
            apiKeyLoaded = false;
        }
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
// GEMINI API
// ===================================================================================

aasync function callGeminiApi(prompt, button) {
    if (CONFIG.USE_MOCK_MODE) {
        // Código do modo mock...
        return;
    }
    
    geminiOutputContainerEl.innerHTML = '';
    const originalButtonText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<div class="flex items-center justify-center"><div class="loader"></div><span>Processando...</span></div>';

    try {
        // Tentar usar função SQL do Supabase
        const { data, error } = await supabase.rpc('gemini_proxy', {
            request_body: { prompt: prompt }
        });

        if (error) throw error;

        let text = "Ocorreu uma interferência na comunicação com a I.A. Tente novamente.";
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            text = data.candidates[0].content.parts[0].text;
        }
        
        geminiOutputContainerEl.innerHTML = `<div class="gemini-response">${text.replace(/\n/g, '<br>')}</div>`;
        if (window.MathJax) { MathJax.typeset([geminiOutputContainerEl]); }

    } catch (error) {
        console.error("Gemini API call failed:", error);
        geminiOutputContainerEl.innerHTML = `<div class="gemini-response text-red-400">Falha na conexão com a I.A. Central: ${error.message}</div>`;
    } finally {
         button.disabled = false;
         button.innerHTML = originalButtonText;
    }
}

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
        geminiOutputContainerEl.innerHTML = `<div class="gemini-response text-red-400">Falha crítica na conexão com a I.A. Central. Modo offline ativo.</div>`;
    } finally {
         button.disabled = false;
         button.innerHTML = originalButtonText;
    }
}

async function generateDynamicQuestion(slide, difficulty = 'standard') {
    if (!apiKeyLoaded) {
        showSystemMessage('❌ I.A. Central indisponível. Usando questão de emergência.', 'error');
        return createFallbackSlide(slide);
    }

const promptTypes = [];
    if (slide.geminiCalcPrompt) promptTypes.push(slide.geminiCalcPrompt);
    if (slide.geminiConceptPrompt) promptTypes.push(slide.geminiConceptPrompt);

    if (promptTypes.length === 0) {
        console.error("No AI question prompts found for this slide:", slide);
        return createFallbackSlide(slide);
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
        let response;
        const requestBody = {
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
        };

        // Tentar usar função do Supabase primeiro
        if (typeof CONFIG !== 'undefined' && CONFIG.SUPABASE_FUNCTION_URL) {
            response = await fetch(CONFIG.SUPABASE_FUNCTION_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });
        } else {
            // Fallback para API direta
            response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });
        }
        
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
        // Lógica para slides de diagnóstico
        else if (slide.isDiagnosis) {
             choicesContainerEl.innerHTML = '<div class="text-cyan-300 flex items-center w-full justify-center py-4"><div class="loader"></div>Gerando diagnóstico...</div>';
            
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
            }
        } 
        
        // Renderizar escolhas padrão
        if (slide.choices) {
            slide.choices.forEach(choice => {
                const button = createButton(choice.text, () => renderSlide(choice.nextSlide), 'justify-center bg-indigo-700 hover:bg-indigo-600 text-gray-100 font-bold py-3 px-5 rounded-md border-indigo-900');
                choicesContainerEl.appendChild(button);
            });
        }
        
        if (window.MathJax) {
             MathJax.typesetPromise([textContainerEl, choicesContainerEl]);
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
    const topic = slide.diaryPrompt ? slide.diaryPrompt.split(".")[0] : "Física";
    videoGridEl.innerHTML = '<div class="flex justify-center items-center"><div class="loader"></div><span>Buscando vídeos de treinamento...</span></div>';
    videoModalEl.classList.remove('hidden');

    // Simulação da busca de vídeos
    setTimeout(() => {
        videoGridEl.innerHTML = `
            <div>
                <h4 class="font-orbitron text-xl text-cyan-300 mb-2">Indicação Superior</h4>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <a href="#" class="block bg-gray-800/50 p-2 rounded-lg hover:bg-gray-700/70"><img src="https://placehold.co/160x90/1a1a2e/4169E1?text=Vídeo+1" class="w-full rounded-md mb-2"><p class="text-sm">Conceito de ${topic}</p></a>
                     <a href="#" class="block bg-gray-800/50 p-2 rounded-lg hover:bg-gray-700/70"><img src="https://placehold.co/160x90/1a1a2e/4169E1?text=Vídeo+2" class="w-full rounded-md mb-2"><p class="text-sm">Exercício Resolvido</p></a>
                     <a href="#" class="block bg-gray-800/50 p-2 rounded-lg hover:bg-gray-700/70"><img src="https://placehold.co/160x90/1a1a2e/4169E1?text=Vídeo+3" class="w-full rounded-md mb-2"><p class="text-sm">Aplicação Prática</p></a>
                </div>
            </div>
             <div>
                <h4 class="font-orbitron text-xl text-cyan-300 mb-2">Possibilidade Integrativa</h4>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <a href="#" class="block bg-gray-800/50 p-2 rounded-lg hover:bg-gray-700/70"><img src="https://placehold.co/160x90/1a1a2e/4169E1?text=Vídeo+4" class="w-full rounded-md mb-2"><p class="text-sm">Aula Completa</p></a>
                     <a href="#" class="block bg-gray-800/50 p-2 rounded-lg hover:bg-gray-700/70"><img src="https://placehold.co/160x90/1a1a2e/4169E1?text=Vídeo+5" class="w-full rounded-md mb-2"><p class="text-sm">Dica Rápida</p></a>
                     <a href="#" class="block bg-gray-800/50 p-2 rounded-lg hover:bg-gray-700/70"><img src="https://placehold.co/160x90/1a1a2e/4169E1?text=Vídeo+6" class="w-full rounded-md mb-2"><p class="text-sm">Documentário Relacionado</p></a>
                </div>
            </div>
        `;
    }, 1500);
}