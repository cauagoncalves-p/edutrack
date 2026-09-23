# Instruções para Agentes de IA - EduTrack AI

## Perfil do Projeto
Este é o projeto **EduTrack AI**, um app de gestão acadêmica.
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Banco de dados:** SQL Server (Docker)
- **Metodologia:** Spec-Driven Development (OpenSpec)
- **IA Assistente:** Claude

## Customizações do EduTrack AI

### Nomenclatura Específica
1. **Língua:** Código e variáveis sempre em **INGLÊS**.
2. **Banco de Dados:** Use `snake_case` (ex: `subjects`, `user_id`).
3. **Proposals OpenSpec:** Use `kebab-case` (ex: `add-subjects-table`).

### Conhecimento do Schema
1. **Tabela Existente:** a tabela `users` já existe no SQL Server.
2. **Relacionamentos:** Sempre use `user_id` (ou `subject_id`, conforme o caso) para vincular dados ao usuário/disciplina.

### Regras de Segurança
1. Toda query ao banco DEVE filtrar pelo `user_id` do usuário autenticado (via JWT).

### Escopo de Tarefas (CRÍTICO)
O `tasks.md` deve conter APENAS as tarefas solicitadas — não adicionar CRUD, testes ou frontend automaticamente, a menos que pedido explicitamente.

### Responsabilidade da IA
- ✅ Criar/editar arquivos (proposal.md, specs/spec.md, tasks.md, scripts SQL)
- ✅ Marcar tasks completas em tasks.md
- ❌ NÃO rodar scripts contra o banco automaticamente — isso é manual, feito pelo desenvolvedor no SSMS