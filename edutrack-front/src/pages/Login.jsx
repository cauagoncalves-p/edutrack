import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AuthIllustration from '../components/AuthIllustration';
import './Auth.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data.user, response.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao fazer login.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-split">
                <div className="auth-illustration-side">
                    <AuthIllustration />
                </div>
                <div className="auth-form-side">
                    <div className="auth-card">
                        <h1 className="auth-title">EduTrack</h1>
                        <p className="auth-subtitle">Entre para continuar sua sequência 🔥</p>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="auth-input"
                                required
                            />
                            <input
                                type="password"
                                placeholder="Senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="auth-input"
                                required
                            />

                            {error && <p className="auth-error">{error}</p>}

                            <button type="submit" disabled={loading} className="auth-button">
                                {loading ? 'Entrando...' : 'Entrar'}
                            </button>
                        </form>

                        <Link to="/forgot-password" className="auth-link">Esqueci minha senha</Link>
                        <p className="auth-footer-text">
                            Não tem conta? <Link to="/signup" className="auth-link">Cadastre-se</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}