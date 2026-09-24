# Change: add-subjects-table

## Why
Estudantes precisam cadastrar suas disciplinas para organizar tarefas e
acompanhar progresso acadêmico. É necessário criar a estrutura de dados
que representa uma disciplina, vinculada ao usuário autenticado.

## What Changes
- Criar tabela `subjects` no SQL Server
- Campos: id (identity), name, teacher, workload_hours, description,
  start_date, end_date, user_id (FK para `users`)

## Impact
- Nova tabela no banco de dados
- Novos endpoints CRUD em `/subjects` na API Express (já implementados)