import { useEffect, useState } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

export default function Dashboard() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [summary, setSummary] = useState(null);
    const [upcomingTasks, setUpcomingTasks] = useState([]);

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const response = await api.get('/dashboard');
                setData(response.data.dashboard);
                setSummary(response.data.summary);
                setUpcomingTasks(response.data.upcomingTasks);
            } catch (err) {
                setError('Erro ao carregar o dashboard.');
            } finally {
                setLoading(false);
            }
        }
        fetchDashboard();
    }, []);

    // Progresso médio entre todas as disciplinas, para o círculo "geral"
    const overallProgress = data.length === 0
        ? 0
        : Math.round(data.reduce((sum, s) => sum + s.progress_pct, 0) / data.length);

    // Cores alternadas por disciplina, ciclando entre as 3 do nosso padrão visual
    const colors = ['#FF9600', '#58CC02', '#1CB0F6'];

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-content">
                <div className="dashboard-header">
                    <h1 className="dashboard-greeting">Suas disciplinas</h1>
                    <div className="dashboard-badges">
                        <span className="badge badge-streak">🔥 7</span>
                        <span className="badge badge-xp">1240 XP</span>
                    </div>
                </div>

                {loading && <p>Carregando...</p>}
                {error && <p className="dashboard-error">{error}</p>}

                {!loading && !error && data.length === 0 && (
                    <p className="dashboard-empty">
                        Você ainda não tem disciplinas cadastradas. Vá em "Disciplinas" para criar a primeira!
                    </p>
                )}

                {!loading && !error && data.length > 0 && (
                    <>
                        <div className="subject-cards">
                            {data.map((subject, i) => {
                                const color = colors[i % colors.length];
                                const pct = Math.round(subject.progress_pct);
                                const circumference = 2 * Math.PI * 15.5;
                                const dash = (pct / 100) * circumference;

                                return (
                                    <div className="subject-card" key={subject.id}>
                                        <div>
                                            <p className="subject-name">{subject.name}</p>
                                            <p className="subject-meta">
                                                {subject.completed_tasks} de {subject.total_tasks} tarefas
                                            </p>
                                        </div>
                                        <svg width="46" height="46" viewBox="0 0 36 36">
                                            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E5E5E5" strokeWidth="3" />
                                            <circle
                                                cx="18" cy="18" r="15.5" fill="none"
                                                stroke={color} strokeWidth="3"
                                                strokeDasharray={`${dash} ${circumference}`}
                                                strokeLinecap="round"
                                                transform="rotate(-90 18 18)"
                                            />
                                            <text x="18" y="21" textAnchor="middle" fontSize="9" fill="#3C3C3C">{pct}%</text>
                                        </svg>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="dashboard-summary">
                            <div className="summary-card">
                                <p className="summary-label">Progresso geral</p>
                                <div className="summary-row">
                                    <svg width="60" height="60" viewBox="0 0 36 36">
                                        <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E5E5E5" strokeWidth="4" />
                                        <circle
                                            cx="18" cy="18" r="15.5" fill="none"
                                            stroke="#58CC02" strokeWidth="4"
                                            strokeDasharray={`${(overallProgress / 100) * 2 * Math.PI * 15.5} ${2 * Math.PI * 15.5}`}
                                            strokeLinecap="round"
                                            transform="rotate(-90 18 18)"
                                        />
                                    </svg>
                                    <span className="summary-value">{overallProgress}%</span>
                                </div>
                            </div>

                           <div className="summary-card">
                                <p className="summary-label">Carga horária por disciplina</p>
                                <div className="workload-list">
                                    {data.map((subject, i) => {
                                        const maxHours = Math.max(...data.map(s => s.workload_hours || 0), 1);
                                        const widthPct = ((subject.workload_hours || 0) / maxHours) * 100;
                                        return (
                                            <div key={subject.id} className="workload-row">
                                                <span className="workload-name">{subject.name}</span>
                                                <div className="workload-track">
                                                    <div
                                                        className="workload-fill"
                                                        style={{ width: `${widthPct}%`, background: colors[i % colors.length] }}
                                                    />
                                                </div>
                                                <span className="workload-hours">{subject.workload_hours || 0}h</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {summary && (
                            <div className="stat-cards">
                                <div className="stat-card">
                                    <p className="stat-value">{summary.total_subjects}</p>
                                    <p className="stat-label">Disciplinas</p>
                                </div>
                                <div className="stat-card">
                                    <p className="stat-value">{summary.total_tasks}</p>
                                    <p className="stat-label">Tarefas totais</p>
                                </div>
                                <div className="stat-card stat-card-success">
                                    <p className="stat-value">{summary.completed_tasks}</p>
                                    <p className="stat-label">Concluídas</p>
                                </div>
                                <div className="stat-card stat-card-warning">
                                    <p className="stat-value">{summary.pending_tasks + summary.in_progress_tasks}</p>
                                    <p className="stat-label">Pendentes</p>
                                </div>
                            </div>
                        )}

                        <div className="upcoming-section">
                            <p className="summary-label">Próximas tarefas</p>
                            {upcomingTasks.length === 0 && (
                                <p className="dashboard-empty">Nenhuma tarefa pendente. Você está em dia! 🎉</p>
                            )}
                            {upcomingTasks.map((task) => (
                                <div key={task.id} className={`upcoming-item ${task.is_overdue ? 'upcoming-overdue' : ''}`}>
                                    <div>
                                        <p className="upcoming-title">{task.title}</p>
                                        <p className="upcoming-subject">{task.subject_name}</p>
                                    </div>
                                    <span className="upcoming-date">
                                        {task.due_date
                                            ? new Date(task.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                                            : 'Sem prazo'}
                                        {task.is_overdue ? ' (atrasada)' : ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}