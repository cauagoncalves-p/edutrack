import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from   '../../components/Logo'
import './Landing.css';

// Each feature draws its icon from a single SVG path
const FEATURES = [
    {
        tone: 'green',
        icon: 'M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h13',
        title: 'Disciplinas',
        text: 'Cadastre professor, carga horária, datas de início e fim e uma descrição. Edite ou exclua quando quiser.'
    },
    {
        tone: 'blue',
        icon: 'M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2',
        title: 'Tarefas com status',
        text: 'Crie tarefas dentro de cada disciplina, defina o prazo e acompanhe: pendente, em andamento ou concluída.'
    },
    {
        tone: 'orange',
        icon: 'M5 20V11M12 20V4M19 20v-6M3 20h18',
        title: 'Dashboard de progresso',
        text: 'Veja o percentual concluído de cada disciplina, as próximas tarefas e o que já está atrasado.'
    },
    {
        tone: 'blue',
        icon: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
        title: 'Busca e filtros',
        text: 'Encontre qualquer tarefa por texto, status, disciplina ou período, com resultados na hora enquanto você digita.'
    },
    {
        tone: 'orange',
        icon: 'M3 17l6-6 4 4 8-8M15 7h6v6',
        title: 'Insights inteligentes',
        text: 'Progresso ponderado pela carga horária e recomendações de quais disciplinas priorizar primeiro.'
    },
    {
        tone: 'green',
        icon: 'M21 12a8 8 0 0 1-11.5 7.2L4 20l1.2-4.4A8 8 0 1 1 21 12z',
        title: 'Tutor virtual com IA',
        text: 'Converse com um professor particular que conhece suas disciplinas. Escolha entre os modos Professor, Exercícios, Revisão e Socrático, e retome conversas antigas.'
    }
];

const EXTRAS = [
    'Tema claro e escuro',
    'Celular e computador',
    'Recuperação de senha por e-mail',
    'Cada usuário vê só os próprios dados'
];

const STEPS = [
    {
        title: 'Cadastre suas disciplinas',
        text: 'Crie sua conta e adicione as matérias do semestre com professor e carga horária.'
    },
    {
        title: 'Registre tarefas e prazos',
        text: 'Anote o que precisa ser feito em cada disciplina e atualize o status conforme avança.'
    },
    {
        title: 'Acompanhe e estude',
        text: 'Veja seu progresso no dashboard e use o tutor de IA para tirar dúvidas e treinar.'
    }
];

// Illustrative sample shown in the hero preview card
const PREVIEW = [
    { name: 'Banco de Dados', pct: 80, color: '#58CC02' },
    { name: 'Redes de Computadores', pct: 40, color: '#1CB0F6' },
    { name: 'Engenharia de Software', pct: 20, color: '#FF9600' }
];

export default function Landing() {
    const { user } = useAuth();

    // Rule: a logged-in user skips the landing page and goes straight to the app
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="landing">
            <header className="lp-header">
                <Logo size={36} />
                <nav className="lp-nav">
                    <a className="lp-nav-link" href="#funcionalidades">Funcionalidades</a>
                    <a className="lp-nav-link" href="#como-funciona">Como funciona</a>
                    <Link to="/login" className="lp-btn lp-btn-primary lp-btn-small">Começar</Link>
                </nav>
            </header>

            <section className="lp-hero">
                <div className="lp-hero-text">
                    <span className="lp-pill">App de gestão acadêmica</span>
                    <h1 className="lp-title">Organize seus estudos e veja seu progresso de verdade.</h1>
                    <p className="lp-lead">
                        O EduTrack AI junta disciplinas, tarefas e prazos em um só lugar, mostra quanto falta para
                        concluir cada matéria e traz um tutor de IA para tirar suas dúvidas.
                    </p>
                    <div className="lp-actions">
                        <Link to="/login" className="lp-btn lp-btn-primary">Criar minha conta</Link>
                        <a href="#funcionalidades" className="lp-btn lp-btn-secondary">Ver funcionalidades</a>
                    </div>
                </div>

                <div className="lp-hero-visual">
                    <div className="lp-preview">
                        <div className="lp-preview-title">Suas disciplinas</div>
                        {PREVIEW.map((item) => (
                            <div key={item.name}>
                                <div className="lp-bar-row">
                                    <span>{item.name}</span>
                                    <span>{item.pct}%</span>
                                </div>
                                <div className="lp-bar">
                                    <div className="lp-bar-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                                </div>
                            </div>
                        ))}
                        <div className="lp-bubble">
                            <strong>Tutor:</strong> Antes de eu mostrar o JOIN, o que você acha que as duas tabelas
                            precisam ter em comum?
                        </div>
                        <p className="lp-note">Exemplo ilustrativo do aplicativo.</p>
                    </div>
                </div>
            </section>

            <section id="funcionalidades" className="lp-section lp-section-light">
                <div className="lp-container">
                    <h2 className="lp-h2">Tudo para você não perder o fio</h2>
                    <p className="lp-sub">
                        Do cadastro das disciplinas ao tutor de IA, cada recurso foi pensado para quem estuda várias
                        matérias ao mesmo tempo.
                    </p>

                    <div className="lp-grid">
                        {FEATURES.map((f) => (
                            <div className="lp-card" key={f.title}>
                                <div className={`lp-icon lp-icon-${f.tone}`}>
                                    <svg
                                        width="24" height="24" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2"
                                        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                                    >
                                        <path d={f.icon} />
                                    </svg>
                                </div>
                                <h3 className="lp-card-title">{f.title}</h3>
                                <p className="lp-card-text">{f.text}</p>
                            </div>
                        ))}
                    </div>

                    <ul className="lp-extras">
                        {EXTRAS.map((text) => (
                            <li className="lp-extra" key={text}>{text}</li>
                        ))}
                    </ul>
                </div>
            </section>

            <section id="como-funciona" className="lp-section">
                <div className="lp-container">
                    <h2 className="lp-h2 lp-h2-spaced">Como funciona</h2>
                    <div className="lp-steps">
                        {STEPS.map((step, index) => (
                            <div key={step.title}>
                                <div className="lp-step-num">{index + 1}</div>
                                <h3 className="lp-card-title">{step.title}</h3>
                                <p className="lp-card-text">{step.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="lp-cta">
                <div className="lp-cta-inner">
                    <h2 className="lp-h2">Pronto para organizar seus estudos?</h2>
                    <p className="lp-cta-text">
                        Crie sua conta, cadastre suas disciplinas e comece a acompanhar seu progresso.
                    </p>
                    <Link to="/login" className="lp-btn lp-btn-primary lp-btn-large">Criar minha conta</Link>
                </div>
            </section>

            <footer className="lp-footer">EduTrack AI · Gestão acadêmica com inteligência artificial</footer>
        </div>
    );
}