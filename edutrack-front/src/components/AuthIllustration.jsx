export default function AuthIllustration() {
    return (
        <svg width="100%" viewBox="0 0 680 560" role="img" style={{ maxWidth: '420px' }}>
            <title>Ilustração de pilha de livros coloridos</title>
            <desc>Uma pilha de livros fechados em cores diferentes, com um livro aberto por cima.</desc>

            <circle cx="180" cy="150" r="100" fill="#DDF4FF" />
            <circle cx="520" cy="430" r="110" fill="#FFF4D6" />

            <rect x="200" y="380" width="280" height="36" rx="6" fill="#1CB0F6" />
            <rect x="215" y="344" width="250" height="36" rx="6" fill="#EA2B2B" />
            <rect x="230" y="308" width="220" height="36" rx="6" fill="#58CC02" />
            <rect x="245" y="272" width="190" height="36" rx="6" fill="#FF9600" />

            <g transform="translate(340,190)">
                <path d="M-110 40 L0 20 L0 -60 L-110 -40 Z" fill="#FFC800" />
                <path d="M110 40 L0 20 L0 -60 L110 -40 Z" fill="#FFDE7A" />
                <path d="M-110 40 L0 20 L110 40" fill="none" stroke="#3C3C3C" strokeWidth="3" />
                <line x1="-85" y1="-25" x2="-15" y2="-38" stroke="#3C3C3C" strokeWidth="2" />
                <line x1="-85" y1="-12" x2="-15" y2="-25" stroke="#3C3C3C" strokeWidth="2" />
                <line x1="-85" y1="1" x2="-15" y2="-12" stroke="#3C3C3C" strokeWidth="2" />
                <line x1="15" y1="-38" x2="85" y2="-52" stroke="#3C3C3C" strokeWidth="2" />
                <line x1="15" y1="-25" x2="85" y2="-39" stroke="#3C3C3C" strokeWidth="2" />
                <line x1="15" y1="-12" x2="85" y2="-26" stroke="#3C3C3C" strokeWidth="2" />
            </g>

            <rect x="440" y="230" width="14" height="70" fill="#EA2B2B" />
            <path d="M440 300 L454 300 L447 314 Z" fill="#EA2B2B" />

            <circle cx="230" cy="470" r="8" fill="#1CB0F6" />
            <circle cx="440" cy="480" r="6" fill="#58CC02" />
            <circle cx="500" cy="190" r="7" fill="#FFC800" />
            <circle cx="150" cy="380" r="6" fill="#FF9600" />
        </svg>
    );
}