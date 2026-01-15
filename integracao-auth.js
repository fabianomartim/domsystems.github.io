// ==================== AUTENTICAÇÃO E CONTROLE DE ACESSO ====================
// Sistema Easy Office - DOM Systems v3.0

(function() {
    'use strict';

    // ==================== Verificação de Sessão ====================
    function verificarSessao() {
        const session = localStorage.getItem('mfs_session');
        
        // Se não há sessão e não está na página de login/trocar senha
        if (!session) {
            const currentPage = window.location.pathname;
            if (currentPage.indexOf('index.html') === -1 && 
                currentPage.indexOf('trocar-senha.html') === -1 &&
                !currentPage.endsWith('/')) {
                window.location.href = 'index.html';
                return false;
            }
            return false;
        }
        
        const sessionData = JSON.parse(session);
        
        // Atualizar nome do usuário no header
        setTimeout(() => {
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = sessionData.nome || 'Usuário';
                console.log('Nome do usuário atualizado:', sessionData.nome);
            }
        }, 100);
        
        // Mostrar menu de administração se for admin
        setTimeout(() => {
            const adminElements = document.querySelectorAll('.admin-only');
            if (sessionData.is_admin === true) {
                console.log('Usuário é ADMIN - mostrando menu Administração');
                adminElements.forEach(el => {
                    el.classList.remove('hide-admin');
                });
            } else {
                console.log('Usuário NÃO é admin - ocultando menu Administração');
                adminElements.forEach(el => {
                    el.classList.add('hide-admin');
                });
            }
        }, 100);
        
        return sessionData;
    }

    // ==================== Inicializar Usuários ====================
    function inicializarUsuariosStorage() {
        console.log('🔧 Inicializando storage de usuários...');
        
        // Usar UserManager se disponível
        if (typeof window.UserManager !== 'undefined') {
            const usuarios = window.UserManager.getAll();
            console.log('✅ Usuários carregados via UserManager:', usuarios.length);
            return;
        }
        
        // Fallback: verificação manual
        let usuarios = [];
        const usuariosLS = localStorage.getItem('mfs_usuarios');
        
        if (usuariosLS) {
            try {
                usuarios = JSON.parse(usuariosLS);
                console.log('📊 Usuários carregados do localStorage:', usuarios.length);
            } catch (e) {
                console.error('❌ Erro ao parsear usuários, criando lista nova:', e);
                usuarios = [];
            }
        } else {
            console.log('⚠️ localStorage mfs_usuarios vazio');
        }
        
        // APENAS verificar se admin existe (não adicionar automaticamente)
        const adminExiste = usuarios.some(u => u.id === 'USR-001' || u.email === 'admin');
        
        if (!adminExiste) {
            console.log('⚠️ Admin não encontrado - será criado pelo UserManager');
        } else {
            console.log('✅ Admin já existe no sistema');
        }
        
        // Verificação final
        console.log('🔍 Verificação final - Total de usuários:', usuarios.length);
    }

    // ==================== Configurar Logout ====================
    function configurarLogout() {
        const btnLogout = document.getElementById('btnLogout');
        if (btnLogout) {
            btnLogout.addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm('Deseja realmente sair do sistema?')) {
                    localStorage.removeItem('mfs_session');
                    window.location.href = 'index.html';
                }
            });
            console.log('Logout configurado');
        }
    }

    // ==================== Configurar Menu Items ====================
    function configurarMenuItems() {
        const menuItems = document.querySelectorAll('.menu-item');
        console.log('🔧 Configurando', menuItems.length, 'itens de menu...');
        
        menuItems.forEach((item, index) => {
            const section = item.getAttribute('data-section');
            console.log(`   ${index + 1}. ${section}`);
            
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                const section = this.getAttribute('data-section');
                console.log('👆 CLIQUE detectado! Navegando para seção:', section);
                
                // Verificar permissão para admin
                if (section === 'administracao') {
                    const session = JSON.parse(localStorage.getItem('mfs_session') || 'null');
                    if (!session || session.is_admin !== true) {
                        alert('Acesso negado! Apenas administradores podem acessar esta seção.');
                        return;
                    }
                }
                
                // Remover active de todos
                document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
                
                // Adicionar active no clicado
                this.classList.add('active');
                
                // Ocultar todas as seções
                document.querySelectorAll('.content-section').forEach(s => {
                    s.classList.remove('active');
                    s.style.display = 'none';
                });
                
                // Mostrar seção selecionada
                const selectedSection = document.getElementById(section);
                if (selectedSection) {
                    selectedSection.classList.add('active');
                    selectedSection.style.display = 'block';
                }
                
                // Atualizar título da página
                const pageTitle = document.getElementById('pageTitle');
                if (pageTitle) {
                    const titles = {
                        'dashboard': 'Dashboard',
                        'clientes': 'Clientes',
                        'ordens': 'Ordens de Serviço',
                        'servicos': 'Tipos de Serviço',
                        'importar': 'Importar/Exportar',
                        'administracao': 'Administração de Usuários'
                    };
                    pageTitle.textContent = titles[section] || 'Sistema';
                }
                
                // Se for administração, inicializar
                if (section === 'administracao') {
                    console.log('🎯 Acessando seção Administração - aguardando 300ms...');
                    if (typeof window.inicializarAdmin === 'function') {
                        // Aumentar timeout para garantir que elementos estão prontos
                        setTimeout(() => {
                            console.log('🚀 Chamando inicializarAdmin()...');
                            window.inicializarAdmin();
                        }, 300);
                    } else {
                        console.error('❌ inicializarAdmin não encontrado!');
                    }
                }
            });
        });
        console.log('Menu items configurados');
    }

    // ==================== Configurar Menu Mobile ====================
    function configurarMenuMobile() {
        const btnMenu = document.getElementById('btnMenu');
        const sidebar = document.querySelector('.sidebar');
        
        if (btnMenu && sidebar) {
            btnMenu.addEventListener('click', function() {
                sidebar.classList.toggle('active');
            });
        }
    }

    // ==================== Adicionar Estilos ====================
    function adicionarEstilos() {
        const stylesAuth = `
            .badge {
                display: inline-flex;
                align-items: center;
                gap: 0.25rem;
                padding: 0.25rem 0.75rem;
                border-radius: 9999px;
                font-size: 0.75rem;
                font-weight: 600;
                white-space: nowrap;
            }
            
            .badge-primary {
                background-color: rgba(37, 99, 235, 0.1);
                color: #2563eb;
            }
            
            .badge-secondary {
                background-color: rgba(100, 116, 139, 0.1);
                color: #64748b;
            }
            
            .badge-success {
                background-color: rgba(16, 185, 129, 0.1);
                color: #10b981;
            }
            
            .badge-danger {
                background-color: rgba(239, 68, 68, 0.1);
                color: #ef4444;
            }
            
            .badge-warning {
                background-color: rgba(245, 158, 11, 0.1);
                color: #f59e0b;
            }
            
            .text-center {
                text-align: center;
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = stylesAuth;
        document.head.appendChild(styleSheet);
    }

    // ==================== Inicialização Principal ====================
    function inicializar() {
        console.log('=== Iniciando sistema de autenticação ===');
        
        // Inicializar usuários
        inicializarUsuariosStorage();
        
        // Verificar sessão
        const session = verificarSessao();
        if (!session) {
            console.log('Sem sessão - usuário não logado');
            return;
        }
        
        console.log('Sessão encontrada:', session);
        
        // Configurar funcionalidades
        configurarLogout();
        configurarMenuItems();
        configurarMenuMobile();
        adicionarEstilos();
        
        console.log('=== Sistema de autenticação inicializado ===');
    }

    // ==================== Executar quando DOM carregar ====================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializar);
    } else {
        inicializar();
    }

    // Também tentar após window.load para garantir
    window.addEventListener('load', function() {
        setTimeout(() => {
            verificarSessao(); // Verificar novamente após tudo carregar
        }, 200);
    });

})();
