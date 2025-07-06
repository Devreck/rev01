# 🚀 Missão: S.O.S. Aurora

Uma aventura interativa de física espacial que usa Inteligência Artificial para criar desafios dinâmicos. Salve a Estação Aurora resolvendo problemas científicos!

## 🎯 Sobre o Projeto

Este é um jogo educativo que combina:
- **Física**: Termologia, Ondas, Óptica e mais
- **IA**: Google Gemini para questões dinâmicas
- **Narrativa**: História espacial envolvente
- **Tecnologia**: HTML5, CSS3, JavaScript ES6+

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Matemática**: MathJax para fórmulas
- **Banco de Dados**: Supabase
- **IA**: Google Gemini API
- **Fontes**: Google Fonts (Orbitron, Roboto Slab)

## 🚀 Como Configurar

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/sos-aurora.git
cd sos-aurora

2. Configure o Supabase
Crie uma conta no 

supabase.com
Crie um novo projeto
Vá em Settings > API para pegar suas credenciais
3. Configure a API do Google Gemini
Acesse o 

makersuite.google.com
Crie uma API Key
Armazene no Supabase (tabela app_config)
4. Crie o arquivo de configuração
Crie um arquivo config.js na raiz do projeto:

const CONFIG = {
    SUPABASE_URL: 'https://seu-projeto.supabase.co',
    SUPABASE_ANON_KEY: 'sua_chave_anonima_aqui',
    GEMINI_API_KEY_LOCAL: null // Apenas para desenvolvimento
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

5. Configure o banco de dados
Execute este SQL no Supabase:
-- Criar tabela de configurações
CREATE TABLE app_config (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(50) UNIQUE NOT NULL,
    key_value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Inserir a API key do Gemini
INSERT INTO app_config (key_name, key_value) 
VALUES ('gemini_api_key', 'sua_api_key_do_gemini_aqui');

6. Execute o projeto
Abra o index.html em um servidor local:
# Usando Python
python -m http.server 8000

# Usando Node.js (se tiver o http-server)
npx http-server

# Usando PHP
php -S localhost:8000

🎮 Como Jogar
Inicie a Missão: Clique em "Assumir o controle"
Diagnósticos: Resolva problemas de física
Use as Ferramentas:
🤖 Comandante: Orientação estratégica
📚 Diário: Teoria detalhada
🎯 E.N.E.M: Desafios extras
📡 Vídeos: Material de apoio
📁 Estrutura do Projeto
sos-aurora/
├── 📄 index.html          # Interface principal
├── 📄 style.css           # Estilos customizados
├── 📄 script.js           # Lógica do jogo
├── 📄 config.js           # Configurações (NÃO commitado)
├── 📄 .gitignore          # Arquivos ignorados
├── 📄 README.md           # Este arquivo
└── 📄 .env.example        # Exemplo de configuração
🔒 Segurança
✅ API keys armazenadas no Supabase
✅ Configurações sensíveis no .gitignore
✅ Validação de entrada
✅ Tratamento de erros robusto
🚨 Solução de Problemas
Erro: "config.js não encontrado"
Verifique se criou o arquivo config.js
Confirme se as credenciais estão corretas
Erro: "I.A. Central indisponível"
Verifique sua API key do Gemini
Confirme a conexão com o Supabase
Erro: "Falha na geração de questões"
Verifique sua cota da API Gemini
Teste a conexão com a internet
🤝 Contribuindo
Fork o projeto
Crie uma branch para sua feature
Commit suas mudanças
Push para a branch
Abra um Pull Request
📝 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

🎓 Créditos
Física: Conteúdo baseado no currículo do Ensino Médio
IA: Powered by Google Gemini
Design: Inspirado em ficção científica
Educação: Focado no aprendizado ativo
Desenvolvido com ❤️ para educação em física


### **3. .env.example** ✅ (Criar)
```env
# Configurações do Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_chave_anonima_aqui

# Para desenvolvimento local (opcional)
GEMINI_API_KEY=sua_api_key_local_aqui

# Instruções:
# 1. Copie este arquivo para config.js
# 2. Substitua os valores pelos seus dados reais
# 3. NUNCA commite o config.js no Git