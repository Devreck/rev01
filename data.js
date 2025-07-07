// ===================================================================================
// DADOS DA HISTÓRIA - S.O.S. ESTAÇÃO AURORA
// ===================================================================================

const storyData = {
    // SLIDE INICIAL
    "1": {
        id: "1",
        title: "S.O.S. ESTAÇÃO AURORA",
        text: `<p>Ano 3125. Você é um cadete da Academia Espacial em missão de resgate na <strong>Estação Aurora</strong>, uma instalação científica à deriva no espaço profundo.</p>
               <p>Os sistemas de suporte à vida estão falhando. Sua missão: diagnosticar e corrigir os problemas usando seus conhecimentos de física.</p>
               <p class="text-cyan-300 font-semibold mt-4">🚨 ALERTA: Múltiplas falhas detectadas nos sistemas críticos!</p>`,
        image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        choices: [
            {
                text: "🚀 Iniciar Diagnóstico dos Sistemas",
                nextSlide: "2"
            }
        ]
    },

    // HUB PRINCIPAL
    "2": {
        id: "2",
        title: "PAINEL DE DIAGNÓSTICO PRINCIPAL",
        text: `<p>Você está no centro de comando da Estação Aurora. Três sistemas críticos apresentam falhas:</p>
               <ul class="list-disc list-inside mt-4 space-y-2">
                   <li><strong class="text-red-400">Sistema Térmico:</strong> Regulação de temperatura comprometida</li>
                   <li><strong class="text-yellow-400">Sistema Óptico:</strong> Sensores de navegação desalinhados</li>
                   <li><strong class="text-blue-400">Sistema de Ondas:</strong> Comunicações interrompidas</li>
               </ul>
               <p class="text-cyan-300 mt-4">Escolha qual sistema diagnosticar primeiro:</p>`,
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        isHub: true,
        chapter: 1,
        blocks: [
            { id: "b3", name: "🌡️ Sistema Térmico", startSlide: "3" },
            { id: "b4", name: "🔬 Sistema Óptico", startSlide: "4" },
            { id: "b5", name: "📡 Sistema de Ondas", startSlide: "5" }
        ],
        nextChapterSlide: "6"
    },

    // SISTEMA TÉRMICO - TERMOMETRIA
    "3": {
        id: "3",
        title: "DIAGNÓSTICO: SISTEMA TÉRMICO",
        text: `<p>O sistema de controle térmico da estação está em colapso. Os sensores de temperatura mostram leituras inconsistentes entre as diferentes escalas.</p>
               <p class="text-red-400 font-semibold">🚨 FALHA CRÍTICA: Conversão entre escalas termométricas</p>
               <p>A vida da tripulação depende da sua capacidade de calibrar corretamente os sensores térmicos.</p>`,
        image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        isDiagnosis: true,
        chapter: 1,
        block: "b3",
        nextHub: "2",
        geminiCalcPrompt: `Você é a I.A. da Estação Aurora gerando um diagnóstico de emergência. Crie uma questão sobre CONVERSÃO ENTRE ESCALAS TERMOMÉTRICAS (Celsius, Fahrenheit, Kelvin) no contexto de uma estação espacial com falha crítica.

CONTEXTO: Sistema térmico da estação espacial com sensores descalibrados.

FORMATO OBRIGATÓRIO (JSON):
{
  "question": "Descrição detalhada do problema com valores numéricos específicos",
  "answers": [
    {"text": "Alternativa A com valor numérico", "correct": false},
    {"text": "Alternativa B com valor numérico", "correct": true},
    {"text": "Alternativa C com valor numérico", "correct": false},
    {"text": "Alternativa D com valor numérico", "correct": false}
  ],
  "correctFeedback": "Explicação técnica detalhada da solução correta",
  "incorrectFeedback": "Explicação do erro e orientação para correção"
}

REQUISITOS:
- Use valores numéricos realistas para uma estação espacial
- Inclua pelo menos 2 escalas diferentes na conversão
- Contextualize com situação de emergência espacial
- Alternativas com valores numéricos precisos
- Explicações técnicas detalhadas`,

        geminiConceptPrompt: `Você é a I.A. da Estação Aurora gerando um diagnóstico conceitual. Crie uma questão sobre CONCEITOS DE TERMOMETRIA no contexto espacial.

CONTEXTO: Falha no sistema térmico da estação espacial.

FORMATO OBRIGATÓRIO (JSON):
{
  "question": "Questão conceitual sobre termometria aplicada ao contexto espacial",
  "answers": [
    {"text": "Conceito A", "correct": false},
    {"text": "Conceito B", "correct": true},
    {"text": "Conceito C", "correct": false},
    {"text": "Conceito D", "correct": false}
  ],
  "correctFeedback": "Explicação conceitual detalhada",
  "incorrectFeedback": "Correção do conceito e orientação"
}

TÓPICOS POSSÍVEIS:
- Diferença entre calor e temperatura
- Escalas termométricas e seus pontos de referência
- Dilatação térmica em estruturas espaciais
- Equilíbrio térmico no vácuo espacial`,

        diaryPrompt: "escalas termométricas, conversão de temperatura, Celsius, Fahrenheit, Kelvin, termometria"
    },

    // SISTEMA ÓPTICO - REFRAÇÃO
    "4": {
        id: "4",
        title: "DIAGNÓSTICO: SISTEMA ÓPTICO",
        text: `<p>Os sensores ópticos de navegação estão desalinhados. A luz das estrelas está sendo refratada incorretamente pelos cristais de navegação.</p>
               <p class="text-yellow-400 font-semibold">🚨 FALHA CRÍTICA: Desvio óptico nos sensores</p>
               <p>Sem navegação precisa, a estação pode se perder no espaço profundo.</p>`,
        image: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        isDiagnosis: true,
        chapter: 1,
        block: "b4",
        nextHub: "2",
        geminiCalcPrompt: `Você é a I.A. da Estação Aurora gerando um diagnóstico óptico. Crie uma questão sobre REFRAÇÃO DA LUZ aplicada a sensores de navegação espacial.

CONTEXTO: Sensores ópticos de navegação com desvio de luz estelar.

FORMATO OBRIGATÓRIO (JSON):
{
  "question": "Problema de refração com valores numéricos específicos para correção dos sensores",
  "answers": [
    {"text": "Valor A com unidade", "correct": false},
    {"text": "Valor B com unidade", "correct": true},
    {"text": "Valor C com unidade", "correct": false},
    {"text": "Valor D com unidade", "correct": false}
  ],
  "correctFeedback": "Explicação técnica da Lei de Snell e correção óptica",
  "incorrectFeedback": "Orientação sobre cálculo de refração e índices"
}

REQUISITOS:
- Use Lei de Snell com valores numéricos
- Contexto de navegação espacial
- Índices de refração realistas
- Ângulos de incidência e refração específicos`,

        geminiConceptPrompt: `Você é a I.A. da Estação Aurora gerando diagnóstico conceitual óptico. Crie uma questão sobre CONCEITOS DE REFRAÇÃO.

CONTEXTO: Falha nos sensores ópticos de navegação.

FORMATO OBRIGATÓRIO (JSON):
{
  "question": "Questão conceitual sobre refração aplicada à navegação espacial",
  "answers": [
    {"text": "Conceito A", "correct": false},
    {"text": "Conceito B", "correct": true},
    {"text": "Conceito C", "correct": false},
    {"text": "Conceito D", "correct": false}
  ],
  "correctFeedback": "Explicação conceitual detalhada sobre refração",
  "incorrectFeedback": "Correção conceitual e orientação"
}

TÓPICOS:
- Lei de Snell e índice de refração
- Comportamento da luz em diferentes meios
- Aplicações ópticas em navegação espacial`,

        diaryPrompt: "refração da luz, Lei de Snell, índice de refração, óptica geométrica, navegação óptica"
    },

    // SISTEMA DE ONDAS - COMUNICAÇÃO
    "5": {
        id: "5",
        title: "DIAGNÓSTICO: SISTEMA DE ONDAS",
        text: `<p>O sistema de comunicação está emitindo sinais distorcidos. As ondas eletromagnéticas não estão sendo transmitidas na frequência correta.</p>
               <p class="text-blue-400 font-semibold">🚨 FALHA CRÍTICA: Frequência de comunicação desregulada</p>
               <p>Sem comunicação, a estação não pode pedir socorro à base terrestre.</p>`,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        isDiagnosis: true,
        chapter: 1,
        block: "b5",
        nextHub: "2",
        geminiCalcPrompt: `Você é a I.A. da Estação Aurora gerando diagnóstico de comunicação. Crie uma questão sobre ONDAS ELETROMAGNÉTICAS para corrigir o sistema de comunicação.

CONTEXTO: Sistema de comunicação espacial com frequência desregulada.

FORMATO OBRIGATÓRIO (JSON):
{
  "question": "Problema de ondas com cálculos de frequência, comprimento de onda ou velocidade",
  "answers": [
    {"text": "Valor A com unidade", "correct": false},
    {"text": "Valor B com unidade", "correct": true},
    {"text": "Valor C com unidade", "correct": false},
    {"text": "Valor D com unidade", "correct": false}
  ],
  "correctFeedback": "Explicação técnica sobre ondas eletromagnéticas e comunicação",
  "incorrectFeedback": "Orientação sobre cálculos de ondas e frequência"
}

REQUISITOS:
- Use equação v = λf com valores numéricos
- Contexto de comunicação espacial
- Frequências realistas para comunicação
- Velocidade da luz no vácuo`,

        geminiConceptPrompt: `Você é a I.A. da Estação Aurora gerando diagnóstico conceitual de ondas. Crie uma questão sobre CONCEITOS DE ONDAS.

CONTEXTO: Falha no sistema de comunicação por ondas.

FORMATO OBRIGATÓRIO (JSON):
{
  "question": "Questão conceitual sobre ondas eletromagnéticas em comunicação espacial",
  "answers": [
    {"text": "Conceito A", "correct": false},
    {"text": "Conceito B", "correct": true},
    {"text": "Conceito C", "correct": false},
    {"text": "Conceito D", "correct": false}
  ],
  "correctFeedback": "Explicação conceitual sobre ondas e comunicação",
  "incorrectFeedback": "Correção conceitual e orientação"
}

TÓPICOS:
- Propriedades das ondas eletromagnéticas
- Relação entre frequência, comprimento de onda e velocidade
- Propagação de ondas no vácuo espacial`,

        diaryPrompt: "ondas eletromagnéticas, frequência, comprimento de onda, velocidade da luz, comunicação espacial"
    },

    // CAPÍTULO 2 - SISTEMAS AVANÇADOS
    "6": {
        id: "6",
        title: "SISTEMAS AVANÇADOS - NÍVEL 2",
        text: `<p>Excelente trabalho, cadete! Os sistemas básicos foram estabilizados.</p>
               <p>Agora você deve enfrentar falhas mais complexas nos sistemas avançados da estação:</p>
               <ul class="list-disc list-inside mt-4 space-y-2">
                   <li><strong class="text-red-400">Sistema de Calorimetria:</strong> Trocas térmicas descontroladas</li>
                   <li><strong class="text-green-400">Sistema de Condução:</strong> Fluxo de calor crítico</li>
                   <li><strong class="text-purple-400">Sistema de Radiação:</strong> Emissão térmica irregular</li>
               </ul>`,
        image: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        isHub: true,
        chapter: 2,
        blocks: [
            { id: "b9", name: "🔥 Sistema de Calorimetria", startSlide: "9" },
            { id: "b10", name: "🌡️ Sistema de Condução", startSlide: "10" },
            { id: "b11", name: "☀️ Sistema de Radiação", startSlide: "11" }
        ],
        nextChapterSlide: "12"
    },

    // SISTEMA DE CALORIMETRIA
    "9": {
        id: "9",
        title: "DIAGNÓSTICO: SISTEMA DE CALORIMETRIA",
        text: `<p>As trocas de calor entre os compartimentos da estação estão descontroladas. O sistema de calorimetria não consegue calcular corretamente as transferências térmicas.</p>
               <p class="text-red-400 font-semibold">🚨 FALHA CRÍTICA: Cálculo de calor específico incorreto</p>
               <p>A regulação térmica da estação depende destes cálculos precisos.</p>`,
        image: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        isDiagnosis: true,
        chapter: 2,
        block: "b9",
        nextHub: "6",
        geminiCalcPrompt: `Você é a I.A. da Estação Aurora gerando diagnóstico de calorimetria. Crie uma questão sobre CALORIMETRIA com cálculos de calor específico, capacidade térmica ou trocas de calor.

CONTEXTO: Sistema de regulação térmica da estação espacial descontrolado.

FORMATO OBRIGATÓRIO (JSON):
{
  "question": "Problema de calorimetria com valores numéricos específicos para correção do sistema",
  "answers": [
    {"text": "Valor A com unidade", "correct": false},
    {"text": "Valor B com unidade", "correct": true},
    {"text": "Valor C com unidade", "correct": false},
    {"text": "Valor D com unidade", "correct": false}
  ],
  "correctFeedback": "Explicação técnica sobre calorimetria e trocas térmicas",
  "incorrectFeedback": "Orientação sobre cálculos de calor e temperatura"
}

REQUISITOS:
- Use equações Q = mcΔT ou Q = CΔT
- Valores numéricos realistas para ambiente espacial
- Contexto de regulação térmica
- Materiais e substâncias espaciais`,

        diaryPrompt: "calorimetria, calor específico, capacidade térmica, trocas de calor, equilíbrio térmico"
    },

    // SISTEMA DE CONDUÇÃO
    "10": {
        id: "10",
        title: "DIAGNÓSTICO: SISTEMA DE CONDUÇÃO",
        text: `<p>O fluxo de calor através dos materiais da estação está crítico. A Lei de Fourier não está sendo aplicada corretamente pelos sistemas automatizados.</p>
               <p class="text-green-400 font-semibold">🚨 FALHA CRÍTICA: Condução térmica desregulada</p>
               <p>Os materiais isolantes podem falhar se o fluxo não for controlado.</p>`,
        image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        isDiagnosis: true,
        chapter: 2,
        block: "b10",
        nextHub: "6",
        geminiCalcPrompt: `Você é a I.A. da Estação Aurora gerando diagnóstico de condução térmica. Crie uma questão sobre CONDUÇÃO TÉRMICA usando a Lei de Fourier.

CONTEXTO: Fluxo de calor crítico através dos materiais da estação espacial.

FORMATO OBRIGATÓRIO (JSON):
{
  "question": "Problema de condução térmica com Lei de Fourier e valores numéricos específicos",
  "answers": [
    {"text": "Valor A com unidade", "correct": false},
    {"text": "Valor B com unidade", "correct": true},
    {"text": "Valor C com unidade", "correct": false},
    {"text": "Valor D com unidade", "correct": false}
  ],
  "correctFeedback": "Explicação técnica sobre Lei de Fourier e condução",
  "incorrectFeedback": "Orientação sobre cálculos de fluxo térmico"
}

REQUISITOS:
- Use Lei de Fourier: q = -kA(dT/dx)
- Condutividade térmica de materiais espaciais
- Gradiente de temperatura realista
- Contexto de isolamento térmico espacial`,

        diaryPrompt: "condução térmica, Lei de Fourier, fluxo de calor, condutividade térmica, gradiente de temperatura"
    },

    // SISTEMA DE RADIAÇÃO
    "11": {
        id: "11",
        title: "DIAGNÓSTICO: SISTEMA DE RADIAÇÃO",
        text: `<p>A emissão de radiação térmica da estação está irregular. A Lei de Stefan-Boltzmann não está sendo calculada corretamente pelos sensores.</p>
               <p class="text-purple-400 font-semibold">🚨 FALHA CRÍTICA: Radiação térmica descontrolada</p>
               <p>O equilíbrio térmico com o espaço pode ser perdido.</p>`,
        image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        isDiagnosis: true,
        chapter: 2,
        block: "b11",
        nextHub: "6",
        geminiCalcPrompt: `Você é a I.A. da Estação Aurora gerando diagnóstico de radiação térmica. Crie uma questão sobre RADIAÇÃO TÉRMICA usando a Lei de Stefan-Boltzmann.

CONTEXTO: Emissão térmica irregular da estação espacial.

FORMATO OBRIGATÓRIO (JSON):
{
  "question": "Problema de radiação térmica com Lei de Stefan-Boltzmann e valores numéricos",
  "answers": [
    {"text": "Valor A com unidade", "correct": false},
    {"text": "Valor B com unidade", "correct": true},
    {"text": "Valor C com unidade", "correct": false},
    {"text": "Valor D com unidade", "correct": false}
  ],
  "correctFeedback": "Explicação técnica sobre Lei de Stefan-Boltzmann e radiação",
  "incorrectFeedback": "Orientação sobre cálculos de potência radiante"
}

REQUISITOS:
- Use Lei de Stefan-Boltzmann: P = σAT⁴
- Constante de Stefan-Boltzmann
- Temperaturas em Kelvin
- Contexto de equilíbrio térmico espacial`,

        diaryPrompt: "radiação térmica, Lei de Stefan-Boltzmann, corpo negro, emissividade, potência radiante"
    },

    // CAPÍTULO FINAL
    "12": {
        id: "12",
        title: "MISSÃO CUMPRIDA - ESTAÇÃO AURORA SALVA",
        text: `<p class="text-green-400 font-bold text-xl">🎉 PARABÉNS, CADETE!</p>
               <p>Você conseguiu diagnosticar e corrigir todas as falhas críticas da Estação Aurora!</p>
               <p>Graças aos seus conhecimentos de física, a estação está novamente operacional e a tripulação está segura.</p>
               <p class="text-cyan-300 mt-4"><strong>Sistemas Restaurados:</strong></p>
               <ul class="list-disc list-inside mt-2 space-y-1">
                   <li>✅ Sistema Térmico - Termometria</li>
                   <li>✅ Sistema Óptico - Refração</li>
                   <li>✅ Sistema de Ondas - Comunicação</li>
                   <li>✅ Sistema de Calorimetria</li>
                   <li>✅ Sistema de Condução</li>
                   <li>✅ Sistema de Radiação</li>
               </ul>
               <p class="text-yellow-300 mt-4 font-semibold">Sua pontuação final: <span id="final-score">0</span> pontos</p>`,
        image: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        choices: [
            {
                text: "🚀 Iniciar Nova Missão",
                nextSlide: "1"
            }
        ]
    }
};

// Verificar se os dados foram carregados corretamente
if (typeof storyData === 'undefined') {
    console.error('Erro: storyData não foi definido corretamente');
} else {
    console.log('✅ Dados da história carregados com sucesso');
}