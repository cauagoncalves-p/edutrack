import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Envolve rotas que exigem login — se não houver usuário no contexto,
// redireciona pro login em vez de renderizar a página protegida
export default function ProtectedRoute({ children }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}