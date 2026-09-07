import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';
import '../Subjects/Subjects.css'
import './Tasks.css';

const emptyForm = { title: '', description: '', due_date: '', status: 'pending' };

const statusLabels = {
    pending: 'Pendente',
    in_progress: 'Em andamento',
    completed: 'Concluída'
};

export default function Tasks() {
    const { subjectId } = useParams();
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [modalMode, setModalMode] = useState(null); // null | 'create' | tarefa sendo editada
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    async function fetchTasks() {
        setLoading(true);
        try {
            const response = await api.get(`/tasks/subject/${subjectId}`);
            setTasks(response.data.tasks);
        } catch (err) {
            setError('Erro ao carregar tarefas. A disciplina pode não existir mais.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTasks();
    }, [subjectId]);

    function openCreateModal() {
        setForm(emptyForm);
        setFormError('');
        setModalMode('create');
    }

    function openEditModal(task) {
        setForm({
            title: task.title,
            description: task.description || '',
            due_date: task.due_date ? task.due_date.split('T')[0] : '',
            status: task.status
        });
        setFormError('');
        setModalMode(task);
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
                await api.post('/tasks', { ...form, subject_id: Number(subjectId) });
            } else {
                await api.put(`/tasks/${modalMode.id}`, form);
            }
            closeModal();
            fetchTasks();
        } catch (err) {
            setFormError(err.response?.data?.error || 'Erro ao salvar tarefa.');
        } finally {
            setSaving(false);
        }
    }

    // Atalho rápido: mudar status direto pelo dropdown na lista, sem abrir o modal
    async function handleStatusChange(task, newStatus) {
        try {
            await api.put(`/tasks/${task.id}`, {
                title: task.title,
                description: task.description,
                due_date: task.due_date ? task.due_date.split('T')[0] : null,
                status: newStatus
            });
            fetchTasks();
        } catch (err) {
            alert('Erro ao atualizar status.');
        }
    }

    async function handleDelete(task) {
        if (!confirm(`Excluir a tarefa "${task.title}"?`)) return;
        try {
            await api.delete(`/tasks/${task.id}`);
            fetchTasks();
        } catch (err) {
            alert('Erro ao excluir tarefa.');
        }
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-content">
                <button className="back-link" onClick={() => navigate('/subjects')}>← Voltar para Disciplinas</button>

                <div className="subjects-header">
                    <h1 className="dashboard-greeting">Tarefas</h1>
                    <button className="btn-primary" onClick={openCreateModal}>+ Nova tarefa</button>
                </div>

                {loading && <p>Carregando...</p>}
                {error && <p className="dashboard-error">{error}</p>}

                {!loading && !error && tasks.length === 0 && (
                    <p className="dashboard-empty">Nenhuma tarefa cadastrada ainda. Crie a primeira!</p>
                )}

                {!loading && !error && tasks.length > 0 && (
                    <div className="subjects-list">
                        {tasks.map((task) => (
                            <div className={`task-row task-row-${task.status}`} key={task.id}>
                                <div className="subject-row-info">
                                    <p className="subject-row-name">{task.title}</p>
                                    <p className="subject-row-meta">
                                        {task.due_date
                                            ? `Prazo: ${new Date(task.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`
                                            : 'Sem prazo definido'}
                                    </p>
                                </div>
                                <div className="subject-row-actions">
                                    <select
                                        className="task-status-select"
                                        value={task.status}
                                        onChange={(e) => handleStatusChange(task, e.target.value)}
                                    >
                                        <option value="pending">Pendente</option>
                                        <option value="in_progress">Em andamento</option>
                                        <option value="completed">Concluída</option>
                                    </select>
                                    <button className="btn-secondary" onClick={() => openEditModal(task)}>Editar</button>
                                    <button className="btn-danger" onClick={() => handleDelete(task)}>Excluir</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {modalMode && (
                <Modal title={modalMode === 'create' ? 'Nova tarefa' : 'Editar tarefa'} onClose={closeModal}>
                    <form onSubmit={handleSubmit} className="subject-form">
                        <input
                            type="text" placeholder="Título da tarefa" className="auth-input"
                            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                        />
                        <textarea
                            placeholder="Descrição (opcional)" className="auth-input subject-textarea"
                            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                        <input
                            type="date" className="auth-input"
                            value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                        />
                        <select
                            className="auth-input"
                            value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                        >
                            <option value="pending">Pendente</option>
                            <option value="in_progress">Em andamento</option>
                            <option value="completed">Concluída</option>
                        </select>

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