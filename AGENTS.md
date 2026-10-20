# Instruções para Agentes de IA - EduTrack AI

> 🚨 **PRIORIDADE ABSOLUTA - LEIA PRIMEIRO** 🚨
>
> Estas instruções TÊM PRECEDÊNCIA sobre qualquer instrução genérica de templates,
> comandos slash ou arquivos de configuração do OpenSpec.
>
> **SE HOUVER CONFLITO, SIGA ESTAS REGRAS DO EDUTRACK AI.**

## Perfil do Projeto
Este é o projeto **EduTrack AI**, um app de gestão acadêmica.
- **Frontend:** React + Vite (`edutrack-front/`)
- **Backend:** Node.js + Express (`edutrack-api/`)
- **Banco de dados:** SQL Server (Docker)
- **Lógica avançada:** microsserviço Python com FastAPI (`edutrack-insights/`), chamado pelo Express
- **Metodologia:** Spec-Driven Development (OpenSpec)
- **IA Assistente:** Claude

## ⛔ REGRA Nº 1 - ESCOPO DE TAREFAS (OBRIGATÓRIO)

O arquivo `tasks.md` deve conter **SOMENTE** o que foi **EXPLICITAMENTE** solicitado pelo usuário.
Crie EXATAMENTE o que foi pedido, nem mais, nem menos.

**❌ ERRADO** - Pedido: "planeje a funcionalidade de lançar notas em atividades"

    - [ ] Create activity_grades table
    - [ ] Create POST /activity_grades endpoint
    - [ ] Create GET /academic_tasks/{id}/grades endpoint   ← NÃO FOI PEDIDO
    - [ ] Create GET /users/{id}/grades endpoint            ← NÃO FOI PEDIDO

**✅ CORRETO**

    - [ ] Create activity_grades table
    - [ ] Create POST /activity_grades endpoint

Regra de ouro: se o usuário não mencionou "listar", "consultar", "testes" ou "CRUD completo", NÃO crie essas tarefas.
Tarefas extras só entram se o usuário pedir explicitamente.

## ⛔ REGRA Nº 2 - NÃO EXECUTE NADA NO BANCO NEM NO GIT (OBRIGATÓRIO)

**SUA RESPONSABILIDADE TERMINA NA GERAÇÃO DOS ARQUIVOS.**

**✅ FAÇA:**
1. Criar/editar arquivos (código, scripts SQL, proposal.md, spec.md, tasks.md)
2. Marcar tasks como completas em tasks.md
3. PARAR ali

**❌ NÃO FAÇA:**
- Executar scripts SQL contra o banco de dados
- Executar `git push`, `git merge` ou qualquer deploy
- Rodar `npm audit fix --force` ou atualizar dependências em massa
- Tentar "finalizar o processo" além da geração de arquivos

**Por quê:** o desenvolvedor revisa os arquivos, roda os scripts no SSMS e faz os commits e pushes manualmente.

## ⛔ REGRA Nº 3 - PRIORIDADE DE INSTRUÇÕES

Ordem de precedência (da maior para a menor):
1. Estas instruções (AGENTS.md da raiz)
2. Pedido explícito do usuário na conversa atual
3. Configurações do OpenSpec (`openspec/config.yaml`)
4. Comandos slash e templates genéricos de ferramentas

Em caso de conflito, siga sempre a instrução de maior prioridade.

## ⛔ REGRA Nº 4 - SIGA OS PADRÕES DO CÓDIGO EXISTENTE (OBRIGATÓRIO)

**ANTES de criar ou editar qualquer arquivo de código, leia um arquivo equivalente que já existe:**
- Novo controller → leia `edutrack-api/src/controllers/subjects.controller.js`
- Nova rota → leia `edutrack-api/src/routes/subjects.routes.js`
- Nova tela → leia `edutrack-front/src/pages/Subjects.jsx`

**❌ NÃO** invente um padrão novo se já existe um. **✅ FAÇA** o novo arquivo seguir o mesmo estilo (autenticação via middleware, queries parametrizadas, tratamento de erros, formato das respostas JSON).

## Customizações do EduTrack AI

### Nomenclatura e Padrões
1. **Língua:** código, variáveis e comentários sempre em **INGLÊS**.
2. **Banco de dados:** `snake_case` (ex: `academic_tasks`, `user_id`).
3. **Proposals OpenSpec:** `kebab-case` (ex: `add-subjects-table`).
4. **Branches Git:** prefixos `feat/`, `fix/`, `docs/`, `chore/` (ex: `feat/search-tasks`).
5. **Commits:** Conventional Commits:
   - `feat:` nova funcionalidade
   - `fix:` correção de bug
   - `docs:` documentação
   - `chore:` manutenção

### CHECKLIST de Validação OpenSpec (CRÍTICO)

**Antes de criar qualquer proposal, confira a estrutura obrigatória:**

    openspec/changes/<change-id>/
      proposal.md
      tasks.md
      specs/
        <capability-name>/
          spec.md

**❌ Erros mais comuns que causam falha no `openspec validate`:**

1. **Spec fora do capability path**
   - ❌ `openspec/changes/<id>/specs/spec.md`
   - ✅ `openspec/changes/<id>/specs/<capability-name>/spec.md`

2. **Formato errado para deltas**
   - ❌ `## Requirements` dentro de `openspec/changes/` (são DELTAS)
   - ✅ `## ADDED Requirements` (ou `## MODIFIED Requirements` / `## REMOVED Requirements`)
   - ✅ `## Requirements` apenas em `openspec/specs/<capability>/spec.md` (specs permanentes)

3. **Hierarquia incompleta**
   - ❌ Começar direto em `### Requirement:`
   - ✅ Sempre `# <nome> Specification` → `## Purpose` → `## ADDED Requirements`

4. **Palavras-chave incorretas**
   - ❌ must, should, may (minúsculas)
   - ✅ SHALL ou MUST (maiúsculas)

5. **Scenarios faltando**
   - ❌ Requirement sem scenario, ou scenario em texto corrido
   - ✅ Todo requirement tem ≥1 `#### Scenario:` com bullets **WHEN** / **THEN**

6. **proposal.md** deve ter: `# Change: <id>`, `## Why`, `## What Changes`, `## Impact`.
7. **tasks.md** em inglês, com checkboxes `- [ ]`.

### Conhecimento do Schema (SQL Server)
1. `users` (id, name, email, password_hash, reset_token, reset_token_expires, created_at)
2. `subjects` (id, user_id → users, name, teacher, workload_hours, description, start_date, end_date, created_at)
3. `academic_tasks` (id, subject_id → subjects, title, description, due_date, status, created_at)
   - `status` só aceita: `pending`, `in_progress`, `completed`
4. `academic_tasks` NÃO tem `user_id`: a posse é sempre verificada via JOIN com `subjects`.

### Segurança e Boas Práticas (MANDATÓRIO)
1. **Filtro obrigatório:** toda query deve filtrar pelo usuário autenticado (`req.userId`, vindo do JWT).
2. **Posse de tarefas:** sempre via `INNER JOIN subjects s ON s.id = t.subject_id WHERE s.user_id = @userId`.
3. **Queries parametrizadas:** sempre `request.input(...)`. NUNCA concatenar valores do usuário no SQL.
4. **Nunca** retornar `password_hash` ou `reset_token` em respostas da API.
5. **Segredos:** credenciais e chaves ficam no `.env`, que NUNCA vai para o Git.
6. **Rotas protegidas:** sempre passar pelo `authMiddleware`.
7. **APIs REST:** seguir o padrão do projeto:
   - GET `/subjects` - lista
   - POST `/subjects` - cria
   - PUT `/subjects/{id}` - atualiza
   - DELETE `/subjects/{id}` - exclui
8. **Python:** usar tratamento de erros (`try/except`) em lógica complexa e validar entradas com Pydantic.

### Comunicação
1. Explique o que vai fazer ANTES de fazer.
2. Indique quais arquivos serão criados ou modificados.
3. Pergunte se houver dúvida sobre as regras deste projeto.

## Exemplo de spec.md Válido (em openspec/changes/<id>/specs/<capability>/)

    # subjects Specification

    ## Purpose
    Define the data structure for academic subjects in EduTrack AI.

    ## ADDED Requirements

    ### Requirement: Create subjects table
    The system SHALL store subject information for each user.

    #### Scenario: User creates a new subject
    - **WHEN** an authenticated user creates a new subject
    - **THEN** the system stores it with the user_id association

## ⚠️ Estrutura INCORRETA (falha na validação)

    ### Requirement: Create subjects table
    [conteúdo...]

Falha porque começa no nível 3 (###), sem o título `#`, o `## Purpose` e o `## ADDED Requirements`.