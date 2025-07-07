// ===================================================================================
// SISTEMA DE AUTENTICAÇÃO
// ===================================================================================

class AuthSystem {
    constructor() {
        this.currentStudent = null;
        this.isGuest = false;
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
                if (session.isGuest) {
                    this.loginAsGuest();
                } else if (session.student) {
                    // Verificar se o estudante ainda existe no banco
                    const student = await this.getStudentByMatricula(session.student.matricula);
                    if (student) {
                        this.currentStudent = student;
                        this.hideLogin();
                        this.updateUI();
                    } else {
                        this.clearSession();
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar sessão:', error);
                this.clearSession();
            }
        }
        
        // Mostrar login se necessário
        if (CONFIG.REQUIRE_LOGIN && !this.currentStudent && !this.isGuest) {
            this.showLogin();
        } else if (!CONFIG.REQUIRE_LOGIN) {
            this.hideLogin();
        }
        
        this.initialized = true;
    }

    setupEventListeners() {
        const loginForm = document.getElementById('login-form');
        const guestBtn = document.getElementById('guest-btn');
        const logoutBtn = document.getElementById('logout-btn');

        loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        guestBtn.addEventListener('click', () => this.loginAsGuest());
        logoutBtn.addEventListener('click', () => this.logout());

        // Mostrar/ocultar botão de visitante
        if (!CONFIG.ALLOW_GUEST_MODE) {
            guestBtn.style.display = 'none';
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const matricula = document.getElementById('matricula').value.trim();
        const nome = document.getElementById('nome').value.trim();
        const loginBtn = document.getElementById('login-btn');
        const messageEl = document.getElementById('login-message');

        if (!matricula || !nome) {
            this.showMessage('Por favor, preencha todos os campos.', 'error');
            return;
        }

        loginBtn.disabled = true;
        loginBtn.innerHTML = '<div class="loader"></div> Verificando...';
        messageEl.innerHTML = '';

        try {
            // Verificar se o estudante existe
            let student = await this.getStudentByMatricula(matricula);
            
            if (student) {
                // Estudante existe, verificar nome
                if (student.nome.toLowerCase() !== nome.toLowerCase()) {
                    this.showMessage('Nome não confere com a matrícula informada.', 'error');
                    return;
                }
                
                // Atualizar último login
                await this.updateLastLogin(student.id);
                student.last_login = new Date().toISOString();
            } else {
                // Estudante não existe, criar novo
                student = await this.createStudent(matricula, nome);
                if (!student) {
                    this.showMessage('Erro ao criar registro do estudante. Tente novamente.', 'error');
                    return;
                }
            }

            // Login bem-sucedido
            this.currentStudent = student;
            this.saveSession();
            this.showMessage('Login realizado com sucesso!', 'success');
            this.showStudentInfo(student);
            
            setTimeout(() => {
                this.hideLogin();
                this.updateUI();
            }, 2000);

        } catch (error) {
            console.error('Erro no login:', error);
            this.showMessage('Erro de conexão. Verifique sua internet e tente novamente.', 'error');
        } finally {
            loginBtn.disabled = false;
            loginBtn.innerHTML = 'Iniciar Missão';
        }
    }

    loginAsGuest() {
        this.isGuest = true;
        this.currentStudent = null;
        this.saveSession();
        this.hideLogin();
        this.updateUI();
        showSystemMessage('🎮 Modo visitante ativado. Progresso não será salvo.', 'info');
    }

    logout() {
        this.currentStudent = null;
        this.isGuest = false;
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

    async createStudent(matricula, nome) {
        try {
            const { data, error } = await supabase
                .from('students')
                .insert([
                    {
                        matricula: matricula,
                        nome: nome,
                        created_at: new Date().toISOString(),
                        last_login: new Date().toISOString()
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao criar estudante:', error);
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
        if (this.isGuest || !this.currentStudent) return;

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
        if (this.isGuest || !this.currentStudent) return null;

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
            isGuest: this.isGuest,
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

        if (this.isGuest) {
            studentDisplay.textContent = 'VISITANTE';
            logoutBtn.style.display = 'none';
        } else if (this.currentStudent) {
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
        infoEl.innerHTML = `
            <h4>Cadete Identificado</h4>
            <p><strong>Nome:</strong> ${student.nome}</p>
            <p><strong>Matrícula:</strong> ${student.matricula}</p>
            <p><strong>Turma:</strong> ${student.turma || 'Não informada'}</p>
            <p><strong>Pontuação Total:</strong> ${student.total_score || 0}</p>
            <p><strong>Último Acesso:</strong> ${student.last_login ? new Date(student.last_login).toLocaleString('pt-BR') : 'Primeiro acesso'}</p>
        `;
        infoEl.style.display = 'block';
    }

    getCurrentStudent() {
        return this.currentStudent;
    }

    isLoggedIn() {
        return this.currentStudent !== null || this.isGuest;
    }

    isGuestMode() {
        return this.isGuest;
    }
}

// Instância global do sistema de autenticação
const authSystem = new AuthSystem();