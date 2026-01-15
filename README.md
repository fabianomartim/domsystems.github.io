# 🚀 DOM Systems - Easy Office

Sistema completo de gestão empresarial desenvolvido para a **DOM Systems**, com foco em gerenciamento de clientes, ordens de serviço e CRM.

![Versão](https://img.shields.io/badge/versão-3.1.8-blue.svg)
![Status](https://img.shields.io/badge/status-100%25%20funcional-success.svg)
![Licença](https://img.shields.io/badge/licença-MIT-green.svg)

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Instalação](#instalação)
- [Como Usar](#como-usar)
- [Demo Online](#demo-online)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Credenciais Padrão](#credenciais-padrão)
- [Contribuindo](#contribuindo)
- [Licença](#licença)
- [Contato](#contato)

---

## 🎯 Sobre o Projeto

DOM Systems - Easy Office é um sistema web completo de gestão empresarial com interface moderna e intuitiva. Desenvolvido com tecnologias web padrão (HTML5, CSS3, JavaScript ES6+), oferece solução completa para pequenas e médias empresas.

### ✨ Destaques

- ✅ **100% Funcional** - Sistema completo e testado
- 🎨 **Interface Moderna** - Design profissional e responsivo
- 📱 **Mobile First** - Funciona perfeitamente em dispositivos móveis
- 💾 **Sem Backend** - Funciona apenas com front-end (LocalStorage)
- 🔒 **Autenticação** - Sistema de login seguro
- 🛡️ **Backup Automático** - Proteção de dados integrada

---

## ⚡ Funcionalidades

### 1. 🔐 Sistema de Autenticação
- Login seguro com validação de credenciais
- Controle de sessão via localStorage
- Logout com confirmação
- Troca de senha obrigatória no primeiro acesso
- Redirecionamento automático

### 2. 👥 Gestão de Usuários
- CRUD completo de usuários
- Perfis: Administrador e Usuário
- Ativar/desativar usuários
- Resetar senhas (admin)
- Busca e filtros em tempo real

### 3. 📊 Dashboard
- Visão geral do sistema
- Estatísticas em tempo real
- Gráficos interativos
- Métricas de desempenho

### 4. 👤 Gestão de Clientes
- Cadastro completo (ID automático CLI-001, CLI-002...)
- Dados: Nome, Endereço, Telefones, Email, Empresa
- Busca e filtros em tempo real
- Edição e exclusão com confirmação
- Integração com ordens de serviço

### 5. 📋 Ordens de Serviço
- Criação vinculada a clientes
- 31 tipos de serviço disponíveis
- Status: Pendente, Em Andamento, Concluída, Cancelada
- Valores em USD
- Filtros avançados (Nº, cliente, data, status, tipo)
- IDs automáticos (OS-001, OS-002...)

### 6. 🛠️ Tipos de Serviço
- **31 serviços pré-cadastrados** incluindo:
  - FORM 1099, FORM BOI, FORM W9
  - Abertura de empresas (C CORP, LLC, S CORP)
  - Contabilidade (Pessoal, LLC, S CORP)
  - Declarações de Imposto
  - Documentação (Tradução, Passaporte, ITIN, EIN)
- CRUD completo
- Valores padrão configuráveis

### 7. 🎯 CRM - Módulo Completo

#### 7.1 Gestão de Leads
- **25+ campos de dados**:
  - Dados Pessoais: Nome, Empresa, Cargo
  - Contato: 2 emails, 2 telefones (formato US)
  - Endereço: Rua, Cidade, Estado (50 estados + DC), ZIP Code
  - Oportunidade: Proposta, Valor, Estágio, Probabilidade, Data
  - Origem: Fonte, Classificação, Redes Sociais
- **Formatação US**: Telefones (555) 123-4567, ZIP 12345-6789
- **Estados Americanos**: Lista completa de 51 opções

#### 7.2 Pipeline de Vendas
- **7 Estágios**: Prospecção → Qualificação → Proposta → Negociação → Fechamento → Ganho/Perdido
- Acompanhamento de probabilidade (0-100%)
- Valor estimado por oportunidade
- Data prevista de fechamento

#### 7.3 Estatísticas CRM
- Total de Leads
- Leads Quentes
- Valor do Pipeline (USD)
- Oportunidades Abertas

#### 7.4 Busca e Filtros
- Busca por: nome, empresa, email, telefone, ID
- Filtros: Estágio (7), Classificação (6), Fonte (7)
- Exportação para CSV

### 8. 💾 Sistema de Backup
- Backup automático a cada 5 minutos
- Backup antes de fechar página
- Histórico dos últimos 5 backups
- Exportação/Importação completa
- Proteção de 7 tipos de dados

### 9. 📱 Responsividade
- Desktop (1024px+)
- Tablet (768-1024px)
- Mobile (360-768px)
- Otimizado para iOS e Android

---

## 🛠️ Tecnologias Utilizadas

### Front-end
- **HTML5** - Estrutura semântica
- **CSS3** - Estilização moderna (Grid, Flexbox, Animations)
- **JavaScript ES6+** - Lógica e interatividade
- **Font Awesome 6.4.0** - Ícones
- **Google Fonts (Inter)** - Tipografia

### Bibliotecas
- **Chart.js** - Gráficos interativos
- **LocalStorage API** - Persistência de dados

### Ferramentas
- **Git/GitHub** - Controle de versão
- **GitHub Pages** - Hospedagem gratuita

---

## 📥 Instalação

### Opção 1: Clonar Repositório

```bash
# Clone o repositório
git clone https://github.com/SEU-USUARIO/dom-systems-easy-office.git

# Entre na pasta
cd dom-systems-easy-office

# Abra no navegador
# Opção A: Servidor local Python
python -m http.server 8000
# Acesse: http://localhost:8000

# Opção B: Servidor local Node.js
npx serve
# Acesse: http://localhost:3000

# Opção C: Abrir diretamente
# Abra o arquivo index.html no navegador
```

### Opção 2: Download ZIP

1. Clique em **Code** → **Download ZIP**
2. Extraia o arquivo
3. Abra `index.html` no navegador

---

## 🎮 Como Usar

### 1. Primeiro Acesso

```
URL: http://localhost:8000/index.html (ou sua URL)
Usuário: admin
Senha: admin01
```

### 2. Explorar o Sistema

1. **Dashboard**: Visão geral
2. **Clientes**: Cadastrar novos clientes
3. **Ordens**: Criar ordens de serviço
4. **Serviços**: Ver 31 tipos disponíveis
5. **CRM**: Gerenciar leads
6. **Administração**: Gerenciar usuários (apenas admin)

### 3. Criar Novo Usuário

```
Menu: Administração → Usuários → Novo Usuário

Dados necessários:
- Nome completo
- Email (único)
- Senha (mínimo 6 caracteres)
- Tipo: Administrador ou Usuário
- Status: Ativo/Inativo
```

### 4. Cadastrar Cliente

```
Menu: Clientes → Novo Cliente

Dados necessários:
- ID: Gerado automaticamente (CLI-001)
- Nome completo
- Telefone principal
```

### 5. Criar Ordem de Serviço

```
Menu: Ordens de Serviço → Nova Ordem

Dados necessários:
- Selecionar cliente
- Selecionar tipo de serviço
- Data
- Responsável
- Status
```

### 6. Gerenciar Leads (CRM)

```
Menu: CRM → Novo Lead

Dados principais:
- Nome completo e empresa
- Email e telefone (formato US)
- Estado americano
- ZIP Code
- Proposta e valor estimado
- Estágio da oportunidade
```

---

## 🌐 Demo Online

### Hospedado no GitHub Pages

```
https://SEU-USUARIO.github.io/dom-systems-easy-office/
```

**Credenciais de Teste**:
- Usuário: `admin`
- Senha: `admin01`

---

## 📂 Estrutura do Projeto

```
dom-systems-easy-office/
│
├── index.html                 # Página de login
├── dashboard.html             # Painel principal
├── trocar-senha.html          # Troca de senha
├── integracao-auth.js         # Sistema de autenticação
│
├── css/
│   ├── style.css              # Estilos principais
│   └── crm-styles.css         # Estilos do CRM
│
├── js/
│   ├── user-manager.js        # Gerenciador de usuários (v3.1.8)
│   ├── data-preservation.js   # Sistema de backup automático
│   ├── data-recovery.js       # Recuperação de dados
│   ├── emergency-recovery.js  # Recuperação emergencial
│   ├── app.js                 # Lógica principal
│   ├── admin-usuarios.js      # Administração de usuários
│   ├── crm.js                 # Módulo CRM
│   ├── logo-fix.js            # Correção de logo
│   ├── us-formatting.js       # Formatação US
│   └── trocar-senha.js        # Troca de senha
│
├── images/
│   └── logo.png               # Logo DOM Systems
│
├── docs/
│   ├── INSTALACAO.md          # Guia de instalação
│   ├── API.md                 # Documentação da API
│   └── CHANGELOG.md           # Histórico de versões
│
├── README.md                  # Este arquivo
├── LICENSE                    # Licença MIT
└── .gitignore                 # Arquivos ignorados
```

---

## 🔑 Credenciais Padrão

### Usuário Administrador

```
Email/Usuário: admin
Senha: admin01
Tipo: Administrador
```

> ⚠️ **IMPORTANTE**: Altere a senha padrão após o primeiro acesso!

---

## 🎨 Capturas de Tela

### Tela de Login
![Login](docs/screenshots/login.png)

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### CRM - Gestão de Leads
![CRM](docs/screenshots/crm.png)

### Ordens de Serviço
![Ordens](docs/screenshots/ordens.png)

---

## 🔧 Configuração Avançada

### Personalizar Logo

1. Substitua `images/logo.png` pela sua logo
2. Tamanho recomendado: 120x120px
3. Formato: PNG com fundo transparente

### Alterar Cores

Edite `css/style.css`:

```css
:root {
    --primary-color: #4a90e2;      /* Cor principal */
    --secondary-color: #7b68ee;    /* Cor secundária */
    --success-color: #28a745;      /* Verde de sucesso */
    --danger-color: #dc3545;       /* Vermelho de erro */
}
```

### Adicionar Tipos de Serviço

Edite `js/data-recovery.js`:

```javascript
const SERVICOS_PADRAO = [
    // Adicionar novo serviço
    { 
        codigo: '032', 
        nome: 'NOVO SERVIÇO', 
        descricao: 'DESCRIÇÃO', 
        valor_padrao: 100 
    }
];
```

---

## 🧪 Testes

### Testar Localmente

```bash
# Servidor Python
python -m http.server 8000

# Abrir navegador
http://localhost:8000

# Executar testes
# 1. Login
# 2. Criar cliente
# 3. Criar ordem
# 4. Criar lead
# 5. Verificar backup
```

### Console de Diagnóstico

```javascript
// Abrir Console (F12) e executar:

// Ver usuários
UserManager.getAll()

// Ver integridade
UserManager.checkIntegrity()

// Ver serviços
window.listarServicos()

// Diagnóstico CRM
RecuperacaoEmergencial.diagnostico()
```

---

## 🤝 Contribuindo

Contribuições são sempre bem-vindas!

### Como Contribuir

1. **Fork o projeto**
2. **Crie uma branch** para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. **Commit suas mudanças** (`git commit -m 'Adiciona nova funcionalidade'`)
4. **Push para a branch** (`git push origin feature/NovaFuncionalidade`)
5. **Abra um Pull Request**

### Diretrizes

- Siga o padrão de código existente
- Adicione comentários em português
- Teste antes de enviar
- Atualize a documentação se necessário

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

```
MIT License

Copyright (c) 2026 DOM Systems

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

## 📞 Contato

**DOM Systems**

- Website: [www.domsystems.com](https://www.domsystems.com)
- Email: contato@domsystems.com
- GitHub: [@domsystems](https://github.com/domsystems)

---

## 🙏 Agradecimentos

- Font Awesome - Ícones
- Google Fonts - Tipografia Inter
- Chart.js - Gráficos
- Comunidade Open Source

---

## 📊 Status do Projeto

### Versão Atual: 3.1.8

| Módulo | Status | Cobertura |
|--------|--------|-----------|
| Autenticação | ✅ Completo | 100% |
| Dashboard | ✅ Completo | 100% |
| Clientes | ✅ Completo | 100% |
| Ordens | ✅ Completo | 100% |
| Serviços | ✅ Completo | 100% |
| CRM | ✅ Completo | 100% |
| Admin Usuários | ✅ Completo | 100% |
| Backup | ✅ Completo | 100% |
| Responsivo | ✅ Completo | 100% |

---

## 🗺️ Roadmap

### Versão 3.2.0 (Planejada)
- [ ] Relatórios em PDF
- [ ] Gráficos avançados
- [ ] Integração com email
- [ ] Notificações push

### Versão 4.0.0 (Futuro)
- [ ] Backend real (Node.js/Express)
- [ ] Banco de dados (PostgreSQL)
- [ ] API RESTful completa
- [ ] Autenticação JWT
- [ ] Deploy em cloud (AWS/Azure)

---

## 🐛 Reportar Bugs

Encontrou um bug? Por favor, abra uma [issue](https://github.com/SEU-USUARIO/dom-systems-easy-office/issues) com:

1. **Descrição clara** do problema
2. **Passos para reproduzir**
3. **Comportamento esperado**
4. **Screenshots** (se aplicável)
5. **Navegador e versão**

---

## ⭐ Dê uma Estrela!

Se este projeto foi útil, considere dar uma ⭐ no GitHub!

---

## 📜 Changelog

### v3.1.8 (14/01/2026)
- ✅ UserManager implementado (solução definitiva)
- ✅ Persistência de usuários corrigida
- ✅ Backup automático melhorado
- ✅ Chaves do localStorage corrigidas

### v3.1.7 (14/01/2026)
- ✅ Correção: dados não apareciam na tela
- ✅ Campo nome_servico corrigido
- ✅ Carregamento prioriza localStorage

### v3.1.6 (14/01/2026)
- ✅ Sistema de recuperação emergencial
- ✅ 31 tipos de serviço restaurados

### v3.1.4 (14/01/2026)
- ✅ Formatação US implementada
- ✅ Estados americanos
- ✅ ZIP Code formato correto

### v3.1.0 (13/01/2026)
- ✅ CRM completo integrado
- ✅ Modal de cadastro de leads
- ✅ Exportação CSV

### v3.0.0 (13/01/2026)
- ✅ Rebranding DOM Systems
- ✅ Nova identidade visual
- ✅ Logo atualizada

---

<div align="center">

**Desenvolvido com ❤️ pela equipe DOM Systems**

[⬆ Voltar ao topo](#-dom-systems---easy-office)

</div>
