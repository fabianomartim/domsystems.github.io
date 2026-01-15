-- DOM Systems - Easy Office
-- Seed Data - Dados Iniciais
-- Execute após criar o schema

-- ======================
-- USUÁRIO ADMIN INICIAL
-- ======================
-- Senha: admin01 (hash bcrypt)
INSERT INTO usuarios (id, nome, email, senha, is_admin, ativo, primeiro_acesso) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Olenir', 'admin', '$2a$10$fR7MJK8qY8z3qZLqR5ZGY.VrQf7KvB5hH6pZfPxY9xUXvBwQrjHlS', true, true, false)
ON CONFLICT (email) DO NOTHING;

-- ======================
-- TIPOS DE SERVIÇO (31 serviços do sistema)
-- ======================
INSERT INTO tipos_servico (codigo, nome_servico, descricao, valor_padrao, ativo) VALUES
('SRV-001', 'FORM 1099', 'Formulário 1099 para declaração de rendimentos', 150.00, true),
('SRV-002', 'FORM BOI', 'Formulário BOI (Beneficial Ownership Information)', 200.00, true),
('SRV-003', 'PLANO EMERGENCIAL', 'Plano de emergência empresarial', 350.00, true),
('SRV-004', 'FORM W9', 'Formulário W-9 para identificação fiscal', 50.00, true),
('SRV-005', 'EMPRESA C CORP', 'Constituição de empresa C Corporation', 1200.00, true),
('SRV-006', 'EMPRESA LLC', 'Constituição de empresa LLC', 1000.00, true),
('SRV-007', 'EIN', 'Obtenção de EIN (Employer Identification Number)', 100.00, true),
('SRV-008', 'ITIN', 'Obtenção de ITIN (Individual Taxpayer Identification Number)', 250.00, true),
('SRV-009', 'RENOVACAO LLC', 'Renovação anual de LLC', 300.00, true),
('SRV-010', 'RENOVACAO C CORP', 'Renovação anual de C Corporation', 400.00, true),
('SRV-011', 'LICENCA COMERCIAL', 'Obtenção de licença comercial', 500.00, true),
('SRV-012', 'TAX RETURN PESSOA FISICA', 'Declaração de imposto de renda pessoa física', 300.00, true),
('SRV-013', 'TAX RETURN EMPRESA', 'Declaração de imposto de renda empresarial', 800.00, true),
('SRV-014', 'CONSULTORIA FISCAL', 'Consultoria e planejamento fiscal', 250.00, true),
('SRV-015', 'ABERTURA CONTA BANCARIA', 'Assistência para abertura de conta bancária', 200.00, true),
('SRV-016', 'VISTO E2', 'Assessoria para visto E2 de investidor', 2500.00, true),
('SRV-017', 'VISTO EB5', 'Assessoria para visto EB5 de investidor', 5000.00, true),
('SRV-018', 'GREEN CARD', 'Assessoria para Green Card', 3000.00, true),
('SRV-019', 'TRADUCAO JURAMENTADA', 'Tradução juramentada de documentos', 100.00, true),
('SRV-020', 'APOSTILAMENTO HAIA', 'Apostilamento de documentos conforme Convenção de Haia', 80.00, true),
('SRV-021', 'REGISTRO MARCA', 'Registro de marca (trademark)', 1500.00, true),
('SRV-022', 'CONTRATO SOCIAL', 'Elaboração de contrato social', 500.00, true),
('SRV-023', 'ACORDO OPERACIONAL LLC', 'Operating Agreement para LLC', 400.00, true),
('SRV-024', 'BYLAWS C CORP', 'Bylaws para C Corporation', 450.00, true),
('SRV-025', 'ANNUAL REPORT', 'Elaboração de relatório anual', 350.00, true),
('SRV-026', 'PROCURACAO', 'Elaboração de procuração', 150.00, true),
('SRV-027', 'SERVICOS CONTABEIS', 'Serviços contábeis mensais', 500.00, true),
('SRV-028', 'FOLHA PAGAMENTO', 'Processamento de folha de pagamento', 300.00, true),
('SRV-029', 'COMPLIANCE ANUAL', 'Verificação e compliance anual', 600.00, true),
('SRV-030', 'DISSOLUCAO EMPRESA', 'Dissolução de empresa', 800.00, true),
('SRV-031', 'AUTORIZACAO DE VIAGEM', 'Autorização de viagem para menores', 150.00, true)
ON CONFLICT (codigo) DO NOTHING;

-- ======================
-- CLIENTES DE EXEMPLO
-- ======================
INSERT INTO clientes (nome, email, telefone, tipo_pessoa, documento, cidade, estado, ativo) VALUES
('João Silva', 'joao.silva@email.com', '+1-305-123-4567', 'fisica', '123.456.789-00', 'Miami', 'FL', true),
('Maria Santos', 'maria.santos@email.com', '+1-305-234-5678', 'fisica', '987.654.321-00', 'Orlando', 'FL', true),
('Tech Solutions LLC', 'contato@techsolutions.com', '+1-305-345-6789', 'juridica', '12.345.678/0001-90', 'Tampa', 'FL', true)
ON CONFLICT DO NOTHING;

-- ======================
-- LEADS CRM DE EXEMPLO
-- ======================
INSERT INTO crm_leads (nome, email, telefone, empresa, cargo, fonte, estagio, classificacao, valor_estimado) VALUES
('Carlos Oliveira', 'carlos@example.com', '+1-305-111-2222', 'Oliveira Imports', 'CEO', 'website', 'qualificacao', 'quente', 5000.00),
('Ana Paula', 'ana@example.com', '+1-305-222-3333', 'AP Consulting', 'Proprietária', 'indicacao', 'proposta', 'quente', 3500.00),
('Roberto Lima', 'roberto@example.com', '+1-305-333-4444', NULL, NULL, 'email', 'novo', 'morno', 1500.00)
ON CONFLICT DO NOTHING;

-- ======================
-- MENSAGENS DE CONCLUSÃO
-- ======================
DO $$
BEGIN
    RAISE NOTICE '✅ Seed concluído com sucesso!';
    RAISE NOTICE '📊 Usuário admin criado: admin / admin01';
    RAISE NOTICE '📋 31 tipos de serviço inseridos';
    RAISE NOTICE '👥 3 clientes de exemplo criados';
    RAISE NOTICE '💼 3 leads CRM de exemplo criados';
END $$;
