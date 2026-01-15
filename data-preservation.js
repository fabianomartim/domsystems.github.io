/**
 * Sistema de Preservação de Dados
 * Garante que nenhum dado seja perdido durante atualizações
 * Versão: 3.1.5
 */

(function() {
    'use strict';
    
    console.log('🛡️ Iniciando sistema de preservação de dados...');
    
    const DATA_VERSION_KEY = 'mfs_data_version';
    const CURRENT_VERSION = '3.1.5';
    
    // Chaves de dados críticos
    const CRITICAL_DATA_KEYS = {
        usuarios: 'mfs_usuarios',
        session: 'mfs_session',
        clientes: 'mfs_clientes',
        ordens: 'mfs_ordens',
        servicos: 'mfs_servicos',
        leads: 'mfs_crm_leads',
        adminState: 'mfs_admin_state'
    };
    
    /**
     * Inicializa o sistema de preservação
     */
    function initDataPreservation() {
        const storedVersion = localStorage.getItem(DATA_VERSION_KEY);
        
        if (!storedVersion) {
            console.log('🆕 Primeira execução - marcando versão:', CURRENT_VERSION);
            localStorage.setItem(DATA_VERSION_KEY, CURRENT_VERSION);
            backupAllData();
        } else if (storedVersion !== CURRENT_VERSION) {
            console.log('🔄 Atualização detectada:', storedVersion, '→', CURRENT_VERSION);
            migrateData(storedVersion, CURRENT_VERSION);
            localStorage.setItem(DATA_VERSION_KEY, CURRENT_VERSION);
        } else {
            console.log('✅ Versão atual:', CURRENT_VERSION);
        }
        
        // Fazer backup automático a cada 5 minutos
        setInterval(backupAllData, 5 * 60 * 1000);
        
        // Fazer backup antes de sair da página
        window.addEventListener('beforeunload', backupAllData);
        
        console.log('✅ Sistema de preservação ativo');
    }
    
    /**
     * Faz backup de todos os dados
     */
    function backupAllData() {
        const timestamp = Date.now();
        const backup = {
            version: CURRENT_VERSION,
            timestamp: timestamp,
            date: new Date(timestamp).toISOString(),
            data: {}
        };
        
        // Coletar todos os dados
        Object.keys(CRITICAL_DATA_KEYS).forEach(key => {
            const storageKey = CRITICAL_DATA_KEYS[key];
            const data = localStorage.getItem(storageKey);
            if (data) {
                backup.data[key] = data;
            }
        });
        
        // Salvar backup
        try {
            localStorage.setItem('mfs_backup_latest', JSON.stringify(backup));
            console.log('💾 Backup realizado:', new Date(timestamp).toLocaleString('pt-BR'));
            
            // Manter histórico de backups (últimos 5)
            updateBackupHistory(backup);
        } catch (error) {
            console.error('❌ Erro ao fazer backup:', error);
        }
    }
    
    /**
     * Atualiza histórico de backups
     */
    function updateBackupHistory(newBackup) {
        try {
            const historyKey = 'mfs_backup_history';
            const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
            
            // Adicionar novo backup
            history.unshift({
                version: newBackup.version,
                timestamp: newBackup.timestamp,
                date: newBackup.date,
                size: JSON.stringify(newBackup).length
            });
            
            // Manter apenas os últimos 5
            const recentHistory = history.slice(0, 5);
            localStorage.setItem(historyKey, JSON.stringify(recentHistory));
        } catch (error) {
            console.warn('⚠️ Não foi possível atualizar histórico:', error);
        }
    }
    
    /**
     * Migra dados entre versões
     */
    function migrateData(fromVersion, toVersion) {
        console.log(`🔄 Migrando dados de ${fromVersion} para ${toVersion}...`);
        
        // Fazer backup antes da migração
        backupAllData();
        
        // Verificar integridade dos dados
        const dataStatus = checkDataIntegrity();
        console.log('📊 Status dos dados:', dataStatus);
        
        // Executar migrações específicas se necessário
        if (needsMigration(fromVersion, toVersion)) {
            executeMigration(fromVersion, toVersion);
        }
        
        console.log('✅ Migração concluída');
    }
    
    /**
     * Verifica se precisa migração
     */
    function needsMigration(from, to) {
        // Aqui você pode adicionar lógica específica de migração
        // Por exemplo: se mudar estrutura de dados entre versões
        return false; // Por padrão, não precisa
    }
    
    /**
     * Executa migração específica
     */
    function executeMigration(from, to) {
        console.log('🔧 Executando migração específica...');
        
        // Exemplo: Migrar estrutura de leads
        // const leads = JSON.parse(localStorage.getItem('mfs_crm_leads') || '[]');
        // leads.forEach(lead => {
        //     if (!lead.new_field) {
        //         lead.new_field = 'default_value';
        //     }
        // });
        // localStorage.setItem('mfs_crm_leads', JSON.stringify(leads));
    }
    
    /**
     * Verifica integridade dos dados
     */
    function checkDataIntegrity() {
        const status = {};
        
        Object.keys(CRITICAL_DATA_KEYS).forEach(key => {
            const storageKey = CRITICAL_DATA_KEYS[key];
            const data = localStorage.getItem(storageKey);
            
            if (data) {
                try {
                    // Tentar parsear se for JSON
                    const parsed = JSON.parse(data);
                    status[key] = {
                        exists: true,
                        valid: true,
                        type: Array.isArray(parsed) ? 'array' : 'object',
                        count: Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length,
                        size: data.length
                    };
                } catch (e) {
                    // Não é JSON válido
                    status[key] = {
                        exists: true,
                        valid: true,
                        type: 'string',
                        size: data.length
                    };
                }
            } else {
                status[key] = {
                    exists: false,
                    valid: false
                };
            }
        });
        
        return status;
    }
    
    /**
     * Restaura dados do backup
     */
    function restoreFromBackup() {
        try {
            const backup = JSON.parse(localStorage.getItem('mfs_backup_latest'));
            
            if (!backup) {
                console.warn('⚠️ Nenhum backup encontrado');
                return false;
            }
            
            console.log('🔄 Restaurando backup de:', backup.date);
            
            Object.keys(backup.data).forEach(key => {
                const storageKey = CRITICAL_DATA_KEYS[key];
                if (storageKey) {
                    localStorage.setItem(storageKey, backup.data[key]);
                }
            });
            
            console.log('✅ Backup restaurado com sucesso');
            return true;
        } catch (error) {
            console.error('❌ Erro ao restaurar backup:', error);
            return false;
        }
    }
    
    /**
     * Exporta todos os dados
     */
    function exportAllData() {
        const exportData = {
            version: CURRENT_VERSION,
            exported_at: new Date().toISOString(),
            data: {}
        };
        
        Object.keys(CRITICAL_DATA_KEYS).forEach(key => {
            const storageKey = CRITICAL_DATA_KEYS[key];
            const data = localStorage.getItem(storageKey);
            if (data) {
                try {
                    exportData.data[key] = JSON.parse(data);
                } catch (e) {
                    exportData.data[key] = data;
                }
            }
        });
        
        // Criar arquivo para download
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dom-systems-backup-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        console.log('✅ Dados exportados com sucesso');
    }
    
    /**
     * Importa dados
     */
    function importData(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            console.log('📥 Importando dados da versão:', data.version);
            
            Object.keys(data.data).forEach(key => {
                const storageKey = CRITICAL_DATA_KEYS[key];
                if (storageKey) {
                    const value = typeof data.data[key] === 'string' 
                        ? data.data[key] 
                        : JSON.stringify(data.data[key]);
                    localStorage.setItem(storageKey, value);
                }
            });
            
            console.log('✅ Dados importados com sucesso');
            return true;
        } catch (error) {
            console.error('❌ Erro ao importar dados:', error);
            return false;
        }
    }
    
    // Exportar funções para o escopo global
    window.DataPreservation = {
        backup: backupAllData,
        restore: restoreFromBackup,
        export: exportAllData,
        import: importData,
        checkIntegrity: checkDataIntegrity,
        version: CURRENT_VERSION
    };
    
    // Inicializar
    initDataPreservation();
    
    console.log('✅ Sistema de preservação de dados v3.1.5 carregado');
})();
