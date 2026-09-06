import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import SignupIllustration from '../components/SignupIllustration';
import './Auth.css';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/signup', { name, email, password });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao cadastrar.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-split">
                <div className="auth-illustration-side">
                    <SignupIllustration />
                </div>
                <div className="auth-form-side">
                    <div className="auth-card">
                        <h1 className="auth-title">Criar conta</h1>
                        <p className="auth-subtitle">Comece sua jornada acadêmica</p>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <input type="text" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} className="auth-input" required />
                            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input" required />
                            <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="auth-input" required />

                            {error && <p className="auth-error">{error}</p>}

                            <button type="submit" disabled={loading} className="auth-button">
                                {loading ? 'Criando...' : 'Criar conta'}
                            </button>
                        </form>

                        <p className="auth-footer-text">
                            Já tem conta? <Link to="/login" className="auth-link">Entrar</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}