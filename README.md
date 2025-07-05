Missão: S.O.S. Aurora - Uma Aventura de Física
1. Visão Geral da Missão
Missão: S.O.S. Aurora é um jogo educacional interativo projetado como uma aventura de ficção científica. O jogador assume o papel de um(a) Cadete de Engenharia a bordo de uma estação espacial em crise. Para salvar a estação e sua tripulação, o jogador deve resolver uma série de desafios baseados em conceitos de física, abrangendo Termologia, Ondulatória e Óptica.

Este projeto foi desenvolvido para ser uma ferramenta de aprendizado gamificada, combinando uma narrativa imersiva com a geração dinâmica de problemas através da API do Google Gemini.

2. Funcionalidades e Protocolos
O simulador de treinamento inclui os seguintes sistemas:

Estrutura Narrativa Modular: A missão é dividida em capítulos, e cada capítulo contém blocos de diagnóstico temáticos (ex: Termometria, Calorimetria).

Geração Dinâmica de Desafios: Utiliza a API do Google Gemini para criar problemas de física conceituais e de cálculo em tempo real, garantindo uma alta rejogabilidade.

Variabilidade de Desafios: A I.A. é instruída a criar diferentes contextos e a aleatorizar os parâmetros das questões.

Sistema de Dificuldade Adaptativa: O jogador pode solicitar versões "mais fáceis" ou "mais difíceis" de um desafio, e a I.A. ajustará a complexidade.

Sistema de Assistência em Camadas: Inclui opções como "Consultar o diário de bordo" para teoria e "Verificar com o comandante" para dicas estratégicas.

Gamificação: Inclui um sistema de pontuação que recompensa acertos e penaliza erros.

Interface Futurista: O design e a tipografia foram escolhidos para criar uma atmosfera imersiva de ficção científica.

3. Arquitetura do Projeto
O sistema é organizado em três arquivos principais e um backend seguro para facilitar a manutenção e a escalabilidade:

index.html: Contém a estrutura principal da interface do usuário (UI), incluindo os contêineres para o jogo e os modais.

style.css: Responsável por toda a estilização visual do projeto.

script.js: O cérebro da missão. Contém toda a lógica do jogo, o banco de dados da história (storyData) e o gerenciamento de estado. A comunicação com a API do Google Gemini é feita de forma segura através de uma função de proxy no Supabase, sem expor chaves de API no cliente.

supabase/functions/gemini-proxy: Uma função de backend (Edge Function) que atua como um intermediário seguro. Ela recebe a solicitação do script.js, adiciona a chave da API do Google (armazenada de forma segura no Supabase) e repassa a chamada para a API do Gemini.

4. Como Executar a Missão
Para que a missão funcione corretamente, é essencial configurar o backend para autenticar as chamadas à IA do Google de forma segura.

Passo 1: Obtenha sua Chave de API do Google
Acesse o Google AI Studio.

Faça login com sua conta Google.

Clique em "Get API key" e depois em "Create API key in new project".

Copie a chave gerada. Trate esta chave como uma senha e não a compartilhe publicamente.

Passo 2: Configure a Chave de API no Supabase
A chave da API não deve ser colocada no arquivo script.js. Em vez disso, você deve armazená-la como um "secret" no seu projeto Supabase. A função de proxy já está programada para usá-la a partir de lá.

Faça login no seu painel de controle do Supabase.

Navegue até o seu projeto.

No menu lateral, vá para Settings (ícone de engrenagem) e depois para Edge Functions.

Na seção Secrets, clique em Add new secret.

No campo Name, digite exatamente GOOGLE_API_KEY.

No campo Value, cole a sua chave de API do Google que você copiou anteriormente.

Clique em Create Secret.

Passo 3: Implantação
Execução Local: Para testar localmente, você precisará usar a Supabase CLI para executar o projeto e a função de proxy localmente, garantindo que a variável de ambiente (GOOGLE_API_KEY) esteja disponível.

Implantação em Servidor: Faça o upload de todos os arquivos do projeto (index.html, style.css, script.js e a pasta supabase) para o seu provedor de hospedagem (como GitHub Pages, Vercel, etc.). Certifique-se de que suas funções do Supabase também foram implantadas.

5. Como Contribuir e Customizar
A arquitetura modular foi projetada para facilitar a expansão da missão.

Adicionar Novos Desafios: Para adicionar um novo desafio, crie um novo objeto de slide no storyData com isDiagnosis:!0 e conecte-o usando a propriedade nextSlideInBlock no slide anterior.

Adicionar Novos Blocos ou Capítulos: Siga a estrutura dos objetos isHub:!0 para criar novos painéis de missão e conecte-os através da propriedade nextChapterSlide.

Fim da transmissão.

6. Solução de Problemas
Se nenhum desafio for gerado e apenas o texto do slide aparecer, verifique a implantação da função `gemini-proxy` no Supabase e confirme que o segredo `GOOGLE_API_KEY` está definido corretamente. Erros de autenticação com a API do Google impedem a criação das questões e o jogo exibirá somente o conteúdo estático.
