/**
 * RECUPERAÇÃO EMERGENCIAL DE DADOS
 * Tenta recuperar dados perdidos de versões anteriores
 * Versão: 3.1.6
 */

(function() {
    'use strict';
    
    console.log('🚨 Sistema de Recuperação Emergencial v3.1.6');
    
    /**
     * Tenta recuperar dados de chaves antigas do localStorage
     */
    function tentarRecuperarDadosAntigos() {
        console.log('🔍 Procurando dados de versões anteriores...');
        
        const possiveisChaves = [
            // Variações possíveis de nomes de chaves
            'mfs_clientes', 'clientes', 'clientes_data', 'dom_clientes',
            'mfs_ordens', 'ordens', 'ordens_servico', 'ordens_data',
            'mfs_servicos', 'servicos', 'tipos_servico', 'servicos_data',
            'mfs_usuarios', 'usuarios', 'users',
            'mfs_crm_leads', 'crm_leads', 'leads',
            // Backups
            'backup_clientes', 'backup_ordens', 'backup_servicos',
            'data_backup', 'system_backup'
        ];
        
        const dadosEncontrados = {};
        let totalChavesEncontradas = 0;
        
        // Verificar todas as chaves do localStorage
        console.log('📊 Chaves disponíveis no localStorage:');
        for (let i = 0; i < localStorage.length; i++) {
            const chave = localStorage.key(i);
            console.log(`  - ${chave}`);
            
            if (possiveisChaves.includes(chave)) {
                try {
                    const dados = JSON.parse(localStorage.getItem(chave));
                    if (Array.isArray(dados) && dados.length > 0) {
                        dadosEncontrados[chave] = dados;
                        totalChavesEncontradas++;
                        console.log(`✅ Encontrados ${dados.length} registros em: ${chave}`);
                    }
                } catch (e) {
                    // Não é JSON válido, ignorar
                }
            }
        }
        
        if (totalChavesEncontradas === 0) {
            console.log('❌ Nenhum dado antigo encontrado no localStorage');
            return null;
        }
        
        console.log(`✅ Total de ${totalChavesEncontradas} chave(s) com dados encontradas`);
        return dadosEncontrados;
    }
    
    /**
     * Diagnóstico completo do estado atual
     */
    function diagnosticoCompleto() {
        console.log('\n═══════════════════════════════════════════');
        console.log('📋 DIAGNÓSTICO COMPLETO DO SISTEMA');
        console.log('═══════════════════════════════════════════\n');
        
        const diagnostico = {
            timestamp: new Date().toISOString(),
            versao: '3.1.6',
            dados: {}
        };
        
        // Verificar cada tipo de dado
        const estruturas = [
            { key: 'mfs_usuarios', nome: 'Usuários' },
            { key: 'mfs_clientes', nome: 'Clientes' },
            { key: 'mfs_ordens', nome: 'Ordens de Serviço' },
            { key: 'mfs_servicos', nome: 'Tipos de Serviço' },
            { key: 'mfs_crm_leads', nome: 'Leads CRM' },
            { key: 'mfs_session', nome: 'Sessão Ativa' }
        ];
        
        estruturas.forEach(estrutura => {
            try {
                const dados = JSON.parse(localStorage.getItem(estrutura.key) || '[]');
                const quantidade = Array.isArray(dados) ? dados.length : (dados ? 1 : 0);
                
                diagnostico.dados[estrutura.key] = {
                    nome: estrutura.nome,
                    quantidade: quantidade,
                    status: quantidade > 0 ? '✅' : '⚠️',
                    existe: !!localStorage.getItem(estrutura.key)
                };
                
                console.log(`${diagnostico.dados[estrutura.key].status} ${estrutura.nome}: ${quantidade} registro(s)`);
                
            } catch (e) {
                diagnostico.dados[estrutura.key] = {
                    nome: estrutura.nome,
                    quantidade: 0,
                    status: '❌',
                    erro: e.message
                };
                console.log(`❌ ${estrutura.nome}: ERRO - ${e.message}`);
            }
        });
        
        console.log('\n═══════════════════════════════════════════\n');
        
        return diagnostico;
    }
    
    /**
     * Listar TODAS as chaves do localStorage
     */
    function listarTodasChaves() {
        console.log('\n═══════════════════════════════════════════');
        console.log('🔑 TODAS AS CHAVES DO LOCALSTORAGE');
        console.log('═══════════════════════════════════════════\n');
        
        if (localStorage.length === 0) {
            console.log('⚠️ LocalStorage está vazio!');
            return [];
        }
        
        const chaves = [];
        for (let i = 0; i < localStorage.length; i++) {
            const chave = localStorage.key(i);
            const valor = localStorage.getItem(chave);
            
            chaves.push({
                chave: chave,
                tamanho: valor.length,
                tipo: valor.startsWith('{') || valor.startsWith('[') ? 'JSON' : 'STRING'
            });
            
            console.log(`${i + 1}. ${chave}`);
            console.log(`   Tipo: ${chaves[i].tipo} | Tamanho: ${chaves[i].tamanho} caracteres`);
            
            // Se for JSON, tentar mostrar estrutura
            if (chaves[i].tipo === 'JSON') {
                try {
                    const obj = JSON.parse(valor);
                    if (Array.isArray(obj)) {
                        console.log(`   📊 Array com ${obj.length} item(s)`);
                        if (obj.length > 0) {
                            console.log(`   📝 Primeiro item:`, Object.keys(obj[0]).join(', '));
                        }
                    } else {
                        console.log(`   📝 Objeto com chaves:`, Object.keys(obj).join(', '));
                    }
                } catch (e) {
                    console.log(`   ⚠️ JSON inválido`);
                }
            }
            console.log('');
        }
        
        console.log(`Total: ${chaves.length} chave(s) no localStorage\n`);
        console.log('═══════════════════════════════════════════\n');
        
        return chaves;
    }
    
    /**
     * Exportar TUDO do localStorage para análise
     */
    function exportarTudoParaAnalise() {
        const exportacao = {
            timestamp: new Date().toISOString(),
            versao: '3.1.6',
            total_chaves: localStorage.length,
            dados: {}
        };
        
        for (let i = 0; i < localStorage.length; i++) {
            const chave = localStorage.key(i);
            exportacao.dados[chave] = localStorage.getItem(chave);
        }
        
        const blob = new Blob([JSON.stringify(exportacao, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `localstorage_completo_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('💾 Exportação completa salva!');
        console.log(`📊 Total: ${localStorage.length} chave(s) exportadas`);
        
        return exportacao;
    }
    
    /**
     * Tentar migrar dados encontrados para estruturas corretas
     */
    function migrarDadosEncontrados(dadosEncontrados) {
        if (!dadosEncontrados) {
            console.log('⚠️ Nenhum dado para migrar');
            return false;
        }
        
        console.log('\n🔄 Iniciando migração de dados...\n');
        
        let migrados = 0;
        
        // Mapear chaves antigas para novas
        const mapeamento = {
            'clientes': 'mfs_clientes',
            'clientes_data': 'mfs_clientes',
            'dom_clientes': 'mfs_clientes',
            'ordens': 'mfs_ordens',
            'ordens_servico': 'mfs_ordens',
            'ordens_data': 'mfs_ordens',
            'servicos': 'mfs_servicos',
            'tipos_servico': 'mfs_servicos',
            'servicos_data': 'mfs_servicos'
        };
        
        Object.keys(dadosEncontrados).forEach(chaveAntiga => {
            const chaveNova = mapeamento[chaveAntiga] || chaveAntiga;
            const dados = dadosEncontrados[chaveAntiga];
            
            // Verificar se já existe dados na chave nova
            const dadosExistentes = JSON.parse(localStorage.getItem(chaveNova) || '[]');
            
            if (dadosExistentes.length === 0 && dados.length > 0) {
                localStorage.setItem(chaveNova, JSON.stringify(dados));
                console.log(`✅ Migrados ${dados.length} registros: ${chaveAntiga} → ${chaveNova}`);
                migrados++;
            } else {
                console.log(`⚠️ ${chaveNova} já possui dados (${dadosExistentes.length} registros)`);
            }
        });
        
        if (migrados > 0) {
            console.log(`\n✅ Total de ${migrados} migração(ões) realizada(s)`);
            console.log('🔄 Recomenda-se recarregar a página\n');
            return true;
        } else {
            console.log('\n⚠️ Nenhuma migração necessária\n');
            return false;
        }
    }
    
    // Expor funções globalmente
    window.RecuperacaoEmergencial = {
        diagnostico: diagnosticoCompleto,
        listarChaves: listarTodasChaves,
        tentarRecuperar: tentarRecuperarDadosAntigos,
        exportarTudo: exportarTudoParaAnalise,
        migrar: function() {
            const dados = tentarRecuperarDadosAntigos();
            return migrarDadosEncontrados(dados);
        },
        
        // Função completa de recuperação
        recuperacaoCompleta: function() {
            console.log('\n🚨 INICIANDO RECUPERAÇÃO EMERGENCIAL COMPLETA\n');
            
            // 1. Diagnóstico
            console.log('1️⃣ Diagnóstico...');
            const diagnostico = diagnosticoCompleto();
            
            // 2. Listar chaves
            console.log('\n2️⃣ Listando chaves...');
            const chaves = listarTodasChaves();
            
            // 3. Tentar recuperar
            console.log('\n3️⃣ Tentando recuperar dados...');
            const dadosEncontrados = tentarRecuperarDadosAntigos();
            
            // 4. Migrar se encontrou dados
            if (dadosEncontrados) {
                console.log('\n4️⃣ Migrando dados...');
                const sucesso = migrarDadosEncontrados(dadosEncontrados);
                
                if (sucesso) {
                    console.log('\n✅ RECUPERAÇÃO CONCLUÍDA COM SUCESSO!');
                    console.log('🔄 Recarregando página em 3 segundos...');
                    setTimeout(() => location.reload(), 3000);
                    return true;
                }
            }
            
            console.log('\n❌ Não foi possível recuperar dados antigos');
            console.log('💡 Recomenda-se recadastrar os dados manualmente\n');
            
            return false;
        }
    };
    
    console.log('\n✅ Sistema de Recuperação Emergencial carregado!');
    console.log('\n📚 COMANDOS DISPONÍVEIS:');
    console.log('  RecuperacaoEmergencial.diagnostico()      - Ver estado atual');
    console.log('  RecuperacaoEmergencial.listarChaves()     - Listar todas as chaves');
    console.log('  RecuperacaoEmergencial.tentarRecuperar()  - Buscar dados antigos');
    console.log('  RecuperacaoEmergencial.migrar()           - Migrar dados encontrados');
    console.log('  RecuperacaoEmergencial.exportarTudo()     - Exportar localStorage completo');
    console.log('  RecuperacaoEmergencial.recuperacaoCompleta() - EXECUTAR TUDO\n');
    
    // Executar diagnóstico automático
    setTimeout(() => {
        console.log('\n🔍 Executando diagnóstico automático...\n');
        diagnosticoCompleto();
        
        console.log('\n💡 PRÓXIMOS PASSOS:');
        console.log('  1. Execute: RecuperacaoEmergencial.recuperacaoCompleta()');
        console.log('  2. Se não encontrar dados, eles foram definitivamente perdidos');
        console.log('  3. Nesse caso, use os 31 tipos de serviço restaurados');
        console.log('  4. E recadastre clientes/ordens conforme necessário\n');
    }, 1000);
    
})();
