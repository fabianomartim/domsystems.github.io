/**
 * Script de Recuperação de Dados
 * Restaura dados iniciais do sistema (31 tipos de serviço)
 * Versão: 3.1.7
 */

(function() {
    'use strict';
    
    console.log('🔄 Iniciando recuperação de dados...');
    
    /**
     * 31 Tipos de Serviço Padrão
     */
    const SERVICOS_PADRAO = [
        { codigo: '001', nome: 'FORM 1099', descricao: 'FORMULARIO 1099', valor_padrao: 150 },
        { codigo: '002', nome: 'FORM BOI', descricao: 'BENEFICIAL OWNERSHIP INFORMATION REPORT', valor_padrao: 200 },
        { codigo: '003', nome: 'PLANO EMERGENCIAL', descricao: 'PLANO EMERGENCIAL', valor_padrao: 350 },
        { codigo: '004', nome: 'FORM W9', descricao: 'FORMULARIO W9', valor_padrao: 50 },
        { codigo: '005', nome: 'EMPRESA C CORP', descricao: 'ABERTURA DE EMPRESA C CORP', valor_padrao: 1200 },
        { codigo: '006', nome: 'EMPRESA LLC', descricao: 'ABERTURA DE EMPRESA LLC', valor_padrao: 800 },
        { codigo: '007', nome: 'ALT. ENDERECO', descricao: 'ALTERACAO DE ENDERECO', valor_padrao: 100 },
        { codigo: '008', nome: 'ANUAL REPORT', descricao: 'RELATORIO ANUAL', valor_padrao: 150 },
        { codigo: '009', nome: 'CANCEL. EMPRESA', descricao: 'CANCELAMENTO DE EMPRESA', valor_padrao: 300 },
        { codigo: '010', nome: 'CONSULTORIA', descricao: 'SERVICO DE CONSULTORIA', valor_padrao: 200 },
        { codigo: '011', nome: 'CONTABILIDADE PESSOAL', descricao: 'CONTABILIDADE PESSOA FISICA', valor_padrao: 250 },
        { codigo: '012', nome: 'CONTABILIDADE S CORP', descricao: 'CONTABILIDADE S CORPORATION', valor_padrao: 400 },
        { codigo: '013', nome: 'CONTABILIDADE LLC', descricao: 'CONTABILIDADE LLC', valor_padrao: 350 },
        { codigo: '014', nome: 'DECL. IMPOSTO PESSOAL', descricao: 'DECLARACAO DE IMPOSTO PESSOA FISICA', valor_padrao: 200 },
        { codigo: '015', nome: 'DECL. IMPOSTO S CORP', descricao: 'DECLARACAO DE IMPOSTO S CORP', valor_padrao: 350 },
        { codigo: '016', nome: 'DECL. IMPOSTO LLC', descricao: 'DECLARACAO DE IMPOSTO LLC', valor_padrao: 300 },
        { codigo: '017', nome: 'EXTENSAO DE VISTO', descricao: 'EXTENSAO DE VISTO', valor_padrao: 500 },
        { codigo: '018', nome: 'EIN NUMBER', descricao: 'NUMERO DE IDENTIFICACAO FISCAL', valor_padrao: 150 },
        { codigo: '019', nome: 'TRADUCAO DOC', descricao: 'TRADUCAO DE DOCUMENTOS', valor_padrao: 80 },
        { codigo: '020', nome: 'ITIN', descricao: 'INDIVIDUAL TAXPAYER IDENTIFICATION NUMBER', valor_padrao: 250 },
        { codigo: '021', nome: 'PASSAPORTE', descricao: 'RENOVACAO/EMISSAO DE PASSAPORTE', valor_padrao: 300 },
        { codigo: '022', nome: 'QUITACAO ELEITORAL', descricao: 'CERTIDAO DE QUITACAO ELEITORAL', valor_padrao: 100 },
        { codigo: '023', nome: 'REATIVACAO DE EMPRESA', descricao: 'REATIVACAO DE EMPRESA', valor_padrao: 400 },
        { codigo: '024', nome: 'CIDADANIA BRASILEIRA', descricao: 'PROCESSO DE CIDADANIA BRASILEIRA', valor_padrao: 800 },
        { codigo: '025', nome: 'EXT. IMPOSTO PESSOAL', descricao: 'EXTENSAO DE IMPOSTO PESSOA FISICA', valor_padrao: 100 },
        { codigo: '026', nome: 'EXT. IMPOSTO LLC', descricao: 'EXTENSAO DE IMPOSTO LLC', valor_padrao: 150 },
        { codigo: '027', nome: 'EXT. IMPOSTO S CORP', descricao: 'EXTENSAO DE IMPOSTO S CORP', valor_padrao: 175 },
        { codigo: '028', nome: 'TITULO DE ELEITOR', descricao: 'EMISSAO DE TITULO DE ELEITOR', valor_padrao: 120 },
        { codigo: '029', nome: 'WORKS COMPENSATION EX.', descricao: 'WORKERS COMPENSATION EXEMPTION', valor_padrao: 200 },
        { codigo: '030', nome: 'LIABILITY INSURANCE', descricao: 'SEGURO DE RESPONSABILIDADE CIVIL', valor_padrao: 300 },
        { codigo: '031', nome: 'AUTORIZACAO DE VIAGEM', descricao: 'AUTORIZACAO DE VIAGEM MENOR', valor_padrao: 150 }
    ];
    
    /**
     * Recupera ou inicializa tipos de serviço
     */
    function recuperarServicos() {
        try {
            // Verificar se já existem serviços
            const servicosExistentes = localStorage.getItem('mfs_servicos');
            let servicos = [];
            
            if (servicosExistentes) {
                servicos = JSON.parse(servicosExistentes);
                console.log(`📊 ${servicos.length} serviços existentes encontrados`);
            }
            
            // Se não há serviços ou há menos de 31, restaurar
            if (!servicos || servicos.length < 31) {
                console.log('🔧 Restaurando 31 tipos de serviço...');
                
                servicos = SERVICOS_PADRAO.map((s, index) => ({
                    id: `SRV-${String(index + 1).padStart(3, '0')}`,
                    codigo: s.codigo,
                    nome_servico: s.nome,  // Corrigido: nome_servico
                    descricao: s.descricao,
                    valor_padrao: s.valor_padrao,
                    ativo: true,
                    created_at: Date.now(),
                    updated_at: Date.now()
                }));
                
                localStorage.setItem('mfs_servicos', JSON.stringify(servicos));
                console.log('✅ 31 tipos de serviço restaurados!');
                
                return servicos;
            } else {
                console.log('✅ Serviços já estão completos');
                return servicos;
            }
        } catch (error) {
            console.error('❌ Erro ao recuperar serviços:', error);
            return [];
        }
    }
    
    /**
     * Verifica e cria estrutura de dados
     */
    function verificarEstruturaDados() {
        const estruturas = {
            'mfs_usuarios': [],
            'mfs_servicos': [],
            'mfs_crm_leads': []
        };
        
        Object.keys(estruturas).forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify(estruturas[key]));
                console.log(`✅ Estrutura criada: ${key}`);
            }
        });
    }
    
    /**
     * Exportar função de recuperação manual
     */
    window.recuperarDados = function() {
        console.log('🔄 Recuperação manual iniciada...');
        
        // Recuperar serviços
        const servicos = recuperarServicos();
        
        // Verificar estruturas
        verificarEstruturaDados();
        
        console.log('✅ Recuperação concluída!');
        console.log('📊 Serviços disponíveis:', servicos.length);
        
        // Recarregar página
        if (confirm('Dados recuperados! Recarregar página para aplicar mudanças?')) {
            location.reload();
        }
        
        return {
            servicos: servicos.length,
            sucesso: true
        };
    };
    
    /**
     * Listar todos os serviços
     */
    window.listarServicos = function() {
        const servicos = JSON.parse(localStorage.getItem('mfs_servicos') || '[]');
        console.log('📋 TIPOS DE SERVIÇO (' + servicos.length + ')');
        console.table(servicos.map(s => ({
            Código: s.codigo,
            Nome: s.nome,
            Descrição: s.descricao,
            'Valor (USD)': s.valor_padrao,
            Ativo: s.ativo ? '✅' : '❌'
        })));
        return servicos;
    };
    
    // Executar recuperação automática ao carregar
    verificarEstruturaDados();
    recuperarServicos();
    
    console.log('✅ Sistema de recuperação carregado');
    console.log('💡 Use window.recuperarDados() para forçar recuperação');
    console.log('💡 Use window.listarServicos() para ver todos os serviços');
})();
