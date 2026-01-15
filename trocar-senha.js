// ==================== Trocar Senha - JavaScript ====================

// Estado
const TrocarSenhaState = {
    session: JSON.parse(localStorage.getItem('mfs_session') || 'null'),
    usuarios: JSON.parse(localStorage.getItem('mfs_usuarios') || '[]')
};

// ==================== Verificar Sessão ====================
function verificarSessao() {
    if (!TrocarSenhaState.session) {
        window.location.href = 'index.html';
        return false;
    }
    
    if (!TrocarSenhaState.session.primeiro_acesso) {
        // Não precisa trocar senha
        window.location.href = 'dashboard.html';
        return false;
    }
    
    return true;
}

// ==================== Toggle Password ====================
document.querySelectorAll('.password-toggle').forEach(toggle => {
    toggle.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        
        if (input.type === 'password') {
            input.type = 'text';
            this.classList.remove('fa-eye');
            this.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
        }
    });
});

// ==================== Validação de Força da Senha ====================
function calcularForcaSenha(senha) {
    let forca = 0;
    
    if (senha.length >= 6) forca++;
    if (senha.length >= 8) forca++;
    if (/[A-Z]/.test(senha) && /[a-z]/.test(senha)) forca++;
    if (/[0-9]/.test(senha)) forca++;
    if (/[^A-Za-z0-9]/.test(senha)) forca++;
    
    return Math.min(forca, 4);
}

function atualizarForcaSenha(senha) {
    const forca = calcularForcaSenha(senha);
    const bars = document.querySelectorAll('.strength-bar');
    const strengthText = document.getElementById('strengthText');
    
    // Reset
    bars.forEach(bar => {
        bar.classList.remove('active', 'weak', 'medium', 'strong');
    });
    
    // Aplicar força
    let nivel = '';
    let classe = '';
    
    if (forca === 0) {
        nivel = '';
    } else if (forca <= 2) {
        nivel = 'Fraca';
        classe = 'weak';
    } else if (forca === 3) {
        nivel = 'Média';
        classe = 'medium';
    } else {
        nivel = 'Forte';
        classe = 'strong';
    }
    
    for (let i = 0; i < forca; i++) {
        bars[i].classList.add('active', classe);
    }
    
    strengthText.textContent = nivel ? `Força: ${nivel}` : '';
}

// ==================== Validação de Requisitos ====================
function validarRequisitos() {
    const senhaAtual = document.getElementById('senhaAtual').value;
    const novaSenha = document.getElementById('novaSenha').value;
    
    const reqLength = document.getElementById('req-length');
    const reqDifferent = document.getElementById('req-different');
    
    // Mínimo 6 caracteres
    if (novaSenha.length >= 6) {
        reqLength.classList.add('requirement-met');
        reqLength.innerHTML = '<i class="fas fa-check"></i> Mínimo de 6 caracteres';
    } else {
        reqLength.classList.remove('requirement-met');
        reqLength.innerHTML = 'Mínimo de 6 caracteres';
    }
    
    // Diferente da atual
    if (novaSenha && novaSenha !== senhaAtual) {
        reqDifferent.classList.add('requirement-met');
        reqDifferent.innerHTML = '<i class="fas fa-check"></i> Diferente da senha atual';
    } else {
        reqDifferent.classList.remove('requirement-met');
        reqDifferent.innerHTML = 'Diferente da senha atual';
    }
}

// ==================== Event Listeners ====================
document.getElementById('novaSenha').addEventListener('input', function() {
    atualizarForcaSenha(this.value);
    validarRequisitos();
});

document.getElementById('senhaAtual').addEventListener('input', validarRequisitos);

// ==================== Mostrar Erro ====================
function mostrarErro(mensagem) {
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');
    
    errorMessage.textContent = mensagem;
    errorAlert.style.display = 'flex';
    
    setTimeout(() => {
        errorAlert.style.display = 'none';
    }, 5000);
}

// ==================== Submit Form ====================
document.getElementById('passwordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const senhaAtual = document.getElementById('senhaAtual').value;
    const novaSenha = document.getElementById('novaSenha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    
    const btnChange = document.getElementById('btnChange');
    const btnChangeText = document.getElementById('btnChangeText');
    
    // Validações
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
        mostrarErro('Por favor, preencha todos os campos.');
        return;
    }
    
    // Buscar usuário atual
    const usuario = TrocarSenhaState.usuarios.find(u => u.id === TrocarSenhaState.session.id);
    
    if (!usuario) {
        mostrarErro('Usuário não encontrado.');
        return;
    }
    
    // Verificar senha atual
    if (usuario.senha !== senhaAtual) {
        mostrarErro('Senha atual incorreta.');
        return;
    }
    
    // Validar nova senha
    if (novaSenha.length < 6) {
        mostrarErro('A nova senha deve ter no mínimo 6 caracteres.');
        return;
    }
    
    if (novaSenha === senhaAtual) {
        mostrarErro('A nova senha deve ser diferente da senha atual.');
        return;
    }
    
    if (novaSenha !== confirmarSenha) {
        mostrarErro('As senhas não coincidem.');
        return;
    }
    
    // Loading
    btnChange.classList.add('loading');
    btnChangeText.innerHTML = '<span class="spinner"></span>Alterando...';
    
    // Simular delay
    setTimeout(() => {
        // Atualizar senha
        usuario.senha = novaSenha;
        usuario.primeiro_acesso = false;
        
        // Salvar
        localStorage.setItem('mfs_usuarios', JSON.stringify(TrocarSenhaState.usuarios));
        
        // Atualizar sessão
        TrocarSenhaState.session.primeiro_acesso = false;
        localStorage.setItem('mfs_session', JSON.stringify(TrocarSenhaState.session));
        
        // Sucesso
        btnChangeText.innerHTML = '<i class="fas fa-check"></i> Senha Alterada!';
        btnChange.style.background = '#10b981';
        
        // Redirecionar
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    }, 1000);
});

// ==================== Inicialização ====================
window.addEventListener('DOMContentLoaded', () => {
    verificarSessao();
});
