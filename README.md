# EduTrack AI

Aplicativo de gestão acadêmica: o estudante cadastra suas disciplinas e tarefas, acompanha o progresso em um dashboard, recebe recomendações de priorização e estuda com um tutor virtual de IA.

Projeto da disciplina **Innovation Lab: Desenvolvimento Avançado No/Low Code** (Faculdade Impacta), desenvolvido com a metodologia **Spec-Driven Development (OpenSpec)**.

> **Nota sobre a stack:** o enunciado da disciplina sugere FlutterFlow + Xano. Como a escolha de tecnologias era livre, este projeto usa **React + Node.js/Express + SQL Server**, com um microsserviço em **Python** para os cálculos avançados.

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Como executar](#como-executar)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [API](#api)
- [Banco de dados](#banco-de-dados)
- [Segurança](#segurança)
- [Metodologia: OpenSpec](#metodologia-openspec)
- [Testes](#testes)
- [Problemas comuns](#problemas-comuns)
- [Limitações conhecidas e próximos passos](#limitações-conhecidas-e-próximos-passos)
- [Autor](#autor)

## Funcionalidades

**Conta e acesso**
- Cadastro e login com e-mail e senha (JWT)
- Recuperação de senha por e-mail, com link de validade de 1 hora
- Perfil: editar nome e e-mail, alterar senha, escolher tema e cor do avatar
- Sessão expirada é limpa automaticamente, com redirecionamento para o login

**Estudos**
- **Disciplinas:** criar, editar e excluir (nome, professor, carga horária, descrição, datas de início e fim)
- **Tarefas:** vinculadas a uma disciplina, com prazo e status (pendente, em andamento, concluída) e troca rápida de status
- **Busca e filtros:** por texto, status, disciplina e período, com resultados em tempo real e filtro de atrasadas

**Acompanhamento**
- **Dashboard:** percentual de progresso por disciplina, progresso geral, totais, carga horária por disciplina e próximas tarefas, com destaque para as atrasadas
- **Insights (Python):** progresso ponderado pela carga horária, previsão simplificada de dias restantes e recomendações de quais disciplinas priorizar

**Tutor virtual com IA**
- Chat com um professor particular que conhece a disciplina escolhida (descrição e tarefas)
- Quatro modos de estudo: **Professor**, **Exercícios**, **Revisão** e **Socrático**
- Histórico de conversas (continuar, trocar de modo, excluir)
- Respostas em Markdown, com blocos de código coloridos
- Limites de uso por mensagem, por minuto e por dia

**Geral**
- Landing page pública na raiz (`/`)
- Tema claro e escuro
- Interface responsiva (celular e computador)
- Documentação interativa da API (Swagger)

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Frontend | React, Vite, React Router, Axios, react-markdown, rehype-highlight |
| Backend | Node.js, Express, mssql, JWT, bcrypt, Nodemailer, express-rate-limit, swagger-jsdoc, swagger-ui-express |
| Insights | Python, FastAPI, Uvicorn, Pydantic |
| Banco de dados | SQL Server 2022 (Docker) |
| IA | API do Google Gemini (acessada somente pelo backend) |
| Metodologia | OpenSpec, Git/GitHub, Conventional Commits |

## Arquitetura

```
React (5173) ──HTTP + JWT──▶ Express API (3000) ──▶ SQL Server (1433)
                                   │
                                   ├──▶ Insights FastAPI (8000)
                                   └──▶ Gemini API (externa)
```

- O **Express é o centro do sistema**: autentica, acessa o banco e chama os outros serviços. O frontend conversa apenas com ele.
- O serviço de **insights** só recebe dados e devolve cálculos; ele não acessa o banco nem autentica ninguém.
- O **tutor** fica isolado em um adaptador (`llm.service.js`): trocar de provedor de IA significa alterar esse arquivo e duas variáveis de ambiente.
- A chave da IA fica **somente no backend**, nunca no frontend.

## Estrutura do repositório

```
edutrack/
├── edutrack-api/          API (Node.js + Express)
│   ├── src/
│   │   ├── config/        conexão com o banco, e-mail e Swagger
│   │   ├── controllers/   regras de cada recurso
│   │   ├── middlewares/   autenticação (JWT) e limite de requisições
│   │   ├── routes/        rotas e documentação Swagger
│   │   ├── services/      cliente da IA e prompts do tutor
│   │   └── server.js
│   └── .env.example       modelo das variáveis de ambiente
├── edutrack-front/        Interface (React + Vite)
│   └── src/               api, components, context, pages
├── edutrack-insights/     Microsserviço Python (FastAPI)
│   ├── main.py
│   └── requirements.txt
├── openspec/              especificações (specs/) e histórico de mudanças (changes/)
└── AGENTS.md              regras do projeto para agentes de IA
```

## Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org) 20 ou superior
- [Python](https://www.python.org) 3.10 ou superior
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git
- Uma ferramenta para rodar SQL no SQL Server (SSMS ou a extensão *SQL Server (mssql)* do VS Code)
- Uma chave da API do Gemini, obtida no [Google AI Studio](https://aistudio.google.com) (necessária só para o tutor)
- Uma senha de app do Gmail (necessária só para a recuperação de senha)

### 1. Clonar o repositório

```bash
git clone https://github.com/cauagoncalves-p/edutrack.git
cd edutrack
```

### 2. Subir o banco de dados

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=Sua_Senha_Forte_123" -p 1433:1433 --name sqlserver-edutrack -d mcr.microsoft.com/mssql/server:2022-latest
```

A senha precisa ter letras maiúsculas e minúsculas, números e pelo menos 8 caracteres. Nas próximas vezes, basta `docker start sqlserver-edutrack`.

### 3. Criar o banco, as tabelas e o login da aplicação

Conecte-se ao SQL Server (`localhost,1433`, autenticação **SQL Server**, usuário `sa`, marcando *Trust server certificate*) e execute o script abaixo.

<details>
<summary>Script completo do banco de dados</summary>

```sql
CREATE DATABASE EduTrackDB;
GO

USE EduTrackDB;
GO

CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255) NULL,
    reset_token_expires DATETIME NULL,
    created_at DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE subjects (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    teacher VARCHAR(150) NULL,
    workload_hours INT NULL,
    description VARCHAR(MAX) NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_subjects_users FOREIGN KEY (user_id) REFERENCES users(id)
);
GO

CREATE TABLE academic_tasks (
    id INT IDENTITY(1,1) PRIMARY KEY,
    subject_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description VARCHAR(MAX) NULL,
    due_date DATE NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_academic_tasks_subjects FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT CK_academic_tasks_status CHECK (status IN ('pending', 'in_progress', 'completed'))
);
GO

CREATE TABLE tutor_conversations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
    subject_id INT NULL FOREIGN KEY REFERENCES subjects(id) ON DELETE SET NULL,
    mode VARCHAR(20) NOT NULL DEFAULT 'teacher'
        CHECK (mode IN ('teacher','exercises','review','socratic')),
    title NVARCHAR(150) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE tutor_messages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    conversation_id INT NOT NULL
        FOREIGN KEY REFERENCES tutor_conversations(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user','assistant')),
    content NVARCHAR(MAX) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- Login usado pela API (troque a senha)
CREATE LOGIN edutrack_api WITH PASSWORD = 'Outra_Senha_Forte_456', CHECK_POLICY = ON, CHECK_EXPIRATION = OFF;
GO

CREATE USER edutrack_api FOR LOGIN edutrack_api;
ALTER ROLE db_owner ADD MEMBER edutrack_api;
GO
```

</details>

> O login `edutrack_api` recebe a função `db_owner` por conveniência no desenvolvimento local. Em um ambiente real, restrinja as permissões ao necessário.

### 4. Configurar e iniciar a API

```bash
cd edutrack-api
npm install
```

Crie o arquivo `.env` a partir do modelo e preencha os valores (veja [Variáveis de ambiente](#variáveis-de-ambiente)):

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

Para gerar o `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Inicie a API:

```bash
npm run dev
```

No terminal devem aparecer a confirmação de conexão com o banco e `Servidor rodando na porta 3000`.

### 5. Iniciar o serviço de insights

Em outro terminal:

```bash
cd edutrack-insights
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

Confirme em `http://localhost:8000/health`.

### 6. Iniciar o frontend

Em outro terminal:

```bash
cd edutrack-front
npm install
npm run dev
```

Abra `http://localhost:5173`, crie uma conta e comece a usar.

### Resumo dos serviços

| Serviço | Endereço | Observação |
|---|---|---|
| Frontend | http://localhost:5173 | landing page em `/` |
| API | http://localhost:3000 | Swagger em `/api-docs` |
| Insights | http://localhost:8000 | documentação em `/docs` |
| SQL Server | localhost:1433 | container `sqlserver-edutrack` |

O frontend aponta para a API em `edutrack-front/src/api/axios.js`, e a API aponta para o serviço de insights em `edutrack-api/src/controllers/insights.controller.js`. Para testar em outro dispositivo da mesma rede, inicie o frontend com `npm run dev -- --host` e troque `localhost` pelo IP do computador no `axios.js`.

## Variáveis de ambiente

Arquivo `edutrack-api/.env`. **Nunca versione este arquivo.** Valores com `#` ou espaços devem ficar entre aspas.

| Variável | Descrição |
|---|---|
| `EDUTRACK_DB_SERVER` | Endereço do SQL Server (`localhost`) |
| `EDUTRACK_DB_PORT` | Porta do SQL Server (`1433`) |
| `EDUTRACK_DB_NAME` | Nome do banco (`EduTrackDB`) |
| `EDUTRACK_DB_USER` | Login da aplicação (`edutrack_api`) |
| `EDUTRACK_DB_PASSWORD` | Senha desse login |
| `JWT_SECRET` | Segredo usado para assinar os tokens |
| `PORT` | Porta da API (`3000`) |
| `EMAIL_USER` | Conta Gmail que envia a recuperação de senha |
| `EMAIL_PASSWORD` | **Senha de app** do Gmail (não é a senha da conta) |
| `FRONTEND_URL` | Endereço do frontend, usado no link do e-mail (`http://localhost:5173`) |
| `LLM_PROVIDER` | Provedor de IA (`gemini`) |
| `LLM_API_KEY` | Chave da API do provedor |
| `LLM_MODEL` | Nome do modelo, de preferência um modelo estável da família *flash* |
| `LLM_MAX_OUTPUT_TOKENS` | Limite de tamanho da resposta (`2048`) |
| `LLM_TIMEOUT_MS` | Tempo máximo de espera pela IA (`30000`) |
| `TUTOR_MAX_MESSAGE_CHARS` | Tamanho máximo de uma mensagem (`2000`) |
| `TUTOR_HISTORY_LIMIT` | Mensagens anteriores enviadas à IA (`20`) |
| `TUTOR_RATE_PER_MINUTE` | Mensagens por minuto, por usuário (`10`) |
| `TUTOR_DAILY_LIMIT` | Mensagens por dia, por usuário (`100`) |

> **Sobre o plano gratuito do Gemini:** o conteúdo enviado pode ser usado pelo provedor para melhorar seus produtos. Não use dados sensíveis de pessoas reais nesse plano. Os nomes de modelo mudam com frequência: confira a lista atual no Google AI Studio.

## API

A documentação interativa fica em **http://localhost:3000/api-docs**. Todas as rotas, exceto as de autenticação, exigem o header `Authorization: Bearer <token>`.

| Grupo | Endpoints |
|---|---|
| Auth | `POST /auth/signup`, `POST /auth/login`, `POST /auth/forgot-password`, `POST /auth/reset-password` |
| Users | `GET /users/me`, `PUT /users/me`, `PUT /users/me/password` |
| Subjects | `GET /subjects`, `POST /subjects`, `PUT /subjects/:id`, `DELETE /subjects/:id` |
| Tasks | `POST /tasks`, `GET /tasks/search`, `GET /tasks/subject/:subjectId`, `PUT /tasks/:id`, `DELETE /tasks/:id` |
| Dashboard | `GET /dashboard` |
| Insights | `GET /insights/progress`, `GET /insights/recommendations` |
| Tutor | `POST /tutor/conversations`, `GET /tutor/conversations`, `GET /tutor/conversations/:id`, `PUT /tutor/conversations/:id`, `DELETE /tutor/conversations/:id`, `POST /tutor/conversations/:id/messages` |

O serviço de insights (porta 8000) é interno e expõe `POST /progress/advanced`, `POST /insights/recommendations` e `GET /health`.

## Banco de dados

```
users (1) ──< subjects (1) ──< academic_tasks
  │                │
  └──< tutor_conversations >──┘   (subject_id é opcional)
              │
              └──< tutor_messages
```

| Tabela | Função |
|---|---|
| `users` | Contas de usuário e dados de recuperação de senha |
| `subjects` | Disciplinas de cada usuário |
| `academic_tasks` | Tarefas de cada disciplina (sem `user_id`: a posse é verificada pela disciplina) |
| `tutor_conversations` | Conversas do tutor, com modo de estudo e disciplina opcional |
| `tutor_messages` | Mensagens de cada conversa |

Se uma disciplina for excluída, as conversas ligadas a ela continuam existindo como conversas gerais (`ON DELETE SET NULL`).

## Segurança

- Senhas guardadas com hash **bcrypt**; a API nunca devolve `password_hash` nem tokens de recuperação
- Autenticação por **JWT** com validade de 7 dias; rotas protegidas por middleware
- Toda consulta filtra pelo usuário autenticado; a posse de tarefas é verificada por JOIN com `subjects`
- Consultas **parametrizadas** (sem concatenar valores do usuário no SQL)
- Credenciais e chaves somente em variáveis de ambiente (`.env` no `.gitignore`)
- Chave da IA exclusivamente no backend
- Tutor com limite de tamanho de mensagem, limite por minuto e por dia; textos do banco entram no prompt como dados delimitados, com instrução para não obedecer comandos contidos neles
- A resposta da recuperação de senha é a mesma para e-mails existentes e inexistentes
- Respostas da IA são renderizadas sem HTML bruto

## Metodologia: OpenSpec

O projeto usa **Spec-Driven Development**: cada funcionalidade relevante é descrita antes de ser implementada.

- `openspec/specs/` guarda as especificações permanentes de cada funcionalidade
- `openspec/changes/archive/` guarda o histórico de mudanças já implementadas (proposta, tarefas e especificações)
- `AGENTS.md` define as regras do projeto para agentes de IA: código e comentários em inglês, `snake_case` no banco, branches com prefixos (`feat/`, `fix/`, `docs/`, `chore/`) e Conventional Commits

Ciclo usado em cada funcionalidade:

```bash
openspec validate      # valida a proposta
openspec archive       # consolida a spec e arquiva a mudança
```

## Testes

O projeto não possui suíte de testes automatizados. A validação foi **manual**, com requisições pelo Insomnia e uso da interface, cobrindo CRUD, autenticação, isolamento entre usuários (acesso ao recurso de outro usuário retorna 404), limites do tutor, tratamento de erros do provedor de IA, temas claro e escuro e responsividade em celular real.

## Problemas comuns

| Sintoma | Causa e solução |
|---|---|
| `The "config.server" property is required` | O `.env` não existe na pasta `edutrack-api` (ele não vai para o Git). Crie-o a partir do `.env.example` |
| Senha do banco recusada, mesmo correta | Valores com `#` precisam de aspas no `.env` |
| Não conecta ao banco | Verifique se o container está de pé (`docker ps`) e use autenticação SQL em `localhost,1433`. O LocalDB não serve: o driver só fala TCP |
| `uvicorn` não é reconhecido | Use `python -m uvicorn main:app --reload --port 8000` |
| Dashboard mostra erro ao carregar | A API está parada, ou a sessão expirou. Suba a API ou faça login novamente |
| Erro de binário nativo ao iniciar o Vite | Versão do Node incompatível com o Vite. Use Node 20.19+ ou mantenha o Vite 5 |
| Tutor responde "indisponível" ou "não configurado" | Confira `LLM_API_KEY` e `LLM_MODEL` e leia a linha `LLM request failed` no terminal da API |
| Recuperação de senha não envia e-mail | `EMAIL_PASSWORD` deve ser uma **senha de app** do Gmail, com verificação em duas etapas ativa |
| Conexão ao banco quebrou após atualizar pacotes | Não rode `npm audit fix --force`: ele rebaixa o `mssql` para uma versão incompatível |

## Limitações conhecidas e próximos passos

- Os indicadores de sequência e XP no cabeçalho do dashboard são **ilustrativos** (valores fixos), não há gamificação real por trás
- A previsão de conclusão do módulo de insights é uma estimativa simplificada (3 dias por tarefa pendente)
- O limite diário do tutor conta as mensagens salvas: apagar conversas reduz o contador. Uma tabela de uso resolveria
- O limite por minuto fica em memória e zera quando a API reinicia
- O token JWT fica no `localStorage`; em produção, o ideal é um cookie `HttpOnly`
- O tutor responde de uma vez; mostrar a resposta aos poucos (streaming) é uma evolução possível
- Ainda fora do escopo: tempo estimado e tempo real por tarefa, relatórios semanais em PDF e notificações de prazo

## Autor

**Cauã Gonçalves Pereira** — [@cauagoncalves-p](https://github.com/cauagoncalves-p)
