/**
 * GERENCIADOR ÚNICO DE USUÁRIOS
 * Solução definitiva para persistência de usuários
 * Versão: 3.1.8
 * 
 * PROBLEMA IDENTIFICADO:
 * - Múltiplos arquivos manipulando mfs_usuarios simultaneamente
 * - Race conditions causando perda de dados
 * - Sobrescrita acidental de usuários
 * 
 * SOLUÇÃO:
 * - Gerenciador centralizado de usuários
 * - Singleton pattern
 * - Operações atômicas
 * - Validações antes de salvar
 */

(function() {
    'use strict';
    
    console.log('👥 Inicializando Gerenciador de Usuários v3.1.8...');
    
    // Instância única
    const UserManager = {
        STORAGE_KEY: 'mfs_usuarios',
        BACKUP_KEY: 'mfs_usuarios_backup',
        adminDefault: {
            id: 'USR-001',
            nome: 'Olenir',
            email: 'admin',
            senha: 'admin01',
            primeiro_acesso: false,
            is_admin: true,
            ativo: true,
            created_at: Date.now()
        },
        
        /**
         * Carregar usuários do localStorage com validação
         */
        load() {
            try {
                const data = localStorage.getItem(this.STORAGE_KEY);
                if (!data) {
                    console.log('⚠️ Nenhum usuário encontrado, inicializando com admin');
                    return [{ ...this.adminDefault }];
                }
                
                let usuarios = JSON.parse(data);
                
                // Validação: deve ser array
                if (!Array.isArray(usuarios)) {
                    console.error('❌ Dados corrompidos (não é array), recuperando backup');
                    return this.loadFromBackup();
                }
                
                // Validação: admin deve existir
                const adminExiste = usuarios.some(u => 
                    u.id === 'USR-001' || u.email === 'admin'
                );
                
                if (!adminExiste) {
                    console.log('⚠️ Admin não encontrado, adicionando');
                    usuarios.unshift({ ...this.adminDefault });
                }
                
                console.log(`✅ ${usuarios.length} usuário(s) carregado(s)`);
                return usuarios;
                
            } catch (error) {
                console.error('❌ Erro ao carregar usuários:', error);
                return this.loadFromBackup();
            }
        },
        
        /**
         * Carregar do backup
         */
        loadFromBackup() {
            try {
                const backup = localStorage.getItem(this.BACKUP_KEY);
                if (backup) {
                    console.log('🔄 Restaurando do backup...');
                    const usuarios = JSON.parse(backup);
                    if (Array.isArray(usuarios) && usuarios.length > 0) {
                        this.save(usuarios);
                        return usuarios;
                    }
                }
            } catch (error) {
                console.error('❌ Erro ao carregar backup:', error);
            }
            
            // Último recurso: apenas admin
            console.log('🆘 Criando usuário admin padrão');
            return [{ ...this.adminDefault }];
        },
        
        /**
         * Salvar usuários com backup automático
         */
        save(usuarios) {
            try {
                // Validação antes de salvar
                if (!Array.isArray(usuarios)) {
                    throw new Error('Usuarios deve ser um array');
                }
                
                if (usuarios.length === 0) {
                    throw new Error('Lista de usuários não pode estar vazia');
                }
                
                // Verificar se admin existe
                const adminExiste = usuarios.some(u => 
                    u.id === 'USR-001' || u.email === 'admin'
                );
                
                if (!adminExiste) {
                    console.warn('⚠️ Admin não encontrado na lista, adicionando');
                    usuarios = [{ ...this.adminDefault }, ...usuarios];
                }
                
                // Criar backup antes de salvar
                const dadosAtuais = localStorage.getItem(this.STORAGE_KEY);
                if (dadosAtuais) {
                    localStorage.setItem(this.BACKUP_KEY, dadosAtuais);
                }
                
                // Salvar
                const dataString = JSON.stringify(usuarios);
                localStorage.setItem(this.STORAGE_KEY, dataString);
                
                console.log(`💾 ${usuarios.length} usuário(s) salvo(s)`);
                
                // Validar salvamento
                const verificacao = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
                if (verificacao.length !== usuarios.length) {
                    throw new Error('Erro de validação após salvar');
                }
                
                return true;
                
            } catch (error) {
                console.error('❌ Erro ao salvar usuários:', error);
                
                // Tentar restaurar backup
                const backup = localStorage.getItem(this.BACKUP_KEY);
                if (backup) {
                    console.log('🔄 Restaurando backup após erro...');
                    localStorage.setItem(this.STORAGE_KEY, backup);
                }
                
                return false;
            }
        },
        
        /**
         * Adicionar usuário
         */
        add(usuario) {
            const usuarios = this.load();
            
            // Gerar ID se não tiver
            if (!usuario.id) {
                const maxId = usuarios.reduce((max, u) => {
                    const num = parseInt(u.id.replace('USR-', ''));
                    return num > max ? num : max;
                }, 0);
                usuario.id = `USR-${String(maxId + 1).padStart(3, '0')}`;
            }
            
            // Verificar duplicação de email
            const emailExiste = usuarios.some(u => u.email === usuario.email);
            if (emailExiste) {
                console.error('❌ Email já cadastrado:', usuario.email);
                return false;
            }
            
            // Adicionar timestamps
            usuario.created_at = usuario.created_at || Date.now();
            usuario.updated_at = Date.now();
            
            usuarios.push(usuario);
            
            return this.save(usuarios);
        },
        
        /**
         * Atualizar usuário
         */
        update(id, dadosAtualizados) {
            const usuarios = this.load();
            const index = usuarios.findIndex(u => u.id === id);
            
            if (index === -1) {
                console.error('❌ Usuário não encontrado:', id);
                return false;
            }
            
            // Mesclar dados mantendo campos críticos
            usuarios[index] = {
                ...usuarios[index],
                ...dadosAtualizados,
                id: usuarios[index].id, // Nunca mudar ID
                created_at: usuarios[index].created_at, // Manter data de criação
                updated_at: Date.now()
            };
            
            return this.save(usuarios);
        },
        
        /**
         * Remover usuário
         */
        remove(id) {
            // Não permitir remover admin
            if (id === 'USR-001') {
                console.error('❌ Não é permitido remover o usuário admin');
                return false;
            }
            
            const usuarios = this.load();
            const usuariosFiltrados = usuarios.filter(u => u.id !== id);
            
            if (usuariosFiltrados.length === usuarios.length) {
                console.error('❌ Usuário não encontrado:', id);
                return false;
            }
            
            return this.save(usuariosFiltrados);
        },
        
        /**
         * Buscar usuário por ID
         */
        findById(id) {
            const usuarios = this.load();
            return usuarios.find(u => u.id === id) || null;
        },
        
        /**
         * Buscar usuário por email
         */
        findByEmail(email) {
            const usuarios = this.load();
            return usuarios.find(u => u.email === email) || null;
        },
        
        /**
         * Obter todos os usuários
         */
        getAll() {
            return this.load();
        },
        
        /**
         * Contar usuários
         */
        count() {
            const usuarios = this.load();
            return {
                total: usuarios.length,
                ativos: usuarios.filter(u => u.ativo).length,
                admins: usuarios.filter(u => u.is_admin && u.ativo).length
            };
        },
        
        /**
         * Verificar integridade
         */
        checkIntegrity() {
            const usuarios = this.load();
            const report = {
                total: usuarios.length,
                adminExists: usuarios.some(u => u.id === 'USR-001' || u.email === 'admin'),
                duplicatedEmails: [],
                invalidRecords: [],
                ok: true
            };
            
            // Verificar emails duplicados
            const emails = new Map();
            usuarios.forEach(u => {
                if (emails.has(u.email)) {
                    report.duplicatedEmails.push(u.email);
                    report.ok = false;
                }
                emails.set(u.email, true);
            });
            
            // Verificar registros inválidos
            usuarios.forEach(u => {
                if (!u.id || !u.email || !u.nome) {
                    report.invalidRecords.push(u.id || 'sem-id');
                    report.ok = false;
                }
            });
            
            if (!report.adminExists) {
                report.ok = false;
            }
            
            return report;
        },
        
        /**
         * Reparar integridade
         */
        repair() {
            console.log('🔧 Reparando integridade dos usuários...');
            
            let usuarios = this.load();
            const report = this.checkIntegrity();
            
            if (report.ok) {
                console.log('✅ Integridade OK, nada a reparar');
                return true;
            }
            
            // Garantir admin existe
            if (!report.adminExists) {
                console.log('➕ Adicionando admin');
                usuarios.unshift({ ...this.adminDefault });
            }
            
            // Remover duplicatas
            if (report.duplicatedEmails.length > 0) {
                console.log('🔧 Removendo duplicatas de email');
                const seen = new Set();
                usuarios = usuarios.filter(u => {
                    if (seen.has(u.email)) {
                        // Manter apenas o primeiro (geralmente o admin)
                        return false;
                    }
                    seen.add(u.email);
                    return true;
                });
            }
            
            // Remover registros inválidos (exceto admin)
            usuarios = usuarios.filter(u => {
                if (u.id === 'USR-001' || u.email === 'admin') return true;
                return u.id && u.email && u.nome;
            });
            
            this.save(usuarios);
            console.log('✅ Integridade reparada');
            
            return true;
        },
        
        /**
         * Exportar usuários (sem senhas)
         */
        export() {
            const usuarios = this.load();
            return usuarios.map(u => ({
                id: u.id,
                nome: u.nome,
                email: u.email,
                is_admin: u.is_admin,
                ativo: u.ativo,
                created_at: u.created_at
            }));
        }
    };
    
    // Expor globalmente
    window.UserManager = UserManager;
    
    // Verificar e reparar integridade na inicialização
    const integrity = UserManager.checkIntegrity();
    console.log('📊 Integridade dos usuários:', integrity);
    
    if (!integrity.ok) {
        console.warn('⚠️ Problemas de integridade detectados, reparando...');
        UserManager.repair();
    }
    
    console.log('✅ Gerenciador de Usuários v3.1.8 carregado');
    console.log('💡 Comandos disponíveis:');
    console.log('  - UserManager.getAll()');
    console.log('  - UserManager.checkIntegrity()');
    console.log('  - UserManager.repair()');
    console.log('  - UserManager.count()');
    
})();
