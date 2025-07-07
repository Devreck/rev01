// ===================================================================================
// SISTEMA DE AUTENTICAÇÃO
// ===================================================================================

class AuthSystem {
    constructor() {
        this.currentStudent = null;
        this.loginOverlay = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        this.loginOverlay = document.getElementById('login-overlay');
        this.setupEventListeners();
        
        // Verificar se há sessão salva
        const savedSession = localStorage.getItem('aurora_session');
        if (savedSession) {
            try {
                const session = JSON.parse(savedSession);
                if (session.student) {
                    // Verificar se o estudante ainda existe no banco
                    const student = await this.getStudentByMatricula(session.student.matricula);
                    if (student) {
                        this.currentStudent = student;
                        this.hideLogin();
                        this.updateUI();
                        showSystemMessage(`🚀 Bem-vindo de volta, ${student.nome}!`, 'success');
                    } else {
                        this.clearSession();
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar sessão:', error);
                this.clearSession();
            }
        }
        
        // Mostrar login se não estiver logado
        if (!this.currentStudent) {
            this.showLogin();
        }
        
        this.initialized = true;
    }

    setupEventListeners() {
        const loginForm = document.getElementById('login-form');
        const logoutBtn = document.getElementById('logout-btn');

        loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        logoutBtn.addEventListener('click', () => this.logout());
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const matricula = document.getElementById('matricula').value.trim();
        const loginBtn = document.getElementById('login-btn');
        const messageEl = document.getElementById('login-message');

        if (!matricula) {
            this.showMessage('Por favor, digite sua matrícula.', 'error');
            return;
        }

        // Validar formato da matrícula (opcional)
        if (!/^\d{4,10}$/.test(matricula)) {
            this.showMessage('Matrícula deve conter apenas números (4-10 dígitos).', 'error');
            return;
        }

        loginBtn.disabled = true;
        loginBtn.innerHTML = '<div class="loader"></div> Verificando matrícula...';
        messageEl.innerHTML = '';

        try {
            // Buscar estudante pela matrícula
            const student = await this.getStudentByMatricula(matricula);
            
            if (student) {
                // Estudante encontrado - fazer login
                await this.updateLastLogin(student.id);
                student.last_login = new Date().toISOString();
                
                this.currentStudent = student;
                this.saveSession();
                
                // Mostrar boas-vindas personalizada
                this.showMessage(`Bem-vindo de volta, ${student.nome}!`, 'success');
                this.showStudentInfo(student);
                
                setTimeout(() => {
                    this.hideLogin();
                    this.updateUI();
                    showSystemMessage(`🚀 Cadete ${student.nome} reportando para o serviço!`, 'success');
                    
                    // ✅ INICIAR O JOGO APÓS LOGIN
                    if (typeof renderSlide === 'function') {
                        renderSlide('1');
                    }
                }, 2500);
                
            } else {
                // Estudante não encontrado
                this.showMessage('Matrícula não encontrada no sistema da Academia Espacial.', 'error');
                this.showRegistrationPrompt(matricula);
            }

        } catch (error) {
            console.error('Erro no login:', error);
            this.showMessage('Erro de conexão com a base central. Verifique sua internet.', 'error');
        } finally {
            loginBtn.disabled = false;
            loginBtn.innerHTML = 'Acessar Sistema';
        }
    }

    showRegistrationPrompt(matricula) {
        const messageEl = document.getElementById('login-message');
        messageEl.innerHTML = `
            <div class="login-error">
                <p><strong>Matrícula não encontrada!</strong></p>
                <p>Esta matrícula não está registrada no sistema.</p>
                <p>Entre em contato com o administrador para registrar a matrícula <strong>${matricula}</strong>.</p>
            </div>
        `;
    }

    logout() {
        this.currentStudent = null;
        this.clearSession();
        this.showLogin();
        this.updateUI();
        showSystemMessage('👋 Logout realizado com sucesso.', 'info');
        
        // Reiniciar o jogo
        if (typeof renderSlide === 'function') {
            renderSlide('1');
        }
    }

    async getStudentByMatricula(matricula) {
        try {
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .eq('matricula', matricula)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = not found
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Erro ao buscar estudante:', error);
            return null;
        }
    }

    async updateLastLogin(studentId) {
        try {
            const { error } = await supabase
                .from('students')
                .update({ last_login: new Date().toISOString() })
                .eq('id', studentId);

            if (error) throw error;
        } catch (error) {
            console.error('Erro ao atualizar último login:', error);
        }
    }

    async saveProgress(progress, score) {
        if (!this.currentStudent) return;

        try {
            const { error } = await supabase
                .from('students')
                .update({
                    current_progress: progress,
                    total_score: score
                })
                .eq('id', this.currentStudent.id);

            if (error) throw error;
            
            // Atualizar dados locais
            this.currentStudent.current_progress = progress;
            this.currentStudent.total_score = score;
            this.saveSession();
            
        } catch (error) {
            console.error('Erro ao salvar progresso:', error);
        }
    }

    async loadProgress() {
        if (!this.currentStudent) return null;

        try {
            const { data, error } = await supabase
                .from('students')
                .select('current_progress, total_score')
                .eq('id', this.currentStudent.id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao carregar progresso:', error);
            return null;
        }
    }

    saveSession() {
        const session = {
            student: this.currentStudent,
            timestamp: Date.now()
        };
        localStorage.setItem('aurora_session', JSON.stringify(session));
    }

    clearSession() {
        localStorage.removeItem('aurora_session');
    }

    showLogin() {
        if (this.loginOverlay) {
            this.loginOverlay.style.display = 'flex';
        }
    }

    hideLogin() {
        if (this.loginOverlay) {
            this.loginOverlay.style.display = 'none';
        }
    }

    updateUI() {
        const studentDisplay = document.getElementById('student-display');
        const logoutBtn = document.getElementById('logout-btn');

        if (this.currentStudent) {
            studentDisplay.textContent = `${this.currentStudent.nome.toUpperCase()} (${this.currentStudent.matricula})`;
            logoutBtn.style.display = 'inline-block';
        } else {
            studentDisplay.textContent = 'NÃO LOGADO';
            logoutBtn.style.display = 'none';
        }
    }

    showMessage(message, type) {
        const messageEl = document.getElementById('login-message');
        messageEl.className = `login-message login-${type}`;
        messageEl.textContent = message;
    }

    showStudentInfo(student) {
        const infoEl = document.getElementById('student-info');
        const lastLogin = student.last_login ? new Date(student.last_login).toLocaleString('pt-BR') : 'Primeiro acesso';
        
        infoEl.innerHTML = `
            <h4>🎯 Cadete Identificado</h4>
            <p><strong>Nome:</strong> ${student.nome}</p>
            <p><strong>Matrícula:</strong> ${student.matricula}</p>
            <p><strong>Turma:</strong> ${student.turma || 'Não informada'}</p>
            <p><strong>Pontuação Total:</strong> ${student.total_score || 0} pontos</p>
            <p><strong>Último Acesso:</strong> ${lastLogin}</p>
            <p class="text-cyan-300 mt-2">🚀 <strong>Iniciando sistemas da Estação Aurora...</strong></p>
        `;
        infoEl.style.display = 'block';
    }

    getCurrentStudent() {
        return this.currentStudent;
    }

    isLoggedIn() {
        return this.currentStudent !== null;
    }
}

// Instância global do sistema de autenticação
const authSystem = new AuthSystem();