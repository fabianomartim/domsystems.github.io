// ==================== Estado da Aplicação ====================
const AppState = {
    clientes: [],
    ordens: [],
    servicos: [],
    currentSection: 'dashboard',
    chartInstance: null
};

// ==================== Inicialização ====================
document.addEventListener('DOMContentLoaded', async () => {
    initializeApp();
    setupEventListeners();
    await loadData();
    updateDashboard();
});

function initializeApp() {
    const today = new Date().toISOString().split('T')[0];
    const dataOSInput = document.getElementById('dataOS');
    if (dataOSInput) {
        dataOSInput.value = today;
    }
}

function setupEventListeners() {
    // Navegação
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.currentTarget.dataset.section;
            navigateTo(section);
        });
    });

    // Menu mobile
    document.getElementById('btnMenu')?.addEventListener('click', toggleSidebar);

    // Modais - Clientes
    document.getElementById('btnNovoCliente')?.addEventListener('click', () => openClienteModal());
    document.getElementById('btnSalvarCliente')?.addEventListener('click', saveCliente);

    // Modais - Ordens
    document.getElementById('btnNovaOrdem')?.addEventListener('click', () => openOrdemModal());
    document.getElementById('btnSalvarOrdem')?.addEventListener('click', saveOrdem);
    document.getElementById('codigoClienteOS')?.addEventListener('change', updateNomeCliente);

    // Modais - Serviços
    document.getElementById('btnNovoServico')?.addEventListener('click', () => openServicoModal());
    document.getElementById('btnSalvarServico')?.addEventListener('click', saveServico);

    // Busca - Clientes
    document.getElementById('searchClientes')?.addEventListener('input', filterClientes);

    // Filtros - Ordens (avançados)
    document.getElementById('filterNumeroOS')?.addEventListener('input', filterOrdens);
    document.getElementById('filterCliente')?.addEventListener('input', filterOrdens);
    document.getElementById('filterTipoServico')?.addEventListener('change', filterOrdens);
    document.getElementById('filterResponsavel')?.addEventListener('input', filterOrdens);
    document.getElementById('filterDataDe')?.addEventListener('change', filterOrdens);
    document.getElementById('filterDataAte')?.addEventListener('change', filterOrdens);
    document.getElementById('filterStatusOS')?.addEventListener('change', filterOrdens);
    document.getElementById('btnLimparFiltros')?.addEventListener('click', limparFiltrosOrdens);

    // Busca - Serviços
    document.getElementById('searchServicos')?.addEventListener('input', filterServicos);

    // Exportar/Importar
    document.getElementById('btnExportarClientes')?.addEventListener('click', () => exportData('clientes'));
    document.getElementById('btnExportarOrdens')?.addEventListener('click', () => exportData('ordens'));
    document.getElementById('btnExportarServicos')?.addEventListener('click', () => exportData('servicos'));
    document.getElementById('btnExportarTudo')?.addEventListener('click', () => exportData('all'));
    document.getElementById('btnSelecionarArquivo')?.addEventListener('click', () => document.getElementById('fileInput').click());
    document.getElementById('fileInput')?.addEventListener('change', handleFileImport);

    // Upload drag and drop
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.addEventListener('click', () => document.getElementById('fileInput').click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary-color)';
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--border-color)';
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--border-color)';
            const file = e.dataTransfer.files[0];
            if (file) processImportFile(file);
        });
    }
}

// ==================== Navegação ====================
function navigateTo(section) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`)?.classList.add('active');

    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(section)?.classList.add('active');

    const titles = {
        'dashboard': 'Dashboard',
        'clientes': 'Clientes',
        'ordens': 'Ordens de Serviço',
        'servicos': 'Tipos de Serviço',
        'crm': 'CRM - Gestão de Leads',
        'importar': 'Importar/Exportar',
        'administracao': 'Administração de Usuários'
    };
    document.getElementById('pageTitle').textContent = titles[section] || section;

    AppState.currentSection = section;

    if (section === 'clientes') renderClientes();
    if (section === 'ordens') {
        renderOrdens();
        loadTipoServicoFilter();
    }
    if (section === 'servicos') renderServicos();
    if (section === 'dashboard') updateDashboard();
    
    // Inicializar módulo CRM
    if (section === 'crm' && typeof window.inicializarCRM === 'function') {
        setTimeout(() => window.inicializarCRM(), 100);
    }
    
    // CRÍTICO: Inicializar Administração
    if (section === 'administracao') {
        console.log('🎯 Seção Administração detectada no app.js');
        if (typeof window.inicializarAdmin === 'function') {
            console.log('🚀 Chamando inicializarAdmin() via app.js...');
            setTimeout(() => window.inicializarAdmin(), 300);
        } else {
            console.error('❌ inicializarAdmin() não encontrado!');
        }
    }
}

function toggleSidebar() {
    document.querySelector('.sidebar')?.classList.toggle('active');
}

// ==================== Carregar Dados ====================
async function loadData() {
    showLoading();
    try {
        await Promise.all([
            loadClientes(),
            loadOrdens(),
            loadServicos()
        ]);
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showNotification('Erro ao carregar dados', 'error');
    } finally {
        hideLoading();
    }
}

async function loadClientes() {
    try {
        // Primeiro tenta carregar do localStorage
        const clientesLocal = localStorage.getItem('mfs_clientes');
        if (clientesLocal) {
            AppState.clientes = JSON.parse(clientesLocal);
            console.log(`✅ ${AppState.clientes.length} clientes carregados do localStorage`);
            renderClientes();
            return;
        }
        
        // Se não houver no localStorage, tenta da API
        const response = await fetch('tables/clientes?limit=1000&sort=id_cliente');
        const result = await response.json();
        AppState.clientes = result.data || [];
        renderClientes();
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        
        // Em caso de erro, tenta localStorage como fallback
        const clientesLocal = localStorage.getItem('mfs_clientes');
        if (clientesLocal) {
            AppState.clientes = JSON.parse(clientesLocal);
            console.log(`✅ ${AppState.clientes.length} clientes recuperados do localStorage (fallback)`);
            renderClientes();
        } else {
            AppState.clientes = [];
        }
    }
}

async function loadOrdens() {
    try {
        // Primeiro tenta carregar do localStorage
        const ordensLocal = localStorage.getItem('mfs_ordens');
        if (ordensLocal) {
            AppState.ordens = JSON.parse(ordensLocal);
            console.log(`✅ ${AppState.ordens.length} ordens carregadas do localStorage`);
            renderOrdens();
            return;
        }
        
        // Se não houver no localStorage, tenta da API
        const response = await fetch('tables/ordens_servico?limit=1000&sort=-data');
        const result = await response.json();
        AppState.ordens = result.data || [];
        renderOrdens();
    } catch (error) {
        console.error('Erro ao carregar ordens:', error);
        
        // Em caso de erro, tenta localStorage como fallback
        const ordensLocal = localStorage.getItem('mfs_ordens');
        if (ordensLocal) {
            AppState.ordens = JSON.parse(ordensLocal);
            console.log(`✅ ${AppState.ordens.length} ordens recuperadas do localStorage (fallback)`);
            renderOrdens();
        } else {
            AppState.ordens = [];
        }
    }
}

async function loadServicos() {
    try {
        // Primeiro tenta carregar do localStorage
        const servicosLocal = localStorage.getItem('mfs_servicos');
        if (servicosLocal) {
            AppState.servicos = JSON.parse(servicosLocal);
            console.log(`✅ ${AppState.servicos.length} serviços carregados do localStorage`);
            renderServicos();
            return;
        }
        
        // Se não houver no localStorage, tenta da API
        const response = await fetch('tables/tipos_servico?limit=1000&sort=codigo');
        const result = await response.json();
        AppState.servicos = result.data || [];
        renderServicos();
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        
        // Em caso de erro, tenta localStorage como fallback
        const servicosLocal = localStorage.getItem('mfs_servicos');
        if (servicosLocal) {
            AppState.servicos = JSON.parse(servicosLocal);
            console.log(`✅ ${AppState.servicos.length} serviços recuperados do localStorage (fallback)`);
            renderServicos();
        } else {
            AppState.servicos = [];
        }
    }
}

// ==================== Geração de IDs ====================
function generateNextClienteId() {
    if (AppState.clientes.length === 0) {
        return 'CLI-001';
    }
    
    const maxId = AppState.clientes
        .map(c => {
            const match = c.id_cliente?.match(/CLI-(\d+)/);
            return match ? parseInt(match[1]) : 0;
        })
        .reduce((max, num) => Math.max(max, num), 0);
    
    const nextNum = maxId + 1;
    return `CLI-${String(nextNum).padStart(3, '0')}`;
}

function generateNextOrdemId() {
    if (AppState.ordens.length === 0) {
        return 'OS-001';
    }
    
    const maxId = AppState.ordens
        .map(o => {
            const match = o.numero_os?.match(/OS-(\d+)/);
            return match ? parseInt(match[1]) : 0;
        })
        .reduce((max, num) => Math.max(max, num), 0);
    
    const nextNum = maxId + 1;
    return `OS-${String(nextNum).padStart(3, '0')}`;
}

function generateNextServicoCode() {
    if (AppState.servicos.length === 0) {
        return '001';
    }
    
    const maxCode = AppState.servicos
        .map(s => parseInt(s.codigo) || 0)
        .reduce((max, num) => Math.max(max, num), 0);
    
    const nextNum = maxCode + 1;
    return String(nextNum).padStart(3, '0');
}

// ==================== CRUD - Clientes ====================
function openClienteModal(cliente = null) {
    const modal = document.getElementById('modalCliente');
    const form = document.getElementById('formCliente');
    
    form.reset();
    
    if (cliente) {
        document.getElementById('modalClienteTitle').textContent = 'Editar Cliente';
        document.getElementById('clienteId').value = cliente.id;
        document.getElementById('idCliente').value = cliente.id_cliente || '';
        document.getElementById('nomeCliente').value = cliente.nome_cliente || '';
        document.getElementById('enderecoRua').value = cliente.endereco_rua || '';
        document.getElementById('enderecoCidade').value = cliente.endereco_cidade || '';
        document.getElementById('enderecoUF').value = cliente.endereco_uf || '';
        document.getElementById('enderecoZipcode').value = cliente.endereco_zipcode || '';
        document.getElementById('telefone1').value = cliente.telefone1 || '';
        document.getElementById('telefone2').value = cliente.telefone2 || '';
        document.getElementById('emailCliente').value = cliente.email || '';
        document.getElementById('empresa').value = cliente.empresa || '';
        document.getElementById('instrucoes').value = cliente.instrucoes || '';
    } else {
        document.getElementById('modalClienteTitle').textContent = 'Novo Cliente';
        document.getElementById('idCliente').value = generateNextClienteId();
    }
    
    modal.classList.add('active');
}

async function saveCliente() {
    const form = document.getElementById('formCliente');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const clienteId = document.getElementById('clienteId').value;
    const clienteData = {
        id_cliente: document.getElementById('idCliente').value,
        nome_cliente: document.getElementById('nomeCliente').value,
        endereco_rua: document.getElementById('enderecoRua').value,
        endereco_cidade: document.getElementById('enderecoCidade').value,
        endereco_uf: document.getElementById('enderecoUF').value.toUpperCase(),
        endereco_zipcode: document.getElementById('enderecoZipcode').value,
        telefone1: document.getElementById('telefone1').value,
        telefone2: document.getElementById('telefone2').value,
        email: document.getElementById('emailCliente').value,
        empresa: document.getElementById('empresa').value,
        instrucoes: document.getElementById('instrucoes').value
    };

    showLoading();
    try {
        let response;
        if (clienteId) {
            response = await fetch(`tables/clientes/${clienteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clienteData)
            });
        } else {
            response = await fetch('tables/clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clienteData)
            });
        }

        if (response.ok) {
            showNotification(clienteId ? 'Cliente atualizado!' : 'Cliente cadastrado!', 'success');
            closeModal('modalCliente');
            await loadClientes();
            updateDashboard();
        } else {
            throw new Error('Erro ao salvar cliente');
        }
    } catch (error) {
        console.error('Erro ao salvar cliente:', error);
        showNotification('Erro ao salvar cliente', 'error');
    } finally {
        hideLoading();
    }
}

async function deleteCliente(id) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

    showLoading();
    try {
        const response = await fetch(`tables/clientes/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showNotification('Cliente excluído!', 'success');
            await loadClientes();
            updateDashboard();
        } else {
            throw new Error('Erro ao excluir cliente');
        }
    } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        showNotification('Erro ao excluir cliente', 'error');
    } finally {
        hideLoading();
    }
}

function renderClientes(clientesFiltered = null) {
    const tbody = document.getElementById('tbodyClientes');
    const clientes = clientesFiltered || AppState.clientes;

    if (!clientes || clientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="12" class="empty-state">Nenhum cliente cadastrado</td></tr>';
        return;
    }

    tbody.innerHTML = clientes.map(cliente => `
        <tr>
            <td><strong>${escapeHtml(cliente.id_cliente || '')}</strong></td>
            <td>${escapeHtml(cliente.nome_cliente || '')}</td>
            <td>${escapeHtml(cliente.endereco_rua || '-')}</td>
            <td>${escapeHtml(cliente.endereco_cidade || '-')}</td>
            <td>${escapeHtml(cliente.endereco_uf || '-')}</td>
            <td>${escapeHtml(cliente.endereco_zipcode || '-')}</td>
            <td>${formatTelefone(cliente.telefone1 || '')}</td>
            <td>${formatTelefone(cliente.telefone2 || '-')}</td>
            <td>${escapeHtml(cliente.email || '-')}</td>
            <td>${escapeHtml(cliente.empresa || '-')}</td>
            <td title="${escapeHtml(cliente.instrucoes || '-')}">${truncateText(cliente.instrucoes, 30)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon edit" onclick='openClienteModal(${JSON.stringify(cliente).replace(/'/g, "&apos;")})' title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="deleteCliente('${cliente.id}')" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterClientes() {
    const searchTerm = document.getElementById('searchClientes')?.value.toLowerCase() || '';

    const filtered = AppState.clientes.filter(cliente => {
        return !searchTerm || 
            (cliente.id_cliente?.toLowerCase().includes(searchTerm)) ||
            (cliente.nome_cliente?.toLowerCase().includes(searchTerm)) ||
            (cliente.empresa?.toLowerCase().includes(searchTerm)) ||
            (cliente.email?.toLowerCase().includes(searchTerm)) ||
            (cliente.telefone1?.toLowerCase().includes(searchTerm)) ||
            (cliente.endereco_cidade?.toLowerCase().includes(searchTerm));
    });

    renderClientes(filtered);
}

// ==================== CRUD - Ordens de Serviço ====================
async function openOrdemModal(ordem = null) {
    const modal = document.getElementById('modalOrdem');
    const form = document.getElementById('formOrdem');
    
    await loadClientesSelect();
    await loadServicosSelect();
    
    form.reset();
    
    if (ordem) {
        document.getElementById('modalOrdemTitle').textContent = 'Editar Ordem de Serviço';
        document.getElementById('ordemId').value = ordem.id;
        document.getElementById('numeroOS').value = ordem.numero_os || '';
        document.getElementById('dataOS').value = formatDateForInput(ordem.data);
        document.getElementById('codigoClienteOS').value = ordem.codigo_cliente || '';
        document.getElementById('nomeClienteOS').value = ordem.nome_cliente || '';
        document.getElementById('tipoServico').value = ordem.tipo_servico || '';
        document.getElementById('responsavelTecnico').value = ordem.responsavel_tecnico || '';
        document.getElementById('valorOS').value = ordem.valor || '';
        document.getElementById('statusOS').value = ordem.status || 'Pendente';
        document.getElementById('observacaoOS').value = ordem.observacao || '';
    } else {
        document.getElementById('modalOrdemTitle').textContent = 'Nova Ordem de Serviço';
        document.getElementById('numeroOS').value = generateNextOrdemId();
        document.getElementById('statusOS').value = 'Pendente';
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('dataOS').value = today;
    }
    
    modal.classList.add('active');
}

async function loadClientesSelect() {
    const select = document.getElementById('codigoClienteOS');
    select.innerHTML = '<option value="">Selecione um cliente</option>';
    
    AppState.clientes.forEach(cliente => {
        const option = document.createElement('option');
        option.value = cliente.id;
        option.textContent = `${cliente.id_cliente} - ${cliente.nome_cliente}`;
        option.dataset.nome = cliente.nome_cliente;
        option.dataset.idCliente = cliente.id_cliente;
        select.appendChild(option);
    });
}

async function loadServicosSelect() {
    const select = document.getElementById('tipoServico');
    select.innerHTML = '<option value="">Selecione um serviço</option>';
    
    const servicosAtivos = AppState.servicos.filter(s => s.ativo);
    servicosAtivos.forEach(servico => {
        const option = document.createElement('option');
        option.value = servico.nome_servico;
        option.textContent = `${servico.codigo} - ${servico.nome_servico}`;
        select.appendChild(option);
    });
}

function loadTipoServicoFilter() {
    const select = document.getElementById('filterTipoServico');
    if (!select) return;
    
    select.innerHTML = '<option value="">Tipo de Serviço</option>';
    
    const servicosAtivos = AppState.servicos.filter(s => s.ativo);
    servicosAtivos.forEach(servico => {
        const option = document.createElement('option');
        option.value = servico.nome_servico;
        option.textContent = servico.nome_servico;
        select.appendChild(option);
    });
}

function updateNomeCliente() {
    const select = document.getElementById('codigoClienteOS');
    const nomeInput = document.getElementById('nomeClienteOS');
    
    if (select.value) {
        const cliente = AppState.clientes.find(c => c.id === select.value);
        nomeInput.value = cliente ? cliente.nome_cliente : '';
    } else {
        nomeInput.value = '';
    }
}

async function saveOrdem() {
    const form = document.getElementById('formOrdem');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const ordemId = document.getElementById('ordemId').value;
    
    // Obter código do cliente
    const clienteSelect = document.getElementById('codigoClienteOS');
    const selectedOption = clienteSelect.options[clienteSelect.selectedIndex];
    const codigoCliente = selectedOption.dataset.idCliente || '';
    
    const ordemData = {
        numero_os: document.getElementById('numeroOS').value,
        data: document.getElementById('dataOS').value,
        codigo_cliente: codigoCliente,
        nome_cliente: document.getElementById('nomeClienteOS').value,
        tipo_servico: document.getElementById('tipoServico').value,
        responsavel_tecnico: document.getElementById('responsavelTecnico').value,
        valor: parseFloat(document.getElementById('valorOS').value) || 0,
        status: document.getElementById('statusOS').value,
        observacao: document.getElementById('observacaoOS').value
    };

    showLoading();
    try {
        let response;
        if (ordemId) {
            response = await fetch(`tables/ordens_servico/${ordemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ordemData)
            });
        } else {
            response = await fetch('tables/ordens_servico', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ordemData)
            });
        }

        if (response.ok) {
            showNotification(ordemId ? 'OS atualizada!' : 'OS cadastrada!', 'success');
            closeModal('modalOrdem');
            await loadOrdens();
            updateDashboard();
        } else {
            throw new Error('Erro ao salvar ordem');
        }
    } catch (error) {
        console.error('Erro ao salvar ordem:', error);
        showNotification('Erro ao salvar ordem', 'error');
    } finally {
        hideLoading();
    }
}

async function deleteOrdem(id) {
    if (!confirm('Tem certeza que deseja excluir esta ordem de serviço?')) return;

    showLoading();
    try {
        const response = await fetch(`tables/ordens_servico/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showNotification('Ordem excluída!', 'success');
            await loadOrdens();
            updateDashboard();
        } else {
            throw new Error('Erro ao excluir ordem');
        }
    } catch (error) {
        console.error('Erro ao excluir ordem:', error);
        showNotification('Erro ao excluir ordem', 'error');
    } finally {
        hideLoading();
    }
}

function renderOrdens(ordensFiltered = null) {
    const tbody = document.getElementById('tbodyOrdens');
    const ordens = ordensFiltered || AppState.ordens;

    if (!ordens || ordens.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="empty-state">Nenhuma ordem de serviço cadastrada</td></tr>';
        return;
    }

    tbody.innerHTML = ordens.map(ordem => `
        <tr>
            <td><strong>${escapeHtml(ordem.numero_os || '')}</strong></td>
            <td>${formatDate(ordem.data)}</td>
            <td>${escapeHtml(ordem.codigo_cliente || '-')}</td>
            <td>${escapeHtml(ordem.nome_cliente || 'N/A')}</td>
            <td>${escapeHtml(ordem.tipo_servico || '-')}</td>
            <td>${escapeHtml(ordem.responsavel_tecnico || '-')}</td>
            <td>${formatCurrency(ordem.valor)}</td>
            <td><span class="badge badge-${getStatusClass(ordem.status)}">${escapeHtml(ordem.status || 'Pendente')}</span></td>
            <td title="${escapeHtml(ordem.observacao || '-')}">${truncateText(ordem.observacao, 30)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon edit" onclick='openOrdemModal(${JSON.stringify(ordem).replace(/'/g, "&apos;")})' title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="deleteOrdem('${ordem.id}')" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterOrdens() {
    const numeroOS = document.getElementById('filterNumeroOS')?.value.toLowerCase() || '';
    const cliente = document.getElementById('filterCliente')?.value.toLowerCase() || '';
    const tipoServico = document.getElementById('filterTipoServico')?.value || '';
    const responsavel = document.getElementById('filterResponsavel')?.value.toLowerCase() || '';
    const dataDe = document.getElementById('filterDataDe')?.value || '';
    const dataAte = document.getElementById('filterDataAte')?.value || '';
    const status = document.getElementById('filterStatusOS')?.value || '';

    const filtered = AppState.ordens.filter(ordem => {
        const matchNumero = !numeroOS || (ordem.numero_os?.toLowerCase().includes(numeroOS));
        
        const matchCliente = !cliente || 
            (ordem.codigo_cliente?.toLowerCase().includes(cliente)) ||
            (ordem.nome_cliente?.toLowerCase().includes(cliente));
        
        const matchServico = !tipoServico || ordem.tipo_servico === tipoServico;
        const matchResponsavel = !responsavel || (ordem.responsavel_tecnico?.toLowerCase().includes(responsavel));
        const matchStatus = !status || ordem.status === status;
        
        let matchData = true;
        if (dataDe && ordem.data) {
            const ordemDate = new Date(ordem.data);
            const filterDate = new Date(dataDe);
            matchData = ordemDate >= filterDate;
        }
        if (dataAte && ordem.data && matchData) {
            const ordemDate = new Date(ordem.data);
            const filterDate = new Date(dataAte);
            matchData = ordemDate <= filterDate;
        }

        return matchNumero && matchCliente && matchServico && matchResponsavel && matchData && matchStatus;
    });

    renderOrdens(filtered);
}

function limparFiltrosOrdens() {
    document.getElementById('filterNumeroOS').value = '';
    document.getElementById('filterCliente').value = '';
    document.getElementById('filterTipoServico').value = '';
    document.getElementById('filterResponsavel').value = '';
    document.getElementById('filterDataDe').value = '';
    document.getElementById('filterDataAte').value = '';
    document.getElementById('filterStatusOS').value = '';
    renderOrdens();
}

// ==================== CRUD - Tipos de Serviço ====================
function openServicoModal(servico = null) {
    const modal = document.getElementById('modalServico');
    const form = document.getElementById('formServico');
    
    form.reset();
    
    if (servico) {
        document.getElementById('modalServicoTitle').textContent = 'Editar Tipo de Serviço';
        document.getElementById('servicoId').value = servico.id;
        document.getElementById('codigoServico').value = servico.codigo || '';
        document.getElementById('nomeServico').value = servico.nome_servico || '';
        document.getElementById('descricaoServico').value = servico.descricao || '';
        document.getElementById('valorPadrao').value = servico.valor_padrao || '';
        document.getElementById('ativoServico').value = servico.ativo ? 'true' : 'false';
    } else {
        document.getElementById('modalServicoTitle').textContent = 'Novo Tipo de Serviço';
        document.getElementById('codigoServico').value = generateNextServicoCode();
        document.getElementById('ativoServico').value = 'true';
    }
    
    modal.classList.add('active');
}

async function saveServico() {
    const form = document.getElementById('formServico');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const servicoId = document.getElementById('servicoId').value;
    const servicoData = {
        codigo: document.getElementById('codigoServico').value,
        nome_servico: document.getElementById('nomeServico').value,
        descricao: document.getElementById('descricaoServico').value,
        valor_padrao: parseFloat(document.getElementById('valorPadrao').value) || 0,
        ativo: document.getElementById('ativoServico').value === 'true',
        updated_at: Date.now()
    };

    showLoading();
    try {
        // Trabalhar com localStorage diretamente
        if (servicoId) {
            // Atualizar serviço existente
            const index = AppState.servicos.findIndex(s => s.id === servicoId);
            if (index !== -1) {
                AppState.servicos[index] = {
                    ...AppState.servicos[index],
                    ...servicoData
                };
            }
        } else {
            // Criar novo serviço
            const novoServico = {
                id: `SRV-${String(AppState.servicos.length + 1).padStart(3, '0')}`,
                ...servicoData,
                created_at: Date.now()
            };
            AppState.servicos.push(novoServico);
        }
        
        // Salvar no localStorage
        localStorage.setItem('mfs_servicos', JSON.stringify(AppState.servicos));
        
        showNotification(servicoId ? 'Serviço atualizado!' : 'Serviço cadastrado!', 'success');
        closeModal('modalServico');
        renderServicos();
    } catch (error) {
        console.error('Erro ao salvar serviço:', error);
        showNotification('Erro ao salvar serviço', 'error');
    } finally {
        hideLoading();
    }
}

async function deleteServico(id) {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;

    showLoading();
    try {
        // Trabalhar com localStorage diretamente
        AppState.servicos = AppState.servicos.filter(s => s.id !== id);
        
        // Salvar no localStorage
        localStorage.setItem('mfs_servicos', JSON.stringify(AppState.servicos));
        
        showNotification('Serviço excluído!', 'success');
        renderServicos();
    } catch (error) {
        console.error('Erro ao excluir serviço:', error);
        showNotification('Erro ao excluir serviço', 'error');
    } finally {
        hideLoading();
    }
}

function renderServicos(servicosFiltered = null) {
    const tbody = document.getElementById('tbodyServicos');
    const servicos = servicosFiltered || AppState.servicos;

    if (!servicos || servicos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhum serviço cadastrado</td></tr>';
        return;
    }

    tbody.innerHTML = servicos.map(servico => `
        <tr>
            <td><strong>${escapeHtml(servico.codigo || '')}</strong></td>
            <td>${escapeHtml(servico.nome_servico || '')}</td>
            <td>${escapeHtml(servico.descricao || '-')}</td>
            <td>${formatCurrency(servico.valor_padrao)}</td>
            <td><span class="badge badge-${servico.ativo ? 'ativo' : 'inativo'}">${servico.ativo ? 'Ativo' : 'Inativo'}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon edit" onclick='openServicoModal(${JSON.stringify(servico).replace(/'/g, "&apos;")})' title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="deleteServico('${servico.id}')" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterServicos() {
    const searchTerm = document.getElementById('searchServicos')?.value.toLowerCase() || '';

    const filtered = AppState.servicos.filter(servico => {
        return !searchTerm || 
            (servico.codigo?.toLowerCase().includes(searchTerm)) ||
            (servico.nome_servico?.toLowerCase().includes(searchTerm)) ||
            (servico.descricao?.toLowerCase().includes(searchTerm));
    });

    renderServicos(filtered);
}

// ==================== Dashboard ====================
function updateDashboard() {
    const totalClientes = AppState.clientes.length;
    const totalOrdens = AppState.ordens.length;
    const ordensConcluidas = AppState.ordens.filter(o => o.status === 'Concluída').length;
    const ordensAndamento = AppState.ordens.filter(o => o.status === 'Em Andamento' || o.status === 'Pendente').length;

    document.getElementById('totalClientes').textContent = totalClientes;
    document.getElementById('totalOrdens').textContent = totalOrdens;
    document.getElementById('ordensConcluidas').textContent = ordensConcluidas;
    document.getElementById('ordensAndamento').textContent = ordensAndamento;

    renderOrdensRecentes();
    updateChart();
}

function renderOrdensRecentes() {
    const container = document.getElementById('ordensRecentes');
    const ordensRecentes = AppState.ordens
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .slice(0, 5);

    if (ordensRecentes.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma ordem de serviço cadastrada</p>';
        return;
    }

    container.innerHTML = ordensRecentes.map(ordem => `
        <div class="list-item">
            <div class="list-item-info">
                <h4>${escapeHtml(ordem.numero_os || 'N/A')} - ${escapeHtml(ordem.nome_cliente || 'N/A')}</h4>
                <p>${formatDate(ordem.data)} • ${escapeHtml(ordem.tipo_servico || '-')}</p>
            </div>
            <span class="badge badge-${getStatusClass(ordem.status)}">${escapeHtml(ordem.status || 'Pendente')}</span>
        </div>
    `).join('');
}

function updateChart() {
    const ctx = document.getElementById('statusChart');
    if (!ctx) return;

    const statusCount = {
        'Pendente': 0,
        'Em Andamento': 0,
        'Concluída': 0,
        'Cancelada': 0
    };

    AppState.ordens.forEach(ordem => {
        if (statusCount.hasOwnProperty(ordem.status)) {
            statusCount[ordem.status]++;
        }
    });

    if (AppState.chartInstance) {
        AppState.chartInstance.destroy();
    }

    AppState.chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusCount),
            datasets: [{
                data: Object.values(statusCount),
                backgroundColor: [
                    '#f59e0b',
                    '#3b82f6',
                    '#10b981',
                    '#ef4444'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12,
                            family: 'Inter'
                        }
                    }
                }
            }
        }
    });
}

// ==================== Importar/Exportar ====================
function exportData(type) {
    let data, filename;

    if (type === 'clientes') {
        data = AppState.clientes;
        filename = `clientes_${getDateString()}.json`;
    } else if (type === 'ordens') {
        data = AppState.ordens;
        filename = `ordens_servico_${getDateString()}.json`;
    } else if (type === 'servicos') {
        data = AppState.servicos;
        filename = `tipos_servico_${getDateString()}.json`;
    } else {
        data = {
            clientes: AppState.clientes,
            ordens_servico: AppState.ordens,
            tipos_servico: AppState.servicos,
            exportDate: new Date().toISOString()
        };
        filename = `backup_completo_${getDateString()}.json`;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    showNotification('Dados exportados com sucesso!', 'success');
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (file) processImportFile(file);
}

async function processImportFile(file) {
    if (!file.name.endsWith('.json')) {
        showImportStatus('Por favor, selecione um arquivo JSON válido.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = JSON.parse(e.target.result);
            await importData(data);
        } catch (error) {
            console.error('Erro ao importar:', error);
            showImportStatus('Erro ao processar arquivo. Verifique o formato.', 'error');
        }
    };
    reader.readAsText(file);
}

async function importData(data) {
    showLoading();
    let imported = 0;

    try {
        if (Array.isArray(data) && data[0]?.nome_cliente) {
            for (const cliente of data) {
                await importCliente(cliente);
                imported++;
            }
            showImportStatus(`${imported} clientes importados!`, 'success');
        }
        else if (Array.isArray(data) && data[0]?.numero_os) {
            for (const ordem of data) {
                await importOrdem(ordem);
                imported++;
            }
            showImportStatus(`${imported} ordens importadas!`, 'success');
        }
        else if (Array.isArray(data) && data[0]?.nome_servico) {
            for (const servico of data) {
                await importServico(servico);
                imported++;
            }
            showImportStatus(`${imported} serviços importados!`, 'success');
        }
        else if (data.clientes || data.ordens_servico || data.tipos_servico) {
            let total = 0;
            if (data.clientes) {
                for (const cliente of data.clientes) {
                    await importCliente(cliente);
                }
                total += data.clientes.length;
            }
            if (data.ordens_servico) {
                for (const ordem of data.ordens_servico) {
                    await importOrdem(ordem);
                }
                total += data.ordens_servico.length;
            }
            if (data.tipos_servico) {
                for (const servico of data.tipos_servico) {
                    await importServico(servico);
                }
                total += data.tipos_servico.length;
            }
            showImportStatus(`Backup completo importado: ${total} registros!`, 'success');
        } else {
            throw new Error('Formato de arquivo não reconhecido');
        }

        await loadData();
        updateDashboard();
    } catch (error) {
        console.error('Erro ao importar dados:', error);
        showImportStatus('Erro ao importar: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function importCliente(clienteData) {
    const { id, gs_project_id, gs_table_name, created_at, updated_at, ...cleanData } = clienteData;
    await fetch('tables/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData)
    });
}

async function importOrdem(ordemData) {
    const { id, gs_project_id, gs_table_name, created_at, updated_at, ...cleanData } = ordemData;
    await fetch('tables/ordens_servico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData)
    });
}

async function importServico(servicoData) {
    const { id, gs_project_id, gs_table_name, created_at, updated_at, ...cleanData } = servicoData;
    await fetch('tables/tipos_servico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData)
    });
}

function showImportStatus(message, type) {
    const statusDiv = document.getElementById('importStatus');
    statusDiv.textContent = message;
    statusDiv.className = `import-status ${type}`;
    setTimeout(() => {
        statusDiv.className = 'import-status';
    }, 5000);
}

// ==================== Utilidades ====================
function closeModal(modalId) {
    document.getElementById(modalId)?.classList.remove('active');
}

function showLoading() {
    document.getElementById('loadingOverlay')?.classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingOverlay')?.classList.remove('active');
}

function showNotification(message, type = 'info') {
    alert(message);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

function truncateText(text, maxLength) {
    if (!text) return '-';
    if (text.length <= maxLength) return escapeHtml(text);
    return escapeHtml(text.substring(0, maxLength)) + '...';
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

function formatCurrency(value) {
    if (!value && value !== 0) return '$ 0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}

function formatTelefone(telefone) {
    if (!telefone || telefone === '-') return '-';
    const cleaned = telefone.replace(/\D/g, '');
    
    // Formato USA: (XXX) XXX-XXXX
    if (cleaned.length === 10) {
        return cleaned.replace(/^(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } 
    // Formato USA com código internacional: +1 (XXX) XXX-XXXX
    else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        return cleaned.replace(/^1(\d{3})(\d{3})(\d{4})/, '+1 ($1) $2-$3');
    }
    // Retorna o número como está se não for formato reconhecido
    return telefone;
}

function getStatusClass(status) {
    const map = {
        'Pendente': 'pendente',
        'Em Andamento': 'andamento',
        'Concluída': 'concluida',
        'Cancelada': 'cancelada'
    };
    return map[status] || 'pendente';
}

function getDateString() {
    const now = new Date();
    return now.toISOString().split('T')[0].replace(/-/g, '');
}

// ==================== Funcionalidades Mobile ====================

// Detecta se é dispositivo móvel
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Fecha sidebar ao clicar em item do menu (mobile)
function setupMobileMenuBehavior() {
    if (isMobileDevice()) {
        const menuItems = document.querySelectorAll('.menu-item');
        const sidebar = document.querySelector('.sidebar');
        
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                // Fecha sidebar após 300ms
                setTimeout(() => {
                    if (window.innerWidth <= 1024) {
                        sidebar.classList.remove('active');
                    }
                }, 300);
            });
        });
    }
}

// Previne zoom indesejado em inputs no iOS
function preventIOSZoom() {
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            // iOS não dá zoom se font-size >= 16px
            const currentSize = window.getComputedStyle(input).fontSize;
            if (parseFloat(currentSize) < 16) {
                input.style.fontSize = '16px';
            }
        });
    }
}

// Adiciona suporte a gestos de swipe para fechar sidebar
function setupSwipeGestures() {
    if (!isMobileDevice()) return;
    
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    let touchStartX = 0;
    let touchEndX = 0;
    
    // Detecta swipe para esquerda na sidebar (fecha)
    sidebar.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    sidebar.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    // Detecta swipe para direita no conteúdo (abre)
    mainContent.addEventListener('touchstart', (e) => {
        if (e.changedTouches[0].screenX < 50) { // Apenas se começar da borda
            touchStartX = e.changedTouches[0].screenX;
        }
    }, { passive: true });
    
    mainContent.addEventListener('touchend', (e) => {
        if (touchStartX < 50) {
            touchEndX = e.changedTouches[0].screenX;
            if (touchEndX - touchStartX > 100) { // Swipe mínimo de 100px
                sidebar.classList.add('active');
            }
        }
    }, { passive: true });
    
    function handleSwipe() {
        const swipeDistance = touchStartX - touchEndX;
        if (Math.abs(swipeDistance) > 100) { // Swipe mínimo de 100px
            if (swipeDistance > 0) { // Swipe para esquerda
                sidebar.classList.remove('active');
            }
        }
    }
}

// Fecha sidebar ao clicar fora (mobile)
function setupClickOutside() {
    if (!isMobileDevice()) return;
    
    const sidebar = document.querySelector('.sidebar');
    const btnMenu = document.querySelector('.btn-menu');
    const mainContent = document.querySelector('.main-content');
    
    mainContent.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024 && sidebar.classList.contains('active')) {
            if (!sidebar.contains(e.target) && !btnMenu.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
}

// Melhora scroll em tabelas no mobile
function setupTableScroll() {
    const tableContainers = document.querySelectorAll('.table-container');
    
    tableContainers.forEach(container => {
        let isScrolling = false;
        
        container.addEventListener('touchstart', () => {
            isScrolling = true;
        }, { passive: true });
        
        container.addEventListener('touchend', () => {
            isScrolling = false;
        }, { passive: true });
        
        // Adiciona indicador visual de scroll disponível
        if (isMobileDevice()) {
            const table = container.querySelector('.data-table');
            if (table && table.scrollWidth > container.clientWidth) {
                container.style.position = 'relative';
                container.style.paddingRight = '10px';
                
                // Adiciona sombra para indicar que há mais conteúdo
                const scrollIndicator = document.createElement('div');
                scrollIndicator.className = 'scroll-indicator';
                scrollIndicator.style.cssText = `
                    position: absolute;
                    right: 0;
                    top: 0;
                    bottom: 0;
                    width: 30px;
                    background: linear-gradient(to left, rgba(0,0,0,0.1), transparent);
                    pointer-events: none;
                `;
                container.appendChild(scrollIndicator);
                
                // Remove indicador ao scrollar até o final
                container.addEventListener('scroll', () => {
                    const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;
                    scrollIndicator.style.opacity = isAtEnd ? '0' : '1';
                });
            }
        }
    });
}

// Otimiza performance em mobile
function optimizeMobilePerformance() {
    if (!isMobileDevice()) return;
    
    // Reduz animações em dispositivos mais lentos
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        document.documentElement.style.setProperty('--transition', 'all 0.2s ease');
    }
    
    // Lazy loading para gráficos
    const chartSection = document.querySelector('.chart-section');
    if (chartSection && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateDashboard();
                    observer.disconnect();
                }
            });
        });
        observer.observe(chartSection);
    }
}

// Feedback tátil para ações importantes (se suportado)
function provideTactileFeedback() {
    if ('vibrate' in navigator && isMobileDevice()) {
        // Vibra ao salvar
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', () => {
                navigator.vibrate(50); // Vibração curta
            });
        });
        
        // Vibra ao excluir
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-danger')) {
                navigator.vibrate([30, 20, 30]); // Padrão de alerta
            }
        });
    }
}

// Melhora experiência de formulários em mobile
function improveMobileForms() {
    // Adiciona botão "Done" visual em iOS
    const inputs = document.querySelectorAll('input[type="number"], input[type="tel"]');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            // Scroll suave para o input focado
            setTimeout(() => {
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });
    });
    
    // Melhora datepickers em mobile
    const dateInputs = document.querySelectorAll('input[type="date"]');
    if (isMobileDevice()) {
        dateInputs.forEach(input => {
            // Usa picker nativo em mobile
            input.setAttribute('pattern', '[0-9]{4}-[0-9]{2}-[0-9]{2}');
        });
    }
}

// Adiciona indicador de conexão online
function addOnlineIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'online-indicator';
    indicator.innerHTML = '<i class="fas fa-cloud"></i> Online';
    indicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 0.875rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    
    // Ajusta posição em mobile
    if (isMobileDevice()) {
        indicator.style.bottom = '10px';
        indicator.style.right = '10px';
        indicator.style.fontSize = '0.75rem';
        indicator.style.padding = '6px 12px';
    }
    
    document.body.appendChild(indicator);
    
    // Esconde após 3 segundos
    setTimeout(() => {
        indicator.style.transition = 'opacity 0.5s';
        indicator.style.opacity = '0';
        setTimeout(() => indicator.remove(), 500);
    }, 3000);
}

// Inicializa todas as funcionalidades mobile
function initMobileFeatures() {
    if (isMobileDevice()) {
        console.log('📱 Dispositivo móvel detectado - Ativando otimizações...');
    }
    
    setupMobileMenuBehavior();
    preventIOSZoom();
    setupSwipeGestures();
    setupClickOutside();
    setupTableScroll();
    optimizeMobilePerformance();
    provideTactileFeedback();
    improveMobileForms();
    addOnlineIndicator();
}

// Adiciona ao evento DOMContentLoaded existente
window.addEventListener('load', () => {
    initMobileFeatures();
});

// ==================== Máscara de Telefone USA ====================
function aplicarMascaraTelefoneUSA(input) {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 10) {
            value = value.substring(0, 10);
        }
        
        let formatted = '';
        if (value.length > 0) {
            formatted = '(' + value.substring(0, 3);
            if (value.length >= 3) {
                formatted += ') ' + value.substring(3, 6);
            }
            if (value.length >= 6) {
                formatted += '-' + value.substring(6, 10);
            }
        }
        
        e.target.value = formatted;
    });
    
    input.addEventListener('keydown', function(e) {
        // Permite: backspace, delete, tab, escape, enter
        if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
            // Permite: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true) ||
            // Permite: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            return;
        }
        // Garante que é um número
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });
}

// Aplica máscara aos campos de telefone quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    const telefone1 = document.getElementById('telefone1');
    const telefone2 = document.getElementById('telefone2');
    
    if (telefone1) aplicarMascaraTelefoneUSA(telefone1);
    if (telefone2) aplicarMascaraTelefoneUSA(telefone2);
});
