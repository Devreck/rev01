Missão: S.O.S. Aurora - Uma Aventura de Física
1. Visão Geral da Missão
Missão: S.O.S. Aurora é um jogo educacional interativo projetado como uma aventura de ficção científica. O jogador assume o papel de um(a) Cadete de Engenharia a bordo de uma estação espacial em crise. Para salvar a estação e sua tripulação, o jogador deve resolver uma série de desafios baseados em conceitos de física, abrangendo Termologia, Ondulatória e Óptica.

Este projeto foi desenvolvido para ser uma ferramenta de aprendizado gamificada, combinando uma narrativa imersiva com a geração dinâmica de problemas através da API do Google Gemini, além de um banco de questões pré-definidas para garantir a cobertura de tópicos específicos.

2. Funcionalidades e Protocolos
O simulador de treinamento inclui os seguintes sistemas:

Estrutura Narrativa Modular: A missão é dividida em capítulos, e cada capítulo contém blocos de diagnóstico temáticos (ex: Termometria, Calorimetria). O jogador deve completar todos os desafios de um bloco para marcá-lo como concluído.

Geração Dinâmica de Desafios: Utiliza a API do Google Gemini para criar problemas de física conceituais e de cálculo em tempo real, garantindo uma alta rejogabilidade.

Variabilidade de Desafios: A I.A. é instruída a criar diferentes contextos e a aleatorizar os parâmetros das questões para que a solução não seja sempre a mesma.

Sistema de Dificuldade Adaptativa: O jogador pode solicitar versões "mais fáceis" ou "mais difíceis" de um desafio, e a I.A. ajustará a complexidade do problema, não apenas os valores numéricos.

Banco de Questões: Permite a inclusão de questões pré-definidas (incluindo texto, tabelas e gráficos SVG) diretamente no código, que podem ser sorteadas junto com as questões geradas pela I.A.

Sistema de Assistência em Camadas:

Consultar o diário de bordo: Fornece uma explicação teórica detalhada sobre os conceitos físicos envolvidos.

Verificar com o comandante: Oferece uma orientação estratégica, com as fórmulas e o passo a passo da resolução, mas sem os valores numéricos.

Gamificação: Inclui um sistema de pontuação que recompensa acertos e penaliza erros, incentivando a precisão.

Interface Futurista: O design e a tipografia foram escolhidos para criar uma atmosfera imersiva de ficção científica.

3. Arquitetura do Projeto
O sistema é organizado em três arquivos principais para facilitar a manutenção e a escalabilidade:

index.html: Contém a estrutura principal da interface do usuário (UI), incluindo os contêineres para o jogo, os modais de ajuda e os displays de informação.

style.css: Responsável por toda a estilização visual do projeto, garantindo uma aparência coesa e imersiva.

script.js: O cérebro da missão. Contém toda a lógica do jogo, incluindo:

O banco de dados da história (storyData).

O gerenciamento de estado do jogo (progresso, pontuação).

As funções de renderização dos slides e dos desafios.

A comunicação com a API do Google Gemini.

A lógica para os botões de ajuda e modais.

4. Como Executar a Missão
Execução Local
Para testar o simulador em seu próprio computador, basta abrir o arquivo index.html em qualquer navegador web moderno.

Implantação em Servidor Externo (GitHub Pages, etc.)
Para que a missão funcione em um servidor web, é essencial fornecer uma chave de API para autenticar as chamadas à I.A. do Google.

Obtenha sua Chave de API:

Acesse o Google AI Studio.

Faça login com sua conta Google.

Clique em "Get API key" e depois em "Create API key in new project".

Copie a chave gerada. Trate esta chave como uma senha.

Insira a Chave no Código:

Abra o arquivo script.js.

Localize a constante API_KEY no topo do arquivo.

Substitua o texto "SUA_CHAVE_API_VAI_AQUI" pela sua chave.

// ANTES
const API_KEY = "SUA_CHAVE_API_VAI_AQUI";

// DEPOIS
const API_KEY = "AIzaSyB...letras...e...numeros"; 

Faça o Upload: Envie os três arquivos (index.html, style.css, script.js) para o seu servidor ou repositório do GitHub e ative o GitHub Pages.

5. Como Contribuir e Customizar
A arquitetura modular foi projetada para facilitar a expansão da missão.

Adicionar Novos Desafios: Para adicionar um novo desafio a um bloco existente, basta criar um novo objeto de slide isDiagnosis:!0 e encadeá-lo usando a propriedade nextSlideInBlock no slide anterior.

Adicionar Questões ao Banco: Para adicionar uma questão pré-definida, localize o slide de diagnóstico desejado no storyData e adicione um novo objeto ao seu questionBank. Você pode usar os formatos question (texto simples) ou questionHTML (para tabelas e gráficos).

Adicionar Novos Blocos ou Capítulos: Siga a estrutura dos objetos isHub:!0 para criar novos painéis de missão e conecte-os através da propriedade nextChapterSlide.

Fim da transmissão.
