export default function SignupIllustration() {
    return (
        <svg width="100%" viewBox="0 0 680 560" role="img" style={{ maxWidth: '420px' }}>
            <title>Ilustração de mesa de estudos</title>
            <desc>Uma mesa de estudos com um caderno aberto, um lápis, uma xícara e um vaso de planta.</desc>

            <circle cx="200" cy="140" r="100" fill="#E8F8E0" />
            <circle cx="500" cy="440" r="110" fill="#DDF4FF" />

            <rect x="150" y="380" width="380" height="20" rx="4" fill="#3C3C3C" />

            <g transform="translate(230,260)">
                <rect x="0" y="0" width="180" height="120" rx="8" fill="#fff" stroke="#E5E5E5" strokeWidth="3" />
                <line x1="90" y1="6" x2="90" y2="114" stroke="#E5E5E5" strokeWidth="2" />
                <line x1="14" y1="30" x2="76" y2="30" stroke="#1CB0F6" strokeWidth="4" />
                <line x1="14" y1="50" x2="70" y2="50" stroke="#1CB0F6" strokeWidth="4" />
                <line x1="14" y1="70" x2="76" y2="70" stroke="#1CB0F6" strokeWidth="4" />
                <line x1="104" y1="30" x2="160" y2="30" stroke="#58CC02" strokeWidth="4" />
                <line x1="104" y1="50" x2="150" y2="50" stroke="#58CC02" strokeWidth="4" />
            </g>

            <g transform="translate(440,240) rotate(20)">
                <rect x="0" y="0" width="16" height="90" fill="#FFC800" />
                <path d="M0 90 L16 90 L8 112 Z" fill="#3C3C3C" />
                <rect x="0" y="-10" width="16" height="10" fill="#EA2B2B" />
            </g>

            <g transform="translate(140,260)">
                <path d="M0 20 L60 20 L54 80 L6 80 Z" fill="#FF9600" />
                <rect x="-4" y="8" width="68" height="14" rx="4" fill="#FF9600" />
                <path d="M60 30 C 80 30 80 55 58 55" fill="none" stroke="#FF9600" strokeWidth="8" strokeLinecap="round" />
            </g>

            <g transform="translate(500,280)">
                <path d="M0 40 L50 40 L44 90 L6 90 Z" fill="#8B5A2B" />
                <ellipse cx="25" cy="40" rx="25" ry="10" fill="#58CC02" />
                <path d="M25 40 C 10 20 15 0 25 -15 C 30 5 40 10 35 25 C 45 15 42 -5 32 -18 C 55 0 55 30 35 45" fill="#58CC02" />
            </g>

            <circle cx="180" cy="440" r="6" fill="#1CB0F6" />
            <circle cx="420" cy="460" r="7" fill="#FFC800" />
            <circle cx="560" cy="200" r="6" fill="#EA2B2B" />
        </svg>
    );
}