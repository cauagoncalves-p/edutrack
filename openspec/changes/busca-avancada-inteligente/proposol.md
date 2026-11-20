# Change: busca-avancada-inteligente

## Why
Enable students to search subjects using smart hybrid filtering that matches either the subject name or the presence of overdue academic tasks.

## What Changes
- Create Python filtering logic (`scripts/hybrid_search.py`) to evaluate name relevance and overdue tasks.
- Create `GET /subjects/search` endpoint in XanoScript (`apis/subjects/subjects_search_GET.xs`) scoped to `auth.id` and executing the Python filter.

## Impact
Combines database querying with custom Python logic to deliver prioritized subject search results.