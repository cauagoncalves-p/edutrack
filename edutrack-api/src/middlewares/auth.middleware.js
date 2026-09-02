// jsonwebtoken: usado aqui para verificar (não gerar) o token
const jwt = require('jsonwebtoken');

// Middlewares no Express recebem sempre (req, res, next) —
// "next" é a função que, quando chamada, passa a requisição
// adiante para a próxima etapa (a rota de verdade)
function authMiddleware(req, res, next) {
    // O token normalmente vem no header Authorization,
    // no formato: "Bearer eyJhbGciOi..."
    const authHeader = req.headers.authorization;

    // Se não veio nenhum header Authorization, bloqueia de cara
    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido.' });
    }

    // Separa a palavra "Bearer" do token em si.
    // authHeader.split(' ') vira ["Bearer", "eyJhbGciOi..."]
    const parts = authHeader.split(' ');

    // Validação de formato: precisa ter exatamente 2 partes,
    // e a primeira precisa ser literalmente "Bearer"
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ error: 'Formato de token inválido.' });
    }

    const token = parts[1];

    try {
        // jwt.verify checa a assinatura do token usando o mesmo
        // JWT_SECRET usado para criá-lo. Se alguém tentar forjar
        // um token sem conhecer o segredo, essa verificação falha.
        // Também checa automaticamente se o token já expirou (7d, no nosso caso)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Guardamos o userId (que colocamos no payload durante o login)
        // dentro de req, para que as próximas funções (controllers)
        // saibam de qual usuário é essa requisição
        req.userId = decoded.userId;

        // Chama next() para deixar a requisição seguir para a rota real
        next();

    } catch (err) {
        // jwt.verify lança erro se o token for inválido, adulterado, ou expirado
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
}

module.exports = authMiddleware;