# Sistema de Provas Online - Setup

## Pré-requisitos

- Node.js 18+ instalado
- Docker e Docker Compose instalados
- Git para clonar o repositório

## Estrutura do Projeto

```
/ic/
├── api/                 # API Flask (Backend)
│   ├── app.py
│   ├── models.py
│   ├── routes.py
│   ├── database.py
│   ├── init_db.py
│   ├── requirements.txt
│   └── Dockerfile
├── auto-correction/     # Frontend Next.js
│   ├── src/
│   │   ├── app/         # Páginas e rotas
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── contexts/    # Context providers
│   │   ├── hooks/       # Custom hooks
│   │   └── services/    # Serviços de API
│   ├── package.json
│   └── docker-compose.yml
```

## Setup Rápido

### 1. Backend API (Flask)

Navegue até o diretório da API:
```bash
cd ic/api
```

Execute com Docker:
```bash
docker compose up --build
```

Ou execute localmente:
```bash
# Instale as dependências
pip install -r requirements.txt

# Configure o banco de dados
python init_db.py

# Execute a aplicação
python app.py
```

A API estará disponível em `http://localhost:5000`

### 2. Frontend (Next.js)

Navegue até o diretório do frontend:
```bash
cd ic/auto-correction
```

Execute com Docker:
```bash
docker compose up --build
```

Ou execute localmente:
```bash
# Instale as dependências
npm install
# ou
pnpm install

# Execute em modo de desenvolvimento
npm run dev
# ou
pnpm dev
```

O frontend estará disponível em `http://localhost:3000`

## Configuração Completa (Recomendado)

Para executar todo o sistema (banco de dados + API + frontend):

```bash
cd ic/auto-correction
docker compose up --build
```

Isso iniciará:
- PostgreSQL na porta 5432
- API Flask na porta 5000
- Frontend Next.js na porta 3000

## Variáveis de Ambiente

### API (Flask)
- `DATABASE_URL`: URL de conexão com PostgreSQL
- `JWT_SECRET_KEY`: Chave secreta para JWT
- `FLASK_ENV`: Ambiente (development/production)

### Frontend (Next.js)
- `NEXT_PUBLIC_API_URL`: URL da API (padrão: http://localhost:5000)

## Credenciais Padrão

O sistema vem com um usuário administrador pré-configurado:

- **Email**: admin@admin.com
- **Senha**: admin123
- **Tipo**: Administrador

## Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/users/me` - Usuário atual

### Usuários
- `POST /api/users` - Criar usuário

### Provas
- `GET /api/exams` - Listar provas
- `POST /api/exams` - Criar prova
- `GET /api/exams/{id}` - Detalhes da prova
- `POST /api/exams/{id}/start` - Iniciar prova
- `POST /api/exams/{id}/questions` - Adicionar questão

### Respostas
- `POST /api/enrollments/{id}/submit-answer` - Submeter resposta
- `POST /api/enrollments/{id}/finish` - Finalizar prova

### Monitoramento
- `POST /api/monitoring/event` - Registrar evento

### Teste
- `GET /api/test` - Health check

## Funcionalidades Implementadas

### ✅ Autenticação
- Login/logout
- JWT tokens
- Controle de acesso por roles

### ✅ Gerenciamento de Usuários
- Cadastro de usuários
- Roles: admin, professor, student

### ✅ Gerenciamento de Provas
- Criar provas
- Definir horários
- Adicionar questões (múltipla escolha e dissertativas)
- Status das provas (rascunho, publicada, finalizada)

### ✅ Realização de Provas
- Iniciar prova
- Submeter respostas
- Auto-save de respostas
- Finalizar prova

### ✅ Monitoramento
- Eventos de foco/desfoque
- Registro de atividades suspeitas
- Captura de dados de sessão

### ✅ Frontend
- Interface responsiva
- Dashboard diferenciado por role
- Páginas de login/registro
- Criação de provas
- Sistema de notificações

## Problemas Comuns

### Erro de conexão com banco
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais de banco

### Erro CORS
- Verifique se a API está configurada para aceitar requisições do frontend
- Confirme a URL da API no frontend

### Dependências não encontradas
- Execute `npm install` ou `pnpm install` no frontend
- Execute `pip install -r requirements.txt` na API

## Desenvolvimento

Para desenvolvimento local, recomenda-se:

1. Executar o banco PostgreSQL via Docker
2. Executar a API Flask localmente para debug
3. Executar o frontend Next.js em modo dev

```bash
# Terminal 1 - Banco
docker run --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=exam_db -p 5432:5432 -d postgres:15

# Terminal 2 - API
cd ic/api
python app.py

# Terminal 3 - Frontend
cd ic/auto-correction
npm run dev
```

## Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a MIT License. 