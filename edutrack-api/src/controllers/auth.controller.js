// bcrypt: usado para transformar a senha em um hash seguro,
const bcrypt = require('bcrypt');
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
const jwt = require('jsonwebtoken');

// Função assíncrona que trata o login
async function login(req, res) {
    const { email, password } = req.body;7

    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT id, name, email, password_hash FROM users WHERE email = @email');

        const user = result.recordset[0];

        if (!user) {
            return res.status(401).json({ error: 'Email ou senha inválidos.' });
        }
        const passwordMatches = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatches) {
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

// crypto: módulo nativo do Node, usado para gerar tokens aleatórios seguros
const crypto = require('crypto');
const transporter = require('../config/email');

// FORGOT PASSWORD — gera token e envia email
async function forgotPassword(req, res) {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email é obrigatório.' });
    }

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT id, name FROM users WHERE email = @email');

        const user = result.recordset[0];

        if (!user) {
            return res.json({ message: 'Se o email existir, um link de recuperação foi enviado.' });
        }

        // Gera um token aleatório de 32 bytes, convertido para string hexadecimal
        // (64 caracteres) — impossível de adivinhar por força bruta em tempo útil
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Define expiração de 1 hora a partir de agora
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        // Salva o token e a expiração no usuário
        await pool.request()
            .input('userId', sql.Int, user.id)
            .input('resetToken', sql.VarChar, resetToken)
            .input('expiresAt', sql.DateTime, expiresAt)
            .query(`
                UPDATE users
                SET reset_token = @resetToken, reset_token_expires = @expiresAt
                WHERE id = @userId
            `);

        // Monta o link que o usuário vai clicar no email
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        // Envia o email de fato
        await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Recuperação de senha - EduTrack AI',
        html: `
            <div style="font-family: 'Nunito', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
                <h1 style="color: #58CC02; font-size: 24px; margin: 0 0 4px;">EduTrack</h1>
                <p style="color: #3C3C3C; font-size: 16px; margin: 24px 0 8px;">Olá, ${user.name}!</p>
                <p style="color: #777; font-size: 14px; line-height: 1.5; margin: 0 0 24px;">
                    Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo
                    para criar uma nova senha (o link é válido por 1 hora).
                </p>

                <a href="${resetLink}"
                style="display: inline-block; background: #58CC02; color: #fff; text-decoration: none;
                        font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 14px;
                        border-bottom: 4px solid #46A302;">
                    Redefinir minha senha
                </a>

                <p style="color: #AFAFAF; font-size: 12px; line-height: 1.5; margin: 32px 0 0;">
                    Se você não solicitou isso, pode ignorar este email com segurança.
                </p>
                <p style="color: #AFAFAF; font-size: 11px; margin: 16px 0 0; word-break: break-all;">
                    Ou copie e cole este link no navegador: ${resetLink}
                </p>
            </div>
        `
    });
        res.json({ message: 'Se o email existir, um link de recuperação foi enviado.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao processar solicitação.' });
    }
}

// RESET PASSWORD — valida token e define nova senha
async function resetPassword(req, res) {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token e nova senha são obrigatórios.' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Senha precisa ter pelo menos 6 caracteres.' });
    }

    try {
        const pool = await poolPromise;

        // Busca o usuário pelo token, checando também se não expirou
        // (GETDATE() é a hora atual do banco, comparada com o campo salvo)
        const result = await pool.request()
            .input('token', sql.VarChar, token)
            .query(`
                SELECT id FROM users
                WHERE reset_token = @token AND reset_token_expires > GETDATE()
            `);

        const user = result.recordset[0];

        if (!user) {
            return res.status(400).json({ error: 'Token inválido ou expirado.' });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        // Atualiza a senha E limpa o token (impede reuso do mesmo token depois)
        await pool.request()
            .input('userId', sql.Int, user.id)
            .input('passwordHash', sql.VarChar, passwordHash)
            .query(`
                UPDATE users
                SET password_hash = @passwordHash, reset_token = NULL, reset_token_expires = NULL
                WHERE id = @userId
            `);

        res.json({ message: 'Senha redefinida com sucesso.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao redefinir senha.' });
    }
}

// Atualiza a exportação
module.exports = { signup, login, forgotPassword, resetPassword };