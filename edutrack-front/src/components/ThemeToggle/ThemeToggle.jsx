import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Alternar tema">
            {theme === 'light' ? '🌙 Tema escuro' : '☀️ Tema claro'}
        </button>
    );
}