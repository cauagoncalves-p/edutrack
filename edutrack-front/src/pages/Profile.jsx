import { useEffect, useState } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

export default function Profile() {
    const { user, login } = useAuth();
    const [activeTab, setActiveTab] = useState('info'); // 'info' | 'password'

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
                setProfileForm({ name: response.data.user.name, email: response.data.user.email });
            } catch (err) {
                setProfileError('Erro ao carregar perfil.');
            }
        }
        fetchProfile();
    }, []);

    async function handleProfileSubmit(e) {
        e.preventDefault();
        setProfileError('');
        setProfileSuccess('');
        setSavingProfile(true);

        try {
            const response = await api.put('/users/me', profileForm);
            setProfileSuccess('Perfil atualizado com sucesso!');
            const token = localStorage.getItem('token');
            login(response.data.user, token);
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

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-content">
                <div className="profile-card">
                    <div className="profile-header">
                        <div className="profile-avatar">{initial}</div>
                        <div>
                            <p className="profile-name">{profileForm.name || 'Carregando...'}</p>
                            <p className="profile-email">{profileForm.email}</p>
                        </div>
                    </div>

                    <div className="profile-tabs">
                        <button
                            className={`profile-tab ${activeTab === 'info' ? 'profile-tab-active' : ''}`}
                            onClick={() => setActiveTab('info')}
                        >
                            Dados pessoais
                        </button>
                        <button
                            className={`profile-tab ${activeTab === 'password' ? 'profile-tab-active' : ''}`}
                            onClick={() => setActiveTab('password')}
                        >
                            Senha
                        </button>
                    </div>

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
                </div>
            </main>
        </div>
    );
}