const bcrypt = require('bcrypt');
const { sql, poolPromise } = require('../config/db');

// Retorna os dados do usuário logado (sem a senha)
async function getMe(req, res) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.Int, req.userId)
            .query('SELECT id, name, email, created_at FROM users WHERE id = @userId');

        res.json({ user: result.recordset[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar usuário.' });
    }
}

// Atualiza nome e/ou email do usuário logado
async function updateMe(req, res) {
    const { name, email } = req.body;

    if (!name || name.trim().length < 2) {
        return res.status(400).json({ error: 'Nome precisa ter pelo menos 2 caracteres.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ error: 'Email inválido.' });
    }

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('userId', sql.Int, req.userId)
            .input('name', sql.VarChar, name.trim())
            .input('email', sql.VarChar, email)
            .query(`
                UPDATE users
                SET name = @name, email = @email
                OUTPUT INSERTED.id, INSERTED.name, INSERTED.email
                WHERE id = @userId
            `);

        res.json({ message: 'Perfil atualizado com sucesso.', user: result.recordset[0] });

    } catch (err) {
        // Mesmo erro de UNIQUE que já tratamos no signup, agora pro caso de
        // tentar trocar o email para um que já pertence a outro usuário
        if (err.number === 2627) {
            return res.status(409).json({ error: 'Este email já está em uso.' });
        }
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar perfil.' });
    }
}

// Troca a senha do usuário logado (exige a senha atual, por segurança)
async function changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias.' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'A nova senha precisa ter pelo menos 6 caracteres.' });
    }

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('userId', sql.Int, req.userId)
            .query('SELECT password_hash FROM users WHERE id = @userId');

        const user = result.recordset[0];
        const matches = await bcrypt.compare(currentPassword, user.password_hash);

        if (!matches) {
            return res.status(401).json({ error: 'Senha atual incorreta.' });
        }

        const newHash = await bcrypt.hash(newPassword, 10);

        await pool.request()
            .input('userId', sql.Int, req.userId)
            .input('passwordHash', sql.VarChar, newHash)
            .query('UPDATE users SET password_hash = @passwordHash WHERE id = @userId');

        res.json({ message: 'Senha alterada com sucesso.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao alterar senha.' });
    }
}

module.exports = { getMe, updateMe, changePassword };