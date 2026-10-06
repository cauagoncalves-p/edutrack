import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import '../Subjects/Subjects.css';
import '../Tasks/Tasks.css'
import './Search.css';

export default function Search() {
    const [subjects, setSubjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const [filters, setFilters] = useState({
        q: '', status: '', from: '', to: '', subject_id: ''
    });

    useEffect(() => {
        api.get('/subjects').then(res => setSubjects(res.data.subjects));
    }, []);

    async function handleSearch(e) {
        e.preventDefault();
        setLoading(true);
        setHasSearched(true);

        const params = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== '')
        );

        try {
            const response = await api.get('/tasks/search', { params });
            setTasks(response.data.tasks);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function clearFilters() {
        setFilters({ q: '', status: '', from: '', to: '', subject_id: '' });
        setTasks([]);
        setHasSearched(false);
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-content">
                <h1 className="dashboard-greeting" style={{ marginBottom: 20 }}>Buscar tarefas</h1>

                <form onSubmit={handleSearch} className="search-filters">
                    <input
                        type="text" placeholder="Buscar por título ou descrição..."
                        className="auth-input"
                        value={filters.q}
                        onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                    />

                    <div className="search-filters-row">
                        <select
                            className="auth-input"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="">Todos os status</option>
                            <option value="pending">Pendente</option>
                            <option value="in_progress">Em andamento</option>
                            <option value="completed">Concluída</option>
                        </select>

                        <select
                            className="auth-input"
                            value={filters.subject_id}
                            onChange={(e) => setFilters({ ...filters, subject_id: e.target.value })}
                        >
                            <option value="">Todas as disciplinas</option>
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="search-filters-row">
                        <div className="field-group">
                            <label className="field-label">De</label>
                            <input
                                type="date" className="auth-input"
                                value={filters.from}
                                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                            />
                        </div>
                        <div className="field-group">
                            <label className="field-label">Até</label>
                            <input
                                type="date" className="auth-input"
                                value={filters.to}
                                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="search-actions">
                        <button type="submit" className="btn-primary">Buscar</button>
                        <button type="button" className="btn-secondary" onClick={clearFilters}>Limpar</button>
                    </div>
                </form>

                {loading && <p>Buscando...</p>}

                {!loading && hasSearched && tasks.length === 0 && (
                    <p className="dashboard-empty">Nenhuma tarefa encontrada com esses filtros.</p>
                )}

                {!loading && tasks.length > 0 && (
                    <div className="subjects-list" style={{ marginTop: 20 }}>
                        {tasks.map((task) => (
                            <div className={`task-row task-row-${task.status}`} key={task.id}>
                                <div className="subject-row-info">
                                    <p className="subject-row-name">{task.title}</p>
                                    <p className="subject-row-meta">
                                        {task.subject_name}
                                        {task.due_date && ` · ${new Date(task.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`}
                                    </p>
                                </div>
                                <Link to={`/subjects/${task.subject_id}/tasks`} className="btn-secondary">
                                    Ver disciplina
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}