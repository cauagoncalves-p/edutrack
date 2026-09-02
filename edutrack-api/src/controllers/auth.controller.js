// bcrypt: usado para transformar a senha em um hash seguro,
// nunca guardamos senha em texto puro no banco
const bcrypt = require('bcrypt');

// Importa o sql (para tipos de parâmetro) e o poolPromise (conexão)
// que criamos no db.js
const { sql, poolPromise } = require('../config/db');

// Função assíncrona que trata o cadastro de um novo usuário.
// req = dados da requisição (o que o front mandou)
// res = objeto usado para responder ao front
async function signup(req, res) {
    // Desestrutura os campos esperados do corpo da requisição (JSON)
    const { name, email, password } = req.body;

    // Validação básica: garante que os três campos foram enviados.
    // Sem isso, um cadastro incompleto passaria direto pro banco
    // e quebraria em algum lugar de forma confusa
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
    }

      // (evita que " a " passe como "válido" só por ter 3 caracteres)
    const trimmedName = name.trim();

    // Nome precisa ter pelo menos 2 caracteres reais
    if (trimmedName.length < 2) {
        return res.status(400).json({ error: 'Nome precisa ter pelo menos 2 caracteres.' });
    }

    // (Opcional) Garante que o nome não é só números ou símbolos —
    // exige pelo menos uma letra
    if (!/[a-zA-ZÀ-ÿ]/.test(trimmedName)) {
        return res.status(400).json({ error: 'Nome precisa conter ao menos uma letra.' });
    }

    // Validação simples de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Email inválido.' });
    }

    // Senha com tamanho mínimo (boa prática de segurança básica)
    if (password.length < 6) {
        return res.status(400).json({ error: 'Senha precisa ter pelo menos 6 caracteres.' });
    }

    try {
        // Gera o hash da senha. O "10" é o "salt rounds" — quanto maior,
        // mais seguro (e mais lento) o processo de hash. 10 é um bom padrão
        const passwordHash = await bcrypt.hash(password, 10);

        // Espera o pool de conexão estar pronto
        const pool = await poolPromise;

        // Monta e executa a query de inserção.
        // .input() associa cada valor a um parâmetro nomeado (@name, @email, @passwordHash)
        // em vez de concatenar direto na string SQL — isso evita SQL Injection
        const result = await pool.request()
            .input('name', sql.VarChar, name)
            .input('email', sql.VarChar, email)
            .input('passwordHash', sql.VarChar, passwordHash)
            .query(`
                INSERT INTO users (name, email, password_hash)
                OUTPUT INSERTED.id, INSERTED.name, INSERTED.email
                VALUES (@name, @email, @passwordHash)
            `);

        // result.recordset[0] contém a linha retornada pelo OUTPUT —
        // ou seja, o usuário recém-criado (sem a senha, por segurança)
        const newUser = result.recordset[0];

        // Responde com status 201 (Created), padrão HTTP para "recurso criado com sucesso"
        res.status(201).json({ message: 'Usuário criado com sucesso.', user: newUser });

    } catch (err) {
        // Erro específico: violação de UNIQUE constraint no email
        // (número 2627 é o código do SQL Server para essa violação)
        if (err.number === 2627) {
            return res.status(409).json({ error: 'Este email já está cadastrado.' });
        }

        // Qualquer outro erro inesperado
        console.error(err);
        res.status(500).json({ error: 'Erro ao criar usuário.' });
    }
}

// jsonwebtoken: usado para gerar o token JWT após login bem-sucedido
const jwt = require('jsonwebtoken');

// Função assíncrona que trata o login
async function login(req, res) {
    const { email, password } = req.body;

    // Validação básica de presença
    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    try {
        const pool = await poolPromise;

        // Busca o usuário pelo email — trazemos id, name, email e password_hash
        // (precisamos do hash para comparar com a senha enviada)
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT id, name, email, password_hash FROM users WHERE email = @email');

        const user = result.recordset[0];

        // Se não encontrou nenhum usuário com esse email...
        if (!user) {
            // Mensagem genérica de propósito — não dizemos "email não existe"
            // para não dar pista a quem está tentando adivinhar emails cadastrados
            return res.status(401).json({ error: 'Email ou senha inválidos.' });
        }

        // bcrypt.compare faz o hash da senha recebida e compara com o hash salvo,
        // sem nunca precisar "descriptografar" o hash (hash não é reversível)
        const passwordMatches = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatches) {
            // Mesma mensagem genérica de antes — não revela se foi o
            // email ou a senha que estava errada
            return res.status(401).json({ error: 'Email ou senha inválidos.' });
        }

        // Gera o token JWT. O primeiro argumento é o "payload" (dados
        // que ficam codificados dentro do token — aqui, só o id do usuário,
        // nunca a senha ou o hash). O segundo é o segredo usado para assinar
        // (do .env). O terceiro define opções, como o tempo de expiração
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Responde com o token e os dados básicos do usuário (nunca a senha/hash)
        res.json({
            message: 'Login realizado com sucesso.',
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao realizar login.' });
    }
}

module.exports = { signup, login };
