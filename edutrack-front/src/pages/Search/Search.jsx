import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import './Search.css';

const STATUS_OPTIONS = [
    { value: '', label: 'Todas' },
    { value: 'pending', label: 'Pendentes' },
    { value: 'in_progress', label: 'Em andamento' },
    { value: 'completed', label: 'Concluídas' }
];

const STATUS_LABELS = {
    pending: 'Pendente',
    in_progress: 'Em andamento',
    completed: 'Concluída'
};

const EMPTY_FILTERS = { q: '', status: '', from: '', to: '', subject_id: '' };

function formatDate(date) {
    return new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export default function Search() {
    const [subjects, setSubjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [onlyOverdue, setOnlyOverdue] = useState(false);

    // Data de hoje no formato YYYY-MM-DD (fuso local), para comparar com due_date
    const today = new Date().toLocaleDateString('en-CA');

    function isOverdue(task) {
        return task.status !== 'completed' && task.due_date && task.due_date.slice(0, 10) < today;
    }

    function setFilter(key, value) {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }

    function clearAll() {
        setFilters(EMPTY_FILTERS);
        setOnlyOverdue(false);
    }

    // Carrega as disciplinas só para popular o filtro
    useEffect(() => {
        api.get('/subjects')
            .then((res) => setSubjects(res.data.subjects))
            .catch(() => {});
    }, []);

    // Busca automática: espera 350ms depois da última mudança nos filtros.
    // O "cancelled" evita que uma resposta antiga sobrescreva uma mais nova.
    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        const timer = setTimeout(async () => {
            const params = Object.fromEntries(
                Object.entries(filters).filter(([, value]) => value !== '')
            );

            try {
                const response = await api.get('/tasks/search', { params });
                if (!cancelled) {
                    setTasks(response.data.tasks);
                    setError('');
                }
            } catch (err) {
                if (!cancelled) setError('Erro ao buscar tarefas.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }, 350);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [filters]);

    // "Atrasadas" é filtrado no navegador, sobre os resultados já carregados.
    // Também joga as tarefas sem prazo para o fim da lista.
    const visibleTasks = useMemo(() => {
        const list = onlyOverdue ? tasks.filter(isOverdue) : tasks;
        return [...list].sort((a, b) => {
            if (!a.due_date && !b.due_date) return 0;
            if (!a.due_date) return 1;
            if (!b.due_date) return -1;
            return a.due_date.localeCompare(b.due_date);
        });
    }, [tasks, onlyOverdue, today]);

    const activeFilters = Object.values(filters).filter(Boolean).length + (onlyOverdue ? 1 : 0);

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-content">
                <h1 className="search-title">Buscar tarefas</h1>
                <p className="search-subtitle">Encontre qualquer tarefa de todas as suas disciplinas</p>

                <div className="search-panel">
                    <div className="search-input-wrap">
                        <span className="search-input-icon">🔍</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Buscar por título ou descrição..."
                            value={filters.q}
                            onChange={(e) => setFilter('q', e.target.value)}
                        />
                        {filters.q && (
                            <button
                                type="button"
                                className="search-input-clear"
                                onClick={() => setFilter('q', '')}
                                aria-label="Limpar busca"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <div className="search-chips">
                        {STATUS_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={`search-chip ${filters.status === option.value ? 'search-chip-active' : ''}`}
                                onClick={() => setFilter('status', option.value)}
                            >
                                {option.label}
                            </button>
                        ))}
                        <button
                            type="button"
                            className={`search-chip search-chip-danger ${onlyOverdue ? 'search-chip-active' : ''}`}
                            onClick={() => setOnlyOverdue((v) => !v)}
                        >
                            ⚠️ Atrasadas
                        </button>
                    </div>

                    <div className="search-row">
                        <div className="search-field">
                            <label className="search-field-label">Disciplina</label>
                            <select
                                className="search-control"
                                value={filters.subject_id}
                                onChange={(e) => setFilter('subject_id', e.target.value)}
                            >
                                <option value="">Todas as disciplinas</option>
                                {subjects.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="search-field">
                            <label className="search-field-label">Prazo a partir de</label>
                            <input
                                type="date"
                                className="search-control"
                                value={filters.from}
                                onChange={(e) => setFilter('from', e.target.value)}
                            />
                        </div>

                        <div className="search-field">
                            <label className="search-field-label">Prazo até</label>
                            <input
                                type="date"
                                className="search-control"
                                value={filters.to}
                                onChange={(e) => setFilter('to', e.target.value)}
                            />
                        </div>
                    </div>

                    {activeFilters > 0 && (
                        <div className="search-panel-footer">
                            <button type="button" className="search-clear" onClick={clearAll}>
                                Limpar {activeFilters} filtro{activeFilters > 1 ? 's' : ''}
                            </button>
                        </div>
                    )}
                </div>

                {error && <p className="dashboard-error">{error}</p>}

                {!error && (
                    <div className="search-results-header">
                        <span>
                            {visibleTasks.length} tarefa{visibleTasks.length !== 1 ? 's' : ''} encontrada{visibleTasks.length !== 1 ? 's' : ''}
                        </span>
                        {loading && <span className="search-loading">Buscando...</span>}
                    </div>
                )}

                {!error && !loading && visibleTasks.length === 0 && (
                    <div className="search-empty">
                        <div className="search-empty-icon">🗂️</div>
                        <p className="search-empty-title">Nenhuma tarefa encontrada</p>
                        <p>Tente mudar ou limpar os filtros.</p>
                    </div>
                )}

                {!error && visibleTasks.length > 0 && (
                    <div className="search-results">
                        {visibleTasks.map((task) => {
                            const overdue = isOverdue(task);
                            return (
                                <div
                                    key={task.id}
                                    className={`result-card result-card-${task.status} ${overdue ? 'result-card-overdue' : ''}`}
                                >
                                    <div>
                                        <p className="result-title">{task.title}</p>
                                        <p className="result-subject">{task.subject_name}</p>
                                    </div>

                                    <div className="result-badges">
                                        <span className={`result-badge result-badge-${task.status}`}>
                                            {STATUS_LABELS[task.status]}
                                        </span>
                                        {overdue && (
                                            <span className="result-badge result-badge-overdue">Atrasada</span>
                                        )}
                                    </div>

                                    <div className="result-footer">
                                        <span className="result-date">
                                            {task.due_date ? `📅 ${formatDate(task.due_date)}` : 'Sem prazo'}
                                        </span>
                                        <Link to={`/subjects/${task.subject_id}/tasks`} className="result-link">
                                            Ver disciplina →
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}