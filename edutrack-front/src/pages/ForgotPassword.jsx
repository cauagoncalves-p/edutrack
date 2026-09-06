import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import AuthIllustration from '../components/AuthIllustration';
import './Auth.css';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await api.post('/auth/forgot-password', { email });
            // O backend sempre responde com essa mensagem genérica,
            // mesmo se o email não existir (por segurança, como vimos antes)
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao processar solicitação.');
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
                        <h1 className="auth-title">Esqueci minha senha</h1>
                        <p className="auth-subtitle">Enviaremos um link de recuperação para seu email</p>

                        {!message ? (
                            <form onSubmit={handleSubmit} className="auth-form">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="auth-input"
                                    required
                                />

                                {error && <p className="auth-error">{error}</p>}

                                <button type="submit" disabled={loading} className="auth-button">
                                    {loading ? 'Enviando...' : 'Enviar link'}
                                </button>
                            </form>
                        ) : (
                            <p className="auth-success">{message}</p>
                        )}

                        <Link to="/login" className="auth-link">Voltar para o login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}