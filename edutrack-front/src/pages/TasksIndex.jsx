import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import './Subjects/Subjects.css';

export default function TasksIndex() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchSubjects() {
            try {
                const response = await api.get('/subjects');
                setSubjects(response.data.subjects);
            } finally {
                setLoading(false);
            }
        }
        fetchSubjects();
    }, []);

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-content">
                <h1 className="dashboard-greeting">Tarefas</h1>
                <p className="dashboard-empty" style={{ marginTop: 8, marginBottom: 20 }}>
                    Selecione a disciplina à qual a tarefa pertence:
                </p>

                {loading && <p>Carregando...</p>}

                {!loading && subjects.length === 0 && (
                    <p className="dashboard-empty">
                        Você ainda não tem disciplinas. Crie uma primeiro em "Disciplinas".
                    </p>
                )}

                {!loading && subjects.length > 0 && (
                    <div className="subjects-list">
                        {subjects.map((subject) => (
                            <div
                                className="subject-row"
                                key={subject.id}
                                onClick={() => navigate(`/subjects/${subject.id}/tasks`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="subject-row-info">
                                    <p className="subject-row-name">{subject.name}</p>
                                    <p className="subject-row-meta">
                                        {subject.teacher || 'Sem professor'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}