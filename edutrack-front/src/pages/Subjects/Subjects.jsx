import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';
import './Subjects.css';
import { useNavigate } from 'react-router-dom'; // nova importação no topo
const emptyForm = { name: '', teacher: '', workload_hours: '', description: '', start_date: '', end_date: '' };

export default function Subjects() {
    const navigate = useNavigate();

    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Controla o modal: null = fechado, 'create' = criando, objeto = editando aquela disciplina
    const [modalMode, setModalMode] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    async function fetchSubjects() {
        setLoading(true);
        try {
            const response = await api.get('/subjects');
            setSubjects(response.data.subjects);
        } catch (err) {
            setError('Erro ao carregar disciplinas.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchSubjects();
    }, []);

    function openCreateModal() {
        setForm(emptyForm);
        setFormError('');
        setModalMode('create');
    }

    function openEditModal(subject) {
        setForm({
            name: subject.name || '',
            teacher: subject.teacher || '',
            workload_hours: subject.workload_hours || '',
            description: subject.description || '',
            // O banco retorna data completa (ISO); o input type="date" só aceita YYYY-MM-DD
            start_date: subject.start_date ? subject.start_date.split('T')[0] : '',
            end_date: subject.end_date ? subject.end_date.split('T')[0] : ''
        });
        setFormError('');
        setModalMode(subject);
    }

    function closeModal() {
        setModalMode(null);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setFormError('');
        setSaving(true);

        try {
            if (modalMode === 'create') {
                await api.post('/subjects', form);
            } else {
                await api.put(`/subjects/${modalMode.id}`, form);
            }
            closeModal();
            fetchSubjects();
        } catch (err) {
            setFormError(err.response?.data?.error || 'Erro ao salvar disciplina.');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(subject) {
        if (!confirm(`Excluir "${subject.name}"? Isso só é possível se não houver tarefas vinculadas.`)) {
            return;
        }
        try {
            await api.delete(`/subjects/${subject.id}`);
            fetchSubjects();
        } catch (err) {
            alert(err.response?.data?.error || 'Erro ao excluir disciplina.');
        }
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-content">
                <div className="subjects-header">
                    <h1 className="dashboard-greeting">Disciplinas</h1>
                    <button className="btn-primary" onClick={openCreateModal}>+ Nova disciplina</button>
                </div>

                {loading && <p>Carregando...</p>}
                {error && <p className="dashboard-error">{error}</p>}

                {!loading && !error && subjects.length === 0 && (
                    <p className="dashboard-empty">Nenhuma disciplina cadastrada ainda. Crie a primeira!</p>
                )}

                {!loading && !error && subjects.length > 0 && (
                    <div className="subjects-list">
                        {subjects.map((subject) => (
                            <div className="subject-row" key={subject.id}>
                              <div className="subject-row-info" onClick={() => navigate(`/subjects/${subject.id}/tasks`)} style={{ cursor: 'pointer' }}>
                                <p className="subject-row-name">{subject.name}</p>
                                    <p className="subject-row-meta">
                                        {subject.teacher || 'Sem professor'} · {subject.workload_hours || 0}h
                                    </p>        
                            </div>
                                <div className="subject-row-actions">
                                    <button className="btn-secondary" onClick={() => openEditModal(subject)}>Editar</button>
                                    <button className="btn-danger" onClick={() => handleDelete(subject)}>Excluir</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {modalMode && (
                <Modal title={modalMode === 'create' ? 'Nova disciplina' : 'Editar disciplina'} onClose={closeModal}>
                    <form onSubmit={handleSubmit} className="subject-form">
                        <input
                            type="text" placeholder="Nome da disciplina" className="auth-input"
                            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                        />
                        <input
                            type="text" placeholder="Professor" className="auth-input"
                            value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                        />
                        <input
                            type="number" placeholder="Carga horária (horas)" className="auth-input"
                            value={form.workload_hours} onChange={(e) => setForm({ ...form, workload_hours: e.target.value })}
                        />
                        <textarea
                            placeholder="Descrição (opcional)" className="auth-input subject-textarea"
                            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                        <div className="subject-date-row">
                            <input
                                type="date" className="auth-input"
                                value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                            />
                            <input
                                type="date" className="auth-input"
                                value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                            />
                        </div>

                        {formError && <p className="dashboard-error">{formError}</p>}

                        <button type="submit" disabled={saving} className="auth-button">
                            {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    );
}