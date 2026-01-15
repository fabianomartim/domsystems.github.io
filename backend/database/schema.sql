-- DOM Systems - Easy Office
-- Database Schema
-- PostgreSQL 14+

-- Extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================
-- TABELA: USUÁRIOS
-- ======================
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    ativo BOOLEAN DEFAULT true,
    primeiro_acesso BOOLEAN DEFAULT true,
    ultimo_acesso TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_ativo ON usuarios(ativo);

-- ======================
-- TABELA: CLIENTES
-- ======================
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(50),
    tipo_pessoa VARCHAR(20) CHECK (tipo_pessoa IN ('fisica', 'juridica')),
    documento VARCHAR(50), -- CPF ou CNPJ
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(20),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_clientes_nome ON clientes(nome);
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_ativo ON clientes(ativo);

-- ======================
-- TABELA: TIPOS DE SERVIÇO
-- ======================
CREATE TABLE IF NOT EXISTS tipos_servico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome_servico VARCHAR(255) NOT NULL,
    descricao TEXT,
    valor_padrao DECIMAL(10, 2) DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_tipos_servico_codigo ON tipos_servico(codigo);
CREATE INDEX idx_tipos_servico_ativo ON tipos_servico(ativo);

-- ======================
-- TABELA: ORDENS DE SERVIÇO
-- ======================
CREATE TABLE IF NOT EXISTS ordens_servico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_ordem VARCHAR(50) UNIQUE NOT NULL,
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    servico_id UUID REFERENCES tipos_servico(id) ON DELETE RESTRICT,
    descricao TEXT,
    valor DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluido', 'cancelado')),
    data_entrega DATE,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_ordens_numero ON ordens_servico(numero_ordem);
CREATE INDEX idx_ordens_cliente ON ordens_servico(cliente_id);
CREATE INDEX idx_ordens_servico ON ordens_servico(servico_id);
CREATE INDEX idx_ordens_status ON ordens_servico(status);

-- ======================
-- TABELA: CRM LEADS
-- ======================
CREATE TABLE IF NOT EXISTS crm_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(50),
    empresa VARCHAR(255),
    cargo VARCHAR(100),
    fonte VARCHAR(50) CHECK (fonte IN ('website', 'indicacao', 'email', 'telefone', 'redes_sociais', 'evento', 'outro')),
    estagio VARCHAR(50) DEFAULT 'novo' CHECK (estagio IN ('novo', 'contato_inicial', 'qualificacao', 'proposta', 'negociacao', 'oportunidade', 'convertido', 'perdido')),
    classificacao VARCHAR(20) DEFAULT 'morno' CHECK (classificacao IN ('frio', 'morno', 'quente')),
    valor_estimado DECIMAL(10, 2),
    data_contato DATE,
    proxima_acao TEXT,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_crm_leads_nome ON crm_leads(nome);
CREATE INDEX idx_crm_leads_email ON crm_leads(email);
CREATE INDEX idx_crm_leads_estagio ON crm_leads(estagio);
CREATE INDEX idx_crm_leads_classificacao ON crm_leads(classificacao);
CREATE INDEX idx_crm_leads_fonte ON crm_leads(fonte);

-- ======================
-- FUNÇÕES DE ATUALIZAÇÃO
-- ======================

-- Função para atualizar automaticamente o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tipos_servico_updated_at BEFORE UPDATE ON tipos_servico
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ordens_servico_updated_at BEFORE UPDATE ON ordens_servico
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_leads_updated_at BEFORE UPDATE ON crm_leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ======================
-- VIEWS ÚTEIS
-- ======================

-- View: Ordens com informações completas
CREATE OR REPLACE VIEW view_ordens_completas AS
SELECT 
    o.id,
    o.numero_ordem,
    o.descricao,
    o.valor,
    o.status,
    o.data_entrega,
    o.observacoes,
    o.created_at,
    o.updated_at,
    c.id as cliente_id,
    c.nome as cliente_nome,
    c.email as cliente_email,
    c.telefone as cliente_telefone,
    s.id as servico_id,
    s.codigo as servico_codigo,
    s.nome_servico,
    s.valor_padrao as servico_valor_padrao
FROM ordens_servico o
LEFT JOIN clientes c ON o.cliente_id = c.id
LEFT JOIN tipos_servico s ON o.servico_id = s.id;

-- View: Estatísticas CRM
CREATE OR REPLACE VIEW view_crm_stats AS
SELECT 
    COUNT(*) as total_leads,
    COUNT(*) FILTER (WHERE estagio = 'novo') as novos,
    COUNT(*) FILTER (WHERE estagio = 'contato_inicial') as contato_inicial,
    COUNT(*) FILTER (WHERE estagio = 'qualificacao') as qualificacao,
    COUNT(*) FILTER (WHERE estagio = 'proposta') as proposta,
    COUNT(*) FILTER (WHERE estagio = 'negociacao') as negociacao,
    COUNT(*) FILTER (WHERE estagio = 'oportunidade') as oportunidade,
    COUNT(*) FILTER (WHERE estagio = 'convertido') as convertido,
    COUNT(*) FILTER (WHERE estagio = 'perdido') as perdido,
    COUNT(*) FILTER (WHERE classificacao = 'quente') as quentes,
    COUNT(*) FILTER (WHERE classificacao = 'morno') as mornos,
    COUNT(*) FILTER (WHERE classificacao = 'frio') as frios,
    SUM(valor_estimado) as valor_total_pipeline
FROM crm_leads;

COMMENT ON TABLE usuarios IS 'Usuários do sistema com autenticação';
COMMENT ON TABLE clientes IS 'Cadastro de clientes da empresa';
COMMENT ON TABLE tipos_servico IS 'Tipos de serviços oferecidos';
COMMENT ON TABLE ordens_servico IS 'Ordens de serviço abertas';
COMMENT ON TABLE crm_leads IS 'Leads do CRM';
