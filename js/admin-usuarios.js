// ==================== ADMINISTRAÇÃO DE USUÁRIOS ====================
// Sistema Easy Office - DOM Systems v3.0

// Estado de usuários
const AdminState = {
    usuarios: [],
    usuarioEditando: null,
    session: null
};

// ==================== Inicializar Administração ====================
function inicializarAdmin() {
    console.log('🔧 inicializarAdmin() chamado');
    
    // Usar UserManager para carregar usuários
    if (typeof window.UserManager !== 'undefined') {
        AdminState.usuarios = window.UserManager.getAll();
        console.log('✅ Usuários carregados via UserManager:', AdminState.usuarios.length);
    } else {
        // Fallback se UserManager não estiver disponível
        const usuariosArmazenados = localStorage.getItem('mfs_usuarios');
        AdminState.usuarios = JSON.parse(usuariosArmazenados || '[]');
        console.log('⚠️ UserManager não disponível, usando localStorage diretamente');
    }
    
    AdminState.session = JSON.parse(localStorage.getItem('mfs_session') || 'null');
    
    console.log('📊 Usuários carregados:', AdminState.usuarios.length);
    console.log('👤 Sessão atual:', AdminState.session);
    
    // Verificar se é admin
    if (!AdminState.session || !AdminState.session.is_admin) {
        alert('Acesso negado! Apenas administradores podem acessar esta seção.');
        if (typeof navigateTo === 'function') {
            navigateTo('dashboard');
        }
        return false;
    }
    
    console.log('📈 Atualizando estatísticas...');
    atualizarEstatisticasUsuarios();
    
    console.log('📋 Carregando lista de usuários...');
    carregarUsuarios();
    
    // Configurar event listeners se ainda não foram configurados
    if (!adminInitialized) {
        console.log('🎯 Primeira inicialização - configurando event listeners...');
        setupAdminEventListeners();
        adminInitialized = true;
    }
    
    console.log('✅ Administração inicializada com sucesso!');
    return true;
}

// ==================== Atualizar Estatísticas ====================
function atualizarEstatisticasUsuarios() {
    const total = AdminState.usuarios.length;
    const ativos = AdminState.usuarios.filter(u => u.ativo).length;
    const admins = AdminState.usuarios.filter(u => u.is_admin && u.ativo).length;
    
    document.getElementById('totalUsuarios').textContent = total;
    document.getElementById('usuariosAtivos').textContent = ativos;
    document.getElementById('usuariosAdmin').textContent = admins;
}

// ==================== Carregar Lista de Usuários ====================
function carregarUsuarios(filtro = '') {
    console.log('📋 carregarUsuarios() chamado, filtro:', filtro);
    
    // CRÍTICO: SEMPRE recarregar via UserManager
    if (typeof window.UserManager !== 'undefined') {
        AdminState.usuarios = window.UserManager.getAll();
        console.log('✅ Recarregado via UserManager:', AdminState.usuarios.length);
    } else {
        const usuariosLS = localStorage.getItem('mfs_usuarios');
        if (usuariosLS) {
            AdminState.usuarios = JSON.parse(usuariosLS);
            console.log('🔄 AdminState recarregado do localStorage:', AdminState.usuarios.length);
        }
    }
    
    console.log('👥 AdminState.usuarios:', AdminState.usuarios);
    
    const tbody = document.getElementById('usuariosTableBody');
    
    if (!tbody) {
        console.error('❌ Elemento usuariosTableBody não encontrado!');
        console.log('🔍 Seção administracao visível?', document.getElementById('administracao')?.style.display);
        return;
    }
    
    console.log('✅ Elemento usuariosTableBody encontrado:', tbody);
    
    // CORREÇÃO: Se não há usuários, criar admin automaticamente
    if (AdminState.usuarios.length === 0) {
        console.warn('⚠️ AdminState.usuarios está vazio! Criando admin...');
        const adminUser = {
            id: 'USR-001',
            nome: 'Olenir',
            email: 'admin',
            senha: 'admin01',
            primeiro_acesso: false,
            is_admin: true,
            ativo: true,
            created_at: Date.now()
        };
        AdminState.usuarios.push(adminUser);
        localStorage.setItem('mfs_usuarios', JSON.stringify(AdminState.usuarios));
        console.log('✅ Admin criado automaticamente:', adminUser);
    }
    
    let usuariosFiltrados = AdminState.usuarios;
    console.log('👥 Total de usuários:', usuariosFiltrados.length);
    
    // Aplicar filtro
    if (filtro) {
        const f = filtro.toLowerCase();
        usuariosFiltrados = AdminState.usuarios.filter(u => 
            u.nome.toLowerCase().includes(f) ||
            u.email.toLowerCase().includes(f) ||
            u.id.toLowerCase().includes(f)
        );
        console.log('🔍 Usuários após filtro:', usuariosFiltrados.length);
    }
    
    if (usuariosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum usuário encontrado.</td></tr>';
        console.log('⚠️ Nenhum usuário para exibir');
        return;
    }
    
    console.log('✅ Renderizando', usuariosFiltrados.length, 'usuários');
    
    tbody.innerHTML = usuariosFiltrados.map(usuario => `
        <tr>
            <td><strong>${usuario.id}</strong></td>
            <td>${usuario.nome}</td>
            <td>${usuario.email}</td>
            <td>
                ${usuario.is_admin 
                    ? '<span class="badge badge-primary"><i class="fas fa-user-shield"></i> Admin</span>' 
                    : '<span class="badge badge-secondary"><i class="fas fa-user"></i> Usuário</span>'}
            </td>
            <td>
                ${usuario.ativo 
                    ? '<span class="badge badge-success"><i class="fas fa-check-circle"></i> Ativo</span>' 
                    : '<span class="badge badge-danger"><i class="fas fa-times-circle"></i> Inativo</span>'}
            </td>
            <td>
                <button class="btn-icon btn-primary" onclick="editarUsuario('${usuario.id}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-warning" onclick="abrirResetSenha('${usuario.id}')" title="Resetar Senha">
                    <i class="fas fa-key"></i>
                </button>
                ${!usuario.is_admin || AdminState.usuarios.filter(u => u.is_admin && u.ativo).length > 1 
                    ? `<button class="btn-icon btn-danger" onclick="excluirUsuario('${usuario.id}')" title="Excluir">
                        <i class="fas fa-trash"></i>
                       </button>`
                    : '<button class="btn-icon" disabled title="Não pode excluir o único admin"><i class="fas fa-ban"></i></button>'}
            </td>
        </tr>
    `).join('');
}

// ==================== Buscar Usuários ====================
document.getElementById('searchUsuarios')?.addEventListener('input', function() {
    carregarUsuarios(this.value);
});

// ==================== Gerar ID de Usuário ====================
function gerarIdUsuario() {
    if (AdminState.usuarios.length === 0) return 'USR-001';
    
    const ultimoId = AdminState.usuarios[AdminState.usuarios.length - 1].id;
    const numero = parseInt(ultimoId.replace('USR-', '')) + 1;
    return `USR-${String(numero).padStart(3, '0')}`;
}

// ==================== Abrir Modal Novo Usuário ====================
function abrirModalUsuario() {
    console.log('📝 abrirModalUsuario() chamado');
    console.log('   AdminState:', AdminState);
    
    AdminState.usuarioEditando = null;
    
    const modalTitle = document.getElementById('modalUsuarioTitle');
    const formUsuario = document.getElementById('formUsuario');
    const usuarioId = document.getElementById('usuarioId');
    const usuarioNome = document.getElementById('usuarioNome');
    const usuarioEmail = document.getElementById('usuarioEmail');
    const usuarioSenhaInicial = document.getElementById('usuarioSenhaInicial');
    const usuarioAtivo = document.getElementById('usuarioAtivo');
    const usuarioIsAdmin = document.getElementById('usuarioIsAdmin');
    const modal = document.getElementById('modalUsuario');
    
    if (!modal) {
        console.error('❌ Modal modalUsuario não encontrado!');
        alert('Erro: Modal de usuário não encontrado. Recarregue a página.');
        return;
    }
    
    // Limpar formulário
    if (modalTitle) modalTitle.textContent = 'Novo Usuário';
    if (formUsuario) formUsuario.reset();
    if (usuarioId) usuarioId.value = '';
    if (usuarioNome) usuarioNome.value = '';
    if (usuarioEmail) usuarioEmail.value = '';
    if (usuarioSenhaInicial) usuarioSenhaInicial.value = '';
    if (usuarioAtivo) usuarioAtivo.checked = true;
    if (usuarioIsAdmin) usuarioIsAdmin.checked = false;
    
    modal.classList.add('active');
    console.log('✅ Modal aberto com sucesso');
    console.log('✅ Formulário limpo e pronto para novo usuário');
}

// ==================== Configurar Event Listener ====================
document.getElementById('btnNovoUsuario')?.addEventListener('click', abrirModalUsuario);

// ==================== Editar Usuário ====================
function editarUsuario(id) {
    const usuario = AdminState.usuarios.find(u => u.id === id);
    if (!usuario) return;
    
    AdminState.usuarioEditando = usuario;
    
    document.getElementById('modalUsuarioTitle').textContent = 'Editar Usuário';
    document.getElementById('usuarioId').value = usuario.id;
    document.getElementById('usuarioNome').value = usuario.nome;
    document.getElementById('usuarioEmail').value = usuario.email;
    document.getElementById('usuarioSenhaInicial').value = usuario.senha;
    document.getElementById('usuarioAtivo').checked = usuario.ativo;
    document.getElementById('usuarioIsAdmin').checked = usuario.is_admin;
    
    document.getElementById('modalUsuario').classList.add('active');
}

// ==================== Salvar Usuário ====================
function salvarUsuario() {
    console.log('💾 Salvando usuário...');
    
    const id = document.getElementById('usuarioId').value;
    const nome = document.getElementById('usuarioNome').value.trim();
    const email = document.getElementById('usuarioEmail').value.trim();
    const senha = document.getElementById('usuarioSenhaInicial').value;
    const isAdmin = document.getElementById('usuarioIsAdmin').checked;
    const ativo = document.getElementById('usuarioAtivo').checked;
    
    console.log('📋 Dados capturados:', { id, nome, email, senha: '***', isAdmin, ativo });
    
    // Validações
    if (!nome || !email || !senha) {
        console.warn('⚠️ Validação falhou: campos obrigatórios vazios');
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    if (senha.length < 6) {
        console.warn('⚠️ Validação falhou: senha muito curta');
        alert('A senha deve ter no mínimo 6 caracteres.');
        return;
    }
    
    // Verificar email duplicado
    const emailExiste = AdminState.usuarios.some(u => 
        u.email.toLowerCase() === email.toLowerCase() && u.id !== id
    );
    
    if (emailExiste) {
        console.warn('⚠️ Validação falhou: email duplicado');
        alert('Este email já está cadastrado para outro usuário.');
        return;
    }
    
    console.log('✅ Validações OK');
    
    if (id) {
        console.log('📝 Editando usuário existente:', id);
        
        // Usar UserManager se disponível
        if (typeof window.UserManager !== 'undefined') {
            const sucesso = window.UserManager.update(id, {
                nome,
                email,
                senha,
                is_admin: isAdmin,
                ativo
            });
            
            if (!sucesso) {
                alert('Erro ao atualizar usuário!');
                return;
            }
        } else {
            // Fallback: atualizar diretamente
            const index = AdminState.usuarios.findIndex(u => u.id === id);
            AdminState.usuarios[index] = {
                ...AdminState.usuarios[index],
                nome,
                email,
                senha,
                is_admin: isAdmin,
                ativo,
                updated_at: Date.now()
            };
            localStorage.setItem('mfs_usuarios', JSON.stringify(AdminState.usuarios));
        }
        
        console.log('✅ Usuário atualizado');
        
        // Atualizar sessão se for o próprio usuário
        if (AdminState.session.id === id) {
            AdminState.session.nome = nome;
            AdminState.session.email = email;
            AdminState.session.is_admin = isAdmin;
            localStorage.setItem('mfs_session', JSON.stringify(AdminState.session));
            document.getElementById('userName').textContent = nome;
        }
    } else {
        console.log('➕ Criando novo usuário');
        
        const novoUsuario = {
            nome,
            email,
            senha,
            primeiro_acesso: true,
            is_admin: isAdmin,
            ativo
        };
        
        // Usar UserManager se disponível
        if (typeof window.UserManager !== 'undefined') {
            const sucesso = window.UserManager.add(novoUsuario);
            
            if (!sucesso) {
                alert('Erro ao criar usuário! Email já cadastrado?');
                return;
            }
        } else {
            // Fallback: adicionar diretamente
            novoUsuario.id = gerarIdUsuario();
            novoUsuario.created_at = Date.now();
            AdminState.usuarios.push(novoUsuario);
            localStorage.setItem('mfs_usuarios', JSON.stringify(AdminState.usuarios));
        }
        
        console.log('✅ Novo usuário criado');
    }
    
    // Recarregar lista via UserManager
    if (typeof window.UserManager !== 'undefined') {
        AdminState.usuarios = window.UserManager.getAll();
    }
    
    // Atualizar UI
    console.log('🔄 Fechando modal e atualizando UI...');
    fecharModalUsuario();
    atualizarEstatisticasUsuarios();
    carregarUsuarios();
    
    console.log('✅ Usuário salvo com sucesso!');
    alert('Usuário salvo com sucesso!');
}

// ==================== Fechar Modal Usuário ====================
function fecharModalUsuario() {
    document.getElementById('modalUsuario').classList.remove('active');
    document.getElementById('formUsuario').reset();
    AdminState.usuarioEditando = null;
}

// ==================== Toggle Senha Inicial ====================
function toggleSenhaInicial() {
    const input = document.getElementById('usuarioSenhaInicial');
    const icon = event.target;
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// ==================== Resetar Senha ====================
function abrirResetSenha(id) {
    const usuario = AdminState.usuarios.find(u => u.id === id);
    if (!usuario) return;
    
    document.getElementById('resetUsuarioId').value = id;
    document.getElementById('resetNovaSenha').value = '';
    document.getElementById('modalResetSenha').classList.add('active');
}

document.getElementById('formResetSenha')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('resetUsuarioId').value;
    const novaSenha = document.getElementById('resetNovaSenha').value;
    
    if (novaSenha.length < 6) {
        alert('A senha deve ter no mínimo 6 caracteres.');
        return;
    }
    
    const usuario = AdminState.usuarios.find(u => u.id === id);
    if (!usuario) {
        alert('Usuário não encontrado.');
        return;
    }
    
    // Resetar senha
    usuario.senha = novaSenha;
    usuario.primeiro_acesso = true; // Forçar troca
    
    // Salvar
    localStorage.setItem('mfs_usuarios', JSON.stringify(AdminState.usuarios));
    
    fecharModalResetSenha();
    carregarUsuarios();
    
    alert(`Senha resetada com sucesso!\n\nO usuário "${usuario.nome}" deverá trocar a senha no próximo acesso.`);
});

function fecharModalResetSenha() {
    document.getElementById('modalResetSenha').classList.remove('active');
    document.getElementById('formResetSenha').reset();
}

// ==================== Excluir Usuário ====================
function excluirUsuario(id) {
    const usuario = AdminState.usuarios.find(u => u.id === id);
    if (!usuario) return;
    
    // Verificar se é o último admin
    if (usuario.is_admin && usuario.ativo) {
        const adminsAtivos = AdminState.usuarios.filter(u => u.is_admin && u.ativo).length;
        if (adminsAtivos <= 1) {
            alert('Não é possível excluir o último administrador ativo do sistema.');
            return;
        }
    }
    
    // Verificar se é o próprio usuário
    if (usuario.id === AdminState.session.id) {
        alert('Você não pode excluir sua própria conta.');
        return;
    }
    
    if (!confirm(`Deseja realmente excluir o usuário "${usuario.nome}"?\n\nEsta ação não pode ser desfeita.`)) {
        return;
    }
    
    // Remover
    AdminState.usuarios = AdminState.usuarios.filter(u => u.id !== id);
    
    // Salvar
    localStorage.setItem('mfs_usuarios', JSON.stringify(AdminState.usuarios));
    
    // Atualizar UI
    atualizarEstatisticasUsuarios();
    carregarUsuarios();
    
    alert('Usuário excluído com sucesso!');
}

// ==================== Exportar para uso global ====================
function exportarFuncoes() {
    if (typeof window !== 'undefined') {
        window.inicializarAdmin = inicializarAdmin;
        window.abrirModalUsuario = abrirModalUsuario;
        window.salvarUsuario = salvarUsuario;
        window.editarUsuario = editarUsuario;
        window.abrirResetSenha = abrirResetSenha;
        window.excluirUsuario = excluirUsuario;
        window.fecharModalUsuario = fecharModalUsuario;
        window.fecharModalResetSenha = fecharModalResetSenha;
        window.toggleSenhaInicial = toggleSenhaInicial;
        window.carregarUsuarios = carregarUsuarios;
        window.AdminState = AdminState;
        
        console.log('✅ Funções de admin exportadas para window');
        console.log('   - abrirModalUsuario:', typeof window.abrirModalUsuario);
        console.log('   - inicializarAdmin:', typeof window.inicializarAdmin);
        console.log('   - carregarUsuarios:', typeof window.carregarUsuarios);
    }
}

// Exportar imediatamente quando o script carregar
exportarFuncoes();
console.log('🚀 admin-usuarios.js carregado e funções exportadas');

// ==================== Event Listeners ====================
let adminInitialized = false;

function setupAdminEventListeners() {
    console.log('🎯 Configurando event listeners da administração...');
    
    // Busca de usuários
    const searchInput = document.getElementById('searchUsuarios');
    if (searchInput) {
        searchInput.removeEventListener('input', handleSearchUsuarios);
        searchInput.addEventListener('input', handleSearchUsuarios);
        console.log('✅ Busca de usuários configurada');
    } else {
        console.warn('⚠️ searchUsuarios não encontrado');
    }
    
    // Botão novo usuário
    const btnNovoUsuario = document.getElementById('btnNovoUsuario');
    if (btnNovoUsuario) {
        btnNovoUsuario.removeEventListener('click', abrirModalUsuario);
        btnNovoUsuario.addEventListener('click', abrirModalUsuario);
        console.log('✅ Botão novo usuário configurado');
    } else {
        console.warn('⚠️ btnNovoUsuario não encontrado');
    }
    
    // Form usuário
    const formUsuario = document.getElementById('formUsuario');
    if (formUsuario) {
        formUsuario.removeEventListener('submit', handleFormUsuarioSubmit);
        formUsuario.addEventListener('submit', handleFormUsuarioSubmit);
        console.log('✅ Form usuário configurado');
    } else {
        console.warn('⚠️ formUsuario não encontrado');
    }
    
    // Form reset senha
    const formResetSenha = document.getElementById('formResetSenha');
    if (formResetSenha) {
        formResetSenha.removeEventListener('submit', handleFormResetSenhaSubmit);
        formResetSenha.addEventListener('submit', handleFormResetSenhaSubmit);
        console.log('✅ Form reset senha configurado');
    } else {
        console.warn('⚠️ formResetSenha não encontrado');
    }
}

// ==================== Event Handlers ====================
function handleSearchUsuarios(e) {
    carregarUsuarios(e.target.value);
}

function handleFormUsuarioSubmit(e) {
    e.preventDefault();
    salvarUsuario();
}

function handleFormResetSenhaSubmit(e) {
    e.preventDefault();
    resetarSenha();
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 admin-usuarios.js carregado');
    exportarFuncoes();
});
