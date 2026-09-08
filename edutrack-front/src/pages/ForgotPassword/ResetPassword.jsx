import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import AuthIllustration from  '../../components/AuthIllustration'
import '../Auth/Auth.css';
import Logo from '../../components/Logo'

export default function ResetPassword() {
    // useSearchParams lê a query string da URL — é assim que pegamos
    // o token que vem no link do email: /reset-password?token=abc123
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, newPassword });
            alert('Senha redefinida com sucesso! Faça login com a nova senha.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao redefinir senha.');
        } finally {
            setLoading(false);
        }
    }

    // Se alguém acessar essa página sem token na URL (ex: digitando direto),
    // avisamos que o link é inválido em vez de deixar o form quebrar
    if (!token) {
        return (
            <div className="auth-page">
                <div className="auth-split">
                    <div className="auth-illustration-side">
                        <AuthIllustration />
                    </div>
                    <div className="auth-form-side">7
                        <div className="auth-card">
                            <h1 className="auth-title">Link inválido</h1>
                            <p className="auth-subtitle">Este link de redefinição está incompleto ou expirado.</p>
                            <Link to="/forgot-password" className="auth-link">Solicitar novo link</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-split">
                <div className="auth-illustration-side">
                    <AuthIllustration />
                </div>
                <div className="auth-form-side">
                    <div className="auth-card">
                        <Logo size={38}/>
                        <h1 className="auth-title">Nova senha</h1>
                        <p className="auth-subtitle">Escolha uma nova senha para sua conta</p>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <input
                                type="password"
                                placeholder="Nova senha"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="auth-input"
                                required
                                minLength={6}
                            />
                            <input
                                type="password"
                                placeholder="Confirmar nova senha"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="auth-input"
                                required
                                minLength={6}
                            />

                            {error && <p className="auth-error">{error}</p>}

                            <button type="submit" disabled={loading} className="auth-button">
                                {loading ? 'Salvando...' : 'Redefinir senha'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}