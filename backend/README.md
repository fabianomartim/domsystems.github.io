# DOM Systems - Easy Office API

Backend REST API para o sistema DOM Systems - Easy Office.

## 🚀 Tecnologias

- **Node.js** 18+
- **Express** 4.18+
- **PostgreSQL** 14+
- **JWT** para autenticação
- **Bcrypt** para hash de senhas

## 📋 Pré-requisitos

- Node.js 18 ou superior
- PostgreSQL 14 ou superior
- npm ou yarn

## 🔧 Instalação Local

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
PORT=3000
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_systems
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
DB_SSL=false

# JWT
JWT_SECRET=sua_chave_secreta_aqui

# Frontend (CORS)
FRONTEND_URL=http://localhost:8080
```

### 3. Criar banco de dados

Conecte ao PostgreSQL e crie o banco:

```sql
CREATE DATABASE dom_systems;
```

### 4. Executar migrations (schema)

```bash
psql -U postgres -d dom_systems -f database/schema.sql
```

### 5. Popular dados iniciais (seed)

```bash
psql -U postgres -d dom_systems -f database/seed.sql
```

### 6. Iniciar servidor

```bash
# Desenvolvimento (com nodemon)
npm run dev

# Produção
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 📡 Endpoints da API

### Autenticação

#### POST /api/auth/login
Login de usuário

**Request:**
```json
{
  "email": "admin",
  "senha": "admin01"
}
```

**Response:**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "nome": "Olenir",
    "email": "admin",
    "is_admin": true,
    "ativo": true
  }
}
```

#### POST /api/auth/register
Registrar novo usuário

#### POST /api/auth/change-password
Trocar senha

### Usuários

Todas as rotas requerem autenticação (Bearer Token no header).

#### GET /api/users
Listar usuários (apenas admin)

#### GET /api/users/:id
Buscar usuário por ID

#### POST /api/users
Criar usuário (apenas admin)

#### PUT /api/users/:id
Atualizar usuário

#### DELETE /api/users/:id
Deletar usuário (apenas admin)

### Clientes

#### GET /api/clients
Listar clientes

**Query Params:**
- `search`: busca por nome, email ou telefone
- `ativo`: filtrar por status (true/false)

#### GET /api/clients/:id
Buscar cliente por ID

#### POST /api/clients
Criar cliente

#### PUT /api/clients/:id
Atualizar cliente

#### DELETE /api/clients/:id
Deletar cliente

### Serviços

#### GET /api/services
Listar tipos de serviço

#### GET /api/services/:id
Buscar serviço por ID

#### POST /api/services
Criar tipo de serviço

#### PUT /api/services/:id
Atualizar serviço

#### DELETE /api/services/:id
Deletar serviço

### Ordens de Serviço

#### GET /api/orders
Listar ordens de serviço

**Query Params:**
- `search`: busca por número da ordem ou cliente
- `status`: filtrar por status
- `cliente_id`: filtrar por cliente

#### GET /api/orders/:id
Buscar ordem por ID

#### POST /api/orders
Criar ordem de serviço

#### PUT /api/orders/:id
Atualizar ordem

#### DELETE /api/orders/:id
Deletar ordem

### CRM - Leads

#### GET /api/crm/leads
Listar leads

**Query Params:**
- `search`: busca por nome, empresa ou email
- `estagio`: filtrar por estágio
- `classificacao`: filtrar por classificação
- `fonte`: filtrar por fonte

#### GET /api/crm/leads/:id
Buscar lead por ID

#### GET /api/crm/stats
Obter estatísticas do CRM

#### POST /api/crm/leads
Criar lead

#### PUT /api/crm/leads/:id
Atualizar lead

#### DELETE /api/crm/leads/:id
Deletar lead

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação.

### Como usar:

1. Faça login no endpoint `/api/auth/login`
2. Receba o token JWT na resposta
3. Inclua o token em todas as requisições subsequentes:

```
Authorization: Bearer SEU_TOKEN_AQUI
```

## 🌐 Deploy

### Railway

1. Crie conta em [Railway.app](https://railway.app)
2. Conecte seu repositório GitHub
3. Adicione um PostgreSQL database
4. Configure as variáveis de ambiente
5. Deploy automático!

### Render

1. Crie conta em [Render.com](https://render.com)
2. Crie um novo Web Service
3. Conecte seu repositório
4. Adicione um PostgreSQL database
5. Configure as variáveis de ambiente
6. Deploy!

### Variáveis de ambiente para produção:

```env
NODE_ENV=production
PORT=3000
DB_HOST=seu_host_postgres
DB_PORT=5432
DB_NAME=dom_systems
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_SSL=true
JWT_SECRET=chave_secreta_forte_aqui
FRONTEND_URL=https://seu-usuario.github.io
```

## 📝 Dados Iniciais

O sistema vem com dados iniciais:

- **Usuário Admin:** 
  - Email: `admin`
  - Senha: `admin01`

- **31 Tipos de Serviço** pré-cadastrados (SRV-001 a SRV-031)

- **3 Clientes de exemplo**

- **3 Leads CRM de exemplo**

## 🧪 Testes

```bash
# Testar conexão com banco
node -e "require('./config/database').query('SELECT NOW()')"

# Health check
curl http://localhost:3000/health
```

## 📚 Estrutura do Projeto

```
backend/
├── config/
│   └── database.js          # Configuração PostgreSQL
├── middleware/
│   ├── auth.js              # Autenticação JWT
│   └── validation.js        # Validação de dados
├── routes/
│   ├── auth.js              # Rotas de autenticação
│   ├── users.js             # Rotas de usuários
│   ├── clients.js           # Rotas de clientes
│   ├── orders.js            # Rotas de ordens
│   ├── services.js          # Rotas de serviços
│   └── crm.js               # Rotas de CRM
├── database/
│   ├── schema.sql           # Schema do banco
│   └── seed.sql             # Dados iniciais
├── .env.example             # Exemplo de configuração
├── package.json
└── server.js                # Servidor principal
```

## 🐛 Debug

```bash
# Logs detalhados
DEBUG=* npm run dev

# Verificar variáveis de ambiente
node -e "console.log(process.env)"
```

## 📄 Licença

MIT

## 👥 Suporte

Para suporte, abra uma issue no repositório do projeto.
