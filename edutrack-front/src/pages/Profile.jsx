import { useEffect, useState } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Profile.css';

const AVATAR_COLORS = ['#58CC02', '#1CB0F6', '#FF9600', '#CE82FF', '#FF4B4B', '#FFC800'];

const TABS = [
    { id: 'overview', label: 'Visão geral' },
    { id: 'info', label: 'Dados pessoais' },
    { id: 'password', label: 'Senha' },
    { id: 'preferences', label: 'Preferências' }
];

export default function Profile() {
    const { login, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const [activeTab, setActiveTab] = useState('overview');
    const [createdAt, setCreatedAt] = useState(null);
    const [stats, setStats] = useState(null);

    // A cor do avatar fica só no navegador (não precisa de backend)
    const [avatarColor, setAvatarColor] = useState(
        () => localStorage.getItem('avatarColor') || AVATAR_COLORS[0]
    );

    const [profileForm, setProfileForm] = useState({ name: '', email: '' });
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const response = await api.get('/users/me');
                const u = response.data.user;
                setProfileForm({ name: u.name, email: u.email });
                setCreatedAt(u.created_at);
            } catch (err) {
                setProfileError('Erro ao carregar perfil.');
            }
        }

        async function fetchStats() {
            try {
                const response = await api.get('/dashboard');
                setStats(response.data.summary);
            } catch (err) {
                setStats(null);
            }
        }

        fetchProfile();
        fetchStats();
    }, []);

    function chooseAvatarColor(color) {
        setAvatarColor(color);
        localStorage.setItem('avatarColor', color);
    }

    function chooseTheme(target) {
        if (theme !== target) toggleTheme();
    }

    async function handleProfileSubmit(e) {
        e.preventDefault();
        setProfileError('');
        setProfileSuccess('');
        setSavingProfile(true);

        try {
            const response = await api.put('/users/me', profileForm);
            setProfileSuccess('Perfil atualizado com sucesso!');
            login(response.data.user, localStorage.getItem('token'));
        } catch (err) {
            setProfileError(err.response?.data?.error || 'Erro ao atualizar perfil.');
        } finally {
            setSavingProfile(false);
        }
    }

    async function handlePasswordSubmit(e) {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('As senhas novas não coincidem.');
            return;
        }

        setSavingPassword(true);
        try {
            await api.put('/users/me/password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            setPasswordSuccess('Senha alterada com sucesso!');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPasswordError(err.response?.data?.error || 'Erro ao alterar senha.');
        } finally {
            setSavingPassword(false);
        }
    }

    const initial = profileForm.name ? profileForm.name.charAt(0).toUpperCase() : '?';

    const memberSince = createdAt
        ? new Date(createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        : '';

    // SUM() no SQL devolve NULL quando não há tarefas, por isso o "|| 0"
    const totalTasks = stats?.total_tasks || 0;
    const completedTasks = stats?.completed_tasks || 0;
    const openTasks = (stats?.pending_tasks || 0) + (stats?.in_progress_tasks || 0);
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-content">
                <div className="profile-card">
                    <div className="profile-header">
                        <div className="profile-avatar" style={{ background: avatarColor }}>
                            {initial}
                        </div>
                        <div>
                            <p className="profile-name">{profileForm.name || 'Carregando...'}</p>
                            <p className="profile-email">{profileForm.email}</p>
                            {memberSince && <p className="profile-since">Membro desde {memberSince}</p>}
                        </div>
                    </div>

                    <div className="profile-tabs">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                className={`profile-tab ${activeTab === tab.id ? 'profile-tab-active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'overview' && (
                        <div>
                            {!stats && <p className="dashboard-empty">Carregando estatísticas...</p>}

                            {stats && (
                                <>
                                    <div className="profile-stats">
                                        <div className="profile-stat">
                                            <p className="profile-stat-value">{stats.total_subjects || 0}</p>
                                            <p className="profile-stat-label">Disciplinas</p>
                                        </div>
                                        <div className="profile-stat">
                                            <p className="profile-stat-value">{totalTasks}</p>
                                            <p className="profile-stat-label">Tarefas</p>
                                        </div>
                                        <div className="profile-stat profile-stat-success">
                                            <p className="profile-stat-value">{completedTasks}</p>
                                            <p className="profile-stat-label">Concluídas</p>
                                        </div>
                                        <div className="profile-stat profile-stat-warning">
                                            <p className="profile-stat-value">{openTasks}</p>
                                            <p className="profile-stat-label">Pendentes</p>
                                        </div>
                                    </div>

                                    <div className="profile-rate">
                                        <div className="profile-rate-header">
                                            <span>Taxa de conclusão</span>
                                            <strong>{completionRate}%</strong>
                                        </div>
                                        <div className="profile-rate-track">
                                            <div className="profile-rate-fill" style={{ width: `${completionRate}%` }} />
                                        </div>
                                        <p className="profile-rate-note">
                                            {totalTasks === 0
                                                ? 'Cadastre tarefas para acompanhar seu progresso.'
                                                : `${completedTasks} de ${totalTasks} tarefas concluídas.`}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'info' && (
                        <form onSubmit={handleProfileSubmit} className="subject-form">
                            <div className="field-group">
                                <label className="field-label">Nome</label>
                                <input
                                    type="text" className="auth-input"
                                    value={profileForm.name}
                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="field-group">
                                <label className="field-label">Email</label>
                                <input
                                    type="email" className="auth-input"
                                    value={profileForm.email}
                                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                    required
                                />
                            </div>

                            {profileError && <p className="dashboard-error">{profileError}</p>}
                            {profileSuccess && <p className="auth-success">{profileSuccess}</p>}

                            <button type="submit" disabled={savingProfile} className="btn-primary profile-submit">
                                {savingProfile ? 'Salvando...' : 'Salvar alterações'}
                            </button>
                        </form>
                    )}

                    {activeTab === 'password' && (
                        <form onSubmit={handlePasswordSubmit} className="subject-form">
                            <div className="field-group">
                                <label className="field-label">Senha atual</label>
                                <input
                                    type="password" className="auth-input"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="field-group">
                                <label className="field-label">Nova senha</label>
                                <input
                                    type="password" className="auth-input"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    required minLength={6}
                                />
                            </div>
                            <div className="field-group">
                                <label className="field-label">Confirmar nova senha</label>
                                <input
                                    type="password" className="auth-input"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    required minLength={6}
                                />
                            </div>

                            {passwordError && <p className="dashboard-error">{passwordError}</p>}
                            {passwordSuccess && <p className="auth-success">{passwordSuccess}</p>}

                            <button type="submit" disabled={savingPassword} className="btn-primary profile-submit">
                                {savingPassword ? 'Salvando...' : 'Alterar senha'}
                            </button>
                        </form>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="profile-prefs">
                            <div className="profile-pref-block">
                                <p className="profile-pref-title">Tema</p>
                                <div className="profile-theme-options">
                                    <button
                                        className={`profile-theme-btn ${theme === 'light' ? 'profile-theme-btn-active' : ''}`}
                                        onClick={() => chooseTheme('light')}
                                    >
                                        ☀️ Claro
                                    </button>
                                    <button
                                        className={`profile-theme-btn ${theme === 'dark' ? 'profile-theme-btn-active' : ''}`}
                                        onClick={() => chooseTheme('dark')}
                                    >
                                        🌙 Escuro
                                    </button>
                                </div>
                            </div>

                            <div className="profile-pref-block">
                                <p className="profile-pref-title">Cor do avatar</p>
                                <div className="profile-colors">
                                    {AVATAR_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            aria-label={`Cor ${color}`}
                                            className={`profile-color ${avatarColor === color ? 'profile-color-active' : ''}`}
                                            style={{ background: color }}
                                            onClick={() => chooseAvatarColor(color)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="profile-pref-block">
                                <p className="profile-pref-title">Conta</p>
                                <button className="btn-danger" onClick={logout}>Sair da conta</button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}