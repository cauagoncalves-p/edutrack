// size controla o tamanho geral; showText permite usar só o ícone (ex: espaços pequenos)
export default function Logo({ size = 32, showText = true }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.3, marginBottom: 10}}>
            <svg width={size} height={size} viewBox="0 0 100 100" role="img">
                <title>Logo EduTrack</title>
                <rect x="0" y="0" width="100" height="100" rx="24" fill="#58CC02" />
                <g transform="translate(20,28)">
                    <path d="M0 8 L30 -6 L60 8 L30 22 Z" fill="#fff" />
                    <line x1="52" y1="12" x2="52" y2="34" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="52" cy="38" r="4.5" fill="#FFC800" />
                    <path d="M8 12 L8 26 C8 32 44 32 44 26 L44 12" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                </g>
            </svg>

            {showText && (
                <span style={{ fontSize: size * 0.6, fontWeight: 800, color: '#3C3C3C', fontFamily: 'Nunito, sans-serif' }}>
                    Edu<span style={{ color: '#58CC02' }}>Track</span>
                </span>
            )}
        </div>
    );
}