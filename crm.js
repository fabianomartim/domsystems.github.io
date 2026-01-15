/**
 * CRM - Módulo Único de Gestão de Leads
 * Versão: 3.1.6
 * DOM Systems - Easy Office
 */

// Estado global do CRM
const CRMState = {
    leads: [],
    leadEditando: null,
    filtros: {
        busca: '',
        estagio: 'todos',
        classificacao: 'todos',
        fonte: 'todos'
    },
    ordenacao: {
        campo: 'created_at',
        direcao: 'desc'
    }
};

/**
 * Inicializa o módulo CRM
 */
function inicializarCRM() {
    console.log('🚀 Inicializando módulo CRM v3.1.2');
    
    carregarLeadsCRM();
    configurarEventosCRM();
    atualizarEstatisticasCRM();
    
    console.log('✅ Módulo CRM inicializado');
}

/**
 * Carrega leads do localStorage
 */
function carregarLeadsCRM() {
    try {
        const dados = localStorage.getItem('mfs_crm_leads');
        CRMState.leads = dados ? JSON.parse(dados) : [];
        
        console.log(`📊 ${CRMState.leads.length} leads carregados`);
        
        renderizarLeads();
    } catch (error) {
        console.error('❌ Erro ao carregar leads:', error);
        CRMState.leads = [];
    }
}

/**
 * Salva leads no localStorage
 */
function salvarLeadsCRM() {
    try {
        localStorage.setItem('mfs_crm_leads', JSON.stringify(CRMState.leads));
        console.log('✅ Leads salvos com sucesso');
    } catch (error) {
        console.error('❌ Erro ao salvar leads:', error);
        alert('Erro ao salvar leads. Tente novamente.');
    }
}

/**
 * Gera ID único para lead
 */
function gerarIdLead() {
    const ultimoId = CRMState.leads.length > 0 
        ? Math.max(...CRMState.leads.map(l => {
            const num = parseInt(l.id_lead.replace('LEAD-', ''));
            return isNaN(num) ? 0 : num;
        }))
        : 0;
    
    const novoId = (ultimoId + 1).toString().padStart(4, '0');
    return `LEAD-${novoId}`;
}

/**
 * Configura eventos da interface
 */
function configurarEventosCRM() {
    console.log('🔧 Configurando eventos CRM...');
    
    // Botão Novo Lead
    const btnNovoLead = document.getElementById('btnNovoLead');
    if (btnNovoLead) {
        btnNovoLead.addEventListener('click', () => {
            console.log('🖱️ Botão Novo Lead clicado');
            CRMState.leadEditando = null;
            abrirModalLead();
        });
        console.log('✅ Botão Novo Lead configurado');
    } else {
        console.warn('⚠️ Botão #btnNovoLead não encontrado');
    }
    
    // Busca de leads
    const searchLeads = document.getElementById('searchLeads');
    if (searchLeads) {
        searchLeads.addEventListener('input', (e) => {
            CRMState.filtros.busca = e.target.value.toLowerCase();
            renderizarLeads();
        });
    }
    
    // Filtros
    const filterEstagio = document.getElementById('filterEstagio');
    if (filterEstagio) {
        filterEstagio.addEventListener('change', (e) => {
            CRMState.filtros.estagio = e.target.value;
            renderizarLeads();
        });
    }
    
    const filterClassificacao = document.getElementById('filterClassificacao');
    if (filterClassificacao) {
        filterClassificacao.addEventListener('change', (e) => {
            CRMState.filtros.classificacao = e.target.value;
            renderizarLeads();
        });
    }
    
    const filterFonte = document.getElementById('filterFonte');
    if (filterFonte) {
        filterFonte.addEventListener('change', (e) => {
            CRMState.filtros.fonte = e.target.value;
            renderizarLeads();
        });
    }
    
    // Formulário de lead
    const formLead = document.getElementById('formLead');
    if (formLead) {
        formLead.addEventListener('submit', (e) => {
            e.preventDefault();
            salvarLead();
        });
        console.log('✅ Formulário de lead configurado');
    } else {
        console.warn('⚠️ Formulário #formLead não encontrado');
    }
    
    console.log('✅ Eventos CRM configurados');
}

/**
 * Abre modal de lead
 */
function abrirModalLead(lead = null) {
    console.log('🔓 Abrindo modal de lead...');
    
    const modal = document.getElementById('modalLead');
    const titulo = document.getElementById('modalLeadTitle');
    const form = document.getElementById('formLead');
    
    if (!modal) {
        console.error('❌ Modal #modalLead não encontrado');
        alert('Erro: Modal não encontrado');
        return;
    }
    
    if (lead) {
        // Edição
        if (titulo) titulo.textContent = 'Editar Lead';
        CRMState.leadEditando = lead;
        
        // Preencher formulário
        document.getElementById('leadIdAuto').value = lead.id_lead || '';
        document.getElementById('leadNome').value = lead.nome || '';
        document.getElementById('leadEmpresa').value = lead.empresa || '';
        document.getElementById('leadCargo').value = lead.cargo || '';
        document.getElementById('leadEmail').value = lead.email || '';
        document.getElementById('leadEmailAlternativo').value = lead.email_alternativo || '';
        document.getElementById('leadCelular').value = lead.celular || '';
        document.getElementById('leadTelefoneComercial').value = lead.telefone_comercial || '';
        document.getElementById('leadEnderecoRua').value = lead.endereco_rua || '';
        document.getElementById('leadCidade').value = lead.cidade || '';
        document.getElementById('leadEstado').value = lead.estado || '';
        document.getElementById('leadCEP').value = lead.cep || '';
        
        // Dados da Oportunidade
        document.getElementById('leadNomeProposta').value = lead.nome_proposta || '';
        document.getElementById('leadValorEstimado').value = lead.valor_estimado || '';
        document.getElementById('leadEstagio').value = lead.estagio || 'Prospecção';
        document.getElementById('leadProbabilidade').value = lead.probabilidade || 50;
        document.getElementById('leadDataFechamento').value = lead.data_fechamento || '';
        document.getElementById('leadResponsavel').value = lead.responsavel || '';
        document.getElementById('leadDescricao').value = lead.descricao || '';
        
        // Dados Adicionais
        document.getElementById('leadFonte').value = lead.fonte || 'Indicação';
        document.getElementById('leadClassificacao').value = lead.classificacao || 'Prospect';
        document.getElementById('leadPreferenciaComunicacao').value = lead.preferencia_comunicacao || 'Email';
        document.getElementById('leadDataNascimento').value = lead.data_nascimento || '';
        document.getElementById('leadWebsite').value = lead.website || '';
        document.getElementById('leadRedesSociais').value = lead.redes_sociais || '';
    } else {
        // Novo lead
        if (titulo) titulo.textContent = 'Novo Lead';
        if (form) form.reset();
        
        // Gerar ID automático
        const novoId = gerarIdLead();
        document.getElementById('leadIdAuto').value = novoId;
        
        // Valores padrão
        document.getElementById('leadEstagio').value = 'Prospecção';
        document.getElementById('leadClassificacao').value = 'Prospect';
        document.getElementById('leadProbabilidade').value = '50';
        document.getElementById('leadPreferenciaComunicacao').value = 'Email';
        document.getElementById('leadFonte').value = 'Indicação';
    }
    
    modal.style.display = 'flex';
    console.log('✅ Modal aberto');
}

/**
 * Fecha modal de lead
 */
function fecharModalLead() {
    const modal = document.getElementById('modalLead');
    if (modal) {
        modal.style.display = 'none';
    }
    CRMState.leadEditando = null;
}

/**
 * Salva lead (criar ou editar)
 */
function salvarLead() {
    console.log('💾 Salvando lead...');
    
    const nome = document.getElementById('leadNome').value.trim();
    const email = document.getElementById('leadEmail').value.trim();
    const nomeProposta = document.getElementById('leadNomeProposta').value.trim();
    const valorEstimado = document.getElementById('leadValorEstimado').value;
    const estagio = document.getElementById('leadEstagio').value;
    
    // Validações básicas
    if (!nome) {
        alert('Por favor, informe o nome completo do lead.');
        return;
    }
    
    if (!email) {
        alert('Por favor, informe o email do lead.');
        return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Por favor, informe um email válido.');
        return;
    }
    
    if (!nomeProposta) {
        alert('Por favor, informe o nome da proposta.');
        return;
    }
    
    if (!valorEstimado || valorEstimado <= 0) {
        alert('Por favor, informe um valor estimado válido.');
        return;
    }
    
    const novoLead = {
        // Dados Pessoais
        nome: nome,
        empresa: document.getElementById('leadEmpresa').value.trim(),
        cargo: document.getElementById('leadCargo').value.trim(),
        
        // Contato
        email: email,
        email_alternativo: document.getElementById('leadEmailAlternativo').value.trim(),
        celular: document.getElementById('leadCelular').value.trim(),
        telefone_comercial: document.getElementById('leadTelefoneComercial').value.trim(),
        preferencia_comunicacao: document.getElementById('leadPreferenciaComunicacao').value,
        
        // Endereço
        endereco_rua: document.getElementById('leadEnderecoRua').value.trim(),
        cidade: document.getElementById('leadCidade').value.trim(),
        estado: document.getElementById('leadEstado').value.trim(),
        cep: document.getElementById('leadCEP').value.trim(),
        
        // Oportunidade
        nome_proposta: nomeProposta,
        valor_estimado: parseFloat(valorEstimado),
        estagio: estagio,
        probabilidade: parseInt(document.getElementById('leadProbabilidade').value) || 50,
        data_fechamento: document.getElementById('leadDataFechamento').value,
        responsavel: document.getElementById('leadResponsavel').value.trim(),
        descricao: document.getElementById('leadDescricao').value.trim(),
        
        // Informações Adicionais
        fonte: document.getElementById('leadFonte').value,
        classificacao: document.getElementById('leadClassificacao').value,
        data_nascimento: document.getElementById('leadDataNascimento').value,
        website: document.getElementById('leadWebsite').value.trim(),
        redes_sociais: document.getElementById('leadRedesSociais').value.trim(),
        
        // Metadados
        created_at: Date.now(),
        updated_at: Date.now()
    };
    
    if (CRMState.leadEditando) {
        // Editando lead existente
        const index = CRMState.leads.findIndex(l => l.id_lead === CRMState.leadEditando.id_lead);
        if (index !== -1) {
            novoLead.id_lead = CRMState.leadEditando.id_lead;
            novoLead.created_at = CRMState.leadEditando.created_at;
            CRMState.leads[index] = novoLead;
            console.log('✅ Lead atualizado:', novoLead.id_lead);
        }
    } else {
        // Novo lead
        novoLead.id_lead = gerarIdLead();
        CRMState.leads.push(novoLead);
        console.log('✅ Novo lead criado:', novoLead.id_lead);
    }
    
    salvarLeadsCRM();
    renderizarLeads();
    atualizarEstatisticasCRM();
    fecharModalLead();
    
    alert('Lead salvo com sucesso!');
}

/**
 * Renderiza lista de leads com filtros
 */
function renderizarLeads() {
    const tbody = document.getElementById('leadsTableBody');
    if (!tbody) return;
    
    // Aplicar filtros
    let leadsFiltrados = [...CRMState.leads];
    
    // Filtro de busca
    if (CRMState.filtros.busca) {
        const busca = CRMState.filtros.busca;
        leadsFiltrados = leadsFiltrados.filter(l => 
            (l.nome || '').toLowerCase().includes(busca) ||
            (l.empresa || '').toLowerCase().includes(busca) ||
            (l.email || '').toLowerCase().includes(busca) ||
            (l.celular || '').includes(busca) ||
            (l.id_lead || '').toLowerCase().includes(busca) ||
            (l.nome_proposta || '').toLowerCase().includes(busca)
        );
    }
    
    // Filtro de estágio
    if (CRMState.filtros.estagio !== 'todos') {
        leadsFiltrados = leadsFiltrados.filter(l => l.estagio === CRMState.filtros.estagio);
    }
    
    // Filtro de classificação
    if (CRMState.filtros.classificacao !== 'todos') {
        leadsFiltrados = leadsFiltrados.filter(l => l.classificacao === CRMState.filtros.classificacao);
    }
    
    // Filtro de fonte
    if (CRMState.filtros.fonte !== 'todos') {
        leadsFiltrados = leadsFiltrados.filter(l => l.fonte === CRMState.filtros.fonte);
    }
    
    // Ordenação
    leadsFiltrados.sort((a, b) => {
        const campo = CRMState.ordenacao.campo;
        const direcao = CRMState.ordenacao.direcao;
        
        let valA = a[campo] || '';
        let valB = b[campo] || '';
        
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        
        if (valA < valB) return direcao === 'asc' ? -1 : 1;
        if (valA > valB) return direcao === 'asc' ? 1 : -1;
        return 0;
    });
    
    // Renderizar tabela
    if (leadsFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px;">
                    <i class="fas fa-address-book" style="font-size: 48px; color: #ccc; margin-bottom: 16px; display: block;"></i>
                    <p style="color: #666; margin: 0;">Nenhum lead encontrado</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = leadsFiltrados.map(lead => {
        const estagiosCores = {
            'Prospecção': '#6366f1',
            'Qualificação': '#f59e0b',
            'Proposta': '#8b5cf6',
            'Negociação': '#ec4899',
            'Fechamento': '#10b981',
            'Ganho': '#10b981',
            'Perdido': '#ef4444'
        };
        
        const classificacaoCores = {
            'Prospect': '#6366f1',
            'Lead Quente': '#f59e0b',
            'Cliente Ativo': '#10b981',
            'Cliente Inativo': '#6b7280',
            'Cliente Premium': '#8b5cf6',
            'Perdido': '#ef4444'
        };
        
        const corEstagio = estagiosCores[lead.estagio] || '#6b7280';
        const corClassificacao = classificacaoCores[lead.classificacao] || '#6b7280';
        
        return `
            <tr>
                <td><strong>${lead.id_lead}</strong></td>
                <td>
                    <div style="font-weight: 500;">${lead.nome}</div>
                    ${lead.empresa ? `<div style="font-size: 12px; color: #666;">${lead.empresa}</div>` : ''}
                </td>
                <td>${lead.email}</td>
                <td>${lead.celular || lead.telefone_comercial || '-'}</td>
                <td>
                    <div style="font-weight: 500;">${lead.nome_proposta || '-'}</div>
                    ${lead.valor_estimado ? `<div style="font-size: 12px; color: #10b981; font-weight: 600;">$${parseFloat(lead.valor_estimado).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>` : ''}
                </td>
                <td>
                    <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; background: ${corEstagio}20; color: ${corEstagio};">
                        ${lead.estagio}
                    </span>
                </td>
                <td>
                    <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; background: ${corClassificacao}20; color: ${corClassificacao};">
                        ${lead.classificacao}
                    </span>
                </td>
                <td>${lead.fonte || '-'}</td>
                <td style="white-space: nowrap;">
                    <button class="btn-icon" onclick="window.verDetalhesLead('${lead.id_lead}')" title="Ver detalhes">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="window.editarLead('${lead.id_lead}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="window.excluirLead('${lead.id_lead}')" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Edita lead
 */
function editarLead(idLead) {
    const lead = CRMState.leads.find(l => l.id_lead === idLead);
    if (lead) {
        abrirModalLead(lead);
    }
}

/**
 * Ver detalhes do lead
 */
function verDetalhesLead(idLead) {
    const lead = CRMState.leads.find(l => l.id_lead === idLead);
    if (!lead) return;
    
    alert(`Detalhes do Lead\n\nID: ${lead.id_lead}\nNome: ${lead.nome}\nEmpresa: ${lead.empresa || '-'}\nEmail: ${lead.email}\nTelefone: ${lead.celular || lead.telefone_comercial || '-'}\nProposta: ${lead.nome_proposta}\nValor: $${lead.valor_estimado.toLocaleString('en-US', {minimumFractionDigits: 2})}\nEstágio: ${lead.estagio}\nClassificação: ${lead.classificacao}`);
}

/**
 * Exclui lead
 */
function excluirLead(idLead) {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return;
    
    const index = CRMState.leads.findIndex(l => l.id_lead === idLead);
    if (index !== -1) {
        CRMState.leads.splice(index, 1);
        salvarLeadsCRM();
        renderizarLeads();
        atualizarEstatisticasCRM();
        console.log('✅ Lead excluído:', idLead);
    }
}

/**
 * Atualiza estatísticas do CRM
 */
function atualizarEstatisticasCRM() {
    const totalLeads = CRMState.leads.length;
    const leadsQuentes = CRMState.leads.filter(l => l.classificacao === 'Lead Quente').length;
    const valorPipeline = CRMState.leads
        .filter(l => l.estagio !== 'Ganho' && l.estagio !== 'Perdido')
        .reduce((sum, l) => sum + (l.valor_estimado || 0), 0);
    const oportunidadesAbertas = CRMState.leads
        .filter(l => l.estagio !== 'Ganho' && l.estagio !== 'Perdido')
        .length;
    
    // Atualizar cards
    const statTotalLeads = document.getElementById('statTotalLeads');
    const statLeadsQuentes = document.getElementById('statLeadsQuentes');
    const statValorPipeline = document.getElementById('statValorPipeline');
    const statOportunidadesAbertas = document.getElementById('statOportunidadesAbertas');
    
    if (statTotalLeads) statTotalLeads.textContent = totalLeads;
    if (statLeadsQuentes) statLeadsQuentes.textContent = leadsQuentes;
    if (statValorPipeline) statValorPipeline.textContent = `$${valorPipeline.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    if (statOportunidadesAbertas) statOportunidadesAbertas.textContent = oportunidadesAbertas;
}

/**
 * Exportar leads para CSV
 */
function exportarLeadsCSV() {
    if (CRMState.leads.length === 0) {
        alert('Não há leads para exportar.');
        return;
    }
    
    const headers = [
        'ID', 'Nome', 'Empresa', 'Cargo', 'Email', 'Email Alternativo',
        'Celular', 'Telefone Comercial', 'Endereço', 'Cidade', 'Estado', 'CEP',
        'Website', 'Redes Sociais', 'Nome Proposta', 'Valor Estimado', 'Data Fechamento',
        'Estágio', 'Probabilidade', 'Descrição', 'Fonte', 'Classificação', 'Preferência Comunicação',
        'Responsável', 'Data Nascimento'
    ];
    
    const rows = CRMState.leads.map(l => [
        l.id_lead,
        l.nome,
        l.empresa,
        l.cargo,
        l.email,
        l.email_alternativo,
        l.celular,
        l.telefone_comercial,
        l.endereco_rua,
        l.cidade,
        l.estado,
        l.cep,
        l.website,
        l.redes_sociais,
        l.nome_proposta,
        l.valor_estimado,
        l.data_fechamento,
        l.estagio,
        l.probabilidade,
        l.descricao,
        l.fonte,
        l.classificacao,
        l.preferencia_comunicacao,
        l.responsavel,
        l.data_nascimento
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_crm_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ Leads exportados para CSV');
}

// Exportar funções para o escopo global
window.inicializarCRM = inicializarCRM;
window.abrirModalLead = abrirModalLead;
window.fecharModalLead = fecharModalLead;
window.editarLead = editarLead;
window.verDetalhesLead = verDetalhesLead;
window.excluirLead = excluirLead;
window.exportarLeadsCSV = exportarLeadsCSV;
window.CRMState = CRMState;
window.CRM = {
    abrirModalLead,
    fecharModalLead,
    exportarLeadsCSV,
    renderizarLeads,
    atualizarEstatisticasCRM
};

console.log('✅ Módulo crm.js v3.1.2 carregado');
