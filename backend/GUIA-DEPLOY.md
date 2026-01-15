# 🚀 Guia de Deploy Completo - DOM Systems Backend + Frontend

Este guia explica passo a passo como fazer deploy do backend (API) e conectar com o frontend hospedado no GitHub Pages.

## 📋 Índice

1. [Preparação](#preparacao)
2. [Deploy do Backend (Railway)](#deploy-backend-railway)
3. [Deploy do Backend (Render - alternativa)](#deploy-backend-render)
4. [Conectar Frontend com Backend](#conectar-frontend)
5. [Testar Aplicação](#testar-aplicacao)
6. [Troubleshooting](#troubleshooting)

---

## <a name="preparacao"></a>🛠️ 1. Preparação

### Estrutura de Arquivos Necessária

Certifique-se de ter todos os arquivos do backend:

```
backend/
├── config/
│   └── database.js
├── middleware/
│   ├── auth.js
│   └── validation.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── clients.js
│   ├── orders.js
│   ├── services.js
│   └── crm.js
├── database/
│   ├── schema.sql
│   └── seed.sql
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

### Criar .gitignore

```
node_modules/
.env
*.log
.DS_Store
```

---

## <a name="deploy-backend-railway"></a>🚂 2. Deploy do Backend (Railway)

### Opção Recomendada ⭐

Railway oferece:
- ✅ Deploy gratuito
- ✅ PostgreSQL incluído
- ✅ Deploy automático via GitHub
- ✅ Fácil configuração

### Passo a Passo:

#### 2.1. Criar Conta no Railway

1. Acesse [Railway.app](https://railway.app)
2. Clique em **"Start a New Project"**
3. Faça login com GitHub

#### 2.2. Criar Novo Projeto

1. Clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha seu repositório (dom-systems-easy-office)
4. Selecione a pasta `backend/` (ou configure Root Directory)

#### 2.3. Adicionar PostgreSQL

1. No seu projeto Railway, clique em **"+ New"**
2. Selecione **"Database"** → **"PostgreSQL"**
3. Aguarde a criação (1-2 minutos)

#### 2.4. Configurar Variáveis de Ambiente

1. Clique no serviço Node.js (backend)
2. Vá em **"Variables"**
3. Adicione as variáveis:

```env
NODE_ENV=production
PORT=3000

# PostgreSQL (Railway fornece automaticamente)
# Copie do serviço PostgreSQL:
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=xxxxxxxx
DB_SSL=true

# JWT Secret (crie uma senha forte)
JWT_SECRET=sua_chave_secreta_super_forte_aqui_min_32_caracteres

# Frontend URL (seu GitHub Pages)
FRONTEND_URL=https://seu-usuario.github.io
```

**💡 Dica:** Railway auto-popula as variáveis do PostgreSQL. Vá em PostgreSQL → Variables e copie os valores.

#### 2.5. Executar Migrations

1. No Railway, vá em PostgreSQL
2. Clique em **"Data"** → **"Query"**
3. Execute o conteúdo de `database/schema.sql`
4. Execute o conteúdo de `database/seed.sql`

**Ou via CLI:**

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link ao projeto
railway link

# Executar migrations
railway run psql -f database/schema.sql
railway run psql -f database/seed.sql
```

#### 2.6. Deploy

1. Railway faz deploy automático quando você commita no GitHub
2. Aguarde o build (2-5 minutos)
3. Quando concluído, clique em **"Settings"** → **"Generate Domain"**
4. Copie a URL gerada, ex: `https://dom-systems-backend-production.up.railway.app`

#### 2.7. Testar API

```bash
# Health check
curl https://sua-url.railway.app/health

# Test endpoint
curl https://sua-url.railway.app/

# Login test
curl -X POST https://sua-url.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin","senha":"admin01"}'
```

---

## <a name="deploy-backend-render"></a>🎨 3. Deploy do Backend (Render - Alternativa)

### Passo a Passo:

#### 3.1. Criar Conta no Render

1. Acesse [Render.com](https://render.com)
2. Faça signup/login com GitHub

#### 3.2. Criar PostgreSQL Database

1. Dashboard → **"New +"** → **"PostgreSQL"**
2. Nome: `dom-systems-db`
3. Região: escolha mais próxima
4. Plan: **Free**
5. Clique em **"Create Database"**
6. Aguarde inicialização (2-3 minutos)

#### 3.3. Executar Migrations no PostgreSQL

1. No database criado, vá em **"Connect"**
2. Copie o **"External Database URL"**
3. No seu terminal local:

```bash
# Instalar psql se necessário
# Mac: brew install postgresql
# Ubuntu: sudo apt install postgresql-client

# Conectar e executar schema
psql "sua_url_aqui" -f backend/database/schema.sql

# Executar seed
psql "sua_url_aqui" -f backend/database/seed.sql
```

#### 3.4. Criar Web Service

1. Dashboard → **"New +"** → **"Web Service"**
2. Conecte seu repositório GitHub
3. Configurações:
   - **Name:** `dom-systems-backend`
   - **Region:** mesma do database
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

#### 3.5. Adicionar Variáveis de Ambiente

Na página do Web Service, vá em **"Environment"** e adicione:

```env
NODE_ENV=production
PORT=3000
DB_HOST=xxx.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=dom_systems_xxxx
DB_USER=dom_systems_xxxx_user
DB_PASSWORD=xxxxxxxx
DB_SSL=true
JWT_SECRET=sua_chave_secreta_forte_aqui
FRONTEND_URL=https://seu-usuario.github.io
```

**💡 Copie os dados do PostgreSQL** em: Database → Info → Connection String

#### 3.6. Deploy

1. Clique em **"Create Web Service"**
2. Aguarde build (3-5 minutos)
3. A URL será: `https://dom-systems-backend.onrender.com`

---

## <a name="conectar-frontend"></a>🔗 4. Conectar Frontend com Backend

Agora que o backend está online, precisamos adaptar o frontend para usar a API.

### 4.1. Criar Arquivo de Configuração da API

Crie um novo arquivo no frontend:

**`js/api-config.js`**

```javascript
// Configuração da API Backend
const API_CONFIG = {
  // URL do backend (Railway ou Render)
  BASE_URL: 'https://dom-systems-backend-production.up.railway.app',
  
  // Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      CHANGE_PASSWORD: '/api/auth/change-password'
    },
    USERS: '/api/users',
    CLIENTS: '/api/clients',
    ORDERS: '/api/orders',
    SERVICES: '/api/services',
    CRM: {
      LEADS: '/api/crm/leads',
      STATS: '/api/crm/stats'
    }
  },
  
  // Headers padrão
  getHeaders: () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }
};

// Funções auxiliares
const API = {
  // GET request
  get: async (endpoint) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: API_CONFIG.getHeaders()
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },
  
  // POST request
  post: async (endpoint, data) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: API_CONFIG.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },
  
  // PUT request
  put: async (endpoint, data) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: API_CONFIG.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },
  
  // DELETE request
  delete: async (endpoint) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: API_CONFIG.getHeaders()
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  }
};

console.log('✅ API Config carregada:', API_CONFIG.BASE_URL);
```

### 4.2. Incluir no HTML

Adicione no `index.html` e `dashboard.html` **ANTES** de todos os outros scripts:

```html
<!-- Configuração da API -->
<script src="js/api-config.js"></script>

<!-- Outros scripts -->
<script src="js/app.js"></script>
...
```

### 4.3. Atualizar integracao-auth.js

Substitua a função de login:

```javascript
// Login com API
async function realizarLogin() {
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;

  if (!email || !senha) {
    alert('Preencha todos os campos');
    return;
  }

  showLoading();

  try {
    // Chamar API
    const response = await API.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      email,
      senha
    });

    // Salvar token e dados do usuário
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('mfs_session', JSON.stringify(response.user));

    // Redirecionar
    window.location.href = 'dashboard.html';
  } catch (error) {
    console.error('❌ Erro no login:', error);
    alert('Credenciais inválidas');
  } finally {
    hideLoading();
  }
}
```

### 4.4. Atualizar app.js - Carregar Dados da API

Substitua as funções de carregamento:

```javascript
// Carregar clientes da API
async function loadClientes() {
  try {
    showLoading();
    const response = await API.get(API_CONFIG.ENDPOINTS.CLIENTS);
    AppState.clientes = response.clients || [];
    renderClientes();
  } catch (error) {
    console.error('❌ Erro ao carregar clientes:', error);
    AppState.clientes = [];
  } finally {
    hideLoading();
  }
}

// Carregar serviços da API
async function loadServicos() {
  try {
    const response = await API.get(API_CONFIG.ENDPOINTS.SERVICES);
    AppState.servicos = response.services || [];
    renderServicos();
    loadServicosSelect();
  } catch (error) {
    console.error('❌ Erro ao carregar serviços:', error);
    AppState.servicos = [];
  }
}

// Carregar ordens da API
async function loadOrdens() {
  try {
    const response = await API.get(API_CONFIG.ENDPOINTS.ORDERS);
    AppState.ordens = response.orders || [];
    renderOrdens();
  } catch (error) {
    console.error('❌ Erro ao carregar ordens:', error);
    AppState.ordens = [];
  }
}
```

### 4.5. Commit e Push

```bash
git add js/api-config.js integracao-auth.js js/app.js
git commit -m "Integrar frontend com backend API"
git push origin main
```

Aguarde 1-2 minutos para GitHub Pages atualizar.

---

## <a name="testar-aplicacao"></a>✅ 5. Testar Aplicação

### 5.1. Testar Backend

```bash
# Health check
curl https://sua-url-backend.railway.app/health

# Login
curl -X POST https://sua-url-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin","senha":"admin01"}'
```

### 5.2. Testar Frontend

1. Acesse: `https://seu-usuario.github.io/dom-systems-easy-office/`
2. Login: `admin` / `admin01`
3. Abra DevTools (F12) → Console
4. Verifique logs:
   - ✅ API Config carregada
   - ✅ Login realizado com sucesso
   - ✅ Dados carregados

### 5.3. Testar Funcionalidades

- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Criar cliente
- [ ] Criar serviço
- [ ] Criar ordem
- [ ] Criar lead CRM
- [ ] Dados persistem após recarregar
- [ ] Funciona em Chrome, Firefox, Safari
- [ ] Outro usuário pode ver dados cadastrados

---

## <a name="troubleshooting"></a>🐛 6. Troubleshooting

### Problema: CORS Error

**Erro:** `Access to fetch at '...' has been blocked by CORS policy`

**Solução:**

1. No backend, verifique `.env`:
```env
FRONTEND_URL=https://seu-usuario.github.io
```

2. No Railway/Render, adicione variável `FRONTEND_URL`

3. Restart do backend

### Problema: 401 Unauthorized

**Erro:** Todas as requisições retornam 401

**Solução:**

1. Verificar se o token está sendo salvo:
```javascript
console.log(localStorage.getItem('auth_token'));
```

2. Verificar headers nas requisições (DevTools → Network)

### Problema: Backend não inicia

**Erro:** Application failed to start

**Solução:**

1. Verificar logs no Railway/Render
2. Verificar `package.json`:
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

3. Verificar variáveis de ambiente

### Problema: Database connection failed

**Erro:** `Error: connect ECONNREFUSED`

**Solução:**

1. Verificar variáveis de ambiente do banco
2. Executar migrations novamente
3. Verificar `DB_SSL=true` em produção

---

## 📚 Recursos Adicionais

- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Express.js Docs](https://expressjs.com/)

---

## 🎉 Próximos Passos

Após deploy bem-sucedido:

1. ✅ Configurar domínio personalizado (opcional)
2. ✅ Configurar backups automáticos do banco
3. ✅ Implementar logs e monitoramento
4. ✅ Adicionar mais funcionalidades

---

**🚀 Parabéns! Seu sistema está online e funcionando globalmente!**
