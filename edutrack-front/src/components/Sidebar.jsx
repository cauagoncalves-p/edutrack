import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

export default function Sidebar() {
    // Controla se o menu está aberto no mobile (fechado por padrão)
    const [isOpen, setIsOpen] = useState(false);
    const { logout } = useAuth();

    return (
        <>
            {/* Botão hambúrguer — só aparece em telas pequenas (via CSS) */}
            <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
                ☰
            </button>

            {/* Fundo escurecido atrás do menu aberto no mobile — clicar nele fecha o menu */}
            {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

            <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-logo">EduTrack</div>

                <nav className="sidebar-nav">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                        onClick={() => setIsOpen(false)}
                    >
                        📊 Dashboard
                    </NavLink>
                    <NavLink
                        to="/subjects"
                        className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                        onClick={() => setIsOpen(false)}
                    >
                        📚 Disciplinas
                    </NavLink>
                </nav>

                <button className="sidebar-logout" onClick={logout}>
                    Sair
                </button>
            </aside>
        </>
    );
}