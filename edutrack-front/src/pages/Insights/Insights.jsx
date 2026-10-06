import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import '../Subjects/Subjects';
import './Insights.css';

export default function Insights() {
    const [progress, setProgress] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchInsights() {
            try {
                const [progressRes, recsRes] = await Promise.all([
                    api.get('/insights/progress'),
                    api.get('/insights/recommendations')
                ]);
                setProgress(progressRes.data);
                setRecommendations(recsRes.data.recommendations);
            } catch (err) {
                setError(
                    err.response?.status === 503
                        ? 'Serviço de insights está indisponível no momento.'
                        : 'Erro ao carregar insights.'
                );
            } finally {
                setLoading(false);
            }
        }
        fetchInsights();
    }, []);

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-content">
                <h1 className="dashboard-greeting" style={{ marginBottom: 20 }}>Insights</h1>

                {loading && <p>Carregando...</p>}
                {error && <p className="dashboard-error">{error}</p>}

                {!loading && !error && (
                    <>
                        {/* Progresso ponderado geral */}
                        {progress && (
                            <div className="insights-overall">
                                <p className="summary-label">Progresso ponderado geral</p>
                                <p className="insights-overall-value">
                                    {progress.weighted_overall_progress_pct}%
                                </p>
                                <p className="insights-overall-note">
                                    Calculado considerando a carga horária de cada disciplina
                                    (disciplinas com mais horas pesam mais no total)
                                </p>
                            </div>
                        )}

                        {/* Recomendações */}
                        <div className="insights-section">
                            <p className="summary-label" style={{ marginBottom: 12 }}>
                                Recomendações de priorização
                            </p>

                            {recommendations.length === 0 && (
                                <p className="dashboard-empty">
                                    Nenhuma disciplina com tarefas atrasadas. Você está em dia! 🎉
                                </p>
                            )}

                            {recommendations.map((rec) => (
                                <div key={rec.subject_id} className="recommendation-card">
                                    <div className="recommendation-header">
                                        <span className="recommendation-subject">{rec.name}</span>
                                        <span className="recommendation-badge">
                                            {rec.overdue_count} atrasada{rec.overdue_count > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <p className="recommendation-message">{rec.message}</p>
                                </div>
                            ))}
                        </div>

                        {/* Progresso detalhado por disciplina */}
                        {progress && (
                            <div className="insights-section">
                                <p className="summary-label" style={{ marginBottom: 12 }}>
                                    Detalhamento por disciplina
                                </p>

                                <div className="subjects-list">
                                    {progress.subjects.map((s) => (
                                        <div className="subject-row" key={s.subject_id}>
                                            <div className="subject-row-info">
                                                <p className="subject-row-name">{s.name}</p>
                                                <p className="subject-row-meta">
                                                    Progresso: {s.simple_progress_pct}% · Peso: {s.weight_hours}h
                                                    {s.estimated_days_remaining !== null &&
                                                        ` · Previsão: ~${s.estimated_days_remaining} dias restantes`}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}